# Roadmap de Automações — Professor Rafael

**Última atualização:** 2026-04-11  
**Status:** Draft para feedback do Rafael

---

## Objetivo

Documentar oportunidades de automação identificadas na arquitetura do sistema Professor Rafael, priorizadas por impacto, complexidade e dependências. Cada automação deve deixar artefatos na pasta para que Antigravity, Codex e Claude possam trabalhar em paralelo.

---

## 1. PIPELINE ORQUESTRADO — Fluxo ponta a ponta de produção

### Descrição
Um script ou workflow que encadeia automaticamente: pergunta selecionada → geração de títulos/thumbnails → brief criado → roteiro pré-preenchido → pasta da publicação estruturada → registro na tabela de controle.

### Impacto
**Alto.** Elimina ação manual em 6 passos. Economia: ~2h por vídeo.

### Complexidade
**Média.** Requer: leitura do banco de perguntas, templates de brief, templates de roteiro, integração com tabela de controle.

### Entradas obrigatórias
- `Content/base_de_dados/banco_de_perguntas_da_audiencia.md`
- Template de brief (criar em novo arquivo)
- Template de roteiro (criar em novo arquivo)
- Tabela de controle (`Content/00_direcao/tabela_controle_publicacoes_professor_rafael.xlsx`)
- Biblioteca de séries (`Content/00_direcao/biblioteca_de_series_youtube_professor_rafael.md`)

### Saídas esperadas
- Pasta nova criada em `Content/Publicacoes/{plataforma}/{formato}/{id_publicacao}/`
- Arquivos preenchidos: `brief.md`, `roteiro.md` (em draft), `README.md`
- Tabela de controle atualizada com nova linha

### Dependências
- Nenhuma — pode rodar standalone

### Prioridade
🔴 **P0** — Viabiliza toda a cadeia de produção

### Próximos passos
1. Criar templates de brief e roteiro em novo arquivo `Content/00_direcao/templates_producao.md`
2. Escrever script `Content/scripts/orchestrate_publication_workflow.py`
3. Testar com 1 pergunta do banco

### Nota técnica
Usar Python + OpenPyXL para manipular tabela de controle. Considerar argparse para aceitar parâmetros (pergunta_id, plataforma, formato).

---

## 2. CALENDÁRIO EDITORIAL AUTOMATIZADO

### Descrição
Ler tabela de controle e gerar automaticamente um calendário visual das próximas semanas baseado em: data de publicação planejada, backlog priorizado, dependências (ex: um master video deve sair antes dos shorts).

### Impacto
**Alto.** Elimina ação manual de planejamento. Oferece visibilidade do cronograma.

### Complexidade
**Baixa.** Requer: leitura de tabela, sorting, formatação de saída.

### Entradas obrigatórias
- Tabela de controle com coluna "data_publicacao_planejada"
- Tabela de controle com coluna "tipo" (master, derivado)

### Saídas esperadas
- Arquivo `Content/Calendario/calendario_editorial_2026_04.md` (atualizado automaticamente)
- Ou planilha `Content/Calendario/calendario_editorial_2026_04.xlsx`
- Formato: semana | publicação | formato | status | dependências

### Dependências
- Requer que tabela de controle esteja sempre atualizada

### Prioridade
🟡 **P1** — Viabiliza visibilidade operacional

### Próximos passos
1. Adicionar coluna "data_publicacao_planejada" na tabela de controle atual
2. Escrever script `Content/scripts/generate_editorial_calendar.py`
3. Rodar script semanalmente ou ao atualizar tabela

### Nota técnica
Pode ser simples com pandas + markdown, ou mais visual com plotly. Considerar integração com Google Calendar API se desejável.

---

## 3. DERIVAÇÃO AUTOMÁTICA — Briefs dos formatos secundários

### Descrição
Quando um vídeo-mestre é marcado como "concluído" na tabela de controle, um script gera automaticamente os briefs dos shorts, do carrossel e do corte LinkedIn, pré-preenchidos com base no roteiro e nas regras específicas de cada formato.

### Impacto
**Alto.** Shorts + carrossel + LinkedIn = 3-4 horas de trabalho manual. Automação economiza ~70% disso.

### Complexidade
**Média-Alta.** Requer: parsing do roteiro do master, aplicação de regras de formato (estrutura do carrossel, regra de "tese prática opcional", etc), geração de briefs.

### Entradas obrigatórias
- Roteiro do vídeo-mestre (`Publicacoes/{...}/roteiro.md`)
- Regras de formato (carrossel, shorts, LinkedIn) — documentadas em `Content/00_direcao/guia_producao_carrosseis_professor_rafael.md` e similares
- Gerador de briefs que aplique essas regras

