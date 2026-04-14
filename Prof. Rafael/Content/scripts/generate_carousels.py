import os
import argparse
import textwrap
import sys
from PIL import Image, ImageDraw, ImageFont

sys.path.append(os.path.dirname(__file__))
from analysis_memory import print_recent_entries

# ============================================================
# Professor Rafael — Carousel Automation (Prototype)
# Pipeline: Text Data -> Pillow Rendering -> Instagram Slides
# ============================================================

ASSETS_DIR = os.path.join(os.path.dirname(__file__), "assets")
CANVAS_CONTENT = os.path.join(ASSETS_DIR, "canvas_content.jpg")
CANVAS_CTA = os.path.join(ASSETS_DIR, "canvas_cta.jpg")
FONT_PATH = os.path.join(ASSETS_DIR, "font.ttf")

# Professor Rafael Brand Colors (Heuristic based on canvas)
PRIMARY_COLOR = (79, 102, 68) # Dark Greenish match
TEAL_ACCENT = (144, 164, 144)  # Muted Sage match
TEXT_COLOR = (50, 50, 50)    # Dark gray for readability

def draw_text_centered(draw, text, font, y_start, width, line_spacing=40, color=TEXT_COLOR):
    """Draws wrapped text centered horizontally."""
    lines = textwrap.wrap(text, width=25) # Adjust width for font size
    current_y = y_start
    for line in lines:
        left, top, right, bottom = draw.textbbox((0, 0), line, font=font)
        text_w = right - left
        draw.text(((width - text_w) / 2, current_y), line, font=font, fill=color)
        current_y += (bottom - top) + line_spacing
    return current_y

def generate_carousel(slides_data, output_folder):
    """
    slides_data: List of dicts [{"type": "content"|"cta", "title": "...", "body": "..."}]
    """
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    try:
        font_title = ImageFont.truetype(FONT_PATH, 80)
        font_body = ImageFont.truetype(FONT_PATH, 55)
    except:
        font_title = ImageFont.load_default()
        font_body = ImageFont.load_default()

    for i, slide in enumerate(slides_data):
        canvas_path = CANVAS_CTA if slide.get("type") == "cta" else CANVAS_CONTENT
        img = Image.open(canvas_path).convert("RGB")
        draw = ImageDraw.Draw(img)
        w, h = img.size

        # Layout Logic
        if slide.get("type") == "cta":
            # CTA Slide: Text usually goes below the profile pic
            y_offset = h * 0.65
            draw_text_centered(draw, slide["title"].upper(), font_title, y_offset, w, color=PRIMARY_COLOR)
        else:
            # Content Slide: Top area reserved for handle, but title can start below
            y_offset = h * 0.25
            next_y = draw_text_centered(draw, slide["title"].upper(), font_title, y_offset, w, color=PRIMARY_COLOR)
            
            if "body" in slide:
                draw_text_centered(draw, slide["body"], font_body, next_y + 40, w)

        out_path = os.path.join(output_folder, f"slide_{i+1}.jpg")
        img.save(out_path, quality=95)
        print(f"✅ Generated: {out_path}")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--test", action="store_true", help="Generate a sample 3-slide carousel")
    args = parser.parse_args()

    # Consulta rapida ao historico antes de gerar novas ideias.
    print_recent_entries(limit=2)

    if args.test:
        test_data = [
            {"type": "content", "title": "A Era da IA na Educação", "body": "Como professores podem usar agentes para escalar o ensino personalizado sem perder o lado humano."},
            {"type": "content", "title": "3 Passos para Começar", "body": "1. Identifique tarefas repetitivas.\n2. Escolha o agente certo.\n3. Desenhe o workflow."},
            {"type": "cta", "title": "Quer automatizar suas aulas?", "body": "Link na Bio!"}
        ]
        generate_carousel(test_data, "sample_carousel")

if __name__ == "__main__":
    main()
