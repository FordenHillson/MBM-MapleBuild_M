"""Per-line / average damage estimate from community spreadsheet model."""

from __future__ import annotations

from dataclasses import dataclass


BASE_CRIT_DAMAGE = 0.20


@dataclass(frozen=True)
class DamageInputs:
    """Ratios as fractions (0.5 = 50%), attack as flat number."""

    attack: float
    atk_percent: float = 0.0
    dmg_percent: float = 0.0
    boss_atk_percent: float = 0.0
    final_percent: float = 0.0
    skill_percent: float = 1.0  # 1.0 = 100% skill damage
    crit_rate: float = 0.0
    crit_dmg_percent: float = 0.0
    hit_count: int = 1
    is_boss: bool = True
    damage_cap: float | None = None
    crit_res: float = 0.0  # boss crit resistance (0..1)


@dataclass(frozen=True)
class DamageBreakdown:
    non_crit: float
    crit: float
    average: float
    effective_crit_rate: float


def calc_damage_line(inp: DamageInputs) -> DamageBreakdown:
    """
    Community sheet model (approx. 2020):

      NonCrit(Boss) = ATK * (1+DMG%) * (1+ATK% + Skill%*Boss%) * Skill% * (1+Final%)
      Crit          = NonCrit * (1 + 0.20 + CritDMG%)
      Average       = (1-CR)*NonCrit + CR*Crit
    """

    boss_term = inp.skill_percent * inp.boss_atk_percent if inp.is_boss else 0.0
    non_crit = (
        inp.attack
        * (1.0 + inp.dmg_percent)
        * (1.0 + inp.atk_percent + boss_term)
        * inp.skill_percent
        * (1.0 + inp.final_percent)
        * inp.hit_count
    )

    crit = non_crit * (1.0 + BASE_CRIT_DAMAGE + inp.crit_dmg_percent)

    # Crit rate vs boss crit res (soft behavior from sheet notes)
    cr = inp.crit_rate
    if inp.crit_res > 0:
        if inp.crit_res >= cr:
            effective_cr = 0.0
        else:
            effective_cr = min(cr - inp.crit_res, 0.90)  # soft cap ~90% noted for no-res bosses
    else:
        effective_cr = min(cr, 1.0)

    avg = (1.0 - effective_cr) * non_crit + effective_cr * crit

    if inp.damage_cap is not None:
        capped_crit = min(crit, inp.damage_cap)
        avg = (1.0 - effective_cr) * non_crit + effective_cr * capped_crit
        crit = capped_crit

    return DamageBreakdown(
        non_crit=non_crit,
        crit=crit,
        average=avg,
        effective_crit_rate=effective_cr,
    )
