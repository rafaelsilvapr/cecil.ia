"""
Pentagrama SEM clave - Sistema Rousseau

Os graus 1-7 não têm altura absoluta: só importa o INTERVALO entre eles.
Cada grau diatônico = um "degrau" = meio espaço do pentagrama (linha↔espaço):
- 1→2 (segunda) = degrau para o espaço vizinho
- 1→3 (terça)   = pula para a próxima linha
- 1→5 (quinta)  = 4 degraus = de linha para linha
- 1→1̄ (oitava)  = 7 degraus acima

O desenho é CENTRALIZADO pela extensão da melodia (nota mais grave + mais aguda),
para caber o máximo possível dentro das 5 linhas. Linhas suplementares só quando
a extensão passa do pentagrama.
"""
import re

OCT = {"down": -1, "normal": 0, "up": 1}

# Layout vertical (px)
_HALF = 9              # meio espaço = 1 degrau
_STAFF_TOP = 46        # y da linha superior (degrau 8)
_Y_NUM = 150           # linha dos números (grau) — abaixo do pentagrama
_Y_SYL = 168           # linha das sílabas
_HEIGHT = 182


def degree_position(degree, octave="normal"):
    """Posição diatônica (em degraus) de um grau. Acidentes não mudam a posição."""
    m = re.match(r"\d", str(degree))
    if not m:
        return 0
    base = int(m.group())
    return OCT.get(octave, 0) * 7 + (base - 1)


def accidental(degree):
    s = str(degree)
    if "#" in s:
        return "♯"   # ♯
    if "b" in s:
        return "♭"   # ♭
    return ""


def _step_to_y(step):
    return _STAFF_TOP + (8 - step) * _HALF


def render_staff_svg(notes, note_gap=52, pad_x=40):
    """
    notes: lista de dicts {'degree', 'octave', 'label'(opcional)}
    Retorna string SVG do pentagrama sem clave.
    """
    if not notes:
        return (
            '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="80" '
            'role="img"><text x="160" y="45" text-anchor="middle" font-size="14" '
            'font-family="Helvetica" fill="#999">Sem melodia para exibir</text></svg>'
        )

    positions = [degree_position(n["degree"], n.get("octave", "normal")) for n in notes]
    lo, hi = min(positions), max(positions)
    mid = (lo + hi) / 2
    shift = round(4 - mid)      # centraliza a extensão na linha do meio (degrau 4)

    width = pad_x * 2 + max(1, len(notes) - 1) * note_gap
    if len(notes) == 1:
        width = pad_x * 2 + note_gap

    out = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{_HEIGHT}" '
        f'viewBox="0 0 {width} {_HEIGHT}" role="img" font-family="Georgia, serif">',
        f'<title>Pentagrama sem clave</title>',
        f'<rect width="{width}" height="{_HEIGHT}" fill="white"/>',
    ]

    x0, x1 = pad_x - 18, width - (pad_x - 18)
    for step in (0, 2, 4, 6, 8):
        y = _step_to_y(step)
        out.append(f'<line x1="{x0}" y1="{y}" x2="{x1}" y2="{y}" stroke="#333" stroke-width="1"/>')
    out.append(f'<line x1="{x0}" y1="{_step_to_y(8)}" x2="{x0}" y2="{_step_to_y(0)}" stroke="#333"/>')
    out.append(f'<line x1="{x1}" y1="{_step_to_y(8)}" x2="{x1}" y2="{_step_to_y(0)}" stroke="#333"/>')

    for i, n in enumerate(notes):
        step = positions[i] + shift
        cx = pad_x + i * note_gap
        cy = _step_to_y(step)

        # linhas suplementares
        s = step
        while s >= 10:
            if s % 2 == 0:
                ly = _step_to_y(s)
                out.append(f'<line x1="{cx-11}" y1="{ly}" x2="{cx+11}" y2="{ly}" stroke="#333"/>')
            s -= 1
        s = step
        while s <= -2:
            if s % 2 == 0:
                ly = _step_to_y(s)
                out.append(f'<line x1="{cx-11}" y1="{ly}" x2="{cx+11}" y2="{ly}" stroke="#333"/>')
            s += 1

        # cabeça de nota + haste
        out.append(f'<ellipse cx="{cx}" cy="{cy}" rx="7.5" ry="5.5" fill="#111" '
                   f'transform="rotate(-20 {cx} {cy})"/>')
        if step <= 4:
            out.append(f'<line x1="{cx+7}" y1="{cy}" x2="{cx+7}" y2="{cy-34}" stroke="#111" stroke-width="1.6"/>')
        else:
            out.append(f'<line x1="{cx-7}" y1="{cy}" x2="{cx-7}" y2="{cy+34}" stroke="#111" stroke-width="1.6"/>')

        acc = accidental(n["degree"])
        if acc:
            out.append(f'<text x="{cx-16}" y="{cy+4}" font-size="15" fill="#111">{acc}</text>')

        # rodapé: número do grau (azul Rousseau) + sílaba
        m = re.match(r"\d", str(n["degree"]))
        num = m.group() if m else str(n["degree"])
        out.append(f'<text x="{cx}" y="{_Y_NUM}" font-size="15" font-weight="bold" '
                   f'text-anchor="middle" fill="#0b3d59">{num}</text>')
        if n.get("label"):
            out.append(f'<text x="{cx}" y="{_Y_SYL}" font-size="12" text-anchor="middle" '
                       f'fill="#444" font-family="Helvetica">{n["label"]}</text>')

    out.append('</svg>')
    return "".join(out)


if __name__ == "__main__":
    escala = [{"degree": d, "octave": "normal", "label": str(d)} for d in range(1, 8)]
    escala.append({"degree": 1, "octave": "up", "label": "1̄"})
    with open("/tmp/staff_escala.svg", "w", encoding="utf-8") as f:
        f.write(render_staff_svg(escala))
    print("SVG de teste: /tmp/staff_escala.svg")
