import { describe, expect, it } from 'vitest'
import { isFlameSlot, flameOptionsForSlot } from './flameWeapon'
import { FLAME_GLOVES_OPTIONS } from './flameGloves'

describe('flameGloves', () => {
  it('enables flame on gloves with glove-only options', () => {
    expect(isFlameSlot('gloves')).toBe(true)
    expect(flameOptionsForSlot('gloves')).toBe(FLAME_GLOVES_OPTIONS)
    expect(flameOptionsForSlot('gloves').some((o) => o.id === 'critRateExp')).toBe(
      true,
    )
    expect(flameOptionsForSlot('gloves').some((o) => o.id === 'magDefExp')).toBe(
      false,
    )
  })

  it('ignoreDef only on Legendary/Mythic', () => {
    const opt = FLAME_GLOVES_OPTIONS.find((o) => o.id === 'ignoreDef')!
    expect(opt.valuesByRank.Rare).toEqual([])
    expect(opt.valuesByRank.Legendary).toEqual([1.5, 1.8, 2.1, 2.4])
    expect(opt.valuesByRank.Mythic).toEqual([2.8, 3.2, 3.6, 4.0])
  })
})
