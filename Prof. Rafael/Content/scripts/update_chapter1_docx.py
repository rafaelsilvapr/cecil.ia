from __future__ import annotations

import shutil
import tempfile
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path


SRC = Path(
    "/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Prof. Rafael/Produtos/ebook - Sala de aula sob controle.docx"
)

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
W = "{%s}" % NS["w"]

OLD_TOC = "Capítulo 1 - Quando a aula começa e a turma já está fora do eixo"
NEW_TOC = "Capítulo 1 - Deslocamentos e chegada à sala"
OLD_HEADING = "Capítulo 1 - Quando a aula começa e a turma já está fora do eixo"
NEXT_HEADING = "Capítulo 2 - Prevenção e preparação"


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


def main() -> None:
    chapter_nodes = [
        make_p("Capítulo 1 - Deslocamentos e chegada à sala", style="Heading1", bold=True),
        make_p("Texto de abertura do capítulo:", style="Heading2", bold=True),
        make_p(
            "Este capítulo organiza a entrada do professor na rotina da aula, do deslocamento ao fechamento, para que a sala comece e termine sob comando, com calma, previsibilidade e autoridade."
        ),
        make_p(
            "A habilidade central aqui é transformar cada transição em rotina: chegar, ocupar o espaço, iniciar a aula, sustentar a ordem e encerrar sem caos."
        ),
        make_p(),
        make_p("1. Protocolo de deslocamentos e chegada à sala", style="Heading2", bold=True),
        make_p(
            "Situação: a aula termina e a próxima começa sem uma passagem clara; o corredor, a fila ou a troca de sala viram parte do problema."
        ),
        make_p(
            "Protocolo seco: definir um modo fixo de sair, entrar, tomar lugar e iniciar a tarefa, respeitando as regras gerais da escola e sem entrar na lógica de competir por simpatia."
        ),
        make_p(
            "O que evitar: querer ser o herói da turma, negociar regras de corredor no improviso ou agir como se a regra institucional só valesse quando convém."
        ),
        make_p(
            "Ideia central: se o professor discordar de uma regra, leva a proposta para a instância correta; o protocolo não é romper a escola, é fazer a rotina funcionar dentro dela."
        ),
        make_p(),
        make_p("2. Protocolo de cheque do estado mental", style="Heading2", bold=True),
        make_p("Situação: o professor chega carregado, ansioso, irritado ou com medo e isso contamina a entrada."),
        make_p("Protocolo seco: antes de entrar, respirar fundo, notar o próprio estado e assumir uma postura calma e assertiva."),
        make_p("O que evitar: entrar acelerado, reagir no impulso ou deixar o próprio humor governar a sala."),
        make_p("Ideia central: o estado emocional do líder influencia o clima da turma, então a entrada começa em quem conduz a aula."),
        make_p(),
        make_p("3. Protocolo “Turma é ninguém”", style="Heading2", bold=True),
        make_p("Situação: a turma não responde, não silencia ou dispersa quando o professor fala com o grupo inteiro."),
        make_p("Protocolo seco: parar de falar com “a turma” como bloco abstrato e dirigir instruções pessoa por pessoa, pelo nome."),
        make_p("O que evitar: repetir “turma, turma, turma” esperando um coletivo que não age como unidade."),
        make_p("Ideia central: em sala de aula, a autoridade acontece em relações pessoais, não em uma massa indistinta."),
        make_p(),
        make_p("4. Protocolo de rotinas para abertura e encerramento", style="Heading2", bold=True),
        make_p("Situação: a aula começa solta, termina solta e o professor perde energia nos dois extremos."),
        make_p("Protocolo seco: usar um ritual fixo de abertura, visualização do objetivo, acompanhamento do andamento e fechamento organizado."),
        make_p("O que evitar: improvisar a abertura todos os dias ou encerrar a aula sem revisar o que foi feito."),
        make_p("Ideia central: a aula precisa mostrar ao aluno onde está, para onde vai e quando termina."),
        make_p(),
        make_p("5. Protocolo do espaço físico e sua conquista", style="Heading2", bold=True),
        make_p("Situação: a sala parece ter donos informais, cantos fixos e territórios invisíveis que limitam a circulação do professor."),
        make_p("Protocolo seco: caminhar pela sala, reorganizar o espaço quando necessário e treinar os alunos para recolocar tudo no lugar sem bagunça."),
        make_p("O que evitar: ficar preso ao quadro, pedir permissão ao espaço ou aceitar territórios intocáveis dentro da sala."),
        make_p("Ideia central: a sala pertence ao trabalho pedagógico, não aos grupos que se formaram dentro dela."),
    ]

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

        children = list(body)

        # Update the chapter title in the summary and elsewhere.
        for p in body.findall(".//w:p", NS):
            texts = p.findall(".//w:t", NS)
            combined = "".join(t.text or "" for t in texts)
            if "Quando a aula começa e a turma já está fora do eixo" in combined and texts:
                texts[0].text = NEW_TOC
                for extra in texts[1:]:
                    extra.text = ""

        # The body structure has been inspected already; these are the
        # direct-child indices for the Chapter 1 block in this document.
        start_idx = 69  # 0-based index for the Chapter 1 heading paragraph
        end_idx = 97    # 0-based index for the Chapter 2 heading paragraph

        new_children = list(children[:start_idx]) + chapter_nodes + list(children[end_idx:])
        sectPr = body.find("w:sectPr", NS)
        for child in list(body):
            body.remove(child)
        for child in new_children:
            body.append(child)
        if sectPr is not None and sectPr not in body:
            body.append(sectPr)
        tree.write(docxml, xml_declaration=True, encoding="utf-8")

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
