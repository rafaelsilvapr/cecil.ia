import os
from google import genai

GEMINI_API_KEY = "AIzaSyCHHoFNBL9giPE3m7fUhLNcHMEVVFrk980"
client = genai.Client(api_key=GEMINI_API_KEY)

def test_contextual_verse():
    test_paragraphs = [
        "Neste momento de quietude, entregamos nossas preocupações ao Senhor. Ele é nossa rocha e salvação.",
        "A natureza reflete a glória de Deus. O som das águas nos lembra da Sua paz infinita.",
        "Peça e lhe será dado. Busque e encontrará. A fé remove montanhas e acalma tempestades."
    ]
    
    print("🧠 Testando Seleção Contextual de Versículos:\n")
    
    for i, para in enumerate(test_paragraphs):
        prompt = f"""
        Based on the following spiritual text, provide a relevant Bible Verse (Short, impactfull) in Portuguese.
        Only return the verse and the reference, example: 'Porque Deus amou o mundo de tal maneira... (João 3:16)'
        TEXT: \"{para}\"
        """
        response = client.models.generate_content(
            model='gemini-flash-latest',
            contents=prompt
        )
        verse = response.text.strip()
        print(f"Segmento {i+1}: \"{para[:50]}...\"")
        print(f"✨ Versículo Sugerido: {verse}\n")

if __name__ == "__main__":
    test_contextual_verse()
