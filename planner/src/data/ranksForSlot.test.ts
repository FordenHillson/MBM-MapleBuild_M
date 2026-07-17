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
