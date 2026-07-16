import type { GearSlotId, ItemRank, StatLine } from '../types/build'
import { isWeaponMainOptionRank } from '../types/build'

export interface HighTierOptionDef {
  id: string
  label: string
  optionId: string
}

/** Selectable main options — Necro / Absolab / Arcane / Genesis weapon. */
export const WEAPON_HIGH_TIER_OPTIONS: HighTierOptionDef[] = [
  {
    id: 'bossAtk',
    label: 'Boss ATK Increase',
    optionId: 'bossAtkPercent',
  },
  {
    id: 'critRate',
    label: 'Crit Rate',
    optionId: 'critRate',
  },
  {
    id: 'critDmg',
    label: 'Crit DMG',
    optionId: 'critDmg',
  },
  {
    id: 'exp',
    label: 'EXP Increase',
    optionId: 'expGainPercent',
  },
]

export function supportsHighTierOption(
  slot: GearSlotId,
  rank: ItemRank,
): boolean {
  return slot === 'mainWeapon' && isWeaponMainOptionRank(rank)
}

export function highTierOptionById(id: string): HighTierOptionDef | undefined {
  return WEAPON_HIGH_TIER_OPTIONS.find((o) => o.id === id)
}

export function highTierOptionByOptionId(
  optionId: string,
): HighTierOptionDef | undefined {
  return WEAPON_HIGH_TIER_OPTIONS.find((o) => o.optionId === optionId)
}

export function emptyHighTierOption(
  optionId?: string,
  value = 0,
): StatLine {
  const def =
    (optionId
      ? highTierOptionByOptionId(optionId) ?? highTierOptionById(optionId)
      : undefined) ?? WEAPON_HIGH_TIER_OPTIONS[0]!
  return {
    optionId: def.optionId,
    label: def.label,
    value,
  }
}

export function normalizeHighTierOption(
  slot: GearSlotId,
  rank: ItemRank,
  option: StatLine | null | undefined,
): StatLine | null {
  if (!supportsHighTierOption(slot, rank)) return null
  if (!option?.optionId) {
    return emptyHighTierOption()
  }
  const def =
    highTierOptionByOptionId(option.optionId) ??
    highTierOptionById(option.optionId)
  if (!def) return emptyHighTierOption(undefined, Number(option.value) || 0)
  return {
    optionId: def.optionId,
    label: def.label,
    value: Number(option.value) || 0,
  }
}
