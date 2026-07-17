import { describe, expect, it } from 'vitest'
import {
  WEAPON_ICON_ENTRIES,
  WEAPON_ICON_STALE_AFTER_MS,
  formatWeaponIconHarvestDate,
  isWeaponIconCatalogStale,
  listWeaponIcons,
  listWeaponIconsForRank,
  weaponIconCatalogHarvestedAt,
} from './weaponIcons'

describe('weaponIcons catalog', () => {
  it('loads harvested weapon entries with icon URLs', () => {
    const list = listWeaponIcons()
    expect(list.length).toBeGreaterThan(0)
    expect(list).toBe(WEAPON_ICON_ENTRIES)
    expect(list[0]?.iconUrl).toMatch(
      /^https:\/\/open\.api\.nexon\.com\/static\/maplestorym\/asset\/icon\//,
    )
    expect(list[0]?.itemNameEn).toMatch(/^[A-Za-z0-9 \[\]().'-]+$/)
    expect(list.every((w) => !/[\uac00-\ud7a3]/.test(w.itemNameEn))).toBe(
      true,
    )
    expect(formatWeaponIconHarvestDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('filters weapon icons by gear rank line', () => {
    const genesis = listWeaponIconsForRank('Genesis')
    expect(genesis.length).toBeGreaterThan(0)
    expect(genesis.every((w) => w.itemNameEn.includes('Genesis'))).toBe(true)

    const arcane = listWeaponIconsForRank('Arcane')
    expect(arcane.length).toBeGreaterThan(0)
    expect(arcane.every((w) => w.itemNameEn.includes('Arcane Shade'))).toBe(
      true,
    )

    const absolab = listWeaponIconsForRank('Absolab')
    expect(absolab.length).toBeGreaterThan(0)
    expect(absolab.every((w) => w.itemNameEn.includes('Absolab'))).toBe(true)

    const root = listWeaponIconsForRank('Root Abyss')
    expect(root.length).toBeGreaterThan(0)
    expect(root.every((w) => w.itemNameEn.includes('Fafnir'))).toBe(true)

    expect(listWeaponIconsForRank('Legendary').length).toBe(
      listWeaponIcons().length,
    )
  })

  it('marks catalog stale at or after 30 days from harvest', () => {
    const harvested = weaponIconCatalogHarvestedAt.getTime()
    expect(isWeaponIconCatalogStale(harvested)).toBe(false)
    expect(
      isWeaponIconCatalogStale(harvested + WEAPON_ICON_STALE_AFTER_MS - 1),
    ).toBe(false)
    expect(
      isWeaponIconCatalogStale(harvested + WEAPON_ICON_STALE_AFTER_MS),
    ).toBe(true)
  })
})
