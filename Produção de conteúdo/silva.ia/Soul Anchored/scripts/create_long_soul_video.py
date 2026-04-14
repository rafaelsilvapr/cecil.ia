import os
import struct
import argparse
import json
import re
from google import genai
from google.genai import types
from moviepy import VideoFileClip, AudioFileClip, CompositeAudioClip, ImageClip, ColorClip, CompositeVideoClip, concatenate_audioclips
import moviepy.video.fx as vfx
from PIL import Image, ImageDraw, ImageFont
import numpy as np

# ============================================================
# Soul Anchored — Long-form Video Automation (Advanced)
# Pipeline: Long Text -> Paragraph Chunks -> Contextual Verses -> Video Loop + Overlays
# ============================================================

GEMINI_API_KEY = "AIzaSyCHHoFNBL9giPE3m7fUhLNcHMEVVFrk980"
client = genai.Client(api_key=GEMINI_API_KEY)
VOICE_NAME = "charon"
FONT_PATH = "/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/CEO project/Produção de conteúdo/Silva.IA/Soul Anchored/assets/fonts/Montserrat-Bold.ttf"

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

def generate_narration_chunk(text, output_path):
    """Generates TTS for a single chunk."""
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash-preview-tts',
            contents=text,
            config=types.GenerateContentConfig(
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=VOICE_NAME)
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
        print(f"❌ Chunk TTS Error: {str(e)}")
    return False

def get_contextual_verse(text_context):
    """Asks Gemini to find a relevant Bible verse for the given context."""
    prompt = f"""
    Based on the following spiritual text, provide a relevant Bible Verse (Short, impactfull) in Portuguese.
    Only return the verse and the reference, example: 'Porque Deus amou o mundo de tal maneira... (João 3:16)'
    TEXT: \"{text_context}\"
    """
    try:
        response = client.models.generate_content(
            model='gemini-flash-latest',
            contents=prompt
        )
        return response.text.strip()
    except:
        return ""

def create_text_clip(text, duration, video_size):
    """Fallback: Creates a Text Clip using PIL if ImageMagick is missing."""
    w, h = video_size
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Gold color from brand
    gold_color = (255, 215, 0, 255) 
    
    try:
        font = ImageFont.truetype(FONT_PATH, 40)
    except:
        font = ImageFont.load_default()

    # Simple text wrapping and centering
    lines = []
    width_limit = w * 0.8
    words = text.split()
    current_line = []
    for word in words:
        test_line = " ".join(current_line + [word])
        # Use a better measure if needed, for now simple
        if len(test_line) * 20 < width_limit:
            current_line.append(word)
        else:
            lines.append(" ".join(current_line))
            current_line = [word]
    lines.append(" ".join(current_line))

    y_offset = h * 0.75 # Lower third
    for line in lines:
        # draw.text((w/2, y_offset), line, font=font, fill=gold_color, anchor="mm")
        # In case of older PIL
        left, top, right, bottom = draw.textbbox((0, 0), line, font=font)
        text_w = right - left
        draw.text(((w - text_w) / 2, y_offset), line, font=font, fill=gold_color)
        y_offset += 50

    return ImageClip(np.array(img)).with_duration(duration)

def create_long_video(full_text, background_video_path, output_video_path, music_path=None):
    # 1. Chunking logic (by paragraph or sentence count)
    paragraphs = [p.strip() for p in full_text.split("\n") if p.strip()]
    
    print(f"🎬 Processing {len(paragraphs)} segments...")
    
    audio_clips = []
    text_overlays = []
    current_time = 0.0
    
    temp_files = []
    
    for i, para in enumerate(paragraphs):
        temp_name = f"temp_chunk_{i}.wav"
        if generate_narration_chunk(para, temp_name):
            clip = AudioFileClip(temp_name)
            duration = clip.duration
            audio_clips.append(clip)
            temp_files.append(temp_name)
            
            # Contextual Verse for this segment
            # We show a verse every ~30 seconds or so to avoid clutter, or on specific segments
            if i % 2 == 0: 
                verse = get_contextual_verse(para)
                if verse:
                    # Create Text Clip (MoviePy 2.x syntax)
                    # Note: You might need to adjust font handling based on local setup
                    # For now, using a simple placeholder logic for overlay
                    text_overlays.append({
                        "text": verse,
                        "start": current_time,
                        "duration": min(duration, 10) # Show for segment duration or max 10s
                    })
            
            current_time += duration
        else:
            print(f"⚠️ Failed to generate chunk {i}")

    if not audio_clips:
        print("❌ No audio generated.")
        return

    # 2. Final Audio Assembly
    final_audio_track = concatenate_audioclips(audio_clips)
    total_duration = final_audio_track.duration

    # 3. Background Video Loop
    bg_video = VideoFileClip(background_video_path)
    try:
        final_bg = bg_video.with_effects([vfx.Loop(duration=total_duration)])
    except:
        final_bg = vfx.Loop(bg_video, duration=total_duration)

    # 4. Mix with Music
    final_audio_list = [final_audio_track]
    if music_path and os.path.exists(music_path):
        bg_music = AudioFileClip(music_path)
        try:
            bg_music = bg_music.multiply_volume(0.1).with_effects([vfx.Loop(duration=total_duration)])
        except:
            bg_music = bg_music.volumex(0.1)
            bg_music = vfx.Loop(bg_music, duration=total_duration)
        final_audio_list.append(bg_music)
    
    final_mixed_audio = CompositeAudioClip(final_audio_list)
    
    # 5. Assemble Video with overlays
    video_segments = [final_bg]
    
    for overlay in text_overlays:
        t_clip = create_text_clip(overlay['text'], overlay['duration'], final_bg.size)
        t_clip = t_clip.with_start(overlay['start'])
        video_segments.append(t_clip)

    final_video = CompositeVideoClip(video_segments).with_audio(final_mixed_audio)
    
    # For now, printing the overlays intended logic. 
    print(f"✨ Rendering {len(text_overlays)} contextual overlays.")
    for overlay in text_overlays:
        print(f"  - [{overlay['start']:.1f}s] {overlay['text']}")

    final_video.write_videofile(output_video_path, fps=24, codec="libx264", audio_codec="aac")

    # Cleanup
    for f in temp_files:
        if os.path.exists(f): os.remove(f)
    print(f"✅ Long video ready: {output_video_path}")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--text", required=True)
    parser.add_argument("--bg", required=True)
    parser.add_argument("--out", default="long_production.mp4")
    parser.add_argument("--music", help="Background music path")
    args = parser.parse_args()

    # Read text if it's a file path
    if os.path.exists(args.text):
        with open(args.text, 'r') as f:
            text_content = f.read()
    else:
        text_content = args.text

    create_long_video(text_content, args.bg, args.out, args.music)

if __name__ == "__main__":
    main()
