# Guia de Integração — Antigravity, Codex e Claude

**Para:** Desenvolvedores trabalhando nas automações do sistema Professor Rafael  
**Propósito:** Orientar implementação de scripts, testes e documentação de forma coerente  
**Última atualização:** 2026-04-11

---

## 1. Arquitetura de Pastas — Onde Colocar o Quê

### Scripts e Automação
```
Content/scripts/
├── README.md                                    (índice de todos os scripts)
├── orchestrate_publication_workflow.py          (P0 - pipeline principal)
├── generate_editorial_calendar.py               (P1 - calendário)
├── auto_generate_derivative_briefs.py           (P1 - derivação)
├── collect_youtube_analytics.py                 (P2 - inteligência)
├── collect_google_trends.py                     (P2 - inteligência)
├── test_*.py                                    (testes unitários)
├── templates/                                   (templates usados pelos scripts)
│   ├── brief_template.md
│   ├── roteiro_template.md
│   ├── short_brief_template.md
│   ├── carousel_brief_template.md
│   └── linkedin_brief_template.md
├── credentials/
│   ├── .env.example                            (template de variáveis de ambiente)
│   └── README.md                               (como configurar)
└── lib/                                        (código reutilizável)
    ├── file_handlers.py                        (leitura/escrita de markdown, xlsx)
    ├── brand_rules.py                          (regras da marca)
    ├── publication_utils.py                    (utilitários de publicação)
    └── __init__.py
```

### Documentação de Direção
```
Content/00_direcao/
├── README.md                                    (índice)
├── CORE_BRAND.md                               (P3 - single source of truth)
├── documento_guia_professor_rafael.md          (referencia CORE_BRAND.md)
├── frame_do_negocio_professor_rafael.md        (referencia CORE_BRAND.md)
├── agente_diretor_professor_rafael.md
├── linha_de_producao_youtube_professor_rafael.md
├── templates_producao.md                       (P0 - novo arquivo com templates)
├── GUIA_INTEGRACAO_ANTIGRAVITY_CODEX.md       (este arquivo)
├── ROADMAP_AUTOMACOES_2026.md                  (este arquivo)
├── CHANGELOG.md                                (P3 - histórico de mudanças)
└── REGRAS_DERIVACAO.md                         (P1 - regras de formato)
```

### Publicações Produzidas
```
Content/Publicacoes/
├── YouTube/
│   ├── Longos/
│   │   └── {id_publicacao}/
│   │       ├── brief.md
│   │       ├── roteiro.md
│   │       ├── assets/
│   │       ├── exports/
│   │       └── metricas.md
│   └── Shorts/
└── Instagram/
    ├── Carrosseis/
    └── Reels/
```

### Calendário Editorial
```
Content/Calendario/
├── README.md
├── calendario_editorial_2026_04.md             (gerado por script P1)
├── calendario_editorial_2026_04.xlsx           (gerado por script P1)
└── backlog_priorizado.md                       (mantido manualmente)
```

---

## 2. Fluxo de Desenvolvimento Padrão

### Para cada automação, siga este checklist:

#### Fase 1: Especificação (feita no ROADMAP)
- ✅ Descrição clara
- ✅ Entradas e saídas definidas
- ✅ Complexidade estimada
- ✅ Dependências identificadas

#### Fase 2: Preparação (você, antes de delegar)
- [ ] Criar estrutura de pastas necessária
- [ ] Criar templates de saída (ex: brief_template.md)
- [ ] Atualizar ROADMAP com status "🚧 Em preparação"
- [ ] Comunicar com Antigravity/Codex que está pronto

#### Fase 3: Implementação (Antigravity/Codex)
- [ ] Clonar repositório ou acessar pasta
- [ ] Criar arquivo `scripts/{nome_script}.py`
- [ ] Implementar conforme spec
- [ ] Criar testes em `scripts/test_{nome_script}.py`
- [ ] Testar localmente com dados reais
- [ ] Fazer commit/push com mensagem clara
- [ ] Adicionar entrada em `scripts/README.md`

