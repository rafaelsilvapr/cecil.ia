import os
import struct
from google import genai
from google.genai import types

# ============================================================
# Soul Anchored — Voice Casting (Gemini 2.5 TTS)
# FIXED: Adds WAV header to raw PCM output from Google AI Studio
# ============================================================

GEMINI_API_KEY = "AIzaSyCHHoFNBL9giPE3m7fUhLNcHMEVVFrk980"
client = genai.Client(api_key=GEMINI_API_KEY)

# Batch 2: Additional male/deep candidates
VOICES = ["algenib", "alnilam", "enceladus", "iapetus"]

def save_as_wav(raw_data, filename, sample_rate=24000):
    """Wraps raw PCM data into a valid WAV container."""
    num_channels = 1
    bits_per_sample = 16
    
    header = struct.pack('<4sI4s4sIHHIIHH4sI',
        b'RIFF', 36 + len(raw_data), b'WAVE',
        b'fmt ', 16, 1, num_channels, sample_rate,
        sample_rate * num_channels * bits_per_sample // 8,
        num_channels * bits_per_sample // 8, bits_per_sample,
        b'data', len(raw_data))
    
    with open(filename, 'wb') as f:
        f.write(header + raw_data)

def run_voice_casting():
    text = "The Lord is my shepherd; I shall not want. May His peace be with you today and always. Amen."
    
    print(f"📖 Text for casting: \"{text}\"\n")
    
    for voice_name in VOICES:
        print(f"🎤 Generating with voice: {voice_name}...")
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash-preview-tts',
                contents=text,
                config=types.GenerateContentConfig(
                    speech_config=types.SpeechConfig(
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(
                                voice_name=voice_name
                            )
                        )
                    ),
                    response_modalities=["AUDIO"]
                )
            )
            
            for i, part in enumerate(response.candidates[0].content.parts):
                if part.inline_data:
                    filename = f"voice_casting_{voice_name.lower()}.wav"
                    output_path = os.path.join("/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/CEO project/Produção de conteúdo/Silva.IA/Soul Anchored/scripts", filename)
                    save_as_wav(part.inline_data.data, output_path)
                    print(f"  ✅ Saved with valid header: {output_path}")
                    
        except Exception as e:
            print(f"  ⚠️ Error with voice {voice_name}: {str(e)}")

if __name__ == "__main__":
    run_voice_casting()
