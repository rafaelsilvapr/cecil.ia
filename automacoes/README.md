# Automacoes

Pasta base para padronizar cenarios do Make e workflows do n8n.

## Estrutura
- `_modelo/manifesto.md` - template comum para qualquer automacao.
- `_modelo/make.manifesto.md` - template focado em Make.
- `_modelo/n8n.manifesto.md` - template focado em n8n.

## Regra
- Cada automacao nova deve ganhar sua propria subpasta.
- O manifesto deve ser criado antes do JSON ou workflow.
- Contas e conexoes devem ser registradas em `operacao/contas_publicacao.md`.

## Convenção Sugerida
- `operacao/automacoes/<nome-da-automacao>/manifesto.md`
- `operacao/automacoes/<nome-da-automacao>/make.blueprint.json`
- `operacao/automacoes/<nome-da-automacao>/n8n.workflow.json`
- `operacao/automacoes/<nome-da-automacao>/notas.md`

