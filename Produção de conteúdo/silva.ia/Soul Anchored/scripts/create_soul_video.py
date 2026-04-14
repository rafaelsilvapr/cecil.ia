import os
import struct
import argparse
from google import genai
from google.genai import types
from moviepy import VideoFileClip, AudioFileClip, CompositeAudioClip
import moviepy.video.fx as vfx

# ============================================================
# Soul Anchored — Master Video Automation
# Pipeline: Text -> Gemini TTS (Charon) -> Video Loop -> Mix
# ============================================================

GEMINI_API_KEY = "AIzaSyCHHoFNBL9giPE3m7fUhLNcHMEVVFrk980"
client = genai.Client(api_key=GEMINI_API_KEY)
VOICE_NAME = "charon"

def save_as_wav(raw_data, filename, sample_rate=24000):
    """Wraps raw PCM data from Gemini into a valid WAV container."""
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

def generate_narration(text, output_path):
    """Generates high-fidelity narration using Gemini 2.5 TTS."""
    print(f"🎤 Generating narration with Charon...")
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash-preview-tts',
            contents=text,
            config=types.GenerateContentConfig(
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name=VOICE_NAME
                        )
                    )
                ),
                response_modalities=["AUDIO"]
            )
        )
        for part in response.candidates[0].content.parts:
            if part.inline_data:
                save_as_wav(part.inline_data.data, output_path)
                return True
    except Exception as e:
        print(f"❌ TTS Error: {str(e)}")
    return False

def create_video(text, background_video_path, output_video_path, music_path=None):
    """Assembles the final video by looping background and mixing audio."""
    temp_audio = "temp_narration.wav"
    
    # 1. Generate Narration
    if not generate_narration(text, temp_audio):
        return

    print("🎬 Assembling video...")
    narration_audio = AudioFileClip(temp_audio)
    duration = narration_audio.duration

    # 2. Prepare Background Video (Looping)
    bg_video = VideoFileClip(background_video_path)
    
    # In MoviePy 2.x, effects are applied via with_effects or directly if methods exist
    try:
        final_bg = bg_video.with_effects([vfx.Loop(duration=duration)])
    except:
        try:
            final_bg = bg_video.loop(duration=duration)
        except:
            final_bg = vfx.Loop(bg_video, duration=duration)
    
    # 3. Handle Background Music (Optional)
    audio_tracks = [narration_audio]
    if music_path and os.path.exists(music_path):
        bg_music = AudioFileClip(music_path)
        try:
            bg_music = bg_music.multiply_volume(0.1)
        except:
            bg_music = bg_music.volumex(0.1)
            
        try:
            bg_music = bg_music.with_effects([vfx.Loop(duration=duration)])
        except:
            try:
                bg_music = bg_music.loop(duration=duration)
            except:
                bg_music = vfx.Loop(bg_music, duration=duration)
            
        audio_tracks.append(bg_music)
    
    final_audio = CompositeAudioClip(audio_tracks)
    
    # 4. Final Export
    # In MoviePy 2, set_audio is with_audio
    try:
        final_video = final_bg.with_audio(final_audio)
    except AttributeError:
        final_video = final_bg.set_audio(final_audio)
    
    final_video.write_videofile(output_video_path, fps=24, codec="libx264", audio_codec="aac")
    
    # Cleanup
    narration_audio.close()
    bg_video.close()
    if os.path.exists(temp_audio):
        os.remove(temp_audio)
    
    print(f"✅ Video created successfully: {output_video_path}")

def main():
    parser = argparse.ArgumentParser(description="Create a Soul Anchored video.")
    parser.add_argument("--text", required=True, help="Roteiro para narração")
    parser.add_argument("--bg", required=True, help="Caminho para o vídeo de fundo (paisagem)")
    parser.add_argument("--out", default="final_video.mp4", help="Caminho de saída")
    parser.add_argument("--music", help="Caminho opcional para trilha sonora")
    
    args = parser.parse_args()
    
    create_video(args.text, args.bg, args.out, args.music)

if __name__ == "__main__":
    main()
