# Indexacao E Legendas - 50 Dias De Musica

Este documento define como preparar os videos antes da publicacao.

Objetivo:
- indexar os videos de forma simples
- deixar as legendas prontas antes da execucao diaria
- fazer o workflow apenas buscar dados e publicar

## Decisao Principal

Para esta serie, a melhor estrategia e:
- `nao` gerar legenda no momento da publicacao
- `sim` preparar a legenda antes e salvar na planilha

Isso deixa a operacao:
- mais previsivel
- mais facil de revisar
- mais facil de corrigir
- mais leve no n8n

## O Que O Workflow Diario Deve Fazer

O workflow diario deve apenas:
1. ler o item do dia
2. buscar o video
3. ler as legendas prontas
4. publicar
5. atualizar status e log

## O Que Deve Ser Preparado Antes

Cada video da serie precisa entrar no catalogo com:
- identificacao
- contexto minimo
- numero da serie
- legenda pronta por plataforma

## Estrutura Recomendada Na Planilha

### Campos De Identificacao
- `drive_file_id`
- `arquivo_nome`
- `musica`
- `compositor`
- `interprete`
- `origem_autoral`
- `genero_musical`
- `observacoes_editoriais`

### Campos Da Serie
- `serie_50_dias`
- `ordem_50_dias`
- `numero_publicado_50_dias`
- `data_publicacao_50_dias`
- `status_publicacao`

### Campos Das Legendas
- `caption_tiktok`
- `caption_instagram`
- `caption_facebook`
- `caption_youtube`

### Campos De Apoio Editorial
- `linha_musica`
- `linha_artista`
- `cta_streaming`
- `cta_plataforma`
- `revisado_em`
- `revisado_por`

## Regra De Montagem Da Legenda

Cada legenda deve nascer desta estrutura:

Linha 1:
- `#<ordem_50_dias> <musica> (<compositor>)`

Linha 2:
- uma linha curta sobre a musica

Linha 3:
- uma linha curta sobre o compositor ou o interprete

Linha 4:
- CTA fixo para ouvir `Samba da Gabriela`

Linha 5:
- CTA da plataforma

## O Que Vale Indexar Em Cada Video

Para indexacao enxuta, eu recomendo preencher apenas:
- `musica`
- `compositor`
- `interprete`
- `origem_autoral`
- `genero_musical`
- `observacoes_editoriais`
- `serie_50_dias`
- `ordem_50_dias`

Com isso, ja da para gerar ou escrever as legendas.

## Melhor Forma De Preparar As Legendas

Eu recomendo dividir em 2 etapas:

### Etapa 1 - Indexacao

Preencher os metadados basicos do video.

Exemplo:
- `musica`: `Reconvexo`
- `compositor`: `Caetano Veloso`
- `interprete`: `Caetano Veloso`
- `origem_autoral`: `cover`
- `genero_musical`: `MPB`
- `serie_50_dias`: `sim`
- `ordem_50_dias`: `1`

### Etapa 2 - Legenda Pronta

Depois de indexado, preencher:
- `linha_musica`
- `linha_artista`
- `caption_tiktok`
- `caption_instagram`
- `caption_facebook`
- `caption_youtube`

## Como Escrever As Duas Linhas Principais

### `linha_musica`

Deve falar da musica em tom curto e natural.

Exemplos:
- `Hoje a serie passa por uma canção que sempre abre outras camadas na escuta.`
- `Uma musica que pede atenção no detalhe e continua crescendo a cada nova audição.`
- `Daquelas canções que carregam muita imagem, muita memória e muito movimento.`

### `linha_artista`

Deve falar do compositor ou do interprete.

Exemplos:
- `Caetano Veloso assina uma das composições mais marcantes desse repertório.`
- `Na voz de Caetano, essa música ganhou um lugar definitivo na memória de muita gente.`
- `Aqui a lembrança vai direto para quem escreveu e ajudou a moldar essa escuta.`

## CTA Fixo

Eu sugiro padronizar assim:

`Ouça Samba da Gabriela nas plataformas de streaming e no YouTube.`

## CTA Por Plataforma

### TikTok
`Siga para acompanhar os próximos dias da série.`

### Instagram
`Siga para acompanhar os próximos dias da série.`

### Facebook
`Acompanhe a página para seguir os próximos dias da série.`

### YouTube
`Inscreva-se no canal para acompanhar os próximos dias da série.`

## Formula De Montagem

Cada `caption_*` pode ser montada como:

`header + linha_musica + linha_artista + cta_streaming + cta_plataforma`

Onde:
- `header` = `#<ordem_50_dias> <musica> (<compositor>)`
- `cta_streaming` = mesmo texto para todas
- `cta_plataforma` = varia por canal

## Melhor Jeito De Operar

Para esta fase do projeto, eu recomendo:
- preencher primeiro os 50 itens da serie
- deixar todas as captions prontas na planilha
- usar o n8n apenas como executor

## Se Quiser Ganhar Velocidade

Da para fazer isso com um fluxo de apoio:
1. importar todos os videos para a planilha
2. preencher metadados basicos
3. usar um processo auxiliar para sugerir `linha_musica` e `linha_artista`
4. revisar manualmente
5. congelar as captions finais

## O Que Eu Recomendo Agora

1. fechar a estrutura das colunas
2. numerar os 50 videos da serie
3. preencher as linhas curtas
4. montar os `caption_*`
5. deixar o workflow diario so como publicador

