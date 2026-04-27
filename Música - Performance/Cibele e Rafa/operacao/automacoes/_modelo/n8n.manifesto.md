# Manifesto n8n

## Dados Basicos
- nome_do_workflow: `a confirmar`
- objetivo: `a confirmar`
- tipo_de_disparo: `cron` | `webhook` | `manual`
- timezone: `America/Sao_Paulo`

## Estrutura Recomendada
1. Trigger
2. Set / Code de normalizacao
3. Leitura de estado
4. Selecao do item
5. Geracao de legenda
6. Publicacao
7. Persistencia e log

## Regras n8n
- credenciais ficam no sistema, nao no json
- expressao deve ser legivel e curta
- nodes devem ter nomes estaveis
- usar branches explicitas para erro e sucesso
- guardar estado fora do fluxo quando houver ciclo

## Campos Que Costumam Quebrar
- credentials
- connections
- expressions
- pinned data
- node names
- item paths

## Checklist
- workflow importou
- credenciais ligadas
- cron configurado
- branches validadas
- estado persistido
- execucao de teste feita

