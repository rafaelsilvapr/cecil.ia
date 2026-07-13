"""
Pentagrama SEM clave - Sistema Rousseau

Os graus 1-7 não têm altura absoluta: só importa o INTERVALO entre eles.
Cada grau diatônico = um "degrau" = meio espaço do pentagrama (linha↔espaço):
- 1→2 (segunda) = degrau para o espaço vizinho
- 1→3 (terça)   = pula para a próxima linha
- 1→5 (quinta)  = 4 degraus = de linha para linha
- 1→1̄ (oitava)  = 7 degraus acima

O desenho é CENTRALIZADO pela extensão da melodia. As figuras (semínima,
colcheia...) definem o formato da cabeça de nota (aberta/fechada, haste,
colchete, ponto) e o espaçamento horizontal é proporcional à duração.
As barras de compasso vêm do agrupamento por duração (módulo rhythm).
"""
import re

from rhythm import figure_style, DEFAULT_FIGURE

OCT = {"down": -1, "normal": 0, "up": 1}

_HALF = 9              # meio espaço = 1 degrau
_STAFF_TOP = 46        # y da linha superior (degrau 8)
_Y_NUM = 150           # linha dos números (grau)
_Y_SYL = 168           # linha das sílabas
_HEIGHT = 182
_STEM = 34


def degree_position(degree, octave="normal"):
    """Posição diatônica (em degraus) de um grau. Acidentes não mudam a posição."""
    m = re.match(r"\d", str(degree))
    if not m:
        return 0
    return OCT.get(octave, 0) * 7 + (int(m.group()) - 1)


def accidental(degree):
    s = str(degree)
    if "#" in s:
        return "♯"
    if "b" in s:
        return "♭"
    return ""


def _step_to_y(step):
    return _STAFF_TOP + (8 - step) * _HALF


def _as_measures(data):
    """Aceita lista de compassos [{'beats':[...]}] ou lista plana de notas."""
    if not data:
        return []
    first = data[0]
    if isinstance(first, dict) and "beats" in first:
        return [m["beats"] for m in data]
    return [list(data)]        # lista plana → um único compasso


def _empty_svg():
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="80" role="img">'
        '<text x="160" y="45" text-anchor="middle" font-size="14" '
        'font-family="Helvetica" fill="#999">Sem melodia para exibir</text></svg>'
    )


def _notehead(cx, cy, step, style):
    """Desenha cabeça de nota + haste + colchete(s) + ponto conforme a figura."""
    parts = []
    fill = "#111" if style["filled"] else "white"
    stroke = 'stroke="#111" stroke-width="1.4"' if not style["filled"] else ""
    parts.append(f'<ellipse cx="{cx}" cy="{cy}" rx="7.5" ry="5.5" fill="{fill}" {stroke} '
                 f'transform="rotate(-20 {cx} {cy})"/>')

    stem_up = step <= 4
    if style["stem"]:
        if stem_up:
            sx, y2 = cx + 7, cy - _STEM
            parts.append(f'<line x1="{sx}" y1="{cy}" x2="{sx}" y2="{y2}" stroke="#111" stroke-width="1.6"/>')
            for k in range(style["flags"]):
                fy = y2 + k * 8
                parts.append(f'<path d="M{sx},{fy} q9,4 8,15" fill="none" stroke="#111" stroke-width="1.6"/>')
        else:
            sx, y2 = cx - 7, cy + _STEM
            parts.append(f'<line x1="{sx}" y1="{cy}" x2="{sx}" y2="{y2}" stroke="#111" stroke-width="1.6"/>')
            for k in range(style["flags"]):
                fy = y2 - k * 8
                parts.append(f'<path d="M{sx},{fy} q9,-4 8,-15" fill="none" stroke="#111" stroke-width="1.6"/>')

    if style["dot"]:
        parts.append(f'<circle cx="{cx+12}" cy="{cy}" r="1.8" fill="#111"/>')
    return "".join(parts)


