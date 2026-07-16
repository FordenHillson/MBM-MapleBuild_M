import { describe, expect, it } from 'vitest'
import { BONUS_POTENTIAL_HAT_OPTIONS } from './bonusPotentialHat'
import { bonusPotentialOptionsForSlot } from './bonusPotentialWeapon'

const RANKS = ['Rare', 'Epic', 'Unique', 'Legendary'] as const

describe('bonus potential hat pools (Nexon 6439)', () => {
  it('wires hat as a bonus potential slot with hat-specific option pools', () => {
    expect(bonusPotentialOptionsForSlot('hat')).toBe(BONUS_POTENTIAL_HAT_OPTIONS)
  })

  it('has EXP Increase option with distinct value pools from main Pot', () => {
    const exp = BONUS_POTENTIAL_HAT_OPTIONS.find((o) => o.id === 'expGainPercent')
    expect(exp).toBeDefined()
    expect(exp?.firstByRank.Rare).toEqual([0.1, 0.2])
    expect(exp?.firstByRank.Legendary).toEqual([1.3, 1.5, 1.7, 1.8])
  })

  it('does not roll mesoGainPercent on Bonus Potential', () => {
    expect(
      BONUS_POTENTIAL_HAT_OPTIONS.find((o) => o.id === 'mesoGainPercent'),
    ).toBeUndefined()
  })

  it('has no empty/placeholder pools for any option/rank/line', () => {
    expect(BONUS_POTENTIAL_HAT_OPTIONS.length).toBeGreaterThanOrEqual(10)
    for (const opt of BONUS_POTENTIAL_HAT_OPTIONS) {
      for (const rank of RANKS) {
        expect(opt.firstByRank[rank].length).toBeGreaterThan(0)
        expect(opt.laterByRank[rank].length).toBeGreaterThan(0)
      }
    }
  })

  it('later pools accumulate lower-rank first-line values (cumulative pools)', () => {
    const maxHp = BONUS_POTENTIAL_HAT_OPTIONS.find((o) => o.id === 'maxHp')!
    for (const v of maxHp.firstByRank.Rare) {
      expect(maxHp.laterByRank.Legendary).toContain(v)
    }
  })
})
