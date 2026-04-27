# Automacoes

Pasta base para padronizar cenarios do Make e workflows do n8n.

## Estrutura
- `_modelo/manifesto.md` - template comum para qualquer automacao.
- `_modelo/make.manifesto.md` - template focado em Make.
- `_modelo/n8n.manifesto.md` - template focado em n8n.
- `50_dias_de_musica/manifesto.md` - manifesto da serie enxuta de publicacao diaria no n8n.
- `50_dias_de_musica/indexacao_e_legendas.md` - regra de indexacao e preparo das legendas antes da publicacao.
- `50_dias_de_musica/n8n_workflow_draft.md` - desenho do workflow unico para a serie.
- `50_dias_de_musica/n8n.workflow.draft.json` - workflow JSON draft para importar e adaptar no n8n.
- `publicacao_diaria/estrutura_planilha.md` - desenho final da base operacional da publicacao diaria.
- `publicacao_diaria/migracao_planilha.md` - mapa campo a campo da planilha atual para a estrutura final.

## Regra
- Cada automacao nova deve ganhar sua propria subpasta.
- O manifesto deve ser criado antes do JSON ou workflow.
- Contas e conexoes devem ser registradas em `operacao/contas_publicacao.md`.

## Convencao Sugerida
- `operacao/automacoes/<nome-da-automacao>/manifesto.md`
- `operacao/automacoes/<nome-da-automacao>/make.blueprint.json`
- `operacao/automacoes/<nome-da-automacao>/n8n.workflow.json`
- `operacao/automacoes/<nome-da-automacao>/notas.md`
