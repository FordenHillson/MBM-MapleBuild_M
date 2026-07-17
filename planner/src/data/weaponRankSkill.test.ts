import { describe, expect, it } from 'vitest'
import {
  WEAPON_RANK_SKILL,
  supportsWeaponRankSkill,
  weaponRankSkillBonus,
} from './weaponRankSkill'

describe('weaponRankSkill', () => {
  it('enables Fair Trade on mainWeapon Necro / Absolab / Arcane / Genesis', () => {
    expect(supportsWeaponRankSkill('mainWeapon', 'Necro')).toBe(true)
    expect(supportsWeaponRankSkill('mainWeapon', 'Absolab')).toBe(true)
    expect(supportsWeaponRankSkill('mainWeapon', 'Arcane')).toBe(true)
    expect(supportsWeaponRankSkill('mainWeapon', 'Genesis')).toBe(true)
    expect(weaponRankSkillBonus('mainWeapon', 'Absolab')).toEqual({
      critRate: 100,
    })
    expect(weaponRankSkillBonus('mainWeapon', 'Genesis')).toEqual({
      critRate: 100,
    })
  })

  it('disables Fair Trade for lower ranks and non-weapon slots', () => {
    expect(supportsWeaponRankSkill('mainWeapon', 'Legendary')).toBe(false)
    expect(supportsWeaponRankSkill('secondary', 'Absolab')).toBe(false)
    expect(supportsWeaponRankSkill('hat', 'Necro')).toBe(false)
    expect(weaponRankSkillBonus('mainWeapon', 'Legendary')).toBeNull()
  })

  it('exposes Fair Trade labels and icon', () => {
    expect(WEAPON_RANK_SKILL.name).toBe('Fair Trade')
    expect(WEAPON_RANK_SKILL.effectLabel).toBe('[ เพิ่มคริเรท 100% ]')
    expect(WEAPON_RANK_SKILL.iconUrl).toBe(
      '/textures/weapon-skill/fair-trade.png',
    )
  })
})
