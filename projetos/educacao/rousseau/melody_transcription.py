"""
Transcrição de Melodia - Sistema Rousseau

Extrai a melodia de um arquivo de áudio e converte para números Rousseau (1-7).

Pipeline:
    áudio → pitch por quadro (pYIN, librosa) → segmentação em notas
          → estimativa da tônica (perfil de escala maior ponderado por duração)
          → graus 1-7 (+ #/b para cromatismos) + oitava (normal/up/down)
          → figuras rítmicas (quantização pela pulsação estimada)

Funciona melhor com melodia isolada (voz ou instrumento solo). Em gravações
com acompanhamento o resultado é um rascunho a revisar no editor.

Nota: o basic-pitch foi considerado, mas exige TensorFlow ≤2.15 (sem suporte
a Python 3.13). O pYIN é adequado ao caso: a melodia Rousseau é monofônica.
"""

import math
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Grau Rousseau para cada intervalo em semitons acima da tônica.
# Cromatismos usam a convenção sustenido-para-cima, exceto 7b (mais comum
# como dominante secundário V/IV no repertório tonal).
SEMITONE_TO_DEGREE = {
    0: "1", 1: "1#", 2: "2", 3: "2#", 4: "3", 5: "4",
    6: "4#", 7: "5", 8: "5#", 9: "6", 10: "7b", 11: "7",
}

MAJOR_SCALE_PCS = {0, 2, 4, 5, 7, 9, 11}

NOTE_NAMES = ["Dó", "Dó#", "Ré", "Ré#", "Mi", "Fá",
              "Fá#", "Sol", "Sol#", "Lá", "Lá#", "Si"]

# Figuras (rhythm.py) por duração em semínimas, para quantização.
FIGURE_BY_BEATS = [
    (4.0, "Semibreve (4)"),
    (3.0, "Mínima pont. (3)"),
    (2.0, "Mínima (2)"),
    (1.5, "Semínima pont. (1½)"),
    (1.0, "Semínima (1)"),
    (0.5, "Colcheia (½)"),
    (0.25, "Semicolcheia (¼)"),
]


# ---------------------------------------------------------------------------
# Funções puras (não dependem de librosa) — testáveis isoladamente
# ---------------------------------------------------------------------------

def segment_notes(midi_frames, times, min_duration=0.08, max_gap=0.06):
    """
    Agrupa quadros de pitch consecutivos em notas.

    Args:
        midi_frames: lista de valores MIDI arredondados por quadro
                     (None para quadros sem voz)
        times: lista de instantes (s) de cada quadro
        min_duration: descarta notas mais curtas que isso (ruído)
        max_gap: buracos sem voz até este tamanho não quebram a nota

    Returns:
        list de dicts {'midi', 'start', 'end', 'duration'}
    """
    notes = []
    cur = None  # {'midi', 'start', 'last_t'}

    def close(cur, end):
        dur = end - cur["start"]
        if dur >= min_duration:
            notes.append({
                "midi": cur["midi"], "start": cur["start"],
                "end": end, "duration": dur,
            })

    for t, m in zip(times, midi_frames):
        if m is None:
            if cur and (t - cur["last_t"]) > max_gap:
                close(cur, cur["last_t"])
                cur = None
            continue
        if cur is None:
            cur = {"midi": m, "start": t, "last_t": t}
        elif m == cur["midi"]:
            cur["last_t"] = t
        else:
            close(cur, t)
            cur = {"midi": m, "start": t, "last_t": t}

    if cur:
        close(cur, cur["last_t"])

    return notes


