import pandas as pd
import os
from datetime import datetime

# Definir Caminho Canônico (Apenas Prof. Rafael)
base_path = '/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Prof. Rafael'
canonical_file = os.path.join(base_path, 'Relatorio_Auditoria_YouTube_Rafael_Base_Limpa.xlsx')

data_coleta = datetime.now().strftime("%Y-%m-%d")

# 1) Shortlist Core e Adjacentes (Excluídos removed)
canais_estruturados = [
    {"Canal": "Rede Pedagógica", "Categoria Final": "Core Benchmark", "Foco Editorial": "Formação Continuada / Semanas Pedagógicas", "Apto para Coleta": "Sim"},
    {"Canal": "SOS Educação", "Categoria Final": "Core Benchmark", "Foco Editorial": "Família-Escola / Conflitos e Comportamento", "Apto para Coleta": "Sim"},
    {"Canal": "Thaís Faria Coelho", "Categoria Final": "Core Benchmark", "Foco Editorial": "Neurociência Prática / Eficiência no Planejamento", "Apto para Coleta": "Sim"},
    {"Canal": "Mr. Napoles", "Categoria Final": "Core Benchmark", "Foco Editorial": "Rotina do Professor / Recursos TPT / Músicas Educativas", "Apto para Coleta": "Sim"},
    {"Canal": "Not So Wimpy Teacher", "Categoria Final": "Core Benchmark", "Foco Editorial": "Didática Pragmática / Organização e Produtividade", "Apto para Coleta": "Sim"},
    {"Canal": "Diogo Almeida", "Categoria Final": "Core Benchmark", "Foco Editorial": "Relatabilidade / Identificação Profissional pelo Humor", "Apto para Coleta": "Sim"},
    {"Canal": "Leo Fraiman", "Categoria Final": "Core Benchmark", "Foco Editorial": "Psicologia / Autoridade Parental e Escolar (OPEE)", "Apto para Coleta": "Sim"},
    {"Canal": "Jonathan Haidt", "Categoria Final": "Adjacente Útil", "Foco Editorial": "Geração Ansiosa / Escolas Phone-Free", "Apto para Coleta": "Referência de Framing - Coletar apenas clips relevantes"},
    {"Canal": "Simon Sinek", "Categoria Final": "Adjacente Útil", "Foco Editorial": "Liderança Humanocêntrica / Conflito Geracional", "Apto para Coleta": "Referência de Framing - Coletar apenas clips relevantes"}
]

# 2) Setup Coleta Long-Form
long_form_template = pd.DataFrame(columns=[
    "Canal", "URL", "Título", "Data de Coleta", "Data do Vídeo", "Views_Totais", 
    "Views/Dia (Tração vitalícia)", "Mediana_Últimos_20_Longos", 
    "Viral_Score_Long (Views / Mediana)", "Comentários/1k", "Likes/1k", 
    "Sinal_Demanda (Extração dos comentários)", "Nível_Confiança (Amostra=20?)", "Status_Rastreio"
])

# 3) Setup Coleta Shorts
shorts_template = pd.DataFrame(columns=[
    "Canal", "URL", "Título", "Data de Coleta", "Data do Vídeo", "Views_Totais", 
    "Views/Semana_1 (Estimada)", "Mediana_Últimos_20_Shorts", 
    "Viral_Score_Shorts (Views / Mediana)", "Comentários/1k", "Likes/1k", 
    "Tração_Social (Compartilhamentos percebidos / Hook Inicial)", "Nível_Confiança (Amostra=20?)", "Status_Rastreio"
])

# 4) Hipóteses Editoriais e Sinais Globais (Transpostos da Fase 1, marcados como Hipóteses)
hipoteses_estrategicas = [
    {
        "Tema / Gancho": "Eficiência e Tempo", 
        "Origem": "Thaís Faria Coelho (Ex: Planejamento em 30 min)", 
        "Status de Evidência": "Hipótese Forte (Confirmar via Coleta Longs)",
        "Nível de Confiança Atual": "Médio-Alto (Outlier de 19k vs mediana de 3k)",
        "Implicação para a Marca": "#1 Dor tática: O público não compra 'ensinar melhor' se não sobrar tempo."
    },
    {
        "Tema / Gancho": "Catarse Legal e Identificação", 
        "Origem": "Diogo Almeida / SOS Educação", 
        "Status de Evidência": "Validado / Fato",
        "Nível de Confiança Atual": "Alto (Padrão repetido nas amostras de Shorts)",
        "Implicação para a Marca": "Professores engajam profundamente para defender a classe contra 'Pais Helicópteros' e exposição no WhatsApp."
    },
    {
        "Tema / Gancho": "Distração Digital (Phone-Free)", 
        "Origem": "Jonathan Haidt (The Anxious Generation)", 
        "Status de Evidência": "Sinal Global de Cenário (Framing)",
        "Nível de Confiança Atual": "Alto (Demanda acadêmica geral)",
        "Implicação para a Marca": "Pano de fundo estratégico: como gerir o comportamento na sala tomada por telas."
    },
    {
        "Tema / Gancho": "Autoridade Docente vs Afetividade", 
        "Origem": "Leo Fraiman (Mãe C.H.A.T.A)", 
        "Status de Evidência": "Hipótese de Conteúdo Longo",
        "Nível de Confiança Atual": "Médio (Outliers concentrados em Lives recentes)",
        "Implicação para a Marca": "A palavra 'NÃO' e o retorno à autoridade é o novo contraponto pedagógico."
    }
]

try:
    with pd.ExcelWriter(canonical_file, engine='openpyxl') as writer:
        pd.DataFrame(canais_estruturados).to_excel(writer, sheet_name='1_Estrutura_Canais', index=False)
        long_form_template.to_excel(writer, sheet_name='2_Baseline_LongForm', index=False)
        shorts_template.to_excel(writer, sheet_name='3_Baseline_Shorts', index=False)
        pd.DataFrame(hipoteses_estrategicas).to_excel(writer, sheet_name='4_Hipoteses_Sinais', index=False)

    print(f"SUCESSO: Base Limpa criada canonicamente em {canonical_file}")
except Exception as e:
    print(f"ERRO: Não foi possível criar o arquivo {e}")
