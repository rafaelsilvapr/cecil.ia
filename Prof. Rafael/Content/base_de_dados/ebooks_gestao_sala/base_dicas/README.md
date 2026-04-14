# Base de dicas - Gestao de sala de aula

Esta pasta e a planilha associada organizam a futura base de dicas, insights e ensinamentos para Reels, videos longos e proximos ebooks.

## Objetivo
- Guardar cada dica como um item independente.
- Classificar cada item por novidade, impacto, conforto para o professor e risco de clichê.
- Registrar as fontes que sustentam cada dica.

## Estrutura da planilha
- `Dicas`: 60 slots prontos para importar e classificar as dicas.
- `Fontes`: registro das fontes e corpus usados para sustentar cada item.
- `Criterios`: guia de leitura para pontuar as dicas.

## Forma mais conveniente de registrar
- Use a planilha como base principal, porque ela permite importar os 60 itens, pontuar cada um e depois filtrar os que vão compor os **~40 protocolos** do ebook (unidades de leitura; o livro tem **6 capítulos**).
- Registre cada dica como uma linha unica, sempre com `tip_texto` completo e com uma dor clara associada.
- Preencha primeiro `tema`, `subtema`, `dor_associada` e `fonte_principal`; depois feche `novidade`, `impacto`, `evidencia`, `conforto_publico` e `risco_cliche`.
- Use `status` para controlar o fluxo: `aguardando_importacao`, `importada`, `classificada`, `aprovada_para_livro` e `descartada`.
- No fim, classifique por `score_total` e selecione as 40 com melhor equilibrio entre impacto, evidencia e conforto para o publico.

## Como selecionar
- Priorize dicas com `impacto` alto e `evidencia` alta.
- Trate `novidade` como diferencial, nao como substituto de prova.
- So mantenha ideias com `risco_cliche` alto quando houver evidencias fortes e um mecanismo claro.
- Prefira termos que o professor realmente usa: `indisciplina`, `gestao de sala`, `rotina`, `autoridade`, `protocolos`, `scripts`, `primeiros 90 dias`.

## Sobre o relatorio do Gemini
- A base foi preparada para receber os 60 itens do relatorio compartilhado.
- O link compartilhado nao ficou acessivel de forma publica neste ambiente.
- Assim que o texto bruto for colado, exportado para CSV ou salvo em arquivo de texto, os slots podem ser preenchidos e classificados.

## Campos recomendados para a selecao das 40 dicas
- `slot_id`: identificador da dica.
- `tip_texto`: a dica em uma frase ou paragrafo curto.
- `tema` e `subtema`: organizacao editorial.
- `dor_associada`: dor docente que a dica resolve.
- `novidade_0a10`: quao original ela parece.
- `impacto_0a10`: quanta transformacao pratica entrega.
- `evidencia_0a10`: quao sustentada ela esta em livros, pesquisas ou experiencia valida.
- `conforto_publico_0a10`: quao bem ela dialoga com o professor real.
- `risco_cliche_0a10`: quao previsivel ou batida ela pode soar.
- `score_total`: soma ou ponderacao usada para priorizacao.
- `prioridade`: alta, media ou baixa.
- `uso_ideal`: capítulo do livro (1–6), protocolo específico, box, script, checklist, prompt, exemplo ou rotinas.
- `fonte_ids` e `trecho_prova`: rastreio da evidencia usada.

## Fontes iniciais ja registradas
- YouTube comment signals.
- Google Trends exports.
- Sales pages and copy texts.
- Market summary do projeto.
- Relatorio compartilhado do Gemini, pendente de importacao.
