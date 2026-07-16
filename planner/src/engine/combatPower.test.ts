import { describe, expect, it } from 'vitest'
import {
  BASE_ATK_WEIGHT,
  BASE_CRIT_DAMAGE,
  BOSS_WEIGHT,
  calcRenewalCombat,
  percentToCritRaw,
  percentToPerm,
} from './combatPower'
import { calcDamageLine } from './damageLine'

describe('calcRenewalCombat', () => {
  it('zero bonus baseline', () => {
    const out = calcRenewalCombat({
      attack: 10_000,
      attackPermill: 0,
      damageIncreasePermill: 0,
      bossAttackPermill: 0,
      criticalDamageIncreasePermill: 0,
      criticalIncreaseProbability: 0,
      totalDamageAdd: 0,
    })
    expect(out.atkTerm).toBeCloseTo(BASE_ATK_WEIGHT)
    expect(out.raw).toBeCloseTo(3000)
    expect(out.combatPower).toBe(3000)
  })

  it('boss weight 0.3', () => {
    const out = calcRenewalCombat({
      attack: 10_000,
      attackPermill: 0,
      damageIncreasePermill: 0,
      bossAttackPermill: percentToPerm(100),
      criticalDamageIncreasePermill: 0,
      criticalIncreaseProbability: 0,
      totalDamageAdd: 0,
    })
    expect(out.atkTerm).toBeCloseTo(BASE_ATK_WEIGHT + BOSS_WEIGHT)
    expect(out.raw).toBeCloseTo(6000)
  })

  it('crit expected blend', () => {
    const out = calcRenewalCombat({
      attack: 10_000,
      attackPermill: 0,
      damageIncreasePermill: 0,
      bossAttackPermill: 0,
      criticalDamageIncreasePermill: 0,
      criticalIncreaseProbability: percentToCritRaw(50),
      totalDamageAdd: 0,
    })
    expect(out.critMult).toBeCloseTo(BASE_CRIT_DAMAGE * 0.5)
    expect(out.raw).toBeCloseTo(3000 * 1.1)
  })
})

describe('calcDamageLine', () => {
  it('average crit', () => {
    const out = calcDamageLine({
      attack: 1000,
      critRate: 0.5,
      critDmgPercent: 0,
    })
    expect(out.nonCrit).toBeCloseTo(1000)
    expect(out.crit).toBeCloseTo(1200)
    expect(out.critMax).toBeCloseTo(1700)
    expect(out.average).toBeCloseTo(1100)
    expect(out.minPerHit).toBeCloseTo(1000)
    expect(out.maxPerHit).toBeCloseTo(1700)
  })

  it('applies def multiplier', () => {
    const out = calcDamageLine({
      attack: 1000,
      defMultiplier: 0.9,
    })
    expect(out.nonCrit).toBeCloseTo(900)
  })
})
