import { describe, expect, it } from 'vitest'
import { normalizeGloveMainOption, supportsGloveMainOption } from './gloveMainOption'

describe('gloveMainOption', () => {
  it('supports main option on gloves at any available rank', () => {
    expect(supportsGloveMainOption('gloves', 'Normal')).toBe(true)
    expect(supportsGloveMainOption('gloves', 'Absolab')).toBe(true)
    expect(supportsGloveMainOption('gloves', 'Legendary')).toBe(true)
    expect(supportsGloveMainOption('hat', 'Absolab')).toBe(false)
  })

  it('normalizes crit atk / crit dmg / acc / exp options', () => {
    expect(
      normalizeGloveMainOption('gloves', 'Absolab', {
        optionId: 'critAtk',
        label: 'x',
        value: 120,
      }),
    ).toEqual({
      optionId: 'critAtk',
      label: 'Crit ATK',
      value: 120,
    })

    expect(
      normalizeGloveMainOption('gloves', 'Absolab', {
        optionId: 'accPercent',
        label: 'x',
        value: 2.5,
      })?.optionId,
    ).toBe('accPercent')
  })
})
