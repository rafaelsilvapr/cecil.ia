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

## Camada de maturidade editorial
Nem toda ideia precisa nascer como protocolo fechado.

Use esta base como uma esteira com quatro niveis de maturidade:
- `dica`: insight curto, ainda solto, bom para testes de linguagem e sinal de mercado.
- `bloco_em_construcao`: conjunto de dicas e conceitos que ja apontam para um protocolo, mas ainda precisam de fusao, corte e ordenacao.
- `protocolo_candidato`: ideia que ja tem dor clara, mecanica pratica e evidencia suficiente para virar subcapitulo.
- `protocolo_fechado`: unidade pronta para o manuscrito, com titulo, seco, o que evitar, historia, caixa tecnica e referencias.

Essa separacao evita um erro comum: forcar uma dica boa demais a virar protocolo antes da hora, ou deixar um protocolo pronto preso numa pasta de ideias soltas.

## Forma mais conveniente de registrar
- Use a planilha como base principal, porque ela permite importar os 60 itens, pontuar cada um e depois filtrar os que vão compor os **~40 protocolos** do ebook (unidades de leitura; o livro tem **6 capítulos**).
- Registre cada dica como uma linha unica, sempre com `tip_texto` completo e com uma dor clara associada.
- Preencha primeiro `tema`, `subtema`, `dor_associada` e `fonte_principal`; depois feche `novidade`, `impacto`, `evidencia`, `conforto_publico` e `risco_cliche`.
- Use `status` para controlar o fluxo: `aguardando_importacao`, `importada`, `classificada`, `aprovada_para_livro` e `descartada`.
- No fim, classifique por `score_total` e selecione as 40 com melhor equilibrio entre impacto, evidencia e conforto para o publico.

### Campo extra recomendado
- `maturidade`: `dica`, `bloco_em_construcao`, `protocolo_candidato` ou `protocolo_fechado`.
- `protocolo_origem`: numero ou nome do protocolo ao qual a dica se conecta.
- `arquivos_relacionados`: lista de notas, caixas tecnicas ou manuscritos ligados a essa ideia.
- `fontes_sustentacao`: lista curta de autores, estudos, livros ou bases de dados que sustentam a ação.
- `indice_confianca`: leitura editorial da força da evidência e da estabilidade da ideia.

## Como selecionar
- Priorize dicas com `impacto` alto e `evidencia` alta.
- Trate `novidade` como diferencial, nao como substituto de prova.
- So mantenha ideias com `risco_cliche` alto quando houver evidencias fortes e um mecanismo claro.
- Prefira termos que o professor realmente usa: `indisciplina`, `gestao de sala`, `rotina`, `autoridade`, `protocolos`, `scripts`, `primeiros 90 dias`.

## Como cruzar evidencia e escrita
- Cada dica pode apontar para mais de um protocolo, mas o manuscrito precisa escolher um destino principal.
- Cada protocolo fechado pode receber varias dicas como base de apoio, sem precisar absorver tudo no texto principal.
- A referencia cientifica deve morar em um campo proprio ou em nota de apoio, nao misturada ao corpo da dica.
- Quando a evidencia estiver fraca ou dispersa, a ideia continua como dica ou bloco em construcao.
- Quando houver mecanismo pratico claro, repetibilidade e boa correspondencia com a dor, a ideia sobe para protocolo candidato.
- Quando a escrita ja tiver sequencia operacional, exemplo, erro comum e sustentacao, a ideia vira protocolo fechado.

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

## Notas associadas
- [Camada de maturidade entre dica e protocolo](camada_maturidade_protocolo_dica.md)
- [Templates da base de dicas](templates/README.md)
- [Brainstorm do ebook](brainstorm/README.md)

## Templates prontos
- [Template de dica](templates/template_dica.md)
- [Template de bloco em construcao](templates/template_bloco_em_construcao.md)
- [Template de protocolo candidato](templates/template_protocolo_candidato.md)
- [Template de caixa tecnica](templates/template_caixa_tecnica.md)
- [Template de referencia](templates/template_referencia.md)
