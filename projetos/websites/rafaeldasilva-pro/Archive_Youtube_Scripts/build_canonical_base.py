import pandas as pd
import os
import shutil
from datetime import datetime

# Definir Caminho Canônico (Apenas Prof. Rafael)
base_path = '/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Prof. Rafael'
canonical_file = os.path.join(base_path, 'Relatorio_Auditoria_YouTube_Rafael_Base_Limpa.xlsx')

data_coleta = datetime.now().strftime("%Y-%m-%d")

# 1) Changelog
changelog_data = [
    {"Data Revisão": "2026-03-30", "Alteração": "Criação da Base Limpa Canônica", "Detalhe": "Centralização do arquivo em Prof. Rafael."},
    {"Data Revisão": "2026-03-30", "Alteração": "Higienização da Shortlist", "Detalhe": "Sir Ken Robinson e Dado Schneider marcados explicitamente como Fora do Core."},
    {"Data Revisão": "2026-03-30", "Alteração": "Correção de Ambiguidade de Formatos", "Detalhe": "Criadas abas separadas para Long-Form e Shorts. Viral Score não é mais global."},
    {"Data Revisão": "2026-03-30", "Alteração": "Preparação para Coleta Massiva", "Detalhe": "Adição de colunas de rastreabilidade: URL, Data de Coleta, Baseline (Mediana), Confiança e Observações."},
    {"Data Revisão": "2026-03-30", "Alteração": "Hipóteses Isoladas", "Detalhe": "Separados Sinais de Ouro em uma aba própria, marcados como Fato ou Hipótese Provisória."}
]

# 2) Shortlist Core e Adjacentes
canais_estruturados = [
    {"Canal": "Rede Pedagógica", "Categoria Final": "Core Benchmark", "Motivo": "Formação Continuada massiva para o professor", "Ação Próxima Fase": "Coletar 20 Longos + 20 Shorts"},
    {"Canal": "SOS Educação", "Categoria Final": "Core Benchmark", "Motivo": "Família-Escola / Conflitos do dia a dia", "Ação Próxima Fase": "Coletar 20 Longos + 20 Shorts"},
    {"Canal": "Thaís Faria Coelho", "Categoria Final": "Core Benchmark", "Motivo": "Dor principal de tempo: Planejamento rápido", "Ação Próxima Fase": "Coletar 20 Longos + 20 Shorts"},
    {"Canal": "Mr. Napoles", "Categoria Final": "Core Benchmark", "Motivo": "Rotina lúdica do Professor / Recursos TPT", "Ação Próxima Fase": "Coletar 20 Longos + 20 Shorts"},
    {"Canal": "Not So Wimpy Teacher", "Categoria Final": "Core Benchmark", "Motivo": "Didática tática e Organização de sala", "Ação Próxima Fase": "Coletar 20 Longos + 20 Shorts"},
    {"Canal": "Diogo Almeida", "Categoria Final": "Core Benchmark", "Motivo": "Humor e Identificação emocional da classe", "Ação Próxima Fase": "Coletar 20 Longos + 20 Shorts"},
    {"Canal": "Leo Fraiman", "Categoria Final": "Core Benchmark", "Motivo": "Psicologia e Resgate da Autoridade Parental/Docente", "Ação Próxima Fase": "Coletar 20 Longos + 20 Shorts"},
    {"Canal": "Jonathan Haidt", "Categoria Final": "Adjacente Útil", "Motivo": "Contexto Ansiedade Digital nas Escolas", "Ação Próxima Fase": "Analisar apenas vídeos/shorts altamente específicos para educadores"},
    {"Canal": "Simon Sinek", "Categoria Final": "Adjacente Útil", "Motivo": "Liderança Humanizada e Gestão de Gerações", "Ação Próxima Fase": "Analisar apenas vídeos sobre Millenials/Gen Z/Confiança"},
    {"Canal": "Sir Ken Robinson", "Categoria Final": "Fora do Core", "Motivo": "Sem frequência tática atual, apenas tese fundacional histórica", "Ação Próxima Fase": "Nenhuma coleta sistemática requerida."},
    {"Canal": "Dado Schneider", "Categoria Final": "Fora do Core", "Motivo": "Foco predominante corporativo e baixa atividade recente", "Ação Próxima Fase": "Nenhuma coleta sistemática requerida."}
]

# 3) Setup Coleta Long-Form
long_form_template = pd.DataFrame(columns=[
    "Canal", "URL do Vídeo", "Data da Coleta", "Fonte da Métrica", 
    "Baseline Usado (Ex: Mediana 20 Longos)", "Views Totais", "Views/Dia", 
    "Comentários/1k", "Likes/1k", "Retenção/AVD (Se Público)",
    "Viral_Score_Long (Base: Formato Longo)", "Sinal_Demanda (Extração dos comentários)", 
    "Nível_Confiança (Ex: Alta se Amostra>20)", "Observação_Incerteza"
])

