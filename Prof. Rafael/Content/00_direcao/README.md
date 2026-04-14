# 00_direcao — Governança da Marca Professor Rafael

**Índice centralizado de estratégia, documentação e roadmap de automações**

---

## 📊 Documentos de Estratégia

Estes documentos definem **o quê**, **por quê** e **como** a marca opera.

### Core Brand & Frame
- **[CORE_BRAND.md](CORE_BRAND.md)** *(em desenvolvimento - P3)*
  - Fonte única de verdade: frase-núcleo, missão, pilares, públicos, dores, promessa
  - Status: Ainda não criado (será consolidação de docs abaixo)

- **[documento_guia_professor_rafael.md](documento_guia_professor_rafael.md)**
  - Guia-mestre de marca pessoal
  - Coordena: frame, negócio, sistema editorial, memória de análises, linha de produção
  - Atualize este quando mudar direção geral

- **[frame_do_negocio_professor_rafael.md](frame_do_negocio_professor_rafael.md)**
  - O que a marca é (e o que não é)
  - Públicos, dores, promessa central
  - Como vira negócio (YouTube → Instagram → LinkedIn)
  - Levers que a marca pode ativar

### Operação & Produção
- **[agente_diretor_professor_rafael.md](agente_diretor_professor_rafael.md)**
  - Papel do COO/Estrategista de Marketing
  - Responsabilidades executivas
  - Autoridades de decisão
  - Protocolo de comunicação com equipe

- **[linha_de_producao_youtube_professor_rafael.md](linha_de_producao_youtube_professor_rafael.md)**
  - Pipeline ponta-a-ponta: pergunta → vídeo-mestre → derivações → registro
  - 7 etapas: pergunta, série, title+thumbnail, outline, roteiro, produção, registro
  - Política de backlog (manter 30 dias)

- **[biblioteca_de_series_youtube_professor_rafael.md](biblioteca_de_series_youtube_professor_rafael.md)**
  - 5 templates de conteúdo
  - Cada uma com propósito, formato, público, tom

### Tático: Guias de Produção
- **[guia_title_thumbnail_youtube_professor_rafael.md](guia_title_thumbnail_youtube_professor_rafael.md)**
  - Famílias de títulos e thumbnails
  - Processo decisório: pergunta → série → lever → 3 títulos → 3 thumbnails → choose best
  - Regra: Title + Thumbnail FIRST (antes do roteiro final)

- **[guia_producao_carrosseis_professor_rafael.md](guia_producao_carrosseis_professor_rafael.md)**
  - Estrutura-base: Pergunta de impacto → Pressão → Charlot → Citação → Realidade brasileira → Tese prática (opcional) → Fechamento → CTA
  - Regra: Tese prática recomendada mas NÃO obrigatória
  - Produção em escala: consistência > perfeição

- **[GUIA_OFICIAL_40_PROTOCOLOS.md](GUIA_OFICIAL_40_PROTOCOLOS.md)**
  - Codex estrutural do e-book "Gestão de Sala de Aula sem Caos"
  - **6 capítulos** do livro; **~40 protocolos** (subcapítulos), até ~2 páginas cada; tabela de nomenclatura no ficheiro
  - Estrutura de cada protocolo: Seco → O que evitar → Caixa técnica → História pessoal → Impacto diário → Leitura adicional
  - Separação entre discussão e registro explícito

### Tabela de Controle
- **[tabela_controle_publicacoes_professor_rafael.xlsx](tabela_controle_publicacoes_professor_rafael.xlsx)**
  - Registro de todas as publicações (planejadas, em produção, publicadas)
  - Colunas: formato, status, objetivo, pergunta central, título, thumbnail, tese, estrutura, pasta, observações performance
  - Alimenta calendário editorial e análise retrospectiva

---

## 🚀 Automações & Roadmap

Estes documentos organizam **o que automatizar**, **em que ordem** e **como implementar**.

