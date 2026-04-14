# Automações — Status & Rastreamento

**Última atualização:** 2026-04-11  
**Atualizado por:** Claude

---

## Dashboard de Status

| # | Automação | Prioridade | Status | Implementador | Conclusão Estimada | % Completo |
|---|-----------|-----------|--------|---------------|-------------------|-----------|
| 0 | Pipeline Orquestrado | 🔴 P0 | 📋 Especificado | — | 2026-04-25 | 5% |
| 1 | Derivação Automática | 🟡 P1 | 📋 Especificado | — | 2026-05-09 | 5% |
| 2 | Calendário Editorial | 🟡 P1 | 📋 Especificado | — | 2026-04-30 | 5% |
| 3 | Coleta de Inteligência | 🟡 P2 | 📋 Especificado | — | 2026-05-16 | 5% |
| 4 | SSOT (Core Brand) | 🟢 P3 | 📋 Especificado | — | 2026-05-01 | 5% |
| 5 | Versionamento | 🟢 P3 | 📋 Especificado | — | 2026-05-01 | 5% |
| 6 | Limpeza Legado | 🟢 P3 | ⏳ Aguardando decisão Rafael | — | — | 0% |

---

## Legenda de Status

| Status | Significado |
|--------|-------------|
| 📋 **Especificado** | Está documentado em ROADMAP, aguardando implementação |
| 🚧 **Em preparação** | Você está criando templates/estrutura antes de delegar |
| 👷 **Em implementação** | IDE está codificando |
| 🔍 **Em validação** | Código pronto, aguardando seu feedback |
| ✅ **Concluído** | Implementado, testado, integrado |
| ⏳ **Bloqueado** | Aguardando algo externo (decisão, API, etc) |

---

## Detalhes por Automação

### 0️⃣ Pipeline Orquestrado — Status: 📋 Especificado

**Descrição:** Fluxo ponta a ponta que automatiza produção de conteúdo
**Prioridade:** 🔴 P0 (bloqueador das demais)
**Impacto:** ~2h de trabalho manual por vídeo

#### Próximos passos imediatos:
- [ ] **Você:** Criar templates em `Content/scripts/templates/`
  - brief_template.md
  - roteiro_template.md
- [ ] **Você:** Criar `Content/00_direcao/templates_producao.md` documentando templates
- [ ] **Antigravity:** Implementar `orchestrate_publication_workflow.py`
- [ ] **Você:** Validar com 1 publicação real

#### Bloqueadores:
Nenhum no momento. Pronto para começar.

