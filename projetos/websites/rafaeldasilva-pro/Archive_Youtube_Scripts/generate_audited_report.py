import pandas as pd
import os

# New Data with Categories
channels_audited = [
    {"Canal": "Rede Pedagógica", "Categoria": "Direto", "Subscribers": "1.21M", "Total Views": "1.09B", "Monetization": "Courses/Subs", "Status": "Active"},
    {"Canal": "SOS Educação", "Categoria": "Direto", "Subscribers": "28.7k", "Total Views": "841k", "Monetization": "Books/Courses", "Status": "Active"},
    {"Canal": "Thaís Faria Coelho", "Categoria": "Direto", "Subscribers": "57.6k", "Total Views": "131k", "Monetization": "Curso/Mentoring", "Status": "Active"},
    {"Canal": "Mr. Napoles", "Categoria": "Direto", "Subscribers": "27.8k", "Total Views": "6.16M", "Monetization": "TPT Store", "Status": "Active"},
    {"Canal": "Not So Wimpy Teacher", "Categoria": "Direto", "Subscribers": "24.4k", "Total Views": "1.45M", "Monetization": "Own Store/Courses", "Status": "Active"},
    {"Canal": "Diogo Almeida", "Categoria": "Direto", "Subscribers": "804k", "Total Views": "135M", "Monetization": "Tickets/Brands", "Status": "Active"},
    {"Canal": "Leo Fraiman", "Categoria": "Direto", "Subscribers": "166k", "Total Views": "2.94M", "Monetization": "TDAH Course/Books", "Status": "Active"},
    {"Canal": "Jonathan Haidt", "Categoria": "Adjacente Útil", "Subscribers": "7.33k", "Total Views": "100k", "Monetization": "Books/Substack", "Status": "Semi-active"},
    {"Canal": "Simon Sinek", "Categoria": "Adjacente Útil", "Subscribers": "2.69M", "Total Views": "178M", "Monetization": "Classes/Books", "Status": "Active"},
    {"Canal": "Sir Ken Robinson", "Categoria": "Framing Only", "Subscribers": "29.8k", "Total Views": "2.2M", "Monetization": "Legacy", "Status": "Legacy"},
    {"Canal": "Dado Schneider", "Categoria": "Framing Only", "Subscribers": "4.05k", "Total Views": "65k", "Monetization": "Lectures", "Status": "Inactive"}
]

# Defining Tables for Video Formats
# (To be populated by final mass collection)
long_form_template = [
    {"Canal": "", "Video Title": "", "Views": 0, "Median_Last_20_Longs": 0, "Viral_Score_Long": 0, "Engagement_1k": 0, "Demand_Signals": "", "URL": ""}
]

shorts_template = [
    {"Canal": "", "Video Title": "", "Views": 0, "Median_Last_20_Shorts": 0, "Viral_Score_Shorts": 0, "Engagement_1k": 0, "Demand_Signals": "", "URL": ""}
]

# File Path
file_path = '/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Prof. Rafael/Relatorio_Auditoria_YouTube_Rafael.xlsx'

try:
    with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
        pd.DataFrame(channels_audited).to_excel(writer, sheet_name='1) Canais Ativos', index=False)
        pd.DataFrame(long_form_template).to_excel(writer, sheet_name='2) Viral Long-Form', index=False)
        pd.DataFrame(shorts_template).to_excel(writer, sheet_name='3) Viral Shorts', index=False)
    print(f"Success: {file_path}")
except Exception as e:
    # Save to local if permissions fail
    local_file = os.path.join(os.getcwd(), 'Relatorio_Auditoria_YouTube_Rafael_LOCAL.xlsx')
    with pd.ExcelWriter(local_file, engine='openpyxl') as writer:
        pd.DataFrame(channels_audited).to_excel(writer, sheet_name='1) Canais Ativos', index=False)
        pd.DataFrame(long_form_template).to_excel(writer, sheet_name='2) Viral Long-Form', index=False)
        pd.DataFrame(shorts_template).to_excel(writer, sheet_name='3) Viral Shorts', index=False)
    print(f"Permissions limited. File saved in current directory: {local_file}")
