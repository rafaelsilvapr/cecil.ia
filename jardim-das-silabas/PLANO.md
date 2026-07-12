# PLANO DE REFORMA — Jardim das Sílabas

> Jogo de alfabetização por sílabas para a Cecília. Referência visual/dinâmica: Duolingo
> (sem mecânicas punitivas). Personagens: Cecília, papai e mamãe — artes em `Referencias visuais/`
> e `public/characters/`.
>
> **Divisão de trabalho:** fases marcadas **[CODEX]** são execução mecânica com critérios de
> aceite fechados — podem ser entregues ao Codex como prompt único, sem decisões em aberto.
> Fases **[CLAUDE]** envolvem estratégia, pedagogia e direção de arte — Claude produz as
> especificações que alimentam as fases Codex seguintes.
> Baseado na auditoria de 2026-07-12 (código + jogo testado ponta a ponta no navegador).
>
> **Dois trilhos** (atualização 2026-07-12, com Fase 1 já em execução — nada abaixo altera
> o escopo das Fases 1–7 já numeradas; o Trilho B foi adicionado como Fases 8–11):
>
> - **Trilho A — O Jogo (Fases 1–7):** reforma visual, técnica e pedagógica.
> - **Trilho B — A Ponte (Fases 8–11):** telemetria de aprendizagem, painel para os pais,
>   motor adaptativo e presença remota do papai E da mamãe dentro do jogo. Contexto: o pai
>   vive a 1.500 km da filha; este app é o principal canal dele para acompanhar e participar
>   da alfabetização. A mãe está presente no dia a dia e é participante de primeira classe
>   em TODOS os recursos do Trilho B (painel, áudios, missões) — o jogo nunca deve parecer
>   "do papai": é dos dois, sempre.
>
> **Ordem de execução recomendada:** 1 → 8 → 2 → 9 → 3 → 4 → 10 → 5 → 6 → 11 → 7.
> (F8 é spec e não bloqueia o Codex; F9 pode rodar em paralelo com F3/F4.)

---

## Fase 0 — Decisões estratégicas **[CLAUDE + RAFAEL]** ✋ bloqueia Fase 2

Decisões registradas em 2026-07-12:

1. **Deploy: Vercel.** Será o único destino. Na Fase 2, usar `base: '/'`, manter
   `vercel.json`, remover a configuração de GitHub Pages e retirar `dist/` do versionamento.
   Produção será atualizada automaticamente por push na branch principal; previews ficam
   restritos à revisão técnica.
2. **Voz: modelo híbrido.** Manter TTS (`speechSynthesis` pt-BR) para sílabas e palavras,
   inclusive como fallback offline. Não produzir agora o pacote de ~200 gravações, porque o
   custo operacional é alto e a clareza ainda precisa ser testada com a Cecília. Vozes reais
   de papai e mamãe entram primeiro nas celebrações da Fase 11, sempre com presença equilibrada.
   Gravações pedagógicas adicionais só serão feitas depois do teste da Fase 7 demonstrar ganho.
3. **Mapa: escopo completo de 60 fases em seis seções.** A Fase 3 especificará todas as
   seções, com identidade visual própria, personagens e cenários, priorizando iPad e celular.
   Nenhuma ilustração nova será gerada antes da spec; o fluxo mapa → jogo → celebração será
   preservado.
4. **Backend: Supabase dedicado.** Usar projeto `jardim-silabas` no plano gratuito, na região
   de São Paulo quando disponível (senão, a região sul-americana mais próxima). Projeto privado,
   RLS em todas as tabelas, sem analytics de terceiros e sem nome, e-mail ou outro identificador
   direto da criança; usar apenas um ID aleatório da instalação. Projeto criado na organização
   de Rafael em 2026-07-12, região `sa-east-1` (São Paulo), plano gratuito, referência pública
   `jetkjnjkgnxrvztkhvhu` e URL `https://jetkjnjkgnxrvztkhvhu.supabase.co`. Data API ativa,
   exposição automática de tabelas desativada e RLS automático ativado. Senhas e chaves não
   são registradas neste repositório.
5. **Notificações: fora da primeira versão.** Não implementar push na Fase 11 inicial. Papai e
   mamãe acompanham conquistas pelo painel; notificações só serão reconsideradas após teste real,
   evitando permissões e infraestrutura antes de haver evidência de utilidade.

**Status:** ✅ concluída em 2026-07-12. A Fase 2 está desbloqueada.

---

## Fase 1 — Fundamentos: salvar progresso e corrigir bugs **[CODEX]**

Nenhuma decisão em aberto; tudo em `src/App.tsx` e `src/data/curriculum.ts`.

1. **Persistência em `localStorage`** (chave `jardim-silabas-v1`): salvar `currentMapLevel`,
   `streak` e `recentlyPlayedWords` a cada mudança; hidratar no boot com fallback seguro
   (dados corrompidos → estado inicial, sem crash).
2. **Bug de progressão:** em `closeCelebration`, só incrementar `currentMapLevel` se a fase
   jogada era a fase ativa (guardar o índice jogado em estado, ex.: `playedLevelIndex`).
   Rejogar fase antiga não desbloqueia nada (mas mantém a celebração normal).
3. **Bug visual:** o avatar flutuante do nó ativo sobrepõe o banner da seção quando o nó ativo
   é o primeiro da seção (visto em teste). Corrigir com z-index/margem — o banner nunca pode
   ficar coberto.
4. **Correções de conteúdo** em `curriculum.ts`:
   - `CINTO`: emoji é a string literal `'belt'` → trocar por emoji real ou remover a palavra;
   - Acentos: `ARVORE` → `ÁRVORE`, `INDIO` → `ÍNDIO`, `SANDUICHE` → `SANDUÍCHE`
     (sílabas correspondentes também: `AR/ÁR`, `IN/ÍN`, `I/Í`);
   - `IGLU` e `CHAMINÉ` usam 🏠 (mesmo emoji de CASA): trocar IGLU por ⛄/🧊 ou remover.
