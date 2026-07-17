import { describe, expect, it } from 'vitest'
import type { GearSlotId } from '../types/build'
import {
  slotCategory,
  slotProfile,
  categoryProfile,
  type EquipCategory,
} from './equipCategory'
import { isFlameSlot } from './flameWeapon'
import { isPotentialSlot } from './potentialWeapon'

describe('equipCategory', () => {
  it('maps core slots to flat categories', () => {
    expect(slotCategory('mainWeapon')).toBe('weapon')
    expect(slotCategory('secondary')).toBe('secondary')
    expect(slotCategory('hat')).toBe('armor')
    expect(slotCategory('cape')).toBe('armor')
    expect(slotCategory('ring1')).toBe('accessory')
    expect(slotCategory('title')).toBe('misc')
  })

  it('places belt in accessory (not armor)', () => {
    expect(slotCategory('belt')).toBe('accessory')
    expect(slotProfile('belt').emblem.defaultBaseBoostPercent).toBe(0)
    expect(slotProfile('hat').emblem.defaultBaseBoostPercent).toBe(30)
  })

  it('weapon and secondary enable flame / pot / soul', () => {
    for (const slot of ['mainWeapon', 'secondary'] as GearSlotId[]) {
      const p = slotProfile(slot)
      expect(p.flame.enabled).toBe(true)
      expect(p.flame.lineCount).toBe(2)
      expect(p.potential.enabled).toBe(true)
      expect(p.soul.enabled).toBe(true)
      expect(p.mainLinesMode).toBe('flame')
    }
  })

  it('only weapon enables highTier; only secondary enables sharenian', () => {
    expect(slotProfile('mainWeapon').highTierOption.enabled).toBe(true)
    expect(slotProfile('mainWeapon').sharenianAbility.enabled).toBe(false)
    expect(slotProfile('secondary').highTierOption.enabled).toBe(false)
    expect(slotProfile('secondary').sharenianAbility.enabled).toBe(true)
  })

  it('armor/accessory free main lines; misc none', () => {
    expect(slotProfile('gloves').mainLinesMode).toBe('free')
    expect(slotProfile('earrings').mainLinesMode).toBe('free')
    expect(slotProfile('medal').mainLinesMode).toBe('none')
    expect(slotProfile('gloves').flame.enabled).toBe(false)
    expect(slotProfile('gloves').potential.enabled).toBe(false)
  })

  it('gloves slot override enables flame/pot without changing armor profile', () => {
    expect(isFlameSlot('gloves')).toBe(true)
    expect(isPotentialSlot('gloves')).toBe(true)
    expect(slotProfile('gloves').flame.enabled).toBe(false)
  })

  it('outfit Top/Bottom override enables flame/pot without changing armor profile', () => {
    expect(isFlameSlot('outfitTop')).toBe(true)
    expect(isFlameSlot('outfitBottom')).toBe(true)
    expect(isPotentialSlot('outfitTop')).toBe(true)
    expect(isPotentialSlot('outfitBottom')).toBe(true)
    expect(slotProfile('outfitTop').flame.enabled).toBe(false)
    expect(slotProfile('outfitBottom').potential.enabled).toBe(false)
  })

  it('shoulder override enables flame/pot without changing armor profile', () => {
    expect(isFlameSlot('shoulder')).toBe(true)
    expect(isPotentialSlot('shoulder')).toBe(true)
    expect(slotProfile('shoulder').flame.enabled).toBe(false)
    expect(slotProfile('shoulder').potential.enabled).toBe(false)
  })

  it('categoryProfile matches slotProfile for each category', () => {
    const cats: EquipCategory[] = [
      'weapon',
      'secondary',
      'armor',
      'accessory',
      'misc',
    ]
    for (const cat of cats) {
      expect(categoryProfile(cat).category).toBe(cat)
    }
  })
})
