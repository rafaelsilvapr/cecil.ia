# Manifesto De Automacao

## Identificacao
- nome: `50 dias de musica`
- plataforma: `n8n`
- objetivo: `publicar uma serie diaria simples com 50 musicas, numeracao sequencial, legenda curta e CTA fixo para Samba da Gabriela`
- status: `draft`
- owner: `Cibele e Rafa`

## Fonte De Verdade
- contas: `operacao/contas_publicacao.md`
- conteudo: `conteudo/banco_de_clipes.md`
- legendas: `conteudo/legendas.md`
- estrutura da base: `operacao/automacoes/publicacao_diaria/estrutura_planilha.md`
- migracao da base: `operacao/automacoes/publicacao_diaria/migracao_planilha.md`

## Entrada
- origem: `catalogo_videos` em Google Sheets ou Data Table equivalente no n8n
- gatilho: `cron diario`
- registros consultados:
  - `catalogo_videos`
  - `publicacoes_log`
  - `config_editorial`
- estado persistido:
  - numero do dia atual
  - ultimo item publicado
  - status por canal

## Saida
- destino:
  - `TikTok`
  - `Instagram`
  - `Facebook`
  - `YouTube`
- formato:
  - video + legenda curta por plataforma
- campos obrigatorios:
  - `numero_dia`
  - `musica`
  - `compositor`
  - `interprete`
  - `caption_*`
  - `final_status`

## Regras
- publicar apenas videos aprovados
- usar numeracao sequencial `#1`, `#2`, `#3` ate `#50`
- a legenda deve falar da musica em uma linha e do autor ou do interprete em outra linha
- toda legenda deve incluir CTA para ouvir `Samba da Gabriela` nas plataformas
- cada plataforma deve receber CTA proprio de seguir ou inscrever-se
- o workflow deve ser unico e end-to-end
- o workflow nao depende de sub-workflow de publicacao
- nao inventar fatos
- marcar informacao nao confirmada como `a confirmar`
- manter estado fora da linha principal do video quando houver serie e sequencia

## Estrutura Minima Do Workflow
1. `Schedule Trigger`
2. `Google Sheets` ou `Data Table` - buscar candidatos
3. `State read` - ler numero atual da serie
4. `Code` - escolher o proximo item
5. `Google Drive` - baixar o video
6. `Code` - gerar legendas
7. `Publish routes`
7. `State update`
8. `Log append`

## Erros Observados
- a confirmar

## Log De Aprendizado
- data:
- erro:
- causa:
- correcao:
