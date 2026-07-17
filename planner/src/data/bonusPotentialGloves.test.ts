import { describe, expect, it } from 'vitest'
import { BONUS_POTENTIAL_GLOVES_OPTIONS } from './bonusPotentialGloves'
import { bonusPotentialOptionsForSlot } from './bonusPotentialWeapon'

const RANKS = ['Rare', 'Epic', 'Unique', 'Legendary'] as const

describe('bonus potential gloves pools (Nexon 6443)', () => {
  it('wires gloves bonus pot with glove-specific pools', () => {
    expect(bonusPotentialOptionsForSlot('gloves')).toBe(
      BONUS_POTENTIAL_GLOVES_OPTIONS,
    )
  })

  it('has EXP Increase with distinct bonus pot values', () => {
    const exp = BONUS_POTENTIAL_GLOVES_OPTIONS.find(
      (o) => o.id === 'expGainPercent',
    )
    expect(exp?.firstByRank.Rare).toEqual([0.1, 0.2])
    expect(exp?.firstByRank.Legendary).toEqual([1.3, 1.5, 1.7, 1.8])
  })

  it('does not include itemDropPercent on bonus pot', () => {
    expect(
      BONUS_POTENTIAL_GLOVES_OPTIONS.find((o) => o.id === 'itemDropPercent'),
    ).toBeUndefined()
  })

  it('has no empty pools for any option/rank/line', () => {
    expect(BONUS_POTENTIAL_GLOVES_OPTIONS.length).toBeGreaterThanOrEqual(8)
    for (const opt of BONUS_POTENTIAL_GLOVES_OPTIONS) {
      for (const rank of RANKS) {
        expect(opt.firstByRank[rank].length).toBeGreaterThan(0)
        expect(opt.laterByRank[rank].length).toBeGreaterThan(0)
      }
    }
  })
})
