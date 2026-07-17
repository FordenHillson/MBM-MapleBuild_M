import { describe, expect, it } from 'vitest'
import { FLAME_OUTFIT_BOTTOM_OPTIONS } from './flameOutfitBottom'
import { FLAME_OUTFIT_TOP_OPTIONS } from './flameOutfitTop'
import { flameOptionsForSlot, isFlameSlot } from './flameWeapon'

describe('flameOutfit', () => {
  it('enables flame on outfitTop/outfitBottom with distinct pools', () => {
    expect(isFlameSlot('outfitTop')).toBe(true)
    expect(isFlameSlot('outfitBottom')).toBe(true)
    expect(flameOptionsForSlot('outfitTop')).toBe(FLAME_OUTFIT_TOP_OPTIONS)
    expect(flameOptionsForSlot('outfitBottom')).toBe(
      FLAME_OUTFIT_BOTTOM_OPTIONS,
    )
  })

  it('Top has ignoreDef on Legendary/Mythic and PHY DEF scales', () => {
    const ignore = FLAME_OUTFIT_TOP_OPTIONS.find((o) => o.id === 'ignoreDef')!
    expect(ignore.valuesByRank.Rare).toEqual([])
    expect(ignore.valuesByRank.Legendary).toEqual([1.5, 1.8, 2.1, 2.4])
    expect(ignore.valuesByRank.Mythic).toEqual([2.8, 3.2, 3.6, 4.0])
    expect(
      FLAME_OUTFIT_TOP_OPTIONS.some((o) => o.id === 'phyDefMaxHp'),
    ).toBe(true)
    expect(
      FLAME_OUTFIT_TOP_OPTIONS.some((o) => o.id === 'magDefMaxHp'),
    ).toBe(false)
  })

  it('Bottom has MAG DEF scales and no ignoreDef', () => {
    expect(
      FLAME_OUTFIT_BOTTOM_OPTIONS.some((o) => o.id === 'magDefMaxHp'),
    ).toBe(true)
    expect(
      FLAME_OUTFIT_BOTTOM_OPTIONS.some((o) => o.id === 'ignoreDef'),
    ).toBe(false)
    expect(
      FLAME_OUTFIT_BOTTOM_OPTIONS.some((o) => o.id === 'phyAtkMaxHp'),
    ).toBe(true)
  })
})
