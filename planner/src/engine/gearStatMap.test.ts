import { describe, expect, it } from 'vitest'
import { demoMainWeapon } from '../data/seed'
import type { GearItem } from '../types/build'
import {
  aggregateGearPlayerStats,
  mergeGearStatBag,
  pickAtkBag,
  resolveGearOptionId,
} from './gearStatMap'
import { deriveFlameBases } from './resolveStats'

describe('gearStatMap registry', () => {
  it('maps critDmg / maxHp / acc→accPercent / mesoGainPercent', () => {
    expect(resolveGearOptionId('critDmg')).toBe('critDmgPercent')
    expect(resolveGearOptionId('maxHp')).toBe('maxHp')
    expect(resolveGearOptionId('acc')).toBe('accPercent')
    expect(resolveGearOptionId('mesoGainPercent')).toBe('mesoGainPercent')
    expect(resolveGearOptionId('meso')).toBe('mesoGainPercent')
    expect(resolveGearOptionId('')).toBeNull()
    expect(resolveGearOptionId('unknownFutureOpt')).toBeNull()
  })

  it('merges GearStatBag values additively', () => {
    const merged = mergeGearStatBag(
      { phyDef: 100, phyDefPercent: 5 },
      { phyDef: 20, phyDefPercent: 0.5, ignoreDefPercent: 3 },
    )
    expect(merged.phyDef).toBe(120)
    expect(merged.phyDefPercent).toBeCloseTo(5.5)
    expect(merged.ignoreDefPercent).toBe(3)
  })
})

describe('aggregateGearPlayerStats', () => {
  it('sums demo main weapon extras and skips flame mainLines', () => {
    const weapon = demoMainWeapon()
    const bag = aggregateGearPlayerStats({ mainWeapon: weapon })

    // Flame lines (critDmgExp, phyAtkBossAtk) must NOT land in the bag
    expect(bag.critDmgPercent).toBeCloseTo(9.5 + 2.84 + 5, 5)
    expect(bag.mesoGainPercent).toBeCloseTo(0.2, 5)
    expect(bag.maxMpPercent).toBeCloseTo(1, 5)
    expect(bag.accPercent).toBeCloseTo(0.3, 5)
    expect(bag.maxHpPercent).toBe(16)

    const piece = weapon.atkBase + weapon.atkBonus
    const emblemBoost = piece * (weapon.emblem!.baseOptionBoostPercent / 100)
    expect(bag.phyAtk).toBeCloseTo(piece + emblemBoost, 5)

    const atk = pickAtkBag(bag)
    expect(atk.critDmgPercent).toBeCloseTo(9.5 + 2.84 + 5, 5)
    expect(atk.phyAtk).toBeCloseTo(piece + emblemBoost, 5)
  })

  it('ignores flame / potential / bonus when set to None', () => {
    const weapon = {
      ...demoMainWeapon(),
      flameRank: null,
      mainLines: [
        { optionId: 'phyAtkBossAtk', label: 'ignored', value: 73 },
      ],
      potential: null,
      bonusPotential: null,
    }
    const bag = aggregateGearPlayerStats({ mainWeapon: weapon })
    expect(bag.critDmgPercent).toBeCloseTo(5, 5) // emblem only
    expect(bag.mesoGainPercent).toBeUndefined()
    expect(bag.maxMpPercent).toBeUndefined()
    expect(bag.accPercent).toBeUndefined()
  })

  it('sums hat DEF/HP/DMG bases and emblem-boosts DEF only', () => {
    const hat: GearItem = {
      slotId: 'hat',
      itemName: 'Test Hat',
      iconUrl: '',
      rank: 'Unique',
      level: 40,
      star: 0,
      atkBase: 0,
      atkBonus: 0,
      phyDefBase: 100,
      magDefBase: 100,
      maxHpBase: 1000,
      maxMpBase: 0,
      maxDamageBase: 50_000,
      flameRank: null,
      mainLines: [],
      highTierOption: null,
      sharenianAbility: null,
      potential: null,
      bonusPotential: null,
      emblem: {
        typeId: 'ruthless',
        name: 'Ruthless Emblem',
        level: 1,
        baseOptionBoostPercent: 30,
        lines: [],
      },
      soul: null,
    }
    const bag = aggregateGearPlayerStats({ hat })
    expect(bag.phyDef).toBe(130) // 100 + 30
    expect(bag.magDef).toBe(130) // same base as PHY DEF
    expect(bag.maxHp).toBe(1000) // no emblem boost
    expect(bag.maxDamage).toBe(50_000)
  })

  it('feeds flame bases with gear maxHp / maxMpPercent / exp', () => {
    const weapon = demoMainWeapon()
    const bag = aggregateGearPlayerStats({ mainWeapon: weapon })
    const bases = deriveFlameBases(
      {
        maxHp: { character: 100 },
        maxHpPercent: { character: 10 },
        expGainPercent: { character: 50 },
      },
      bag,
    )
    // flat 100 × (1 + (character 10% + soul Hearty 16%)/100) = 100 * 1.26
    expect(bases.maxHp).toBeCloseTo(100 * 1.26, 5)
    // maxMp flat 0, pct from gear 1% → 0 * 1.01 = 0
    expect(bases.maxMp).toBe(0)
    expect(bases.expPercent).toBe(50)
  })
})
