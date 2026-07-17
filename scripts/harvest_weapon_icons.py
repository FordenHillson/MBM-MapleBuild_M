#!/usr/bin/env python3
"""Harvest MapleStory M weapon icons via Nexon Open API.

Nexon ranking has no class filter param. Strategy (similar to maplemhub job filter):
  1) Scan combat-power ranking pages
  2) Bucket characters by character_class
  3) Sample up to N chars per class, then pull item-equipment

Requires NEXON_API_KEY in repo-root .env (never commit).
Usage:
  python scripts/harvest_weapon_icons.py --by-class --scan-pages 20 --per-class 5
"""

from __future__ import annotations

import argparse
import json
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://open.api.nexon.com"
ICON_PREFIX = "https://open.api.nexon.com/static/maplestorym/asset/icon/"
MAIN_WEAPON_SLOT = "무기"


def load_api_key() -> str:
    env = ROOT / ".env"
    if not env.exists():
        raise SystemExit("Missing .env — copy .env.example and set NEXON_API_KEY")
    for line in env.read_text(encoding="utf-8").splitlines():
        if line.startswith("NEXON_API_KEY="):
            key = line.split("=", 1)[1].strip().strip('"').strip("'")
            if key:
                return key
    raise SystemExit("NEXON_API_KEY empty in .env")


