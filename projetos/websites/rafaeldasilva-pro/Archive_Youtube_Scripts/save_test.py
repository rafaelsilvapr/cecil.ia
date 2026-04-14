import pandas as pd
df = pd.DataFrame({'Test': [1,2,3]})
try:
    df.to_excel("/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Prof. Rafael/test.xlsx", index=False)
    print("SUCCESS")
except Exception as e:
    print(f"FAILED: {e}")