5. **Higiene:** `index.html` → `lang="pt-BR"`; título já está ok; trocar favicon do Vite por
   um emoji-favicon 🌱 (SVG inline no `index.html`).
6. **Remover peso morto:** desinstalar `chart.js` e `react-chartjs-2`; apagar
   `src/components/charts/DuolingoLikeBar.tsx` (não é importado por ninguém); apagar
   `src/App.css` se não utilizado; reescrever `README.md` descrevendo o projeto real
   (o atual é o template do Vite).

**Aceite:** recarregar a página mantém progresso e streak; rejogar fase 1 não desbloqueia
fase nova; `npm run build` passa; nenhuma palavra com grafia errada; banner de seção legível
com nó ativo no topo.

**Status:** ✅ concluída em 2026-07-12

---

## Fase 2 — Saúde técnica: performance, áudio e deploy **[CODEX]** (após Fase 0.1)

1. **Componentes fora do `App`:** extrair `MapScreen`, `GameScreen`, `StoryScreen` e
   `CelebrationScreen` de dentro da função `App` para arquivos próprios em `src/screens/`,
   recebendo props/callbacks. Motivo: definidos inline, o React remonta a tela inteira a cada
   clique e nenhuma transição CSS anima. Comportamento deve ficar idêntico, mas com animações
   (barra de progresso, escala dos slots) funcionando de verdade.
2. **`AudioContext` único:** criar um contexto module-level reutilizado por `playSound`
   (com `resume()` no primeiro gesto do usuário). Hoje cada som cria um contexto novo que
   nunca fecha — no iPad o som para de funcionar depois de dezenas de cliques.
3. **Imagens:** converter os 5 PNGs de `public/characters/` (10 MB no total; `pai-rede.png`
   tem 5,3 MB) para WebP com largura máx. 800px, qualidade 82 (usar `sharp` como devDependency
   num script `scripts/optimize-images.mjs`). Atualizar referências em `App.tsx`. Manter os
   PNGs originais em `Referencias visuais/` (não tocar nessa pasta).
4. **Deploy conforme Fase 0.1:** ajustar `base`, remover o arquivo do alvo descartado
   (`vercel.json` OU a config de Pages), remover `dist/` do versionamento (adicionar ao
   `.gitignore`), documentar o comando de deploy no README.
5. **Acessibilidade mínima:** `aria-label` nos botões do mapa (ex.: "Fase 3 — concluída"),
   nos botões de sílaba e no emoji "Ouvir".

**Aceite:** Lighthouse mobile ≥ 90 em Performance; transições visivelmente animadas;
sons continuam funcionando após 100+ cliques; build publicado abre sem 404 de assets.

**Status:** ✅ concluída em 2026-07-12 — lint e build passam, Lighthouse mobile 99, WebP e
áudio validados. Produção em `https://jardim-das-silabas.vercel.app`, com o projeto Vercel
ligado ao GitHub, raiz `jardim-das-silabas` e branch de produção `main`.

---

## Fase 3 — Direção de arte do mapa e das telas **[CLAUDE]**

O problema central da auditoria: as ilustrações da família quase não aparecem (avatar de 48px,
miniatura de 64px, celebração e 5 telas de história). O mapa é 95% círculos cinza em fundo
pastel vazio. Entregas desta fase:

1. **Spec visual do mapa por seção** (layout, cenário de fundo, decorações grandes, posição
   dos personagens ao longo do caminho) — no espírito Duolingo: cada seção é um "mundo" com
   identidade, não só uma cor.
2. **Lista de artes novas a gerar** (prompts prontos para Gemini/NanoBanana no mesmo estilo
   das existentes): Cecília em poses variadas (andando, pulando, comemorando, pensando),
   papai reagindo (positivo/encorajando), elementos de cenário (canteiros, regador, plantinha
   em 4 estágios de crescimento), fundos por seção. Todas com fundo transparente quando forem
   sprites.
3. **Spec da mecânica visual do regador/planta:** a barra de progresso da fase vira plantinha
   que cresce (4 estágios) — recompensa visual central do jogo.
4. **Spec de feedback de erro gentil:** hoje o erro é um som áspero (sawtooth) e a sílaba some.
   Definir animação suave (balanço + recolocação) e som neutro. Nada punitivo.

**Entrega:** seção "Spec Fase 4" adicionada a este arquivo + artes geradas em
`public/characters/` (ou `public/scenes/`).

**Status:** ⬜ pendente

---

## Fase 4 — Implementação do novo visual **[CODEX]** (após Fase 3)

Implementar exatamente a spec da Fase 3: fundos de seção, sprites no mapa, avatar da Cecília
sem corte estranho, planta que cresce na tela de jogo, animação de erro gentil, tela de jogo
sem o vazio central atual (reequilibrar layout vertical). Sem liberdade criativa — a spec
manda; dúvidas voltam para Claude.

**Aceite:** screenshots lado a lado com a spec; nenhuma regressão no fluxo (mapa → fase →
celebração); performance mantida (imagens novas também otimizadas).

**Status:** ⬜ pendente — bloqueada pela Fase 3

---

## Fase 5 — Currículo e dificuldade **[CLAUDE]**

1. **Redesenhar a seleção de palavras.** Hoje `launchLevel` injeta de propósito 3–6 palavras
   complexas em TODA fase — na fase 1 ("Sílabas simples") caíram BLUSA, REPOLHO e PLACA no
   teste. Definir progressão real: quais famílias silábicas entram em cada uma das 60 fases,
   taxa de revisão espaçada das fases anteriores, e quando distratores aparecem.
2. **Revisão palavra a palavra do `curriculum.ts`:** emojis ambíguos (🧶 TAPETE/LÃ, 🦅
   URUBU/ÁGUIA, 👔 CAMISA/GRAVATA, ⚽ BOLA/FUTEBOL etc.), adequação ao vocabulário da Cecília
   (Rafael valida: palavras do universo dela primeiro).
