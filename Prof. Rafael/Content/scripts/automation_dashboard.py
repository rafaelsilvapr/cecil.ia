#!/usr/bin/env python3
"""Build and maintain the mobile automation dashboard data."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

PROJECT_ROOT = Path(__file__).resolve().parents[2]
REPO_ROOT = PROJECT_ROOT.parent
DOCS_ROOT = PROJECT_ROOT / "docs"
DOCS_DATA = DOCS_ROOT / "data"
RESEARCH_ROOT = PROJECT_ROOT / "Content" / "base_de_dados" / "artigos_pesquisa"
CAROUSEL_ROOT = PROJECT_ROOT / "Content" / "Publicacoes" / "Instagram" / "Carrosseis"
LATEST_CAROUSEL = CAROUSEL_ROOT / "latest_carousel.json"
STATE_DIR = PROJECT_ROOT / "Content" / "00_direcao" / "automation_hub"
REVIEW_STATE = STATE_DIR / "review_state.json"
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}\.json$")
FRONT_MATTER_RE = re.compile(r"(?m)^([a-zA-Z0-9_]+):\s*(.*)$")


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def read_json(path: Path, default: Any | None = None) -> Any:
    if not path.exists():
        return default
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path: Path, payload: Any) -> None:
    ensure_parent(path)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def detect_repo_slug() -> str | None:
    try:
        raw = subprocess.check_output(
            ["git", "-C", str(REPO_ROOT), "remote", "get-url", "origin"],
            text=True,
        ).strip()
    except Exception:
        return None

    if raw.startswith("git@github.com:"):
        return raw.split("git@github.com:", 1)[1].removesuffix(".git")
    if raw.startswith("https://github.com/"):
        parsed = urlparse(raw)
        return parsed.path.lstrip("/").removesuffix(".git")
    return None


def load_review_state() -> dict[str, Any]:
    payload = read_json(REVIEW_STATE, default=None)
    if payload:
        payload.setdefault("updated_at", None)
        payload.setdefault("items", {})
        return payload
    return {"updated_at": None, "items": {}}


def save_review_state(payload: dict[str, Any]) -> None:
    payload["updated_at"] = now_iso()
    write_json(REVIEW_STATE, payload)


def review_key(kind: str, target_id: str) -> str:
    return f"{kind}:{target_id}"


def status_from_decision(decision: str) -> str:
    mapping = {
        "approve": "approved",
        "approved": "approved",
        "revise": "needs_revision",
        "needs_revision": "needs_revision",
        "reject": "rejected",
        "rejected": "rejected",
    }
    if decision not in mapping:
        raise ValueError(f"Unsupported decision: {decision}")
    return mapping[decision]


def latest_research_files(limit: int = 10) -> list[Path]:
    if not RESEARCH_ROOT.exists():
        return []
    files = [path for path in RESEARCH_ROOT.glob("*.json") if DATE_RE.match(path.name)]
    return sorted(files, reverse=True)[:limit]


def update_carousel_payload(path: Path, review: dict[str, Any]) -> None:
    payload = read_json(path, default=None)
    if not payload:
        raise FileNotFoundError(f"Carousel payload not found at {path}")
    payload["status"] = review["status"]
    payload["review"] = review
    write_json(path, payload)


def update_research_payload(path: Path, review: dict[str, Any]) -> None:
    payload = read_json(path, default=None)
    if not payload:
        raise FileNotFoundError(f"Research payload not found at {path}")
    payload["review"] = review
    write_json(path, payload)


def upsert_review(
    *,
    kind: str,
    target_id: str,
    decision: str,
    notes: str,
    updated_via: str,
) -> dict[str, Any]:
    review_state = load_review_state()
    key = review_key(kind, target_id)
    status = status_from_decision(decision)
    timestamp = now_iso()
    items = review_state.setdefault("items", {})
    current = items.get(key, {})
    history = current.get("history", [])
    event = {
        "decision": decision,
        "status": status,
        "notes": notes,
        "updated_at": timestamp,
        "updated_via": updated_via,
    }
    history.append(event)
    items[key] = {
        "kind": kind,
        "target_id": target_id,
        "decision": decision,
        "status": status,
        "notes": notes,
        "updated_at": timestamp,
        "updated_via": updated_via,
        "history": history[-12:],
    }
    save_review_state(review_state)
    return items[key]


def apply_decision(kind: str, target_id: str, decision: str, notes: str, updated_via: str) -> None:
    review = upsert_review(
        kind=kind,
        target_id=target_id,
        decision=decision,
        notes=notes,
        updated_via=updated_via,
    )

    if kind == "carousel":
        update_carousel_payload(LATEST_CAROUSEL, review)
        target_file = CAROUSEL_ROOT / target_id / "latest_carousel.json"
        if target_file.exists():
            update_carousel_payload(target_file, review)
    elif kind == "research":
        target_file = RESEARCH_ROOT / f"{target_id}.json"
        update_research_payload(target_file, review)
    else:
        raise ValueError(f"Unsupported kind: {kind}")

    build_dashboard()


def parse_approval_body(body: str) -> dict[str, str]:
    payload: dict[str, str] = {}
    for key, value in FRONT_MATTER_RE.findall(body):
        payload[key.strip().lower()] = value.strip()
    required = {"automation_approval", "kind", "target_id", "decision"}
    missing = required - payload.keys()
    if missing:
        raise ValueError(f"Issue body missing required fields: {', '.join(sorted(missing))}")
    if payload["automation_approval"].lower() != "true":
        raise ValueError("Issue body is not marked as an automation approval")
    payload.setdefault("notes", "")
    return payload


def build_carousel_snapshot(review_state: dict[str, Any]) -> dict[str, Any] | None:
    payload = read_json(LATEST_CAROUSEL, default=None)
    if not payload:
        return None

    target_id = str(payload.get("id") or "")
    review = review_state.get("items", {}).get(review_key("carousel", target_id))
    slides = payload.get("slides", [])
    source = payload.get("source_article", {})

    return {
        "kind": "carousel",
        "id": target_id,
        "status": (review or payload.get("review") or {}).get("status", payload.get("status", "pending_approval")),
        "decision": (review or payload.get("review") or {}).get("decision"),
        "updated_at": (review or payload.get("review") or {}).get("updated_at", payload.get("generated_at")),
        "updated_via": (review or payload.get("review") or {}).get("updated_via"),
        "notes": (review or payload.get("review") or {}).get("notes", ""),
        "question": payload.get("audience_question"),
        "thesis": payload.get("tese_central"),
        "source_article": {
            "title": source.get("title"),
            "authors": source.get("authors"),
            "year": source.get("year"),
            "country": source.get("country"),
            "method": source.get("method"),
            "results": source.get("results"),
        },
        "slides": [
            {
                "number": slide.get("number"),
                "type": slide.get("type"),
                "headline": slide.get("headline"),
                "body": slide.get("body", ""),
            }
            for slide in slides
        ],
        "folder": str((CAROUSEL_ROOT / target_id).relative_to(PROJECT_ROOT)),
        "source_file": str(LATEST_CAROUSEL.relative_to(PROJECT_ROOT)),
    }


def summarize_article(article: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": article.get("id"),
        "title": article.get("title"),
        "field": article.get("field"),
        "country": article.get("country"),
        "year": article.get("year"),
        "method": article.get("method"),
        "relevance_score": article.get("relevance_score"),
        "uses_ai": article.get("uses_ai"),
        "results": article.get("results"),
        "classroom_implication": article.get("classroom_implication"),
    }


def build_research_snapshot(review_state: dict[str, Any]) -> dict[str, Any] | None:
    research_files = latest_research_files(limit=1)
    if not research_files:
        return None

    path = research_files[0]
    payload = read_json(path, default={})
    target_id = str(payload.get("date") or path.stem)
    review = review_state.get("items", {}).get(review_key("research", target_id))
    stored_review = payload.get("review", {})

    return {
        "kind": "research",
        "id": target_id,
        "status": (review or stored_review).get("status", "pending_approval"),
        "decision": (review or stored_review).get("decision"),
        "updated_at": (review or stored_review).get("updated_at", payload.get("date")),
        "updated_via": (review or stored_review).get("updated_via"),
        "notes": (review or stored_review).get("notes", ""),
        "fields_covered": payload.get("fields_covered", []),
        "article_count": len(payload.get("articles", [])),
        "articles": [summarize_article(article) for article in payload.get("articles", [])],
        "source_file": str(path.relative_to(PROJECT_ROOT)),
    }


def build_activity(review_state: dict[str, Any]) -> list[dict[str, Any]]:
    items = review_state.get("items", {}).values()
    flattened: list[dict[str, Any]] = []
    for item in items:
        history = item.get("history", [])
        for event in history:
            flattened.append(
                {
                    "kind": item.get("kind"),
                    "target_id": item.get("target_id"),
                    "decision": event.get("decision"),
                    "status": event.get("status"),
                    "notes": event.get("notes", ""),
                    "updated_at": event.get("updated_at"),
                    "updated_via": event.get("updated_via"),
                }
            )
    return sorted(flattened, key=lambda item: item.get("updated_at") or "", reverse=True)[:20]


def build_dashboard() -> dict[str, Any]:
    review_state = load_review_state()
    repo_slug = detect_repo_slug()
    payload = {
        "generated_at": now_iso(),
        "repo": {
            "slug": repo_slug,
            "issues_new_url": f"https://github.com/{repo_slug}/issues/new" if repo_slug else None,
        },
        "carousel": build_carousel_snapshot(review_state),
        "research": build_research_snapshot(review_state),
        "activity": build_activity(review_state),
    }
    write_json(DOCS_DATA / "dashboard.json", payload)
    return payload


def command_build_dashboard(_: argparse.Namespace) -> None:
    payload = build_dashboard()
    print(f"Dashboard data written to {DOCS_DATA / 'dashboard.json'}")
    print(json.dumps(payload, ensure_ascii=False, indent=2))


def command_apply_decision(args: argparse.Namespace) -> None:
    apply_decision(
        kind=args.kind,
        target_id=args.target_id,
        decision=args.decision,
        notes=args.notes or "",
        updated_via=args.updated_via,
    )
    print(f"Applied {args.decision} to {args.kind}:{args.target_id}")


def command_apply_from_issue(args: argparse.Namespace) -> None:
    body = Path(args.body_file).read_text(encoding="utf-8")
    payload = parse_approval_body(body)
    note = payload.get("notes", "")
    via = f"github-issue#{args.issue_number}"
    if args.issue_url:
        via = f"{via} ({args.issue_url})"
    apply_decision(
        kind=payload["kind"],
        target_id=payload["target_id"],
        decision=payload["decision"],
        notes=note,
        updated_via=via,
    )
    print(f"Processed issue #{args.issue_number}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Professor Rafael automation dashboard utilities")
    subparsers = parser.add_subparsers(dest="command", required=True)

    build_cmd = subparsers.add_parser("build-dashboard", help="Generate docs/data/dashboard.json")
    build_cmd.set_defaults(func=command_build_dashboard)

    decision_cmd = subparsers.add_parser("apply-decision", help="Apply a review decision to an automation item")
    decision_cmd.add_argument("--kind", choices=["carousel", "research"], required=True)
    decision_cmd.add_argument("--target-id", required=True)
    decision_cmd.add_argument("--decision", choices=["approve", "revise", "reject"], required=True)
    decision_cmd.add_argument("--notes", default="")
    decision_cmd.add_argument("--updated-via", default="manual")
    decision_cmd.set_defaults(func=command_apply_decision)

    issue_cmd = subparsers.add_parser("apply-from-issue", help="Apply a decision using a GitHub issue body")
    issue_cmd.add_argument("--body-file", required=True)
    issue_cmd.add_argument("--issue-number", required=True)
    issue_cmd.add_argument("--issue-url", default="")
    issue_cmd.set_defaults(func=command_apply_from_issue)

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