### Saídas esperadas
- `Publicacoes/YouTube/Shorts/brief_short_01.md` (automático)
- `Publicacoes/Instagram/Carrosseis/brief_carrossel.md` (automático)
- `Publicacoes/LinkedIn/brief_corte.md` (automático)
- Cada um com seção "Gerado automaticamente do vídeo-mestre: {id_publicacao}"

### Dependências
- Depende do Pipeline Orquestrado (que cria estrutura base)
- Depende de roteiro bem-formado no vídeo-mestre

### Prioridade
🟡 **P1** — Viabiliza produção em volume

### Próximos passos
1. Documentar regras de extração em `Content/00_direcao/REGRAS_DERIVACAO.md`
2. Escrever script `Content/scripts/auto_generate_derivative_briefs.py`
3. Testar com 1 vídeo-mestre concluído

### Nota técnica
Pode usar regex + templates Jinja2 para aplicar regras de formato. Ou usar Claude API se quiser inteligência mais sofisticada na extração.

---

## 4. COLETA DE INTELIGÊNCIA PERIÓDICA — APIs de plataformas

### Descrição
Conectar YouTube Data API e Google Trends API para alimentar automaticamente o histórico de análises com dados frescos: comentários novos de vídeos, tendências de busca, padrões de consumo.

### Impacto
**Médio.** Reduz tempo de pesquisa manual. Incrementa qualidade do histórico de análises.

### Complexidade
**Alta.** Requer: configuração de credenciais, integração com APIs (YouTube OAuth, Google Trends), parsing de respostas, registro estruturado no markdown.

### Entradas obrigatórias
- YouTube API credentials (requer projeto GCP)
- Google Trends key (requer conta Google)
- IDs dos vídeos do YouTube (já estão na tabela de controle?)

### Saídas esperadas
- Nova entrada em `Content/base_de_dados/historico_de_analises_base_de_dados.md` rodando diariamente ou semanalmente
- Formato: Data | Fonte (YouTube API / Google Trends) | Dado coletado | Padrão observado | Hipótese

### Dependências
- Requer que vídeos estejam já publicados e tenham métricas
- Requer credenciais GCP (que você já tem configuradas na pasta)

### Prioridade
🟡 **P2** — Nice-to-have; melhora decisões mas não bloqueia produção

### Próximos passos
1. Criar arquivo `Content/scripts/credentials/.env.example` documentando que precisa de YouTube API key
2. Escrever script `Content/scripts/collect_youtube_analytics.py`
3. Escrever script `Content/scripts/collect_google_trends.py`
4. Criar scheduler (cron ou APScheduler) para rodar diariamente

### Nota técnica
Google Cloud SDK já está na raiz da pasta. Usar `google-api-python-client`. Para Google Trends, considerar `pytrends` ou `google_trends_api`.

---

## 5. SINGLE SOURCE OF TRUTH — Conceitos centrais

### Descrição
Conceitos repetidos (frase-núcleo, pilares, frame) vivem em um único arquivo canonical `CORE_BRAND.md` e são referenciados pelos demais documentos, eliminando risco de dessincronia.

### Impacto
**Médio.** Reduz risco de inconsistência. Facilita atualizações futuras.

### Complexidade
**Baixa.** Requer: refatoração documental, criação de arquivo único.

### Entradas obrigatórias
- Extração das definições existentes de: documento_guia, frame, agente_diretor, estrutura_do_eixo

### Saídas esperadas
- Novo arquivo `Content/00_direcao/CORE_BRAND.md` com estrutura:
  - Frase-núcleo
  - Missão
  - Pilares
  - Públicos
  - Dores
  - Promessa central
  - Levers
  - Regra editorial central
- Todos os demais arquivos atualizados com referências: "Ver CORE_BRAND.md > Seção X"

### Dependências
- Nenhuma

### Prioridade
🟢 **P3** — Limpeza técnica; melhora manutenibilidade

### Próximos passos
1. Criar `Content/00_direcao/CORE_BRAND.md` com conteúdo consolidado
2. Atualizar documento_guia, frame, agente_diretor com referências
3. Testar que não houve perda de informação

### Nota técnica
Simples refatoração. Usar comentário no topo dos arquivos referenciadores: "⚠️ Conceitos centrais definidos em CORE_BRAND.md — não editar aqui"

---

## 6. VERSIONAMENTO E CHANGELOG

