import { describe, expect, it } from 'vitest'
import { FLAME_BELT_OPTIONS } from './flameBelt'
import { flameOptionsForSlot, isFlameSlot } from './flameWeapon'

describe('flameBelt', () => {
  it('enables flame on belt with belt-specific pool', () => {
    expect(isFlameSlot('belt')).toBe(true)
    expect(flameOptionsForSlot('belt')).toBe(FLAME_BELT_OPTIONS)
  })

  it('has MAG/PHY DEF scales, Crit Rate scales, and ignoreDef on Legendary/Mythic', () => {
    expect(FLAME_BELT_OPTIONS.some((o) => o.id === 'magDefMaxHp')).toBe(true)
    expect(FLAME_BELT_OPTIONS.some((o) => o.id === 'phyDefCritRate')).toBe(true)
    expect(FLAME_BELT_OPTIONS.some((o) => o.id === 'critRateExp')).toBe(true)
    expect(FLAME_BELT_OPTIONS.some((o) => o.id === 'phyAtkMaxHp')).toBe(false)
    expect(FLAME_BELT_OPTIONS.some((o) => o.id === 'phyDefExp')).toBe(false)

    const ignore = FLAME_BELT_OPTIONS.find((o) => o.id === 'ignoreDef')!
    expect(ignore.valuesByRank.Rare).toEqual([])
    expect(ignore.valuesByRank.Legendary).toEqual([1.5, 1.8, 2.1, 2.4])
    expect(ignore.valuesByRank.Mythic).toEqual([2.8, 3.2, 3.6, 4.0])
  })
})
