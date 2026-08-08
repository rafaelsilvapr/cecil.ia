# Jardim das Sílabas

Jogo de alfabetização por sílabas criado para a Cecília. A criança percorre um mapa com 60 fases, monta palavras a partir de sílabas e recebe incentivos visuais e sonoros sem mecânicas punitivas.

## Funcionalidades atuais

- mapa dividido em seis seções temáticas;
- exercícios de montagem de palavras com apoio de imagem e áudio em português brasileiro;
- celebrações e momentos de história com personagens da família;
- progresso, sequência de atividades e palavras recentes salvos no navegador;
- interface responsiva para computador, celular e tablet;
- instalável como aplicativo (PWA), com funcionamento offline e atualização por um toque.

## Instalar no tablet da Cecília

1. Abra `https://jardim-das-silabas.vercel.app` no Chrome do tablet.
2. Menu (⋮) → **Instalar aplicativo** / **Adicionar à tela inicial**.
3. Abra pelo ícone novo: o jogo roda em tela cheia, sem barra de navegador.

Antes de entregar o tablet, garanta o áudio offline: **Configurações → Gerenciamento geral →
Texto para fala → Google → Instalar dados de voz → Português (Brasil)**. Sem isso o jogo
fica mudo quando o tablet estiver sem internet.

Para ela não sair do jogo sem querer, use **Fixar tela** (Configurações → Segurança →
Configurações avançadas → Fixar tela).

### Como as atualizações chegam até ela

Um `push` na branch principal publica na Vercel e o service worker faz o resto:

- se ela **abrir o jogo** e houver versão nova, o app se atualiza sozinho antes do mapa aparecer;
- se ela **já estiver com o jogo aberto**, o mapa mostra o botão roxo **"Tem novidade! Toque
  aqui"** — um toque e pronto. O botão nunca aparece no meio de uma fase.

O progresso fica no `localStorage` e sobrevive à atualização.

## Desenvolvimento

Requisitos: Node.js e npm.

```bash
npm install
npm run dev
```

O servidor local usa HTTP e fica disponível na rede para testes no iPad. Para gerar novamente
as imagens WebP otimizadas após alterar um PNG de trabalho em `public/characters/`:

```bash
npm run optimize:images
```

Os ícones do aplicativo instalado saem da mesma arte, em `public/icons/`:

```bash
npm run generate:icons
```

## Verificação

```bash
npm run lint
npm run build
```

O projeto usa React, TypeScript, Vite e Tailwind CSS. O currículo está em `src/data/curriculum.ts`, e o fluxo principal do jogo está em `src/App.tsx`.

## Deploy

O destino único é a Vercel. O arquivo `vercel.json` mantém o fallback de SPA e o Vite usa
`base: '/'`, portanto os assets funcionam a partir da raiz do domínio.

Produção é publicada automaticamente quando há push na branch principal do repositório conectado.
Para validar localmente exatamente o artefato enviado:

```bash
npm run build
npm run preview
```
