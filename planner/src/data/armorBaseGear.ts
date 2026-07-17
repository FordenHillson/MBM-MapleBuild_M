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
import {
  emptyShoulderMainOption,
  normalizeShoulderMainOption,
  shoulderMainOptionsForRank,
  supportsShoulderMainOption,
} from './shoulderMainOption'
import {
  emptyShoesMainOption,
  normalizeShoesMainOption,
  shoesMainOptionsForRank,
  supportsShoesMainOption,
} from './shoesMainOption'
import {
  BELT_MAIN_OPTIONS,
  emptyBeltMainOption,
  normalizeBeltMainOption,
  supportsBeltMainOption,
} from './beltMainOption'
import {
  CAPE_MAIN_OPTIONS,
  emptyCapeMainOption,
  normalizeCapeMainOption,
  supportsCapeMainOption,
} from './capeMainOption'

export type ArmorBaseGearSlot =
  | 'hat'
  | 'gloves'
  | 'outfitTop'
  | 'outfitBottom'
  | 'shoulder'
  | 'shoes'
  | 'belt'
  | 'cape'

/** Shoulder / Belt / Cape use Max MP base instead of Max HP. */
export function usesArmorMpBase(slot: GearSlotId): boolean {
  return slot === 'shoulder' || slot === 'belt' || slot === 'cape'
}

export function isArmorBaseGearSlot(
  slot: GearSlotId,
): slot is ArmorBaseGearSlot {
  return (
    slot === 'hat' ||
    slot === 'gloves' ||
    slot === 'outfitTop' ||
    slot === 'outfitBottom' ||
    slot === 'shoulder' ||
    slot === 'shoes' ||
    slot === 'belt' ||
    slot === 'cape'
  )
}

export function armorMainOptionOptions(
  slot: ArmorBaseGearSlot,
  rank: ItemRank = 'Absolab',
): HighTierOptionDef[] {
  if (slot === 'hat') return HAT_MAIN_OPTIONS
  if (slot === 'gloves') return GLOVE_MAIN_OPTIONS
  if (slot === 'shoulder') return shoulderMainOptionsForRank(rank)
  if (slot === 'shoes') return shoesMainOptionsForRank(rank)
  if (slot === 'belt') return BELT_MAIN_OPTIONS
  if (slot === 'cape') return CAPE_MAIN_OPTIONS
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
  if (slot === 'shoulder') return supportsShoulderMainOption(slot, rank)
  if (slot === 'shoes') return supportsShoesMainOption(slot, rank)
  if (slot === 'belt') return supportsBeltMainOption(slot, rank)
  if (slot === 'cape') return supportsCapeMainOption(slot, rank)
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
  if (slot === 'shoulder') return emptyShoulderMainOption(rank, optionId, value)
  if (slot === 'shoes') return emptyShoesMainOption(rank, optionId, value)
  if (slot === 'belt') return emptyBeltMainOption(optionId, value)
  if (slot === 'cape') return emptyCapeMainOption(optionId, value)
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
  if (slot === 'shoulder') {
    return normalizeShoulderMainOption(slot, rank, option)
  }
  if (slot === 'shoes') {
    return normalizeShoesMainOption(slot, rank, option)
  }
  if (slot === 'belt') {
    return normalizeBeltMainOption(slot, rank, option)
  }
  if (slot === 'cape') {
    return normalizeCapeMainOption(slot, rank, option)
  }
  return null
}

/** Hat/gloves/outfit sync PHY and MAG DEF base in-game. */
export function syncArmorDefBases(phyDefBase: number): number {
  return phyDefBase
}
