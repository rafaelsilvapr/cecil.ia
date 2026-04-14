import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

# ============================================================
# Soul Anchored — TikTok Thumbnail Generator
# Style: Sans-serif bold (Montserrat), Gold + White, Unified Identity
# Dimensions: 1080 x 1920 (9:16)
# ============================================================

ASSETS_DIR = "/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/CEO project/Produção de conteúdo/Silva.IA/Soul Anchored/assets"
FONTS_DIR = os.path.join(ASSETS_DIR, "fonts")

# Unified Brand Colors
COLOR_GOLD     = (212, 175, 55, 255)      # #D4AF37 — power words
COLOR_WHITE    = (255, 255, 255, 255)      # white — supporting text
COLOR_BLACK    = (0, 0, 0, 255)            # stroke/shadow


def smart_crop_vertical(bg, target_width, target_height):
    """Smart crop for TikTok 9:16 vertical format with face detection."""
    cv_img = np.array(bg.convert("RGB"))
    cv_img = cv_img[:, :, ::-1].copy()
    gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)

    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    target_ratio = target_width / target_height
    bg_ratio = bg.width / bg.height

    if len(faces) == 0:
        # No face: center crop
        if bg_ratio > target_ratio:
            new_width = int(bg.height * target_ratio)
            left = (bg.width - new_width) / 2
            return bg.crop((left, 0, left + new_width, bg.height)), -1
        else:
            new_height = int(bg.width / target_ratio)
            top = (bg.height - new_height) / 2
            return bg.crop((0, top, bg.width, top + new_height)), -1

    # Find largest face
    max_area = 0
    best_face = faces[0]
    for (x, y, w, h) in faces:
        if w * h > max_area:
            max_area = w * h
            best_face = (x, y, w, h)

    fx, fy, fw, fh = best_face
    face_center_x = fx + fw // 2
    face_center_y = fy + fh // 2

    if bg_ratio > target_ratio:
        new_width = int(bg.height * target_ratio)
        left = face_center_x - new_width // 2
        left = max(0, min(left, bg.width - new_width))
        cropped = bg.crop((left, 0, left + new_width, bg.height))
        scale = target_height / bg.height
        final_face_y = int(face_center_y * scale)
        return cropped, final_face_y
    else:
        new_height = int(bg.width / target_ratio)
        top = face_center_y - int(new_height * 0.3)
        top = max(0, min(top, bg.height - new_height))
        cropped = bg.crop((0, top, bg.width, top + new_height))
        scale = target_height / new_height
        final_face_y = int((face_center_y - top) * scale)
        return cropped, final_face_y


def draw_text_with_stroke(draw, x, y, text, font, fill_color, stroke_width=6):
    """Draw text with thick black stroke for high readability."""
    for dx in range(-stroke_width, stroke_width + 1):
        for dy in range(-stroke_width, stroke_width + 1):
            if dx * dx + dy * dy <= stroke_width * stroke_width:
                draw.text((x + dx, y + dy), text, font=font, fill=COLOR_BLACK)
    # Layered dropshadows
    draw.text((x + 8, y + 8), text, font=font, fill=(0, 0, 0, 100))
    draw.text((x + 12, y + 12), text, font=font, fill=(0, 0, 0, 80))
    # Main text
    draw.text((x, y), text, font=font, fill=fill_color)


