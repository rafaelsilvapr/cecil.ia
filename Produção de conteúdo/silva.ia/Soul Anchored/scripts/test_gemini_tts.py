import os
import google.generativeai as genai

# ============================================================
# Gemini TTS Test Script
# Using Google AI Studio voices via Gemini API
# ============================================================

GEMINI_API_KEY = "AIzaSyCHHoFNBL9giPE3m7fUhLNcHMEVVFrk980"
genai.configure(api_key=GEMINI_API_KEY)

def test_gemini_tts():
    # Model with speech capabilities (Gemini 2.0 Flash or Pro usually)
    # Note: Using 1.5-flash as it's common and supports many features
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    # Prompt for TTS
    # In the current SDK, we can use the speech generation feature if available
    # or prompt the model to provide audio output.
    
    text = "Welcome to Soul Anchored. Today we will explore the power of God's presence in your morning routine."
    
    print(f"🎤 Requesting speech generation for: '{text}'")
    
    try:
        # Note: The specific TTS syntax for google-generativeai might vary 
        # based on the latest SDK version. Currently, most users generate 
        # text and then use a separate TTS, but Gemini can generate audio.
        # Let's try the multimodal generation if supported.
        
        response = model.generate_content(
            f"Please read this text aloud in a calm, solene, and professional male voice: {text}",
            generation_config={"response_mime_type": "audio/wav"} # Experimental mapping
        )
        
        # If the API supports direct audio output, it will be in the response parts
        for part in response.candidates[0].content.parts:
            if part.inline_data:
                with open("output_narration.wav", "wb") as f:
                    f.write(part.inline_data.data)
                print("✅ Success! Narration saved to output_narration.wav")
                return True
                
        print("❌ No audio data found in response.")
        print(f"Response text: {response.text}")
        return False
        
    except Exception as e:
        print(f"⚠️ Error during TTS test: {str(e)}")
        return False

if __name__ == "__main__":
    test_gemini_tts()
