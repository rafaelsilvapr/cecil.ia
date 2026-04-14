import os
from google import genai

GEMINI_API_KEY = "AIzaSyCHHoFNBL9giPE3m7fUhLNcHMEVVFrk980"
client = genai.Client(api_key=GEMINI_API_KEY)

def list_models():
    print("📋 Modelos Disponíveis:")
    for m in client.models.list():
        print(f" - {m.name} (Supports: {m.supported_actions})")

if __name__ == "__main__":
    list_models()
