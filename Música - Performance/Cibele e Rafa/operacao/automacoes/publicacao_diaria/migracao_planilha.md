# Migracao Da Planilha Atual Para A Estrutura Final

Este documento mostra como sair da planilha atual para a estrutura final sem perder rastreio.

Escopo:
- planilha atual de operacao
- base editorial de videos
- fila aleatoria com memoria
- log de publicacao
- agenda de shows

## Leitura Geral

Hoje existem dois arquivos relevantes:
- [Banco de Publicacao Diaria - Cibele e Rafa](/Users/rafaelrodriguesdasilva/Documents/Agentes%20-%20Antigravity/Mu%CC%81sica%20-%20Performance/Cibele%20e%20Rafa/14TEjwW1SjRtgp8dznivsQplJ8F2_9-ufiPhfyz_Ppck)
- [Controle de publicacoes - Cibele e Rafael](/Users/rafaelrodriguesdasilva/Documents/Agentes%20-%20Antigravity/Mu%CC%81sica%20-%20Performance/Cibele%20e%20Rafa/1wzxSkFec9ASfZjQThExFBN2tdV1axkQVLHn7jQPXgK4)

Na pratica:
- o arquivo `Banco de Publicacao Diaria - Cibele e Rafa` esta mais perto de um rascunho de planejamento
- o arquivo `Controle de publicacoes - Cibele e Rafael` esta mais perto da base operacional real

Para a automacao, a recomendacao e:
- manter apenas uma fonte operacional principal
- migrar os dados uteis do rascunho para a base final
- separar o que e catalogo, o que e estado e o que e log

## Regra De Migracao

Ordem recomendada:
1. consolidar a base de videos em `catalogo_videos`
2. criar `cycle_state`
3. criar `publicacoes_log`
4. criar `agenda_shows`
5. criar `config_editorial`
6. desativar ou reduzir o uso da planilha rascunho

## Mapa Campo A Campo

### A. `Banco de Publicacao Diaria - Cibele e Rafa` -> `catalogo_videos`

Esta aba atual funciona como um esqueleto de cadastro.

| Campo atual | Campo final | Acao | Observacao |
|---|---|---|---|
| `ordem_ciclo` | `ordem_ciclo` | manter | passa a ser ordem editorial ou ordem do ciclo, conforme decidido |
| `video_id` | `drive_file_id` | reinterpretar | hoje funciona como id de arquivo do Drive |
| `nome_arquivo` | `arquivo_nome` | renomear | padronizar nome de coluna |
| `musica` | `musica` | manter | nome da faixa |
| `autor_compositor` | `compositor` | renomear | padronizar o termo |
| `interprete_associado` | `interprete` | renomear | padronizar o termo |
| `tipo_musica` | `genero_musical` | renomear | `cover`, `samba`, `xote` etc. podem ir aqui ou em outro campo de classificacao |
| `origem_pasta` | `origem_pasta` ou `drive_folder` | manter com ajuste | se virar id da pasta, melhor salvar como `drive_folder_id` |
| `trecho` | `trecho` | manter | corte selecionado |
| `duracao` | `duracao` | manter | idealmente em formato padronizado |
| `energia` | `energia` | manter | baixa, media, alta |
| `ciclo` | `status_publicacao` ou `cycle_tag` | reclassificar | hoje esta mais perto de controle operacional do que de metadado musical |
| `status` | `status_publicacao` | renomear | ex.: `raw`, `selected`, `captioned`, `publishing`, `postado` |
| `legenda_tiktok` | `legenda_tiktok` | manter | virar saida gerada ou copiada do sistema |
| `legenda_facebook` | `legenda_facebook` | manter | idem |
| `legenda_youtube` | `legenda_youtube` | manter | idem |
| `cta` | `cta` | manter | preferir valores controlados como `search`, `show`, `follow`, `subscribe` |
| `agenda_proxima_data` | `agenda_data` ou `agenda_shows.event_date` | migrar | idealmente deixar de ser campo solto e ir para a aba de agenda |
| `agenda_proxima_local` | `agenda_local` ou `agenda_shows.event_location` | migrar | mesmo raciocinio do campo de data |
| `spotify` | `cta_fixo_audio` ou remover da tabela principal | descontinuar | a chamada obrigatoria vai para `config_editorial`, nao precisa ficar por linha |
| `observacoes` | `observacoes_editoriais` | renomear | manter o texto livre para contexto e excecoes |

#### Observacoes Sobre Essa Aba

- esta planilha ainda tem cara de tabela unica
- ela precisa virar catalogo + regras de fila, nao um mix de tudo
- `spotify` como coluna fixa deixa de fazer sentido se a chamada para `Samba da Gabriela` for obrigatoria em toda legenda

### B. `Controle de publicacoes - Cibele e Rafael` -> `catalogo_videos`

Esta aba ja esta mais perto do catalogo final.