def estimate_tonic(notes):
    """
    Estima a tônica (classe de altura 0-11) da melodia.

    Pontua cada candidata pela fração (ponderada por duração) das notas que
    caem na escala maior dela; desempata favorecendo a candidata que coincide
    com a última nota e com a mais frequente (âncoras comuns da tônica).

    Args:
        notes: list de dicts com 'midi' e 'duration'

    Returns:
        int 0-11 (0=Dó) ou None se não houver notas
    """
    if not notes:
        return None

    weight = [0.0] * 12
    for n in notes:
        weight[int(n["midi"]) % 12] += n["duration"]
    total = sum(weight) or 1.0

    last_pc = int(notes[-1]["midi"]) % 12
    modal_pc = max(range(12), key=lambda pc: weight[pc])

    best_pc, best_score = 0, -1.0
    for tonic in range(12):
        in_scale = sum(weight[(tonic + s) % 12] for s in MAJOR_SCALE_PCS)
        score = in_scale / total
        if tonic == last_pc:
            score += 0.10
        if tonic == modal_pc:
            score += 0.05
        if score > best_score:
            best_pc, best_score = tonic, score

    return best_pc


def choose_base_octave(notes, tonic_pc):
    """
    Escolhe a oitava-base: aquela cuja janela [tônica, tônica+12) contém o
    maior peso (duração) de notas — essas ficam como 'normal'; abaixo vira
    'down', acima vira 'up'.

    Returns:
        int: nota MIDI da tônica que abre a janela 'normal'
    """
    if not notes:
        return 60 + tonic_pc

    candidates = {}
    for n in notes:
        base = int(n["midi"]) - ((int(n["midi"]) - tonic_pc) % 12)
        candidates[base] = candidates.get(base, 0.0) + n["duration"]

    return max(candidates, key=candidates.get)


def midi_to_rousseau(midi, tonic_pc, base_tonic_midi):
    """
    Converte uma nota MIDI em (grau Rousseau, oitava).

    Args:
        midi: int - nota MIDI
        tonic_pc: int 0-11 - classe de altura da tônica
        base_tonic_midi: int - tônica MIDI que abre a janela 'normal'

    Returns:
        (str grau ex.: '5', '4#', str oitava: 'down'|'normal'|'up')
    """
    semitone = (int(midi) - tonic_pc) % 12
    degree = SEMITONE_TO_DEGREE[semitone]

    offset = math.floor((int(midi) - base_tonic_midi) / 12)
    if offset <= -1:
        octave = "down"
    elif offset >= 1:
        octave = "up"
    else:
        octave = "normal"
    return degree, octave


def quantize_figure(duration_s, quarter_s):
    """
    Escolhe a figura rítmica mais próxima da duração da nota.

    Args:
        duration_s: duração da nota em segundos
        quarter_s: duração da semínima em segundos

    Returns:
        (str nome da figura, float duração em semínimas)
    """
    if quarter_s <= 0:
        quarter_s = 0.5
    beats = duration_s / quarter_s
    name = min(
        FIGURE_BY_BEATS,
        key=lambda fb: abs(math.log(max(beats, 1e-3)) - math.log(fb[0])),
    )
    return name[1], name[0]


