# Runbook de Ingestao Financeira

## Objetivo

Transformar as fontes ja acessadas em uma base financeira unica, auditavel e pronta para analise.

## Escopo ja conhecido

- 16 e-mails do Nubank com anexos `CSV`, `PDF` e `OFX`
- Planilha `Financas 2022`
- PDFs bancarios e contratuais da Caixa
- Historico visual do app `Cade`
- Regras operacionais ja aprendidas para `Pix`, `fatura`, `transferencia interna` e `transporte`

## Regras de seguranca operacional

- Nunca apagar dado bruto.
- Nunca sobrescrever `description_raw`.
- Nunca classificar `pagamento de fatura` como gasto novo.
- Nunca classificar transferencia com o proprio nome do titular como receita nova.
- Sempre registrar a fonte antes do lancamento.
- Sempre marcar `needs_review` quando a confianca for baixa ou houver conflito entre fontes.
- Sempre preferir `CSV` e `OFX` antes de `PDF` e imagem.

## Ordem obrigatoria de execucao

1. Registrar as fontes no inventario documental.
2. Importar os `CSV` do Nubank para `entries`.
3. Aplicar classificacao automatica inicial.
4. Enviar duvidas para a fila `needs_review`.
5. Importar a planilha historica.
6. Detectar duplicidades entre planilha e extratos.
7. Registrar `OFX` e `PDF` como validacao e suporte documental.
8. Gerar fechamento mensal.

## Passo 1. Inventario de fontes

Para cada documento ou lote de e-mail, preencher:

- `title`
- `kind`
- `source`
- `source_type`
- `source_origin`
- `date_range_start`
- `date_range_end`
- `account`
- `status`
- `filename`
- `note`

Padrao recomendado:

- `source_type`: `gmail_csv`, `gmail_pdf`, `gmail_ofx`, `sheet`, `pdf_local`, `image_local`
- `status`: `imported`, `reviewed`, `needs_review`

## Passo 2. Importacao de CSV do Nubank

Para cada anexo `CSV`:

1. Criar ou localizar um `document` da mesma competencia.
2. Inserir cada linha do CSV em `entries`.
3. Preencher:
   - `source_id`
   - `external_id`
   - `date`
   - `description`
   - `description_raw`
   - `direction`
   - `amount`
   - `payment_method`
   - `merchant_or_counterparty`
   - `review_status`

Regras:

- primeira carga entra como `reviewed` apenas se a regra for muito forte
- caso contrario entra como `imported` ou `needs_review`

## Passo 3. Classificacao automatica

Aplicar as regras compartilhadas do projeto em `shared.js`.

Classificacoes ja autorizadas:

- `Pagamento de fatura` -> `Cartao de credito / Pagamento de fatura`
- `Aplicacao RDB` -> `Investimento / Aplicacao`
- `Resgate RDB` -> `Investimento / Resgate`
- `Resgate de emprestimo` -> `Emprestimo / Entrada`
- transferencia com o proprio nome -> `Transferencia interna`
- `Pix` ou `transferencia` de ate `R$ 30` com perfil de corrida -> `Transporte / Cade / corrida`
- valor `R$ 0,00` com cancelamento -> `Transporte / Cade / cancelada`
- termos como `onibus`, `passagem` -> `Transporte / Onibus`

Campos a preencher no lancamento:

- `category`
- `subcategory`
- `confidence`
- `is_internal_transfer`
- `is_card_payment`
- `is_investment_movement`
- `is_loan_movement`

## Passo 4. Fila needs_review

Enviar para `needs_review` quando ocorrer qualquer um destes casos:

- descricao generica
- confianca baixa
- possivel duplicidade
- Pix pequeno sem contexto suficiente
- pagamento de fatura sem reconciliacao
- documento contratual com valor ambiguo
- entrada que pode ser receita, transferencia interna ou emprestimo

Cada item em revisao deve ter `notes` explicando:

- por que esta em duvida
- qual a hipotese principal
- qual a proxima verificacao necessaria

## Passo 5. Importacao da planilha historica

Usar a planilha como `baseline`, nao como verdade absoluta.

Para cada aba importada:

- registrar a aba de origem em `notes`
- preservar a granularidade original
- comparar com extratos antes de consolidar

## Passo 6. Duplicidade e reconciliacao

Marcar `possible_duplicate = 1` quando houver combinacao proxima de:

- mesma data
- mesmo valor
- mesma descricao ou contraparte parecida
- mesma competencia

Nao apagar automaticamente. Apenas sinalizar para revisao.

## Passo 7. OFX e PDF

Uso recomendado:

- `OFX`: validacao e enriquecimento de identificadores
- `PDF`: evidencia documental e extração complementar

Documentos contratuais da Caixa entram como:

- fonte documental
- evento de divida
- saldo, parcela ou obrigacao

Nunca como gasto simples sem leitura contextual.

## Passo 8. Fechamento mensal minimo

Gerar por mes:

- receita real
- despesa real
- total de `Cade`
- total de cartao
- total de transferencias internas
- total de itens `needs_review`

## Checklist de pronto

- todas as fontes acessadas cadastradas em `documents`
- todos os CSVs do Nubank importados
- classificacao automatica aplicada
- fila `needs_review` populada com motivos
- duplicidades sinalizadas
- fechamento mensal disponivel

## Atalhos para agentes menos inteligentes

- Comece sempre por `CSV`.
- Se houver duvida, use `needs_review`.
- Se ler `fatura`, nao trate como compra.
- Se ler o nome do proprio titular, suspeite de transferencia interna.
- Se ler `Pix` pequeno de transporte urbano, suspeite de `Cade`.
- Se o documento for contrato, nao lance como despesa sem confirmar contexto.
