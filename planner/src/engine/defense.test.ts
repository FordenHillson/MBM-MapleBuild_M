import { describe, expect, it } from 'vitest'
import {
  calcDamageReduction,
  defenseRatingAt,
  defDamageMultiplier,
} from './defense'

describe('defenseRatingAt', () => {
  it('matches sheet samples', () => {
    expect(defenseRatingAt(1)).toBe(292)
    expect(defenseRatingAt(45)).toBe(4547)
    expect(defenseRatingAt(218)).toBe(40423)
    expect(defenseRatingAt(244)).toBe(57132)
    expect(defenseRatingAt(250)).toBe(62183)
  })
})

describe('calcDamageReduction', () => {
  it('Lv244 vs Lv45 boss ≈ 7.37%', () => {
    const r = calcDamageReduction({
      characterLevel: 244,
      targetLevel: 45,
      mode: 'boss',
      defOverridePercent: 0,
    })
    expect(r.usedOverride).toBe(false)
    expect(r.damageReduction * 100).toBeCloseTo(7.37, 1)
  })

  it('normal mode uses ~1/9 target defense', () => {
    const boss = calcDamageReduction({
      characterLevel: 244,
      targetLevel: 45,
      mode: 'boss',
      defOverridePercent: 0,
    })
    const mob = calcDamageReduction({
      characterLevel: 244,
      targetLevel: 45,
      mode: 'normal',
      defOverridePercent: 0,
    })
    expect(mob.damageReduction * 100).toBeCloseTo(0.82, 1)
    expect(mob.damageReduction).toBeLessThan(boss.damageReduction)
  })

  it('override replaces table DR', () => {
    const r = calcDamageReduction({
      characterLevel: 250,
      targetLevel: 218,
      mode: 'boss',
      defOverridePercent: 5,
    })
    expect(r.usedOverride).toBe(true)
    expect(r.damageReduction).toBeCloseTo(0.05)
  })
})

describe('defDamageMultiplier', () => {
  it('applies IED to remaining DR', () => {
    // 10% DR, 50% IED → effective 5% → mult 0.95
    expect(defDamageMultiplier(0.1, 0.5)).toBeCloseTo(0.95)
  })

  it('full IED negates DR', () => {
    expect(defDamageMultiplier(0.4, 1)).toBe(1)
  })
})
