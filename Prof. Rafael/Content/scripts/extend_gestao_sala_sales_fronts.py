import csv
from pathlib import Path


BASE_DIR = Path("/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Prof. Rafael")
DRIVE_BASE_DIR = Path(
    "/Users/rafaelrodriguesdasilva/Library/CloudStorage/GoogleDrive-rafaelsilva.pr@gmail.com/Meu Drive/Empreendedor/Professor Rafael/Prof. Rafael"
)

INPUT_CSVS = [
    DRIVE_BASE_DIR / "output/spreadsheet/mapa_mercado_ebooks_gestao_sala_seed_2026-04-08.csv",
    BASE_DIR / "output/spreadsheet/mapa_mercado_ebooks_gestao_sala_seed_2026-04-08.csv",
]
OUTPUT_CSVS = [
    DRIVE_BASE_DIR / "output/spreadsheet/mapa_mercado_ebooks_gestao_sala_seed_2026-04-08.csv",
    BASE_DIR / "output/spreadsheet/mapa_mercado_ebooks_gestao_sala_seed_2026-04-08.csv",
]
RAW_DIRS = [
    DRIVE_BASE_DIR / "Content/base_de_dados/ebooks_gestao_sala/raw/sales_pages",
    BASE_DIR / "Content/base_de_dados/ebooks_gestao_sala/raw/sales_pages",
]


def pick_input_csv() -> Path:
    for path in INPUT_CSVS:
        if path.exists():
            return path
    raise FileNotFoundError("Nenhuma CSV de entrada encontrada.")


def slugify(text: str) -> str:
    out = []
    last_dash = False
    for ch in text.lower():
        if ch.isalnum():
            out.append(ch)
            last_dash = False
        else:
            if not last_dash:
                out.append("-")
                last_dash = True
    slug = "".join(out).strip("-")
    return slug[:90] or "item"


