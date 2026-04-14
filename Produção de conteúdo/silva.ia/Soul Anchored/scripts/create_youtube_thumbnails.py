import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

# ============================================================
# Soul Anchored — YouTube Thumbnail Generator
# Style: Sans-serif bold (Montserrat), Gold + White, Cinematic
# Dimensions: 1280 x 720 (16:9)
# ============================================================

ASSETS_DIR = "/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/CEO project/Produção de conteúdo/Silva.IA/Soul Anchored/assets"
FONTS_DIR = os.path.join(ASSETS_DIR, "fonts")

# Brand Colors
COLOR_GOLD     = (212, 175, 55, 255)      # #D4AF37 — power words
COLOR_WHITE    = (255, 255, 255, 255)      # white — supporting text
COLOR_BLACK    = (0, 0, 0, 255)            # stroke/shadow
COLOR_DARK_BG  = (10, 10, 15, 200)         # dark overlay


def smart_crop_landscape(bg, target_width, target_height):
    """Smart crop for YouTube 16:9 landscape format with face detection."""
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
            return bg.crop((left, 0, left + new_width, bg.height)), None
        else:
            new_height = int(bg.width / target_ratio)
            top = (bg.height - new_height) / 2
            return bg.crop((0, top, bg.width, top + new_height)), None

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
        scale = target_width / new_width
        final_face_x = int((face_center_x - left) * scale)
        return cropped, final_face_x
    else:
        new_height = int(bg.width / target_ratio)
        top = face_center_y - int(new_height * 0.4)
        top = max(0, min(top, bg.height - new_height))
        cropped = bg.crop((0, top, bg.width, top + new_height))
        scale = target_width / bg.width
        final_face_x = int(face_center_x * scale)
        return cropped, final_face_x


def draw_text_with_stroke(draw, x, y, text, font, fill_color, stroke_width=4):
    """Draw text with thick black stroke for high readability."""
    # Black stroke
    for dx in range(-stroke_width, stroke_width + 1):
        for dy in range(-stroke_width, stroke_width + 1):
            if dx * dx + dy * dy <= stroke_width * stroke_width:
                draw.text((x + dx, y + dy), text, font=font, fill=COLOR_BLACK)
    # Subtle shadow
    draw.text((x + 4, y + 4), text, font=font, fill=(0, 0, 0, 100))
    # Main text
    draw.text((x, y), text, font=font, fill=fill_color)


def add_glow(overlay, draw, x, y, w, h, color, radius=15):
    """Add a subtle glow behind a text block."""
    glow_layer = Image.new("RGBA", overlay.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    glow_draw.rectangle(
        [x - radius, y - radius, x + w + radius, y + h + radius],
        fill=(color[0], color[1], color[2], 30)
    )
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=radius))
    return Image.alpha_composite(overlay, glow_layer)


