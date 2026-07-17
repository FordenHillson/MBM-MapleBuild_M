import { describe, expect, it } from 'vitest'
import { BONUS_POTENTIAL_BELT_OPTIONS } from './bonusPotentialBelt'
import { POTENTIAL_BELT_OPTIONS } from './potentialBelt'
import { bonusPotentialOptionsForSlot } from './bonusPotentialWeapon'
import {
  isPotentialSlot,
  potentialOptionsForSlot,
} from './potentialWeapon'

const RANKS = ['Rare', 'Epic', 'Unique', 'Legendary'] as const

describe('potential belt (Nexon 6451)', () => {
  it('wires belt as potential slot with distinct pools', () => {
    expect(isPotentialSlot('belt')).toBe(true)
    expect(potentialOptionsForSlot('belt')).toBe(POTENTIAL_BELT_OPTIONS)
    expect(bonusPotentialOptionsForSlot('belt')).toBe(
      BONUS_POTENTIAL_BELT_OPTIONS,
    )
  })

  it('main pot includes PHY/MAG ATK Increase and Item Drop', () => {
    expect(
      POTENTIAL_BELT_OPTIONS.find((o) => o.id === 'phyAtkPercent')?.firstByRank
        .Rare,
    ).toEqual([0.9, 0.84, 0.78, 0.72, 0.66, 0.6])
    expect(
      POTENTIAL_BELT_OPTIONS.find((o) => o.id === 'itemDropPercent')
        ?.firstByRank.Rare,
    ).toEqual([0.5, 0.4, 0.3])
  })

  it('bonus pot includes EXP Increase', () => {
    expect(
      BONUS_POTENTIAL_BELT_OPTIONS.find((o) => o.id === 'expGainPercent')
        ?.laterByRank.Rare,
    ).toEqual([0.1, 0.2])
  })

  it('has populated pools for available ranks', () => {
    for (const opts of [POTENTIAL_BELT_OPTIONS, BONUS_POTENTIAL_BELT_OPTIONS]) {
      expect(opts.length).toBeGreaterThanOrEqual(8)
      for (const opt of opts) {
        const anyFirst = RANKS.some((rank) => opt.firstByRank[rank].length > 0)
        const anyLater = RANKS.some((rank) => opt.laterByRank[rank].length > 0)
        expect(anyFirst).toBe(true)
        expect(anyLater).toBe(true)
        for (const rank of RANKS) {
          if (opt.firstByRank[rank].length > 0) {
            expect(opt.laterByRank[rank].length).toBeGreaterThan(0)
          }
        }
      }
    }
  })
})
