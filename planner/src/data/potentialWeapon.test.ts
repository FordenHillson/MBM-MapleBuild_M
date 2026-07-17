import { describe, expect, it } from 'vitest'
import {
  emptyBonusPotentialLines,
  normalizeBonusPotentialLines,
  bonusPotentialOptionsAvailable,
  bonusPotentialOptionsForSlot,
} from './bonusPotentialWeapon'
import {
  emptyPotentialLines,
  isPotentialSlot,
  normalizePotentialLines,
  potentialOptionsAvailable,
  potentialOptionsForSlot,
} from './potentialWeapon'

describe('potential / bonus on secondary', () => {
  it('treats secondary as a potential slot', () => {
    expect(isPotentialSlot('secondary')).toBe(true)
    expect(potentialOptionsForSlot('secondary').length).toBeGreaterThan(0)
    expect(bonusPotentialOptionsForSlot('secondary').length).toBeGreaterThan(0)
    expect(potentialOptionsForSlot('secondary')).toEqual(
      potentialOptionsForSlot('mainWeapon'),
    )
    expect(bonusPotentialOptionsForSlot('secondary')).toEqual(
      bonusPotentialOptionsForSlot('mainWeapon'),
    )
  })

  it('keeps 3-line pools for secondary potential', () => {
    expect(emptyPotentialLines()).toHaveLength(3)
    for (const lineIndex of [0, 1, 2]) {
      expect(
        potentialOptionsAvailable('secondary', 'Legendary', lineIndex).length,
      ).toBeGreaterThan(0)
    }

    const lines = normalizePotentialLines('secondary', 'Legendary', [
      { optionId: 'critDmg', label: 'Crit DMG', value: 9.5 },
    ])
    expect(lines).toHaveLength(3)
    expect(lines[0]?.optionId).toBe('critDmg')
  })

  it('keeps 3-line pools for secondary bonus potential', () => {
    expect(emptyBonusPotentialLines()).toHaveLength(3)
    for (const lineIndex of [0, 1, 2]) {
      expect(
        bonusPotentialOptionsAvailable('secondary', 'Epic', lineIndex).length,
      ).toBeGreaterThan(0)
    }

    const lines = normalizeBonusPotentialLines('secondary', 'Epic', [
      { optionId: 'critDmg', label: 'Crit DMG', value: 2.3 },
    ])
    expect(lines).toHaveLength(3)
    expect(lines[0]?.optionId).toBe('critDmg')
  })
})

describe('potential / bonus on hat', () => {
  it('treats hat as a potential slot with its own hat-specific pools', () => {
    expect(isPotentialSlot('hat')).toBe(true)
    expect(potentialOptionsForSlot('hat').length).toBeGreaterThan(0)
    expect(bonusPotentialOptionsForSlot('hat').length).toBeGreaterThan(0)
    expect(potentialOptionsForSlot('hat')).not.toEqual(
      potentialOptionsForSlot('mainWeapon'),
    )
  })

})

describe('potential / bonus on gloves', () => {
  it('treats gloves as a potential slot with its own glove-specific pools', () => {
    expect(isPotentialSlot('gloves')).toBe(true)
    expect(potentialOptionsForSlot('gloves').length).toBeGreaterThan(0)
    expect(bonusPotentialOptionsForSlot('gloves').length).toBeGreaterThan(0)
    expect(potentialOptionsForSlot('gloves')).not.toEqual(
      potentialOptionsForSlot('mainWeapon'),
    )
    expect(potentialOptionsForSlot('gloves')).not.toEqual(
      potentialOptionsForSlot('hat'),
    )
  })

  it('does not treat other armor slots as potential slots', () => {
    expect(isPotentialSlot('outfitTop')).toBe(false)
    expect(potentialOptionsForSlot('outfitTop')).toEqual([])
    expect(bonusPotentialOptionsForSlot('outfitTop')).toEqual([])
  })
})
