import type { GearSlotId, ItemRank, StatLine } from '../types/build'
import type { HighTierOptionDef } from './highTierOption'

export const BELT_MAIN_OPTIONS: HighTierOptionDef[] = [
  { id: 'critRate', label: 'อัตรา Crit (%)', optionId: 'critRate' },
  { id: 'exp', label: 'EXP ที่ได้รับ (%)', optionId: 'expGainPercent' },
  {
    id: 'itemDrop',
    label: 'อัตราการดรอปไอเทมเพิ่มขึ้น',
    optionId: 'itemDropPercent',
  },
  { id: 'acc', label: 'ACC', optionId: 'accPercent' },
]

export function supportsBeltMainOption(
  slot: GearSlotId,
  _rank: ItemRank,
): boolean {
  return slot === 'belt'
}

function beltMainOptionById(id: string): HighTierOptionDef | undefined {
  return BELT_MAIN_OPTIONS.find((option) => option.id === id)
}

function beltMainOptionByOptionId(
  optionId: string,
): HighTierOptionDef | undefined {
  return BELT_MAIN_OPTIONS.find((option) => option.optionId === optionId)
}

export function emptyBeltMainOption(
  optionId?: string,
  value = 0,
): StatLine {
  const def =
    (optionId
      ? beltMainOptionByOptionId(optionId) ?? beltMainOptionById(optionId)
      : undefined) ?? BELT_MAIN_OPTIONS[0]!
  return {
    optionId: def.optionId,
    label: def.label,
    value,
  }
}

export function normalizeBeltMainOption(
  slot: GearSlotId,
  rank: ItemRank,
  option: StatLine | null | undefined,
): StatLine | null {
  if (!supportsBeltMainOption(slot, rank)) return null
  if (!option?.optionId) {
    return emptyBeltMainOption()
  }
  const def =
    beltMainOptionByOptionId(option.optionId) ??
    beltMainOptionById(option.optionId)
  if (!def) {
    return emptyBeltMainOption(undefined, Number(option.value) || 0)
  }
  return {
    optionId: def.optionId,
    label: def.label,
    value: Number(option.value) || 0,
  }
}
