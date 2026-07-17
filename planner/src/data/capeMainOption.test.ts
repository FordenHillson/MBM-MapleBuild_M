import { describe, expect, it } from 'vitest'
import {
  CAPE_MAIN_OPTIONS,
  normalizeCapeMainOption,
  supportsCapeMainOption,
} from './capeMainOption'

describe('capeMainOption', () => {
  it('supports main option on cape for all ranks', () => {
    expect(supportsCapeMainOption('cape', 'Necro')).toBe(true)
    expect(supportsCapeMainOption('cape', 'Absolab')).toBe(true)
    expect(supportsCapeMainOption('cape', 'Legendary')).toBe(true)
    expect(supportsCapeMainOption('hat', 'Absolab')).toBe(false)
  })

  it('offers EVD / EXP / Crit Rate / Meso', () => {
    expect(CAPE_MAIN_OPTIONS.map((o) => o.optionId)).toEqual([
      'evd',
      'expGainPercent',
      'critRate',
      'mesoGainPercent',
    ])
  })

  it('normalizes cape options', () => {
    expect(
      normalizeCapeMainOption('cape', 'Necro', {
        optionId: 'mesoGainPercent',
        label: 'x',
        value: 2,
      }),
    ).toEqual({
      optionId: 'mesoGainPercent',
      label: 'Meso ที่ได้รับ (%)',
      value: 2,
    })

    expect(
      normalizeCapeMainOption('cape', 'Necro', {
        optionId: 'bossAtkPercent',
        label: 'Boss ATK',
        value: 5,
      })?.optionId,
    ).toBe('evd')
  })
})
