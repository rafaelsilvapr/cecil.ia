"""
Ritmo - Sistema Rousseau

Figuras rítmicas e agrupamento de eventos em compassos pela SOMA das durações.
A duração é medida em "tempos de semínima" (semínima = 1). O compasso fecha
sozinho quando a soma das durações atinge a capacidade da fórmula.
"""

# Figura -> metadados. 'beats' é a duração em semínimas; o resto controla o
# desenho da cabeça de nota no pentagrama.
FIGURES = {
    "Semibreve (4)":        {"beats": 4.0,  "filled": False, "stem": False, "flags": 0, "dot": False},
    "Mínima pont. (3)":     {"beats": 3.0,  "filled": False, "stem": True,  "flags": 0, "dot": True},
    "Mínima (2)":           {"beats": 2.0,  "filled": False, "stem": True,  "flags": 0, "dot": False},
    "Semínima pont. (1½)":  {"beats": 1.5,  "filled": True,  "stem": True,  "flags": 0, "dot": True},
    "Semínima (1)":         {"beats": 1.0,  "filled": True,  "stem": True,  "flags": 0, "dot": False},
    "Colcheia (½)":         {"beats": 0.5,  "filled": True,  "stem": True,  "flags": 1, "dot": False},
    "Semicolcheia (¼)":     {"beats": 0.25, "filled": True,  "stem": True,  "flags": 2, "dot": False},
}

DEFAULT_FIGURE = "Semínima (1)"

_EPS = 1e-6


def figure_beats(figure):
    """Duração (em semínimas) de uma figura; semínima se desconhecida."""
    return FIGURES.get(figure, FIGURES[DEFAULT_FIGURE])["beats"]


def figure_style(figure):
    """Metadados de desenho da figura (filled/stem/flags/dot)."""
    return FIGURES.get(figure, FIGURES[DEFAULT_FIGURE])


def measure_capacity(time_signature):
    """
    Capacidade do compasso em tempos de semínima.
    Ex.: 4/4 → 4 ; 3/4 → 3 ; 2/4 → 2 ; 6/8 → 3.
    """
    try:
        num, den = time_signature.split("/")
        return int(num) * 4.0 / int(den)
    except (ValueError, ZeroDivisionError):
        return 4.0


def build_measures(events, capacity):
    """
    Agrupa eventos em compassos pela soma das durações.

    Args:
        events: lista de dicts contendo pelo menos 'duration' (float).
        capacity: capacidade do compasso em semínimas.

    Returns:
        dict {"measures": [{"beats": [...], "filled": float}, ...],
              "capacity": capacity}
        O último compasso pode ficar incompleto (anacruse/fim de frase).
    """
    if capacity <= 0:
        capacity = 4.0

    measures = []
    cur, acc = [], 0.0

    for ev in events:
        dur = float(ev.get("duration", 1.0)) or 1.0

        # Se o evento não cabe no compasso atual, fecha e começa outro.
        if cur and acc + dur > capacity + _EPS:
            measures.append({"beats": cur, "filled": acc})
            cur, acc = [], 0.0

        cur.append(ev)
        acc += dur

        # Compasso completou exatamente.
        if acc >= capacity - _EPS:
            measures.append({"beats": cur, "filled": acc})
            cur, acc = [], 0.0

    if cur:
        measures.append({"beats": cur, "filled": acc})

    return {"measures": measures, "capacity": capacity}


if __name__ == "__main__":
    # 4/4, oito colcheias → 2 compassos de 4 tempos
    evs = [{"duration": 0.5} for _ in range(8)]
    r = build_measures(evs, measure_capacity("4/4"))
    print("8 colcheias em 4/4 →", len(r["measures"]), "compassos")
    for i, m in enumerate(r["measures"], 1):
        print(f"  compasso {i}: {len(m['beats'])} eventos, soma {m['filled']}")
