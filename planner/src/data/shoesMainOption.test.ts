import { describe, expect, it } from 'vitest'
import {
  normalizeShoesMainOption,
  shoesMainOptionsForRank,
  supportsShoesMainOption,
} from './shoesMainOption'

describe('shoesMainOption', () => {
  it('supports main option on shoes for all ranks', () => {
    expect(supportsShoesMainOption('shoes', 'Necro')).toBe(true)
    expect(supportsShoesMainOption('shoes', 'Absolab')).toBe(true)
    expect(supportsShoesMainOption('shoes', 'Arcane')).toBe(true)
    expect(supportsShoesMainOption('shoes', 'Legendary')).toBe(true)
    expect(supportsShoesMainOption('hat', 'Absolab')).toBe(false)
  })

  it('Necro / Legendary get Crit ATK, EVD, HP recovery, EXP only', () => {
    expect(shoesMainOptionsForRank('Necro').map((o) => o.optionId)).toEqual([
      'critAtk',
      'evd',
      'hpRecovery',
      'expGainPercent',
    ])
    expect(shoesMainOptionsForRank('Legendary').map((o) => o.optionId)).toEqual(
      ['critAtk', 'evd', 'hpRecovery', 'expGainPercent'],
    )
  })

  it('Absolab and Arcane add Boss ATK %', () => {
    expect(shoesMainOptionsForRank('Absolab').map((o) => o.optionId)).toEqual([
      'critAtk',
      'evd',
      'hpRecovery',
      'expGainPercent',
      'bossAtkPercent',
    ])
    expect(shoesMainOptionsForRank('Arcane').map((o) => o.optionId)).toEqual([
      'critAtk',
      'evd',
      'hpRecovery',
      'expGainPercent',
      'bossAtkPercent',
    ])
  })

  it('normalizes shoes options and falls back when invalid for rank', () => {
    expect(
      normalizeShoesMainOption('shoes', 'Necro', {
        optionId: 'evd',
        label: 'x',
        value: 12,
      }),
    ).toEqual({
      optionId: 'evd',
      label: 'EVD',
      value: 12,
    })

    expect(
      normalizeShoesMainOption('shoes', 'Necro', {
        optionId: 'bossAtkPercent',
        label: 'Boss ATK Increase',
        value: 5,
      })?.optionId,
    ).toBe('critAtk')

    expect(
      normalizeShoesMainOption('hat', 'Absolab', {
        optionId: 'critAtk',
        label: 'Crit ATK',
        value: 1,
      }),
    ).toBeNull()
  })
})