#### Links relevantes:
- Spec detalhada: [ROADMAP_AUTOMACOES_2026.md#1-pipeline-orquestrado](ROADMAP_AUTOMACOES_2026.md)
- Guia de implementação: [GUIA_INTEGRACAO_ANTIGRAVITY_CODEX.md#11-exemplo-completo](GUIA_INTEGRACAO_ANTIGRAVITY_CODEX.md)

---

### 1️⃣ Derivação Automática — Status: 📋 Especificado

**Descrição:** Gera automaticamente briefs de shorts, carrossel e LinkedIn a partir do master
**Prioridade:** 🟡 P1 (depende de P0)
**Impacto:** ~3h de trabalho manual por vídeo
**Dependência:** Pipeline Orquestrado (P0) deve estar funcionando primeiro

#### Próximos passos imediatos:
- [ ] **Você:** Confirmar que P0 está funcionando
- [ ] **Você:** Criar `Content/00_direcao/REGRAS_DERIVACAO.md` documentando regras de cada formato
- [ ] **Codex:** Implementar `auto_generate_derivative_briefs.py`
- [ ] **Você:** Validar com 1 publicação real

#### Bloqueadores:
🚧 Aguardando P0 ser implementado

#### Links relevantes:
- Spec detalhada: [ROADMAP_AUTOMACOES_2026.md#3-derivação-automática](ROADMAP_AUTOMACOES_2026.md)
- Regras de formato: [guia_producao_carrosseis_professor_rafael.md](guia_producao_carrosseis_professor_rafael.md)

---

### 2️⃣ Calendário Editorial Automatizado — Status: 📋 Especificado

**Descrição:** Gera automaticamente calendário das próximas semanas a partir da tabela de controle
**Prioridade:** 🟡 P1 (independente)
**Impacto:** ~1h de trabalho manual por semana
**Dependência:** Nenhuma — pode rodar independentemente

#### Próximos passos imediatos:
- [ ] **Você:** Adicionar coluna "data_publicacao_planejada" na tabela de controle (se não existir)
- [ ] **Codex:** Implementar `generate_editorial_calendar.py`
- [ ] **Você:** Validar calendário gerado

#### Bloqueadores:
Nenhum. Pronto para começar.

#### Links relevantes:
- Spec detalhada: [ROADMAP_AUTOMACOES_2026.md#2-calendário-editorial](ROADMAP_AUTOMACOES_2026.md)

---

### 3️⃣ Coleta de Inteligência Periódica — Status: 📋 Especificado

**Descrição:** Integra YouTube API e Google Trends para alimentar análises automaticamente
**Prioridade:** 🟡 P2 (nice-to-have)
**Impacto:** ~3h de pesquisa manual por semana
**Dependência:** Nenhuma (mas requer credenciais GCP)

#### Próximos passos imediatos:
- [ ] **Você:** Confirmar que YouTube API está configurada (projeto adk-488113 existe?)
- [ ] **Antigravity:** Implementar `collect_youtube_analytics.py`
- [ ] **Antigravity:** Implementar `collect_google_trends.py`
- [ ] **Você:** Validar dados coletados

#### Bloqueadores:
⏳ Aguardando confirmação de credenciais GCP

#### Links relevantes:
- Spec detalhada: [ROADMAP_AUTOMACOES_2026.md#4-coleta-de-inteligência](ROADMAP_AUTOMACOES_2026.md)
- Google Cloud SDK: Já existe em raiz da pasta

---

### 4️⃣ Single Source of Truth (Core Brand) — Status: 📋 Especificado

**Descrição:** Consolidar frase-núcleo, pilares e frame em um arquivo único `CORE_BRAND.md`
**Prioridade:** 🟢 P3 (limpeza técnica)
**Impacto:** Reduz risco de inconsistência futura
**Dependência:** Nenhuma

#### Próximos passos imediatos:
- [ ] **Você:** Criar `CORE_BRAND.md` consolidando conceitos existentes
- [ ] **Claude:** Atualizar documento_guia, frame, agente_diretor com referências
- [ ] **Você:** Validar que nenhuma informação foi perdida

#### Bloqueadores:
Nenhum.

#### Links relevantes:
- Spec detalhada: [ROADMAP_AUTOMACOES_2026.md#5-single-source-of-truth](ROADMAP_AUTOMACOES_2026.md)

---

### 5️⃣ Versionamento e Changelog — Status: 📋 Especificado

**Descrição:** Criar registro estruturado de mudanças em documentos de direção
**Prioridade:** 🟢 P3 (boa prática)
**Impacto:** Rastreabilidade, facilita reviews
**Dependência:** Nenhuma

#### Próximos passos imediatos:
- [ ] **Você:** Criar `CHANGELOG.md` com entradas retrospectivas
- [ ] **Disciplina:** Toda mudança em arquivos de direção → entrada no CHANGELOG

#### Bloqueadores:
Nenhum.

#### Links relevantes:
- Spec detalhada: [ROADMAP_AUTOMACOES_2026.md#6-versionamento-e-changelog](ROADMAP_AUTOMACOES_2026.md)

---

### 6️⃣ Limpeza de Legado — Status: ⏳ Aguardando Decisão

**Descrição:** Avaliar e arquivar/deletar `Bkp_Fase3_Antigos/` e `Textos de referencia/`
**Prioridade:** 🟢 P3 (manutenção)
**Impacto:** Melhora clareza de navegação

#### Próximos passos imediatos:
- [ ] **Rafael:** Decidir: ainda precisa desses arquivos? Se sim, por quê? Se não, arquivar ou deletar?
- [ ] **Ação:** Conforme sua decisão

#### Bloqueadores:
⏳ Aguardando sua decisão sobre esses arquivos

---

## Timeline Estimada

```
Semana 1 (11-15 abr)    → P0 preparação + Calendário (P1 simples)
Semana 2 (18-22 abr)    → P0 implementação (Antigravity)
Semana 3 (25-29 abr)    → P0 validação + P1 derivação prep
Semana 4 (02-06 mai)    → P1 implementação (Codex) + P3 limpeza
Semana 5+ (09+ mai)     → P2 (inteligência) + Ajustes
```

---

## Como Atualizar Este Arquivo

### Quando você inicia trabalho em uma automação:
```markdown
## Xº NOME — Status: 🚧 Em preparação

**Implementador:** [Nome IDE]
**Iniciado em:** 2026-04-12
```

### Quando avança para implementação:
```markdown
## Xº NOME — Status: 👷 Em implementação

**Implementador:** [Nome IDE]
**Branch/Commit:** [Link para código]
**Bloqueadores:** [Se houver]
```

### Quando está pronto para validação:
```markdown
## Xº NOME — Status: 🔍 Em validação

**Implementador:** [Nome IDE]
**Code Review:** [Link ou resumo]
**Feedback pendente:** [Suas observações]
```

### Quando está concluído:
```markdown
## Xº NOME — Status: ✅ Concluído

**Implementador:** [Nome IDE]
**Entrega:** [Data]
**Documento:** [Link para README do script]
**Entrada CHANGELOG:** [Link para changelog entry]
```

---

## Comunicação e Escalação

### Se está bloqueado:
1. Abra seção "Bloqueadores" para essa automação
2. Comunique qual informação/decisão está faltando
3. Mencione deadline esperado

### Se descobre algo que muda a spec:
1. Atualize o ROADMAP (seção relevante)
2. Crie entry em CHANGELOG explicando mudança
3. Comunique impacto (horas, prioridade, dependências)

### Se quer pausar/deprioritizar uma automação:
1. Mude status para ⏳ Bloqueado
2. Documenta motivo
3. Re-priorize na tabela

---

## Próximos Passos Imediatos (Você, Rafael)

- [ ] Revisar este arquivo e ROADMAP
- [ ] Validar prioridades (está certa a ordem P0 → P1 → P2 → P3?)
- [ ] Comunicar com Antigravity/Codex que sistema está pronto
- [ ] **Decidir sobre limpeza legado** (P6)
- [ ] Comece com P0: criar templates_producao.md

---

**Versão:** 1.0  
**Pronto para dar início? Responda sim aqui e comecemos com P0!**