3. **Spec de dificuldade adaptativa simples e previsível** (sem aleatoriedade que assuste:
   consistência importa para criança autista): errou 2× a mesma palavra → reapresentar mais
   tarde com menos distratores; nunca "rebaixar" visivelmente. Quando a telemetria (Fases 8–9)
   estiver no ar, esta spec evolui para o modelo de domínio por sílaba com alvo de 75–80% de
   acerto — desafio máximo sustentável, nunca conforto, nunca frustração (ver Fase 8).

**Entrega:** `curriculum.ts` revisado + seção "Spec Fase 6" neste arquivo.

**Status:** ⬜ pendente

---

## Fase 6 — Motor de progressão + PWA **[CODEX]** (após Fase 5)

1. Implementar a seleção de palavras da spec Fase 5 (substituir `launchLevel`/`isComplexWord`).
2. **PWA:** `vite-plugin-pwa` com manifest (nome, ícones a partir da arte da Cecília, tema
   verde `#58CC02`), cache offline de assets e fontes — o jogo deve abrir no iPad sem internet
   depois de instalado na tela inicial.
3. Se a Fase 0.2 escolheu áudio gravado: sistema de arquivos de áudio por sílaba/palavra com
   fallback para TTS quando faltar arquivo.

**Aceite:** jogo instala na tela inicial do iPad e roda offline; fase 1 contém apenas
sílabas simples; palavras erradas reaparecem conforme a spec.

**Status:** ⬜ pendente — bloqueada pela Fase 5

---

## Fase 7 — Teste com a Cecília e ajuste fino **[CLAUDE + RAFAEL]**

Sessões curtas observadas: o que prende, o que frustra, se o áudio é claro, se os toques
acertam os alvos. Voltar achados como mini-fases (Codex para execução, Claude para redesenho).
Só depois disso considerar o jogo "pronto para cumprir o papel". Com o Trilho B no ar, o
próprio painel (Fase 10) vira instrumento de observação desta fase.

**Status:** ⬜ pendente

---

# TRILHO B — A PONTE (pais ↔ Cecília, a 1.500 km)

---

## Fase 8 — Spec de dados, indicadores e adaptação **[CLAUDE]**

### Spec Fase 9/10 — contrato fechado

Esta spec controla a implementação das Fases 9 e 10 e a adaptação da Fase 6. A finalidade é
responder a três perguntas: **o que Cecília está consolidando, onde precisa de apoio e se o jogo
continua sustentável emocionalmente**. Não há comparação com outras crianças nem inferência
clínica. Confusões são sinais pedagógicos para observação, não diagnóstico.

