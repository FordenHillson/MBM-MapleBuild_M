import type { GearSlotId, ItemRank, StatLine } from '../types/build'
import type { HighTierOptionDef } from './highTierOption'

export const HAT_MAIN_OPTIONS: HighTierOptionDef[] = [
  { id: 'critDmg', label: 'Crit DMG', optionId: 'critDmg' },
  { id: 'bossAtk', label: 'Boss ATK Increase', optionId: 'bossAtkPercent' },
  { id: 'critAtk', label: 'Crit ATK', optionId: 'critAtk' },
  { id: 'exp', label: 'EXP Increase', optionId: 'expGainPercent' },
]

export function supportsHatMainOption(slot: GearSlotId, rank: ItemRank): boolean {
  return slot === 'hat' && rank !== 'Root Abyss'
}

function hatMainOptionById(id: string): HighTierOptionDef | undefined {
  return HAT_MAIN_OPTIONS.find((option) => option.id === id)
}

function hatMainOptionByOptionId(optionId: string): HighTierOptionDef | undefined {
  return HAT_MAIN_OPTIONS.find((option) => option.optionId === optionId)
}

export function emptyHatMainOption(
  optionId?: string,
  value = 0,
): StatLine {
  const def =
    (optionId
      ? hatMainOptionByOptionId(optionId) ?? hatMainOptionById(optionId)
      : undefined) ?? HAT_MAIN_OPTIONS[0]!
  return {
    optionId: def.optionId,
    label: def.label,
    value,
  }
}

export function normalizeHatMainOption(
  slot: GearSlotId,
  rank: ItemRank,
  option: StatLine | null | undefined,
): StatLine | null {
  if (!supportsHatMainOption(slot, rank)) return null
  if (!option?.optionId) {
    return emptyHatMainOption()
  }
  const def =
    hatMainOptionByOptionId(option.optionId) ??
    hatMainOptionById(option.optionId)
  if (!def) {
    return emptyHatMainOption(undefined, Number(option.value) || 0)
  }
  return {
    optionId: def.optionId,
    label: def.label,
    value: Number(option.value) || 0,
  }
}
