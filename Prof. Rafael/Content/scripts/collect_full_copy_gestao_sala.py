import csv
import json
import re
import time
from html import unescape
from pathlib import Path
from urllib.error import HTTPError, URLError

import requests


BASE_DIR = Path("/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Prof. Rafael")
DRIVE_BASE_DIR = Path("/Users/rafaelrodriguesdasilva/Library/CloudStorage/GoogleDrive-rafaelsilva.pr@gmail.com/Meu Drive/Empreendedor/Professor Rafael/Prof. Rafael")

INPUT_CSVS = [
    DRIVE_BASE_DIR / "output/spreadsheet/mapa_mercado_ebooks_gestao_sala_seed_2026-04-08.csv",
    BASE_DIR / "output/spreadsheet/mapa_mercado_ebooks_gestao_sala_seed_2026-04-08.csv",
]
OUTPUT_CSVS = [
    DRIVE_BASE_DIR / "output/spreadsheet/mapa_mercado_ebooks_gestao_sala_seed_2026-04-08_fullcopy.csv",
    BASE_DIR / "output/spreadsheet/mapa_mercado_ebooks_gestao_sala_seed_2026-04-08_fullcopy.csv",
]
OUTPUT_XLSXS = [
    DRIVE_BASE_DIR / "output/spreadsheet/mapa_mercado_ebooks_gestao_sala_seed_2026-04-08_fullcopy.xlsx",
    BASE_DIR / "output/spreadsheet/mapa_mercado_ebooks_gestao_sala_seed_2026-04-08_fullcopy.xlsx",
]
RAW_DIRS = [
    DRIVE_BASE_DIR / "Content/base_de_dados/ebooks_gestao_sala/raw/copy_texts",
    BASE_DIR / "Content/base_de_dados/ebooks_gestao_sala/raw/copy_texts",
]

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36"


def pick_input_csv() -> Path:
    for path in INPUT_CSVS:
        if path.exists():
            return path
    raise FileNotFoundError("Nenhuma CSV de entrada encontrada")


def slugify(text: str) -> str:
    text = unescape(text).lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return re.sub(r"-+", "-", text).strip("-")[:90] or "item"


def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", unescape(text))
    return text.strip()


def strip_tags(html: str) -> str:
    html = re.sub(r"<br\s*/?>", "\n", html, flags=re.I)
    html = re.sub(r"<[^>]+>", " ", html)
    return clean_text(html)


def fetch_html(url: str) -> str:
    resp = requests.get(url, timeout=30, headers={"User-Agent": UA})
    resp.raise_for_status()
    return resp.text


def meta_content(html: str, names: list[tuple[str, str]]) -> str:
    for attr, value in names:
        pattern = rf'<meta[^>]+{attr}=["\']{re.escape(value)}["\'][^>]+content=["\'](.*?)["\']'
        m = re.search(pattern, html, flags=re.I | re.S)
        if m:
            return clean_text(m.group(1))
    return ""


def dedupe_lines(lines: list[str]) -> list[str]:
    out = []
    seen = set()
    for line in lines:
        line = clean_text(line)
        if not line:
            continue
        key = line.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(line)
    return out


def extract_google_books(url: str, html: str) -> tuple[str, str]:
    desc = meta_content(html, [("name", "description"), ("property", "og:description")])
    source = "google_books_meta"
    if not desc:
        m = re.search(r"[?&]id=([A-Za-z0-9_-]+)", url)
        if m:
            try:
                api = requests.get(
                    f"https://www.googleapis.com/books/v1/volumes/{m.group(1)}",
                    timeout=30,
                    headers={"User-Agent": UA},
                )
                api.raise_for_status()
                payload = api.json()
                desc = clean_text(payload.get("volumeInfo", {}).get("description", ""))
                source = "google_books_api"
            except Exception:
                pass
    return desc, source


