# Banco De Publicacao Diaria

Tabela base para controlar os videos da pasta, escolher 1 por dia sem repetir ate fechar o ciclo e gerar legendas por plataforma.

## Objetivo
- guardar o catalogo cru dos videos
- separar musica, autor e interprete
- controlar o ciclo aleatorio sem repeticao
- registrar legendas por plataforma
- manter rastreio de status e publicacao

## Campos Sugeridos
| ordem_ciclo | video_id | nome_arquivo | musica | autor_compositor | interprete_associado | tipo_musica | origem_pasta | trecho | duracao | energia | ciclo | status | legenda_tiktok | legenda_facebook | legenda_youtube | cta | agenda_proxima_data | agenda_proxima_local | spotify | observacoes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Descricao Dos Campos
- `ordem_ciclo`: posicao da faixa no ciclo atual
- `video_id`: identificador unico do video
- `nome_arquivo`: nome original do arquivo na pasta
- `musica`: titulo da musica
- `autor_compositor`: compositor confirmado ou `a confirmar`
- `interprete_associado`: nome pelo qual a musica ficou conhecida, quando fizer sentido
- `tipo_musica`: autoral, cover, medley, bloco ou `a confirmar`
- `origem_pasta`: subpasta ou caminho de origem
- `trecho`: resumo do trecho usado ou minutagem
- `duracao`: tempo do recorte
- `energia`: baixa, media ou alta
- `ciclo`: numero do ciclo atual
- `status`: raw, selected, captioned, approved, scheduled, published, archived
- `legenda_tiktok`: legenda pronta para TikTok
- `legenda_facebook`: legenda pronta para Facebook
- `legenda_youtube`: legenda pronta para YouTube
- `cta`: chamada para acao, como Spotify, agenda ou comentario
- `agenda_proxima_data`: proxima data de show, se houver
- `agenda_proxima_local`: local do proximo show, se houver
- `spotify`: link ou referencia de streaming para autorais
- `observacoes`: notas, direitos, prioridade, ajustes ou pontos a confirmar

## Regra Do Ciclo
1. listar todos os videos elegiveis
2. embaralhar a ordem apenas no inicio do ciclo
3. publicar 1 por dia sem repetir
4. quando acabar a lista, iniciar novo ciclo com nova ordem aleatoria
5. se um video sair da pasta ou for pausado, marcar em `status` e tirar da fila

## Regras Editorias
- se a musica nao tiver autor confirmado, marcar `a confirmar`
- se nao houver proxima data de show, deixar os campos de agenda em branco
- se a musica for autoral, reforcar Spotify ou outro streaming
- cada legenda deve ser curta, humana e musical
- manter o banco cru separado do texto final de publicacao

## Linha Vazia Modelo
| 001 | a_confirmar | exemplo.mp4 | a confirmar | a confirmar | a confirmar | cover | bruto/ | trecho a confirmar | 00:00:00 | media | 1 | raw |  |  |  |  |  |  |  |  |
