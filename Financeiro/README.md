# Cadê

Protótipo inicial do assistente financeiro com backend real e banco SQLite local:

- painel web de gerenciamento
- inbox documental
- lançamentos normalizados
- persistência real em SQLite local
- exportação e importação em JSON
- base semente com os arquivos e a planilha já identificados

## Como abrir

Você pode servir a pasta com qualquer servidor estático.

Exemplo:

```bash
npm run dev
```

Depois abra `http://localhost:3000`.

## O que já está implementado

- visão executiva com saldo, receita, despesa e pendências
- fluxo arquitetural em etapas
- cadastro manual de documentos
- cadastro manual de lançamentos
- classificação automática por regras simples
- fila `needs_review` para documentos e lançamentos ambíguos
- histórico de base com snapshots e gráfico de barras
- exportação e importação de estado em JSON
- schema canônico expandido para ingestão e auditoria
- playbook operacional em `RUNBOOK.md`

## Próximo passo natural

- ligar OCR para PDFs e imagens
- importar a planilha `Finanças 2022` em lote
- sincronizar com Google Drive, Telegram ou Discord
- trocar o SQLite local por um banco PostgreSQL na nuvem quando for a hora do deploy
- automatizar deduplicação e reconciliação entre CSV, planilha, OFX e PDF
