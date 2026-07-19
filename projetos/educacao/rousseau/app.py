"""
Sistema Rousseau - Aplicativo principal (Streamlit)

Amarra os módulos resgatados num fluxo único:

    letra  →  separação silábica (+ sinalefas)  →  atribuição de melodia/harmonia
           →  montagem da grade rítmica  →  partitura em SVG/PDF

Rode com:  streamlit run app.py
"""

import os
import tempfile

import streamlit as st

from syllable_processor import SyllableProcessor
from chord_database import get_all_chord_symbols, format_chord_vertical
from notation_renderer import NotationRenderer
from staff_notation import render_staff_svg
from rhythm import FIGURES, DEFAULT_FIGURE, figure_beats, measure_capacity, build_measures


# ---------------------------------------------------------------------------
# Lógica pura (sem Streamlit) — testável isoladamente
# ---------------------------------------------------------------------------

OCTAVE_LABELS = {
    "normal": "normal",
    "up": "aguda (⁺)",
    "down": "grave (₋)",
}

NO_REST = "—"   # opção "sem pausa" no seletor de pausa


def build_beats_from_syllables(processed_syllables):
    """
    Converte a saída de SyllableProcessor.process_lyrics() numa lista de
    pulsos (beats), um por sílaba, prontos para receber melodia/harmonia.

    Args:
        processed_syllables: lista de dicts {'text', 'type', 'sinalefa'}

    Returns:
        list de dicts com chaves: syllable, sinalefa, melody, octave, harmony
    """
    beats = []
    for syl in processed_syllables:
        beats.append({
            "syllable": syl["text"],
            "sinalefa": syl.get("sinalefa", False),
            "melody": "",
            "octave": "normal",
            "harmony": "",
        })
    return beats


def build_grid(beats, beats_per_measure):
    """
    Agrupa uma lista plana de pulsos em compassos, no formato que o
    NotationRenderer espera: {"measures": [{"beats": [...]}, ...]}.

    Cada sílaba ocupa um pulso. Os compassos são preenchidos em sequência;
    o último pode ficar incompleto.

    Args:
        beats: list de dicts (ver build_beats_from_syllables)
        beats_per_measure: int (>= 1)

    Returns:
        dict no formato grid_data
    """
    if beats_per_measure < 1:
        beats_per_measure = 1

    measures = []
    for i in range(0, len(beats), beats_per_measure):
        chunk = beats[i:i + beats_per_measure]
        measures.append({"beats": chunk})

    return {"measures": measures}


def normalize_beat(beat):
    """Limpa campos vazios para o formato que o renderer entende."""
    figure = beat.get("figure") or DEFAULT_FIGURE
    return {
        "kind": "note",
        "syllable": beat.get("syllable") or "",
        "sinalefa": bool(beat.get("sinalefa")),
        "melody": str(beat.get("melody") or "").strip(),
        "octave": beat.get("octave") or "normal",
        "harmony": (beat.get("harmony") or "").strip() or None,
        "figure": figure,
        "duration": figure_beats(figure),
    }


def make_rest(figure):
    """Cria um evento de pausa com a duração da figura escolhida."""
    return {
        "kind": "rest",
        "syllable": "",
        "sinalefa": False,
        "melody": "",
        "octave": "normal",
        "harmony": None,
        "figure": figure,
        "duration": figure_beats(figure),
    }


def build_events(beats):
    """Intercala pausas (rest_before) com as notas, na ordem."""
    events = []
    for b in beats:
        rf = b.get("rest_before")
        if rf and rf != NO_REST:
            events.append(make_rest(rf))
        events.append(normalize_beat(b))
    return events


# ---------------------------------------------------------------------------
# Interface Streamlit
# ---------------------------------------------------------------------------