### Descrição
Documentos "vivos" atualmente não têm histórico visível. Criar um changelog que registre toda mudança em archivos de direção com data, autor, o quê mudou e por quê.

### Impacto
**Baixo-Médio.** Melhora rastreabilidade. Facilita review de mudanças. Evita perda de contexto.

### Complexidade
**Baixa.** Requer: arquivo novo, disciplina de registro.

### Entradas obrigatórias
- Nenhuma

### Saídas esperadas
- Arquivo `Content/00_direcao/CHANGELOG.md` com formato:
  ```
  ## [2026-04-11] — Consolidação de roadmap
  - **Arquivo**: documento_guia_professor_rafael.md
  - **Mudança**: Adicionado referência a CORE_BRAND.md (P3)
  - **Motivo**: Eliminar duplicação de conceitos
  - **Autor**: Claude/Rafael
  ```

### Dependências
- Nenhuma

### Prioridade
🟢 **P3** — Boa prática de governança

### Próximos passos
1. Criar `Content/00_direcao/CHANGELOG.md`
2. Adicionar entrada retrospectiva para cada mudança conhecida
3. Disciplina: toda mudança em arquivos de direção deve ser registrada aqui

### Nota técnica
Simples markdown + disciplina. Considerar front-matter YAML se quiser adicionar filtros futuros.

---

## 7. LIMPEZA DE LEGADO

### Descrição
Avaliar `Bkp_Fase3_Antigos/` e `Textos de referencia/` — se não são mais usados, arquivar ou deletar para reduzir ruído cognitivo.

### Impacto
**Baixo.** Melhora clareza de navegação.

### Complexidade
**Muito Baixa.** Requer: decisão humana + ação de arquivo/delete.

### Entradas obrigatórias
- Que você diga se esses arquivos ainda são relevantes

### Saídas esperadas
- Se irrelevante: criar pasta `Content/00_direcao/ARQUIVADO_2026_04/` e mover lá
- Se relevante: documentar propósito em `README.md` da pasta

### Dependências
- Nenhuma

### Prioridade
🟢 **P3** — Nice-to-have

### Próximos passos
1. Você revisar essas pastas e comunicar status
2. Mover ou deletar conforme decidido

---

## MATRIZ DE PRIORIZAÇÃO

| Automação | Impacto | Complexidade | Economia de tempo | Prioridade | Sequência |
|-----------|---------|--------------|-------------------|-----------|-----------|
| Pipeline Orquestrado | Alto | Média | ~2h/video | P0 | 1º |
| Derivação Automática | Alto | Média-Alta | ~3h/video | P1 | 2º (depende de P0) |
| Calendário Editorial | Alto | Baixa | ~1h/semana | P1 | 2º (independente) |
| Coleta de Inteligência | Médio | Alta | ~3h/semana | P2 | 3º |
| SSOT (Core Brand) | Médio | Baixa | ~30min | P3 | 4º |
| Versionamento | Baixo | Baixa | ~10min/mudança | P3 | 4º |
| Limpeza Legado | Baixo | Muito Baixa | ~30min | P3 | 4º |

---

## COMO USAR ESTE ROADMAP

### Para você (Rafael)
- Revise a priorização. Ajuste se desejar.
- Comunique qual ordem deseja executar.
- Forneça contexto faltante (ex: YouTube API está configurado?)

### Para Antigravity / Codex
- Leia uma automação de cada vez.
- Implemente o script conforme especificado.
- Deixe artefatos (código, testes, docs) na pasta.
- Atualize este roadmap quando terminar (mude status para ✅).

### Para Claude (em futuras sessões)
- Consulte este roadmap antes de codificar.
- Referencie a seção relevante quando começar.
- Atualize status e próximos passos após completar.

---

## TEMPLATE DE STATUS

Quando iniciar uma automação, atualize o roadmap assim:

```markdown
## X. AUTOMAÇÃO NOME

### Status
- ✅ Especificação finalizada
- 🚧 Em implementação (Antigravity, iniciado 2026-04-12)
- ⏳ Aguardando (código aguardando integração com X)
- ❌ Bloqueado (razão: X)
```

---

## Notas Finais

- Este roadmap é **living document**. Atualize conforme novas oportunidades surgem.
- Cada automação deve deixar **código e documentação reutilizáveis** na pasta.
- Favor sempre testar com dados reais antes de considerar "concluído".
- Se uma automação ficar bloqueada, abra uma seção "Bloqueadores" explicando por quê.

---

**Próximo encontro:** Rever este roadmap e priorizar P0 (Pipeline Orquestrado).
