-- =============================================================================
-- ACOMPANHAR A CECÍLIA À DISTÂNCIA — consultas para o SQL Editor do Supabase
-- =============================================================================
-- São perguntas em português sobre o banco, para você não depender do painel.
-- Rode uma de cada vez. Nenhuma delas altera nada.
--
-- Regra que vale para quase tudo: só a PRIMEIRA tentativa de cada posição conta
-- (attempt_number = 1). Os toques seguintes ficam registrados para diagnóstico,
-- mas não transformam uma mesma dificuldade em várias derrotas.
-- =============================================================================


-- 1. COM QUE FREQUÊNCIA ELA JOGA — calendário dos últimos 30 dias
-- Melhor que "sequência de dias", que zera e engana.
select (started_at at time zone 'America/Sao_Paulo')::date as dia,
       count(*)                                            as sessoes,
       round(sum(coalesce(duration_ms, 0)) / 60000.0, 1)   as minutos
from public.sessions
where started_at > now() - interval '30 days'
group by 1
order by 1 desc;


-- 2. ESTÁ CHEGANDO DADO? — saúde da sincronização
-- Se "ha_quanto_tempo" passar de alguns dias, ou ela parou de jogar, ou o envio
-- travou. Sem isso você não distingue uma coisa da outra.
select max(received_at)                                as ultimo_dado_recebido,
       now() - max(received_at)                        as ha_quanto_tempo,
       (select app_version from public.sessions
         order by started_at desc limit 1)             as versao_do_app_dela
from public.attempts;


-- 3. QUAIS SÍLABAS PESAM MAIS — acerto e tempo mediano
-- View pronta da migration. Menor acerto primeiro.
select syllable      as silaba,
       family_key    as familia,
       opportunities as oportunidades,
       first_try_accuracy_pct       as acerto_pct,
       median_correct_response_ms   as tempo_mediano_ms,
       last_seen_at
from public.v_syllable_metrics
where opportunities >= 5
order by acerto_pct nulls last
limit 25;


-- 4. O QUE ELA TROCA POR O QUE — matriz de confusão
-- Sinal pedagógico para observação, não diagnóstico.
select expected_syllable as devia_tocar,
       clicked_syllable  as tocou,
       first_click_count as vezes
from public.v_confusion_matrix
order by first_click_count desc
limit 20;


-- 5. AUTONOMIA — quantas vezes ela pede "Ouvir" antes de tentar
-- Este dado já é gravado e não aparece em lugar nenhum do painel.
-- Palavra que ela pede para ouvir várias vezes ainda depende do áudio,
-- não da leitura. É o melhor sinal de autonomia que existe aqui.
select word                                as palavra,
       count(*)                            as apresentacoes,
       round(avg(listens_before_attempt), 1) as media_de_pedidos_de_ouvir
from public.attempts
where attempt_number = 1 and syllable_position = 0
group by word
having count(*) >= 3
order by media_de_pedidos_de_ouvir desc
limit 20;


-- 6. ONDE NA PALAVRA ELA ERRA — primeira, meio ou última sílaba
select syllable_position + 1                                     as posicao_na_palavra,
       count(*)                                                  as primeiras_tentativas,
       round(100.0 * count(*) filter (where is_correct) / count(*), 1) as acerto_pct
from public.attempts
where attempt_number = 1
group by 1
order by 1;


-- 7. REGRESSÃO — sílabas que ela dominava e voltou a errar
-- O placar de domínio acumula para sempre, então um esquecimento fica escondido
-- atrás do histórico bom. Esta é a consulta que mais te avisa de longe que algo
-- mudou na vida dela.
with base as (
  select expected_syllable,
    count(*) filter (where occurred_at <  now() - interval '14 days')                as antes_n,
    count(*) filter (where occurred_at <  now() - interval '14 days' and is_correct) as antes_ok,
    count(*) filter (where occurred_at >= now() - interval '14 days')                as agora_n,
    count(*) filter (where occurred_at >= now() - interval '14 days' and is_correct) as agora_ok
  from public.attempts
  where attempt_number = 1
  group by 1
)
select expected_syllable                                   as silaba,
       antes_n                                             as oportunidades_antes,
       round(100.0 * antes_ok / nullif(antes_n, 0), 1)     as acerto_antes_pct,
       agora_n                                             as oportunidades_agora,
       round(100.0 * agora_ok / nullif(agora_n, 0), 1)     as acerto_agora_pct
from base
where antes_n >= 8 and agora_n >= 5
  and 100.0 * agora_ok / nullif(agora_n, 0)
      < 100.0 * antes_ok / nullif(antes_n, 0) - 15
order by acerto_agora_pct;


-- 8. LEITURA DA PALAVRA INTEIRA — diferente de reconhecer sílaba solta
-- "Limpa" = montou a palavra toda sem nenhum toque errado.
with por_apresentacao as (
  select presentation_id, word,
         bool_and(attempt_number = 1 and is_correct) as limpa
  from public.attempts
  group by 1, 2
)
select word                                                    as palavra,
       count(*)                                                as vezes_jogada,
       round(100.0 * count(*) filter (where limpa) / count(*), 1) as montou_limpa_pct
from por_apresentacao
group by word
having count(*) >= 3
order by montou_limpa_pct
limit 20;


-- 9. MELHOR HORA DO DIA — para a rotina aí
select extract(hour from occurred_at at time zone 'America/Sao_Paulo')::int as hora,
       count(*)                                                  as primeiras_tentativas,
       round(100.0 * count(*) filter (where is_correct) / count(*), 1) as acerto_pct
from public.attempts
where attempt_number = 1
group by 1
having count(*) >= 20
order by 1;


-- 10. ONDE ELA DESISTE DENTRO DA FASE
-- Se ela sempre para na 6ª de 8 palavras, oito exercícios é demais.
with abandonadas as (
  select session_id, level_index
  from public.phase_events
  where event_type = 'abandoned'
)
select ab.level_index + 1                     as fase,
       count(distinct a.presentation_id)      as palavras_ate_desistir
from abandonadas ab
join public.attempts a
  on a.session_id = ab.session_id and a.level_index = ab.level_index
group by ab.session_id, ab.level_index
order by 1;
