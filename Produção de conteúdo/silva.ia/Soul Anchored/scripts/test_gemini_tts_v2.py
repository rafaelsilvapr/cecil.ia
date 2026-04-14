import os
from google import genai
from google.genai import types

# ============================================================
# Gemini (Google AI Studio) TTS Test Script — NEW SDK (v2)
# ============================================================

GEMINI_API_KEY = "AIzaSyCHHoFNBL9giPE3m7fUhLNcHMEVVFrk980"
client = genai.Client(api_key=GEMINI_API_KEY)

def test_gemini_tts_v2():
    text = "Welcome to Soul Anchored. This is a test of the Google AI Studio voices for our looping videos."
    
    print(f"🎤 Testing Speech Generation for: '{text}'")
    
    try:
        # The new SDK uses SpeechConfig for TTS
        # Voices available usually include: Aoide, Charon, Fenris, Kore, Puck
        # Let's try to generate with a specific voice
        
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=text,
            config=types.GenerateContentConfig(
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name='Puck' # 'Puck' is a common professional sounding voice
                        )
                    )
                ),
                # We need to specify the modality is audio
                response_modalities=["AUDIO"]
            )
        )
        
        # Check for audio in response
        has_audio = False
        for i, part in enumerate(response.candidates[0].content.parts):
            if part.inline_data:
                # Part.inline_data contains the audio data
                with open(f"output_v2_{i}.wav", "wb") as f:
                    f.write(part.inline_data.data)
                print(f"✅ Success! Part {i} saved as audio.")
                has_audio = True
        
        if not has_audio:
            print("❌ No audio data found in candidates.")
            print(f"Text response: {response.text}")
            
    except Exception as e:
        print(f"⚠️ Error with new SDK: {str(e)}")

if __name__ == "__main__":
    test_gemini_tts_v2()