#### Fase 4: Integração (você + IDE)
- [ ] Validar saídas
- [ ] Integrar com pipeline maior se necessário
- [ ] Documentar qualquer ajuste necessário
- [ ] Atualizar ROADMAP com status "✅ Concluído"
- [ ] Registrar em CHANGELOG.md

---

## 3. Convenções de Código

### Nomes de Scripts
```python
# Convenção: {acao}_{alvo}.py
orchestrate_publication_workflow.py      # workflow geral
generate_editorial_calendar.py            # geração de artefato
collect_youtube_analytics.py              # coleta de dados
auto_generate_derivative_briefs.py        # automação específica
```

### Estrutura de um Script
```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
{Descrição uma linha do script}

Descrição detalhada:
- O que faz
- Entradas esperadas
- Saídas produzidas

Uso:
    python {script_name}.py --input path/to/input --output path/to/output

Autor: {IDE}
Data: 2026-04-XX
Versão: 1.0
"""

import sys
import argparse
from pathlib import Path

# Imports locais
sys.path.insert(0, str(Path(__file__).parent))
from lib import file_handlers, brand_rules

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', required=True, help='Caminho do arquivo de entrada')
    parser.add_argument('--output', required=True, help='Caminho do arquivo de saída')
    parser.add_argument('--debug', action='store_true', help='Modo debug')
    
    args = parser.parse_args()
    
    # Sua lógica aqui
    try:
        # ... código ...
        print(f"✅ Sucesso: arquivo salvo em {args.output}")
    except Exception as e:
        print(f"❌ Erro: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```

### Testes Unitários
```python
# test_auto_generate_derivative_briefs.py
import unittest
from pathlib import Path
from auto_generate_derivative_briefs import generate_carousel_brief, generate_short_brief

class TestDerivativeBriefs(unittest.TestCase):
    
    def setUp(self):
        self.master_roteiro = Path('fixtures/sample_roteiro.md')
    
    def test_carousel_brief_structure(self):
        """Verifica se o brief do carrossel tem a estrutura esperada"""
        brief = generate_carousel_brief(self.master_roteiro)
        self.assertIn('Pergunta de impacto', brief)
        self.assertIn('Pressão sobre o professor', brief)
    
    def test_short_brief_count(self):
        """Verifica se gera 2-4 shorts como esperado"""
        briefs = generate_short_brief(self.master_roteiro, count=3)
        self.assertEqual(len(briefs), 3)

if __name__ == '__main__':
    unittest.main()
```

### Documentação Inline
```python
def extract_insights_from_roteiro(roteiro_path):
    """
    Extrai insights e pontos de tensão do roteiro.
    
    Args:
        roteiro_path (str): Caminho do arquivo roteiro.md
    
    Returns:
        dict: {'tensoes': [str], 'tese': str, 'historias': [str]}
    
    Raises:
        FileNotFoundError: Se roteiro não existe
        ValueError: Se roteiro não segue formato esperado
    """
    # ... código ...
```

---

## 4. Entrada/Saída de Dados

### Lendo Markdown
```python
from lib.file_handlers import read_markdown, parse_yaml_front_matter

# Ler arquivo markdown com front-matter YAML
content = read_markdown('roteiro.md')
metadata = parse_yaml_front_matter('roteiro.md')
```

### Escrevendo Markdown
```python
from lib.file_handlers import write_markdown

template = """# {titulo}

## Briefing
{briefing}

## Estrutura
{estrutura}
"""

output = template.format(titulo="Novo Carrossel", briefing="...", estrutura="...")
write_markdown('output.md', output)
```

### Trabalhando com Excel
```python
from openpyxl import load_workbook

wb = load_workbook('tabela_controle.xlsx')
ws = wb['Publicacoes']

# Adicionar linha
new_row = [
    'YouTube',
    'Longo',
    '2026-04-15',
    'Pergunta: Como...',
    'titulo',
    'ATIVO'
]
ws.append(new_row)
wb.save('tabela_controle.xlsx')
```

---

