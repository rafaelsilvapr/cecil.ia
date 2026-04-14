import os
import argparse
import json
import sys
from moviepy import VideoFileClip, ImageClip, CompositeVideoClip, ColorClip, TextClip
from PIL import Image, ImageDraw, ImageOps

sys.path.append(os.path.dirname(__file__))
from analysis_memory import print_recent_entries

# ============================================================
# Professor Rafael — Video Engine (Prototype)
# Pipeline: Face Video -> Background Overlay -> Captions
# ============================================================

ASSETS_DIR = os.path.join(os.path.dirname(__file__), "assets")
BG_PATH = os.path.join(ASSETS_DIR, "canvas_content.jpg")
FONT_PATH = os.path.join(ASSETS_DIR, "font.ttf")

def create_circular_mask(size):
    """Creates a circular mask for the video overlay."""
    mask = Image.new('L', size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0) + size, fill=255)
    return mask

def process_video(face_video_path, output_path, react_mode=False, test_mode=False):
    """
    Composes the video with the Rafael Brand aesthetic.
    """
    if test_mode:
        print("🧪 Test Mode: Generating a 5-second sample with a color clip.")
        face_clip = ColorClip(size=(400, 400), color=(200, 100, 100)).with_duration(5)
    elif not os.path.exists(face_video_path):
        print(f"❌ Input video not found: {face_video_path}")
        return
    else:
        face_clip = VideoFileClip(face_video_path)
    
    duration = face_clip.duration
    
    # 2. Background (Brand Texture/Canvas)
    bg_img = Image.open(BG_PATH).convert("RGB")
    # Resize bg to match standard vertical video if needed (9:16)
    # For prototype, we'll assume the canvas is our base size
    bg_w, bg_h = bg_img.size
    bg_clip = ImageClip(BG_PATH).with_duration(duration)

    # 3. Face Overlay Logic
    # Resize face clip to fit nicely
    if react_mode:
        # PiP Style: Small face in corner
        face_clip_resized = face_clip.resized(width=bg_w * 0.35)
        pos = ("right", "top")
    else:
        # Authority Style: Centered face
        face_clip_resized = face_clip.resized(width=bg_w * 0.8)
        pos = ("center", "center")

    # Add a subtle border/shadow (Simulation for prototype)
    # In MoviePy v2, we use with_position and with_mask
    
    # 4. Final Composition
    final_video = CompositeVideoClip([
        bg_clip,
        face_clip_resized.with_position(pos)
    ])

    # 5. Captions (Placeholder for SRT logic)
    # In the full version, we'd use Gemini Flash to generate SRT and render here
    print("💬 Note: Auto-captioning logic is being integrated via Gemini Flash timestamps.")

    final_video.write_videofile(output_path, fps=24, codec="libx264", audio_codec="aac")
    print(f"✅ Video Generated: {output_path}")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", help="Path to the face video")
    parser.add_argument("--out", default="rafael_production.mp4")
    parser.add_argument("--react", action="store_true", help="Use PiP layout for reacts")
    parser.add_argument("--test", action="store_true", help="Generate a sample video using a color clip")
    args = parser.parse_args()

    # Consulta o historico antes de produzir um novo video.
    print_recent_entries(limit=2)

    if args.test:
        process_video(None, "test_rafael_video.mp4", react_mode=args.react, test_mode=True)
    elif args.input:
        process_video(args.input, args.out, args.react)
    else:
        print("💡 Usage: python create_rafael_video.py --input video.mp4")

if __name__ == "__main__":
    main()
