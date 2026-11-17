# 🌐 Legenda Traduzida (EN → PT)

Userscript para **Tampermonkey** que lê a legenda de qualquer vídeo no navegador, **traduz em tempo real** e mostra a tradução em um overlay sobre o player.

Ideal para acompanhar treinamentos, cursos e palestras em inglês quando o player não oferece tradução de legendas.

## ✨ Funcionalidades

- Traduz automaticamente a legenda atual do vídeo (padrão: inglês → português).
- Funciona com legendas nativas (`<track>`) e com legendas feitas em HTML pelo player.
- Overlay com fundo opaco, posicionável no topo ou no rodapé do vídeo.
- Funciona em **tela cheia**.
- Cache de traduções (frases repetidas não geram nova requisição).
- Tradução com **fallback**: tenta o Google Tradutor e, se falhar, usa o MyMemory.
- Remove legendas duplicadas e tenta novamente automaticamente em caso de falha.

## 📋 Requisitos

- Navegador baseado em Chromium (Chrome, Edge, Brave) ou Firefox.
- Extensão [Tampermonkey](https://www.tampermonkey.net/).
- Vídeo com legendas ativadas (botão **CC** do player).

## 🚀 Instalação

### 1. Instale o Tampermonkey

Instale a extensão pela loja do seu navegador:

- [Chrome / Edge / Brave](https://www.tampermonkey.net/?browser=chrome)
- [Firefox](https://www.tampermonkey.net/?browser=firefox)

> **Chrome/Edge (versões recentes):** é preciso permitir scripts de usuário.
> Abra `chrome://extensions` → **Detalhes** do Tampermonkey → ative **"Permitir scripts de usuário"**
> (em algumas versões, ative antes o **Modo do desenvolvedor** no canto superior direito).

### 2. Instale o script

**Opção A: instalação direta (recomendada)**

Clique no link abaixo. O Tampermonkey abrirá a tela de instalação; basta confirmar em **Instalar**.

```
https://raw.githubusercontent.com/IsaelSantos/Tradutor_video_legendado_Browser/main/legenda-traduzida.user.js
```

**Opção B: instalação manual**

1. Clique no ícone do Tampermonkey → **Criar um novo script**.
2. Apague todo o conteúdo do editor.
3. Cole o conteúdo do arquivo [`legenda-traduzida.user.js`](./legenda-traduzida.user.js).
4. Salve com `Ctrl + S`.

### 3. Use

1. Abra a página com o vídeo.
2. Ative as legendas (botão **CC**) e dê play.
3. A tradução aparece em um overlay sobre o vídeo. Se acabou de instalar, recarregue a página antes.

## ⚙️ Configuração

No início do arquivo do script há algumas constantes que você pode ajustar:

| Constante   | Padrão  | Descrição                                                              |
|-------------|---------|------------------------------------------------------------------------|
| `TARGET`    | `'pt'`  | Idioma de destino (`'es'`, `'fr'`, `'de'`, etc.).                      |
| `POLL_MS`   | `300`   | Intervalo (ms) em que o script verifica se a legenda mudou.            |
| `POSITION`  | `'top'` | `'top'` (topo do vídeo) ou `'bottom'` (rodapé, cobrindo a original).   |
| `OFFSET`    | `'4%'`  | Distância do overlay até a borda da tela.                              |
| `DEBUG`     | `true`  | Exibe logs no Console (F12) para diagnóstico.                          |
| `SELECTORS` | lista   | Seletores CSS usados para encontrar a legenda na página.               |

### Restringir a sites específicos (recomendado)

Por padrão o script roda em todas as páginas (`@match *://*/*`). Para limitar a certos sites, edite o cabeçalho:

```js
// @match        https://exemplo.com/*
// @match        https://*.plataforma-de-cursos.com/*
```

## 🔍 Como descobrir o seletor da legenda

Se o overlay não aparecer, o script provavelmente não está encontrando o elemento da legenda:

1. Com a legenda visível, clique nela com o botão direito → **Inspecionar**.
2. Veja a `class` do elemento que contém o texto (ex.: `class="player-caption-text"`).
3. Adicione no início da lista `SELECTORS`:

   ```js
   '.player-caption-text',
   ```
4. Salve e recarregue a página.

## 🛠️ Solução de problemas

| Problema | O que fazer |
|----------|-------------|
| Nada aparece | Confirme que as legendas estão ativadas e que o script está ligado no Tampermonkey. Abra o Console (F12), filtre por `legenda-pt` e veja os logs. |
| Não há linha `lido:` no Console | O script não achou a legenda. Siga a seção [Como descobrir o seletor](#-como-descobrir-o-seletor-da-legenda). |
| Aparece `lido:` mas a tradução falha | Possível bloqueio ou limite do serviço de tradução. Aguarde alguns instantes; o script tenta de novo sozinho. |
| Legenda duplicada | Atualize para a versão mais recente do script. |
| Overlay cobre algo importante | Mude `POSITION` para `'bottom'` ou ajuste `OFFSET`. |
| Vídeo em `iframe` | O Tampermonkey executa em iframes, mas confira se o `@match` cobre o domínio do player. |

## ⚠️ Limitações

- **Legendas "queimadas" no vídeo** (desenhadas nos pixels da imagem) não podem ser lidas por este script. Seria necessário OCR.
- O script usa o endpoint **gratuito e não oficial** do Google Tradutor, sem garantia de disponibilidade ou de limites. Para uso intensivo ou profissional, considere trocar por uma API oficial (Google Cloud Translation, DeepL, etc.).
- A qualidade da tradução automática pode variar, principalmente com termos técnicos.

## 🔒 Privacidade

O **texto das legendas** é enviado aos serviços de tradução (Google Tradutor e, em caso de falha, MyMemory) para ser traduzido. Nenhum outro dado da página, do vídeo ou do usuário é coletado ou enviado. Não use com conteúdo confidencial.

## 🤝 Contribuindo

Sugestões e pull requests são bem-vindos! Abra uma *issue* descrevendo o problema ou a ideia. Se a legenda de uma plataforma específica não for detectada, informe o site e o seletor encontrado para que possamos incluí-lo na lista padrão.

## 📄 Licença

Distribuído sob a licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes.
