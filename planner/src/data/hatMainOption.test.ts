import { describe, expect, it } from 'vitest'
import { normalizeHatMainOption, supportsHatMainOption } from './hatMainOption'

describe('hatMainOption', () => {
  it('supports all hat ranks except Root Abyss', () => {
    expect(supportsHatMainOption('hat', 'Normal')).toBe(true)
    expect(supportsHatMainOption('hat', 'Legendary')).toBe(true)
    expect(supportsHatMainOption('hat', 'Absolab')).toBe(true)
    expect(supportsHatMainOption('hat', 'Root Abyss')).toBe(false)
    expect(supportsHatMainOption('mainWeapon', 'Absolab')).toBe(false)
  })

  it('normalizes to null for Root Abyss and creates default otherwise', () => {
    expect(
      normalizeHatMainOption('hat', 'Root Abyss', {
        optionId: 'critDmg',
        label: 'Crit DMG',
        value: 5,
      }),
    ).toBeNull()

    const created = normalizeHatMainOption('hat', 'Unique', null)
    expect(created?.optionId).toBe('critDmg')
    expect(created?.label).toBe('Crit DMG')
    expect(created?.value).toBe(0)
  })
})
