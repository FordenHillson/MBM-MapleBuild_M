import { describe, expect, it } from 'vitest'
import { FLAME_SHOES_OPTIONS } from './flameShoes'
import { flameOptionsForSlot, isFlameSlot } from './flameWeapon'

describe('flameShoes', () => {
  it('enables flame on shoes with shoes-specific pool', () => {
    expect(isFlameSlot('shoes')).toBe(true)
    expect(flameOptionsForSlot('shoes')).toBe(FLAME_SHOES_OPTIONS)
  })

  it('has PHY/MAG DEF scales, Crit DMG scales, and ignoreDef on Legendary/Mythic', () => {
    expect(FLAME_SHOES_OPTIONS.some((o) => o.id === 'phyDefMaxHp')).toBe(true)
    expect(FLAME_SHOES_OPTIONS.some((o) => o.id === 'magDefCritRate')).toBe(
      true,
    )
    expect(FLAME_SHOES_OPTIONS.some((o) => o.id === 'critDmgExp')).toBe(true)
    expect(FLAME_SHOES_OPTIONS.some((o) => o.id === 'phyAtkMaxHp')).toBe(false)
    expect(FLAME_SHOES_OPTIONS.some((o) => o.id === 'critRateExp')).toBe(false)

    const ignore = FLAME_SHOES_OPTIONS.find((o) => o.id === 'ignoreDef')!
    expect(ignore.valuesByRank.Rare).toEqual([])
    expect(ignore.valuesByRank.Legendary).toEqual([1.5, 1.8, 2.1, 2.4])
    expect(ignore.valuesByRank.Mythic).toEqual([2.8, 3.2, 3.6, 4.0])
  })
})
