"""Parse Nexon cube potential markdown → planner/src/data/potentialWeapon.ts"""
from __future__ import annotations

import re
from collections import defaultdict
from pathlib import Path

SRC = Path(
    r"C:\Users\saetanpee\.cursor\projects\d-backup-perso-MSMTest-test\agent-tools\3af363f1-1531-42d2-add1-08f6f328b95b.txt"
)
OUT = Path(__file__).resolve().parents[1] / "src" / "data" / "potentialWeapon.ts"

OPTION_MAP = {
    "PHY ATK": ("phyAtk", "PHY ATK", False),
    "MAG ATK": ("magAtk", "MAG ATK", False),
    "Crit ATK": ("critAtk", "Crit ATK", False),
    "Crit DMG": ("critDmg", "Crit DMG", True),
    "Crit DMG (%)": ("critDmg", "Crit DMG", True),
    "ACC": ("acc", "ACC", True),
    "EXP Increase": ("expGainPercent", "EXP Increase", True),
    "Item Drop Rate Increase": ("itemDropPercent", "Item Drop Rate", True),
    "Meso Acquisition Increase": ("mesoGainPercent", "Meso Acquisition", True),
}

RANKS = ["Legendary", "Unique", "Epic", "Rare"]
ORDER = [
    "phyAtk",
    "magAtk",
    "critAtk",
    "critDmg",
    "acc",
    "maxHp",
    "maxMp",
    "maxHpPercent",
    "maxMpPercent",
    "expGainPercent",
    "itemDropPercent",
    "mesoGainPercent",
]


def parse_stat(opt: str, stat: str):
    raw = stat.strip()
    s = raw.replace(",", "").replace("%", "")
    try:
        val = float(s)
    except ValueError:
        return None
    if opt in ("Max HP", "Max MP"):
        is_pct = "%" in raw
        if opt == "Max HP":
            meta = (
                ("maxHpPercent", "Max HP %", True)
                if is_pct
                else ("maxHp", "Max HP", False)
            )
        else:
            meta = (
                ("maxMpPercent", "Max MP %", True)
                if is_pct
                else ("maxMp", "Max MP", False)
            )
        return meta, val
    meta = OPTION_MAP.get(opt)
    if not meta:
        return None
    return meta, val


def uniq(rows):
    bag: dict[str, set[float]] = defaultdict(set)
    labels: dict[str, str] = {}
    pcts: dict[str, bool] = {}
    for opt, stat, _ in rows:
        parsed = parse_stat(opt, stat)
        if not parsed:
            continue
        (oid, label, isp), val = parsed
        bag[oid].add(val)
        labels[oid] = label
        pcts[oid] = isp
    return bag, labels, pcts


def extract_rows(block: str):
    first = []
    second = []
    for line in block.splitlines():
        if not line.startswith("|"):
            continue
        cols = [c.strip() for c in line.strip("|").split("|")]
        if len(cols) < 6:
            continue
        if cols[0] in ("Option", "") or cols[0].startswith("-"):
            continue
        if cols[0] and cols[1]:
            first.append((cols[0], cols[1], cols[2] if len(cols) > 2 else ""))
        if cols[3] and cols[4]:
            second.append((cols[3], cols[4], cols[5] if len(cols) > 5 else ""))
    return first, second


def fmt_nums(arr: list[float]) -> str:
    out = []
    for v in arr:
        if float(v).is_integer():
            out.append(str(int(v)))
        else:
            out.append(str(v))
    return "[" + ", ".join(out) + "]"


