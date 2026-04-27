from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "output" / "pdf" / "programa_concerto_unipampa_2026-06-23_primeira_proposta.pdf"

EVENT_INFO = {
    "title": "Entre Sambas e Choros",
    "subtitle": "Concerto da disciplina Tópicos Especiais em Música Popular I",
    "date": "23 de junho de 2026",
    "time": "19h",
    "venue": "Auditório da Unipampa",
}

INTRO_TEXT = [
    (
        "Este concerto nasce do trabalho desenvolvido ao longo da disciplina "
        "<b>Tópicos Especiais em Música Popular I</b>, dedicada ao estudo e à "
        "prática de repertórios ligados ao <b>samba</b> e ao <b>choro</b>. "
        "A proposta do programa é apresentar ao público um recorte da canção "
        "popular brasileira a partir de obras que atravessam diferentes décadas, "
        "formas de composição e modos de interpretar."
    ),
    (
        "O repertório aproxima compositores de linhagens bastante diversas: "
        "<b>Ary Barroso</b>, <b>Luiz Peixoto</b> e <b>Vicente Paiva</b>, "
        "<b>Wilson Baptista</b> e <b>Geraldo Pereira</b>, <b>Adoniran Barbosa</b> "
        "e <b>Cartola</b> ajudam a desenhar algumas vertentes centrais do samba "
        "urbano; <b>Antonio Carlos Jobim</b>, <b>Vinicius de Moraes</b> e "
        "<b>Toquinho</b> colocam em cena o refinamento melódico da canção moderna "
        "brasileira; <b>Jacob do Bandolim</b> representa a tradição do choro; "
        "<b>Dona Ivone Lara</b>, <b>Candeia</b>, <b>Nelson Cavaquinho</b>, "
        "<b>Jorge Ben Jor</b>, <b>Arlindo Cruz</b>, <b>Franco</b>, <b>Marquinhos</b>, "
        "<b>Darcy da Mangueira</b> e os compositores associados ao repertório de "
        "<b>Bezerra da Silva</b> ampliam o programa em direção ao partido-alto, "
        "ao samba de breque, ao pagode e a outras formas de invenção popular."
    ),
    (
        "Mais do que uma sequência de canções, esta apresentação procura compartilhar "
        "com o público um percurso de escuta, estudo e prática coletiva. Esta versão "
        "já organiza os dados essenciais para divulgação e acompanhamento do concerto."
    ),
]

REPERTOIRE = [
    ("Samba da Volta", "Vinicius de Moraes, Toquinho", "João", "Cm"),
    ("Disseram que voltei Americanizada", "Luiz Peixoto, Vicente Paiva", "Yasmin", "Gm"),
    ("Samba do Trabalhador", "Darcy da Mangueira", "Samuel", "D"),
    ("Corcovado", "Antonio Carlos Jobim", "Bu", "a definir"),
    ("Acertei no Milhar", "Wilson Baptista, Geraldo Pereira", "Pedro", "a definir"),
    (
        "Sequestraram Minha Sogra",
        "Sarabanda, Barbeirinho do Jacarezinho, Rody do Jacarezinho",
        "Estefan",
        "A",
    ),
    ("Doce de Coco", "Jacob do Bandolim", "Lígia", "G*"),
    ("Morena Boca de Ouro", "Ary Barroso", "Flávia", "a definir"),
    ("O Mundo é um Moinho", "Cartola", "Yasmin e João Vitor", "a definir"),
    ("Tira o Álvaro", "Adoniran Barbosa", "Nicolas", "C"),
    (
        "Tenha Fé, Pois Amanhã um Lindo Dia Vai Nascer",
        "Jorge Ben Jor",
        "Todo mundo cantando junto, com Tute",
        "a definir",
    ),
    ("Luz do Repente", "Arlindo Cruz, Franco, Marquinhos", "Rebeca", "a definir"),
    ("Acreditar", "Dona Ivone Lara, Délcio Carvalho", "Flávia", "F"),
    ("Juízo Final", "Nelson Cavaquinho, Élcio Soares", "Gamonal", "a definir"),
    ("Preciso me Encontrar", "Candeia", "Arthur", "a definir"),
]


PALETTE = {
    "green": colors.HexColor("#0E3B2E"),
    "deep_green": colors.HexColor("#09241C"),
    "gold": colors.HexColor("#D8A33D"),
    "sand": colors.HexColor("#F4E8CF"),
    "paper": colors.HexColor("#FAF6EE"),
    "terracotta": colors.HexColor("#B6543A"),
    "ink": colors.HexColor("#1F1A17"),
    "muted": colors.HexColor("#6B6257"),
}


