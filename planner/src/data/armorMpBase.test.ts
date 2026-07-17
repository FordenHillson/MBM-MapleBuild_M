import { describe, expect, it } from 'vitest'
import { usesArmorMpBase } from './armorBaseGear'
import { aggregateGearPlayerStats } from '../engine/gearStatMap'
import type { GearItem } from '../types/build'

function blankArmor(slotId: GearItem['slotId'], overrides: Partial<GearItem>): GearItem {
  return {
    slotId,
    itemName: 't',
    iconUrl: '',
    rank: 'Necro',
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
    soul: null,
    ...overrides,
  }
}

describe('usesArmorMpBase', () => {
  it('uses MP base for shoulder / belt / cape only', () => {
    expect(usesArmorMpBase('shoulder')).toBe(true)
    expect(usesArmorMpBase('belt')).toBe(true)
    expect(usesArmorMpBase('cape')).toBe(true)
    expect(usesArmorMpBase('hat')).toBe(false)
    expect(usesArmorMpBase('shoes')).toBe(false)
  })
})

describe('aggregate maxMpBase', () => {
  it('adds maxMpBase into maxMp and keeps maxHpBase on maxHp', () => {
    const bag = aggregateGearPlayerStats({
      shoulder: blankArmor('shoulder', { maxMpBase: 500, maxHpBase: 0 }),
      hat: blankArmor('hat', { maxHpBase: 1000, maxMpBase: 0 }),
    })
    expect(bag.maxMp).toBe(500)
    expect(bag.maxHp).toBe(1000)
  })
})
