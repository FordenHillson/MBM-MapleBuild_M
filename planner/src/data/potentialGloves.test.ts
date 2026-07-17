import { describe, expect, it } from 'vitest'
import { POTENTIAL_GLOVES_OPTIONS } from './potentialGloves'
import { isPotentialSlot, potentialOptionsForSlot } from './potentialWeapon'

const RANKS = ['Rare', 'Epic', 'Unique', 'Legendary'] as const

describe('potential gloves pools (Nexon 6443)', () => {
  it('wires gloves as a potential slot with glove-specific option pools', () => {
    expect(isPotentialSlot('gloves')).toBe(true)
    expect(potentialOptionsForSlot('gloves')).toBe(POTENTIAL_GLOVES_OPTIONS)
  })

  it('uses PHY/MAG DMG Increase instead of ATK%', () => {
    const phyDmg = POTENTIAL_GLOVES_OPTIONS.find((o) => o.id === 'phyDmgPercent')
    expect(phyDmg?.firstByRank.Rare).toEqual([0.6, 0.56, 0.52, 0.48, 0.44, 0.4])
    expect(
      POTENTIAL_GLOVES_OPTIONS.find((o) => o.id === 'phyAtkPercent'),
    ).toBeUndefined()
  })

  it('includes itemDropPercent on main pot', () => {
    const drop = POTENTIAL_GLOVES_OPTIONS.find((o) => o.id === 'itemDropPercent')
    expect(drop?.firstByRank.Rare).toEqual([0.5, 0.4, 0.3])
  })

  it('has no empty pools for any option/rank/line', () => {
    expect(POTENTIAL_GLOVES_OPTIONS.length).toBeGreaterThanOrEqual(9)
    for (const opt of POTENTIAL_GLOVES_OPTIONS) {
      for (const rank of RANKS) {
        expect(opt.firstByRank[rank].length).toBeGreaterThan(0)
        expect(opt.laterByRank[rank].length).toBeGreaterThan(0)
      }
    }
  })
})
