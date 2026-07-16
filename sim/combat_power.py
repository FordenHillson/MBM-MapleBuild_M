"""Combat Power formula recovered from Combat.GetRenewalCombat (GameAssembly)."""

from __future__ import annotations

from dataclasses import dataclass
from math import pow as math_pow


PERM_DIV = 100_000.0  # ATK% / DMG% / Boss% / CritDMG%
CRIT_RATE_DIV = 1_000.0
FINAL_DIV = 1_000.0

BASE_ATK_WEIGHT = 0.3
BOSS_WEIGHT = 0.3
BASE_CRIT_DAMAGE = 0.20  # +20% on crit
CRIT_RATE_RAW_CAP = 1000  # 100%


@dataclass(frozen=True)
class CombatInputs:
    """Raw integer stats as stored in Option (client units)."""

    attack: int
    attack_permill: int  # ATK% raw
    damage_increase_permill: int  # DMG% raw
    boss_attack_permill: int
    critical_damage_increase_permill: int
    critical_increase_probability: int  # Crit rate raw (0..1000+)
    total_damage_add: int  # Final% / TotalDamageAdd raw
    total_damage_limit_increase: int = 0
    job_coeff: float = 1.0  # object+0x330; pow base
    extra_attack_from_result: int = 0  # User.Result +0x40
    extra_crit_from_result: int = 0  # User.Result +0x5c


@dataclass(frozen=True)
class CombatBreakdown:
    attack: float
    atk_ratio: float
    dmg_ratio: float
    boss_ratio: float
    crit_dmg_ratio: float
    crit_rate: float
    final_ratio: float
    crit_mult: float
    atk_term: float
    raw: float
    scale: float
    combat_power: int


def _ratio(raw: int, div: float) -> float:
    return raw / div


def calc_renewal_combat(inp: CombatInputs) -> CombatBreakdown:
    """Mirror GetRenewalCombat core math (without IL2CPP plumbing)."""

    attack = float(inp.attack + inp.extra_attack_from_result)
    atk_r = _ratio(inp.attack_permill, PERM_DIV)
    dmg_r = _ratio(inp.damage_increase_permill, PERM_DIV)
    boss_r = _ratio(inp.boss_attack_permill, PERM_DIV)
    crit_dmg_r = _ratio(inp.critical_damage_increase_permill, PERM_DIV)
    final_r = _ratio(inp.total_damage_add, FINAL_DIV)

    crit_raw = inp.critical_increase_probability + inp.extra_crit_from_result
    if crit_raw > CRIT_RATE_RAW_CAP:
        crit_raw = CRIT_RATE_RAW_CAP
    crit_rate = crit_raw / CRIT_RATE_DIV

    # (critDmg + 0.20) * critRate
    crit_mult = (crit_dmg_r + BASE_CRIT_DAMAGE) * crit_rate

    # (atk% + 0.3) + boss% * 0.3
    atk_term = (atk_r + BASE_ATK_WEIGHT) + (boss_r * BOSS_WEIGHT)

    raw = (
        atk_term
        * attack
        * (1.0 + dmg_r)
        * (1.0 + final_r)
        * (1.0 + crit_mult)
    )

    # pow(jobCoeff, totalDamageLimitIncrease / 1e8)
    exp = inp.total_damage_limit_increase / 100_000_000.0
    scale = math_pow(inp.job_coeff, exp) if inp.job_coeff > 0 else 1.0
    cp = int(raw * scale)

    return CombatBreakdown(
        attack=attack,
        atk_ratio=atk_r,
        dmg_ratio=dmg_r,
        boss_ratio=boss_r,
        crit_dmg_ratio=crit_dmg_r,
        crit_rate=crit_rate,
        final_ratio=final_r,
        crit_mult=crit_mult,
        atk_term=atk_term,
        raw=raw,
        scale=scale,
        combat_power=cp,
    )


def percent_to_perm(percent: float) -> int:
    """Convert UI-style percent (e.g. 50.0 for 50%) to client ATK%/DMG% raw (/1e5)."""
    return int(round(percent / 100.0 * PERM_DIV))


def percent_to_crit_raw(percent: float) -> int:
    """Convert crit rate percent to client raw (/1000)."""
    return int(round(percent / 100.0 * CRIT_RATE_DIV))
