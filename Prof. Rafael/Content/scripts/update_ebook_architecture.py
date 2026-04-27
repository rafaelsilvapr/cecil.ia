from __future__ import annotations

import shutil
import tempfile
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path


SRC = Path(
    "/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Prof. Rafael/Produtos/ebook - Gestao de sala de aula sem caos.docx"
)

NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "cp": "http://schemas.openxmlformats.org/package/2006/metadata/core-properties",
    "dc": "http://purl.org/dc/elements/1.1/",
}
W = "{%s}" % NS["w"]

CANONICAL_TITLE = "Gestão de sala de aula sem caos: 40 protocolos práticos para reduzir a indisciplina no dia a dia"
TITLE_REPLACEMENTS = {
    "Sala de aula sob controle": "Gestão de sala de aula sem caos",
    "Título: Sala de aula sob controle: manual para aulas de 45 minutos com alta aprendizagem e menos estresse.": "Título: Gestão de sala de aula sem caos: 40 protocolos práticos para reduzir a indisciplina no dia a dia.",
    "Título: Gestão de sala de aula sem caos: manual para aulas de 45 minutos com alta aprendizagem e menos estresse.": "Título: Gestão de sala de aula sem caos: 40 protocolos práticos para reduzir a indisciplina no dia a dia.",
    "Distribuição oficial dos 40 capítulos": "Distribuição oficial dos ~40 protocolos",
    "Nota editorial: o sumário acima já reflete a arquitetura oficial de 40 capítulos. O corpo abaixo ainda preserva um rascunho de trabalho anterior e será reestruturado ao longo da consolidação do livro.": "Nota editorial: o sumário acima já reflete a arquitetura oficial de 6 capítulos e ~40 protocolos. O corpo abaixo ainda preserva um rascunho de trabalho anterior e será reestruturado ao longo da consolidação do livro.",
}


def make_p(text: str = "", style: str | None = None, bold: bool = False) -> ET.Element:
    p = ET.Element(W + "p")
    if style:
        pPr = ET.SubElement(p, W + "pPr")
        pStyle = ET.SubElement(pPr, W + "pStyle")
        pStyle.set(W + "val", style)
    if text:
        r = ET.SubElement(p, W + "r")
        if bold:
            rPr = ET.SubElement(r, W + "rPr")
            ET.SubElement(rPr, W + "b")
        t = ET.SubElement(r, W + "t")
        if text.startswith(" ") or text.endswith(" "):
            t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
        t.text = text
    else:
        ET.SubElement(p, W + "r")
    return p


def para_text(el: ET.Element) -> str | None:
    if el.tag != W + "p":
        return None
    return "".join(t.text or "" for t in el.findall(".//w:t", NS)).strip()


def set_paragraph_text(p: ET.Element, text: str) -> None:
    for child in list(p):
        if child.tag != W + "pPr":
            p.remove(child)
    r = ET.SubElement(p, W + "r")
    t = ET.SubElement(r, W + "t")
    if text.startswith(" ") or text.endswith(" "):
        t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    t.text = text


def replace_text_in_paragraphs(root: ET.Element, replacements: dict[str, str]) -> None:
    for p in root.findall(".//w:p", NS):
        current = para_text(p)
        if not current:
            continue
        new_text = current
        for old, new in replacements.items():
            if old in new_text:
                new_text = new_text.replace(old, new)
        if new_text != current:
            set_paragraph_text(p, new_text)


def find_child_index(children: list[ET.Element], needle: str) -> int:
    for idx, el in enumerate(children):
        txt = para_text(el)
        if txt and needle in txt:
            return idx
    raise RuntimeError(f"Não encontrei o trecho '{needle}' no documento")


def find_next_child_index(children: list[ET.Element], needle: str, start: int) -> int | None:
    for idx in range(start, len(children)):
        txt = para_text(children[idx])
        if txt and needle in txt:
            return idx
    return None


def update_core_title(corexml: Path) -> None:
    tree = ET.parse(corexml)
    root = tree.getroot()
    title = root.find("dc:title", NS)
    if title is None:
        title = ET.SubElement(root, "{%s}title" % NS["dc"])
    title.text = CANONICAL_TITLE
    tree.write(corexml, xml_declaration=True, encoding="utf-8")


