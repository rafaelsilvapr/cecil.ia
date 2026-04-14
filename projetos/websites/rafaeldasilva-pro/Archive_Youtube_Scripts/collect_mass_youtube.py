import json
import subprocess
import pandas as pd
import datetime
import os
import sys

# Mapeamento estrito de canais autorizados (CORE + Adjacentes)
channels = {
    "Rede Pedagógica": "https://www.youtube.com/@redepedagogica",
    "SOS Educação": "https://www.youtube.com/@SOSEducacao",
    "Thaís Faria Coelho": "https://www.youtube.com/channel/UC3txF9dXx7xaoXjddU_1Xaw",
    "Mr. Napoles": "https://www.youtube.com/@MrNapoles",
    "Not So Wimpy Teacher": "https://www.youtube.com/@NotSoWimpyTeacher",
    "Diogo Almeida": "https://www.youtube.com/@DiogoAlmeidaOficial",
    "Leo Fraiman": "https://www.youtube.com/@leofraiman"
}

def extract_videos(channel_url, tab_type, limit=20):
    url = f"{channel_url}/{tab_type}"
    cmd = [
        "yt-dlp",
        "--dump-json",
        "--playlist-end", str(limit),
        "--ignore-errors",
        "--no-warnings",
        url
    ]
    try:
        proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        stdout, _ = proc.communicate()
    except Exception as e:
        print(f"Failed to extract {url}: {e}")
        return []

    results = []
    for line in stdout.strip().split('\n'):
        if not line.strip(): continue
        try:
            data = json.loads(line)
            results.append({
                "title": data.get("title", ""),
                "id": data.get("id", ""),
                "url": data.get("webpage_url", f"https://www.youtube.com/watch?v={data.get('id')}"),
                "duration": data.get("duration", 0),
                "view_count": data.get("view_count", 0) or 0,
                "like_count": data.get("like_count", 0) or 0,
                "comment_count": data.get("comment_count", 0) or 0,
                "upload_date": data.get("upload_date", "")
            })
        except json.JSONDecodeError:
            continue
    return results

def compute_days_passed(upload_date):
    if not upload_date or len(upload_date) != 8:
        return 1
    try:
        y, m, d = int(upload_date[:4]), int(upload_date[4:6]), int(upload_date[6:])
        dt = datetime.date(y, m, d)
        hoje = datetime.date.today()
        # Ensure at least 1 day passed to avoid division by zero
        return max(1, (hoje - dt).days)
    except:
        return 1

# Base output format
longs_final = []
shorts_final = []

print("Iniciando extração massiva (Fase 3)...")

for ch_name, ch_url in channels.items():
    print(f"Processando canal: {ch_name}")
    # Extract Longs
    longs_data = extract_videos(ch_url, "videos", 20)
    print(f" -> {ch_name} (Longos): {len(longs_data)} coletados")
    # Extract Shorts
    shorts_data = extract_videos(ch_url, "shorts", 20)
    print(f" -> {ch_name} (Shorts): {len(shorts_data)} coletados")

    # Medians
    median_longs = pd.Series([v["view_count"] for v in longs_data]).median() if longs_data else 0
    median_shorts = pd.Series([v["view_count"] for v in shorts_data]).median() if shorts_data else 0

    confianca_long = "Alta (Amostra 20)" if len(longs_data) == 20 else f"Baixa ({len(longs_data)} longos disponíveis)"
    confianca_short = "Alta (Amostra 20)" if len(shorts_data) == 20 else f"Baixa ({len(shorts_data)} shorts disponíveis)"

    data_coleta = datetime.datetime.now().strftime("%Y-%m-%d")

    for v in longs_data:
        days = compute_days_passed(v["upload_date"])
        views_dia = round(v["view_count"] / days, 1)
        vs = round(v["view_count"] / (median_longs if median_longs else 1), 2)
        c_1k = round((v["comment_count"] / max(v["view_count"], 1)) * 1000, 2)
        l_1k = round((v["like_count"] / max(v["view_count"], 1)) * 1000, 2)
        
        longs_final.append({
            "Canal": ch_name,
            "URL do Vídeo": v["url"],
            "Título": v["title"],
            "Duração (seg)": v["duration"],
            "Data da Publicação": v["upload_date"],
            "Data da Coleta": data_coleta,
            "Fonte da Métrica": "yt-dlp API",
            "Baseline Usado": f"Mediana ({median_longs})",
            "Views Totais": v["view_count"],
            "Views/Dia": views_dia,
            "Comentários/1k": c_1k,
            "Likes/1k": l_1k,
            "Retenção": "N/D",
            "Viral_Score_Long": vs,
            "Sinal_Demanda": "Outlier Confirmado" if vs > 2.5 else "Baixo Sinal",
            "Tipo_Sinal": "N/A",
            "Nível_Confiança": confianca_long,
            "Observação_Incerteza": ""
        })

    for v in shorts_data:
        days = compute_days_passed(v["upload_date"])
        vs = round(v["view_count"] / (median_shorts if median_shorts else 1), 2)
        c_1k = round((v["comment_count"] / max(v["view_count"], 1)) * 1000, 2)
        l_1k = round((v["like_count"] / max(v["view_count"], 1)) * 1000, 2)
        vel_tracao = round(v["view_count"] / days, 1) if days <= 7 else "Passado 7d"

        shorts_final.append({
            "Canal": ch_name,
            "URL do Short": v["url"],
            "Título": v["title"],
            "Duração (seg)": v["duration"],
            "Data da Publicação": v["upload_date"],
            "Data da Coleta": data_coleta,
            "Fonte da Métrica": "yt-dlp API",
            "Baseline Usado": f"Mediana ({median_shorts})",
            "Views Totais": v["view_count"],
            "Velocidade_Tracao (Views 1a semana ou Média)": vel_tracao,
            "Comentários/1k": c_1k,
            "Likes/1k": l_1k,
            "Viral_Score_Shorts": vs,
            "Sinal_Identificacao": "Sinal Forte de Reatividade" if vs > 2.5 else "Convencional",
            "Tipo_Sinal": "N/A",
            "Nível_Confiança": confianca_short,
            "Observação_Incerteza": ""
        })

# Carga do Baseline limpo original da fase 2 para consolidar
template_file = 'Relatorio_Auditoria_YouTube_Rafael_Base_Limpa.xlsx'
final_file = 'Relatorio_Auditoria_YouTube_Rafael_Base_Preenchida.xlsx'

try:
    with pd.ExcelWriter(final_file, engine='openpyxl') as writer:
        if os.path.exists(template_file):
            print("Preservando Changelog e Estrutura originais...")
            df_cl = pd.read_excel(template_file, sheet_name='0_Changelog_Revisao')
            df_cl.to_excel(writer, sheet_name='0_Changelog_Revisao', index=False)
            df_es = pd.read_excel(template_file, sheet_name='1_Estrutura_Canais')
            df_es.to_excel(writer, sheet_name='1_Estrutura_Canais', index=False)
            df_hi = pd.read_excel(template_file, sheet_name='4_Hipoteses_Sinais')
            df_hi.to_excel(writer, sheet_name='4_Hipoteses_Sinais', index=False)
        
        pd.DataFrame(longs_final).to_excel(writer, sheet_name='2_Setup_Coleta_Longs', index=False)
        pd.DataFrame(shorts_final).to_excel(writer, sheet_name='3_Setup_Coleta_Shorts', index=False)

    print(f"Sucesso! Dados consolidados gravados em: {final_file}")
except Exception as e:
    print(f"Erro ao consolidar no Excel: {e}")
