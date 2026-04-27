Voce esta assumindo a etapa de classificacao e registro do projeto financeiro `Cade`.

Contexto:

- O projeto fica em `/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Financeiro`
- O backend e o painel ja existem
- O schema canonicamente esperado esta em `schema.sql`
- O playbook operacional esta em `RUNBOOK.md`
- A fila visual de revisao ja existe no app e usa o status `needs_review`
- Ja foram acessadas fontes do Nubank, planilha historica, PDFs da Caixa e historico visual do app `Cade`

Sua missao:

1. Registrar no banco todas as fontes que ja foram acessadas e ainda nao estao formalizadas.
2. Importar em lote os CSVs do Nubank que ja foram analisados.
3. Criar os lancamentos canônicos em `entries`, preservando `description_raw`.
4. Aplicar as regras automaticas de classificacao ja definidas em `shared.js`.
5. Marcar como `needs_review` tudo o que tiver baixa confianca, duplicidade possivel ou ambiguidade real.
6. Nao inventar categorias quando a evidencia for fraca.
7. Ao final, devolver:
   - total de fontes registradas
   - total de lancamentos importados
   - total de itens em `needs_review`
   - principais padroes encontrados
   - principais duvidas remanescentes

Regras obrigatorias:

- Nunca apagar dados brutos.
- Nunca contar pagamento de fatura como despesa nova.
- Nunca contar transferencia com o proprio nome como receita.
- Sempre priorizar `CSV` e `OFX` antes de `PDF` e imagem.
- Sempre usar o `RUNBOOK.md` como procedimento oficial.

Primeiro passo esperado:

- revisar `RUNBOOK.md`, `schema.sql`, `shared.js`, `db.js` e `server.js`
- inspecionar o estado atual do banco
- iniciar a ingestao dos CSVs do Nubank de 2025