| Campo atual | Campo final | Acao | Observacao |
|---|---|---|---|
| `video_id` | `drive_file_id` | manter como id de arquivo | hoje o campo ja parece ser o id do Drive |
| `arquivo_nome` | `arquivo_nome` | manter | nome do arquivo |
| `musica` | `musica` | manter | nome da musica |
| `compositor` | `compositor` | manter | autoria |
| `interprete` | `interprete` | manter | interprete associado |
| `origem_autoral` | `origem_autoral` | manter | `autor_proprio`, `cover`, etc. |
| `genero_musical` | `genero_musical` | manter | classificacao principal |
| `contexto_gravacao` | `contexto_gravacao` | manter | contexto do take |
| `status` | `status_publicacao` | renomear | hoje esta muito perto de `publishing` / `pronto` |
| `observacoes_editoriais` | `observacoes_editoriais` | manter | texto livre editorial |

#### Campos Novos A Criar Em `catalogo_videos`

| Campo novo | Origem sugerida | Funcao |
|---|---|---|
| `trecho` | n/a ou fonte de edicao | marca o recorte usado |
| `duracao` | n/a ou fonte de edicao | tempo do recorte |
| `energia` | n/a ou padrao editorial | ajuda a distribuir o clima da semana |
| `ordem_ciclo` | `cycle_state` | identifica a posicao editorial atual |
| `status_aprovacao` | regra interna | separa aprovado de pronto para publicar |
| `grupo_repertorio` | catalogacao editorial | ajuda a nao repetir o mesmo bloco seguido |
| `restricao_editorial` | observacoes ou regra manual | marca cuidados de legenda ou uso |
| `created_at` | automacao | data de entrada no catalogo |
| `updated_at` | automacao | data de ultima alteracao |

#### Campos Que Devem Ser Reinterpretados

- `status` nao deve significar tudo ao mesmo tempo
- `ciclo` nao deve ser apenas um numero solto
- `video_id` precisa ser entendido como id de arquivo ou id interno, nao como ambos sem criterio

## Mapa Para As Novas Abas

### C. Criar `cycle_state`

Fonte:
- nao vem de uma aba atual confiavel
- pode ser inicializada a partir da planilha existente ou do primeiro sorteio

Campos:
- `state_id`
- `cycle_id`
- `cycle_order_json`
- `cycle_position`
- `last_video_id`
- `last_run_at`
- `last_shuffled_at`
- `source_filter`
- `notes`

Migração:
- o ciclo atual pode começar vazio
- a primeira execucao gera a primeira ordem embaralhada
- a partir dali a ordem passa a ser persistida

### D. Criar `publicacoes_log`

Fonte:
- historico ainda nao existe de forma boa

Campos:
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

Migração:
- nao ha migracao retroativa obrigatoria
- se quiser, o primeiro log pode registrar o estado atual do sistema como ponto de partida

### E. Criar `agenda_shows`

Fonte:
- Google Calendar do `rafaelsilva.pr@gmail.com`

Campos:
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

Migração:
- nao depende de planilha anterior
- precisa ser alimentada a partir da agenda viva
- se o evento nao trouxer local, manter `a_confirmar`

### F. Criar `config_editorial`

Fonte:
- regras do projeto e do prompt

Campos:
- `key`
- `value`
- `description`

Valores de partida sugeridos:
- `cta_fixo_audio` = `Ouca Samba da Gabriela nas plataformas e no YouTube.`
- `cta_fixo_apoio` = `Se curtir, siga o projeto e compartilhe.`
- `tom` = `humano, musical, direto e caloroso`
- `timezone` = `America/Sao_Paulo`
- `show_rule` = `em semana de show, divulgar o show todos os dias`
- `postagem_base` = `1 por dia`
- `status_final_padrao` = `postado`

## Fila De Migração Recomendada

### Etapa 1
Consolidar o catalogo em uma unica tabela final.

### Etapa 2
Normalizar nomes de coluna.

### Etapa 3
Separar o que e dado musical do que e estado operacional.

### Etapa 4
Criar a memoria do ciclo.

### Etapa 5
Criar o log de publicacao.

### Etapa 6
Conectar a agenda e o texto ao vivo.

## Regras Que Nao Devem Quebrar Na Migracao

- nao perder o vinculo com o arquivo do Drive
- nao apagar o texto editorial existente sem copiar para o novo campo
- nao usar `video_id` como nome magico para tudo
- nao misturar legenda pronta com log de execucao
- nao deixar o calendario fora da estrutura
- nao remover a chamada obrigatoria para `Samba da Gabriela`

## Resultado Esperado Depois Da Migracao

- 1 base de catalogo
- 1 memoria de ciclo
- 1 log de publicacao
- 1 espelho de agenda
- 1 bloco de regras editoriais

Isso deixa a automacao pronta para:
- escolher video sem repeticao precoce
- falar de show quando houver show
- manter legenda atualizada por dia
- registrar erro por canal
- sustentar a consistencia diaria que voce quer

