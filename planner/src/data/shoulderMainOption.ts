import type { GearSlotId, ItemRank, StatLine } from '../types/build'
import type { HighTierOptionDef } from './highTierOption'

const SHOULDER_BASE_MAIN_OPTIONS: HighTierOptionDef[] = [
  { id: 'hpRecovery', label: 'ฟื้นฟู HP', optionId: 'hpRecovery' },
  { id: 'mpRecovery', label: 'ฟื้นฟู MP', optionId: 'mpRecovery' },
  { id: 'critAtk', label: 'Crit ATK', optionId: 'critAtk' },
  { id: 'exp', label: 'EXP ที่ได้รับ (%)', optionId: 'expGainPercent' },
]

const SHOULDER_PHY_DMG_OPTION: HighTierOptionDef = {
  id: 'phyDmg',
  label: 'PHY DMG (%)',
  optionId: 'phyDmgPercent',
}

export function shoulderMainOptionsForRank(rank: ItemRank): HighTierOptionDef[] {
  if (rank === 'Absolab' || rank === 'Arcane') {
    return [...SHOULDER_BASE_MAIN_OPTIONS, SHOULDER_PHY_DMG_OPTION]
  }
  return [...SHOULDER_BASE_MAIN_OPTIONS]
}

export function supportsShoulderMainOption(
  slot: GearSlotId,
  _rank: ItemRank,
): boolean {
  return slot === 'shoulder'
}

function shoulderMainOptionById(
  rank: ItemRank,
  id: string,
): HighTierOptionDef | undefined {
  return shoulderMainOptionsForRank(rank).find((option) => option.id === id)
}

function shoulderMainOptionByOptionId(
  rank: ItemRank,
  optionId: string,
): HighTierOptionDef | undefined {
  return shoulderMainOptionsForRank(rank).find(
    (option) => option.optionId === optionId,
  )
}

export function emptyShoulderMainOption(
  rank: ItemRank,
  optionId?: string,
  value = 0,
): StatLine {
  const allowed = shoulderMainOptionsForRank(rank)
  const def =
    (optionId
      ? shoulderMainOptionByOptionId(rank, optionId) ??
        shoulderMainOptionById(rank, optionId)
      : undefined) ?? allowed[0]!
  return {
    optionId: def.optionId,
    label: def.label,
    value,
  }
}

export function normalizeShoulderMainOption(
  slot: GearSlotId,
  rank: ItemRank,
  option: StatLine | null | undefined,
): StatLine | null {
  if (!supportsShoulderMainOption(slot, rank)) return null
  if (!option?.optionId) {
    return emptyShoulderMainOption(rank)
  }
  const def =
    shoulderMainOptionByOptionId(rank, option.optionId) ??
    shoulderMainOptionById(rank, option.optionId)
  if (!def) {
    return emptyShoulderMainOption(rank, undefined, Number(option.value) || 0)
  }
  return {
    optionId: def.optionId,
    label: def.label,
    value: Number(option.value) || 0,
  }
}
