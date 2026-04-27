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


def update_core_title(corexml: Path) -> None:
    tree = ET.parse(corexml)
    root = tree.getroot()
    title = root.find("dc:title", NS)
    if title is None:
        title = ET.SubElement(root, "{%s}title" % NS["dc"])
    title.text = CANONICAL_TITLE
    tree.write(corexml, xml_declaration=True, encoding="utf-8")


def chapter1_additions() -> list[ET.Element]:
    return [
        make_p("6. Protocolo do sinal mestre para silêncio", style="Heading2", bold=True),
        make_p("Situação: a turma fala por cima da instrução e cada novo pedido de silêncio custa energia."),
        make_p("Protocolo seco: usar um único sinal combinado para pausar a sala e retomar o foco sem repetir a ordem em voz alta."),
        make_p("O que evitar: falar por cima do ruído, inventar sinais diferentes a cada dia ou transformar o pedido de silêncio em disputa de volume."),
        make_p("Ideia central: o silêncio precisa virar comando visível, curto e previsível."),
        make_p(),
        make_p("7. Protocolo de delegação de tarefas e ajudantes da classe", style="Heading2", bold=True),
        make_p("Situação: o professor tenta fazer tudo sozinho e perde tempo em tarefas operacionais que poderiam ser distribuídas."),
        make_p("Protocolo seco: repartir funções simples e claras para a turma, com ajudantes da classe e pequenas rotinas de apoio."),
        make_p("O que evitar: transformar ajudantes em prêmio simbólico sem função real ou criar cargos que só geram disputa social."),
        make_p("Ideia central: liderança forte também sabe canalizar responsabilidade para a turma."),
        make_p(),
        make_p("8. Protocolo de fechamento da aula: limpeza e saída organizada", style="Heading2", bold=True),
        make_p("Situação: a aula termina em desordem, com material espalhado, barulho e saída sem comando."),
        make_p("Protocolo seco: reservar um fechamento curto para limpeza, recolhimento, revisão final e saída sob orientação docente."),
        make_p("O que evitar: deixar o fim da aula ao acaso ou aceitar que o encerramento seja o momento em que a turma devolve o caos para o corredor."),
        make_p("Ideia central: uma boa aula termina com a mesma clareza com que começou."),
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
        chapter1_idx = find_child_index(children, "Capítulo 1 - Deslocamentos e chegada à sala")
        chapter2_idx = find_child_index(children, "Capítulo 2")

        existing_text = "\n".join(para_text(el) or "" for el in children[chapter1_idx:chapter2_idx])
        if "6. Protocolo do sinal mestre para silêncio" not in existing_text:
            insert_at = chapter2_idx
            for node in chapter1_additions():
                children.insert(insert_at, node)
                insert_at += 1

        sectPr = body.find("w:sectPr", NS)
        for child in list(body):
            body.remove(child)
        for child in children:
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
