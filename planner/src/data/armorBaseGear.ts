import type { GearSlotId, ItemRank, StatLine } from '../types/build'
import type { HighTierOptionDef } from './highTierOption'
import {
  emptyHatMainOption,
  HAT_MAIN_OPTIONS,
  normalizeHatMainOption,
  supportsHatMainOption,
} from './hatMainOption'
import {
  emptyGloveMainOption,
  GLOVE_MAIN_OPTIONS,
  normalizeGloveMainOption,
  supportsGloveMainOption,
} from './gloveMainOption'
import {
  emptyOutfitMainOption,
  normalizeOutfitMainOption,
  outfitMainOptionsForRank,
  supportsOutfitMainOption,
} from './outfitMainOption'

export type ArmorBaseGearSlot = 'hat' | 'gloves' | 'outfitTop' | 'outfitBottom'

export function isArmorBaseGearSlot(
  slot: GearSlotId,
): slot is ArmorBaseGearSlot {
  return (
    slot === 'hat' ||
    slot === 'gloves' ||
    slot === 'outfitTop' ||
    slot === 'outfitBottom'
  )
}

export function armorMainOptionOptions(
  slot: ArmorBaseGearSlot,
  rank: ItemRank = 'Absolab',
): HighTierOptionDef[] {
  if (slot === 'hat') return HAT_MAIN_OPTIONS
  if (slot === 'gloves') return GLOVE_MAIN_OPTIONS
  return outfitMainOptionsForRank(rank)
}

export function supportsArmorMainOption(
  slot: GearSlotId,
  rank: ItemRank,
): boolean {
  if (slot === 'hat') return supportsHatMainOption(slot, rank)
  if (slot === 'gloves') return supportsGloveMainOption(slot, rank)
  if (slot === 'outfitTop' || slot === 'outfitBottom') {
    return supportsOutfitMainOption(slot, rank)
  }
  return false
}

export function emptyArmorMainOption(
  slot: ArmorBaseGearSlot,
  optionId?: string,
  value = 0,
  rank: ItemRank = 'Absolab',
): StatLine {
  if (slot === 'hat') return emptyHatMainOption(optionId, value)
  if (slot === 'gloves') return emptyGloveMainOption(optionId, value)
  return emptyOutfitMainOption(rank, optionId, value)
}

export function normalizeArmorMainOption(
  slot: GearSlotId,
  rank: ItemRank,
  option: StatLine | null | undefined,
): StatLine | null {
  if (slot === 'hat') return normalizeHatMainOption(slot, rank, option)
  if (slot === 'gloves') return normalizeGloveMainOption(slot, rank, option)
  if (slot === 'outfitTop' || slot === 'outfitBottom') {
    return normalizeOutfitMainOption(slot, rank, option)
  }
  return null
}

/** Hat/gloves/outfit sync PHY and MAG DEF base in-game. */
export function syncArmorDefBases(phyDefBase: number): number {
  return phyDefBase
}
