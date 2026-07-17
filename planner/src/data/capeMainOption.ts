import type { GearSlotId, ItemRank, StatLine } from '../types/build'
import type { HighTierOptionDef } from './highTierOption'

export const CAPE_MAIN_OPTIONS: HighTierOptionDef[] = [
  { id: 'evd', label: 'EVD', optionId: 'evd' },
  { id: 'exp', label: 'EXP ที่ได้รับ (%)', optionId: 'expGainPercent' },
  { id: 'critRate', label: 'อัตรา Crit (%)', optionId: 'critRate' },
  {
    id: 'meso',
    label: 'Meso ที่ได้รับ (%)',
    optionId: 'mesoGainPercent',
  },
]

export function supportsCapeMainOption(
  slot: GearSlotId,
  _rank: ItemRank,
): boolean {
  return slot === 'cape'
}

function capeMainOptionById(id: string): HighTierOptionDef | undefined {
  return CAPE_MAIN_OPTIONS.find((option) => option.id === id)
}

function capeMainOptionByOptionId(
  optionId: string,
): HighTierOptionDef | undefined {
  return CAPE_MAIN_OPTIONS.find((option) => option.optionId === optionId)
}

export function emptyCapeMainOption(
  optionId?: string,
  value = 0,
): StatLine {
  const def =
    (optionId
      ? capeMainOptionByOptionId(optionId) ?? capeMainOptionById(optionId)
      : undefined) ?? CAPE_MAIN_OPTIONS[0]!
  return {
    optionId: def.optionId,
    label: def.label,
    value,
  }
}

export function normalizeCapeMainOption(
  slot: GearSlotId,
  rank: ItemRank,
  option: StatLine | null | undefined,
): StatLine | null {
  if (!supportsCapeMainOption(slot, rank)) return null
  if (!option?.optionId) {
    return emptyCapeMainOption()
  }
  const def =
    capeMainOptionByOptionId(option.optionId) ??
    capeMainOptionById(option.optionId)
  if (!def) {
    return emptyCapeMainOption(undefined, Number(option.value) || 0)
  }
  return {
    optionId: def.optionId,
    label: def.label,
    value: Number(option.value) || 0,
  }
}
