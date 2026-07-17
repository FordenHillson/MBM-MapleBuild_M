import { describe, expect, it } from 'vitest'
import {
  normalizeBeltMainOption,
  BELT_MAIN_OPTIONS,
  supportsBeltMainOption,
} from './beltMainOption'

describe('beltMainOption', () => {
  it('supports main option on belt for all ranks', () => {
    expect(supportsBeltMainOption('belt', 'Dreamy Belt')).toBe(true)
    expect(supportsBeltMainOption('belt', 'Necro')).toBe(true)
    expect(supportsBeltMainOption('belt', 'Absolab')).toBe(true)
    expect(supportsBeltMainOption('hat', 'Absolab')).toBe(false)
  })

  it('offers Crit Rate / EXP / Item Drop / ACC', () => {
    expect(BELT_MAIN_OPTIONS.map((o) => o.optionId)).toEqual([
      'critRate',
      'expGainPercent',
      'itemDropPercent',
      'accPercent',
    ])
  })

  it('normalizes belt options', () => {
    expect(
      normalizeBeltMainOption('belt', 'Dreamy Belt', {
        optionId: 'itemDropPercent',
        label: 'x',
        value: 3,
      }),
    ).toEqual({
      optionId: 'itemDropPercent',
      label: 'อัตราการดรอปไอเทมเพิ่มขึ้น',
      value: 3,
    })

    expect(
      normalizeBeltMainOption('belt', 'Necro', {
        optionId: 'bossAtkPercent',
        label: 'Boss ATK',
        value: 5,
      })?.optionId,
    ).toBe('critRate')
  })
})
