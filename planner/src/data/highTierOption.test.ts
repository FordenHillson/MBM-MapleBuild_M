import { describe, expect, it } from 'vitest'
import {
  normalizeHighTierOption,
  supportsHighTierOption,
} from './highTierOption'

describe('highTierOption', () => {
  it('supports only main weapon high-tier ranks', () => {
    expect(supportsHighTierOption('mainWeapon', 'Genesis')).toBe(true)
    expect(supportsHighTierOption('mainWeapon', 'Necro')).toBe(true)
    expect(supportsHighTierOption('mainWeapon', 'Chaos')).toBe(false)
    expect(supportsHighTierOption('hat', 'Absolab')).toBe(false)
  })

  it('defaults and preserves user value', () => {
    const created = normalizeHighTierOption('mainWeapon', 'Arcane', null)
    expect(created?.optionId).toBe('bossAtkPercent')
    expect(created?.value).toBe(0)

    const kept = normalizeHighTierOption('mainWeapon', 'Genesis', {
      optionId: 'critDmg',
      label: 'Crit DMG',
      value: 146,
    })
    expect(kept).toMatchObject({
      optionId: 'critDmg',
      label: 'Crit DMG',
      value: 146,
    })

    expect(normalizeHighTierOption('mainWeapon', 'Chaos', kept)).toBeNull()
  })
})
