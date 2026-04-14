import argparse
import csv
import os
import zipfile
from collections import defaultdict
from pathlib import Path
from xml.sax.saxutils import escape


BASE_DIR = Path("/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Prof. Rafael")
DRIVE_BASE_DIR = Path(
    "/Users/rafaelrodriguesdasilva/Library/CloudStorage/GoogleDrive-rafaelsilva.pr@gmail.com/Meu Drive/Empreendedor/Professor Rafael/Prof. Rafael"
)


TERM_MAP = {
    "indisciplina": {
        "search_intent": "buscar formas de lidar com comportamento, conflitos e falta de respeito em sala",
        "pain": "recuperar controle da turma e reduzir desgaste emocional do professor",
        "confidence": "high",
    },
    "gestao de sala de aula": {
        "search_intent": "organizar rotina, procedimentos e conduzir a turma com previsibilidade",
        "pain": "dar fluidez ao dia a dia e evitar improviso constante",
        "confidence": "high",
    },
    "disciplina escolar": {
        "search_intent": "estabelecer regras, limites e convivencia",
        "pain": "reduzir conflitos por meio de normas claras e consistentes",
        "confidence": "medium",
    },
    "controle de sala de aula": {
        "search_intent": "retomar controle imediato e ordem na turma",
        "pain": "recuperar autoridade pratica quando a turma perde o foco",
        "confidence": "medium",
    },
    "manejo de classe": {
        "search_intent": "buscar classroom management e manejo pedagogico da turma",
        "pain": "traduzir um conceito mais tecnico para a pratica docente",
        "confidence": "low",
    },
}


def col_letter(n: int) -> str:
    result = ""
    while n:
        n, rem = divmod(n - 1, 26)
        result = chr(65 + rem) + result
    return result


def cell_ref(col: int, row: int) -> str:
    return f"{col_letter(col)}{row}"


def make_sheet_xml(rows: list[list[str]]) -> str:
    lines = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"',
        ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
        "<sheetData>",
    ]
    for r_idx, row in enumerate(rows, start=1):
        lines.append(f'<row r="{r_idx}">')
        for c_idx, value in enumerate(row, start=1):
            text = escape("" if value is None else str(value))
            lines.append(
                f'<c r="{cell_ref(c_idx, r_idx)}" t="inlineStr"><is><t xml:space="preserve">{text}</t></is></c>'
            )
        lines.append("</row>")
    lines.append("</sheetData>")
    lines.append("</worksheet>")
    return "".join(lines)


def build_xlsx(rows: list[list[str]], xlsx_path: Path) -> None:
    content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>
"""
    root_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>
"""
    workbook = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Trends" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>
"""
    workbook_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>
"""
    styles = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1"><font><sz val="11"/><color theme="1"/><name val="Calibri"/><family val="2"/></font></fonts>
  <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
