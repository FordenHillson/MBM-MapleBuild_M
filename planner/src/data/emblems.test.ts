import { describe, expect, it } from 'vitest'
import {
  buildEmblemLines,
  emblemById,
  emblemEffectValue,
  emblemMaxDamageValue,
  emblemsForSlot,
  normalizeEmblem,
} from './emblems'

describe('emblems catalog', () => {
  it('filters by weapon slot and has icons', () => {
    const list = emblemsForSlot('mainWeapon')
    expect(list.length).toBe(5)
    expect(list.every((e) => e.icon.startsWith('https://'))).toBe(true)
  })

  it('normalizes effect + maxDamage lines', () => {
    const next = normalizeEmblem('mainWeapon', {
      typeId: 'ruthless',
      name: 'Ruthless Emblem',
      level: 3,
      baseOptionBoostPercent: 30,
      lines: [
        { optionId: 'critDmg', label: 'Crit DMG', value: 7.5 },
        { optionId: 'maxDamage', label: 'DMG สูงสุด', value: 1_000_000 },
      ],
    })
    expect(next?.lines).toHaveLength(2)
    expect(emblemEffectValue(next!)).toBe(7.5)
    expect(emblemMaxDamageValue(next!)).toBe(1_000_000)
  })

  it('buildEmblemLines keeps both stats', () => {
    const def = emblemById('domination')!
    const lines = buildEmblemLines(def, 12, 500000)
    expect(lines[0]).toMatchObject({
      optionId: 'bossAtkPercent',
      value: 12,
    })
    expect(lines[1]).toMatchObject({ optionId: 'maxDamage', value: 500000 })
  })
})
