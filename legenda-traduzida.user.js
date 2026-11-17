// ==UserScript==
// @name         Legenda Traduzida EN→PT
// @namespace    IsaelSantos
// @version      0.3
// @description  Lê a legenda do vídeo, traduz e mostra um overlay em português
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @connect      translate.googleapis.com
// @connect      api.mymemory.translated.net
// ==/UserScript==

(() => {
  'use strict';

  const TARGET = 'pt';          // idioma de destino
  const POLL_MS = 300;          // frequência de leitura da legenda
  const POSITION = 'top';       // 'top' = topo do vídeo | 'bottom' = rodapé
  const OFFSET = '4%';          // distância da borda
  const DEBUG = true;           // mostra no Console (F12) o que foi lido/traduzido

  // Ajuste aqui se souber o seletor exato da legenda (botão direito → Inspecionar)
  const SELECTORS = [
    '.ytp-caption-segment',
    '.vjs-text-track-display',
    '.captions-text',
    '[class*="caption" i]',
    '[class*="subtitle" i]',
    '[class*="transcript" i][class*="current" i]',
  ];

  const log = (...a) => DEBUG && console.log('[legenda-pt]', ...a);
  const cache = new Map();
  let last = '';
  let retryAt = 0;

  const box = document.createElement('div');
  box.id = 'legenda-pt-overlay';
  Object.assign(box.style, {
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    maxWidth: '80vw',
    padding: '8px 14px',
    background: '#000',
    color: '#ffe066',
    font: '600 20px/1.35 system-ui, sans-serif',
    textAlign: 'center',
    borderRadius: '8px',
    zIndex: 2147483647,
    pointerEvents: 'none',
    display: 'none',
  });
  box.style[POSITION === 'top' ? 'top' : 'bottom'] = OFFSET;
  document.documentElement.appendChild(box);

  const norm = (t) => t.replace(/\s+/g, ' ').trim();

  // "Frase. Frase." / "Frase Frase" -> "Frase"
  function collapseRepeat(t) {
    const m = t.match(/^(.+?)\s+\1$/s);
    return m ? m[1] : t;
  }

  function get(url) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url,
        timeout: 8000,
        onload: (r) => (r.status >= 200 && r.status < 300 ? resolve(r.responseText) : reject(new Error('HTTP ' + r.status))),
        onerror: () => reject(new Error('erro de rede')),
        ontimeout: () => reject(new Error('timeout')),
      });
    });
  }

  async function translate(text) {
    if (cache.has(text)) return cache.get(text);
    const q = encodeURIComponent(text);
    // 1) Google (endpoint gratuito não oficial)
    try {
      const j = JSON.parse(await get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${TARGET}&dt=t&q=${q}`
      ));
      const out = j[0].map((s) => s[0]).join('');
      if (out) { cache.set(text, out); return out; }
    } catch (e) { log('Google falhou:', e.message); }
    // 2) MyMemory (fallback)
    try {
      const j = JSON.parse(await get(
        `https://api.mymemory.translated.net/get?q=${q}&langpair=en|${TARGET}`
      ));
      const out = j.responseData && j.responseData.translatedText;
      if (out) { cache.set(text, out); return out; }
    } catch (e) { log('MyMemory falhou:', e.message); }
    return '';
  }

  function readCaption() {
    // 1) Trilhas de legenda nativas (<track>)
    for (const v of document.querySelectorAll('video')) {
      for (const tr of v.textTracks) {
        if (tr.kind !== 'subtitles' && tr.kind !== 'captions') continue;
        if (tr.mode === 'disabled') tr.mode = 'hidden';
        const cues = tr.activeCues ? [...tr.activeCues] : [];
        const txt = [...new Set(cues.map((c) => norm(c.text)))].join(' ');
        if (txt) return txt;
      }
    }
    // 2) Elementos HTML com a legenda
    for (const sel of SELECTORS) {
      let els;
      try { els = document.querySelectorAll(sel); } catch { continue; }
      const parts = [...els]
        .filter((e) => e !== box && !box.contains(e) && e.offsetParent !== null)
        .filter((e) => e.children.length < 5)
        .map((e) => norm(e.innerText || ''))
        .filter(Boolean);
      // remove duplicatas e textos já contidos em outro elemento
      const uniq = [...new Set(parts)].filter(
        (t, i, arr) => !arr.some((o, j) => j !== i && o.length > t.length && o.includes(t))
      );
      // prefere o menor texto (mais provável de ser só a legenda)
      uniq.sort((a, b) => a.length - b.length);
      const txt = uniq[0] || '';
      if (txt && txt.length < 400) { log('seletor:', sel); return txt; }
    }
    return '';
  }

  async function tick() {
    const host = document.fullscreenElement || document.documentElement;
    if (box.parentNode !== host) host.appendChild(box);

    const text = collapseRepeat(norm(readCaption()));
    if (!text) {
      last = '';
      box.style.display = 'none';
      return;
    }
    if (text === last || Date.now() < retryAt) return;
    last = text;
    log('lido:', text);

    const t = await translate(text);
    if (text !== last) return;           // a legenda já mudou
    if (t) {
      box.textContent = t;
      box.style.display = 'block';
    } else {
      // falhou: mostra aviso e tenta de novo em 2s
      box.textContent = '⚠ falha na tradução — tentando de novo…';
      box.style.display = 'block';
      last = '';
      retryAt = Date.now() + 2000;
    }
  }

  setInterval(tick, POLL_MS);
})();
