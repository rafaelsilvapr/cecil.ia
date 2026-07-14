# Sistema Rousseau

Automatiza a **notação musical cifrada Rousseau-Galin-Paris-Chevé**: um método em que
os graus da escala são escritos com números de **1 a 7** (em vez de pautas tradicionais),
com marcações de oitava acima/abaixo do número. Voltado para educação musical.

O app oferece **duas visualizações** da mesma música:

- **Grade cifrada** — pulso a pulso, alinha **harmonia** (grau romano + formação vertical),
  **melodia** (número Rousseau com oitava) e **letra** (sílaba, com **sinalefas** destacadas);
- **Pentagrama sem clave** — a melodia num pentagrama onde a altura é **relativa** (só o
  intervalo importa), centralizada pela extensão da música.

O ritmo é controlado por **figuras** (semibreve … semicolcheia, pontuadas): as **barras de
compasso fecham automaticamente** pela soma das durações. Há suporte a **pausas** e a
**anacruse** (compasso inicial incompleto).

## Módulos

| Arquivo | Responsabilidade |
|---|---|
| [`app.py`](app.py) | **Aplicativo principal (Streamlit)** — amarra tudo no fluxo letra → sílabas → melodia/figura/harmonia/pausa → grade + pentagrama (SVG/PDF). |
| [`rhythm.py`](rhythm.py) | Figuras rítmicas e agrupamento de eventos em compassos pela soma das durações (com anacruse). |
| [`staff_notation.py`](staff_notation.py) | Pentagrama **sem clave**: posiciona cada grau pelo intervalo relativo, centraliza pela extensão, desenha figuras e pausas. |
| [`chord_database.py`](chord_database.py) | Banco de 13 acordes (7 diatônicos + 6 dominantes secundários) convertidos para números Rousseau, com marcas de oitava. |
| [`syllable_processor.py`](syllable_processor.py) | Separa letras em PT-BR em sílabas (via `pyphen`, com fallback manual por regras fonéticas) e detecta sinalefas. |
| [`notation_renderer.py`](notation_renderer.py) | Gera a grade cifrada em **SVG** e **PDF** (layout de sistemas, A4), com espaçamento proporcional à duração. |
| [`chord_visual.py`](chord_visual.py) | Componente Streamlit para exibir acordes (grau romano + números empilhados). |
| [`youtube_downloader.py`](youtube_downloader.py) | Baixa áudio de vídeos do YouTube (via `pytube` — ver ressalva abaixo). |

## Instalação

```bash
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Uso rápido

Rode o aplicativo completo:

```bash
streamlit run app.py
```

O fluxo na interface: **(1)** digite a letra → o app separa as sílabas e detecta sinalefas;
**(2)** preencha a melodia (números 1–7), a **figura** (duração), a oitava, a harmonia e,
se precisar, uma **pausa antes** da nota; **(3)** veja a **grade cifrada** e o **pentagrama
sem clave** (abas), e baixe em SVG/PDF. Anacruse configurável na barra lateral.

Cada módulo também tem uma demonstração isolada no bloco `__main__`:

```bash
python chord_database.py        # lista os acordes disponíveis
python syllable_processor.py    # separa sílabas e detecta sinalefas
python notation_renderer.py     # gera /tmp/teste_rousseau.svg e .pdf
```

Gerando uma partitura a partir do código:

```python
from notation_renderer import NotationRenderer

grid = {
    "measures": [
        {"beats": [
            {"harmony": "I",  "syllable": "Eu",  "melody": "3", "octave": "normal"},
            {"harmony": None, "syllable": "gos", "melody": "5", "octave": "normal"},
            {"harmony": None, "syllable": "ta",  "melody": "5", "octave": "up"},
            {"harmony": None, "syllable": "va~", "melody": "5", "octave": "up", "sinalefa": True},
        ]},
    ]
}

r = NotationRenderer(time_signature="4/4")
r.create_pdf(grid, "partitura.pdf")
r.create_svg(grid, "partitura.svg")
```

### Formato da grade (`grid_data`)

- `measures`: lista de compassos;
- cada compasso é `{"beats": [...]}`;
- cada pulso (`beat`) é um dicionário com as chaves opcionais:
  - `kind` — `"note"` (padrão) ou `"rest"` (pausa);
  - `harmony` — grau romano do acorde (ou `None`);
  - `melody` — número Rousseau (1–7, pode ter `#`/`b`);
  - `octave` — `"normal"`, `"up"` ou `"down"`;
  - `figure` / `duration` — figura rítmica e duração em semínimas (ver `rhythm.py`);
  - `syllable` — sílaba da letra;
  - `sinalefa` — `True` destaca a sílaba (vogais fundidas com `~` → `‿`).

Os compassos são montados automaticamente por [`rhythm.build_measures`](rhythm.py) a partir
da lista de eventos e da capacidade da fórmula (com `first_capacity` para anacruse).

## Procedência do código (importante)

O código-fonte `.py` original **foi perdido** — nunca chegou a ser versionado, e apenas o
bytecode compilado (`.pyc`) sobreviveu em cache. Estes arquivos `.py` foram **reconstruídos a
partir do bytecode** e verificados como **idênticos** ao original:

- todas as funções produzem saída igual à do bytecode em baterias de teste;
- o SVG gerado é **byte a byte idêntico**;
- os fluxos de conteúdo do PDF são idênticos.

O bytecode original está preservado em [`bytecode_original/`](bytecode_original/) como backup
(ground-truth), caso seja preciso reauditar a reconstrução no futuro.

O `app.py` original (que amarrava os módulos) rodava direto e **não deixou bytecode** — foi,
portanto, **reescrito do zero** sobre os módulos resgatados, replicando o fluxo que eles suportam.

## Próximos passos sugeridos

1. **Migrar `youtube_downloader` de `pytube` para `yt-dlp`** — `pytube` está abandonado e quebra
   a cada mudança do YouTube.
2. **Transcrição automática de melodia** — hoje a melodia (os números) é entrada manual. Integrar
   um extrator de pitch (ex.: `basic-pitch`) fecharia o fluxo "link do YouTube → partitura Rousseau".
3. **Ampliar o banco de acordes** — incluir inversões, sétimas além dos dominantes e modo menor.
4. **Testes automatizados** — formalizar as verificações (reconstrução + ritmo) como suíte de regressão.
5. **Persistência de projetos** — salvar/carregar uma música já preenchida.
6. **Refinos de gravação** — compasso de anacruse mais estreito na grade; ligaduras de valor
   (notas que cruzam a barra de compasso); glifos de pausa por figura no lugar do bloco genérico.
