"""Disassemble Combat.GetExpectedDamage / GetRenewalCombat from GameAssembly.dll."""
from __future__ import annotations

import json
import struct
from pathlib import Path

import pefile
from capstone import CS_ARCH_X86, CS_MODE_64, Cs

ROOT = Path(__file__).resolve().parents[1]
DLL = ROOT / "dump" / "input" / "GameAssembly.dll"
SCRIPT = ROOT / "dump" / "output" / "script.json"
OUT = ROOT / "docs" / "disasm_combat.txt"

TARGETS = [
    "NGameProcess.NStatic.NFunction.Combat$$GetExpectedDamage",
    "NGameProcess.NStatic.NFunction.Combat$$GetRenewalCombat",
    "NGameProcess.NStatic.NFunction.Combat$$GetRenewalCombatDoping",
    "NGameProcess.NStatic.NFunction.Combat$$GetCombatGlobal",
    "NGameProcess.NField.NFunction.PartyMatchManager$$GetMyExpectedDamage",
]


def load_addresses() -> dict[str, dict]:
    data = json.loads(SCRIPT.read_text(encoding="utf-8"))
    found = {}
    for item in data.get("ScriptMethod", data if isinstance(data, list) else []):
        name = item.get("Name") or item.get("name")
        if name in TARGETS:
            found[name] = item
    # script.json structure may be {ScriptMethod: [...]}
    if not found and isinstance(data, dict):
        for key in ("ScriptMethod", "methods", "Method"):
            arr = data.get(key)
            if isinstance(arr, list):
                for item in arr:
                    name = item.get("Name") or item.get("name")
                    if name in TARGETS:
                        found[name] = item
    return found


def rva_to_offset(pe: pefile.PE, rva: int) -> int:
    return pe.get_offset_from_rva(rva)


def disasm_range(pe: pefile.PE, rva: int, size: int = 0x800) -> list[str]:
    off = rva_to_offset(pe, rva)
    code = pe.get_memory_mapped_image()[rva : rva + size]
    if not code:
        # fallback file offset from dumper (rva - section diff often 0x1000)
        with open(DLL, "rb") as f:
            f.seek(off)
            code = f.read(size)
    md = Cs(CS_ARCH_X86, CS_MODE_64)
    md.detail = False
    lines = []
    for i in md.disasm(code, rva):
        lines.append(f"0x{i.address:08X}:\t{i.mnemonic}\t{i.op_str}")
        # stop on early ret if function looks tiny; keep going for analysis
        if i.mnemonic == "ret" and len(lines) > 20:
            # continue a bit after first ret in case of multiple blocks
            if len(lines) > 120:
                break
    return lines


def main() -> None:
    pe = pefile.PE(str(DLL), fast_load=True)
    pe.parse_data_directories(
        directories=[pefile.DIRECTORY_ENTRY["IMAGE_DIRECTORY_ENTRY_EXPORT"]]
    )

    # Prefer known RVAs from dump.cs comments
    known = {
        "Combat$$GetExpectedDamage": 0x39C9F70,
        "Combat$$GetRenewalCombat": 0x39CA690,
        "Combat$$GetRenewalCombatDoping": 0x39CA0D0,
        "Combat$$GetCombatGlobal": 0x39C8A70,
        "PartyMatchManager$$GetMyExpectedDamage": 0x16B0200,
    }

    out_lines: list[str] = []
    out_lines.append(f"DLL: {DLL}")
    out_lines.append(f"Size: {DLL.stat().st_size}")
    out_lines.append("")

    for label, rva in known.items():
        try:
            off = rva_to_offset(pe, rva)
        except Exception as e:
            out_lines.append(f"=== {label} RVA=0x{rva:X} OFFSET ERR: {e}")
            continue
        out_lines.append(f"=== {label} RVA=0x{rva:X} FileOffset=0x{off:X} ===")
        try:
            lines = disasm_range(pe, rva, 0x1000 if "Renewal" in label or "Global" in label else 0x400)
            out_lines.extend(lines[:400])
        except Exception as e:
            out_lines.append(f"DISASM ERR: {e}")
        out_lines.append("")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(out_lines), encoding="utf-8")
    print(f"Wrote {OUT} ({len(out_lines)} lines)")


if __name__ == "__main__":
    main()