def extract_hotmart(html: str) -> tuple[str, str]:
    meta = meta_content(html, [("property", "og:description"), ("name", "abstract"), ("name", "description")])
    chunks = []
    if meta:
        chunks.append(meta)
    paras = re.findall(r'<p[^>]*role=["\']paragraph["\'][^>]*>(.*?)</p>', html, flags=re.I | re.S)
    for p in paras:
        txt = strip_tags(p)
        if txt:
            chunks.append(txt)
    headings = re.findall(r'<h[1-6][^>]*>(.*?)</h[1-6]>', html, flags=re.I | re.S)
    for h in headings:
        txt = strip_tags(h)
        if txt and len(txt) > 20:
            chunks.append(txt)
    chunks = dedupe_lines(chunks)
    if not chunks:
        return meta, "hotmart_meta"
    return "\n\n".join(chunks), "hotmart_visible_paragraphs"


def extract_clube(html: str) -> tuple[str, str]:
    meta = meta_content(html, [("name", "description"), ("property", "og:description")])
    chunks = []
    if meta:
        chunks.append(meta)
    sections = re.findall(
        r"<h2 class='book_single_summary-title'>(.*?)</h2>\s*<div class='book_single_summary-content'>\s*<p>(.*?)</p>",
        html,
        flags=re.I | re.S,
    )
    for title, body in sections:
        title_txt = strip_tags(title)
        body_txt = strip_tags(body)
        if title_txt:
            chunks.append(title_txt)
        if body_txt:
            chunks.append(body_txt)
    if not chunks:
        return meta, "clube_meta"
    chunks = dedupe_lines(chunks)
    return "\n\n".join(chunks), "clube_summary"


def extract_eduzz(html: str) -> tuple[str, str]:
    meta = meta_content(html, [("name", "description"), ("property", "og:description")])
    chunks = []
    if meta:
        chunks.append(meta)
    headings = re.findall(r'<h[1-6][^>]*class=["\'][^"\']*elementor-heading-title[^"\']*["\'][^>]*>(.*?)</h[1-6]>', html, flags=re.I | re.S)
    for h in headings:
        txt = strip_tags(h)
        if txt:
            chunks.append(txt)
    spans = re.findall(r'<span class=["\']elementor-icon-list-text["\']>(.*?)</span>', html, flags=re.I | re.S)
    for s in spans:
        txt = strip_tags(s)
        if txt:
            chunks.append(txt)
    paras = re.findall(r'<p>(.*?)</p>', html, flags=re.I | re.S)
    for p in paras:
        txt = strip_tags(p)
        if len(txt) > 40:
            chunks.append(txt)
    chunks = dedupe_lines(chunks)
    if not chunks:
        return meta, "eduzz_meta"
    return "\n\n".join(chunks), "eduzz_page_blocks"


def extract_kiwify(html: str) -> tuple[str, str]:
    meta = meta_content(html, [("name", "description"), ("property", "og:description")])
    chunks = []
    if meta:
        chunks.append(meta)
    headings = re.findall(r'<h[1-6][^>]*class=["\'][^"\']*elementor-heading-title[^"\']*["\'][^>]*>(.*?)</h[1-6]>', html, flags=re.I | re.S)
    for h in headings:
        txt = strip_tags(h)
        if txt:
            chunks.append(txt)
    spans = re.findall(r'<span class=["\']elementor-icon-list-text["\']>(.*?)</span>', html, flags=re.I | re.S)
    for s in spans:
        txt = strip_tags(s)
        if txt:
            chunks.append(txt)
    text_editor_blocks = re.findall(r'<div[^>]*class=["\'][^"\']*elementor-widget-text-editor[^"\']*["\'][^>]*>(.*?)</div>\s*</div>', html, flags=re.I | re.S)
    for block in text_editor_blocks:
        ps = re.findall(r'<p[^>]*>(.*?)</p>', block, flags=re.I | re.S)
        for p in ps:
            txt = strip_tags(p)
            if len(txt) > 20:
                chunks.append(txt)
    paras = re.findall(r'<p[^>]*>(.*?)</p>', html, flags=re.I | re.S)
    for p in paras:
        txt = strip_tags(p)
        if len(txt) > 60:
            chunks.append(txt)
    chunks = dedupe_lines(chunks)
    if not chunks:
        return meta, "kiwify_meta"
    return "\n\n".join(chunks), "kiwify_page_blocks"


