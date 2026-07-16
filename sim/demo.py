"""Quick CLI demo for recovered formulas."""

from __future__ import annotations

from combat_power import CombatInputs, calc_renewal_combat, percent_to_crit_raw, percent_to_perm
from damage_line import DamageInputs, calc_damage_line


def main() -> None:
    # Example: ATK 18456, ATK% 131.2%, DMG% 37.2%, Boss 92.7%, Crit 80%, CritDMG 180%, Final 50%
    cp = calc_renewal_combat(
        CombatInputs(
            attack=18_456,
            attack_permill=percent_to_perm(131.2),
            damage_increase_permill=percent_to_perm(37.2),
            boss_attack_permill=percent_to_perm(92.7),
            critical_damage_increase_permill=percent_to_perm(180.0),
            critical_increase_probability=percent_to_crit_raw(80.0),
            total_damage_add=500,  # 50% in /1000 units
            job_coeff=1.0,
        )
    )
    print("=== Client CP (GetRenewalCombat) ===")
    print(f"  atk_term={cp.atk_term:.4f}  crit_mult={cp.crit_mult:.4f}")
    print(f"  raw={cp.raw:,.1f}  scale={cp.scale:.4f}  CP={cp.combat_power:,}")

    dmg = calc_damage_line(
        DamageInputs(
            attack=18_456,
            atk_percent=1.312,
            dmg_percent=0.372,
            boss_atk_percent=0.927,
            final_percent=0.50,
            skill_percent=2.5,
            crit_rate=0.80,
            crit_dmg_percent=1.80,
            is_boss=True,
        )
    )
    print("=== Sheet damage line (estimate) ===")
    print(f"  noncrit={dmg.non_crit:,.1f}")
    print(f"  crit   ={dmg.crit:,.1f}")
    print(f"  average={dmg.average:,.1f}  (CR={dmg.effective_crit_rate:.0%})")


if __name__ == "__main__":
    main()
