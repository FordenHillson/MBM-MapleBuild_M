import { describe, expect, it } from 'vitest'
import { BONUS_POTENTIAL_CAPE_OPTIONS } from './bonusPotentialCape'
import { POTENTIAL_CAPE_OPTIONS } from './potentialCape'
import { bonusPotentialOptionsForSlot } from './bonusPotentialWeapon'
import {
  isPotentialSlot,
  potentialOptionsForSlot,
} from './potentialWeapon'

const RANKS = ['Rare', 'Epic', 'Unique', 'Legendary'] as const

describe('potential cape (Nexon 6452)', () => {
  it('wires cape as potential slot with distinct pools', () => {
    expect(isPotentialSlot('cape')).toBe(true)
    expect(potentialOptionsForSlot('cape')).toBe(POTENTIAL_CAPE_OPTIONS)
    expect(bonusPotentialOptionsForSlot('cape')).toBe(
      BONUS_POTENTIAL_CAPE_OPTIONS,
    )
  })

  it('main pot includes PHY/MAG DEF Increase and Meso Acquisition', () => {
    expect(
      POTENTIAL_CAPE_OPTIONS.find((o) => o.id === 'phyDefPercent')?.firstByRank
        .Rare,
    ).toEqual([0.6, 0.56, 0.52, 0.48, 0.44, 0.4])
    expect(
      POTENTIAL_CAPE_OPTIONS.find((o) => o.id === 'mesoGainPercent')
        ?.firstByRank.Rare,
    ).toEqual([0.2])
  })

  it('has populated pools for available ranks', () => {
    for (const opts of [POTENTIAL_CAPE_OPTIONS, BONUS_POTENTIAL_CAPE_OPTIONS]) {
      expect(opts.length).toBeGreaterThanOrEqual(7)
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