def main() -> None:
    text = SRC.read_text(encoding="utf-8")
    main_part = text.split("Bonus Potential Cube")[0]
    rank_blocks = re.split(
        r"\| Potential Rank \| \| (\w+) \| Equipment Type \| \| Weapon \|",
        main_part,
    )

    data: dict[str, dict[str, list[float]]] = defaultdict(dict)
    labels: dict[str, str] = {}
    pcts: dict[str, bool] = {}

    for i in range(1, len(rank_blocks), 2):
        rank = rank_blocks[i]
        f, _s = extract_rows(rank_blocks[i + 1])
        fb, fl, fp = uniq(f)
        labels.update(fl)
        pcts.update(fp)
        for oid, vals in fb.items():
            data[oid][rank] = sorted(vals, reverse=True)

    # Second/Third can roll current rank or any lower rank (Nexon cube rules).
    # Build later pools as cumulative union of First pools up to that rank.
    # Ascending rank order for cumulative fold.
    ascend = ["Rare", "Epic", "Unique", "Legendary"]
    later: dict[str, dict[str, list[float]]] = defaultdict(dict)
    for oid, by_rank in data.items():
        acc: set[float] = set()
        for r in ascend:
            acc.update(by_rank.get(r, []))
            later[oid][r] = sorted(acc, reverse=True)

    lines: list[str] = []
    lines.append(
        "import type { GearSlotId, PotentialGrade, StatLine } from '../types/build'"
    )
    lines.append("")
    lines.append(
        "/** Cube Potential ranks for Weapon / Secondary — Nexon table 6438. */"
    )
    lines.append("export const POTENTIAL_RANKS: PotentialGrade[] = [")
    for r in RANKS:
        lines.append(f"  '{r}',")
    lines.append("]")
    lines.append("")
    lines.append("export interface PotentialOptionDef {")
    lines.append("  id: string")
    lines.append("  label: string")
    lines.append("  isPercent: boolean")
    lines.append("  /** First line values per item Potential rank. */")
    lines.append("  firstByRank: Record<PotentialGrade, number[]>")
    lines.append("  /** Second / third line values per item Potential rank. */")
    lines.append("  laterByRank: Record<PotentialGrade, number[]>")
    lines.append("}")
    lines.append("")
    lines.append("function pools(")
    for r in RANKS:
        key = r.lower()
        lines.append(f"  {key}First: number[],")
        lines.append(f"  {key}Later: number[],")
    lines.append("): Pick<PotentialOptionDef, 'firstByRank' | 'laterByRank'> {")
    lines.append("  return {")
    lines.append("    firstByRank: {")
    for r in RANKS:
        lines.append(f"      {r}: {r.lower()}First,")
    lines.append("    },")
    lines.append("    laterByRank: {")
    for r in RANKS:
        lines.append(f"      {r}: {r.lower()}Later,")
    lines.append("    },")
    lines.append("  }")
    lines.append("}")
    lines.append("")
    lines.append("/** Weapon / Secondary main Potential options. */")
    lines.append("export const POTENTIAL_WEAPON_OPTIONS: PotentialOptionDef[] = [")

    for oid in ORDER:
        if oid not in data:
            continue
        label = labels[oid]
        isp = "true" if pcts[oid] else "false"
        args: list[str] = []
        for r in RANKS:
            first = data[oid].get(r, [])
            later_vals = later[oid].get(r, first)
            args.append(fmt_nums(first))
            args.append(fmt_nums(later_vals))
        lines.append("  {")
        lines.append(f"    id: '{oid}',")
        lines.append(f"    label: '{label}',")
        lines.append(f"    isPercent: {isp},")
        lines.append(f"    ...pools({', '.join(args)}),")
        lines.append("  },")

    lines.append("]")
    lines.append("")
    lines.append("const EMPTY_LINE: StatLine = { optionId: '', label: '', value: 0 }")
    lines.append("")
    lines.append("const LETTER_TO_RANK: Record<string, PotentialGrade> = {")
    lines.append("  R: 'Rare',")
    lines.append("  E: 'Epic',")
    lines.append("  U: 'Unique',")
    lines.append("  L: 'Legendary',")
    lines.append("  M: 'Legendary',")
    lines.append("  A: 'Legendary',")
    lines.append("  C: 'Legendary',")
    lines.append("}")
    lines.append("")
    lines.append("export function isPotentialSlot(slot: GearSlotId): boolean {")
    lines.append("  return slot === 'mainWeapon' || slot === 'secondary'")
    lines.append("}")
    lines.append("")
    lines.append("export function isPotentialGrade(v: unknown): v is PotentialGrade {")
    lines.append("  return typeof v === 'string' && (POTENTIAL_RANKS as string[]).includes(v)")
    lines.append("}")
    lines.append("")
    lines.append("/** Migrate old letter grades (R/E/U/L/M/A/C) → full rank names. */")
    lines.append("export function normalizePotentialGrade(grade: unknown): PotentialGrade {")
    lines.append("  if (isPotentialGrade(grade)) return grade")
    lines.append("  if (typeof grade === 'string' && grade in LETTER_TO_RANK) {")
    lines.append("    return LETTER_TO_RANK[grade]")
    lines.append("  }")
    lines.append("  return 'Legendary'")
    lines.append("}")
    lines.append("")
    lines.append("export function potentialOptionsForSlot(slot: GearSlotId): PotentialOptionDef[] {")
    lines.append("  if (!isPotentialSlot(slot)) return []")
    lines.append("  return POTENTIAL_WEAPON_OPTIONS")
    lines.append("}")
    lines.append("")
    lines.append("export function potentialOptionById(")
    lines.append("  slot: GearSlotId,")
    lines.append("  optionId: string,")
    lines.append("): PotentialOptionDef | undefined {")
    lines.append("  return potentialOptionsForSlot(slot).find((o) => o.id === optionId)")
    lines.append("}")
    lines.append("")
    lines.append("export function potentialValues(")
    lines.append("  slot: GearSlotId,")
    lines.append("  optionId: string,")
    lines.append("  grade: PotentialGrade,")
    lines.append("  lineIndex: number,")
    lines.append("): number[] {")
    lines.append("  const opt = potentialOptionById(slot, optionId)")
    lines.append("  if (!opt) return []")
    lines.append("  return lineIndex === 0 ? opt.firstByRank[grade] : opt.laterByRank[grade]")
    lines.append("}")
    lines.append("")
    lines.append("export function potentialOptionsAvailable(")
    lines.append("  slot: GearSlotId,")
    lines.append("  grade: PotentialGrade,")
    lines.append("  lineIndex: number,")
    lines.append("): PotentialOptionDef[] {")
    lines.append("  return potentialOptionsForSlot(slot).filter((o) => {")
    lines.append("    const vals = lineIndex === 0 ? o.firstByRank[grade] : o.laterByRank[grade]")
    lines.append("    return vals.length > 0")
    lines.append("  })")
    lines.append("}")
    lines.append("")
    lines.append("export function emptyPotentialLines(): StatLine[] {")
    lines.append("  return [{ ...EMPTY_LINE }, { ...EMPTY_LINE }, { ...EMPTY_LINE }]")
    lines.append("}")
    lines.append("")
    lines.append("export function normalizePotentialLines(")
    lines.append("  slot: GearSlotId,")
    lines.append("  grade: PotentialGrade,")
    lines.append("  lines: StatLine[],")
    lines.append("): StatLine[] {")
    lines.append("  const padded = [...lines]")
    lines.append("  while (padded.length < 3) padded.push({ ...EMPTY_LINE })")
    lines.append("  return padded.slice(0, 3).map((line, idx) => {")
    lines.append("    if (!line.optionId) return { ...EMPTY_LINE }")
    lines.append("    const values = potentialValues(slot, line.optionId, grade, idx)")
    lines.append("    if (values.length === 0) return { ...EMPTY_LINE }")
    lines.append("    const opt = potentialOptionById(slot, line.optionId)")
    lines.append("    const value = values.includes(line.value) ? line.value : values[0]!")
    lines.append("    return {")
    lines.append("      optionId: line.optionId,")
    lines.append("      label: opt?.label ?? line.label,")
    lines.append("      value,")
    lines.append("    }")
    lines.append("  })")
    lines.append("}")
    lines.append("")

    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
