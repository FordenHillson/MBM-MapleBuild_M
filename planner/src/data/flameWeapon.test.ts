import { describe, expect, it } from 'vitest'
import {
  flameOptionsForSlot,
  isFlameSlot,
  normalizeFlameLines,
} from './flameWeapon'

describe('flameWeapon secondary', () => {
  it('treats secondary like main weapon', () => {
    expect(isFlameSlot('mainWeapon')).toBe(true)
    expect(isFlameSlot('secondary')).toBe(true)
    expect(isFlameSlot('hat')).toBe(false)
  })

  it('reuses weapon option pool including Final DMG', () => {
    const main = flameOptionsForSlot('mainWeapon')
    const secondary = flameOptionsForSlot('secondary')
    expect(secondary).toEqual(main)
    expect(secondary.some((o) => o.id === 'finalDmg')).toBe(true)
    expect(flameOptionsForSlot('hat')).toEqual([])
  })

  it('normalizes secondary flame lines to two slots', () => {
    const lines = normalizeFlameLines('secondary', 'Legendary', [
      { optionId: 'finalDmg', label: 'Final DMG Increase', value: 4 },
    ])
    expect(lines).toHaveLength(2)
    expect(lines[0]).toMatchObject({ optionId: 'finalDmg', value: 4 })
    expect(lines[1]?.optionId).toBe('')
  })
})