def main():
    st.set_page_config(page_title="Sistema Rousseau", page_icon="🎼", layout="wide")

    st.title("🎼 Sistema Rousseau")
    st.caption(
        "Notação musical cifrada 1–7 (método Rousseau-Galin-Paris-Chevé) — "
        "letra, melodia e harmonia alinhadas pulso a pulso."
    )

    # ---- Configuração (barra lateral) ----
    with st.sidebar:
        st.header("Configuração")
        time_signature = st.selectbox(
            "Compasso",
            ["2/4", "3/4", "4/4", "6/8"],
            index=2,
            help="Determina quantos pulsos (sílabas) cabem em cada compasso.",
        )
        beats_per_measure = int(time_signature.split("/")[0])

        anacruse = st.number_input(
            "Anacruse (tempos do 1º compasso)",
            min_value=0.0, max_value=float(beats_per_measure), value=0.0, step=0.5,
            help="Deixe 0 para começar num compasso completo. Use, por exemplo, "
                 "1 para uma melodia que entra no último tempo antes do compasso.",
        )

        notehead_label = st.radio(
            "Cabeça de nota (pentagrama)",
            ["Número (1–7)", "Oval tradicional"],
            index=0,
            help="No modo número, a própria cifra 1–7 fica sobre a pauta, na altura certa.",
        )
        notehead_mode = "number" if notehead_label.startswith("Número") else "oval"

        st.divider()
        st.subheader("Áudio de referência (opcional)")
        st.caption(
            "Baixar o áudio ajuda a tirar a melodia de ouvido. "
            "A transcrição automática ainda não está implementada."
        )
        yt_url = st.text_input("URL do YouTube", placeholder="https://youtube.com/watch?v=...")
        if st.button("Baixar áudio", disabled=not yt_url):
            _download_audio(yt_url)

    # ---- Passo 1: letra ----
    st.header("1 · Letra")
    lyrics = st.text_area(
        "Digite a letra (uma frase por linha)",
        value=st.session_state.get("lyrics", "Eu gostava tanto de você"),
        height=120,
    )

    if not lyrics.strip():
        st.info("Digite uma letra para começar.")
        return

    processor = SyllableProcessor()
    processed = processor.process_lyrics(lyrics)

    n_syl = len(processed)
    n_sinalefas = sum(1 for s in processed if s.get("sinalefa"))
    col_a, col_b = st.columns(2)
    col_a.metric("Sílabas / notas", n_syl)
    col_b.metric("Sinalefas", n_sinalefas)

    st.caption("Prévia da separação: " + processor.format_for_display(processed))

    # ---- Passo 2: atribuir melodia e harmonia ----
    st.header("2 · Melodia e harmonia")
    st.caption(
        "Preencha a **melodia** (número 1–7, pode ter # ou b) de cada sílaba. "
        "A **oitava** desloca a nota. A **harmonia** (grau romano) é opcional — "
        "informe só onde o acorde muda."
    )

    beats = _collect_beats(processed)

    # ---- Passo 3: gerar partitura ----
    st.header("3 · Partitura")

    events = build_events(beats)
    capacity = measure_capacity(time_signature)
    first_cap = anacruse if anacruse and anacruse > 0 else None
    grid = build_measures(events, capacity, first_capacity=first_cap)
    renderer = NotationRenderer(time_signature=time_signature)

    anac_txt = f" · anacruse de {anacruse:g} tempo(s)" if first_cap else ""
    st.caption(
        f"Compasso {time_signature} · {len(grid['measures'])} compasso(s){anac_txt} — "
        "as barras fecham pela soma das durações."
    )

    aba_grade, aba_pauta = st.tabs(["Grade cifrada (1–7)", "Pentagrama (sem clave)"])

    # --- Grade cifrada ---
    with aba_grade:
        svg = renderer.create_svg(grid, None)
        _svg_box(svg)
        col1, col2 = st.columns(2)
        with col1:
            st.download_button(
                "⬇️ Baixar SVG", data=svg,
                file_name="partitura_rousseau.svg", mime="image/svg+xml",
            )
        with col2:
            pdf_bytes = _render_pdf_bytes(renderer, grid)
            st.download_button(
                "⬇️ Baixar PDF", data=pdf_bytes,
                file_name="partitura_rousseau.pdf", mime="application/pdf",
            )

    # --- Pentagrama sem clave ---
    with aba_pauta:
        staff_measures = []
        for m in grid["measures"]:
            notes = []
            for b in m["beats"]:
                if b.get("kind") == "rest":
                    notes.append({"kind": "rest", "figure": b["figure"],
                                  "duration": b["duration"]})
                elif b["melody"]:
                    notes.append({"degree": b["melody"], "octave": b["octave"],
                                  "figure": b["figure"], "label": b["syllable"],
                                  "harmony": b.get("harmony")})
            if notes:
                staff_measures.append({"beats": notes})
        if staff_measures:
            staff_svg = render_staff_svg(staff_measures, notehead=notehead_mode)
            _svg_box(staff_svg)
            st.caption(
                "Sem clave: a altura é relativa (só o intervalo importa) e o "
                "desenho é centralizado pela extensão da melodia."
            )
            st.download_button(
                "⬇️ Baixar pentagrama (SVG)", data=staff_svg,
                file_name="pentagrama_rousseau.svg", mime="image/svg+xml",
            )
        else:
            st.info("Preencha a **melodia** de pelo menos uma sílaba para ver o pentagrama.")

    # ---- Referência de acordes ----
    with st.expander("📖 Acordes disponíveis (referência)"):
        for sym in get_all_chord_symbols():
            notes = format_chord_vertical(sym)
            st.write(f"**{sym}** — {', '.join(notes)}")


