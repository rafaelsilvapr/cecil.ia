import os
from google import genai
from google.genai import types

# ============================================================
# Gemini (Google AI Studio) TTS Test Script — Specialized TTS Model
# ============================================================

GEMINI_API_KEY = "AIzaSyCHHoFNBL9giPE3m7fUhLNcHMEVVFrk980"
client = genai.Client(api_key=GEMINI_API_KEY)

def test_gemini_tts_specialized():
    # Use the specialized TTS model identified in list_models
    model_id = 'gemini-2.5-flash-preview-tts'
    
    text = "Welcome to Soul Anchored. This is a test of the Google AI Studio voices for our looping videos. May you find peace in His presence."
    
    print(f"🎤 Testing specialized Speech Generation with {model_id}...")
    
    try:
        response = client.models.generate_content(
            model=model_id,
            contents=text,
            config=types.GenerateContentConfig(
                # For specialized TTS models, sometimes the modality is automatically handled
                # but we'll specify it to be sure.
                response_modalities=["AUDIO"]
            )
        )
        
        has_audio = False
        for i, part in enumerate(response.candidates[0].content.parts):
            if part.inline_data:
                with open("output_soul_narration.wav", "wb") as f:
                    f.write(part.inline_data.data)
                print(f"✅ Success! Narration saved as output_soul_narration.wav")
                has_audio = True
        
        if not has_audio:
            print("❌ No audio data found. Model output text instead:")
            print(response.text)
            
    except Exception as e:
        print(f"⚠️ Error: {str(e)}")

if __name__ == "__main__":
    test_gemini_tts_specialized()