</styleSheet>
"""
    xlsx_path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(xlsx_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", content_types)
        zf.writestr("_rels/.rels", root_rels)
        zf.writestr("xl/workbook.xml", workbook)
        zf.writestr("xl/_rels/workbook.xml.rels", workbook_rels)
        zf.writestr("xl/styles.xml", styles)
        zf.writestr("xl/worksheets/sheet1.xml", make_sheet_xml(rows))


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def write_csv(path: Path, rows: list[dict], fieldnames: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def pain_for_term(term: str) -> dict[str, str]:
    key = term.strip().lower().replace("gestão", "gestao")
    return TERM_MAP.get(
        key,
        {
            "search_intent": "entender a demanda de busca associada ao tema",
            "pain": "identificar a dor principal do comprador potencial",
            "confidence": "low",
        },
    )


def summarize_file(path: Path) -> tuple[list[dict], dict]:
    with path.open(newline="", encoding="utf-8-sig", errors="replace") as f:
        rows = list(csv.reader(f))
    if not rows:
        raise ValueError(f"Arquivo vazio: {path}")
    header = rows[0][1:]
    data = rows[1:]
    dates = [row[0] for row in data]
    term_series = {term: [int(row[i + 1]) for row in data] for i, term in enumerate(header)}
    file_rows = []
    peaks = []
    for rank, term in enumerate(
        sorted(header, key=lambda t: (max(term_series[t]), sum(1 for v in term_series[t] if v != 0)), reverse=True),
        start=1,
    ):
        nums = term_series[term]
        max_interest = max(nums)
        peak_index = nums.index(max_interest)
        first_nonzero = next((dates[i] for i, v in enumerate(nums) if v != 0), "")
        nonzero_months = sum(1 for v in nums if v != 0)
        last_value = nums[-1]
        pain = pain_for_term(term)
        row = {
            "dataset_id": "google_trends_gestao_sala_2026-04-08",
            "source_file_id": path.stem,
            "source_file_name": path.name,
            "time_start": dates[0],
            "time_end": dates[-1],
            "term": term,
            "max_interest": str(max_interest),
            "peak_date": dates[peak_index],
            "first_nonzero_date": first_nonzero or "nao publico",
            "nonzero_months": str(nonzero_months),
            "last_value": str(last_value),
            "relative_rank_in_export": str(rank),
            "search_intent": pain["search_intent"],
            "pain_inferida": pain["pain"],
            "confidence": pain["confidence"],
            "notes": "Google Trends e normalizado por exportacao; comparacao entre arquivos deve ser qualitativa.",
        }
        file_rows.append(row)
        peaks.append((term, max_interest, dates[peak_index]))
    file_meta = {
        "source_file_id": path.stem,
        "source_file_name": path.name,
        "time_start": dates[0],
        "time_end": dates[-1],
        "n_rows": len(data),
        "n_terms": len(header),
        "dominant_term": max(peaks, key=lambda x: x[1])[0] if peaks else "",
        "dominant_peak": max(peaks, key=lambda x: x[1])[1] if peaks else 0,
        "dominant_peak_date": max(peaks, key=lambda x: x[1])[2] if peaks else "",
    }
    return file_rows, file_meta


def render_manifest(file_meta_rows: list[dict], summary_rows: list[dict], dataset_date: str) -> str:
    def to_int(value: str) -> int:
        try:
            return int(value)
        except Exception:
            return 0

    lines = [
        "# Google Trends - Gestao de Sala de Aula",
        "",
        f"Dataset date: {dataset_date}",
        "",
        "## Metodo",
        "- Os CSVs foram registrados como evidencias brutas de demanda.",
        "- As pontuacoes do Google Trends sao normalizadas por exportacao, entao os arquivos nao devem ser comparados em valor absoluto entre si.",
        "- A leitura segura e qualitativa: quais termos aparecem, quao duradouros sao e que dor sugerem.",
        "",
        "## Arquivos brutos",
    ]
    for meta in file_meta_rows:
        lines.append(
            f"- {meta['source_file_name']} | {meta['time_start']} -> {meta['time_end']} | "
            f"{meta['n_rows']} linhas | termo dominante: {meta['dominant_term']} ({meta['dominant_peak']})"
        )
    lines.extend(
        [
            "",
            "## Leitura de demanda",
            "- indisciplina e a dor mais forte e mais duradoura; aponta para perda de controle, conflito e desgaste emocional.",
            "- gestao de sala de aula aparece como linguagem complementar de rotina, procedimento e previsibilidade.",
            "- disciplina escolar confirma a busca por limite e convivencia, mas com menor tracao que indisciplina.",
            "- controle de sala de aula sinaliza desejo de recuperar autoridade pratica rapidamente.",
            "- manejo de classe funciona como linguagem mais tecnica e sugere um subconjunto mais academico do mercado.",
            "",
            "## Implicacao para o produto",
            "- O melhor posicionamento mistura dor concreta com mecanismo pratico: rotina, regras, scripts, procedimentos e autoridade afetiva.",
            "- Titulo muito tecnico tende a perder descoberta; titulo muito abstrato tende a perder aderencia.",
            "- Para a copy, vale priorizar professor iniciante como secundario, nao como eixo unico.",
            "",
            "## Resumo rapido por termo",
        ]
    )
    by_term = defaultdict(list)
    for row in summary_rows:
        by_term[row["term"]].append(row)
    for term, rows in by_term.items():
        positive_rows = [r for r in rows if to_int(r["max_interest"]) > 0]
        file_count = len({r["source_file_id"] for r in positive_rows})
        max_peak = max((to_int(r["max_interest"]) for r in positive_rows), default=0)
        min_months = min((to_int(r["nonzero_months"]) for r in positive_rows), default=0)
        max_months = max((to_int(r["nonzero_months"]) for r in positive_rows), default=0)
        earliest = min(
            (r["first_nonzero_date"] for r in positive_rows if r["first_nonzero_date"] != "nao publico"),
            default="nao publico",
        )
        lines.append(
            f"- {term}: aparece em {file_count} de {len(file_meta_rows)} arquivos, pico max {max_peak}, "
            f"meses ativos entre {min_months} e {max_months}, primeira aparicao {earliest}, "
            f"dor principal: {positive_rows[0]['pain_inferida'] if positive_rows else 'nao mapeada'}."
        )
    lines.append("")
    return "\n".join(lines)


def render_raw_readme(dataset_date: str) -> str:
    return "\n".join(
        [
            "# Google Trends - Gestao de Sala de Aula",
            "",
            "Pasta com os CSVs brutos coletados de Google Trends para apoiar a leitura de demanda do comprador potencial.",
            "",
            "## Regra de leitura",
            "- Os valores sao normalizados por exportacao, entao o uso correto e qualitativo, nao absoluto.",
            "- A melhor leitura e observar quais termos aparecem, com que duracao e qual dor eles sugerem.",
            "",
            f"## Dataset {dataset_date}",
            "- Consulte o manifesto da pasta e o resumo em output/spreadsheet para a leitura consolidada.",
        ]
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", required=True)
    parser.add_argument("--dataset-date", default="2026-04-08")
    args = parser.parse_args()

    source_dir = Path(args.source_dir)
    if not source_dir.exists():
        raise FileNotFoundError(f"Source dir not found: {source_dir}")

    local_raw_dir = BASE_DIR / "Content/base_de_dados/ebooks_gestao_sala/raw/google_trends" / args.dataset_date
    drive_raw_dir = DRIVE_BASE_DIR / "Content/base_de_dados/ebooks_gestao_sala/raw/google_trends" / args.dataset_date
    local_sheet_dir = BASE_DIR / "output/spreadsheet"
    drive_sheet_dir = DRIVE_BASE_DIR / "output/spreadsheet"

    all_summary_rows: list[dict] = []
    file_meta_rows: list[dict] = []

    csv_files = sorted([p for p in source_dir.iterdir() if p.is_file()])
    if not csv_files:
        raise FileNotFoundError(f"No CSV files found in {source_dir}")

    for src in csv_files:
        summary_rows, meta = summarize_file(src)
        all_summary_rows.extend(summary_rows)
        file_meta_rows.append(meta)

        short_id = src.stem.split("-")[0]
        for base_dir in (local_raw_dir, drive_raw_dir):
            base_dir.mkdir(parents=True, exist_ok=True)
            target = base_dir / f"google_trends_{short_id}.csv"
            target.write_bytes(src.read_bytes())

    fieldnames = [
        "dataset_id",
        "source_file_id",
        "source_file_name",
        "time_start",
        "time_end",
        "term",
        "max_interest",
        "peak_date",
        "first_nonzero_date",
        "nonzero_months",
        "last_value",
        "relative_rank_in_export",
        "search_intent",
        "pain_inferida",
        "confidence",
        "notes",
    ]
    rows_for_sheet = [fieldnames] + [[row[col] for col in fieldnames] for row in all_summary_rows]

    manifest_text = render_manifest(file_meta_rows, all_summary_rows, args.dataset_date)
    raw_readme_text = render_raw_readme(args.dataset_date)

    summary_csv_name = f"mapa_mercado_ebooks_gestao_sala_google_trends_{args.dataset_date}.csv"
    summary_xlsx_name = f"mapa_mercado_ebooks_gestao_sala_google_trends_{args.dataset_date}.xlsx"
    manifest_name = f"{args.dataset_date}_manifest.md"

    for sheet_dir in (local_sheet_dir, drive_sheet_dir):
        sheet_dir.mkdir(parents=True, exist_ok=True)
        write_csv(sheet_dir / summary_csv_name, all_summary_rows, fieldnames)
        build_xlsx(rows_for_sheet, sheet_dir / summary_xlsx_name)

    for base_dir in (local_raw_dir, drive_raw_dir):
        write_text(base_dir / "README.md", raw_readme_text)
        write_text(base_dir.parent / manifest_name, manifest_text)

    print(f"wrote {len(csv_files)} raw files and {len(all_summary_rows)} summary rows")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
