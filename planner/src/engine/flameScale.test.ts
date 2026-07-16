import { describe, expect, it } from 'vitest'
import {
  applyFlameScales,
  scaleBonus,
  scaleFixedWithFixed,
  scaleFixedWithPercent,
  scalePercentWithPercent,
} from './flameScale'

describe('Nexon proportional helpers', () => {
  it('[Percent] × [Percent]: Crit DMG scales with EXP 100%, EXP 9.7% → 9.7%', () => {
    expect(scalePercentWithPercent(9.7, 100)).toBeCloseTo(9.7)
  })

  it('[Fixed] × [Percent] with ×10 adjust: PHY DMG × Crit Rate 500%, Crit 5.5% → 275', () => {
    expect(scaleFixedWithPercent(5.5, 500)).toBe(275)
  })

  it('[Fixed] × [Fixed] floors: MAG ATK × Max MP 19.7%, MP 1115 → 219', () => {
    expect(scaleFixedWithFixed(1115, 19.7)).toBe(219)
  })
})

describe('scaleBonus (compat alias)', () => {
  it('matches percent × percent', () => {
    expect(scaleBonus(80, 113)).toBeCloseTo(90.4)
    expect(scaleBonus(200000, 1)).toBeCloseTo(2000)
  })
})

describe('applyFlameScales', () => {
  const bases = {
    maxHp: 200000,
    maxMp: 80000,
    expPercent: 50,
    bossAtkPercent: 80,
    critRate: 85,
    critDmgPercent: 150,
  }

  it('PHY ATK scales with Boss ATK → phyAtkPercent (% × %)', () => {
    const bag = applyFlameScales(bases, [
      {
        optionId: 'phyAtkBossAtk',
        label: 'PHY ATK scales with Boss ATK',
        value: 113,
      },
    ])
    expect(bag.phyAtkPercent).toBeCloseTo(90.4)
    expect(bag.bossAtkPercent).toBe(0)
  })

  it('Crit DMG scales with EXP → critDmgPercent (% × %)', () => {
    const bag = applyFlameScales(bases, [
      { optionId: 'critDmgExp', label: 'Crit DMG scales with EXP▲', value: 9.6 },
    ])
    expect(bag.critDmgPercent).toBeCloseTo(4.8)
  })

  it('PHY ATK scales with Max HP → flat phyAtk (fixed × fixed, floored)', () => {
    const bag = applyFlameScales(bases, [
      {
        optionId: 'phyAtkMaxHp',
        label: 'PHY ATK scales with Max HP',
        value: 1.0,
      },
    ])
    expect(bag.phyAtk).toBe(2000)
  })

  it('MAG ATK scales with Max MP floors fractional result', () => {
    const bag = applyFlameScales(
      { ...bases, maxMp: 1115 },
      [
        {
          optionId: 'magAtkMaxMp',
          label: 'MAG ATK scales with Max MP',
          value: 19.7,
        },
      ],
    )
    expect(bag.magAtk).toBe(219)
  })

  it('Final DMG adds flat finalPercent', () => {
    const bag = applyFlameScales(bases, [
      { optionId: 'finalDmg', label: 'Final DMG Increase', value: 4 },
    ])
    expect(bag.finalPercent).toBe(4)
  })

  it('empty lines yield zeros', () => {
    const bag = applyFlameScales(bases, [])
    expect(bag.phyAtk).toBe(0)
    expect(bag.phyAtkPercent).toBe(0)
    expect(bag.critDmgPercent).toBe(0)
  })
})
