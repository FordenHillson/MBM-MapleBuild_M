import { describe, expect, it } from 'vitest'
import { demoMainWeapon } from '../data/seed'
import { buildSoulBlock } from '../data/souls'
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
    // Demo weapon has Will Hearty soul → Soul Set 1 adds +270 PHY/MAG ATK
    const soulSetAtk = 270
    expect(bag.phyAtk).toBeCloseTo(piece + emblemBoost + soulSetAtk, 5)
    expect(bag.magAtk).toBeCloseTo(soulSetAtk, 5)

    const atk = pickAtkBag(bag)
    expect(atk.critDmgPercent).toBeCloseTo(9.5 + 2.84 + 5, 5)
    expect(atk.phyAtk).toBeCloseTo(piece + emblemBoost + soulSetAtk, 5)
  })

  it('adds Will set 2 PHY/MAG ATK (+540) and ignores other boss groups', () => {
    const weapon = {
      ...demoMainWeapon(),
      soul: buildSoulBlock('will', 'hearty', 'mainWeapon'),
    }
    const secondary: GearItem = {
      slotId: 'secondary',
      itemName: 'Second',
      iconUrl: '',
      rank: 'Mythic',
      level: 1,
      star: 0,
      atkBase: 0,
      atkBonus: 0,
      phyDefBase: 0,
      magDefBase: 0,
      maxHpBase: 0,
      maxMpBase: 0,
      maxDamageBase: 0,
      flameRank: null,
      mainLines: [],
      highTierOption: null,
      sharenianAbility: null,
      potential: null,
      bonusPotential: null,
      emblem: null,
      soul: buildSoulBlock('will', 'beefy', 'secondary'),
    }
    const cape: GearItem = {
      ...secondary,
      slotId: 'cape',
      itemName: 'Cape',
      soul: buildSoulBlock('lucid', 'hearty', 'cape'),
    }
    const bag = aggregateGearPlayerStats({
      mainWeapon: weapon,
      secondary,
      cape,
    })
    const piece = weapon.atkBase + weapon.atkBonus
    const emblemBoost = piece * (weapon.emblem!.baseOptionBoostPercent / 100)
    expect(bag.phyAtk).toBeCloseTo(piece + emblemBoost + 540, 5)
    expect(bag.magAtk).toBeCloseTo(540, 5)
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

  it('adds Fair Trade critRate +100 for Absolab mainWeapon', () => {
    const weapon = {
      ...demoMainWeapon(),
      rank: 'Absolab' as const,
      highTierOption: null,
    }
    const bag = aggregateGearPlayerStats({ mainWeapon: weapon })
    expect(bag.critRate).toBe(100)
  })

  it('adds Fair Trade critRate +100 for Genesis mainWeapon', () => {
    const weapon = {
      ...demoMainWeapon(),
      rank: 'Genesis' as const,
      highTierOption: null,
    }
    const bag = aggregateGearPlayerStats({ mainWeapon: weapon })
    expect(bag.critRate).toBe(100)
  })
})
