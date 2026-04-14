import csv
import json
import time
import re
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


BASE_DIR = Path("/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Prof. Rafael")
MANIFEST_PATH = BASE_DIR / "Content/base_de_dados/ebooks_gestao_sala/assets/capa_manifest_clean_2026-04-08.csv"
CAPA_DIR = BASE_DIR / "Content/base_de_dados/ebooks_gestao_sala/assets/capas"

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36"


def request_json(url: str, attempts: int = 5) -> dict:
    last_exc = None
    for attempt in range(attempts):
        try:
            req = Request(url, headers={"User-Agent": UA})
            with urlopen(req, timeout=20) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except HTTPError as exc:
            last_exc = exc
            if exc.code == 429:
                time.sleep(2 + attempt * 2)
                continue
            raise
        except URLError as exc:
            last_exc = exc
            time.sleep(1 + attempt)
    raise last_exc


def request_bytes(url: str, attempts: int = 5) -> tuple[bytes, str]:
    last_exc = None
    for attempt in range(attempts):
        try:
            req = Request(url, headers={"User-Agent": UA})
            with urlopen(req, timeout=20) as resp:
                return resp.read(), resp.headers.get("Content-Type", "")
        except HTTPError as exc:
            last_exc = exc
            if exc.code == 429:
                time.sleep(2 + attempt * 2)
                continue
            raise
        except URLError as exc:
            last_exc = exc
            time.sleep(1 + attempt)
    raise last_exc


def volume_id_from_url(source_url: str) -> str | None:
    m = re.search(r"[?&]id=([A-Za-z0-9_-]+)", source_url)
    return m.group(1) if m else None


def preferred_image_url(volume: dict) -> str | None:
    links = volume.get("volumeInfo", {}).get("imageLinks", {})
    for key in ["extraLarge", "large", "medium", "small", "thumbnail", "smallThumbnail"]:
        url = links.get(key)
        if url:
            return url.replace("http://", "https://")
    return None


def main():
    rows = []
    with open(MANIFEST_PATH, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    updates = 0
    for row in rows:
        if row["plataforma"] != "Google Books":
            continue
        if row["status"] == "downloaded":
            continue

        vol_id = volume_id_from_url(row["source_url"])
        if not vol_id:
            continue

        try:
            volume = request_json(f"https://www.googleapis.com/books/v1/volumes/{vol_id}")
            image_url = preferred_image_url(volume)
            if not image_url:
                continue
            data, content_type = request_bytes(image_url)
            ext = ".jpg"
            if "png" in content_type:
                ext = ".png"
            elif "webp" in content_type:
                ext = ".webp"
            out_name = Path(row["file_path"]).name if row["file_path"] else f"{row['row_index']}-{vol_id}{ext}"
            out_path = CAPA_DIR / out_name
            out_path.write_bytes(data)
            row["image_url"] = image_url
            row["status"] = "recovered_api"
            row["file_path"] = str(out_path.relative_to(BASE_DIR))
            row["sha1"] = __import__("hashlib").sha1(out_path.read_bytes()).hexdigest()
            updates += 1
            print(f"recovered {row['row_index']} | {row['titulo']}")
        except Exception as exc:
            print(f"failed {row['row_index']} | {row['titulo']} | {type(exc).__name__}")
        time.sleep(1.1)

    with open(MANIFEST_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["row_index","plataforma","titulo","source_url","image_url","status","file_path","sha1"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"Recovered: {updates}")


if __name__ == "__main__":
    main()
