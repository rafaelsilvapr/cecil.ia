import pandas as pd
import sys

file_path = '/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Prof. Rafael/Mapa de concorrentes e conteudo viral - Professor Rafael - YouTube.xlsx'

try:
    xl = pd.ExcelFile(file_path)
    print(f"Sheet names: {xl.sheet_names}")
    for sheet in xl.sheet_names:
        df = pd.read_excel(file_path, sheet_name=sheet)
        print(f"\n--- Sheet: {sheet} ---")
        print(f"Columns: {df.columns.tolist()}")
        if not df.empty:
            print(f"First 2 rows:\n{df.head(2)}")
except Exception as e:
    print(f"Error reading file: {e}")
