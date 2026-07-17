import type { GearSlotId, ItemRank, StatLine } from '../types/build'
import type { HighTierOptionDef } from './highTierOption'

const OUTFIT_BASE_MAIN_OPTIONS: HighTierOptionDef[] = [
  { id: 'evd', label: 'EVD', optionId: 'evd' },
  { id: 'critAtk', label: 'Crit ATK', optionId: 'critAtk' },
  { id: 'mpRecovery', label: 'ฟื้นฟู MP', optionId: 'mpRecovery' },
]

const OUTFIT_BOSS_ATK_OPTION: HighTierOptionDef = {
  id: 'bossAtk',
  label: 'Boss ATK Increase',
  optionId: 'bossAtkPercent',
}

export function outfitMainOptionsForRank(rank: ItemRank): HighTierOptionDef[] {
  if (rank === 'Absolab' || rank === 'Arcane') {
    return [...OUTFIT_BASE_MAIN_OPTIONS, OUTFIT_BOSS_ATK_OPTION]
  }
  return [...OUTFIT_BASE_MAIN_OPTIONS]
}

export function supportsOutfitMainOption(
  slot: GearSlotId,
  rank: ItemRank,
): boolean {
  return (
    (slot === 'outfitTop' || slot === 'outfitBottom') &&
    rank !== 'Root Abyss'
  )
}

function outfitMainOptionById(
  rank: ItemRank,
  id: string,
): HighTierOptionDef | undefined {
  return outfitMainOptionsForRank(rank).find((option) => option.id === id)
}

function outfitMainOptionByOptionId(
  rank: ItemRank,
  optionId: string,
): HighTierOptionDef | undefined {
  return outfitMainOptionsForRank(rank).find(
    (option) => option.optionId === optionId,
  )
}

export function emptyOutfitMainOption(
  rank: ItemRank,
  optionId?: string,
  value = 0,
): StatLine {
  const allowed = outfitMainOptionsForRank(rank)
  const def =
    (optionId
      ? outfitMainOptionByOptionId(rank, optionId) ??
        outfitMainOptionById(rank, optionId)
      : undefined) ?? allowed[0]!
  return {
    optionId: def.optionId,
    label: def.label,
    value,
  }
}

export function normalizeOutfitMainOption(
  slot: GearSlotId,
  rank: ItemRank,
  option: StatLine | null | undefined,
): StatLine | null {
  if (!supportsOutfitMainOption(slot, rank)) return null
  if (!option?.optionId) {
    return emptyOutfitMainOption(rank)
  }
  const def =
    outfitMainOptionByOptionId(rank, option.optionId) ??
    outfitMainOptionById(rank, option.optionId)
  if (!def) {
    return emptyOutfitMainOption(rank, undefined, Number(option.value) || 0)
  }
  return {
    optionId: def.optionId,
    label: def.label,
    value: Number(option.value) || 0,
  }
}
