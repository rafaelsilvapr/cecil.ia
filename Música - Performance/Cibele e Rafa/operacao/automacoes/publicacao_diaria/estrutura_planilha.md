# Estrutura Final Da Planilha De Publicacao Diaria

Este documento define a forma final recomendada para a base operacional do projeto Cibele e Rafa.

Objetivo:
- publicar 1 conteudo por dia
- manter ordem aleatoria com memoria
- adaptar a legenda conforme a agenda
- registrar o que foi publicado por canal
- evitar repeticao precoce
- manter rastreio claro do que foi aprovado, postado e pendente

## Principio De Base

A planilha nao deve tentar fazer tudo em uma unica aba.

Ela deve funcionar como um pequeno sistema com 4 funcoes:
- catalogo de videos
- memoria do ciclo
- log de publicacao
- agenda editorial

Se quiserem manter uma unica planilha fisica no Google Sheets, a recomendacao e dividir em abas.
Se quiserem uma estrutura ainda mais robusta, a mesma logica pode ser espelhada em Data Store no Make.

## Abas Recomendadas

### 1. `catalogo_videos`

Esta e a aba principal.
Ela guarda cada video como um item editorial elegivel para publicacao.

Campos recomendados:
- `video_id`
- `drive_file_id`
- `arquivo_nome`
- `musica`
- `compositor`
- `interprete`
- `origem_autoral`
- `genero_musical`
- `contexto_gravacao`
- `trecho`
- `duracao`
- `energia`
- `status_aprovacao`
- `status_publicacao`
- `ordem_ciclo`
- `grupo_repertorio`
- `restricao_editorial`
- `observacoes_editoriais`
- `created_at`
- `updated_at`

Finalidade de cada grupo:
- identificacao: `video_id`, `drive_file_id`, `arquivo_nome`
- metadata musical: `musica`, `compositor`, `interprete`, `origem_autoral`, `genero_musical`
- recorte: `contexto_gravacao`, `trecho`, `duracao`, `energia`
- controle: `status_aprovacao`, `status_publicacao`, `ordem_ciclo`
- editorial: `grupo_repertorio`, `restricao_editorial`, `observacoes_editoriais`

Regras:
- se o arquivo estiver na pasta aprovada, pode entrar aqui
- se faltar algum dado, usar `a_confirmar`
- nao misturar catalogo com log de execucao
- nao usar esta aba como historico de publicacao

Status sugeridos para `status_aprovacao`:
- `aprovado`
- `a_confirmar`
- `pausado`
- `bloqueado`

Status sugeridos para `status_publicacao`:
- `pronto`
- `selecionado`
- `publishing`
- `postado`
- `pendente_canal`
- `erro`
- `arquivado`

### 2. `cycle_state`

Esta aba guarda a memoria da fila aleatoria.
Ela evita que a ordem seja recalculada todo dia.

Campos recomendados:
- `state_id`
- `cycle_id`
- `cycle_order_json`
- `cycle_position`
- `last_video_id`
- `last_run_at`
- `last_shuffled_at`
- `source_filter`
- `notes`

Regras:
- `cycle_order_json` guarda a lista embaralhada dos `video_id`
- `cycle_position` marca o proximo item a consumir
- quando a lista acabar, cria um novo ciclo
- a ordenacao nao deve depender de `video_id` como ordem editorial

### 3. `publicacoes_log`

Esta aba e append-only.
Ela registra o que aconteceu em cada execucao.

Campos recomendados:
- `data`
- `video_id`
- `cycle_id`
- `cycle_position`
- `show_detected`
- `show_summary`
- `agenda_data`
- `agenda_local`
- `caption_tiktok`
- `caption_instagram`
- `caption_facebook`
- `caption_youtube`
- `hashtags_tiktok`
- `hashtags_instagram`
- `hashtags_facebook`
- `hashtags_youtube`
- `tiktok_status`
- `instagram_status`
- `facebook_status`
- `youtube_status`
- `final_status`
- `published_at`
- `error_tiktok`
- `error_instagram`
- `error_facebook`
- `error_youtube`
- `manual_action`

Regras:
- gravar 1 linha por execucao
- registrar falha por canal sem apagar a evidencia
- `postado` so quando o criterio final for atendido
- se um canal falhar, manter pendencia por canal

### 4. `agenda_shows`

Esta aba resume o calendario em linguagem de automacao.
Ela pode ser alimentada pelo Google Calendar do `rafaelsilva.pr@gmail.com`.

Campos recomendados:
- `event_id`
- `event_date`
- `event_start`
- `event_end`
- `event_title`
- `event_location`
- `event_status`
- `show_flag`
- `show_week_flag`
- `service_text`
- `source_calendar`
- `notes`
- `updated_at`

Regras:
- se houver show na semana, marcar `show_week_flag = true`
- se o evento nao tiver local, manter `a_confirmar`
- se houver show do projeto, a legenda do dia precisa mencionar o show
- se nao houver show, a legenda segue a linha musical normal

### 5. `config_editorial`

Esta aba concentra regras fixas e evita espalhar padrao pelo fluxo.

Campos recomendados:
- `key`
- `value`
- `description`

Valores sugeridos:
- `cta_fixo_audio` = `Ouca Samba da Gabriela nas plataformas e no YouTube.`
- `cta_fixo_apoio` = `Se curtir, siga o projeto e compartilhe.`
- `tom` = `humano, musical, direto e caloroso`
- `timezone` = `America/Sao_Paulo`
- `show_rule` = `em semana de show, divulgar o show todos os dias`
- `postagem_base` = `1 por dia`
- `status_final_padrao` = `postado`

## Como A Automacao Deve Ler As Abas

Ordem recomendada:
1. ler `agenda_shows`
2. ler `cycle_state`
3. buscar candidatos em `catalogo_videos`
4. escolher 1 item da fila
5. gerar captions
6. publicar por canal
7. registrar tudo em `publicacoes_log`
8. atualizar `catalogo_videos`
9. atualizar `cycle_state`

## Regra Editorial Obrigatoria

Toda legenda deve trazer uma chamada para ouvir `Samba da Gabriela`.

Forma recomendada:
- curta
- natural
- repetivel
- sem soar como anuncio duro

Exemplo de regra:
- `Ouca Samba da Gabriela nas plataformas e no YouTube.`

Essa chamada pode variar de forma leve, mas nao deve sumir.

## Regra De Semana De Show

Quando o calendario indicar semana com show:
- o conteudo do dia deve mencionar o show
- se o local estiver confirmado, incluir local e servico
- se o local nao estiver confirmado, usar o bloco de show com `a_confirmar`
- nao inventar local, horario ou endereco

## O Que Esta Falando A Favor Dessa Estrutura

- separa dado editorial de log operacional
- permite sorteio controlado sem perder memoria
- facilita retry por canal
- suporta contexto de agenda
- deixa a automacao mais previsivel e audivel

## O Que Ainda E Risco

- o Google Calendar precisa ter eventos mais legiveis
- a pasta de videos precisa ser ingerida na base com consistencia
- o fluxo precisa atualizar status por canal
- o timezone precisa ser padronizado
- o campo de show precisa ser confiavel o bastante para nao inventar servico

## Prioridade De Implementacao

1. consolidar a aba principal do catalogo
2. criar ou reforcar `cycle_state`
3. criar `publicacoes_log`
4. criar `agenda_shows`
5. centralizar regras em `config_editorial`
6. ligar o Make a esses estados

