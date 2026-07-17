import catalog from './weaponIcons.json'
import type { ItemRank } from '../../types/build'
import {
  translateWeaponItemNameKo,
  translateWeaponTypeKo,
} from './weaponIconI18n'

export interface WeaponIconEntry {
  itemName: string
  /** English display name (translated from Korean API name). */
  itemNameEn: string
  iconUrl: string
  grade: string
  weaponType: string
  weaponTypeEn: string
  slotName: string
  sampleClass: string
}

export interface WeaponIconCatalog {
  source: string
  game: string
  harvestedAt: string
  rankingDate: string
  charactersInspected: number
  uniqueWeapons: number
  errors: string[]
  weapons: Array<{
    itemName: string
    iconUrl: string
    grade: string
    weaponType: string
    slotName: string
    sampleClass: string
  }>
}

const data = catalog as WeaponIconCatalog

/** Nexon Open API NOTICE: refresh pulled data at least every 30 days. */
export const WEAPON_ICON_STALE_AFTER_MS = 30 * 24 * 60 * 60 * 1000

/** Rank → English name prefix shown in the weapon icon picker. */
export const WEAPON_ICON_RANK_NAME_PREFIX: Partial<Record<ItemRank, string>> = {
  Genesis: 'Genesis',
  Arcane: 'Arcane Shade',
  Absolab: 'Absolab',
  'Root Abyss': 'Fafnir',
}

function enrich(entry: WeaponIconCatalog['weapons'][number]): WeaponIconEntry {
  return {
    ...entry,
    itemNameEn: translateWeaponItemNameKo(entry.itemName),
    weaponTypeEn: translateWeaponTypeKo(entry.weaponType),
  }
}

export const WEAPON_ICON_ENTRIES: readonly WeaponIconEntry[] =
  data.weapons.map(enrich)

export const weaponIconCatalogHarvestedAt = new Date(data.harvestedAt)

export function listWeaponIcons(): readonly WeaponIconEntry[] {
  return WEAPON_ICON_ENTRIES
}

export function weaponIconNamePrefixForRank(rank: ItemRank): string | null {
  return WEAPON_ICON_RANK_NAME_PREFIX[rank] ?? null
}

/** Filter catalog by gear rank line (Genesis / Arcane Shade / Absolab / Fafnir). */
export function listWeaponIconsForRank(
  rank: ItemRank,
): readonly WeaponIconEntry[] {
  const prefix = weaponIconNamePrefixForRank(rank)
  if (!prefix) return WEAPON_ICON_ENTRIES
  const needle = prefix.toLowerCase()
  return WEAPON_ICON_ENTRIES.filter((w) =>
    w.itemNameEn.toLowerCase().includes(needle),
  )
}

export function isWeaponIconCatalogStale(now: number = Date.now()): boolean {
  const harvested = weaponIconCatalogHarvestedAt.getTime()
  if (Number.isNaN(harvested)) return true
  return now - harvested >= WEAPON_ICON_STALE_AFTER_MS
}

export function formatWeaponIconHarvestDate(): string {
  if (Number.isNaN(weaponIconCatalogHarvestedAt.getTime())) return '—'
  return weaponIconCatalogHarvestedAt.toISOString().slice(0, 10)
}