Premissas de segurança verificadas na documentação oficial do Supabase: tabelas expostas usam
[RLS](https://supabase.com/docs/guides/database/postgres/row-level-security); o iPad usa
[login anônimo](https://supabase.com/docs/guides/auth/auth-anonymous), que recebe `auth.uid()`
sem coletar PII; áudios ficam em
[bucket privado](https://supabase.com/docs/guides/storage/buckets/fundamentals). A antiga ideia
de “senha simples de família” está revogada: responsáveis entram por magic link do Supabase Auth.

#### 8.1 Identidade, privacidade e vínculo do iPad

- `families`: unidade de isolamento. Não guarda nome, endereço ou dado da criança.
- `family_members`: os dois responsáveis, com contas individuais e exatamente as mesmas
  permissões. E-mail existe apenas em `auth.users`, nunca nas tabelas pedagógicas.
- `learners`: perfil pseudônimo da criança. O único vínculo do iPad é o `auth.uid()` anônimo.
- O iPad é pareado uma vez por código aleatório de uso único, válido por 30 minutos. O banco
  armazena somente SHA-256 do código. Limpar os dados do navegador exige novo pareamento.
- O cliente recebe somente a chave pública/publishable. `service_role`, senha do banco e chaves
  secretas nunca entram no bundle, no Git ou no `localStorage`.
- Eventos brutos ficam por 12 meses; `mastery` agregado permanece até exclusão solicitada pelos
  responsáveis. Nenhum analytics, cookie publicitário, IP, GPS, nome ou texto livre da criança.

#### 8.2 Contrato de eventos

Todos os IDs são UUID v4 gerados no cliente. Isso torna reenvios idempotentes. `occurred_at` é o
horário do aparelho; `received_at` é preenchido pelo servidor. Tempos são monotônicos durante a
atividade e limitados a 120 s para impedir que uma aba em segundo plano distorça fluência.

**Tentativa de sílaba (`attempts`) — evento central:**

```ts
type SyllableAttempt = {
  id: string;                 // UUID, chave de idempotência
  learner_id: string;
  session_id: string;
  presentation_id: string;    // uma apresentação da palavra
  word: string;
  expected_syllable: string;
  clicked_syllable: string;
  syllable_position: number;  // zero-based
  attempt_number: number;     // 1 = primeira tentativa naquela posição
  response_time_ms: number;   // opções disponíveis → toque
  listens_before_attempt: number;
  level_index: number;        // 0–59
  section_index: number;      // 0–5
  page_visible: boolean;
  timing_eligible: boolean;    // false se áudio automático ainda tocava
  occurred_at: string;        // ISO-8601 UTC
};
```

Regras fixas:

- Somente `attempt_number = 1` atualiza o placar principal de domínio. Toques seguintes ficam
  registrados para diagnóstico, sem transformar uma mesma oportunidade em várias derrotas.
- O cronômetro começa depois que opções estão visíveis **e** a fala automática termina. Se a
  criança tocar antes disso, o toque vale pedagogicamente, mas `timing_eligible = false`.
  `response_time_ms` só entra em fluência quando a primeira tentativa é correta,
  `page_visible = timing_eligible = true` e o valor está entre 150 ms e 60 s.
- `presentation_id + syllable_position + attempt_number` é único.
- `audio_events` registra cada reprodução automática ou solicitada; o número agregado também
  é copiado para `listens_before_attempt` para análise sem join.
- `phase_events`: `started`, `completed`, `replayed` e `abandoned`. Reabrir o app fecha sessão
  interrompida com `ended_reason = 'crash_recovered'`.

#### 8.3 Fila offline e sincronização

IndexedDB terá três stores versionadas: `telemetry_queue`, `telemetry_meta` e `telemetry_dead_letter`.
Cada item da fila contém `{id, table, payload, state, attempts, next_retry_at, created_at}`.

1. Enfileirar antes de qualquer chamada de rede; limite operacional do enqueue: 10 ms.
2. Sincronizar em lotes de até 100, em segundo plano, ao abrir o app, recuperar conexão e a cada
   30 s enquanto online. Nunca aguardar sync para atualizar a interface.
3. Sincronizar na ordem `sessions` → `phase_events/attempts/audio_events` → RPCs de fechamento
   e missão. Usar `upsert(..., {onConflict: 'id', ignoreDuplicates: true})`. Só remover da fila
   após ACK. Conflito na chave lógica com outro `id` vai para dead letter: é quebra de invariante.
4. Retry: 5 s, 30 s, 2 min, 10 min, 1 h e depois a cada 6 h, com jitter de ±20%.
5. Erro 4xx de validação após três tentativas vai para dead letter; erro de rede/5xx permanece.
   Nada disso aparece para Cecília. O painel dos pais pode mostrar apenas “dados aguardando envio”.
6. Máximo local: 50 mil eventos. Acima disso, preservar primeiro `sessions`, `phase_events` e
   primeiras tentativas; descartar somente reproduções automáticas antigas, registrando contagem.

#### 8.4 Migration SQL da Fase 9

```sql
create extension if not exists pgcrypto with schema extensions;

create table public.families (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  caregiver_label text not null check (caregiver_label in ('pai', 'mae')),
  created_at timestamptz not null default now(),
  primary key (family_id, user_id),
  unique (family_id, caregiver_label)
);

create table public.learners (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  device_user_id uuid unique references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  paired_at timestamptz,
  unique (id, family_id)
);

create table public.syllable_catalog (
  syllable text primary key check (char_length(syllable) between 1 and 16),
  family_key text not null check (char_length(family_key) between 1 and 24),
  introduced_level smallint not null check (introduced_level between 0 and 59),
  pedagogically_reviewed boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.pairing_codes (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learners(id) on delete cascade,
  code_hash text not null unique,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);

create table public.sessions (
  id uuid primary key,
  learner_id uuid not null references public.learners(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_ms integer check (duration_ms between 0 and 7200000),
  start_level smallint not null check (start_level between 0 and 59),
  end_level smallint check (end_level between 0 and 59),
  ended_reason text check (ended_reason in ('normal', 'background', 'crash_recovered')),
  app_version text not null,
  received_at timestamptz not null default now(),
  check (ended_at is null or ended_at >= started_at),
  unique (id, learner_id)
);

create table public.phase_events (
  id uuid primary key,
  learner_id uuid not null references public.learners(id) on delete cascade,
  session_id uuid not null,
  event_type text not null check (event_type in ('started', 'completed', 'replayed', 'abandoned')),
  level_index smallint not null check (level_index between 0 and 59),
  section_index smallint not null check (section_index between 0 and 5),
  duration_ms integer check (duration_ms between 0 and 7200000),
  exercise_count smallint check (exercise_count between 0 and 30),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  foreign key (session_id, learner_id)
    references public.sessions(id, learner_id) on delete cascade
);

create table public.attempts (
  id uuid primary key,
  learner_id uuid not null references public.learners(id) on delete cascade,
  session_id uuid not null,
  presentation_id uuid not null,
  word text not null check (char_length(word) between 1 and 64),
  expected_syllable text not null check (char_length(expected_syllable) between 1 and 16),
  clicked_syllable text not null check (char_length(clicked_syllable) between 1 and 16),
  syllable_position smallint not null check (syllable_position between 0 and 15),
  attempt_number smallint not null check (attempt_number between 1 and 20),
  response_time_ms integer not null check (response_time_ms between 0 and 120000),
  listens_before_attempt smallint not null default 0 check (listens_before_attempt between 0 and 20),
  level_index smallint not null check (level_index between 0 and 59),
  section_index smallint not null check (section_index between 0 and 5),
  page_visible boolean not null default true,
  timing_eligible boolean not null default true,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  is_correct boolean generated always as (expected_syllable = clicked_syllable) stored,
  unique (presentation_id, syllable_position, attempt_number),
  foreign key (session_id, learner_id)
    references public.sessions(id, learner_id) on delete cascade
);

create table public.audio_events (
  id uuid primary key,
  learner_id uuid not null references public.learners(id) on delete cascade,
  session_id uuid not null,
  presentation_id uuid,
  target_type text not null check (target_type in ('word', 'syllable', 'celebration')),
  target_text text not null check (char_length(target_text) between 1 and 100),
  trigger_type text not null check (trigger_type in ('automatic', 'user')),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  foreign key (session_id, learner_id)
    references public.sessions(id, learner_id) on delete cascade
);

create table public.mastery (
  learner_id uuid not null references public.learners(id) on delete cascade,
  syllable text not null check (char_length(syllable) between 1 and 16),
  opportunities integer not null default 0 check (opportunities >= 0),
  first_try_successes integer not null default 0 check (first_try_successes >= 0),
  beta_alpha numeric not null default 3 check (beta_alpha > 0),
  beta_beta numeric not null default 1 check (beta_beta > 0),
  last_seen_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (learner_id, syllable),
  check (first_try_successes <= opportunities)
);

create table public.missions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  learner_id uuid not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  status text not null default 'active' check (status in ('draft', 'active', 'completed', 'archived')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (learner_id, family_id)
    references public.learners(id, family_id) on delete cascade
);

create table public.mission_words (
  mission_id uuid not null references public.missions(id) on delete cascade,
  position smallint not null check (position between 0 and 19),
  word text not null check (char_length(word) between 1 and 64),
  primary key (mission_id, position),
  unique (mission_id, word)
);

create table public.parent_audio (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  caregiver_label text not null check (caregiver_label in ('pai', 'mae')),
  storage_path text not null unique,
  transcript text not null check (char_length(transcript) between 1 and 160),
  duration_ms integer not null check (duration_ms between 250 and 30000),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now()
);

create index attempts_learner_time_idx on public.attempts (learner_id, occurred_at desc);
create index attempts_expected_idx on public.attempts (learner_id, expected_syllable, occurred_at desc);
create index sessions_learner_time_idx on public.sessions (learner_id, started_at desc);
create index phase_events_learner_idx on public.phase_events (learner_id, occurred_at desc);
create index family_members_user_idx on public.family_members (user_id, family_id);
create index learners_device_idx on public.learners (device_user_id);

create or replace function public.is_guardian(p_family_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.family_members fm
    where fm.family_id = p_family_id and fm.user_id = (select auth.uid())
  );
$$;

create or replace function public.is_current_learner(p_learner_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.learners l
    where l.id = p_learner_id and l.device_user_id = (select auth.uid())
  );
$$;

create or replace function public.can_access_learner(p_learner_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.learners l
    where l.id = p_learner_id
      and (l.device_user_id = (select auth.uid()) or public.is_guardian(l.family_id))
  );
$$;

create or replace function public.can_access_family(p_family_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_guardian(p_family_id) or exists (
    select 1 from public.learners l
    where l.family_id = p_family_id and l.device_user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_guardian(uuid) from public;
revoke all on function public.is_current_learner(uuid) from public;
revoke all on function public.can_access_learner(uuid) from public;
revoke all on function public.can_access_family(uuid) from public;
grant execute on function public.is_guardian(uuid), public.is_current_learner(uuid),
  public.can_access_learner(uuid), public.can_access_family(uuid) to authenticated;

create or replace function public.create_pairing_code(p_learner_id uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_code text := encode(extensions.gen_random_bytes(18), 'hex');
  v_family_id uuid;
begin
  select family_id into v_family_id from public.learners where id = p_learner_id;
  if v_family_id is null or not public.is_guardian(v_family_id) then
    raise exception 'not_authorized';
  end if;
  if coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) then
    raise exception 'permanent_guardian_required';
  end if;
  delete from public.pairing_codes
    where learner_id = p_learner_id and used_at is null;
  insert into public.pairing_codes (
    learner_id, code_hash, created_by, expires_at
  ) values (
    p_learner_id,
    encode(extensions.digest(v_code, 'sha256'), 'hex'),
    (select auth.uid()),
    now() + interval '30 minutes'
  );
  return v_code;
end;
$$;

create or replace function public.claim_learner(p_code text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_code_id uuid;
  v_learner_id uuid;
begin
  if (select auth.uid()) is null
     or not coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) then
    raise exception 'anonymous_user_required';
  end if;
  if exists (select 1 from public.learners where device_user_id = (select auth.uid())) then
    raise exception 'device_already_paired';
  end if;
  select id, learner_id into v_code_id, v_learner_id
  from public.pairing_codes
  where code_hash = encode(extensions.digest(p_code, 'sha256'), 'hex')
    and used_at is null and expires_at > now()
  for update;
  if v_code_id is null then raise exception 'invalid_or_expired_code'; end if;
  update public.learners set device_user_id = (select auth.uid()), paired_at = now()
    where id = v_learner_id and device_user_id is null;
  if not found then raise exception 'learner_already_paired'; end if;
  update public.pairing_codes set used_at = now() where id = v_code_id;
  return v_learner_id;
end;
$$;

create or replace function public.close_session(
  p_session_id uuid, p_ended_at timestamptz, p_duration_ms integer,
  p_end_level smallint, p_reason text
) returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_reason not in ('normal', 'background', 'crash_recovered')
     or p_duration_ms not between 0 and 7200000
     or p_end_level not between 0 and 59 then
    raise exception 'invalid_session_close';
  end if;
  update public.sessions set ended_at = p_ended_at, duration_ms = p_duration_ms,
    end_level = p_end_level, ended_reason = p_reason
  where id = p_session_id and public.is_current_learner(learner_id)
    and p_ended_at >= started_at;
  if not found then raise exception 'session_not_found'; end if;
end;
$$;

create or replace function public.complete_mission(p_mission_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.missions m set status = 'completed', completed_at = now()
  where m.id = p_mission_id and m.status = 'active'
    and public.is_current_learner(m.learner_id);
  if not found then raise exception 'mission_not_found'; end if;
end;
$$;

create or replace function public.delete_learner_data(p_learner_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_family_id uuid;
begin
  select family_id into v_family_id from public.learners where id = p_learner_id;
  if v_family_id is null or not public.is_guardian(v_family_id) then
    raise exception 'not_authorized';
  end if;
  delete from public.learners where id = p_learner_id;
end;
$$;

create or replace function public.purge_expired_telemetry()
returns bigint language plpgsql security definer set search_path = '' as $$
declare v_deleted bigint;
begin
  delete from public.sessions
  where coalesce(ended_at, started_at) < now() - interval '12 months';
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.create_pairing_code(uuid), public.claim_learner(text),
  public.close_session(uuid, timestamptz, integer, smallint, text),
  public.complete_mission(uuid), public.delete_learner_data(uuid),
  public.purge_expired_telemetry() from public;
grant execute on function public.create_pairing_code(uuid), public.claim_learner(text),
  public.close_session(uuid, timestamptz, integer, smallint, text),
  public.complete_mission(uuid), public.delete_learner_data(uuid) to authenticated;
grant execute on function public.purge_expired_telemetry() to service_role;

create or replace function public.update_mastery_from_attempt()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.attempt_number <> 1 then return new; end if;
  insert into public.mastery (
    learner_id, syllable, opportunities, first_try_successes,
    beta_alpha, beta_beta, last_seen_at, updated_at
  ) values (
    new.learner_id, new.expected_syllable, 1, case when new.is_correct then 1 else 0 end,
    3 + case when new.is_correct then 1 else 0 end,
    1 + case when new.is_correct then 0 else 1 end,
    new.occurred_at, now()
  )
  on conflict (learner_id, syllable) do update set
    opportunities = mastery.opportunities + 1,
    first_try_successes = mastery.first_try_successes + case when new.is_correct then 1 else 0 end,
    beta_alpha = mastery.beta_alpha + case when new.is_correct then 1 else 0 end,
    beta_beta = mastery.beta_beta + case when new.is_correct then 0 else 1 end,
    last_seen_at = greatest(mastery.last_seen_at, new.occurred_at),
    updated_at = now();
  return new;
end;
$$;

create trigger attempts_update_mastery
after insert on public.attempts for each row execute function public.update_mastery_from_attempt();

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.learners enable row level security;
alter table public.syllable_catalog enable row level security;
alter table public.pairing_codes enable row level security;
alter table public.sessions enable row level security;
alter table public.phase_events enable row level security;
alter table public.attempts enable row level security;
alter table public.audio_events enable row level security;
alter table public.mastery enable row level security;
alter table public.missions enable row level security;
alter table public.mission_words enable row level security;
alter table public.parent_audio enable row level security;

create policy families_select on public.families for select to authenticated
  using (public.can_access_family(id));
create policy members_select on public.family_members for select to authenticated
  using (public.is_guardian(family_id));
create policy learners_select on public.learners for select to authenticated
  using (public.can_access_learner(id));
create policy syllable_catalog_select on public.syllable_catalog for select to authenticated
  using (true);

create policy sessions_select on public.sessions for select to authenticated
  using (public.can_access_learner(learner_id));
create policy sessions_insert on public.sessions for insert to authenticated
  with check (public.is_current_learner(learner_id));
create policy phase_select on public.phase_events for select to authenticated
  using (public.can_access_learner(learner_id));
create policy phase_insert on public.phase_events for insert to authenticated
  with check (public.is_current_learner(learner_id));
create policy attempts_select on public.attempts for select to authenticated
  using (public.can_access_learner(learner_id));
create policy attempts_insert on public.attempts for insert to authenticated
  with check (public.is_current_learner(learner_id));
create policy audio_events_select on public.audio_events for select to authenticated
  using (public.can_access_learner(learner_id));
create policy audio_events_insert on public.audio_events for insert to authenticated
  with check (public.is_current_learner(learner_id));
create policy mastery_select on public.mastery for select to authenticated
  using (public.can_access_learner(learner_id));

create policy missions_select on public.missions for select to authenticated
  using (public.can_access_family(family_id));
create policy missions_insert on public.missions for insert to authenticated
  with check (public.is_guardian(family_id) and created_by = (select auth.uid()));
create policy missions_update on public.missions for update to authenticated
  using (public.is_guardian(family_id)) with check (public.is_guardian(family_id));
create policy missions_delete on public.missions for delete to authenticated
  using (public.is_guardian(family_id));
create policy mission_words_select on public.mission_words for select to authenticated
  using (exists (select 1 from public.missions m where m.id = mission_id
    and public.can_access_family(m.family_id)));
create policy mission_words_write on public.mission_words for all to authenticated
  using (exists (select 1 from public.missions m where m.id = mission_id
    and public.is_guardian(m.family_id)))
  with check (exists (select 1 from public.missions m where m.id = mission_id
    and public.is_guardian(m.family_id)));
create policy parent_audio_select on public.parent_audio for select to authenticated
  using (public.can_access_family(family_id));
create policy parent_audio_write on public.parent_audio for all to authenticated
  using (public.is_guardian(family_id))
  with check (exists (
    select 1 from public.family_members fm
    where fm.family_id = parent_audio.family_id
      and fm.user_id = (select auth.uid())
      and fm.caregiver_label = parent_audio.caregiver_label
      and parent_audio.created_by = (select auth.uid())
  ));

revoke all on all tables in schema public from anon, authenticated;
grant select on public.families, public.family_members, public.learners, public.syllable_catalog,
  public.sessions,
  public.phase_events, public.attempts, public.audio_events, public.mastery,
  public.missions, public.mission_words, public.parent_audio to authenticated;
grant insert on public.sessions, public.phase_events, public.attempts, public.audio_events,
  public.missions, public.mission_words, public.parent_audio to authenticated;
grant update, delete on public.missions, public.mission_words, public.parent_audio to authenticated;

create view public.v_syllable_metrics with (security_invoker = true) as
select a.learner_id, a.expected_syllable as syllable,
  coalesce(sc.family_key, 'NAO_CLASSIFICADA') as family_key,
  count(*) filter (where attempt_number = 1) as opportunities,
  count(*) filter (where attempt_number = 1 and is_correct) as first_try_successes,
  round(100.0 * count(*) filter (where attempt_number = 1 and is_correct)
    / nullif(count(*) filter (where attempt_number = 1), 0), 1) as first_try_accuracy_pct,
  percentile_cont(0.5) within group (order by response_time_ms)
    filter (where attempt_number = 1 and is_correct and page_visible and timing_eligible
      and response_time_ms between 150 and 60000) as median_correct_response_ms,
  max(a.occurred_at) as last_seen_at
from public.attempts a
left join public.syllable_catalog sc on sc.syllable = a.expected_syllable
group by a.learner_id, a.expected_syllable, sc.family_key;

create view public.v_confusion_matrix with (security_invoker = true) as
select learner_id, expected_syllable, clicked_syllable, count(*) as first_click_count
from public.attempts
where attempt_number = 1 and not is_correct
group by learner_id, expected_syllable, clicked_syllable;

grant select on public.v_syllable_metrics, public.v_confusion_matrix to authenticated;
```

As RPCs acima são a única via para pareamento, encerramento de sessão, conclusão de missão e
exclusão integral do learner. Nenhuma tabela de pareamento recebe grant direto. Agendar
`purge_expired_telemetry()` mensalmente no Supabase Cron; a exclusão de `sessions` remove em
cascata tentativas e eventos brutos, preservando apenas o agregado `mastery`.

O bootstrap da Fase 9 é determinístico: habilitar Anonymous Sign-Ins; criar uma família e um
learner; os dois responsáveis fazem primeiro login por magic link; inserir os dois `auth.uid()`
em `family_members`; gerar o código; abrir uma rota técnica `/configurar?codigo=...` no iPad;
chamar `signInAnonymously()` e `claim_learner`; invalidar o código. Essa rota não aparece no jogo.

Antes da migration final, `scripts/generate-syllable-catalog.mjs` lê `curriculum.ts`, extrai
sílabas únicas e gera inserts determinísticos. `family_key` usa o ataque ortográfico: primeiro
digrafo/encontro reconhecido (`CH`, `LH`, `NH`, `RR`, `SS`, `QU`, `GU`, `BR`, `BL`, `CR`, `CL`,
`DR`, `FR`, `FL`, `GR`, `GL`, `PR`, `PL`, `TR`, `VR`), senão a primeira consoante; sílaba iniciada
por vogal recebe `VOGAL`. Entradas geradas começam com `pedagogically_reviewed = false`; a Fase 5
revisa a classificação sem reescrever eventos históricos.

#### 8.5 Indicadores do painel

**KPIs primários:**

1. **Acerto na primeira tentativa:** primeiras tentativas corretas ÷ oportunidades, por sílaba,
   família silábica e janelas de 7 e 28 dias. É a medida principal de reconhecimento autônomo.
2. **Sílabas consolidadas:** sílabas com pelo menos 12 oportunidades, média posterior ≥80% e
   pelo menos 4 acertos nas últimas 5 oportunidades. “Consolidada” é estado operacional do jogo,
   não afirmação clínica.
3. **Fluência relativa:** mediana do tempo de respostas corretas na primeira tentativa, comparada
   apenas com a mesma sílaba em períodos anteriores. Nunca comparar sílabas diferentes ou crianças.

**Drivers:** sessões por semana, minutos ativos, fases concluídas/rejogadas e uso voluntário de
“Ouvir”. **Guardrails:** taxa de esforço alto (oportunidade com ≥2 erros), abandono de fase e
sessões muito curtas após erro. A matriz de confusão usa somente o primeiro clique errado:
linha = esperada, coluna = clicada.

**Palavra consolidada** é apenas uma leitura derivada: todas as suas sílabas estão consolidadas e,
nas últimas 3 apresentações da palavra, pelo menos 2 foram concluídas sem segundo toque. Não há
placar paralelo por palavra. Frequência, dia e horário das sessões vêm de `started_at` e são
exibidos no fuso fixo `America/Sao_Paulo`; o app não coleta localização nem fuso do aparelho.

Regras de exibição:

- Não mostrar percentual com menos de 5 oportunidades; escrever “poucos dados”.
- Só destacar uma confusão após 3 ocorrências e 5 oportunidades da sílaba esperada.
- Só mostrar tendência se cada período comparado tiver pelo menos 10 oportunidades.
- Alerta de esforço é provisório: >25% nas últimas 20 oportunidades ou alta ≥10 pontos
  percentuais contra as 20 anteriores. Serve para rever conteúdo, nunca para rotular Cecília.
- Palavra com erro ≥40% em 5 apresentações, apesar de suas sílabas estarem consolidadas, entra
  na fila de revisão de emoji, vocabulário ou segmentação — não reduz domínio automaticamente.
- Todos os limiares são provisórios até existirem ao menos 100 primeiras tentativas distribuídas
  em 3 sessões. Depois disso, pais e direção pedagógica revisam os cortes; o sistema não os altera
  sozinho e não apresenta “significância estatística” com amostra de uma criança.

#### 8.6 Regra adaptativa previsível

Placar por sílaba usa Beta-Binomial simples: `p = (3 + acertos_primeira) / (4 + oportunidades)`.
O prior 75% evita decisões bruscas com uma ou duas observações, mas `opportunities < 3` continua
classificado como **novo**. Faixas: **apoio** (`n≥3, p<65%`), **em desenvolvimento**
(`p<80%` ou `n<12`) e **consolidada** (critério do KPI acima).

```text
ao iniciar sessão:
  carregar mastery + últimas 40 palavras + revisões vencidas
  criar exatamente 8 exercícios:
    1–2: aquecimento com sílabas conhecidas
    3–6: alvos permitidos pelo currículo da fase atual
    7–8: revisão espaçada ou reapresentação gentil

para cada palavra candidata:
  excluir palavra recente, fora do currículo ou com emoji marcado como ambíguo
  limitar a 2 sílabas novas por sessão; primeira exposição não entra no alvo 75–80%
  estimar p_palavra = 0,7 * menor_p_das_sílabas + 0,3 * média_p
  priorizar p_palavra perto de 77,5%, revisão vencida e sílaba-alvo menos vista
  desempatar por hash(session_id + palavra), nunca Math.random()

modo da sessão, calculado antes de começar:
  usar as últimas 20 oportunidades de sessões anteriores, nunca a sessão em andamento
  acerto recente <60%  -> apoio forte: 0–1 distrator
  60–74%              -> apoio: 1 distrator
  75–80%              -> padrão: 2 distratores
  >80%                -> avançar revisão/alvo: até 3 distratores, sem sair do currículo

durante a sessão:
  não mudar o modo global
  se a mesma palavra tiver 2 erros, enfileirar uma reapresentação nos slots 7–8
  reapresentar com um distrator a menos e áudio disponível
  nunca exibir rebaixamento, perda, vida, cronômetro ou punição

após a sessão:
  atualizar mastery somente pelas primeiras tentativas
  calcular revisão sem campo mutável: novo/apoio = mesma ou próxima sessão;
    desenvolvimento = last_seen + 2 dias; consolidada = +7 dias se n<20,
    +14 dias se n<30 e +30 dias se n≥30, sempre enquanto p≥80%
```

O alvo de 75–80% é de **primeira tentativa por oportunidade**, com tolerância operacional
70–85% por causa da amostra pequena. Não é meta para pressionar Cecília nem para avaliar os pais.

#### 8.7 Critérios de aceite da spec

- Duas fases jogadas offline por vários dias sincronizam sem duplicatas e na ordem lógica.
- Reenviar o mesmo lote não altera contagens nem `mastery`.
- Usuário anônimo do iPad só lê/escreve o próprio learner; cada responsável lê a mesma família;
  usuário não autenticado recebe zero linhas; testes negativos de RLS fazem parte da migration.
- Painel nunca mostra indicador abaixo dos mínimos de amostra e nunca usa linguagem diagnóstica.
- Seleção com o mesmo estado e `session_id` produz a mesma sequência de palavras.
- O catálogo contém todas as sílabas do currículo, sem `family_key = 'NAO_CLASSIFICADA'`;
  o teste de geração falha se uma sílaba ficar ausente ou sem classificação.
- Telemetria não adiciona atraso perceptível, não bloqueia jogo e não mostra erro de rede.

**Status:** ✅ concluída em 2026-07-12. Fase 9 desbloqueada.

---

## Fase 9 — Telemetria + sincronização **[CODEX]** (após Fases 1 e 8)

Implementar exatamente a Spec Fase 9/10:

1. Registrar todos os eventos definidos na spec, localmente (IndexedDB), desde o primeiro toque.
2. Sincronizar com o Supabase quando houver rede (retry silencioso; jamais bloquear ou
   atrasar o jogo; jamais mostrar erro de rede para a criança).
3. Criar as tabelas/políticas via migration SQL fornecida na spec.
4. Zero mudança visível no jogo — esta fase é invisível para a Cecília.

**Aceite:** jogar 2 fases offline → religar rede → eventos aparecem no banco íntegros e sem
duplicatas; jogo funciona 100% sem internet.

**Status:** ⬜ pronta para execução — Fases 1 e 8 concluídas

---

## Fase 10 — Painel dos pais **[CODEX]** (após Fase 9)

Página `/painel` na mesma app, protegida por Supabase Auth com magic link e contas individuais
para papai e mamãe. Não usar senha compartilhada ou segredo embutido no frontend:

1. Visão-resumo: última sessão (quando, quanto tempo, o que jogou), sequência de dias.
2. Indicadores da spec: domínio por família silábica, matriz de confusão, curva de fluência,
   palavras dominadas.
3. Tudo em português claro de pai/mãe, não de analista ("Ela está trocando PA por BA — isso
   é comum e significa X"), com os textos explicativos fornecidos por Claude na spec.
4. Leve e responsivo (celular); mesmos dados para os dois responsáveis, sem hierarquia.

**Aceite:** com dados reais de teste, os dois conseguem abrir no celular e entender em
2 minutos o que a Cecília treinou na semana e onde está a dificuldade.

**Status:** ⬜ pendente — bloqueada pela Fase 9

---

## Fase 11 — Presença dos pais no jogo **[CLAUDE spec + CODEX execução]** (após Fase 10)

O canal inverso: coisas dos pais descem até ela. **Regra de ouro: papai e mamãe têm sempre
os mesmos recursos e presença equilibrada no jogo — qualquer assimetria gera ciúme e pode
travar o uso. Nenhuma tela, mensagem ou recurso pode ser só de um dos dois.**

1. **Áudios de celebração reais:** os dois gravam frases curtas ("Filha, que orgulho!",
   "Você aprendeu o NH!"); o jogo sorteia/alterna com equilíbrio garantido por código
   (contador de reprodução por responsável — nunca 3× papai seguidas). Upload pelo painel;
   fallback para os textos atuais quando offline sem cache.
2. **Revisar as mensagens fixas do jogo:** hoje o `GameScreen`/`CelebrationScreen` só falam
   do papai ("Papai tá aqui!", "Papai te ama!"). Reescrever o conjunto com voz dos DOIS
   ("Mamãe e papai tão orgulhosos!", mensagens alternadas) — este item pode ser antecipado
   para qualquer fase Codex anterior, é troca de strings.
3. **Missão da família:** pelo painel, papai ou mamãe escolhem um pacotinho de palavras da
   semana (dentro do nível dela — o painel só oferece opções pedagogicamente válidas).
   No jogo, aparece como presente da família (arte da Fase 3), nunca como cobrança.
4. **Notificação de conquista** (opcional, decisão na Fase 0): quando ela fecha uma seção,
   os dois recebem aviso — o papai fica sabendo no mesmo dia, a 1.500 km.

**Aceite:** Cecília ouve as vozes dos dois em proporção equilibrada; mamãe e papai têm
exatamente as mesmas capacidades no painel; missões aparecem como presente.

**Status:** ⬜ pendente — bloqueada pela Fase 10 (item 2 pode ser antecipado)

---

## Notas para quem executar (Codex incluído)

- Servidor de dev para inspeção visual: `npx vite --config vite.review.config.ts --port 5175`
  (config sem SSL; a config principal usa HTTPS autoassinado para teste no iPad via rede).
- Não tocar em `Referencias visuais/` (originais das artes).
- Não introduzir mecânicas punitivas (corações, vidas, tempo, perder streak) — decisão de
  produto fixa.
- **Papai e mamãe sempre com presença equilibrada** em mensagens, áudios e recursos — decisão
  de produto fixa (ver Fase 11).
- A telemetria nunca pode bloquear, atrasar ou mostrar erros no jogo da criança.
- Commits pequenos por item numerado; mensagem em português.
