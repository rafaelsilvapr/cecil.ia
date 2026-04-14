from __future__ import annotations

from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
CONTENT_DIR = SCRIPT_DIR.parent
HISTORY_PATH = CONTENT_DIR / "base_de_dados" / "historico_de_analises_base_de_dados.md"


def load_history_text(path: Path = HISTORY_PATH) -> str:
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")


def extract_recent_entries(limit: int = 2, path: Path = HISTORY_PATH) -> list[str]:
    text = load_history_text(path)
    if not text:
        return []

    entries: list[list[str]] = []
    current: list[str] = []
    in_registry = False

    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith("## Registro") or stripped.startswith("## Registros"):
            in_registry = True
            continue
        if not in_registry:
            continue

        if stripped.startswith("### "):
            if current:
                entries.append(current)
                if len(entries) >= limit:
                    break
            current = [line]
        elif current:
            current.append(line)

    if current and len(entries) < limit:
        entries.append(current)

    return ["\n".join(block).strip() for block in entries if block]


def print_recent_entries(limit: int = 2) -> None:
    entries = extract_recent_entries(limit=limit)
    if not entries:
        print("🧠 Historico de analises nao encontrado. Seguindo sem contexto adicional.")
        return

    print("🧠 Historico de analises recente:")
    for idx, entry in enumerate(entries, start=1):
        print(f"\n--- Entrada {idx} ---")
        print(entry)

