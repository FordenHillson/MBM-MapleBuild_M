import { describe, expect, it } from 'vitest'
import { FLAME_SHOULDER_OPTIONS } from './flameShoulder'
import { flameOptionsForSlot, isFlameSlot } from './flameWeapon'

describe('flameShoulder', () => {
  it('enables flame on shoulder with shoulder-specific pool', () => {
    expect(isFlameSlot('shoulder')).toBe(true)
    expect(flameOptionsForSlot('shoulder')).toBe(FLAME_SHOULDER_OPTIONS)
  })

  it('has PHY ATK/DEF scales, Crit Rate scales, and ignoreDef on Legendary/Mythic', () => {
    expect(
      FLAME_SHOULDER_OPTIONS.some((o) => o.id === 'phyAtkMaxHp'),
    ).toBe(true)
    expect(
      FLAME_SHOULDER_OPTIONS.some((o) => o.id === 'phyDefCritRate'),
    ).toBe(true)
    expect(
      FLAME_SHOULDER_OPTIONS.some((o) => o.id === 'critRateExp'),
    ).toBe(true)
    expect(
      FLAME_SHOULDER_OPTIONS.some((o) => o.id === 'magAtkMaxHp'),
    ).toBe(false)

    const ignore = FLAME_SHOULDER_OPTIONS.find((o) => o.id === 'ignoreDef')!
    expect(ignore.valuesByRank.Rare).toEqual([])
    expect(ignore.valuesByRank.Legendary).toEqual([1.5, 1.8, 2.1, 2.4])
    expect(ignore.valuesByRank.Mythic).toEqual([2.8, 3.2, 3.6, 4.0])
  })
})
