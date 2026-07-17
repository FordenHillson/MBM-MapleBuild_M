import { describe, expect, it } from 'vitest'
import { BONUS_POTENTIAL_SHOES_OPTIONS } from './bonusPotentialShoes'
import { POTENTIAL_SHOES_OPTIONS } from './potentialShoes'
import { bonusPotentialOptionsForSlot } from './bonusPotentialWeapon'
import {
  isPotentialSlot,
  potentialOptionsForSlot,
} from './potentialWeapon'

const RANKS = ['Rare', 'Epic', 'Unique', 'Legendary'] as const

describe('potential shoes (Nexon 6444)', () => {
  it('wires shoes as potential slot with distinct pools', () => {
    expect(isPotentialSlot('shoes')).toBe(true)
    expect(potentialOptionsForSlot('shoes')).toBe(POTENTIAL_SHOES_OPTIONS)
    expect(bonusPotentialOptionsForSlot('shoes')).toBe(
      BONUS_POTENTIAL_SHOES_OPTIONS,
    )
  })

  it('main pot includes flat PHY/MAG DEF and SPD Increase', () => {
    expect(
      POTENTIAL_SHOES_OPTIONS.find((o) => o.id === 'phyDef')?.firstByRank.Rare,
    ).toEqual([90, 84, 78, 72, 66, 60])
    expect(
      POTENTIAL_SHOES_OPTIONS.find((o) => o.id === 'spdPercent')?.firstByRank
        .Rare,
    ).toEqual([1.2, 1.08, 0.96, 0.84, 0.72, 0.6])
  })

  it('bonus pot includes EXP Increase and flat Max MP', () => {
    expect(
      BONUS_POTENTIAL_SHOES_OPTIONS.find((o) => o.id === 'expGainPercent')
        ?.firstByRank.Rare,
    ).toEqual([0.1, 0.2])
    expect(
      BONUS_POTENTIAL_SHOES_OPTIONS.find((o) => o.id === 'maxMp'),
    ).toBeTruthy()
  })

  it('has populated pools for available ranks', () => {
    for (const opts of [
      POTENTIAL_SHOES_OPTIONS,
      BONUS_POTENTIAL_SHOES_OPTIONS,
    ]) {
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
