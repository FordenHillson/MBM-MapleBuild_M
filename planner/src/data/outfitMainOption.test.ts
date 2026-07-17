import { describe, expect, it } from 'vitest'
import {
  normalizeOutfitMainOption,
  outfitMainOptionsForRank,
  supportsOutfitMainOption,
} from './outfitMainOption'

describe('outfitMainOption', () => {
  it('supports main option on outfit slots except Root Abyss', () => {
    expect(supportsOutfitMainOption('outfitTop', 'Necro')).toBe(true)
    expect(supportsOutfitMainOption('outfitTop', 'Absolab')).toBe(true)
    expect(supportsOutfitMainOption('outfitTop', 'Arcane')).toBe(true)
    expect(supportsOutfitMainOption('outfitTop', 'Root Abyss')).toBe(false)
    expect(supportsOutfitMainOption('outfitBottom', 'Root Abyss')).toBe(false)
    expect(supportsOutfitMainOption('hat', 'Absolab')).toBe(false)
  })

  it('Necro gets EVD / Crit ATK / MP recovery only', () => {
    const ids = outfitMainOptionsForRank('Necro').map((o) => o.optionId)
    expect(ids).toEqual(['evd', 'critAtk', 'mpRecovery'])
  })

  it('Absolab and Arcane add Boss ATK Increase', () => {
    expect(
      outfitMainOptionsForRank('Absolab').map((o) => o.optionId),
    ).toEqual(['evd', 'critAtk', 'mpRecovery', 'bossAtkPercent'])
    expect(
      outfitMainOptionsForRank('Arcane').map((o) => o.optionId),
    ).toEqual(['evd', 'critAtk', 'mpRecovery', 'bossAtkPercent'])
  })

  it('normalizes outfit options and clears Root Abyss', () => {
    expect(
      normalizeOutfitMainOption('outfitTop', 'Necro', {
        optionId: 'critAtk',
        label: 'x',
        value: 88,
      }),
    ).toEqual({
      optionId: 'critAtk',
      label: 'Crit ATK',
      value: 88,
    })

    expect(
      normalizeOutfitMainOption('outfitTop', 'Root Abyss', {
        optionId: 'evd',
        label: 'EVD',
        value: 10,
      }),
    ).toBeNull()

    expect(
      normalizeOutfitMainOption('outfitTop', 'Necro', {
        optionId: 'bossAtkPercent',
        label: 'Boss ATK Increase',
        value: 5,
      })?.optionId,
    ).toBe('evd')
  })
})