def build_styles():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="ConcertBody",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10.8,
            leading=15,
            textColor=PALETTE["ink"],
            alignment=TA_JUSTIFY,
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SectionTitle",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=14,
            leading=16,
            textColor=PALETTE["green"],
            alignment=TA_LEFT,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="MetaLabel",
            parent=styles["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=11,
            textColor=PALETTE["deep_green"],
            alignment=TA_LEFT,
        )
    )
    styles.add(
        ParagraphStyle(
            name="MetaValue",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10,
            leading=12,
            textColor=PALETTE["ink"],
            alignment=TA_LEFT,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SmallNote",
            parent=styles["BodyText"],
            fontName="Helvetica-Oblique",
            fontSize=8.5,
            leading=11,
            textColor=PALETTE["muted"],
            alignment=TA_LEFT,
        )
    )
    styles.add(
        ParagraphStyle(
            name="CenteredNote",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=12,
            textColor=colors.white,
            alignment=TA_CENTER,
        )
    )
    return styles


def draw_cover(canv: canvas.Canvas, _doc):
    width, height = A4

    canv.saveState()
    canv.setFillColor(PALETTE["paper"])
    canv.rect(0, 0, width, height, stroke=0, fill=1)

    canv.setFillColor(PALETTE["green"])
    canv.rect(0, height - 55 * mm, width, 55 * mm, stroke=0, fill=1)

    canv.setFillColor(PALETTE["gold"])
    canv.circle(28 * mm, height - 22 * mm, 18 * mm, stroke=0, fill=1)
    canv.setFillColor(PALETTE["terracotta"])
    canv.circle(width - 24 * mm, height - 40 * mm, 26 * mm, stroke=0, fill=1)
    canv.setFillColor(colors.HexColor("#E9C57A"))
    canv.circle(width - 60 * mm, 48 * mm, 12 * mm, stroke=0, fill=1)

    canv.setStrokeColor(PALETTE["terracotta"])
    canv.setLineWidth(1.8)
    for offset in (0, 10, 20, 30):
        canv.bezier(
            18 * mm,
            170 * mm - offset,
            80 * mm,
            188 * mm - offset,
            110 * mm,
            130 * mm - offset,
            178 * mm,
            154 * mm - offset,
        )

    canv.setFillColor(colors.white)
    canv.setFont("Helvetica-Bold", 26)
    canv.drawCentredString(width / 2, height - 95 * mm, EVENT_INFO["title"])

    canv.setFont("Helvetica", 12)
    canv.drawCentredString(width / 2, height - 104 * mm, EVENT_INFO["subtitle"])

    canv.setFillColor(PALETTE["sand"])
    canv.roundRect(34 * mm, height - 170 * mm, width - 68 * mm, 46 * mm, 8 * mm, stroke=0, fill=1)

    canv.setFillColor(PALETTE["deep_green"])
    canv.setFont("Helvetica-Bold", 13)
    canv.drawCentredString(width / 2, height - 141 * mm, EVENT_INFO["date"])
    canv.setFont("Helvetica", 11.5)
    canv.drawCentredString(width / 2, height - 149 * mm, f"{EVENT_INFO['time']}  |  {EVENT_INFO['venue']}")

    canv.setFillColor(PALETTE["ink"])
    canv.setFont("Helvetica-Oblique", 10.5)
    canv.drawCentredString(
        width / 2,
        32 * mm,
        "Primeira proposta de programa para circulação do concerto",
    )
    canv.restoreState()


def draw_header_footer(canv: canvas.Canvas, doc):
    width, height = A4

    canv.saveState()
    canv.setFillColor(PALETTE["paper"])
    canv.rect(0, 0, width, height, stroke=0, fill=1)

    canv.setFillColor(PALETTE["green"])
    canv.rect(0, height - 20 * mm, width, 20 * mm, stroke=0, fill=1)
    canv.setFillColor(colors.white)
    canv.setFont("Helvetica-Bold", 12)
    canv.drawString(18 * mm, height - 13.5 * mm, "Entre Sambas e Choros")

    canv.setFillColor(PALETTE["muted"])
    canv.setFont("Helvetica", 8.5)
    canv.drawRightString(width - 18 * mm, 10 * mm, f"Página {doc.page}")
    canv.restoreState()