def write_csv(path: Path, rows: list[dict], fieldnames: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def write_raw_copy(row: dict) -> str:
    text = (row.get("copy_integral_publica") or "").strip()
    if not text:
        return ""
    slug = slugify(f"{row['plataforma']}-{row['titulo']}")
    rel = Path(f"{slug}.md")
    payload = (
        f"# {row['titulo']}\n\n"
        f"Platform: {row['plataforma']}\n"
        f"Source: {row.get('url_pagina_vendas', '')}\n"
        f"Source type: {row.get('copy_integral_origem', '')}\n\n"
        f"{text}\n"
    )
    for base in RAW_DIRS:
        path = base / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(payload, encoding="utf-8")
    return str(rel)


def make_row(**kwargs) -> dict:
    defaults = {
        "plataforma": "",
        "tipo_fonte": "",
        "titulo": "",
        "autor_marca": "",
        "preco_principal": "nao publico",
        "moeda": "BRL",
        "publico_alvo": "",
        "url_pagina_vendas": "",
        "copy_resumo": "",
        "qtd_visualizacoes_pagina_publica": "nao publico",
        "qtd_avaliacoes": "nao publico",
        "avaliacao_media": "nao publico",
        "paginas_ou_duracao": "nao publico",
        "fonte_1": "",
        "observacoes": "",
        "copy_integral_publica": "",
        "copy_integral_origem": "",
        "copy_integral_arquivo": "",
    }
    defaults.update(kwargs)
    return defaults


def main() -> int:
    input_csv = pick_input_csv()
    with input_csv.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    fieldnames = list(rows[0].keys())

    # Normalize singular course label to plural.
    for row in rows:
        if (row.get("tipo_fonte") or "").strip().lower() == "curso":
            row["tipo_fonte"] = "cursos"

    existing_titles = {
        (row.get("plataforma", "").strip().lower(), row.get("titulo", "").strip().lower())
        for row in rows
    }

    # Reclassify existing Hotmart products that are clearly courses.
    for row in rows:
        title = (row.get("titulo") or "").strip().lower()
        if title in {
            "como trabalhar indisciplina escolar",
            "sistema zerando a indisciplina",
        }:
            row["tipo_fonte"] = "cursos"

    additions = [
        make_row(
            plataforma="Hotmart",
            tipo_fonte="cursos",
            titulo="Gestão de Sala de Aula - Kanttum Tecnologia",
            autor_marca="Kanttum Tecnologia",
            publico_alvo="professores e educadores",
            url_pagina_vendas="https://hotmart.com/pt-br/marketplace/produtos/hagsxd-gestao-de-sala-de-aula-4g8zy/J94114560V",
            copy_resumo="Formação com quatro módulos essenciais para transformar a jornada educacional com técnicas validadas de gestão de sala de aula.",
            paginas_ou_duracao="4 módulos",
            fonte_1="https://hotmart.com/pt-br/marketplace/produtos/hagsxd-gestao-de-sala-de-aula-4g8zy/J94114560V",
            observacoes="Curso com promessa direta de reduzir imprevistos e falta de tempo na sala.",
            copy_integral_publica=(
                "FORMAÇÃO - GESTÃO DE SALA DE AULA. Aprenda técnicas validadas de gestão de sala de aula para "
                "melhorar a aprendizagem e não sofrer mais com imprevistos ou falta de tempo na sala de aula. "
                "Descubra os 4 módulos essenciais para transformar sua jornada educacional."
            ),
            copy_integral_origem="hotmart_page_snippet",
        ),
        make_row(
            plataforma="Hotmart",
            tipo_fonte="cursos",
            titulo="Gestão de sala de aula - Renata Kelly da Silva",
            autor_marca="Renata Kelly da Silva",
            publico_alvo="educadores",
            url_pagina_vendas="https://hotmart.com/pt-br/marketplace/produtos/gestao-de-sala-de-aula/Y84901756H",
            copy_resumo="Curso que oferece habilidades e técnicas para criar um ambiente de aprendizado eficaz e lidar com comportamentos desafiadores.",
            fonte_1="https://hotmart.com/pt-br/marketplace/produtos/gestao-de-sala-de-aula/Y84901756H",
            observacoes="Curso curto com foco em regras, rotinas, participação e atmosfera positiva.",
            copy_integral_publica=(
                "O curso de Gestão de sala de aula oferece aos educadores as habilidades e técnicas necessárias "
                "para criar um ambiente de aprendizado eficaz. Os participantes aprenderão estratégias para lidar "
                "com comportamentos desafiadores, promover a participação dos alunos e estabelecer uma atmosfera "
                "positiva na sala de aula. O curso aborda regras, rotinas, métodos interativos e engajamento."
            ),
            copy_integral_origem="hotmart_page_snippet",
        ),
        make_row(
            plataforma="Hotmart",
            tipo_fonte="cursos",
            titulo="Gestão de sala de aula: Técnicas e estratégias de gestão saudável de sala de aula - 20 horas",
            autor_marca="nao exibido",
            publico_alvo="educadores",
            url_pagina_vendas="https://hotmart.com/pt-br/marketplace/produtos/gestao-de-sala-de-aula-tecnicas-e-estrategias-de-gestao-saudavel-de-sala-de-aula-20-horas/L84086186Y",
            copy_resumo="Curso sobre gestão saudável com técnicas para disciplina, motivação, regras, resolução de conflitos e relacionamento saudável.",
            paginas_ou_duracao="20 horas",
            fonte_1="https://hotmart.com/pt-br/marketplace/produtos/gestao-de-sala-de-aula-tecnicas-e-estrategias-de-gestao-saudavel-de-sala-de-aula-20-horas/L84086186Y",
            observacoes="Bom para ancorar a promessa em disciplina, motivação e relacionamento.",
            copy_integral_publica=(
                "O objetivo deste conteúdo é mostrar aos educadores a importância de uma gestão saudável da sala "
                "de aula, fornecendo técnicas e estratégias para disciplina, motivação dos alunos, estabelecimento "
                "de regras e resolução de conflitos. O curso busca capacitar os professores a lidar com desafios "
                "comportamentais, promover a participação ativa dos alunos e estabelecer relacionamentos saudáveis."
            ),
            copy_integral_origem="hotmart_page_snippet",
        ),
        make_row(
            plataforma="Hotmart",
            tipo_fonte="cursos",
            titulo="Domine a Disciplina em Sala de Aula",
            autor_marca="Tiago da Flex",
            publico_alvo="professores",
            url_pagina_vendas="https://hotmart.com/pt-br/marketplace/produtos/domine-a-disciplina-em-sala-de-aula/E101354624Q",
            copy_resumo="Guia essencial para professores com dois módulos, videoaulas e materiais de apoio para fortalecer autoridade e disciplina positiva.",
            fonte_1="https://hotmart.com/pt-br/marketplace/produtos/domine-a-disciplina-em-sala-de-aula/E101354624Q",
            observacoes="Tese forte de autoridade construtiva e disciplina positiva.",
            copy_integral_publica=(
                "Domine a Disciplina em Sala de Aula: Guia Essencial para Professores. O curso é apresentado como "
                "solução para transformar a prática pedagógica e fortalecer a autoridade de forma construtiva. "
                "Traz dois módulos dinâmicos, videoaulas, materiais de apoio, disciplina positiva, expectativas "
                "claras, relacionamentos sólidos, comunicação assertiva, escuta ativa, feedback construtivo e "
                "resolução colaborativa de conflitos."
            ),
            copy_integral_origem="hotmart_page_snippet",
        ),
        make_row(
            plataforma="Hotmart",
            tipo_fonte="cursos",
            titulo="INTELIGÊNCIA EMOCIONAL NA GESTÃO DE SALA DE AULA O afeto vira estratégia para educar",
            autor_marca="nao exibido",
            publico_alvo="professores e profissionais da educação",
            url_pagina_vendas="https://hotmart.com/pt-br/marketplace/produtos/hagsxd-inteligencia-emocional-na-gestao-de-sala-de-aula-o-afeto-vira-estrategia-para-educar-cn036/K99607150R",
            copy_resumo="Formação sobre autoconhecimento, equilíbrio emocional e estratégias práticas para o cotidiano escolar.",
            paginas_ou_duracao="blocos curtos de 10 minutos",
            fonte_1="https://hotmart.com/pt-br/marketplace/produtos/hagsxd-inteligencia-emocional-na-gestao-de-sala-de-aula-o-afeto-vira-estrategia-para-educar-cn036/K99607150R",
            observacoes="Boa frente para o recorte de sobrecarga emocional do professor.",
            copy_integral_publica=(
                "Formação online voltada para professores e profissionais da educação que desejam transformar sua "
                "prática por meio do autoconhecimento, do equilíbrio emocional e de estratégias práticas para o dia "
                "a dia escolar. O curso trabalha os pilares da inteligência emocional, autorregulação, escuta ativa, "
                "check-in emocional, relações com os alunos e o impacto da BNCC e da neuroeducação."
            ),
            copy_integral_origem="hotmart_page_snippet",
        ),
        make_row(
            plataforma="Hotmart",
            tipo_fonte="cursos",
            titulo="Comunidade Sala dos Professores",
            autor_marca="Rohde & Ferraz Desenvolvimento",
            publico_alvo="professores",
            url_pagina_vendas="https://hotmart.com/pt-br/marketplace/produtos/comunidade-sala-dos-professores/F104450394L",
            copy_resumo="Comunidade anual com módulos, biblioteca de aulas, encontros ao vivo e materiais aplicáveis sobre rotina, comportamento e clareza instrucional.",
            paginas_ou_duracao="365 dias",
            fonte_1="https://hotmart.com/pt-br/marketplace/produtos/comunidade-sala-dos-professores/F104450394L",
            observacoes="Modelo de recorrência e LTV alto; bom sinal de mercado para formação contínua.",
            copy_integral_publica=(
                "Sala dos Professores é uma comunidade anual de formação continuada para professores que desejam "
                "estruturar a sala de aula com intencionalidade, clareza pedagógica e fundamentação científica. "
                "Ao longo de 12 meses, os membros têm acesso a módulos, biblioteca de aulas, encontros ao vivo e "
                "materiais aplicáveis sobre rotinas eficazes, reforço positivo, manejo de comportamento, engajamento "
                "acadêmico, clareza instrucional e organização da prática docente."
            ),
            copy_integral_origem="hotmart_page_snippet",
        ),
        make_row(
            plataforma="ProfessorIdeal",
            tipo_fonte="cursos",
            titulo="Curso Online sobre Indisciplina Escolar para professores",
            autor_marca="Professor Ideal",
            preco_principal="R$ 45,90",
            moeda="BRL",
            publico_alvo="professores",
            url_pagina_vendas="https://www.professorideal.com/curso-online/",
            copy_resumo="Curso online para aprender estratégias e atividades transformadoras para prevenir e trabalhar a indisciplina escolar.",
            fonte_1="https://www.professorideal.com/curso-online/",
            observacoes="Copy de transformação direta e promessa de semestre menos estressante.",
            copy_integral_publica=(
                "Curso online para você aprender estratégias e atividades transformadoras para prevenir e trabalhar "
                "indisciplina escolar. A promessa é deixar o semestre menos estressante e mais produtivo, com alunos "
                "mais comportados, respeitosos, motivados e participativos."
            ),
            copy_integral_origem="professorideal_page_snippet",
        ),
        make_row(
            plataforma="Educamundo",
            tipo_fonte="cursos",
            titulo="Curso Online Disciplina e Indisciplina Escolar",
            autor_marca="Educamundo",
            preco_principal="R$ 79,90",
            moeda="BRL",
            publico_alvo="profissionais do ensino e educadores em geral",
            url_pagina_vendas="https://educamundo.com.br/cursos-online/disciplina-e-indisciplina-escolar/",
            copy_resumo="Curso com conteúdo diversificado sobre disciplina e indisciplina, com foco em professor, família e direção.",
            qtd_visualizacoes_pagina_publica="2117",
            paginas_ou_duracao="5h a 420h",
            fonte_1="https://educamundo.com.br/cursos-online/disciplina-e-indisciplina-escolar/",
            observacoes="Preço público e volume visível de alunos; bom comparativo de entrada de mercado.",
            copy_integral_publica=(
                "Curso online Disciplina e Indisciplina Escolar com 2117 alunos e acesso anual a mais de 1.500 cursos "
                "por R$79,90. O conteúdo trata o papel do professor, da família e da direção na prevenção e combate "
                "à indisciplina em sala de aula e na escola, com material em vídeos, PDFs e atividades práticas."
            ),
            copy_integral_origem="educamundo_page_blocks",
        ),
        make_row(
            plataforma="Nova Escola",
            tipo_fonte="cursos",
            titulo="Gestão de sala de aula para o Ensino Fundamental 2",
            autor_marca="Nova Escola",
            preco_principal="100% Grátis",
            moeda="BRL",
            publico_alvo="professores dos anos finais do Ensino Fundamental, em início de carreira e estudante de licenciatura",
            url_pagina_vendas="https://cursos.novaescola.org.br/curso/11353/gestao-de-sala-de-aula-para-o-ensino-fundamental-2/resumo",
            copy_resumo="Curso gratuito com certificado sobre gestão de sala, organização do espaço, tempo didático, autoavaliação e escuta.",
            qtd_visualizacoes_pagina_publica="33148",
            paginas_ou_duracao="60 horas",
            fonte_1="https://cursos.novaescola.org.br/curso/11353/gestao-de-sala-de-aula-para-o-ensino-fundamental-2/resumo",
            observacoes="Lead magnet forte e muito aderente ao recorte professor iniciante.",
            copy_integral_publica=(
                "Curso gratuito, com certificado e alinhado à BNCC. Trabalha as dimensões da gestão de sala de aula, "
                "como organização do espaço físico, do tempo didático e das posturas dos alunos e professores. "
                "É voltado para professores dos anos finais em início de carreira e estudantes de licenciatura."
            ),
            copy_integral_origem="novaescola_page_snippet",
        ),
        make_row(
            plataforma="Nova Escola",
            tipo_fonte="cursos",
            titulo="Gestão de Sala de Aula",
            autor_marca="Nova Escola",
            preco_principal="100% Grátis",
            moeda="BRL",
            publico_alvo="professores",
            url_pagina_vendas="https://cursos.novaescola.org.br/trilha/25/gestao-de-sala-de-aula/resumo",
            copy_resumo="Trilha gratuita sobre gestão de sala de aula, com organização, contrato didático, democracia, planejamento e avaliação.",
            qtd_visualizacoes_pagina_publica="6863",
            paginas_ou_duracao="3 cursos / 120 dias",
            fonte_1="https://cursos.novaescola.org.br/trilha/25/gestao-de-sala-de-aula/resumo",
            observacoes="Combo de trilha; útil para observar empacotamento de conteúdo gratuito.",
            copy_integral_publica=(
                "Trilha gratuita de Gestão de Sala de Aula com certificado e alinhamento à BNCC. O conteúdo aborda "
                "gestão da sala, organização, contrato didático, democracia, participação, escuta, planejamento, "
                "avaliação e ferramentas para iniciar bem a jornada docente."
            ),
            copy_integral_origem="novaescola_page_snippet",
        ),
        make_row(
            plataforma="Hotmart",
            tipo_fonte="cursos",
            titulo="Como trabalhar indisciplina escolar",
            autor_marca="Túria Costa Lopes",
            publico_alvo="professores",
            url_pagina_vendas="https://hotmart.com/pt-br/marketplace/produtos/como-trabalhar-indisciplina-escolar/H5972348T",
            copy_resumo="Curso com atividades e estratégias para manter alunos atentos, interessados, disciplinados e aprendendo mais.",
            qtd_avaliacoes="11",
            avaliacao_media="4.5",
            fonte_1="https://hotmart.com/pt-br/marketplace/produtos/como-trabalhar-indisciplina-escolar/H5972348T",
            observacoes="Mantido, mas agora classificado como curso para não misturar com eBook.",
            copy_integral_publica=(
                "Um curso online para professores que queiram aprender atividades e estratégias para manter os alunos "
                "atentos, interessados, disciplinados e aprendendo mais. O produto traz bônus como palestra, ebook "
                "sobre tipos de feedback e documentos prontos para acordo de comportamento e registro das técnicas."
            ),
            copy_integral_origem="hotmart_visible_paragraphs",
        ),
        make_row(
            plataforma="Hotmart",
            tipo_fonte="cursos",
            titulo="Sistema Zerando a Indisciplina",
            autor_marca="Maria Caroline de Jesus Moreira",
            publico_alvo="professores do Ensino Fundamental",
            url_pagina_vendas="https://hotmart.com/pt-br/marketplace/produtos/sistema-zerando-a-indisciplina/K100050468D",
            copy_resumo="Formação prática para assumir o controle da sala com um sistema simples e direto baseado em estratégias comprovadas.",
            fonte_1="https://hotmart.com/pt-br/marketplace/produtos/sistema-zerando-a-indisciplina/K100050468D",
            observacoes="Já era uma frente de curso; foi normalizada para `cursos`.",
            copy_integral_publica=(
                "A formação definitiva para você assumir o controle da sua sala. O curso ensina um sistema simples, "
                "direto e comprovado, baseado em evidências científicas e adaptado à realidade brasileira, com os "
                "três pilares da gestão de sala de aula eficaz, regras, consequências e procedimentos para prevenir "
                "a indisciplina."
            ),
            copy_integral_origem="hotmart_visible_paragraphs",
        ),
        make_row(
            plataforma="Hotmart",
            tipo_fonte="ebook",
            titulo="Professor Iniciante: O Guia de Sobrevivência para os Primeiros 90 Dias",
            autor_marca="nao exibido",
            publico_alvo="professores iniciantes",
            url_pagina_vendas="https://hotmart.com/pt-br/marketplace/produtos/professor-iniciante-o-guia-de-sobrevivencia-para-os-primeiros-90-dias/U103622459I",
            copy_resumo="Material sobre o início da carreira docente, organização, gestão possível de sala de aula e menos culpa.",
            fonte_1="https://hotmart.com/pt-br/marketplace/produtos/professor-iniciante-o-guia-de-sobrevivencia-para-os-primeiros-90-dias/U103622459I",
            observacoes="Titulo altamente aderente ao recorte de professores iniciantes.",
            copy_integral_publica=(
                "Começar a dar aula não é fácil e ninguém te prepara de verdade para os primeiros dias. O material traz "
                "o que realmente importa no início da carreira, como se organizar sem surtar, gestão de sala de aula "
                "possível sem gritar, erros comuns que drenam energia e mais clareza com menos culpa."
            ),
            copy_integral_origem="hotmart_page_snippet",
        ),
        make_row(
            plataforma="Hotmart",
            tipo_fonte="ebook",
            titulo="Sala de Aula Viva: Soluções Práticas para Professores Reais",
            autor_marca="nao exibido",
            publico_alvo="professores",
            url_pagina_vendas="https://hotmart.com/pt-br/marketplace/produtos/sala-de-aula-viva-solucoes-praticas-para-professores-reais/M103852703O",
            copy_resumo="Guia honesto e humano para professores reais, com estratégias práticas, exemplos e propostas aplicáveis.",
            fonte_1="https://hotmart.com/pt-br/marketplace/produtos/sala-de-aula-viva-solucoes-praticas-para-professores-reais/M103852703O",
            observacoes="Título e promessa bem próximos do posicionamento que você quer testar.",
            copy_integral_publica=(
                "Um guia honesto, possível e humano para quem vive a sala de aula de verdade. O eBook não foi criado "
                "para professores ideais, e sim para professores reais, com turmas cheias, pouco tempo para planejar "
                "e muita cobrança no dia a dia, trazendo estratégias aplicáveis imediatamente."
            ),
            copy_integral_origem="hotmart_page_snippet",
        ),
    ]

    # Preserve order while preventing duplicates.
    appended = 0
    for new_row in additions:
        key = (new_row["plataforma"].strip().lower(), new_row["titulo"].strip().lower())
        if key in existing_titles:
            continue
        new_row["copy_integral_arquivo"] = write_raw_copy(new_row)
        rows.append(new_row)
        existing_titles.add(key)
        appended += 1

    # Make sure every row has the type label normalized.
    for row in rows:
        if (row.get("tipo_fonte") or "").strip().lower() == "curso":
            row["tipo_fonte"] = "cursos"

    # Ensure the field list includes every needed column.
    for extra in [
        "copy_integral_publica",
        "copy_integral_origem",
        "copy_integral_arquivo",
    ]:
        if extra not in fieldnames:
            fieldnames.append(extra)

    for out_csv in OUTPUT_CSVS:
        write_csv(out_csv, rows, fieldnames)

    manifest = BASE_DIR / "Content/base_de_dados/ebooks_gestao_sala/raw/sales_pages/2026-04-08_manifest.md"
    manifest.parent.mkdir(parents=True, exist_ok=True)
    manifest.write_text(
        "# 2026-04-08 sales fronts update\n\n"
        f"- Updated rows written: {len(rows)}\n"
        f"- New rows appended: {appended}\n"
        "- Course label normalized from `curso` to `cursos`.\n"
        "- Raw page notes saved in `raw/sales_pages/`.\n\n"
        "## New and reclassified fronts\n\n"
        "- Hotmart: Gestão de Sala de Aula (Kanttum Tecnologia)\n"
        "- Hotmart: Gestão de sala de aula (Renata Kelly da Silva)\n"
        "- Hotmart: Gestão de sala de aula: Técnicas e estratégias de gestão saudável de sala de aula - 20 horas\n"
        "- Hotmart: Domine a Disciplina em Sala de Aula\n"
        "- Hotmart: INTELIGÊNCIA EMOCIONAL NA GESTÃO DE SALA DE AULA O afeto vira estratégia para educar\n"
        "- Hotmart: Comunidade Sala dos Professores\n"
        "- ProfessorIdeal: Curso Online sobre Indisciplina Escolar para professores\n"
        "- Educamundo: Curso Online Disciplina e Indisciplina Escolar\n"
        "- Nova Escola: Gestão de sala de aula para o Ensino Fundamental 2\n"
        "- Nova Escola: Gestão de Sala de Aula\n"
        "- Hotmart: Como trabalhar indisciplina escolar (reclassificado)\n"
        "- Hotmart: Sistema Zerando a Indisciplina (reclassificado)\n"
        "- Hotmart ebook: Professor Iniciante: O Guia de Sobrevivência para os Primeiros 90 Dias\n"
        "- Hotmart ebook: Sala de Aula Viva: Soluções Práticas para Professores Reais\n",
        encoding="utf-8",
    )
    print(f"input: {input_csv}")
    print(f"rows: {len(rows)}")
    print(f"appended: {appended}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