def create_youtube_thumbnail(bg_path, hook_dict, logo_path, output_path):
    """Create a YouTube thumbnail (1280x720) with Soul Anchored branding."""
    text_white = hook_dict['white'].upper()
    text_highlight = hook_dict['highlight'].upper()
    print(f"Creating YouTube thumbnail: {text_white} / {text_highlight}")

    bg = Image.open(bg_path).convert("RGBA")
    target_width = 1280
    target_height = 720

    # Smart crop to 16:9
    bg, face_x = smart_crop_landscape(bg, target_width, target_height)
    bg = bg.resize((target_width, target_height), Image.Resampling.LANCZOS)

    # Load fonts — Montserrat (Bold sans-serif YouTube style)
    font_main_path = os.path.join(FONTS_DIR, "Montserrat-ExtraBold.ttf")
    font_sub_path = os.path.join(FONTS_DIR, "Montserrat-Black.ttf")
    if not os.path.exists(font_main_path):
        font_main_path = os.path.join(FONTS_DIR, "Montserrat-Bold.ttf")

    font_large = ImageFont.truetype(font_sub_path, 90)
    font_medium = ImageFont.truetype(font_main_path, 80)

    overlay = Image.new("RGBA", bg.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # --- DETERMINE TEXT SIDE ---
    # If face is detected and is on the left, put text on right. Vice-versa.
    # If no face, put text on the right (default).
    text_on_right = True
    if face_x is not None and face_x > target_width // 2:
        text_on_right = False

    # --- CINEMATIC GRADIENT ---
    if text_on_right:
        gradient_start_x = target_width // 2 + 50
        for x in range(gradient_start_x, target_width):
            progress = (x - gradient_start_x) / (target_width - gradient_start_x)
            alpha = int(190 * progress * progress)  # Quadratic ease-in for smoother blend
            draw.line([(x, 0), (x, target_height)], fill=(0, 0, 0, alpha))
    else:
        gradient_end_x = target_width // 2 - 50
        for x in range(0, gradient_end_x):
            progress = 1.0 - (x / gradient_end_x)
            alpha = int(190 * progress * progress)
            draw.line([(x, 0), (x, target_height)], fill=(0, 0, 0, alpha))

    # Subtle bottom vignette
    for y in range(target_height - 100, target_height):
        alpha = int(80 * ((y - (target_height - 100)) / 100))
        draw.line([(0, y), (target_width, y)], fill=(0, 0, 0, alpha))

    # Top vignette (subtle)
    for y in range(0, 60):
        alpha = int(40 * (1 - y / 60))
        draw.line([(0, y), (target_width, y)], fill=(0, 0, 0, alpha))

    # --- TEXT LAYOUT ---
    max_text_width = 580

    # Word wrap the white text
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

    # Word wrap the highlight text
    highlight_lines = []
    words_h = text_highlight.split()
    current_line = []
    for word in words_h:
        current_line.append(word)
        w = draw.textlength(" ".join(current_line), font=font_large)
        if w > max_text_width:
            current_line.pop()
            if current_line:
                highlight_lines.append(" ".join(current_line))
            current_line = [word]
    if current_line:
        highlight_lines.append(" ".join(current_line))

    all_lines = [(line, COLOR_WHITE, font_large) for line in white_lines]
    all_lines += [(line, COLOR_GOLD, font_large) for line in highlight_lines]

    line_height = 105
    total_text_height = len(all_lines) * line_height
    y_start = (target_height - total_text_height) // 2

    if text_on_right:
        text_anchor_x = target_width - 70  # Right margin
        for i, (line, color, font) in enumerate(all_lines):
            w = draw.textlength(line, font=font)
            x = text_anchor_x - w  # Right-aligned
            y = y_start + (i * line_height)
            draw_text_with_stroke(draw, x, y, line, font, color, stroke_width=5)
    else:
        text_anchor_x = 70  # Left margin
        for i, (line, color, font) in enumerate(all_lines):
            x = text_anchor_x  # Left-aligned
            y = y_start + (i * line_height)
            draw_text_with_stroke(draw, x, y, line, font, color, stroke_width=5)

    # --- LOGO ---
    logo = Image.open(logo_path).convert("RGBA")
    logo_width = 140
    ratio = logo_width / float(logo.width)
    logo_h = int(float(logo.height) * ratio)
    logo = logo.resize((logo_width, logo_h), Image.Resampling.LANCZOS)

    if text_on_right:
        logo_pos = (40, 28)
    else:
        logo_pos = (target_width - logo_width - 40, 28)

    # Composite
    out = Image.alpha_composite(bg, overlay)
    out.paste(logo, logo_pos, logo)
    out.convert("RGB").save(output_path, "JPEG", quality=95)
    print(f"  ✅ Saved: {output_path}")


# ============================================================
# MAIN — Motivational Speech Proposals (FACE TEST)
# ============================================================
if __name__ == "__main__":
    hooks = [
        {"white": "Put God", "highlight": "First"},
        {"white": "Life Is", "highlight": "Too Short"},
        {"white": "God Has", "highlight": "A Plan"}
    ]

    bg_dir = "/Users/rafaelrodriguesdasilva/.gemini/antigravity/brain/dad5c284-f183-4f1e-9012-383e10bf0254/"
    bgs = [
        os.path.join(bg_dir, "yt_motivational_bg_1_1773446256369.png"),
        os.path.join(bg_dir, "yt_motivational_bg_2_1773446272075.png"),
        os.path.join(bg_dir, "yt_motivational_bg_3_1773446290935.png")
    ]

    logo = os.path.join(ASSETS_DIR, "watermark.png")

    out_dir = "/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/CEO project/Produção de conteúdo/Silva.IA/Soul Anchored/scripts/output_youtube"
    os.makedirs(out_dir, exist_ok=True)

    for i, (bg_path, hook) in enumerate(zip(bgs, hooks)):
        out_path = os.path.join(out_dir, f"yt_motivational_{i+1}.jpg")
        create_youtube_thumbnail(bg_path, hook, logo, out_path)

    print("\n🎬 All 3 Motivational Speech thumbnails generated!")