### Planejamento
- **[ROADMAP_AUTOMACOES_2026.md](ROADMAP_AUTOMACOES_2026.md)** ⭐
  - Especificação detalhada de 7 automações (P0 a P3)
  - Para cada uma: descrição, impacto, complexidade, entradas/saídas, dependências, prioridade, próximos passos
  - Matriz de priorização
  - Como usar este roadmap (para você, IDEs, Claude)

- **[AUTOMACOES_STATUS.md](AUTOMACOES_STATUS.md)** ⭐
  - Dashboard de status real (atualizado conforme progride)
  - Detalhes de cada automação: próximos passos, bloqueadores, links relevantes
  - Timeline estimada
  - Como atualizar quando inicia/completa trabalho

### Integração com IDEs
- **[GUIA_INTEGRACAO_ANTIGRAVITY_CODEX.md](GUIA_INTEGRACAO_ANTIGRAVITY_CODEX.md)** ⭐
  - Para Antigravity, Codex e Claude
  - Arquitetura de pastas (onde colocar o quê)
  - Fluxo de desenvolvimento padrão (4 fases)
  - Convenções de código Python
  - Estrutura de testes
  - Entrada/saída de dados (markdown, excel)
  - Importação de regras de marca
  - Integração com APIs externas (YouTube, Google Trends)
  - Checklist de qualidade
  - Exemplo completo (P0)

### Documentação de Templates (em desenvolvimento)
- **[templates_producao.md](templates_producao.md)** *(em desenvolvimento - P0)*
  - Templates de brief, roteiro, short_brief, carousel_brief, linkedin_brief
  - Será referenciado por scripts de automação

- **[REGRAS_DERIVACAO.md](REGRAS_DERIVACAO.md)** *(em desenvolvimento - P1)*
  - Regras explícitas para gerar briefs de shorts, carrossel, LinkedIn
  - Será usado por script de derivação automática

---

## 📚 Inteligência de Mercado

Veja [base_de_dados/README.md](../base_de_dados/README.md) para:
- Banco de perguntas da audiência
- Banco de causos pessoais (histórias reais)
- Histórico de análises (memória estratégica)
- Análise de competidores
- Mapeamento de mercado de e-books
- Base de dicas com scoring

---

## 🎬 Publicações & Produção

Veja [Publicacoes/README.md](../Publicacoes/README.md) para estrutura de pastas por plataforma.

---

## ⚙️ Scripts & Automação

Veja [scripts/README.md](../scripts/README.md) para lista de todos os scripts Python disponíveis.

---

## 📅 Calendário Editorial

Veja [Calendario/](../Calendario/) para planejamento de publicações futuras.

---

## 🎯 Como Usar Esta Pasta (00_direcao/)

### Se você é **Rafael** (proprietário):
1. **Primeira leitura:** Frame → Documento-Guia → Linha de Produção
   - Entenderá a estratégia completa
2. **Depois:** ROADMAP_AUTOMACOES → AUTOMACOES_STATUS
   - Decidirá quais automações fazer e em que ordem
3. **Conforme progride:** Atualize AUTOMACOES_STATUS.md com status real
4. **Manutenção:** Revise CORE_BRAND.md anualmente (será base para tudo)

### Se você é **Antigravity** ou **Codex** (desenvolvedor):
1. **Setup:** Leia [GUIA_INTEGRACAO_ANTIGRAVITY_CODEX.md](GUIA_INTEGRACAO_ANTIGRAVITY_CODEX.md) (seções 1-3)
2. **Para cada automação:** Leia a spec no ROADMAP + guia de implementação
3. **Durante desenvolvimento:** Mantenha este guia à mão (entradas/saídas, convenções, etc)
4. **Ao finalizar:** Atualize AUTOMACOES_STATUS.md com ✅ Concluído