## 5. Regras de Marca (Usar em Scripts)

### Importar Regras
```python
from lib.brand_rules import BRAND_CORE, SERIES_DEFINITIONS, FORMAT_RULES

# Acessar núcleo da marca
print(BRAND_CORE['nucleo'])
# Output: "Professor que traduz a escola real com humor..."

# Acessar regras de série
print(SERIES_DEFINITIONS['Narrativas da Escola Real'])

# Acessar regras de formato
print(FORMAT_RULES['carrossel']['estrutura_recomendada'])
```

### Arquivo `lib/brand_rules.py`
```python
# Extraído de CORE_BRAND.md, deve ser atualizado quando CORE_BRAND mudar

BRAND_CORE = {
    'nucleo': 'Professor que traduz a escola real com humor, memória histórica e ferramentas práticas para ensinar com menos desgaste.',
    'missao': 'Traduzir a escola real com humor, memória histórica e ferramentas práticas para ajudar professores a ensinar com menos desgaste e mais critério.',
    'pilares': ['Autoridade', 'Humor', 'Memória histórica', 'Utilidade', 'Leveza'],
    'publicos': ['Professores de áreas específicas', 'Professores cansados de burocracia'],
    'dores': ['Exaustão docente', 'Indisciplina', 'Burocracia', 'Pressão'],
}

SERIES_DEFINITIONS = {
    'Narrativas da Escola Real': {...},
    'Genealogia da Sala': {...},
    # ... outros
}

FORMAT_RULES = {
    'carrossel': {
        'estrutura_recomendada': [
            'Pergunta de impacto',
            'Pressão sobre o professor',
            'Charlot entra como chave',
            # ...
        ],
        'tese_pratica_obrigatoria': False,
    },
    # ... outros formatos
}
```

---

## 6. Integração com APIs Externas

### YouTube API
```python
from google.auth.transport.requests import Request
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

# Credenciais já estão configuradas em .env ou .gcloud_config
youtube = build('youtube', 'v3', credentials=get_credentials())

request = youtube.commentThreads().list(
    part='snippet',
    videoId='VIDEO_ID',
    maxResults=100
)
response = request.execute()
```

### Google Trends
```python
from pytrends.request import TrendReq

pytrends = TrendReq(hl='pt-BR', tz=180)
pytrends.build_payload(['indisciplina escolar'], timeframe='today 1m')
data = pytrends.interest_over_time()
```

### Arquivo `credentials/.env.example`
```
YOUTUBE_API_KEY=your_youtube_api_key_here
GOOGLE_TRENDS_ACCOUNT=your_google_account@gmail.com
GCP_PROJECT_ID=adk-488113
```

---

## 7. Estrutura de Teste

### Dados de Teste (fixtures/)
```
Content/scripts/fixtures/
├── sample_pergunta.md              # Uma pergunta do banco
├── sample_roteiro.md               # Um roteiro completo
├── sample_publicacao/              # Uma pasta de publicação inteira
│   ├── brief.md
│   ├── roteiro.md
│   └── assets/
└── sample_tabela_controle.xlsx     # Tabela para testes
```

### Executar Testes
```bash
cd Content/scripts
python -m pytest test_*.py -v
# ou
python -m unittest discover -s . -p 'test_*.py'
```

---

## 8. Documentação de Scripts

### Cada script deve ter um README
```markdown
# orchestrate_publication_workflow.py

## O que faz
Automatiza o fluxo de publicação: pergunta → título/thumbnail → brief → roteiro → pasta estruturada.

## Entradas
- `--pergunta-id`: ID da pergunta no banco_de_perguntas_da_audiencia.md
- `--plataforma`: youtube ou instagram
- `--formato`: longo, short, carrossel, reel, etc

## Saídas
- Nova pasta em `Content/Publicacoes/{plataforma}/{formato}/{id_publicacao}/`
- Arquivos: brief.md, roteiro.md, README.md
- Tabela de controle atualizada

## Exemplo de uso
```bash
python orchestrate_publication_workflow.py \
  --pergunta-id 3 \
  --plataforma youtube \
  --formato longo