def estimate_quarter(notes, tempo_bpm=None):
    """
    Duração da semínima em segundos.

    Usa o tempo detectado se disponível; senão assume que a duração mediana
    das notas é uma semínima (bom chute para melodias cantadas).
    """
    if tempo_bpm and tempo_bpm > 0:
        return 60.0 / float(tempo_bpm)
    if notes:
        durs = sorted(n["duration"] for n in notes)
        return durs[len(durs) // 2]
    return 0.5


def notes_to_rousseau(notes, tonic_pc=None, tempo_bpm=None):
    """
    Converte notas (MIDI + duração) em eventos Rousseau prontos para o editor.

    Args:
        notes: list de dicts {'midi', 'start', 'end', 'duration'}
        tonic_pc: força uma tônica 0-11 (None = estimar)
        tempo_bpm: força um andamento (None = estimar)

    Returns:
        dict {'tonic_pc', 'tonic_name', 'quarter_s', 'events': [
            {'melody', 'octave', 'figure', 'midi', 'start', 'duration_s'}]}
    """
    if not notes:
        return {"tonic_pc": None, "tonic_name": None,
                "quarter_s": None, "events": []}

    if tonic_pc is None:
        tonic_pc = estimate_tonic(notes)
    base = choose_base_octave(notes, tonic_pc)
    quarter = estimate_quarter(notes, tempo_bpm)

    events = []
    for n in notes:
        degree, octave = midi_to_rousseau(n["midi"], tonic_pc, base)
        figure, _beats = quantize_figure(n["duration"], quarter)
        events.append({
            "melody": degree, "octave": octave, "figure": figure,
            "midi": int(n["midi"]), "start": n["start"],
            "duration_s": n["duration"],
        })

    return {"tonic_pc": tonic_pc, "tonic_name": NOTE_NAMES[tonic_pc],
            "quarter_s": quarter, "events": events}


# ---------------------------------------------------------------------------
# Extração de pitch (requer librosa)
# ---------------------------------------------------------------------------

def extract_notes(audio_path, fmin_note="C2", fmax_note="C6", max_duration=None):
    """
    Extrai notas (MIDI + tempos) de um arquivo de áudio via pYIN.

    Args:
        audio_path: caminho do arquivo (mp3/m4a/wav...)
        fmin_note/fmax_note: faixa de busca de pitch (notação científica)
        max_duration: analisa só os primeiros N segundos (None = tudo);
                      o pYIN é lento em gravações longas

    Returns:
        (list de notas — ver segment_notes, float tempo_bpm ou None)
    """
    import numpy as np
    import librosa

    y, sr = librosa.load(audio_path, sr=22050, mono=True, duration=max_duration)

    f0, voiced_flag, _prob = librosa.pyin(
        y, sr=sr,
        fmin=librosa.note_to_hz(fmin_note),
        fmax=librosa.note_to_hz(fmax_note),
    )
    times = librosa.times_like(f0, sr=sr)

    midi_frames = []
    for hz, voiced in zip(f0, voiced_flag):
        if voiced and hz and not np.isnan(hz):
            midi_frames.append(int(round(librosa.hz_to_midi(hz))))
        else:
            midi_frames.append(None)

    notes = segment_notes(midi_frames, list(times))

    tempo_bpm = None
    try:
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        tempo_bpm = float(tempo) if np.ndim(tempo) == 0 else float(tempo[0])
        if tempo_bpm <= 0:
            tempo_bpm = None
    except Exception as e:
        logger.info(f"Detecção de andamento falhou (seguindo sem): {e}")

    return notes, tempo_bpm


def transcribe_melody(audio_path, tonic_pc=None, max_duration=None):
    """
    Pipeline completo: áudio → eventos Rousseau.

    Args:
        audio_path: caminho do arquivo de áudio
        tonic_pc: força a tônica 0-11 (None = estimar automaticamente)
        max_duration: analisa só os primeiros N segundos (None = tudo)

    Returns:
        dict de notes_to_rousseau() (chave 'events' pode vir vazia)
    """
    notes, tempo_bpm = extract_notes(audio_path, max_duration=max_duration)
    logger.info(f"{len(notes)} notas extraídas de {audio_path}")
    return notes_to_rousseau(notes, tonic_pc=tonic_pc, tempo_bpm=tempo_bpm)


if __name__ == "__main__":
    import sys

    print("=== Transcrição de Melodia (Rousseau) ===\n")
    if len(sys.argv) < 2:
        print("Uso: python melody_transcription.py <arquivo_de_audio> [tônica 0-11]")
        sys.exit(0)

    tonic = int(sys.argv[2]) if len(sys.argv) > 2 else None
    result = transcribe_melody(sys.argv[1], tonic_pc=tonic)

    print(f"Tônica estimada: {result['tonic_name']} "
          f"(semínima ≈ {result['quarter_s']:.2f}s)\n")
    for ev in result["events"]:
        mark = {"up": "̄", "down": "̱"}.get(ev["octave"], "")
        print(f"  {ev['start']:6.2f}s  {ev['melody']}{mark:2}  {ev['figure']}")