# 4) Setup Coleta Shorts
shorts_template = pd.DataFrame(columns=[
    "Canal", "URL do Short", "Data da Coleta", "Fonte da Métrica", 
    "Baseline Usado (Ex: Mediana 20 Shorts)", "Views Totais", "Velocidade_Tracao (Views 1a semana ou Média/Dia)", 
    "Comentários/1k", "Likes/1k", 
    "Viral_Score_Shorts (Base: Formato Short)", "Sinal_Identificacao/Reatividade", 
    "Nível_Confiança (Ex: Limitada se <20 Shorts no canal)", "Observação_Incerteza"
])

# 5) Hipóteses Editoriais e Sinais Globais (Limpos e Marcados)
hipoteses_estrategicas = [
    {
        "Tema Estratégico": "Eficiência e Economia de Tempo", 
        "Origem": "Thaís Faria Coelho (Ex: Aula em 30 min)", 
        "Status da Leitura": "Hipótese Editorial a Testar",
        "Confiança Preliminar": "Média (Identificado 1 grande outlier, precisa validação na amostra completa)",
        "Observação de Incerteza": "O canal posta com baixa frequência, o peso desse insight depende se é um lançamento isolado ou demanda perene."
    },
    {
        "Tema Estratégico": "Catarse Legal e Identificação do Professor", 
        "Origem": "Diogo Almeida / SOS Educação", 
        "Status da Leitura": "Validação Forte",
        "Confiança Preliminar": "Alta (Padrão repetido consistentemente na amostra de Shorts de Diogo)",
        "Observação de Incerteza": "Nenhuma incerteza sobre a dor, o teste será descobrir como materializar isso terapeuticamente sem ser apenas fofoca escolar."
    },
    {
        "Tema Estratégico": "Limites e Resgate da Autoridade Docente", 
        "Origem": "Leo Fraiman (Mãe C.H.A.T.A)", 
        "Status da Leitura": "Hipótese de Conteúdo Longo",
        "Confiança Preliminar": "Média",
        "Observação de Incerteza": "Desempenho alto nas Lives recentes, testar se recortes (Shorts) desse tema retêm o espectador."
    },
    {
        "Tema Estratégico": "A Crise da Atenção (Escolas sem Smartphone)", 
        "Origem": "Jonathan Haidt", 
        "Status da Leitura": "Framing Global / Adjacente",
        "Confiança Preliminar": "Alta como contexto, Baixa como formato tático",
        "Observação de Incerteza": "Não tentar imitar o formato documentário de Haidt, mas usar a teoria dele como 'vilão' nas narrativas do Prof. Rafael."
    }
]

# Write function
def generate_excel():
    success_path = ""
    try:
        # Purgar backups velhos na pasta Prof Rafael
        backup_dir = os.path.join(base_path, "Bkp_Fase1_Antigos")
        os.makedirs(backup_dir, exist_ok=True)
        # Scan and move old files
        for f in os.listdir(base_path):
            if f.endswith(".xlsx") and "Base_Limpa" not in f:
                try:
                    shutil.move(os.path.join(base_path, f), os.path.join(backup_dir, f))
                except Exception as e:
                    pass

        # Construir o arquivo definitivo
        with pd.ExcelWriter(canonical_file, engine='openpyxl') as writer:
            pd.DataFrame(changelog_data).to_excel(writer, sheet_name='0_Changelog_Revisao', index=False)
            pd.DataFrame(canais_estruturados).to_excel(writer, sheet_name='1_Estrutura_Canais', index=False)
            long_form_template.to_excel(writer, sheet_name='2_Setup_Coleta_Longs', index=False)
            shorts_template.to_excel(writer, sheet_name='3_Setup_Coleta_Shorts', index=False)
            pd.DataFrame(hipoteses_estrategicas).to_excel(writer, sheet_name='4_Hipoteses_Sinais', index=False)

        success_path = canonical_file
    except Exception as e:
        # Se permission denied ocorrer, salva em Desktop ou local do script como Fallback emergencial mas DEVE tentar forçar o caminho canônico
        fallback = os.path.expanduser('~/Desktop/Relatorio_Auditoria_YouTube_Rafael_Base_Limpa.xlsx')
        with pd.ExcelWriter(fallback, engine='openpyxl') as writer:
            pd.DataFrame(changelog_data).to_excel(writer, sheet_name='0_Changelog_Revisao', index=False)
            pd.DataFrame(canais_estruturados).to_excel(writer, sheet_name='1_Estrutura_Canais', index=False)
            long_form_template.to_excel(writer, sheet_name='2_Setup_Coleta_Longs', index=False)
            shorts_template.to_excel(writer, sheet_name='3_Setup_Coleta_Shorts', index=False)
            pd.DataFrame(hipoteses_estrategicas).to_excel(writer, sheet_name='4_Hipoteses_Sinais', index=False)
        success_path = fallback
        print("ERR_PERM_FALLBACK")
        
    print(f"DONE|{success_path}")

if __name__ == "__main__":
    generate_excel()
