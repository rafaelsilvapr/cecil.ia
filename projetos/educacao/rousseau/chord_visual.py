"""
Componente de Visualização de Acordes - Sistema Rousseau

Renderiza acordes no formato visual do método Rousseau:
- Grau romano à esquerda
- Números empilhados verticalmente à direita (grave → agudo, de cima para baixo)
"""

import streamlit as st


def render_chord_visual(roman_numeral, formation):
    """
    Renderiza um acorde no estilo visual Rousseau.

    Args:
        roman_numeral: str (ex: "I", "ii", "V")
        formation: list de dicts com 'number' e 'octave'

    Returns:
        HTML string para renderização
    """
    formatted_numbers = []
    for note in formation:
        num = str(note["number"])
        octave = note["octave"]

        if octave == "up":
            formatted_numbers.append(f"{num}̄")
        elif octave == "down":
            formatted_numbers.append(f"{num}̱")
        else:
            formatted_numbers.append(num)

    numbers_vertical = "<br>".join(formatted_numbers)

    html = f"""
    <div style="display: inline-flex; align-items: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                border-radius: 6px; padding: 6px 10px; margin: 3px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
        
        <!-- Numeral Romano (Maior) -->
        <span style="font-size: 36px; font-weight: bold; color: white; font-family: 'Georgia', serif; 
                     margin-right: 4px; line-height: 1;">{roman_numeral}</span>
                     
        <!-- Números Empilhados (Menores para caber na altura do romano) -->
        <span style="font-size: 11px; font-weight: bold; color: #fff; font-family: 'Courier New', monospace; 
                     line-height: 1.1; display: flex; flex-direction: column; justify-content: center;">
            {numbers_vertical}
        </span>
    </div>
    """

    return html


def render_chord_simple(roman_numeral, formation):
    """
    Versão simplificada em texto puro (para quando HTML não funciona).

    Args:
        roman_numeral: str
        formation: list de dicts

    Returns:
        str formatado
    """
    formatted = []
    for note in formation:
        num = str(note["number"])
        if note["octave"] == "up":
            formatted.append(f"{num}̄")
        elif note["octave"] == "down":
            formatted.append(f"{num}̱")
        else:
            formatted.append(num)

    lines = [f"{roman_numeral:4s}"]
    for num in formatted:
        lines.append(f"    {num}")

    return "\n".join(lines)


def display_chord_progression(chords, use_html=True):
    """
    Exibe uma progressão de acordes.

    Args:
        chords: list de tuples (roman_numeral, formation)
        use_html: bool - usar renderização HTML ou texto simples
    """
    if use_html:
        html_parts = []
        for roman, formation in chords:
            html_parts.append(render_chord_visual(roman, formation))

        full_html = f"""
        <div style="
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            padding: 20px;
            background-color: #f7fafc;
            border-radius: 10px;
        ">
            {''.join(html_parts)}
        </div>
        """
        st.markdown(full_html, unsafe_allow_html=True)
    else:
        cols = st.columns(len(chords))
        for idx, (roman, formation) in enumerate(chords):
            with cols[idx]:
                st.code(render_chord_simple(roman, formation), language=None)


if __name__ == "__main__":
    print("=== Componente de Visualização de Acordes ===\n")

    test_chords = [
        ("I", [
            {"number": 5, "octave": "normal"},
            {"number": 3, "octave": "normal"},
            {"number": 1, "octave": "normal"},
        ]),
        ("ii", [
            {"number": 6, "octave": "normal"},
            {"number": 4, "octave": "normal"},
            {"number": 2, "octave": "normal"},
        ]),
        ("V", [
            {"number": 2, "octave": "up"},
            {"number": 7, "octave": "normal"},
            {"number": 5, "octave": "normal"},
        ]),
    ]

    print("Renderização em texto:")
    for roman, formation in test_chords:
        print(render_chord_simple(roman, formation))
        print()
