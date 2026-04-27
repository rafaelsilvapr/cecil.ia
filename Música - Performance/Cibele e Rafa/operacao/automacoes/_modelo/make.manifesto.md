# Manifesto Make

## Dados Basicos
- nome_do_scenario: `a confirmar`
- objetivo: `a confirmar`
- timezone: `America/Sao_Paulo`
- tipo: `scheduler` | `webhook` | `manual`

## Estrutura Recomendada
1. gatilho
2. leitura de estado
3. selecao/roteamento
4. geracao de texto
5. publicacao
6. update de status
7. persistencia de ciclo/log

## Regras Make
- usar blueprint exportavel, nao JSON especulativo
- evitar depender de label humano como id interno
- manter ciclo em Data Store ou planilha auxiliar
- separar captions por plataforma
- guardar conexoes e ids fora do corpo principal quando possivel

## Campos Que Costumam Quebrar
- `module`
- `version`
- `__IMTCONN__`
- `mapper`
- `metadata`
- `rowNumber`
- `sheetId`

## Checklist
- blueprint importou
- conexoes remapeadas
- scheduler ativo
- ciclo persistido
- status padronizado
- teste com 1 item executado

