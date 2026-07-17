import { describe, expect, it } from 'vitest'
import {
  normalizeShoulderMainOption,
  shoulderMainOptionsForRank,
  supportsShoulderMainOption,
} from './shoulderMainOption'

describe('shoulderMainOption', () => {
  it('supports main option on shoulder for all ranks', () => {
    expect(supportsShoulderMainOption('shoulder', 'Necro')).toBe(true)
    expect(supportsShoulderMainOption('shoulder', 'Absolab')).toBe(true)
    expect(supportsShoulderMainOption('shoulder', 'Arcane')).toBe(true)
    expect(supportsShoulderMainOption('shoulder', 'Legendary')).toBe(true)
    expect(supportsShoulderMainOption('hat', 'Absolab')).toBe(false)
  })

  it('Necro / Legendary get HP/MP recovery, Crit ATK, EXP only', () => {
    expect(shoulderMainOptionsForRank('Necro').map((o) => o.optionId)).toEqual([
      'hpRecovery',
      'mpRecovery',
      'critAtk',
      'expGainPercent',
    ])
    expect(
      shoulderMainOptionsForRank('Legendary').map((o) => o.optionId),
    ).toEqual(['hpRecovery', 'mpRecovery', 'critAtk', 'expGainPercent'])
  })

  it('Absolab and Arcane add PHY DMG %', () => {
    expect(
      shoulderMainOptionsForRank('Absolab').map((o) => o.optionId),
    ).toEqual([
      'hpRecovery',
      'mpRecovery',
      'critAtk',
      'expGainPercent',
      'phyDmgPercent',
    ])
    expect(
      shoulderMainOptionsForRank('Arcane').map((o) => o.optionId),
    ).toEqual([
      'hpRecovery',
      'mpRecovery',
      'critAtk',
      'expGainPercent',
      'phyDmgPercent',
    ])
  })

  it('normalizes shoulder options and falls back when invalid for rank', () => {
    expect(
      normalizeShoulderMainOption('shoulder', 'Necro', {
        optionId: 'critAtk',
        label: 'x',
        value: 88,
      }),
    ).toEqual({
      optionId: 'critAtk',
      label: 'Crit ATK',
      value: 88,
    })

    expect(
      normalizeShoulderMainOption('shoulder', 'Necro', {
        optionId: 'phyDmgPercent',
        label: 'PHY DMG (%)',
        value: 5,
      })?.optionId,
    ).toBe('hpRecovery')

    expect(
      normalizeShoulderMainOption('hat', 'Absolab', {
        optionId: 'critAtk',
        label: 'Crit ATK',
        value: 1,
      }),
    ).toBeNull()
  })
})