```

## Status
✅ Implementado | 🚧 Em andamento | ❌ Não iniciado

## Testes
```bash
python -m pytest test_orchestrate_publication_workflow.py -v
```
```

---

## 9. Fluxo de Comunicação Entre IDEs

### Se Antigravity está implementando P0 (Pipeline)
**Comunicação clara no código:**
```python
# Em orchestrate_publication_workflow.py
# TODO: Integração com derivation briefs (P1) virá em próxima fase
# Issue: Aguardando Codex implementar auto_generate_derivative_briefs.py
```

### Se há Bloqueador
**Registre no ROADMAP:**
```markdown
## 1. PIPELINE ORQUESTRADO

### Status
🚧 **Em implementação** (Antigravity)
⏳ **Bloqueado**: Aguardando que você confirme se YouTube API está configurada
```

### Se há Mudança de Especificação
**Atualize o ROADMAP + CHANGELOG:**
```markdown
## [2026-04-12] — Ajuste de especificação P0
- **Automação**: Pipeline Orquestrado
- **Mudança**: Adicionado suporte a LinkedIn format (era só YouTube/Instagram)
- **Motivo**: Usuário pediu para derivar cortes LinkedIn também
- **Autor**: Claude (consultado com Rafael)
- **Impacto**: Aumenta escopo de P0, agora ~3h em vez de 2h
```

---

## 10. Checklist de Qualidade Antes de "Concluído"

### Código
- [ ] Segue convenções de nome e estrutura (seção 3)
- [ ] Tem docstring clara (formato seção 3)
- [ ] Trata erros e comunica para o usuário
- [ ] Tem testes unitários (seção 7)
- [ ] Roda com dados reais da pasta (não fixtures apenas)

### Documentação
- [ ] README.md em `scripts/` descrevendo o script
- [ ] Comentários inline para lógica complexa
- [ ] Atualizado `scripts/README.md` (índice geral)
- [ ] Atualizado ROADMAP.md com status ✅
- [ ] Adicionado entry em CHANGELOG.md

### Entrega
- [ ] Arquivo está em `Content/scripts/`
- [ ] Arquivo pode ser importado por outros scripts (`sys.path` configurado)
- [ ] Templates estão em `Content/scripts/templates/`
- [ ] Credenciais estão em `Content/scripts/credentials/.env` (não commitadas, apenas .env.example)

---

## 11. Exemplo Completo — P0 (Pipeline Orquestrado)

### Fase 1: Você prepara
1. Cria estrutura em `Content/scripts/templates/`:
   - `brief_template.md`
   - `roteiro_template.md`
   - etc

2. Cria `Content/00_direcao/templates_producao.md` documentando os templates

3. Atualiza ROADMAP: "🚧 Em preparação"

### Fase 2: Antigravity desenvolve
1. Cria `Content/scripts/orchestrate_publication_workflow.py`
2. Cria `Content/scripts/test_orchestrate_publication_workflow.py`
3. Cria `Content/scripts/lib/publication_utils.py` (código reutilizável)
4. Testa com pergunta real do banco
5. Documenta em `Content/scripts/README.md`

### Fase 3: Você valida
1. Roda o script manualmente
2. Verifica saídas (pasta, brief, roteiro, README)
3. Valida tabela de controle foi atualizada
4. Pede ajustes se necessário
5. Atualiza ROADMAP: "✅ Concluído"

### Fase 4: Próxima etapa
1. P1 (Derivação) agora pode depender de P0
2. Ciclo se repete

---

## Conclusão

Este guia é seu **mapa de boas práticas** para que Antigravity, Codex e Claude trabalhem em harmonia, deixando código reutilizável, bem documentado e pronto para a próxima pessoa que vier manter o sistema.

**Dúvidas?** Referencia sempre este arquivo + o ROADMAP_AUTOMACOES_2026.md

**Antes de começar uma automação:**
1. Leia a seção relevante no ROADMAP
2. Releia este guia (seções 3, 4, 7)
3. Comece!
