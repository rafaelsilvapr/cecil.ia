"""
Banco de Dados de Formação de Acordes - Sistema Rousseau-Galin-Paris-Chevé

Este módulo define a estrutura de todos os acordes diatônicos e dominantes secundários
usando o sistema de numeração Rousseau (1-7).

Notação de Oitavas:
- Número normal: oitava central (ex: 1)
- "̄" acima: oitava superior (ex: 1̄)
- "̱" abaixo: oitava inferior (ex: 1̱)
"""

OCTAVE_UP = "̄"    # combining macron (acima)
OCTAVE_DOWN = "̱"  # combining macron below (abaixo)


def format_note(number, octave="normal"):
    """
    Formata um número Rousseau com marcação de oitava.

    Args:
        number: int ou str (1-7, pode incluir # ou b)
        octave: "up", "normal", "down"

    Returns:
        str: número formatado com marcação de oitava
    """
    note_str = str(number)
    if octave == "up":
        return note_str + OCTAVE_UP
    elif octave == "down":
        return note_str + OCTAVE_DOWN
    return note_str


CHORD_FORMATIONS = {
    # ---------- Tríades diatônicas ----------
    "I": [
        {"number": 1, "octave": "normal"},
        {"number": 3, "octave": "normal"},
        {"number": 5, "octave": "normal"},
    ],
    "ii": [
        {"number": 2, "octave": "normal"},
        {"number": 4, "octave": "normal"},
        {"number": 6, "octave": "normal"},
    ],
    "iii": [
        {"number": 3, "octave": "normal"},
        {"number": 5, "octave": "normal"},
        {"number": 7, "octave": "normal"},
    ],
    "IV": [
        {"number": 4, "octave": "normal"},
        {"number": 6, "octave": "normal"},
        {"number": 1, "octave": "up"},
    ],
    "V": [
        {"number": 5, "octave": "normal"},
        {"number": 7, "octave": "normal"},
        {"number": 2, "octave": "up"},
    ],
    "vi": [
        {"number": 6, "octave": "normal"},
        {"number": 1, "octave": "up"},
        {"number": 3, "octave": "up"},
    ],
    "viiº": [
        {"number": 7, "octave": "normal"},
        {"number": 2, "octave": "up"},
        {"number": 4, "octave": "up"},
    ],
    # ---------- Dominantes secundários ----------
    "V/ii": [
        {"number": "6#", "octave": "normal"},
        {"number": "1#", "octave": "normal"},
        {"number": 3, "octave": "normal"},
    ],
    "V/iii": [
        {"number": "7#", "octave": "normal"},
        {"number": 2, "octave": "normal"},
        {"number": 4, "octave": "normal"},
    ],
    "V/IV": [
        {"number": 1, "octave": "normal"},
        {"number": 3, "octave": "normal"},
        {"number": 5, "octave": "normal"},
        {"number": "7b", "octave": "normal"},
    ],
    "V/V": [
        {"number": 2, "octave": "normal"},
        {"number": "4#", "octave": "normal"},
        {"number": 6, "octave": "normal"},
        {"number": 1, "octave": "up"},
    ],
    "V/vi": [
        {"number": 3, "octave": "normal"},
        {"number": "5#", "octave": "normal"},
        {"number": 7, "octave": "normal"},
        {"number": 2, "octave": "normal"},
    ],
    "V/vii": [
        {"number": "4#", "octave": "normal"},
        {"number": "6#", "octave": "normal"},
        {"number": "1#", "octave": "normal"},
        {"number": 3, "octave": "normal"},
    ],
}


def get_chord_formation(roman_numeral):
    """
    Retorna a formação de um acorde em notação Rousseau.

    Args:
        roman_numeral: str (ex: "I", "V/V", "viiø")

    Returns:
        list de dicts com 'number' e 'octave'
        None se o acorde não existir
    """
    return CHORD_FORMATIONS.get(roman_numeral)


def format_chord_vertical(roman_numeral):
    """
    Retorna a representação vertical de um acorde formatada.

    Args:
        roman_numeral: str

    Returns:
        list de strings formatadas (ex: ["1", "3", "5"])
    """
    formation = get_chord_formation(roman_numeral)
    if not formation:
        return []
    return [format_note(note["number"], note["octave"]) for note in formation]


def get_all_chord_symbols():
    """Retorna lista de todos os símbolos de acordes disponíveis."""
    return ["I", "ii", "iii", "IV", "V", "vi", "viiº",
            "V/ii", "V/iii", "V/IV", "V/V", "V/vi", "V/vii"]


if __name__ == "__main__":
    print("=== Banco de Acordes Rousseau ===\n")

    print("Exemplo: Acorde IV (Subdominante)")
    formation = format_chord_vertical("IV")
    print("Formação vertical (grave → agudo):")
    for i, note in enumerate(formation, 1):
        print(f"  {i}. {note}")
    print()

    print("Acordes disponíveis:")
    for chord in get_all_chord_symbols():
        notes = format_chord_vertical(chord)
        print(f"  {chord:8} → {', '.join(notes)}")