def render_staff_svg(data, unit=40, min_slot=34, pad_x=30):
    """
    data: lista de compassos [{'beats':[nota,...]}] OU lista plana de notas.
          nota = {'degree','octave','duration'(op.),'figure'(op.),'label'(op.)}
    Retorna string SVG do pentagrama sem clave.
    """
    measures = _as_measures(data)
    notes = [n for m in measures for n in m]
    if not notes:
        return _empty_svg()

    positions = [degree_position(n["degree"], n.get("octave", "normal")) for n in notes]
    lo, hi = min(positions), max(positions)
    shift = round(4 - (lo + hi) / 2)      # centraliza a extensão

    # larguras (slots) proporcionais à duração, com mínimo legível
    slots = []
    for n in notes:
        style = figure_style(n.get("figure", DEFAULT_FIGURE))
        slots.append(max(style["beats"] * unit, min_slot))

    width = int(pad_x * 2 + sum(slots))
    x0, x1 = pad_x - 10, width - (pad_x - 10)

    out = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{_HEIGHT}" '
        f'viewBox="0 0 {width} {_HEIGHT}" role="img" font-family="Georgia, serif">',
        '<title>Pentagrama sem clave</title>',
        f'<rect width="{width}" height="{_HEIGHT}" fill="white"/>',
    ]
    for step in (0, 2, 4, 6, 8):
        y = _step_to_y(step)
        out.append(f'<line x1="{x0}" y1="{y}" x2="{x1}" y2="{y}" stroke="#333" stroke-width="1"/>')
    out.append(f'<line x1="{x0}" y1="{_step_to_y(8)}" x2="{x0}" y2="{_step_to_y(0)}" stroke="#333"/>')
    out.append(f'<line x1="{x1}" y1="{_step_to_y(8)}" x2="{x1}" y2="{_step_to_y(0)}" stroke="#333"/>')

    # índice do último evento de cada compasso (para barra de compasso)
    bar_after = set()
    idx = -1
    for m in measures[:-1]:
        idx += len(m)
        bar_after.add(idx)

    x = pad_x
    i = 0
    for m_i, measure in enumerate(measures):
        for n in measure:
            slot = slots[i]
            cx = x + slot / 2
            step = positions[i] + shift
            cy = _step_to_y(step)
            style = figure_style(n.get("figure", DEFAULT_FIGURE))

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

            out.append(_notehead(cx, cy, step, style))

            acc = accidental(n["degree"])
            if acc:
                out.append(f'<text x="{cx-16}" y="{cy+4}" font-size="15" fill="#111">{acc}</text>')

            mm = re.match(r"\d", str(n["degree"]))
            num = mm.group() if mm else str(n["degree"])
            out.append(f'<text x="{cx}" y="{_Y_NUM}" font-size="15" font-weight="bold" '
                       f'text-anchor="middle" fill="#0b3d59">{num}</text>')
            if n.get("label"):
                out.append(f'<text x="{cx}" y="{_Y_SYL}" font-size="12" text-anchor="middle" '
                           f'fill="#444" font-family="Helvetica">{n["label"]}</text>')

            x += slot
            i += 1

        # barra de compasso interna
        if m_i < len(measures) - 1:
            out.append(f'<line x1="{x}" y1="{_step_to_y(8)}" x2="{x}" y2="{_step_to_y(0)}" '
                       f'stroke="#333" stroke-width="1"/>')

    out.append('</svg>')
    return "".join(out)


if __name__ == "__main__":
    escala = [{"degree": d, "octave": "normal", "label": str(d),
               "figure": "Semínima (1)"} for d in range(1, 8)]
    escala.append({"degree": 1, "octave": "up", "label": "1̄", "figure": "Mínima (2)"})
    with open("/tmp/staff_escala.svg", "w", encoding="utf-8") as f:
        f.write(render_staff_svg(escala))
    print("SVG de teste: /tmp/staff_escala.svg")
