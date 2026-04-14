import pandas as pd
import datetime

old_file = "Relatorio_Auditoria_YouTube_Rafael_Base_Preenchida.xlsx"
new_file = "Relatorio_Auditoria_YouTube_Rafael_Base_Consolidada_Final.xlsx"

# Lendo abas existentes
df_cl = pd.read_excel(old_file, sheet_name="0_Changelog_Revisao")
df_es = pd.read_excel(old_file, sheet_name="1_Estrutura_Canais")
df_l = pd.read_excel(old_file, sheet_name="2_Setup_Coleta_Longs")
df_s = pd.read_excel(old_file, sheet_name="3_Setup_Coleta_Shorts")
df_hi = pd.read_excel(old_file, sheet_name="4_Hipoteses_Sinais")

# 1. Update 0_Changelog_Revisao
hoje = datetime.datetime.now().strftime("%Y-%m-%d")
new_cl_row = {
    "Data": hoje,
    "Ação / Correção": "Consolidação Final Fase 3: Correção de Cobertura e Rastreabilidade",
    "Motivo": "Exigência de remover ambiguidades ('concluído' vs 'parcial'), marcar explicitamente as limitações técnicas (404/layouts) e arquivar versões antigas.",
    "Impacto / Notas": "Criação da Aba 5_Limitacoes_Excecoes. Ajustes no Nível de Confiança onde a cobertura de 20/20 não foi alcançada."
}
df_cl = pd.concat([pd.DataFrame([new_cl_row]), df_cl], ignore_index=True)

# 2. Corrigir Rastreabilidade e Nível de Confiança nas planilhas de coleta
def update_confidence(row, format_type):
    channel = row['Canal']
    if 'Baixa' in row['Nível_Confiança']:
        count = row['Nível_Confiança'].split('(')[1].split()[0]
        return f"Limitada: Exibindo apenas {count} {format_type}s (Teto máximo disponível nesta aba)"
    elif 'Alta' in row['Nível_Confiança']:
        return "Concluída (Amostra 20/20 alcançada)"
    return row['Nível_Confiança']

df_l['Nível_Confiança'] = df_l.apply(lambda r: update_confidence(r, 'longo'), axis=1)
df_s['Nível_Confiança'] = df_s.apply(lambda r: update_confidence(r, 'short'), axis=1)

# 3. Criar Aba 5_Limitacoes_Excecoes
limitacoes = [
    {
        "Canal": "Rede Pedagógica",
        "Formato Limitado": "Shorts",
        "Amostra Alcançada": "16",
        "Meta Original": "20",
        "Razão da Ausência": "Apenas 16 Shorts disponíveis fisicamente no endpoint do canal sob esse formato.",
        "Status da Coleta": "Parcial e Rastreável"
    },
    {
        "Canal": "SOS Educação",
        "Formato Limitado": "Shorts / Longos",
        "Amostra Alcançada": "19 Longos / 0 Shorts",
        "Meta Original": "20 Longos / 20 Shorts",
        "Razão da Ausência": "Shorts: Erro 404 (Este canal não possui a aba Shorts ativada ou pública). Longos: O limite máximo da grade foi 19.",
        "Status da Coleta": "Parcial e Rastreável"
    },
    {
        "Canal": "Not So Wimpy Teacher",
        "Formato Limitado": "Shorts",
        "Amostra Alcançada": "17",
        "Meta Original": "20",
        "Razão da Ausência": "Apenas 17 Shorts listados no endpoint oficial da API yt-dlp.",
        "Status da Coleta": "Parcial e Rastreável"
    },
    {
        "Canal": "Leo Fraiman",
        "Formato Limitado": "Shorts / Longos",
        "Amostra Alcançada": "0",
        "Meta Original": "20 Longos / 20 Shorts",
        "Razão da Ausência": "Handles de URL fornecidos (`@leofraimanoficial` e `@leofraiman`) geraram HTTP 404 Not Found no momento da raspagem contínua via CLI. O canal deve utilizar uma formatação de sub-rotas não suportada pelo extrator genérico, resultando numa lacuna total (0).",
        "Status da Coleta": "Vazia (Lacuna / Buraco Exceção)"
    }
]
df_lim = pd.DataFrame(limitacoes)

# 4. Modificar Aba 1 (se tiver texto concluído pra parciais)
# Updating "Status Fase" conceptually in df_es
if 'Status da Audito/Coleta' not in df_es.columns:
    df_es['Status de Coleta Fase 3'] = ""

for idx, row in df_es.iterrows():
    ch = row['Canal']
    if ch in ['Thaís Faria Coelho', 'Mr. Napoles', 'Diogo Almeida']:
        df_es.at[idx, 'Status de Coleta Fase 3'] = "Totalmente Coletado (20/20)"
    elif ch in ['Rede Pedagógica', 'SOS Educação', 'Not So Wimpy Teacher']:
        df_es.at[idx, 'Status de Coleta Fase 3'] = "Cobertura Parcial (Ver Aba 5)"
    elif ch == 'Leo Fraiman':
        df_es.at[idx, 'Status de Coleta Fase 3'] = "Exceção / Ausência Total (Ver Aba 5)"
    else:
        df_es.at[idx, 'Status de Coleta Fase 3'] = "Não Coletado (Adjacente)"

# Gravação
with pd.ExcelWriter(new_file, engine='openpyxl') as writer:
    df_cl.to_excel(writer, sheet_name="0_Changelog_Revisao", index=False)
    df_es.to_excel(writer, sheet_name="1_Estrutura_Canais", index=False)
    df_l.to_excel(writer, sheet_name="2_Setup_Coleta_Longs", index=False)
    df_s.to_excel(writer, sheet_name="3_Setup_Coleta_Shorts", index=False)
    df_lim.to_excel(writer, sheet_name="5_Limitacoes_Excecoes", index=False)
    df_hi.to_excel(writer, sheet_name="4_Hipoteses_Sinais", index=False)

print(f"Base corrigida e convertida para o formato canônico estrito: {new_file}")