def extract_copy(row: dict) -> tuple[str, str]:
    url = row["url_pagina_vendas"].strip()
    platform = row["plataforma"].strip()
    html = fetch_html(url)
    if platform == "Google Books":
        return extract_google_books(url, html)
    if platform == "Hotmart":
        return extract_hotmart(html)
    if platform == "Clube de Autores":
        return extract_clube(html)
    if platform == "Eduzz":
        return extract_eduzz(html)
    if platform == "Kiwify":
        return extract_kiwify(html)
    meta = meta_content(html, [("name", "description"), ("property", "og:description")])
    return meta, "meta"


def save_raw_copy(out_dirs: list[Path], row: dict, text: str, source: str) -> str:
    if not text:
        return ""
    slug = slugify(f"{row['plataforma']}-{row['titulo']}")
    rel = Path("Content/base_de_dados/ebooks_gestao_sala/raw/copy_texts") / f"{slug}.md"
    payload = f"# {row['titulo']}\n\nSource: {source}\n\n{text}\n"
    for base in out_dirs:
        path = base / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(payload, encoding="utf-8")
    return str(rel)


def write_csv(path: Path, rows: list[dict], fieldnames: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def col_letter(n: int) -> str:
    out = ""
    while n:
        n, rem = divmod(n - 1, 26)
        out = chr(65 + rem) + out
    return out


def make_xlsx(rows: list[list[str]], xlsx_path: Path) -> None:
    from xml.sax.saxutils import escape
    import zipfile

    def cell_ref(col: int, row: int) -> str:
        return f"{col_letter(col)}{row}"

    sheet = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
        "<sheetData>",
    ]
    for r_idx, row in enumerate(rows, start=1):
        sheet.append(f'<row r="{r_idx}">')
        for c_idx, value in enumerate(row, start=1):
            txt = escape("" if value is None else str(value))
            sheet.append(f'<c r="{cell_ref(c_idx, r_idx)}" t="inlineStr"><is><t xml:space="preserve">{txt}</t></is></c>')
        sheet.append("</row>")
    sheet.append("</sheetData></worksheet>")
    sheet_xml = "".join(sheet)

    styles = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1"><font><sz val="11"/><color theme="1"/><name val="Calibri"/><family val="2"/></font></fonts>
  <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
</styleSheet>
"""
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
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Mercado" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>
"""
    workbook_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>
"""
    xlsx_path.parent.mkdir(parents=True, exist_ok=True)
    import zipfile
    with zipfile.ZipFile(xlsx_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", content_types)
        zf.writestr("_rels/.rels", root_rels)
        zf.writestr("xl/workbook.xml", workbook)
        zf.writestr("xl/_rels/workbook.xml.rels", workbook_rels)
        zf.writestr("xl/styles.xml", styles)
        zf.writestr("xl/worksheets/sheet1.xml", sheet_xml)


def main() -> int:
    input_csv = pick_input_csv()
    with open(input_csv, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    for row in rows:
        try:
            full_copy, source = extract_copy(row)
        except (HTTPError, URLError, requests.RequestException, TimeoutError, Exception) as exc:
            full_copy = ""
            source = f"error:{type(exc).__name__}"
        row["copy_integral_publica"] = full_copy
        row["copy_integral_origem"] = source
        row["copy_integral_arquivo"] = save_raw_copy(RAW_DIRS, row, full_copy, source) if full_copy else ""
        time.sleep(0.6)

    fieldnames = list(rows[0].keys())
    for extra in ["copy_integral_publica", "copy_integral_origem", "copy_integral_arquivo"]:
        if extra not in fieldnames:
            fieldnames.append(extra)

    for out_csv in OUTPUT_CSVS:
        write_csv(out_csv, rows, fieldnames)

    xlsx_rows = [fieldnames] + [[row.get(h, "") for h in fieldnames] for row in rows]
    for out_xlsx in OUTPUT_XLSXS:
        make_xlsx(xlsx_rows, out_xlsx)

    print(f"input: {input_csv}")
    print(f"rows: {len(rows)}")
    print(f"columns: {len(fieldnames)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
