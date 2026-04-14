import pandas as pd
import os

# 1) Canais Ativos / Dados Globais
channels_data = [
    {"Canal": "Rede Pedagógica", "Categoria": "Direto", "Subscribers": "1.21M", "Total Views": "1.09B", "Monetization": "Courses/Certifications", "Status": "Active"},
    {"Canal": "SOS Educação", "Categoria": "Direto", "Subscribers": "28.7k", "Total Views": "841k", "Monetization": "Books/School Consulting", "Status": "Active"},
    {"Canal": "Thaís Faria Coelho", "Categoria": "Direto", "Subscribers": "57.6k", "Total Views": "131k", "Monetization": "O Plano (High Ticket)", "Status": "Launch-based"},
    {"Canal": "Mr. Napoles", "Categoria": "Direto", "Subscribers": "22.8k", "Total Views": "2.32M", "Monetization": "Adsense/Songs", "Status": "Active"},
    {"Canal": "Not So Wimpy Teacher", "Categoria": "Direto", "Subscribers": "24.4k", "Total Views": "1.45M", "Monetization": "Digital Goods/PD", "Status": "Active"},
    {"Canal": "Diogo Almeida", "Categoria": "Direto", "Subscribers": "804k", "Total Views": "135.1M", "Monetization": "Comedy Tours/Brands", "Status": "Active (Shorts Focus)"},
    {"Canal": "Leo Fraiman", "Categoria": "Direto", "Subscribers": "166k", "Total Views": "2.94M", "Monetization": "OPEE Methodology/Books", "Status": "Active (Live Focus)"},
    {"Canal": "Jonathan Haidt", "Categoria": "Adjacente Útil", "Subscribers": "8k", "Total Views": "100k+", "Monetization": "Books/Speaking", "Status": "Viral Signal"},
    {"Canal": "Simon Sinek", "Categoria": "Adjacente Útil", "Subscribers": "2.69M", "Total Views": "178M", "Monetization": "Classes/Books", "Status": "Global Framing"}
]

# 2) Viral Long-Form
long_form_data = [
    {"Canal": "Thaís Faria Coelho", "Video Title": "COMO CRIAR UM PLANEJAMENTO DE AULAS EM 30 MINUTOS", "Views": 19000, "Median_Longs": 3200, "Viral_Score": 5.9, "Signal": "Efficiency/Burnout reduction is the #1 pain point."},
    {"Canal": "SOS Educação", "Video Title": "Uso de imagens de crianças no WhatsApp sem autorização", "Views": 29000, "Median_Longs": 6050, "Viral_Score": 4.8, "Signal": "Legal/Ethical anxieties for schools."},
    {"Canal": "Diogo Almeida", "Video Title": "React esposa de jogador! Debochou da professora", "Views": 236000, "Median_Longs": 53500, "Viral_Score": 4.4, "Signal": "Demand for social respect and professional validation."},
    {"Canal": "Leo Fraiman", "Video Title": "AULA LIBERADA: Como se tornar uma Mãe C.H.A.T.A", "Views": 10000, "Median_Longs": 2100, "Viral_Score": 4.7, "Signal": "Parental authority vs social pressure."},
    {"Canal": "Mr. Napoles", "Video Title": "STATE TESTING PREP RAP SONG", "Views": 20000, "Median_Longs": 1200, "Viral_Score": 16.6, "Signal": "Interactive/Music content for students scales massive."},
    {"Canal": "Not So Wimpy Teacher", "Video Title": "How to Teach Adjectives/Verbs Series", "Views": 19000, "Median_Longs": 2350, "Viral_Score": 8.1, "Signal": "Direct pedagogical tactics (How-To) are highly searchable."}
]

# 3) Viral Shorts
shorts_data = [
    {"Canal": "Rede Pedagógica", "Video Title": "Conto encanta", "Views": 60000, "Median_Shorts": 32500, "Viral_Score": 1.8, "Signal": "High-reach pedagogical pills."},
    {"Canal": "Diogo Almeida", "Video Title": "A mãe foi meter o bedelho na tarefa...", "Views": 288000, "Median_Shorts": 135500, "Viral_Score": 2.1, "Signal": "Helicopter parent relatability."},
    {"Canal": "Leo Fraiman", "Video Title": "Autoestima parental... Vídeo 2", "Views": 11000, "Median_Shorts": 2050, "Viral_Score": 5.3, "Signal": "Emotional relief for parents/teachers."},
    {"Canal": "Mayleen Lopez", "Video Title": "Classroom Game (Viral Tip)", "Views": 510000, "Median_Shorts": 10000, "Viral_Score": 51.0, "Signal": "Visually satisfying systems/reveals."}
]

# 4) Sinais Estratégicos (Adjacent)
signals_data = [
    {"Tema": "A Grande Reconfiguração", "Origem": "Jonathan Haidt", "Implicação": "Crise de atenção dos alunos devido ao celular. Demanda por escolas 'Phone-Free'."},
    {"Tema": "Restauração da Antifragilidade", "Origem": "Jonathan Haidt", "Implicação": "Combate ao hipercuidado (safetyism). Necessidade de autonomia e risco controlado."},
    {"Tema": "Liderança Humanocêntrica", "Origem": "Simon Sinek", "Implicação": "Escolas como Círculos de Segurança. Foco em confiança em vez de métricas industriais."},
    {"Tema": "Fluência Geracional", "Origem": "Simon Sinek", "Implicação": "Gestão de conflitos entre liderança (escola) e novos professores (Gen Z)."}
]

file_path = '/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Prof. Rafael/Relatorio_Auditoria_YouTube_Rafael.xlsx'

try:
    with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
        pd.DataFrame(channels_data).to_excel(writer, sheet_name='1) Canais Ativos', index=False)
        pd.DataFrame(long_form_data).to_excel(writer, sheet_name='2) Viral Long-Form', index=False)
        pd.DataFrame(shorts_data).to_excel(writer, sheet_name='3) Viral Shorts', index=False)
        pd.DataFrame(signals_data).to_excel(writer, sheet_name='4) Sinais Globais', index=False)
    print(f"Success: {file_path}")
except Exception as e:
    local_file = os.path.join(os.getcwd(), 'Relatorio_Auditoria_YouTube_Rafael_FINAL.xlsx')
    with pd.ExcelWriter(local_file, engine='openpyxl') as writer:
        pd.DataFrame(channels_data).to_excel(writer, sheet_name='1) Canais Ativos', index=False)
        pd.DataFrame(long_form_data).to_excel(writer, sheet_name='2) Viral Long-Form', index=False)
        pd.DataFrame(shorts_data).to_excel(writer, sheet_name='3) Viral Shorts', index=False)
        pd.DataFrame(signals_data).to_excel(writer, sheet_name='4) Sinais Globais', index=False)
    print(f"Permissions limited. File saved in current directory: {local_file}")
