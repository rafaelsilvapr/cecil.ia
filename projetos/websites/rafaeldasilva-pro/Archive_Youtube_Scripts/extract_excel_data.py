import pandas as pd
import json
import os

file_path = '/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Prof. Rafael/Mapa de concorrentes e conteudo viral - Professor Rafael - YouTube.xlsx'

def extract_data():
    try:
        xl = pd.ExcelFile(file_path)
        
        # 1. Read Canais tab
        df_canais = pd.read_excel(file_path, sheet_name=xl.sheet_names[0]) # Assuming Canais is first
        # Filter for "Confirmado" in some column. Let's find the column.
        # Columns might be: 'Canal', 'URL', 'Status', etc.
        confirmed_channels = []
        
        # Find column with "Confirmado"
        status_col = None
        for col in df_canais.columns:
            if df_canais[col].astype(str).str.contains('Confirmado', case=False, na=False).any():
                status_col = col
                break
        
        if status_col:
            df_confirmed = df_canais[df_canais[status_col].astype(str).str.contains('Confirmado', case=False, na=False)]
            for _, row in df_confirmed.iterrows():
                # Find URL column
                url = None
                for col in df_canais.columns:
                    val = str(row[col])
                    if 'youtube.com' in val:
                        url = val
                        break
                
                name = row[df_canais.columns[0]] # Assume first col is name
                confirmed_channels.append({'name': name, 'url': url})
        
        # 2. Read Critérios Viral tab
        # Sheet 3 according to user comment
        df_criterios = pd.read_excel(file_path, sheet_name=xl.sheet_names[2])
        criterios = df_criterios.to_dict(orient='records')
        
        result = {
            'confirmed_channels': confirmed_channels,
            'criterios_viral': criterios,
            'sheet_names': xl.sheet_names
        }
        
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_data()
