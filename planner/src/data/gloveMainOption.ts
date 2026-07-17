import type { GearSlotId, ItemRank, StatLine } from '../types/build'
import type { HighTierOptionDef } from './highTierOption'

export const GLOVE_MAIN_OPTIONS: HighTierOptionDef[] = [
  { id: 'critAtk', label: 'Crit ATK', optionId: 'critAtk' },
  { id: 'critDmg', label: 'Crit DMG', optionId: 'critDmg' },
  { id: 'acc', label: 'ACC', optionId: 'accPercent' },
  { id: 'exp', label: 'EXP Increase', optionId: 'expGainPercent' },
]

export function supportsGloveMainOption(slot: GearSlotId, _rank: ItemRank): boolean {
  return slot === 'gloves'
}

function gloveMainOptionById(id: string): HighTierOptionDef | undefined {
  return GLOVE_MAIN_OPTIONS.find((option) => option.id === id)
}

function gloveMainOptionByOptionId(optionId: string): HighTierOptionDef | undefined {
  return GLOVE_MAIN_OPTIONS.find((option) => option.optionId === optionId)
}

export function emptyGloveMainOption(
  optionId?: string,
  value = 0,
): StatLine {
  const def =
    (optionId
      ? gloveMainOptionByOptionId(optionId) ?? gloveMainOptionById(optionId)
      : undefined) ?? GLOVE_MAIN_OPTIONS[0]!
  return {
    optionId: def.optionId,
    label: def.label,
    value,
  }
}

export function normalizeGloveMainOption(
  slot: GearSlotId,
  rank: ItemRank,
  option: StatLine | null | undefined,
): StatLine | null {
  if (!supportsGloveMainOption(slot, rank)) return null
  if (!option?.optionId) {
    return emptyGloveMainOption()
  }
  const def =
    gloveMainOptionByOptionId(option.optionId) ??
    gloveMainOptionById(option.optionId)
  if (!def) {
    return emptyGloveMainOption(undefined, Number(option.value) || 0)
  }
  return {
    optionId: def.optionId,
    label: def.label,
    value: Number(option.value) || 0,
  }
}
