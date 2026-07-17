import { describe, expect, it } from 'vitest'
import { BONUS_POTENTIAL_SHOULDER_OPTIONS } from './bonusPotentialShoulder'
import { POTENTIAL_SHOULDER_OPTIONS } from './potentialShoulder'
import { bonusPotentialOptionsForSlot } from './bonusPotentialWeapon'
import {
  isPotentialSlot,
  potentialOptionsForSlot,
} from './potentialWeapon'

const RANKS = ['Rare', 'Epic', 'Unique', 'Legendary'] as const

describe('potential shoulder (Nexon 6450)', () => {
  it('wires shoulder as potential slot with distinct pools', () => {
    expect(isPotentialSlot('shoulder')).toBe(true)
    expect(potentialOptionsForSlot('shoulder')).toBe(POTENTIAL_SHOULDER_OPTIONS)
    expect(bonusPotentialOptionsForSlot('shoulder')).toBe(
      BONUS_POTENTIAL_SHOULDER_OPTIONS,
    )
  })

  it('main pot includes flat PHY/MAG DEF and Boss DEF Increase', () => {
    expect(
      POTENTIAL_SHOULDER_OPTIONS.find((o) => o.id === 'phyDef')?.firstByRank
        .Rare,
    ).toEqual([90, 84, 78, 72, 66, 60])
    expect(
      POTENTIAL_SHOULDER_OPTIONS.find((o) => o.id === 'bossDefPercent')
        ?.firstByRank.Rare,
    ).toEqual([0.6, 0.56, 0.52, 0.48, 0.44, 0.4])
  })

  it('bonus pot includes EXP Increase and PHY/MAG DMG', () => {
    expect(
      BONUS_POTENTIAL_SHOULDER_OPTIONS.find((o) => o.id === 'expGainPercent')
        ?.firstByRank.Rare,
    ).toEqual([0.1, 0.2])
    expect(
      BONUS_POTENTIAL_SHOULDER_OPTIONS.find((o) => o.id === 'phyDmgPercent'),
    ).toBeTruthy()
  })

  it('has populated pools for available ranks', () => {
    for (const opts of [
      POTENTIAL_SHOULDER_OPTIONS,
      BONUS_POTENTIAL_SHOULDER_OPTIONS,
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