# ---------------------------------------------------------------------------
# Auxiliares de UI
# ---------------------------------------------------------------------------

def _svg_box(svg):
    """Exibe um SVG num quadro branco com rolagem horizontal."""
    st.markdown(
        f'<div style="overflow-x:auto; background:#fff; border:1px solid #eee; '
        f'border-radius:6px; padding:8px;">{svg}</div>',
        unsafe_allow_html=True,
    )


def _collect_beats(processed):
    """
    Renderiza uma linha de campos nativos por sílaba e coleta os pulsos.

    Usa widgets com `key` estável (por índice), então o Streamlit guarda o
    estado automaticamente entre recarregamentos — sem sobrescrever o que o
    usuário digitou. A sinalefa vem pré-marcada pela detecção automática, mas
    pode ser corrigida à mão.
    """
    chord_options = [""] + get_all_chord_symbols()
    figure_options = list(FIGURES.keys())
    default_figure_idx = figure_options.index(DEFAULT_FIGURE)
    rest_options = [NO_REST] + figure_options
    widths = [1.0, 1.1, 1.7, 1.4, 0.8, 1.2, 1.5]

    # Cabeçalho
    head = st.columns(widths)
    for col, label in zip(head, ["Sílaba", "Melodia", "Figura", "Oitava",
                                  "Sinalefa", "Harmonia", "Pausa antes"]):
        col.caption(label)

    beats = []
    for i, syl in enumerate(processed):
        cols = st.columns(widths)
        cols[0].markdown(f"**{syl['text']}**")
        melody = cols[1].text_input(
            "melodia", key=f"mel_{i}", label_visibility="collapsed",
            placeholder="—",
        )
        figure = cols[2].selectbox(
            "figura", options=figure_options, index=default_figure_idx,
            key=f"fig_{i}", label_visibility="collapsed",
        )
        octave = cols[3].selectbox(
            "oitava", options=list(OCTAVE_LABELS.keys()),
            format_func=lambda o: OCTAVE_LABELS[o],
            key=f"oct_{i}", label_visibility="collapsed",
        )
        sinalefa = cols[4].checkbox(
            "sinalefa", value=syl.get("sinalefa", False),
            key=f"sin_{i}", label_visibility="collapsed",
        )
        harmony = cols[5].selectbox(
            "harmonia", options=chord_options,
            key=f"har_{i}", label_visibility="collapsed",
        )
        rest_before = cols[6].selectbox(
            "pausa antes", options=rest_options,
            key=f"rest_{i}", label_visibility="collapsed",
        )
        beats.append({
            "syllable": syl["text"],
            "sinalefa": sinalefa,
            "melody": melody,
            "octave": octave,
            "harmony": harmony,
            "figure": figure,
            "rest_before": rest_before,
        })
    return beats


def _render_pdf_bytes(renderer, grid):
    """create_pdf escreve em arquivo; lê de volta como bytes para download."""
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        path = tmp.name
    try:
        renderer.create_pdf(grid, path)
        with open(path, "rb") as f:
            return f.read()
    finally:
        if os.path.exists(path):
            os.remove(path)


def _download_audio(url):
    """Baixa o áudio do YouTube (yt-dlp). Isolado para não quebrar o app."""
    try:
        from youtube_downloader import YouTubeDownloader
    except Exception as e:  # pragma: no cover
        st.error(f"Módulo de download indisponível: {e}")
        return

    downloader = YouTubeDownloader()
    if not downloader.is_valid_url(url):
        st.warning("URL não parece ser do YouTube.")
        return

    with st.spinner("Baixando áudio..."):
        path, info = downloader.download_with_progress(url)

    if path:
        st.success(f"Baixado: {info.get('title', 'áudio')}")
        st.audio(path)
    else:
        st.error(
            "Falha no download. Verifique a URL e a conexão; se persistir, "
            "atualize o yt-dlp (`pip install -U yt-dlp`)."
        )


if __name__ == "__main__":
    main()
