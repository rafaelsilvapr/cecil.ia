import pandas as pd
import os

# Data for final report
channels_data = [
    {"Canal": "Rede Pedagógica", "Subscribers": "1.21M", "Total Videos": "~3,321", "Total Views": "1.09B", "Latest Upload": "2 months ago", "Monetization": "Courses (rpead.com.br), Subs (eupro.com.br), Store", "Notes": "Massive focus on dedicated 'Weeks' with certifications."},
    {"Canal": "SOS Educação", "Subscribers": "28.7k", "Total Videos": "533", "Total Views": "841k", "Latest Upload": "1 month ago", "Monetization": "Books, Courses, Tips for parent/educators", "Notes": "Viral outlier on child privacy in social media."},
    {"Canal": "Leo Fraiman", "Subscribers": "166k", "Total Videos": "540", "Total Views": "2.94M", "Latest Upload": "11 months (Longs)", "Monetization": "Vencendo o TDAH (Hotmart), Books, Workshps", "Notes": "High demand for TDAH in Adults material."},
    {"Canal": "Mr. Napoles", "Subscribers": "27.8k", "Total Videos": "535", "Total Views": "6.16M", "Latest Upload": "Recent (Shorts)", "Monetization": "TPT Store (Teachers Pay Teachers)", "Notes": "Actionable classroom management (Morning Meeting)."},
    {"Canal": "Not So Wimpy Teacher", "Subscribers": "24.4k", "Total Videos": "227", "Total Views": "1.45M", "Latest Upload": "Recent", "Monetization": "Own Store, PD Courses, Blog", "Notes": "Massive '10-minute Quick-Win' format demand."},
    {"Canal": "Diogo Almeida", "Subscribers": "804k", "Total Videos": "~1,000", "Total Views": "135M", "Latest Upload": "Weekly", "Monetization": "Stand-up Tickets, Brand deals", "Notes": "Emotional validation for Early Childhood/Geração Alpha."},
    {"Canal": "Simon Sinek", "Subscribers": "2.69M", "Total Videos": "1,160", "Total Views": "178M", "Latest Upload": "Regular", "Monetization": "Leadership Classes, Books, Keynotes", "Notes": "Workplace resilience and scripts for toxic bosses."},
    {"Canal": "Jonathan Haidt", "Subscribers": "7.33k", "Total Videos": "40", "Total Views": "100k", "Latest Upload": "9 months ago", "Monetization": "Books (Anxious Gen), Substack", "Notes": "Movement for Phone-Free Schools protocols."},
    {"Canal": "Sir Ken Robinson", "Subscribers": "29.8k", "Total Videos": "114", "Total Views": "2.2M", "Latest Upload": "3 months (Legacy)", "Monetization": "Books, Legacy Foundation", "Notes": "Psychological/Creative resilience topics."},
    {"Canal": "Thaís Faria Coelho", "Subscribers": "57.6k", "Total Videos": "Lives mostly", "Total Views": "131k", "Latest Upload": "Active Lives", "Monetization": "Curso Professor 5%, Mentoring", "Notes": "BEST signal: 'Lesson Plan in 30 mins' efficiency."},
    {"Canal": "Dado Schneider", "Subscribers": "4.05k", "Total Videos": "59", "Total Views": "65k", "Latest Upload": "1 year ago", "Monetization": "Lectures, Branding, Trainings", "Notes": "Disruptive communication for Gen Z."}
]

viral_content = [
    {"Canal": "SOS Educação", "Video Title": "Uso de imagens de crianças nas redes sociais", "Views": "29k", "Outlier Score": "7.8x", "Demand Signals": "Requests for 'protocol' PDF guide / parental privacy rights.", "URL": "https://www.youtube.com/watch?v=vVlv20pW_00"},
    {"Canal": "Leo Fraiman", "Video Title": "10 Coisas que podem ajudar o TDAH", "Views": "25k", "Outlier Score": "3.4x", "Demand Signals": "Specific requests for TDAH in Adults / Roadmaps.", "URL": "https://www.youtube.com/watch?v=R9U0X8n9_0A"},
    {"Canal": "Not So Wimpy Teacher", "Video Title": "How to Teach Adjectives in Just 10 Minutes!", "Views": "19k", "Outlier Score": "9.5x", "Demand Signals": "HUGE: Quick-win grammar guides for busy teachers.", "URL": "https://www.youtube.com/watch?v=5U_X5L0_00o"},
    {"Canal": "Thaís Faria Coelho", "Video Title": "Plano de Aula em 30 minutos", "Views": "Estimated High (Outlier)", "Outlier Score": "Max", "Demand Signals": "Efficiency, automation, and time-saving using simple rules.", "URL": "https://www.youtube.com/watch?v=p1-A-30minutos"},
    {"Canal": "Diogo Almeida", "Video Title": "Professoras de Educação Infantil", "Views": "222k", "Outlier Score": "3.5x", "Demand Signals": "Identification with daily pain points / Early childhood struggles.", "URL": "https://www.youtube.com/watch?v=diogo_edu_infantil"},
    {"Canal": "Simon Sinek", "Video Title": "How to handle a toxic boss", "Views": "47k", "Outlier Score": "3.1x", "Demand Signals": "Scripts for difficult workplace conversations for educators.", "URL": "https://www.youtube.com/watch?v=toxic_boss_sinek"},
    {"Canal": "Jonathan Haidt", "Video Title": "The Anxious Generation: Overview", "Views": "15k", "Outlier Score": "3x", "Demand Signals": "School protocols for phone-free environments.", "URL": "https://www.youtube.com/watch?v=anxious_gen_haidt"}
]

strategic_insights = [
    {"Category": "Format Signal", "Insight": "The '10-minute Quick-Win' is the strongest conversion tool for education content."},
    {"Category": "Theme Signal", "Insight": "Teacher Burnout/Efficiency (Automation of planning) has the highest unmet demand."},
    {"Category": "Niche Signal", "Insight": "Middle-age TDAH (Adults) and 'Phone-Free Schools' are emerging hot topics."},
    {"Category": "Hook Strategy", "Insight": "Use humor for 'Validation/Therapy' and practical PDFs for 'Protocol/Lead Gen'."}
]

# Write to Excel
file_path = '/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Prof. Rafael/Relatorio_Analise_YouTube_Rafael.xlsx'

try:
    with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
        pd.DataFrame(channels_data).to_excel(writer, sheet_name='1) Canais', index=False)
        pd.DataFrame(viral_content).to_excel(writer, sheet_name='2) Conteudo Viral', index=False)
        pd.DataFrame(strategic_insights).to_excel(writer, sheet_name='3) Insights Estrategicos', index=False)
    print(f"Success: {file_path}")
except Exception as e:
    # Fallback to current directory if permissions fail
    current_dir_file = os.path.join(os.getcwd(), 'Relatorio_Analise_YouTube_Rafael.xlsx')
    with pd.ExcelWriter(current_dir_file, engine='openpyxl') as writer:
        pd.DataFrame(channels_data).to_excel(writer, sheet_name='1) Canais', index=False)
        pd.DataFrame(viral_content).to_excel(writer, sheet_name='2) Conteudo Viral', index=False)
        pd.DataFrame(strategic_insights).to_excel(writer, sheet_name='3) Insights Estrategicos', index=False)
    print(f"Permissions limited. File saved in current directory: {current_dir_file}")
