# Workflow Draft - 50 Dias De Musica

Este documento descreve um workflow unico no n8n para rodar a serie `50 dias de musica`.

Status:
- `draft operacional`
- ainda nao e export JSON validado

## Objetivo

Publicar 1 video por dia com esta estrutura editorial:
- `#<numero_do_dia> <musica> (<compositor>)`
- 1 linha curta sobre a musica
- 1 linha curta sobre o autor ou o interprete que a imortalizou
- CTA para ouvir `Samba da Gabriela` nas plataformas
- CTA de `seguir` ou `inscrever-se` conforme a plataforma

## Estrategia

Simplificacao adotada:
- sem agenda
- sem show
- sem roteamento editorial complexo
- sem memoria longa de agente
- sem escolha livre demais
- sem sub-workflows

O workflow unico governa:
- quem entra
- qual numero da serie sai hoje
- qual video sera publicado
- como a legenda e montada
- como cada plataforma e chamada
- que status fica salvo

## Pre-Requisitos

Base minima em `catalogo_videos`:
- `drive_file_id`
- `arquivo_nome`
- `musica`
- `compositor`
- `interprete`
- `origem_autoral`
- `genero_musical`
- `status_publicacao`
- `observacoes_editoriais`

Campos novos recomendados:
- `serie_50_dias` = `sim` ou `nao`
- `ordem_50_dias` = numero de 1 a 50
- `numero_publicado_50_dias` = vazio ate sair
- `data_publicacao_50_dias` = vazio ate sair

Estado minimo fora da tabela:
- `serie_nome` = `50_dias_de_musica`
- `dia_atual` = `1..50`
- `ultimo_drive_file_id`

## Fluxo

### 1. `Schedule Trigger`

Executa 1 vez por dia no horario desejado.

Sugestao:
- `09:00`
- `America/Sao_Paulo`

### 2. `Google Sheets` ou `Data Table` - buscar candidatos

Filtro minimo:
- `serie_50_dias = sim`
- `status_publicacao = pronto`

Ordenacao recomendada:
- `ordem_50_dias ASC`

### 3. `State Read`

Ler o registro persistido da serie.

Campos:
- `dia_atual`
- `ultimo_drive_file_id`
- `ultima_execucao`

### 4. `Code` - selecionar o item do dia

Regra:
- pegar a linha cuja `ordem_50_dias` seja igual ao `dia_atual`
- se nao encontrar, encerrar com erro claro
- se `dia_atual > 50`, parar a serie ou reiniciar manualmente

Saida:
- `numero_do_dia`
- `drive_file_id`
- `musica`
- `compositor`
- `interprete`
- `origem_autoral`
- `genero_musical`
- `observacoes_editoriais`

### 5. `Google Drive` - obter arquivo

Buscar o arquivo pelo `drive_file_id`.

Se nao achar:
- salvar erro
- nao avancar o contador do dia

### 6. `Code` - gerar legendas

Entrada controlada:
- `numero_do_dia`
- `musica`
- `compositor`
- `interprete`
- `origem_autoral`
- `genero_musical`
- `observacoes_editoriais`

Saida esperada:
- `caption_tiktok`
- `caption_instagram`
- `caption_facebook`
- `caption_youtube`

### 7. `Publish Routes`

Uma branch por plataforma.

Minimo:
- TikTok
- Instagram
- Facebook
- YouTube

Regra:
- erro em uma branch nao derruba as outras
- cada branch devolve `ok` ou `erro`
- o draft pode usar `HTTP Request` para publisher externo quando a API nativa da plataforma nao estiver consolidada

### 8. `State Update`

Se o criterio de sucesso global for atendido:
- avancar `dia_atual` em `+1`

Se houver pendencia de canal:
- manter `dia_atual`
- marcar `pendente_canal`

### 9. `Log Append`

Registrar em `publicacoes_log`:
- `data`
- `numero_do_dia`
- `video_id`
- `caption_*`
- `status por canal`
- `final_status`

### 10. `Catalog Update`

Atualizar a linha do video:
- `numero_publicado_50_dias`
- `data_publicacao_50_dias`
- `status_publicacao`

## Criterio De Status

Sugestao:
- `postado` quando todos os canais obrigatorios forem publicados
- `pendente_canal` quando houver falha parcial
- `erro` quando nenhum canal concluir

## Risco Principal

Sem credenciais e endpoints finais de publicacao, o workflow ainda precisa de ajuste manual apos importar.
O desenho, porém, ja esta unificado em um unico fluxo.
