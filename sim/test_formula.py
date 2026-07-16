"""Unit checks for recovered formulas."""

from __future__ import annotations

import math
import unittest

from combat_power import (
    BASE_ATK_WEIGHT,
    BASE_CRIT_DAMAGE,
    BOSS_WEIGHT,
    CombatInputs,
    calc_renewal_combat,
    percent_to_crit_raw,
    percent_to_perm,
)
from damage_line import DamageInputs, calc_damage_line


class TestCombatPower(unittest.TestCase):
    def test_zero_bonus_baseline(self) -> None:
        # ATK=10000, all % zero, crit 0, final 0, job_coeff=1
        out = calc_renewal_combat(
            CombatInputs(
                attack=10_000,
                attack_permill=0,
                damage_increase_permill=0,
                boss_attack_permill=0,
                critical_damage_increase_permill=0,
                critical_increase_probability=0,
                total_damage_add=0,
            )
        )
        # atk_term = 0.3, raw = 0.3 * 10000 * 1 * 1 * 1 = 3000
        self.assertAlmostEqual(out.atk_term, BASE_ATK_WEIGHT)
        self.assertAlmostEqual(out.raw, 3000.0)
        self.assertEqual(out.combat_power, 3000)

    def test_boss_weight_is_0_3_not_2_5(self) -> None:
        # 100% boss atk only → term = 0.3 + 0.3 = 0.6
        out = calc_renewal_combat(
            CombatInputs(
                attack=10_000,
                attack_permill=0,
                damage_increase_permill=0,
                boss_attack_permill=percent_to_perm(100.0),
                critical_damage_increase_permill=0,
                critical_increase_probability=0,
                total_damage_add=0,
            )
        )
        self.assertAlmostEqual(out.boss_ratio, 1.0)
        self.assertAlmostEqual(out.atk_term, BASE_ATK_WEIGHT + BOSS_WEIGHT * 1.0)
        self.assertAlmostEqual(out.raw, 6000.0)

    def test_crit_expected_matches_blend(self) -> None:
        # 50% crit, 0 crit dmg → critMult = 0.20 * 0.5 = 0.10
        # factor = 1.10 == 0.5*1.0 + 0.5*1.20
        out = calc_renewal_combat(
            CombatInputs(
                attack=10_000,
                attack_permill=0,
                damage_increase_permill=0,
                boss_attack_permill=0,
                critical_damage_increase_permill=0,
                critical_increase_probability=percent_to_crit_raw(50.0),
                total_damage_add=0,
            )
        )
        self.assertAlmostEqual(out.crit_rate, 0.5)
        self.assertAlmostEqual(out.crit_mult, BASE_CRIT_DAMAGE * 0.5)
        self.assertAlmostEqual(out.raw, 3000.0 * 1.10)

    def test_crit_rate_hard_cap_100(self) -> None:
        out = calc_renewal_combat(
            CombatInputs(
                attack=1000,
                attack_permill=0,
                damage_increase_permill=0,
                boss_attack_permill=0,
                critical_damage_increase_permill=0,
                critical_increase_probability=2000,
                total_damage_add=0,
            )
        )
        self.assertAlmostEqual(out.crit_rate, 1.0)

    def test_job_scale_pow(self) -> None:
        out = calc_renewal_combat(
            CombatInputs(
                attack=10_000,
                attack_permill=0,
                damage_increase_permill=0,
                boss_attack_permill=0,
                critical_damage_increase_permill=0,
                critical_increase_probability=0,
                total_damage_add=0,
                total_damage_limit_increase=100_000_000,  # exp = 1
                job_coeff=1.5,
            )
        )
        self.assertAlmostEqual(out.scale, 1.5)
        self.assertEqual(out.combat_power, int(3000.0 * 1.5))


class TestDamageLine(unittest.TestCase):
    def test_sheet_style_noncrit(self) -> None:
        # ATK=18456, atk%=0, dmg%=0, boss%=0, skill%=1, final%=0
        out = calc_damage_line(
            DamageInputs(attack=18456, skill_percent=1.0, is_boss=True)
        )
        self.assertAlmostEqual(out.non_crit, 18456.0)

    def test_boss_skill_term(self) -> None:
        # ATK=1000, skill=2.0 (200%), boss=50% → (1 + 0 + 2*0.5)=2.0
        out = calc_damage_line(
            DamageInputs(
                attack=1000,
                skill_percent=2.0,
                boss_atk_percent=0.5,
                is_boss=True,
            )
        )
        expected = 1000 * 1.0 * 2.0 * 2.0 * 1.0
        self.assertAlmostEqual(out.non_crit, expected)

    def test_average_crit(self) -> None:
        out = calc_damage_line(
            DamageInputs(attack=1000, crit_rate=0.5, crit_dmg_percent=0.0)
        )
        # noncrit=1000, crit=1200, avg=1100
        self.assertAlmostEqual(out.non_crit, 1000.0)
        self.assertAlmostEqual(out.crit, 1200.0)
        self.assertAlmostEqual(out.average, 1100.0)


if __name__ == "__main__":
    unittest.main()
