import csv
import hashlib
import os
import re
import sys
import time
import signal
from html import unescape
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen


BASE_DIR = Path("/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Prof. Rafael")
CSV_PATH = BASE_DIR / "output/spreadsheet/mapa_mercado_ebooks_gestao_sala_seed_2026-04-08.csv"
CAPA_DIR = BASE_DIR / "Content/base_de_dados/ebooks_gestao_sala/assets/capas"
CONTRACAPA_DIR = BASE_DIR / "Content/base_de_dados/ebooks_gestao_sala/assets/contracapas"
MANIFEST_PATH = BASE_DIR / "Content/base_de_dados/ebooks_gestao_sala/assets/capa_manifest_2026-04-08.csv"

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36"


def slugify(text: str) -> str:
    text = text.lower()
    text = unescape(text)
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return re.sub(r"-+", "-", text).strip("-")[:80] or "item"


def fetch_url(url: str, timeout: int = 20) -> bytes:
    req = Request(url, headers={"User-Agent": UA})
    with urlopen(req, timeout=timeout) as resp:
        return resp.read()


def fetch_html(url: str) -> str:
    return fetch_url(url).decode("utf-8", errors="ignore")


def extract_image_url(html: str, page_url: str) -> str | None:
    patterns = [
        r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']',
        r'<meta[^>]+name=["\']twitter:image["\'][^>]+content=["\']([^"\']+)["\']',
        r'<meta[^>]+property=["\']twitter:image["\'][^>]+content=["\']([^"\']+)["\']',
        r'<link[^>]+rel=["\']image_src["\'][^>]+href=["\']([^"\']+)["\']',
        r'"image"\s*:\s*"([^"]+)"',
    ]
    for pattern in patterns:
        m = re.search(pattern, html, flags=re.I | re.S)
        if m:
            url = m.group(1).replace("\\/", "/")
            if url.startswith("//"):
                return "https:" + url
            if url.startswith("/"):
                parsed = urlparse(page_url)
                return f"{parsed.scheme}://{parsed.netloc}{url}"
            return url
    return None


def ext_from_response(url: str, content_type: str | None, fallback: str = ".jpg") -> str:
    if content_type:
        ctype = content_type.split(";")[0].strip().lower()
        if ctype == "image/png":
            return ".png"
        if ctype == "image/webp":
            return ".webp"
        if ctype in {"image/jpeg", "image/jpg"}:
            return ".jpg"
    parsed = urlparse(url)
    suffix = Path(parsed.path).suffix.lower()
    if suffix in {".jpg", ".jpeg", ".png", ".webp"}:
        return suffix if suffix != ".jpeg" else ".jpg"
    return fallback


def download_image(image_url: str, out_path: Path) -> tuple[bool, str]:
    req = Request(image_url, headers={"User-Agent": UA})
    with urlopen(req, timeout=30) as resp:
        data = resp.read()
        content_type = resp.headers.get("Content-Type")
    out_path.write_bytes(data)
    return True, content_type or ""


class hard_timeout:
    def __init__(self, seconds: int):
        self.seconds = seconds

    def _handler(self, signum, frame):
        raise TimeoutError(f"timeout after {self.seconds}s")

    def __enter__(self):
        self.prev_handler = signal.signal(signal.SIGALRM, self._handler)
        signal.setitimer(signal.ITIMER_REAL, self.seconds)

    def __exit__(self, exc_type, exc, tb):
        signal.setitimer(signal.ITIMER_REAL, 0)
        signal.signal(signal.SIGALRM, self.prev_handler)
        return False


def read_rows():
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    return rows


def main():
    CAPA_DIR.mkdir(parents=True, exist_ok=True)
    CONTRACAPA_DIR.mkdir(parents=True, exist_ok=True)
    rows = read_rows()
    downloaded = 0
    skipped = 0
    processed = set()
    if MANIFEST_PATH.exists():
        with open(MANIFEST_PATH, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                processed.add(row.get("row_index"))
    write_header = not MANIFEST_PATH.exists()
    for idx, row in enumerate(rows, start=1):
        if str(idx) in processed:
            continue
        title = row["titulo"].strip()
        source_url = row["url_pagina_vendas"].strip()
        platform = row["plataforma"].strip()
        slug = slugify(f"{idx:03d}-{platform}-{title}")
        out_dir = CAPA_DIR
        out_path = None
        status = "not_found"
        image_url = None
        try:
            with hard_timeout(18):
                html = fetch_html(source_url)
                image_url = extract_image_url(html, source_url)
                if image_url:
                    tmp_req = Request(image_url, headers={"User-Agent": UA})
                    with urlopen(tmp_req, timeout=18) as resp:
                        data = resp.read()
                        content_type = resp.headers.get("Content-Type")
                    ext = ext_from_response(image_url, content_type)
                    out_path = out_dir / f"{slug}{ext}"
                    out_path.write_bytes(data)
                    status = "downloaded"
                    downloaded += 1
                else:
                    skipped += 1
        except (HTTPError, URLError, TimeoutError, OSError) as exc:
            status = f"error:{type(exc).__name__}"
            skipped += 1
        manifest_row = {
            "row_index": idx,
            "plataforma": platform,
            "titulo": title,
            "source_url": source_url,
            "image_url": image_url or "",
            "status": status,
            "file_path": str(out_path.relative_to(BASE_DIR)) if out_path else "",
            "sha1": hashlib.sha1(out_path.read_bytes()).hexdigest() if out_path and out_path.exists() else "",
        }
        with open(MANIFEST_PATH, "a", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["row_index","plataforma","titulo","source_url","image_url","status","file_path","sha1"])
            if write_header:
                writer.writeheader()
                write_header = False
            writer.writerow(manifest_row)
        print(f"[{idx}/{len(rows)}] {status} | {title}")
        time.sleep(0.1)

    print(f"Downloaded: {downloaded}")
    print(f"Skipped/failed: {skipped}")
    print(f"Manifest: {MANIFEST_PATH}")


if __name__ == "__main__":
    sys.exit(main())