def api_get(
    key: str,
    path: str,
    params: dict | None = None,
    *,
    retries: int = 5,
) -> dict:
    q = ("?" + urllib.parse.urlencode(params)) if params else ""
    req = urllib.request.Request(
        BASE + path + q,
        headers={"x-nxopen-api-key": key},
    )
    last_err: Exception | None = None
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=45) as res:
                return json.loads(res.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")
            last_err = RuntimeError(f"HTTP {e.code} {path}: {body[:400]}")
            if e.code == 429:
                time.sleep(2.0 * (attempt + 1))
                continue
            if e.code >= 500:
                time.sleep(1.0 * (attempt + 1))
                continue
            raise last_err from None
        except Exception as e:  # noqa: BLE001
            last_err = e
            time.sleep(1.0 * (attempt + 1))
    raise RuntimeError(str(last_err))


def ranking_date(key: str) -> str:
    kst = timezone(timedelta(hours=9))
    today = datetime.now(kst).date()
    last_err: Exception | None = None
    for i in range(0, 14):
        d = (today - timedelta(days=i)).isoformat()
        try:
            api_get(key, "/maplestorym/v1/ranking/combat-power", {"date": d, "page": 1})
            return d
        except Exception as e:  # noqa: BLE001
            last_err = e
            continue
    raise SystemExit(f"No ranking date ready: {last_err}")


def normalize_icon(icon: str | None) -> str | None:
    if not icon:
        return None
    icon = icon.strip()
    if icon.startswith("http://") or icon.startswith("https://"):
        return icon
    if len(icon) > 40 and "/" not in icon:
        return ICON_PREFIX + icon
    return icon


def is_main_weapon(item: dict) -> bool:
    return str(item.get("item_equipment_slot_name") or "").strip() == MAIN_WEAPON_SLOT


def load_existing(path: Path) -> dict[str, dict]:
    if not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    out: dict[str, dict] = {}
    for w in data.get("weapons") or []:
        name = w.get("itemName")
        if name:
            out[name] = w
    return out


def collect_by_class(
    key: str,
    date: str,
    *,
    scan_pages: int,
    per_class: int,
    sleep_s: float,
) -> tuple[list[dict], dict[str, int]]:
    """Return sampled ranking rows (≤ per_class each class) + counts seen."""
    buckets: dict[str, list[dict]] = defaultdict(list)
    seen: set[tuple[str, str]] = set()
    class_seen: dict[str, int] = defaultdict(int)

    for page in range(1, scan_pages + 1):
        ranking = api_get(
            key,
            "/maplestorym/v1/ranking/combat-power",
            {"date": date, "page": page},
        )
        rows = ranking.get("ranking") or []
        if not rows:
            break
        for row in rows:
            name = row.get("character_name")
            world = row.get("world_name")
            klass = row.get("character_class") or "?"
            if not name or not world:
                continue
            ident = (name, world)
            if ident in seen:
                continue
            seen.add(ident)
            class_seen[klass] += 1
            if len(buckets[klass]) < per_class:
                buckets[klass].append(row)
        time.sleep(sleep_s)
        # Early stop if every non-empty bucket is full and we have scanned enough
        if page >= 5 and all(len(v) >= per_class for v in buckets.values()) and len(buckets) > 20:
            # still keep scanning a bit — rare classes appear lower
            pass

    selected: list[dict] = []
    for klass in sorted(buckets.keys()):
        selected.extend(buckets[klass])
    return selected, dict(class_seen)


def harvest_rows(
    key: str,
    rows: list[dict],
    *,
    sleep_s: float,
    catalog: dict[str, dict],
) -> tuple[dict[str, dict], list[str], int]:
    errors: list[str] = []
    inspected = 0
    for row in rows:
        name = row.get("character_name")
        world = row.get("world_name")
        if not name or not world:
            continue
        inspected += 1
        try:
            ocid = api_get(
                key,
                "/maplestorym/v1/id",
                {"character_name": name, "world_name": world},
            )["ocid"]
            eq = api_get(
                key,
                "/maplestorym/v1/character/item-equipment",
                {"ocid": ocid},
            )
            for item in eq.get("item_equipment") or []:
                if not is_main_weapon(item):
                    continue
                item_name = item.get("item_name")
                icon = normalize_icon(item.get("item_icon"))
                if not item_name or not icon:
                    continue
                if item_name not in catalog:
                    catalog[item_name] = {
                        "itemName": item_name,
                        "iconUrl": icon,
                        "grade": item.get("item_grade"),
                        "weaponType": item.get("item_equipment_page_name"),
                        "slotName": item.get("item_equipment_slot_name"),
                        "sampleClass": row.get("character_class"),
                    }
            time.sleep(sleep_s)
        except Exception as e:  # noqa: BLE001
            errors.append(f"{name}/{world}: {e}")
            time.sleep(sleep_s)
    return catalog, errors, inspected


def harvest_flat(*, pages: int, max_chars: int, sleep_s: float, out: Path) -> dict:
    key = load_api_key()
    date = ranking_date(key)
    catalog = load_existing(out)
    seen_chars: set[tuple[str, str]] = set()
    errors: list[str] = []
    inspected = 0
    for page in range(1, pages + 1):
        ranking = api_get(
            key,
            "/maplestorym/v1/ranking/combat-power",
            {"date": date, "page": page},
        )
        for row in ranking.get("ranking") or []:
            if inspected >= max_chars:
                break
            name, world = row.get("character_name"), row.get("world_name")
            if not name or not world or (name, world) in seen_chars:
                continue
            seen_chars.add((name, world))
            catalog, batch_err, n = harvest_rows(
                key, [row], sleep_s=sleep_s, catalog=catalog
            )
            inspected += n
            errors.extend(batch_err)
        if inspected >= max_chars:
            break
    return _result(date, inspected, catalog, errors, mode="flat", extra={})


def harvest_by_class(
    *,
    scan_pages: int,
    per_class: int,
    sleep_s: float,
    out: Path,
) -> dict:
    key = load_api_key()
    date = ranking_date(key)
    print(
        json.dumps(
            {
                "phase": "scan-ranking",
                "date": date,
                "scanPages": scan_pages,
                "perClass": per_class,
            },
            ensure_ascii=False,
        ),
        flush=True,
    )
    selected, class_seen = collect_by_class(
        key,
        date,
        scan_pages=scan_pages,
        per_class=per_class,
        sleep_s=max(sleep_s, 0.08),
    )
    print(
        json.dumps(
            {
                "phase": "scan-done",
                "classesFound": len(class_seen),
                "charsSelected": len(selected),
                "classCounts": dict(sorted(class_seen.items(), key=lambda x: (-x[1], x[0]))),
            },
            ensure_ascii=False,
        ),
        flush=True,
    )
    catalog = load_existing(out)
    catalog, errors, inspected = harvest_rows(
        key, selected, sleep_s=sleep_s, catalog=catalog
    )
    classes_sampled = sorted(
        {r.get("character_class") for r in selected if r.get("character_class")}
    )
    return _result(
        date,
        inspected,
        catalog,
        errors,
        mode="by-class",
        extra={
            "classesFound": len(class_seen),
            "classesSampled": len(classes_sampled),
            "perClass": per_class,
            "scanPages": scan_pages,
            "sampledClasses": classes_sampled,
            "classCountsSeen": dict(
                sorted(class_seen.items(), key=lambda x: (-x[1], x[0]))
            ),
        },
    )


def _result(
    date: str,
    inspected: int,
    catalog: dict[str, dict],
    errors: list[str],
    *,
    mode: str,
    extra: dict,
) -> dict:
    return {
        "source": "nexon-open-api",
        "game": "maplestorym",
        "mode": mode,
        "harvestedAt": datetime.now(timezone.utc).isoformat(),
        "rankingDate": date,
        "charactersInspected": inspected,
        "uniqueWeapons": len(catalog),
        "errors": errors[:80],
        **extra,
        "weapons": sorted(catalog.values(), key=lambda x: x["itemName"]),
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--by-class", action="store_true", help="Sample N chars per job class")
    ap.add_argument("--scan-pages", type=int, default=25, help="Ranking pages to scan for classes")
    ap.add_argument("--per-class", type=int, default=5, help="Max characters per class")
    ap.add_argument("--pages", type=int, default=1, help="Flat mode: ranking pages")
    ap.add_argument("--chars", type=int, default=30, help="Flat mode: max characters")
    ap.add_argument("--sleep", type=float, default=0.2)
    ap.add_argument(
        "--out",
        type=Path,
        default=ROOT / "planner" / "src" / "data" / "nexon" / "weaponIcons.json",
    )
    args = ap.parse_args()

    if args.by_class:
        data = harvest_by_class(
            scan_pages=args.scan_pages,
            per_class=args.per_class,
            sleep_s=args.sleep,
            out=args.out,
        )
    else:
        data = harvest_flat(
            pages=args.pages,
            max_chars=args.chars,
            sleep_s=args.sleep,
            out=args.out,
        )

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    log = ROOT / "docs" / "nexon-open-api" / "weapon-harvest-summary.json"
    summary = {
        "mode": data.get("mode"),
        "rankingDate": data["rankingDate"],
        "charactersInspected": data["charactersInspected"],
        "uniqueWeapons": data["uniqueWeapons"],
        "classesFound": data.get("classesFound"),
        "classesSampled": data.get("classesSampled"),
        "errorCount": len(data["errors"]),
        "sampleWeapons": [w["itemName"] for w in data["weapons"][:20]],
        "out": str(args.out.relative_to(ROOT)).replace("\\", "/"),
    }
    log.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
