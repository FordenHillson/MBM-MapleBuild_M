import { describe, expect, it } from 'vitest'
import { ranksForSlot } from '../types/build'

describe('ranksForSlot hat', () => {
  it('excludes Genesis but keeps Absolab/Arcane/Necro and Root Abyss', () => {
    const ranks = ranksForSlot('hat')
    expect(ranks).not.toContain('Genesis')
    expect(ranks).toContain('Absolab')
    expect(ranks).toContain('Arcane')
    expect(ranks).toContain('Necro')
    expect(ranks).toContain('Root Abyss')
    expect(ranks).toContain('Legendary')
  })

  it('mainWeapon still includes Genesis', () => {
    expect(ranksForSlot('mainWeapon')).toContain('Genesis')
  })
})

describe('ranksForSlot gloves', () => {
  it('excludes Genesis and Root Abyss but keeps Absolab/Arcane/Necro', () => {
    const ranks = ranksForSlot('gloves')
    expect(ranks).not.toContain('Genesis')
    expect(ranks).not.toContain('Root Abyss')
    expect(ranks).toContain('Absolab')
    expect(ranks).toContain('Arcane')
    expect(ranks).toContain('Necro')
    expect(ranks).toContain('Legendary')
  })
})

describe('ranksForSlot outfit', () => {
  it('outfitTop excludes Genesis and keeps Root Abyss / Necro / Absolab / Arcane', () => {
    const ranks = ranksForSlot('outfitTop')
    expect(ranks).not.toContain('Genesis')
    expect(ranks).toContain('Root Abyss')
    expect(ranks).toContain('Necro')
    expect(ranks).toContain('Absolab')
    expect(ranks).toContain('Arcane')
    expect(ranks).toContain('Legendary')
  })

  it('outfitBottom is Root Abyss only for now', () => {
    expect(ranksForSlot('outfitBottom')).toEqual(['Root Abyss'])
  })
})

describe('ranksForSlot shoulder', () => {
  it('excludes Genesis and Root Abyss but keeps Absolab/Arcane/Necro', () => {
    const ranks = ranksForSlot('shoulder')
    expect(ranks).not.toContain('Genesis')
    expect(ranks).not.toContain('Root Abyss')
    expect(ranks).toContain('Absolab')
    expect(ranks).toContain('Arcane')
    expect(ranks).toContain('Necro')
    expect(ranks).toContain('Legendary')
  })
})

describe('ranksForSlot shoes', () => {
  it('excludes Genesis and Root Abyss but keeps Absolab/Arcane/Necro', () => {
    const ranks = ranksForSlot('shoes')
    expect(ranks).not.toContain('Genesis')
    expect(ranks).not.toContain('Root Abyss')
    expect(ranks).toContain('Absolab')
    expect(ranks).toContain('Arcane')
    expect(ranks).toContain('Necro')
    expect(ranks).toContain('Legendary')
  })
})

describe('ranksForSlot cape', () => {
  it('excludes Genesis and Root Abyss but keeps Absolab/Arcane/Necro', () => {
    const ranks = ranksForSlot('cape')
    expect(ranks).not.toContain('Genesis')
    expect(ranks).not.toContain('Root Abyss')
    expect(ranks).toContain('Absolab')
    expect(ranks).toContain('Arcane')
    expect(ranks).toContain('Necro')
    expect(ranks).toContain('Legendary')
  })
})

describe('ranksForSlot belt', () => {
  it('puts Dreamy Belt first; keeps Necro; excludes Absolab/Arcane/Genesis/Root Abyss', () => {
    const ranks = ranksForSlot('belt')
    expect(ranks[0]).toBe('Dreamy Belt')
    expect(ranks).toContain('Necro')
    expect(ranks).toContain('Legendary')
    expect(ranks).not.toContain('Absolab')
    expect(ranks).not.toContain('Arcane')
    expect(ranks).not.toContain('Genesis')
    expect(ranks).not.toContain('Root Abyss')
  })
})