def meta_table(styles):
    data = [
        [
            Paragraph("<b>Disciplina</b>", styles["MetaLabel"]),
            Paragraph("Tópicos Especiais em Música Popular I", styles["MetaValue"]),
        ],
        [
            Paragraph("<b>Data</b>", styles["MetaLabel"]),
            Paragraph(EVENT_INFO["date"], styles["MetaValue"]),
        ],
        [
            Paragraph("<b>Horário</b>", styles["MetaLabel"]),
            Paragraph(EVENT_INFO["time"], styles["MetaValue"]),
        ],
        [
            Paragraph("<b>Local</b>", styles["MetaLabel"]),
            Paragraph(EVENT_INFO["venue"], styles["MetaValue"]),
        ],
    ]
    table = Table(data, colWidths=[32 * mm, 128 * mm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                ("BOX", (0, 0), (-1, -1), 0.7, PALETTE["gold"]),
                ("INNERGRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#E6D6B5")),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return table


def repertoire_table(styles, rows):
    data = [
        [
            Paragraph("<b>Música</b>", styles["MetaValue"]),
            Paragraph("<b>Compositor(es)</b>", styles["MetaValue"]),
            Paragraph("<b>Quem canta</b>", styles["MetaValue"]),
            Paragraph("<b>Tom</b>", styles["MetaValue"]),
        ]
    ]
    for title, composers, singer, key in rows:
        data.append(
            [
                Paragraph(title, styles["ConcertBody"]),
                Paragraph(composers, styles["ConcertBody"]),
                Paragraph(singer, styles["ConcertBody"]),
                Paragraph(key, styles["ConcertBody"]),
            ]
        )

    table = Table(
        data,
        colWidths=[54 * mm, 54 * mm, 58 * mm, 18 * mm],
        repeatRows=1,
    )

    style = [
        ("BACKGROUND", (0, 0), (-1, 0), PALETTE["green"]),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, 0), 0.8, PALETTE["gold"]),
        ("BOX", (0, 0), (-1, -1), 0.7, colors.HexColor("#DCCEB9")),
        ("INNERGRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#E5DCCF")),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]

    for row_idx in range(1, len(data)):
        background = colors.white if row_idx % 2 else colors.HexColor("#F4EFE5")
        style.append(("BACKGROUND", (0, row_idx), (-1, row_idx), background))

    table.setStyle(TableStyle(style))
    return table


def build_story():
    styles = build_styles()
    story = []

    story.append(PageBreak())
    story.append(Paragraph("Apresentação", styles["SectionTitle"]))
    story.append(meta_table(styles))
    story.append(Spacer(1, 8 * mm))
    for paragraph in INTRO_TEXT:
        story.append(Paragraph(paragraph, styles["ConcertBody"]))

    story.append(Spacer(1, 3 * mm))
    story.append(
        Paragraph(
            "Os dados de repertório abaixo combinam informações artísticas para o público "
            "e informações práticas de montagem usadas pela turma nesta primeira proposta.",
            styles["SmallNote"],
        )
    )

    story.append(PageBreak())
    story.append(Paragraph("Repertório", styles["SectionTitle"]))
    story.append(repertoire_table(styles, REPERTOIRE[:8]))
    story.append(Spacer(1, 5 * mm))
    story.append(
        Paragraph(
            "A seleção cruza samba urbano, samba-canção, samba de breque, bossa nova, "
            "partido-alto, pagode e choro, enfatizando o caráter histórico e coletivo do trabalho.",
            styles["SmallNote"],
        )
    )

    story.append(PageBreak())
    story.append(Paragraph("Repertório", styles["SectionTitle"]))
    story.append(repertoire_table(styles, REPERTOIRE[8:]))
    story.append(Spacer(1, 6 * mm))
    story.append(
        Paragraph(
            "* Doce de Coco permanece provisoriamente em Sol (G) e deve ser revisada em ensaio futuro.",
            styles["SmallNote"],
        )
    )
    story.append(
        Paragraph(
            "Primeira proposta de programa. Pequenos ajustes editoriais, de ordem e de tonalidade "
            "podem ocorrer até a versão final de impressão.",
            styles["SmallNote"],
        )
    )

    return story


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=28 * mm,
        bottomMargin=18 * mm,
        title="Programa do Concerto - Entre Sambas e Choros",
        author="Codex / OpenAI",
    )

    story = build_story()
    doc.build(story, onFirstPage=draw_cover, onLaterPages=draw_header_footer)
    print(OUTPUT)


if __name__ == "__main__":
    main()