def chapter2_nodes() -> list[ET.Element]:
    return [
        make_p("Capítulo 2 — Prevenção e preparação", style="Heading1", bold=True),
        make_p(),
        make_p("Texto de abertura do capítulo:", style="Heading2", bold=True),
        make_p(
            "Este capítulo prepara a sala para funcionar antes que o conflito apareça. A lógica aqui é preventiva: instalar previsibilidade, reduzir improviso e diminuir a chance de a indisciplina ganhar espaço."
        ),
        make_p(
            "Os 8 temas-candidatos do mapa editorial se condensam aqui em 6 protocolos finais. A ideia não é explicar tudo de novo, e sim oferecer os blocos mais fortes para que a prevenção seja prática, clara e fácil de aplicar."
        ),
        make_p(),
        make_p("2.1 — Regras positivas e contrato social", style="Heading2", bold=True),
        make_p(
            "Regras positivas dão direção concreta para o comportamento e o contrato social transforma expectativa em pacto de convivio. O professor conduz para o acerto, reforça bons modelos e usa elogio publico com critica privada como regra geral."
        ),
        make_p("[Aguardando redação final — gatilho: 'registrar no livro']"),
        make_p(),
        make_p("2.2 — Primeiras duas semanas / boot camp preventivo", style="Heading2", bold=True),
        make_p(
            "As duas primeiras semanas são a janela de maior alavanca: enquanto os alunos ainda estão se reconhecendo, o professor treina rotinas, transicoes e comandos para mostrar pela experiencia como a aula funciona."
        ),
        make_p("[Aguardando redação final — gatilho: 'registrar no livro']"),
        make_p(),
        make_p("2.3 — Vigilancia multifocal + proximidade ativa", style="Heading2", bold=True),
        make_p(
            "O professor percebe o que acontece em toda a sala enquanto ensina e circula com intencao para reduzir zonas de risco. A liderança aparece na circulacao, na ocupacao do espaco e na vigilancia calma."
        ),
        make_p("[Aguardando redação final — gatilho: 'registrar no livro']"),
        make_p(),
        make_p("2.4 — Overlapping + transições suaves", style="Heading2", bold=True),
        make_p(
            "O professor administra uma demanda sem quebrar a outra e passa de uma atividade a outra sem vácuo. O foco e a continuidade precisam andar juntos para a aula não virar tempo morto."
        ),
        make_p("[Aguardando redação final — gatilho: 'registrar no livro']"),
        make_p(),
        make_p('2.5 — Wait-time + momentum', style="Heading2", bold=True),
        make_p(
            "O professor da tempo real para pensar e sustenta o fluxo da aula sem pausas improdutivas. Espera produtiva e continuidade são as duas metades do mesmo controle de ritmo."
        ),
        make_p("[Aguardando redação final — gatilho: 'registrar no livro']"),
        make_p(),
        make_p("2.6 — Demanda acadêmica + pertencimento/clima", style="Heading2", bold=True),
        make_p(
            "A tarefa precisa estar no ponto certo e a turma precisa sentir que pertence a uma comunidade de aprendizagem. A prevenção aqui une desafio cognitivo, segurança psicológica e baixo medo de errar."
        ),
        make_p("[Aguardando redação final — gatilho: 'registrar no livro']"),
        make_p(),
    ]


def main() -> None:
    with tempfile.TemporaryDirectory() as td:
        td_path = Path(td)
        with zipfile.ZipFile(SRC, "r") as zin:
            zin.extractall(td_path)

        docxml = td_path / "word" / "document.xml"
        tree = ET.parse(docxml)
        root = tree.getroot()
        body = root.find("w:body", NS)
        if body is None:
            raise RuntimeError("document.xml sem body")

        replace_text_in_paragraphs(root, TITLE_REPLACEMENTS)

        children = list(body)
        chapter2_idx = find_child_index(children, "Capítulo 2")
        chapter3_idx = find_child_index(children, "Capítulo 3")
        chapter3_dup_idx = find_next_child_index(children, "Capítulo 3", chapter3_idx + 1)

        new_nodes = chapter2_nodes()
        tail_end = chapter3_dup_idx if chapter3_dup_idx is not None else len(children)
        new_children = list(children[:chapter2_idx]) + new_nodes + list(children[chapter3_idx:tail_end])

        sectPr = body.find("w:sectPr", NS)
        for child in list(body):
            body.remove(child)
        for child in new_children:
            body.append(child)
        if sectPr is not None and sectPr not in body:
            body.append(sectPr)
        tree.write(docxml, xml_declaration=True, encoding="utf-8")

        corexml = td_path / "docProps" / "core.xml"
        if corexml.exists():
            update_core_title(corexml)

        out = td_path / "updated.docx"
        with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zout:
            for path in td_path.rglob("*"):
                if path == out:
                    continue
                if path.is_file():
                    zout.write(path, path.relative_to(td_path).as_posix())

        shutil.copy2(out, SRC)


if __name__ == "__main__":
    main()
