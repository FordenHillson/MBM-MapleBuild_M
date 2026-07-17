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

export type ArmorBaseGearSlot = 'hat' | 'gloves'

export function isArmorBaseGearSlot(
  slot: GearSlotId,
): slot is ArmorBaseGearSlot {
  return slot === 'hat' || slot === 'gloves'
}

export function armorMainOptionOptions(
  slot: ArmorBaseGearSlot,
): HighTierOptionDef[] {
  return slot === 'hat' ? HAT_MAIN_OPTIONS : GLOVE_MAIN_OPTIONS
}

export function supportsArmorMainOption(
  slot: GearSlotId,
  rank: ItemRank,
): boolean {
  if (slot === 'hat') return supportsHatMainOption(slot, rank)
  if (slot === 'gloves') return supportsGloveMainOption(slot, rank)
  return false
}

export function emptyArmorMainOption(
  slot: ArmorBaseGearSlot,
  optionId?: string,
  value = 0,
): StatLine {
  return slot === 'hat'
    ? emptyHatMainOption(optionId, value)
    : emptyGloveMainOption(optionId, value)
}

export function normalizeArmorMainOption(
  slot: GearSlotId,
  rank: ItemRank,
  option: StatLine | null | undefined,
): StatLine | null {
  if (slot === 'hat') return normalizeHatMainOption(slot, rank, option)
  if (slot === 'gloves') return normalizeGloveMainOption(slot, rank, option)
  return null
}

/** Hat/gloves sync PHY and MAG DEF base in-game. */
export function syncArmorDefBases(phyDefBase: number): number {
  return phyDefBase
}
