import { describe, expect, it } from 'vitest'
import { FLAME_CAPE_OPTIONS } from './flameCape'
import { flameOptionsForSlot, isFlameSlot } from './flameWeapon'

describe('flameCape', () => {
  it('enables flame on cape with cape-specific pool', () => {
    expect(isFlameSlot('cape')).toBe(true)
    expect(flameOptionsForSlot('cape')).toBe(FLAME_CAPE_OPTIONS)
  })

  it('has MAG DEF/ATK scales, Crit Rate scales, and ignoreDef on Legendary/Mythic', () => {
    expect(FLAME_CAPE_OPTIONS.some((o) => o.id === 'magDefMaxHp')).toBe(true)
    expect(FLAME_CAPE_OPTIONS.some((o) => o.id === 'magAtkBossAtk')).toBe(true)
    expect(FLAME_CAPE_OPTIONS.some((o) => o.id === 'critRateExp')).toBe(true)
    expect(FLAME_CAPE_OPTIONS.some((o) => o.id === 'phyDefMaxHp')).toBe(false)
    expect(FLAME_CAPE_OPTIONS.some((o) => o.id === 'phyAtkMaxHp')).toBe(false)

    const ignore = FLAME_CAPE_OPTIONS.find((o) => o.id === 'ignoreDef')!
    expect(ignore.valuesByRank.Rare).toEqual([])
    expect(ignore.valuesByRank.Legendary).toEqual([1.5, 1.8, 2.1, 2.4])
    expect(ignore.valuesByRank.Mythic).toEqual([2.8, 3.2, 3.6, 4.0])
  })
})
