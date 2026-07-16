import { describe, expect, it } from 'vitest'
import { POTENTIAL_HAT_OPTIONS } from './potentialHat'
import { isPotentialSlot, potentialOptionsForSlot } from './potentialWeapon'

const RANKS = ['Rare', 'Epic', 'Unique', 'Legendary'] as const

describe('potential hat pools (Nexon 6439)', () => {
  it('wires hat as a potential slot with hat-specific option pools', () => {
    expect(isPotentialSlot('hat')).toBe(true)
    expect(potentialOptionsForSlot('hat')).toBe(POTENTIAL_HAT_OPTIONS)
  })

  it('encodes full Legendary first-line pools per the brief', () => {
    const phyAtk = POTENTIAL_HAT_OPTIONS.find((o) => o.id === 'phyAtkPercent')
    expect(phyAtk?.firstByRank.Legendary).toEqual([6.3, 6, 5.7, 5.4, 5.1, 4.8])

    const critDmgRes = POTENTIAL_HAT_OPTIONS.find((o) => o.id === 'critDmgRes')
    expect(critDmgRes?.firstByRank.Legendary).toEqual([
      2.5, 2.38, 2.26, 2.14, 2.02, 1.9,
    ])

    const evd = POTENTIAL_HAT_OPTIONS.find((o) => o.id === 'evd')
    expect(evd?.firstByRank.Legendary).toEqual([44, 41, 38, 35, 32])
    expect(evd?.isPercent).toBe(false)

    const maxHp = POTENTIAL_HAT_OPTIONS.find((o) => o.id === 'maxHp')
    expect(maxHp?.firstByRank.Legendary).toEqual([
      1218, 1160, 1102, 1044, 986, 928,
    ])
  })

  it('encodes full Rare first-line pools per the brief', () => {
    const phyAtk = POTENTIAL_HAT_OPTIONS.find((o) => o.id === 'phyAtkPercent')
    expect(phyAtk?.firstByRank.Rare).toEqual([0.9, 0.84, 0.78, 0.72, 0.66, 0.6])

    const evd = POTENTIAL_HAT_OPTIONS.find((o) => o.id === 'evd')
    expect(evd?.firstByRank.Rare).toEqual([6, 5, 4])

    const maxHp = POTENTIAL_HAT_OPTIONS.find((o) => o.id === 'maxHp')
    expect(maxHp?.firstByRank.Rare).toEqual([174, 162, 150, 138, 126, 116])
  })

  it('has no empty/placeholder pools for any option/rank/line', () => {
    expect(POTENTIAL_HAT_OPTIONS.length).toBeGreaterThanOrEqual(10)
    for (const opt of POTENTIAL_HAT_OPTIONS) {
      for (const rank of RANKS) {
        expect(opt.firstByRank[rank].length).toBeGreaterThan(0)
        expect(opt.laterByRank[rank].length).toBeGreaterThan(0)
      }
    }
  })

  it('later pools accumulate every lower-rank first-line value (cumulative pools)', () => {
    const maxHp = POTENTIAL_HAT_OPTIONS.find((o) => o.id === 'maxHp')!
    for (const v of maxHp.firstByRank.Rare) {
      expect(maxHp.laterByRank.Epic).toContain(v)
      expect(maxHp.laterByRank.Unique).toContain(v)
      expect(maxHp.laterByRank.Legendary).toContain(v)
    }
    for (const v of maxHp.firstByRank.Epic) {
      expect(maxHp.laterByRank.Unique).toContain(v)
      expect(maxHp.laterByRank.Legendary).toContain(v)
    }
    for (const v of maxHp.firstByRank.Unique) {
      expect(maxHp.laterByRank.Legendary).toContain(v)
    }
  })

  it('includes mesoGainPercent (main pot only, not bonus pot)', () => {
    const meso = POTENTIAL_HAT_OPTIONS.find((o) => o.id === 'mesoGainPercent')
    expect(meso?.firstByRank.Rare).toEqual([0.2])
  })
})
