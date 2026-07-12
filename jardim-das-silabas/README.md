# Jardim das Sílabas

Jogo de alfabetização por sílabas criado para a Cecília. A criança percorre um mapa com 60 fases, monta palavras a partir de sílabas e recebe incentivos visuais e sonoros sem mecânicas punitivas.

## Funcionalidades atuais

- mapa dividido em seis seções temáticas;
- exercícios de montagem de palavras com apoio de imagem e áudio em português brasileiro;
- celebrações e momentos de história com personagens da família;
- progresso, sequência de atividades e palavras recentes salvos no navegador;
- interface responsiva para computador, celular e tablet.

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
