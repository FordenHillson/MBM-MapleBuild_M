import { describe, expect, it } from 'vitest'
import { isFlameSlot, flameOptionsForSlot } from './flameWeapon'
import { FLAME_HAT_OPTIONS } from './flameHat'

describe('flameHat', () => {
  it('enables flame on hat with hat-only options', () => {
    expect(isFlameSlot('hat')).toBe(true)
    expect(flameOptionsForSlot('hat')).toBe(FLAME_HAT_OPTIONS)
    expect(flameOptionsForSlot('hat').some((o) => o.id === 'phyDefMaxHp')).toBe(true)
    expect(flameOptionsForSlot('hat').some((o) => o.id === 'phyAtkMaxHp')).toBe(false)
  })

  it('ignoreDef only on Legendary/Mythic', () => {
    const opt = FLAME_HAT_OPTIONS.find((o) => o.id === 'ignoreDef')!
    expect(opt.valuesByRank.Rare).toEqual([])
    expect(opt.valuesByRank.Legendary).toEqual([1.5, 1.8, 2.1, 2.4])
    expect(opt.valuesByRank.Mythic).toEqual([2.8, 3.2, 3.6, 4.0])
  })
})

