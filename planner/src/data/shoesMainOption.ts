import type { GearSlotId, ItemRank, StatLine } from '../types/build'
import type { HighTierOptionDef } from './highTierOption'

const SHOES_BASE_MAIN_OPTIONS: HighTierOptionDef[] = [
  { id: 'critAtk', label: 'Crit ATK', optionId: 'critAtk' },
  { id: 'evd', label: 'EVD', optionId: 'evd' },
  { id: 'hpRecovery', label: 'ฟื้นฟู HP', optionId: 'hpRecovery' },
  { id: 'exp', label: 'EXP ที่ได้รับ (%)', optionId: 'expGainPercent' },
]

const SHOES_BOSS_ATK_OPTION: HighTierOptionDef = {
  id: 'bossAtk',
  label: 'Boss ATK Increase',
  optionId: 'bossAtkPercent',
}

export function shoesMainOptionsForRank(rank: ItemRank): HighTierOptionDef[] {
  if (rank === 'Absolab' || rank === 'Arcane') {
    return [...SHOES_BASE_MAIN_OPTIONS, SHOES_BOSS_ATK_OPTION]
  }
  return [...SHOES_BASE_MAIN_OPTIONS]
}

export function supportsShoesMainOption(
  slot: GearSlotId,
  _rank: ItemRank,
): boolean {
  return slot === 'shoes'
}

function shoesMainOptionById(
  rank: ItemRank,
  id: string,
): HighTierOptionDef | undefined {
  return shoesMainOptionsForRank(rank).find((option) => option.id === id)
}

function shoesMainOptionByOptionId(
  rank: ItemRank,
  optionId: string,
): HighTierOptionDef | undefined {
  return shoesMainOptionsForRank(rank).find(
    (option) => option.optionId === optionId,
  )
}

export function emptyShoesMainOption(
  rank: ItemRank,
  optionId?: string,
  value = 0,
): StatLine {
  const allowed = shoesMainOptionsForRank(rank)
  const def =
    (optionId
      ? shoesMainOptionByOptionId(rank, optionId) ??
        shoesMainOptionById(rank, optionId)
      : undefined) ?? allowed[0]!
  return {
    optionId: def.optionId,
    label: def.label,
    value,
  }
}

export function normalizeShoesMainOption(
  slot: GearSlotId,
  rank: ItemRank,
  option: StatLine | null | undefined,
): StatLine | null {
  if (!supportsShoesMainOption(slot, rank)) return null
  if (!option?.optionId) {
    return emptyShoesMainOption(rank)
  }
  const def =
    shoesMainOptionByOptionId(rank, option.optionId) ??
    shoesMainOptionById(rank, option.optionId)
  if (!def) {
    return emptyShoesMainOption(rank, undefined, Number(option.value) || 0)
  }
  return {
    optionId: def.optionId,
    label: def.label,
    value: Number(option.value) || 0,
  }
}
