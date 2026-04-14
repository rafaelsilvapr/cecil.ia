import pandas as pd
from datetime import datetime

# Salvando localmente onde TEMOS PERMISSAO
canonical_file = 'Relatorio_Auditoria_YouTube_Rafael_Base_Limpa.xlsx'

changelog_data = [
    {"Data Revisão": "2026-03-30", "Alteração": "Criação da Base Limpa Canônica", "Detalhe": "Centralização do arquivo definitivo."},
    {"Data Revisão": "2026-03-30", "Alteração": "Higienização da Shortlist", "Detalhe": "Sir Ken Robinson e Dado Schneider excluídos (Fora do Core)."},
    {"Data Revisão": "2026-03-30", "Alteração": "Separação de Formatos", "Detalhe": "Criadas abas separadas para Long-Form e Shorts. Viral Score individualizado."},
    {"Data Revisão": "2026-03-30", "Alteração": "Preparação para Coleta Massiva", "Detalhe": "Estrutura com colunas de rastreabilidade (URL, Baseline/Mediana, Confiança, Incertezas)."},
    {"Data Revisão": "2026-03-30", "Alteração": "Hipóteses Isoladas", "Detalhe": "Sinais de demanda transpostos p/ aba analítica separada e marcados como 'Fato' ou 'Hipótese'."}
]

canais_estruturados = [
    {"Canal": "Rede Pedagógica", "Categoria": "Core Benchmark", "Motivo": "Formação Continuada massiva", "Ação": "Coletar 20 Longos + 20 Shorts"},
    {"Canal": "SOS Educação", "Categoria": "Core Benchmark", "Motivo": "Dores do dia a dia", "Ação": "Coletar 20 Longos + 20 Shorts"},
    {"Canal": "Thaís Faria Coelho", "Categoria": "Core Benchmark", "Motivo": "Dor de Tempo e Planejamento", "Ação": "Coletar 20 Longos + 20 Shorts"},
    {"Canal": "Mr. Napoles", "Categoria": "Core Benchmark", "Motivo": "Rotina do Professor/Recursos", "Ação": "Coletar 20 Longos + 20 Shorts"},
    {"Canal": "Not So Wimpy Teacher", "Categoria": "Core Benchmark", "Motivo": "Organização de Sala Pragmática", "Ação": "Coletar 20 Longos + 20 Shorts"},
    {"Canal": "Diogo Almeida", "Categoria": "Core Benchmark", "Motivo": "Humor e Identificação emocional", "Ação": "Coletar 20 Longos + 20 Shorts"},
    {"Canal": "Leo Fraiman", "Categoria": "Core Benchmark", "Motivo": "Psicologia Ativa e Autoridade", "Ação": "Coletar 20 Longos + 20 Shorts"},
    {"Canal": "Jonathan Haidt", "Categoria": "Adjacente Útil", "Motivo": "Contexto Ansiedade Digital", "Ação": "Filtrar narrativas táticas"},
    {"Canal": "Simon Sinek", "Categoria": "Adjacente Útil", "Motivo": "Liderança Humanizada", "Ação": "Clips de foco formativo"},
    {"Canal": "Sir Ken Robinson", "Categoria": "Fora do Core", "Motivo": "Sem tração / Sem foco diário", "Ação": "Nenhuma coleta sistemática requerida."},
    {"Canal": "Dado Schneider", "Categoria": "Fora do Core", "Motivo": "Corporativo distante da sala", "Ação": "Nenhuma coleta sistemática requerida."}
]

long_template = pd.DataFrame(columns=[
    "Canal", "URL do Vídeo", "Data da Coleta", "Fonte da Métrica", 
    "Baseline Usado (Ex: Mediana 20 Longos)", "Views Totais", "Views/Dia", 
    "Comentários/1k", "Likes/1k", "Retenção", "Viral_Score_Long", "Sinal_Demanda", 
    "Nível_Confiança (Amostra>=20)", "Observação_Incerteza"
])

shorts_template = pd.DataFrame(columns=[
    "Canal", "URL do Short", "Data da Coleta", "Fonte da Métrica", 
    "Baseline Usado (Ex: Mediana 20 Shorts)", "Views Totais", "Velocidade_Tracao", 
    "Comentários/1k", "Likes/1k", "Viral_Score_Shorts", "Sinal_Identificacao", 
    "Nível_Confiança", "Observação_Incerteza"
])

hipoteses = [
    {"Tema Estratégico": "Catarse Legal Externa (Pais Helicópteros)", "Origem": "Diogo Almeida", "Status": "Fato Validado", "Confiança": "Alta"},
    {"Tema Estratégico": "Eficiência e Tempo de Planejamento", "Origem": "Thaís Faria Coelho", "Status": "Hipótese a Validar", "Confiança": "Média/Alta"},
    {"Tema Estratégico": "Autoridade Docente via Limites Rápidos", "Origem": "Leo Fraiman", "Status": "Hipótese", "Confiança": "Média"},
    {"Tema Estratégico": "Crise de Foco Digital na Sala", "Origem": "J. Haidt", "Status": "Framing Acadêmico", "Confiança": "Sólida, mas abstrata"}
]

with pd.ExcelWriter(canonical_file, engine='openpyxl') as writer:
    pd.DataFrame(changelog_data).to_excel(writer, sheet_name='0_Changelog_Revisao', index=False)
    pd.DataFrame(canais_estruturados).to_excel(writer, sheet_name='1_Estrutura_Canais', index=False)
    long_template.to_excel(writer, sheet_name='2_Setup_Coleta_Longs', index=False)
    shorts_template.to_excel(writer, sheet_name='3_Setup_Coleta_Shorts', index=False)
    pd.DataFrame(hipoteses).to_excel(writer, sheet_name='4_Hipoteses_Sinais', index=False)
