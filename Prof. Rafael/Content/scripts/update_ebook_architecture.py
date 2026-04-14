from __future__ import annotations

import shutil
import tempfile
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path


SRC = Path(
    "/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Prof. Rafael/Produtos/BKP_ESTRUTURA_SALA_CONTROLE_ABRIL_10.docx"
)

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
W = "{%s}" % NS["w"]


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


def main() -> None:
    # --- New Chapter 2 content ---
    chapter2_nodes = [
        make_p("Capítulo 2 — Prevenção e preparação", style="Heading1", bold=True),
        make_p(),
        make_p("Texto de abertura do capítulo:", style="Heading2", bold=True),
        make_p(
            "Este capítulo cria a base preventiva para que a indisciplina apareça menos e com menos intensidade. "
            "A função dele é preparar a sala para funcionar antes que o conflito apareça, "
            "com menos improviso e mais previsibilidade."
        ),
        make_p(
            "Os 8 subcapítulos a seguir cobrem desde a definição do que é sucesso até a construção "
            "de uma comunidade onde o erro é aceito como parte do aprendizado."
        ),
        make_p(),

        # --- Subcapítulo 2.1 ---
        make_p('2.1 — Deixe claro o que "sucesso" significa', style="Heading2", bold=True),
        make_p(
            "Tese central: regras positivas + contrato social. A importância de dar opção para o aluno "
            "escolher o comportamento. É mais fácil e efetivo conduzir para o acerto do que tentar bloquear "
            "o errado. Reforçar os bons modelos. Elogio público, crítica privada como regra geral."
        ),
        make_p("[Aguardando redação final — gatilho: 'registrar no livro']"),
        make_p(),

        # --- Subcapítulo 2.2 ---
        make_p("2.2 — Mais um pouco sobre rotinas", style="Heading2", bold=True),
        make_p(
            "Tese central: rotinas metodológicas durante o processo de ensino, não apenas rotinas de comportamento. "
            "Estrutura de aula por partes (objetivo no quadro, atividades visíveis, chamada musical, hora da novidade). "
            "Comum na pedagogia e na escola normal, mas raramente abordado nas licenciaturas."
        ),
        make_p("[Aguardando redação final — gatilho: 'registrar no livro']"),
        make_p(),

        # --- Subcapítulo 2.3 ---
        make_p('2.3 — Defina o que é "ordem" para cada tipo de atividade', style="Heading2", bold=True),
        make_p(
            "Tese central: ordem variável por tipo de atividade. Cada atividade demanda um estado mental diferente "
            "(Vygotsky, nível ótimo de desafio). A aula precisa de diversidade de momentos. Definir o que é 'ordem' "
            "para explicação, exercício, grupo, apresentação. Não é razoável esperar que alunos fiquem sentados e "
            "imóveis durante 45 minutos."
        ),
        make_p("[Aguardando redação final — gatilho: 'registrar no livro']"),
        make_p(),

        # --- Subcapítulo 2.4 ---
        make_p("2.4 — Use a sua vantagem", style="Heading2", bold=True),
        make_p(
            "Tese central: treinamento de rotinas iniciais — as primeiras duas semanas como janela estratégica. "
            "Enquanto os alunos estão se reconhecendo, o professor mostra pela experiência o que é uma aula ideal. "
            "Treinar rotinas, transições e comandos. Isso não elimina a necessidade de reforçar regras o ano todo."
        ),
        make_p("[Aguardando redação final — gatilho: 'registrar no livro']"),
        make_p(),

        # --- Subcapítulo 2.5 ---
        make_p("2.5 — O lado territorial da liderança em sala de aula", style="Heading2", bold=True),
        make_p(
            "Tese central: vigilância multifocal + proximidade ativa. Presença calma e assertiva, não agressiva. "
            "Ocupação intencional do espaço. Territórios se formam naturalmente; o líder precisa administrá-los. "
            "A liderança não acontece dizendo 'eu sou o líder'; acontece através da presença."
        ),
        make_p("[Aguardando redação final — gatilho: 'registrar no livro']"),
        make_p(),

        # --- Subcapítulo 2.6 ---
        make_p('2.6 — Não demande atenção desnecessariamente, mas quando demandar garanta uma aula com "bom ritmo"', style="Heading2", bold=True),
        make_p(
            "Tese central: economia da atenção. Não chamar a turma toda para questão de 3 alunos. "
            "Pacing (Basil Bernstein): quanto tempo em cada atividade, ritmo de avanço, transições fluidas. "
            "Overlapping: administrar múltiplas demandas ao mesmo tempo. "
            "Comparação com stand-up comedy: manter ritmo e fluência."
        ),
        make_p("[Aguardando redação final — gatilho: 'registrar no livro']"),
        make_p(),

        # --- Subcapítulo 2.7 ---
        make_p("2.7 — Use perguntas de modo estratégico", style="Heading2", bold=True),
        make_p(
            "Tese central: perguntas como ferramenta de engajamento e criação de imagens mentais. "
            "Perguntas abertas vs. fechadas. Resposta coral e dinâmicas rítmicas. "
            "Avaliação formativa em tempo real. BrainNet (Miguel Nicolelis): cérebros conectados no mesmo tema."
        ),
        make_p("[Aguardando redação final — gatilho: 'registrar no livro']"),
        make_p(),

        # --- Subcapítulo 2.8 ---
        make_p("2.8 — Construa uma comunidade onde as pessoas se sentem seguras o suficiente para reconhecer erros e se expressar", style="Heading2", bold=True),
        make_p(
            "Tese central: segurança psicológica para aprender. Sem erro reconhecido → sem aprendizagem. "
            "Estado mental estável e previsível do líder. Não pessoalizar relações. "
            "Tratar todos sob as mesmas regras. Defender o direito de expressão. "
            "Diversidade de perspectivas como valor educacional."
        ),
        make_p("[Aguardando redação final — gatilho: 'registrar no livro']"),
        make_p(),

        # --- Placeholder Capítulos 3 a 6 ---
        make_p("Capítulo 3 — Gestão do fluxo da aula", style="Heading1", bold=True),
        make_p("[Estrutura de subcapítulos a definir — ver GUIA_OFICIAL_40_PROTOCOLOS.md]"),
        make_p(),

        make_p("Capítulo 4 — Correção e desescalada", style="Heading1", bold=True),
        make_p("[Estrutura de subcapítulos a definir — ver GUIA_OFICIAL_40_PROTOCOLOS.md]"),
        make_p(),

        make_p("Capítulo 5 — Relação e clima", style="Heading1", bold=True),
        make_p("[Estrutura de subcapítulos a definir — ver GUIA_OFICIAL_40_PROTOCOLOS.md]"),
        make_p(),

        make_p("Capítulo 6 — Família, equipe e apoio externo", style="Heading1", bold=True),
        make_p("[Estrutura de subcapítulos a definir — ver GUIA_OFICIAL_40_PROTOCOLOS.md]"),
        make_p(),
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

        # Find the paragraph index for the old Chapter 2 heading (index 85)
        # and the "Nota de continuidade" / References section that follows (index 108+)
        # We replace from index 85 (old Chapter 2 heading) to index 108 (exclusive, the "Nota de continuidade")
        start_idx = 85   # "Capítulo 2 - Prevenção e preparação"
        # Find the end: the "Nota de continuidade" paragraph and everything after up to References
        end_idx = 108     # "Nota de continuidade: os capítulos 3 a 40..."

        new_children = list(children[:start_idx]) + chapter2_nodes + list(children[end_idx:])

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

        # Save as the new working file
        dest = Path("/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Prof. Rafael/Produtos/ebook - Gestao de sala de aula sem caos.docx")
        shutil.copy2(out, dest)
        print(f"Novo arquivo salvo em: {dest}")


if __name__ == "__main__":
    main()
