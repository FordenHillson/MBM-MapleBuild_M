import { describe, expect, it } from 'vitest'
import {
  emptySharenianAbility,
  normalizeSharenianAbility,
  supportsSharenianAbility,
} from './sharenianAbility'

describe('sharenianAbility', () => {
  it('supports only secondary Unique+', () => {
    expect(supportsSharenianAbility('secondary', 'Unique')).toBe(true)
    expect(supportsSharenianAbility('secondary', 'Legendary')).toBe(true)
    expect(supportsSharenianAbility('secondary', 'Mythic')).toBe(true)
    expect(supportsSharenianAbility('secondary', 'Epic')).toBe(false)
    expect(supportsSharenianAbility('secondary', 'Rare')).toBe(false)
    expect(supportsSharenianAbility('mainWeapon', 'Unique')).toBe(false)
  })

  it('keeps two fixed lines and preserves values', () => {
    const empty = emptySharenianAbility()
    expect(empty).toHaveLength(2)
    expect(empty.map((l) => l.optionId)).toEqual([
      'finalPercent',
      'bossAtkPercent',
    ])

    const normalized = normalizeSharenianAbility('secondary', 'Legendary', [
      { optionId: 'bossAtkPercent', label: 'Boss ATK', value: 12 },
      { optionId: 'finalPercent', label: 'Final', value: 8.5 },
    ])
    expect(normalized).toEqual([
      { optionId: 'finalPercent', label: 'Final DMG Increase', value: 8.5 },
      { optionId: 'bossAtkPercent', label: 'Boss ATK Increase', value: 12 },
    ])

    expect(normalizeSharenianAbility('secondary', 'Epic', normalized)).toBeNull()
  })
})
