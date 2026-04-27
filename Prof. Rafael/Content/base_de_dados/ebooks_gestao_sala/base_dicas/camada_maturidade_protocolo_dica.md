---
tipo: nota_estrutural
status: rascunho
tema: "Maturidade entre dica e protocolo"
---

# Camada de maturidade entre dica e protocolo

## Ideia central

A base precisa aceitar ideias em diferentes graus de fechamento.
Nem toda boa ideia deve virar protocolo imediatamente.
Nem todo protocolo precisa continuar preso como dica solta.

## Niveis propostos

### 1. Dica
- Insight curto
- Funciona bem para capturar linguagem, dor e promessa
- Ainda pode estar incompleto ou misturado com intuição de campo

### 2. Bloco em construcao
- Conjunto de dicas relacionadas por tema
- Ja mostra uma mecanica recorrente
- Precisa de fusao, corte e ordenacao editorial

### 3. Protocolo candidato
- Dor clara
- Mecanica pratica bem definida
- Sustentacao suficiente para começar a virar subcapitulo

### 4. Protocolo fechado
- Unidade pronta para o manuscrito
- Tem secao seca, o que evitar, historia, box tecnico e impacto
- Pode receber referencias consolidadas sem mudar de forma a cada revisao

## Viabilidade pratica no Obsidian

O modelo e viavel porque o Obsidian lida bem com:
- notas pequenas e independentes
- backlinks entre ideias
- tags e propriedades em frontmatter
- cruzamento manual entre fontes, protocolos e caixas tecnicas

O ganho principal e evitar confusao entre:
- ideia boa
- ideia testada
- ideia escrita
- ideia publicada

## Proposta de metadados para cada nota

```yaml
tipo: dica | protocolo | caixa_tecnica | nota_estrutural
maturidade: dica | bloco_em_construcao | protocolo_candidato | protocolo_fechado
tema: ""
subtema: ""
dor_associada: ""
protocolo_origem: ""
status: rascunho | classificada | aprovada_para_livro | descartada
fontes_sustentacao: []
arquivos_relacionados: []
indice_confianca: baixa | media | alta
```

## Regra editorial sugerida

- Se a ideia ajuda a testar linguagem, ela entra como dica.
- Se a ideia ja pede fusao com outras ideias, ela entra como bloco em construcao.
- Se a ideia tem dor, mecanismo e repetibilidade, ela sobe para protocolo candidato.
- Se a ideia ja tem forma fechada de escrita, ela entra como protocolo fechado.

## Problemas previsiveis

- Misturar dica e protocolo no mesmo nivel de hierarquia vai gerar ruido.
- Forcar evidencia unica para toda ideia pode atrasar prototipagem editorial.
- Permitir que um protocolo fechado continue recebendo alteracoes soltas vai quebrar a estabilidade do manuscrito.
- Manter referencias cientificas apenas na narrativa principal pode dificultar rastreio posterior.

## Solucao sugerida

- Dicas vivem na base de captura.
- Protocolos vivem no manuscrito.
- Pontes entre os dois vivem em campos de metadados e em notas de apoio.
- A evidência vive em campos próprios e em referências consolidadas.

