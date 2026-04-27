# Analise por sexo - Prova 1 (amostra parcial)

Data de referencia: 25/04/2026  
Amostra com notas lancadas: 11 estudantes  
Comparacao: `F` versus `M`  
Privacidade: sem nomes, somente estatistica agregada

## Base usada

- Fonte de sexo: `03_BASE_DE_DADOS/students.csv`
- Fonte de desempenho: lancamentos ja consolidados no `relatorio_prova_1.md`
- Escala da nota final: 0 a 10

Contagens por grupo na amostra:
- `F`: 7 estudantes
- `M`: 4 estudantes

## Estatisticas descritivas (nota final)

- Media `F`: 8,29
- Desvio-padrao `F`: 1,98
- Media `M`: 8,88
- Desvio-padrao `M`: 0,63
- Diferenca de medias (`F - M`): -0,59

## Testes de diferenca entre grupos

Teste t de Welch (duas caudas):
- `t = -0,727`
- `gl = 7,825`
- `p = 0,488`

Teste de Mann-Whitney (duas caudas):
- `U = 14,0`
- `p = 1,000`

Tamanho de efeito:
- Cohen `d = -0,356`
- Hedges `g = -0,326`

## Interpretacao

- Nao ha evidencia estatistica de diferenca significativa entre `F` e `M` nesta amostra parcial.
- A diferenca observada de medias e pequena a moderada em magnitude e instavel para inferencia forte, dado o `n` reduzido e desequilibrado entre grupos.
- O principal uso deste resultado agora e acompanhamento diagnostico, nao conclusao definitiva.

## Recomendacao tecnica

- Recalcular a analise quando todos os estudantes da turma tiverem nota lancada.
- Manter o mesmo protocolo (Welch + Mann-Whitney + tamanho de efeito) para comparabilidade.
