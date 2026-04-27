# Scripts

Este folder vai guardar utilitarios e automacoes da operacao.

## Objetivo
- selecionar trechos de video
- organizar banco de clips
- gerar apoio para legendas
- exportar ou validar setlists
- automatizar tarefas repetitivas sem perder rastreio

## Convencoes
- um script, uma responsabilidade
- nome descritivo
- entradas previsiveis
- saida em `outputs/<YYYY-MM-DD>/`
- nada de segredo hardcoded

## Estrutura Sugerida
- `video/`
- `repertorio/`
- `legendas/`
- `util/`

## Regra De Qualidade
Todo script precisa dizer:
- o que le
- o que gera
- onde salva
- como recuperar o resultado