### Se você é **Claude** (IA em futuras sessões):
1. **Primeiro:** Consulte [ROADMAP_AUTOMACOES_2026.md](ROADMAP_AUTOMACOES_2026.md) para entender escopo
2. **Depois:** Consulte [AUTOMACOES_STATUS.md](AUTOMACOES_STATUS.md) para saber o que já foi feito
3. **Para especificação:** Referencia [GUIA_INTEGRACAO_ANTIGRAVITY_CODEX.md](GUIA_INTEGRACAO_ANTIGRAVITY_CODEX.md)
4. **Ao finalizar:** Atualize status e CHANGELOG.md

---

## 📝 Manutenção Deste Índice

Quando **adicionar novo documento** a 00_direcao/:
- Atualize este README (seção relevante)
- Certifique que é linkado
- Adicione linha de status em AUTOMACOES_STATUS.md se for automação

Quando **arquivar documento antigo**:
- Mova para `ARQUIVADO_2026_04/` (ou similar)
- Remova link deste README
- Crie entry em CHANGELOG.md explicando por quê

---

## 🔗 Quick Links

| Preciso de | Link | Descrição |
|-----------|------|-----------|
| Saber a estratégia geral | [frame_do_negocio_professor_rafael.md](frame_do_negocio_professor_rafael.md) | O negócio, públicos, dores, promessa |
| Entender pipeline de produção | [linha_de_producao_youtube_professor_rafael.md](linha_de_producao_youtube_professor_rafael.md) | 7 etapas do fluxo |
| Planejar títulos/thumbnails | [guia_title_thumbnail_youtube_professor_rafael.md](guia_title_thumbnail_youtube_professor_rafael.md) | Processo de decisão |
| Produzir carrossel | [guia_producao_carrosseis_professor_rafael.md](guia_producao_carrosseis_professor_rafael.md) | Estrutura e regras |
| Ver o que automatizar | [ROADMAP_AUTOMACOES_2026.md](ROADMAP_AUTOMACOES_2026.md) | Especificação completa |
| Ver status de automações | [AUTOMACOES_STATUS.md](AUTOMACOES_STATUS.md) | Real-time dashboard |
| Implementar automação | [GUIA_INTEGRACAO_ANTIGRAVITY_CODEX.md](GUIA_INTEGRACAO_ANTIGRAVITY_CODEX.md) | How-to para devs |
| E-book estrutura e nomenclatura | [GUIA_OFICIAL_40_PROTOCOLOS.md](GUIA_OFICIAL_40_PROTOCOLOS.md) | 6 capítulos; ~40 protocolos (subcapítulos). Ler **Nomenclatura unificada** no topo. |
| Histórico de mudanças | [CHANGELOG.md](CHANGELOG.md) *(em desenvolvimento)* | Rastreamento de versões |
| Conceitos centrais | [CORE_BRAND.md](CORE_BRAND.md) *(em desenvolvimento)* | Single source of truth |

---

## 📊 Status da Pasta 00_direcao/

```
Documentação Estratégica:      ✅ 95% completo (falta CORE_BRAND consolidado)
Documentação Tática:          ✅ 100% completo
Roadmap de Automações:        ✅ 100% completo
Guia de Integração:           ✅ 100% completo
Status de Automações:         🚧 Vivo (atualizar conforme progride)
Versionamento/Changelog:      🚧 Não iniciado (P3)
```

---

## 🎯 Próximas Ações (Para Você, Rafael)

- [ ] Revisar ROADMAP_AUTOMACOES_2026.md
- [ ] Validar prioridades (P0 → P1 → P2 → P3 está certa?)
- [ ] Comunicar com Antigravity/Codex que está pronto
- [ ] Decidir sobre limpeza legado (P6 em ROADMAP)
- [ ] **Comece com P0:** Criar ou revisar templates_producao.md

---

**Versão:** 1.0  
**Última atualização:** 2026-04-11  
**Atualizado por:** Claude  
**Status:** Pronto para feedback do Rafael
