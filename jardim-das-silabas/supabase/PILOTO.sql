-- =============================================================================
-- PILOTO NO TABLET DA CECÍLIA — roteiro para o SQL Editor do Supabase
-- Projeto: jardim-silabas (jetkjnjkgnxrvztkhvhu)
-- =============================================================================
-- Rode os blocos na ordem. Os blocos 1 e 2 precisam ser feitos ENQUANTO você
-- ainda tem o tablet na mão. Os blocos 4 e 5 funcionam de qualquer lugar.
--
-- IDs já existentes neste projeto:
--   família : d4444a11-a9f1-4f4e-9f06-614cdae6390d
--   Cecília : 1556e9d8-5dc5-40b9-9a32-30304d2454c3
--   papai   : ffd6ddc6-2d29-41e8-808c-f1098080d7c1  (rafaelsilva.pr@gmail.com)
-- =============================================================================


-- -----------------------------------------------------------------------------
-- BLOCO 1 — Gerar o código de pareamento do tablet
-- -----------------------------------------------------------------------------
-- Devolve o LINK que você abre uma vez no Chrome do tablet. Código de uso único.
-- A validade é de 48 h (a função original usa 30 min, curto demais para quem
-- está montando o aparelho com a criança junto).
-- Guarde o link: ele não aparece de novo, o banco só guarda o hash.

delete from public.pairing_codes
where learner_id = '1556e9d8-5dc5-40b9-9a32-30304d2454c3'
  and used_at is null;

-- 'as materialized' garante que o código mostrado na tela é o mesmo que gerou
-- o hash gravado. Sem isso o Postgres poderia avaliar a expressão duas vezes.
with novo as materialized (
  select encode(extensions.gen_random_bytes(18), 'hex') as codigo
),
inserido as (
  insert into public.pairing_codes (learner_id, code_hash, created_by, expires_at)
  select '1556e9d8-5dc5-40b9-9a32-30304d2454c3'::uuid,
         encode(extensions.digest(novo.codigo, 'sha256'), 'hex'),
         'ffd6ddc6-2d29-41e8-808c-f1098080d7c1'::uuid,
         now() + interval '48 hours'
  from novo
  returning expires_at
)
select 'https://jardim-das-silabas.vercel.app/configurar?codigo=' || novo.codigo
         as abra_este_link_no_tablet,
       inserido.expires_at as vale_ate
from novo, inserido;


-- -----------------------------------------------------------------------------
-- BLOCO 2 — Verificação (com o tablet AINDA na mão)
-- -----------------------------------------------------------------------------
-- O pareamento falha em SILÊNCIO: o jogo não mostra erro nenhum se o código for
-- inválido. Esta é a única forma de saber que deu certo.
--
-- Passo a passo:
--   1. abra o link do bloco 1 no Chrome do tablet, com internet;
--   2. rode a consulta A — paired_at tem que estar preenchido;
--   3. abra o app pelo ícone e jogue UMA fase inteira;
--   4. espere ~30 s e rode a consulta B — tem que aparecer sessão e tentativas.
-- Se B vier zerado, algo está errado e você ainda pode consertar hoje.

-- A) o aparelho ficou pareado?
select id, device_user_id, paired_at
from public.learners
where id = '1556e9d8-5dc5-40b9-9a32-30304d2454c3';

-- B) o dado está chegando?
select (select count(*) from public.sessions)     as sessoes,
       (select count(*) from public.phase_events) as eventos_de_fase,
       (select count(*) from public.attempts)     as tentativas,
       (select count(*) from public.audio_events) as audios,
       (select count(*) from public.mastery)      as silabas_com_dominio,
       (select max(received_at) from public.attempts) as ultimo_dado_recebido,
       (select app_version from public.sessions order by started_at desc limit 1) as versao_do_app;


-- -----------------------------------------------------------------------------
-- BLOCO 3 — Conta da mamãe  (NÃO precisa do tablet, pode ser depois)
-- -----------------------------------------------------------------------------
-- Ordem: ela entra uma vez em https://jardim-das-silabas.vercel.app/painel com
-- o e-mail dela e clica no link mágico. Isso cria a conta. Só então rode isto,
-- trocando o e-mail. Ela passa a ter exatamente o mesmo acesso que você.

-- insert into public.family_members (family_id, user_id, caregiver_label)
-- select 'd4444a11-a9f1-4f4e-9f06-614cdae6390d'::uuid, id, 'mae'
-- from auth.users where email = 'EMAIL_DA_MAE_AQUI';


-- -----------------------------------------------------------------------------
-- BLOCO 4 — Reconectar o tablet à distância (plano B)
-- -----------------------------------------------------------------------------
-- Use se a telemetria parar porque o tablet foi limpo ou o app reinstalado.
-- Solta o aparelho, depois volte ao BLOCO 1 e mande o link novo por WhatsApp
-- para alguém abrir no tablet uma vez.

-- update public.learners
--   set device_user_id = null, paired_at = null
--   where id = '1556e9d8-5dc5-40b9-9a32-30304d2454c3';


-- -----------------------------------------------------------------------------
-- BLOCO 5 — O projeto pausou de novo?
-- -----------------------------------------------------------------------------
-- O plano gratuito do Supabase pausa o projeto após ~7 dias sem uso. Se ela
-- ficar uma semana sem jogar, o banco dorme e o painel para de responder.
-- O dado NÃO se perde: a fila no tablet guarda tudo e reenvia (5 s, 30 s, 2 min,
-- 10 min, 1 h e depois a cada 6 h). Basta restaurar o projeto no painel do
-- Supabase que a fila esvazia sozinha na próxima vez que ela abrir o jogo.