def create_thumbnail(bg_path, hook_dict, logo_path, output_path):
    """Create a TikTok thumbnail (1080x1920) with unified branding."""
    text_white = hook_dict['white'].upper()
    text_highlight = hook_dict['highlight'].upper()
    print(f"Creating TikTok thumbnail: {text_white} / {text_highlight}")

    bg = Image.open(bg_path).convert("RGBA")
    target_width = 1080
    target_height = 1920

    # Smart crop to 9:16
    bg, face_y = smart_crop_vertical(bg, target_width, target_height)
    bg = bg.resize((target_width, target_height), Image.Resampling.LANCZOS)

    # Load fonts — Montserrat (Unified Identity)
    font_main_path = os.path.join(FONTS_DIR, "Montserrat-ExtraBold.ttf")
    font_sub_path = os.path.join(FONTS_DIR, "Montserrat-Black.ttf")
    
    font_large = ImageFont.truetype(font_sub_path, 130)

    overlay = Image.new("RGBA", bg.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # --- TEXT LAYOUT ---
    max_text_width = target_width - 160
    white_lines = []
    words = text_white.split()
    current_line = []
    for word in words:
        current_line.append(word)
        w = draw.textlength(" ".join(current_line), font=font_large)
        if w > max_text_width:
            current_line.pop()
            if current_line:
                white_lines.append(" ".join(current_line))
            current_line = [word]
    if current_line:
        white_lines.append(" ".join(current_line))

    # All lines combined
    all_lines = [(line, COLOR_WHITE) for line in white_lines]
    all_lines += [(text_highlight, COLOR_GOLD)]

    line_height = 160
    total_text_height = len(all_lines) * line_height
    
    # Safe Zones and positioning
    upper_y = 500
    lower_y = target_height - 600 - total_text_height
    
    # Logic: avoid face by switching to upper/lower half
    if face_y == -1:
        y_offset = lower_y
    else:
        # If face is in lower half, put text in upper half
        if face_y > target_height // 2:
            y_offset = upper_y
        else:
            y_offset = lower_y

    # --- CINEMATIC GRADIENT ---
    if y_offset == lower_y:
        gradient_height = 1000
        gradient_start = target_height - gradient_height
        for y in range(gradient_start, target_height):
            progress = (y - gradient_start) / gradient_height
            alpha = int(220 * progress * progress)
            draw.line([(0, y), (target_width, y)], fill=(0, 0, 0, alpha))
        logo_pos = (80, 80)
    else:
        gradient_height = 1000
        for y in range(0, gradient_height):
            progress = 1.0 - (y / gradient_height)
            alpha = int(220 * progress * progress)
            draw.line([(0, y), (target_width, y)], fill=(0, 0, 0, alpha))
        logo_pos = (target_width - 330, 80)

    # --- DRAW TEXT ---
    for i, (line, color) in enumerate(all_lines):
        w = draw.textlength(line, font=font_large)
        x = (target_width - w) // 2
        y = y_offset + (i * line_height)
        draw_text_with_stroke(draw, x, y, line, font_large, color, stroke_width=6)

    # --- LOGO ---
    logo = Image.open(logo_path).convert("RGBA")
    logo_width = 250
    ratio = logo_width / float(logo.width)
    logo_h = int(float(logo.height) * ratio)
    logo = logo.resize((logo_width, logo_h), Image.Resampling.LANCZOS)

    # Composite
    out = Image.alpha_composite(bg, overlay)
    out.paste(logo, logo_pos, logo)
    out.convert("RGB").save(output_path, "JPEG", quality=95)
    print(f"  ✅ Saved TikTok: {output_path} (Face Y: {face_y})")


if __name__ == "__main__":
    hooks = [
        {"white": "Your Worth Is Not", "highlight": "What You Do"},
        {"white": "Why Do You Feel", "highlight": "Invisible?"},
        {"white": "God's Thoughts", "highlight": "About You"}
    ]
    
    bg_dir = "/Users/rafaelrodriguesdasilva/.gemini/antigravity/brain/dad5c284-f183-4f1e-9012-383e10bf0254/"
    bgs = [
        os.path.join(bg_dir, "soul_anchored_bg_3_horizon_1773437247613.png"),
        os.path.join(bg_dir, "soul_anchored_bg_2_invisible_1773437233806.png"),
        os.path.join(bg_dir, "soul_anchored_bg_1_wisdom_1773437218387.png")
    ]
    
    logo = os.path.join(ASSETS_DIR, "watermark.png")
    
    out_dir = "/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/CEO project/Produção de conteúdo/Silva.IA/Soul Anchored/scripts/output"
    os.makedirs(out_dir, exist_ok=True)
    
    for i, (bg, hook) in enumerate(zip(bgs, hooks)):
        out_path = os.path.join(out_dir, f"tiktok_proposal_{i+1}.jpg")
        create_thumbnail(bg, hook, logo, out_path)
