"""Parse Nexon bonus potential markdown → planner/src/data/bonusPotentialWeapon.ts"""
from __future__ import annotations

import re
from collections import defaultdict
from pathlib import Path

SRC = Path(
    r"C:\Users\saetanpee\.cursor\projects\d-backup-perso-MSMTest-test\agent-tools\3af363f1-1531-42d2-add1-08f6f328b95b.txt"
)
OUT = Path(__file__).resolve().parents[1] / "src" / "data" / "bonusPotentialWeapon.ts"

OPTION_MAP = {
    "PHY ATK": ("phyAtk", "PHY ATK", False),
    "MAG ATK": ("magAtk", "MAG ATK", False),
    "Crit ATK": ("critAtk", "Crit ATK", False),
    "Crit DMG": ("critDmg", "Crit DMG", True),
    "Crit DMG (%)": ("critDmg", "Crit DMG", True),
    "ACC": ("acc", "ACC", True),
    "EXP Increase": ("expGainPercent", "EXP Increase", True),
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
    bonus = text.split("Bonus Potential Cube", 1)[1]

    # Row format:
    # | Weapon/Secondary Weapon First Bonus Potential (Rare) | OPT | STAT | PROB |
    #   Weapon/Secondary Weapon Second/Third Bonus Potential (Rare) | OPT | STAT | PROB |
    row_re = re.compile(
        r"Weapon/Secondary Weapon First Bonus Potential \((\w+)\) \| ([^|]+) \| ([^|]+) \| [^|]+ \| "
        r"Weapon/Secondary Weapon Second/Third Bonus Potential \(\w+\) \| ([^|]+) \| ([^|]+) \|",
    )

    first: dict[str, dict[str, set[float]]] = defaultdict(lambda: defaultdict(set))
    labels: dict[str, str] = {}
    pcts: dict[str, bool] = {}

    for m in row_re.finditer(bonus):
        rank, opt1, stat1, opt2, stat2 = m.groups()
        for opt, stat in ((opt1.strip(), stat1.strip()), (opt2.strip(), stat2.strip())):
            # For first pool we only want first-column option for that rank.
            pass
        p1 = parse_stat(opt1.strip(), stat1.strip())
        if p1:
            (oid, label, isp), val = p1
            first[oid][rank].add(val)
            labels[oid] = label
            pcts[oid] = isp

    # Also collect first-only from rows where we only care about first column
    # (some second columns may pair oddly). Re-scan first column only.
    first_only = re.compile(
        r"Weapon/Secondary Weapon First Bonus Potential \((\w+)\) \| ([^|]+) \| ([^|]+) \|",
    )
    first.clear()
    for m in first_only.finditer(bonus):
        rank, opt, stat = m.groups()
        parsed = parse_stat(opt.strip(), stat.strip())
        if not parsed:
            continue
        (oid, label, isp), val = parsed
        first[oid][rank].add(val)
        labels[oid] = label
        pcts[oid] = isp

    data: dict[str, dict[str, list[float]]] = {}
    for oid, by_rank in first.items():
        data[oid] = {
            r: sorted(vals, reverse=True) for r, vals in by_rank.items()
        }

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
    lines.append(
        "import { isPotentialSlot, normalizePotentialGrade } from './potentialWeapon'"
    )
    lines.append("import type { PotentialOptionDef } from './potentialWeapon'")
    lines.append("")
    lines.append(
        "/** Bonus Potential ranks for Weapon / Secondary — Nexon table 6438. */"
    )
    lines.append("export const BONUS_POTENTIAL_RANKS: PotentialGrade[] = [")
    for r in RANKS:
        lines.append(f"  '{r}',")
    lines.append("]")
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
    lines.append(
        "/** Weapon / Secondary Bonus Potential options (distinct value pools from main Pot). */"
    )
    lines.append(
        "export const BONUS_POTENTIAL_WEAPON_OPTIONS: PotentialOptionDef[] = ["
    )

    for oid in ORDER:
        if oid not in data:
            continue
        label = labels[oid]
        isp = "true" if pcts[oid] else "false"
        args: list[str] = []
        for r in RANKS:
            fvals = data[oid].get(r, [])
            lvals = later[oid].get(r, fvals)
            args.append(fmt_nums(fvals))
            args.append(fmt_nums(lvals))
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
    lines.append(
        "export function bonusPotentialOptionsForSlot(slot: GearSlotId): PotentialOptionDef[] {"
    )
    lines.append("  if (!isPotentialSlot(slot)) return []")
    lines.append("  return BONUS_POTENTIAL_WEAPON_OPTIONS")
    lines.append("}")
    lines.append("")
    lines.append("export function bonusPotentialOptionById(")
    lines.append("  slot: GearSlotId,")
    lines.append("  optionId: string,")
    lines.append("): PotentialOptionDef | undefined {")
    lines.append(
        "  return bonusPotentialOptionsForSlot(slot).find((o) => o.id === optionId)"
    )
    lines.append("}")
    lines.append("")
    lines.append("export function bonusPotentialValues(")
    lines.append("  slot: GearSlotId,")
    lines.append("  optionId: string,")
    lines.append("  grade: PotentialGrade,")
    lines.append("  lineIndex: number,")
    lines.append("): number[] {")
    lines.append("  const opt = bonusPotentialOptionById(slot, optionId)")
    lines.append("  if (!opt) return []")
    lines.append(
        "  return lineIndex === 0 ? opt.firstByRank[grade] : opt.laterByRank[grade]"
    )
    lines.append("}")
    lines.append("")
    lines.append("export function bonusPotentialOptionsAvailable(")
    lines.append("  slot: GearSlotId,")
    lines.append("  grade: PotentialGrade,")
    lines.append("  lineIndex: number,")
    lines.append("): PotentialOptionDef[] {")
    lines.append("  return bonusPotentialOptionsForSlot(slot).filter((o) => {")
    lines.append(
        "    const vals = lineIndex === 0 ? o.firstByRank[grade] : o.laterByRank[grade]"
    )
    lines.append("    return vals.length > 0")
    lines.append("  })")
    lines.append("}")
    lines.append("")
    lines.append("export function emptyBonusPotentialLines(): StatLine[] {")
    lines.append("  return [{ ...EMPTY_LINE }, { ...EMPTY_LINE }, { ...EMPTY_LINE }]")
    lines.append("}")
    lines.append("")
    lines.append("export function normalizeBonusPotentialLines(")
    lines.append("  slot: GearSlotId,")
    lines.append("  grade: PotentialGrade,")
    lines.append("  lines: StatLine[],")
    lines.append("): StatLine[] {")
    lines.append("  const padded = [...lines]")
    lines.append("  while (padded.length < 3) padded.push({ ...EMPTY_LINE })")
    lines.append("  return padded.slice(0, 3).map((line, idx) => {")
    lines.append("    let optionId = line.optionId")
    lines.append("    if (optionId === 'meso') optionId = 'mesoGainPercent'")
    lines.append(
        "    if (optionId === 'maxHp%' || optionId === 'maxHpPct') optionId = 'maxHpPercent'"
    )
    lines.append(
        "    if (optionId === 'maxMp%' || optionId === 'maxMpPct') optionId = 'maxMpPercent'"
    )
    lines.append("    if (!optionId) return { ...EMPTY_LINE }")
    lines.append(
        "    const values = bonusPotentialValues(slot, optionId, grade, idx)"
    )
    lines.append("    if (values.length === 0) return { ...EMPTY_LINE }")
    lines.append("    const opt = bonusPotentialOptionById(slot, optionId)")
    lines.append(
        "    const value = values.includes(line.value) ? line.value : values[0]!"
    )
    lines.append("    return {")
    lines.append("      optionId,")
    lines.append("      label: opt?.label ?? line.label,")
    lines.append("      value,")
    lines.append("    }")
    lines.append("  })")
    lines.append("}")
    lines.append("")

    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")
    print("options:", [o for o in ORDER if o in data])
    for oid in ORDER:
        if oid not in data:
            continue
        for r in RANKS:
            print(f"  {oid} {r} first={len(data[oid].get(r, []))} later={len(later[oid].get(r, []))}")


if __name__ == "__main__":
    main()
