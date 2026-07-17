import { describe, expect, it } from 'vitest'
import { BONUS_POTENTIAL_OUTFIT_BOTTOM_OPTIONS } from './bonusPotentialOutfitBottom'
import { BONUS_POTENTIAL_OUTFIT_TOP_OPTIONS } from './bonusPotentialOutfitTop'
import { POTENTIAL_OUTFIT_BOTTOM_OPTIONS } from './potentialOutfitBottom'
import { POTENTIAL_OUTFIT_TOP_OPTIONS } from './potentialOutfitTop'
import {
  bonusPotentialOptionsForSlot,
} from './bonusPotentialWeapon'
import {
  isPotentialSlot,
  potentialOptionsForSlot,
} from './potentialWeapon'

const RANKS = ['Rare', 'Epic', 'Unique', 'Legendary'] as const

describe('potential outfit Top/Bottom (Nexon 6441/6442)', () => {
  it('wires outfitTop/outfitBottom as potential slots with distinct pools', () => {
    expect(isPotentialSlot('outfitTop')).toBe(true)
    expect(isPotentialSlot('outfitBottom')).toBe(true)
    expect(potentialOptionsForSlot('outfitTop')).toBe(
      POTENTIAL_OUTFIT_TOP_OPTIONS,
    )
    expect(potentialOptionsForSlot('outfitBottom')).toBe(
      POTENTIAL_OUTFIT_BOTTOM_OPTIONS,
    )
    expect(bonusPotentialOptionsForSlot('outfitTop')).toBe(
      BONUS_POTENTIAL_OUTFIT_TOP_OPTIONS,
    )
    expect(bonusPotentialOptionsForSlot('outfitBottom')).toBe(
      BONUS_POTENTIAL_OUTFIT_BOTTOM_OPTIONS,
    )
  })

  it('Top main pot includes PHY/MAG DEF Increase and Crit DMG RES', () => {
    expect(
      POTENTIAL_OUTFIT_TOP_OPTIONS.find((o) => o.id === 'phyDefPercent')
        ?.firstByRank.Rare,
    ).toEqual([0.6, 0.56, 0.52, 0.48, 0.44, 0.4])
    expect(
      POTENTIAL_OUTFIT_TOP_OPTIONS.find((o) => o.id === 'critDmgRes'),
    ).toBeTruthy()
  })

  it('Bottom main pot includes PHY/MAG DEF Increase', () => {
    expect(
      POTENTIAL_OUTFIT_BOTTOM_OPTIONS.find((o) => o.id === 'magDefPercent')
        ?.firstByRank.Rare,
    ).toEqual([0.6, 0.56, 0.52, 0.48, 0.44, 0.4])
  })

  it('bonus pot includes EXP Increase', () => {
    expect(
      BONUS_POTENTIAL_OUTFIT_TOP_OPTIONS.find((o) => o.id === 'expGainPercent')
        ?.firstByRank.Rare,
    ).toEqual([0.1, 0.2])
    expect(
      BONUS_POTENTIAL_OUTFIT_BOTTOM_OPTIONS.find(
        (o) => o.id === 'expGainPercent',
      )?.firstByRank.Rare,
    ).toEqual([0.1, 0.2])
  })

  it('has populated pools for available ranks (PHY/MAG ATK are Legendary-only)', () => {
    for (const opts of [
      POTENTIAL_OUTFIT_TOP_OPTIONS,
      POTENTIAL_OUTFIT_BOTTOM_OPTIONS,
      BONUS_POTENTIAL_OUTFIT_TOP_OPTIONS,
      BONUS_POTENTIAL_OUTFIT_BOTTOM_OPTIONS,
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
