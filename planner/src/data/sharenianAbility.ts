import type { GearSlotId, ItemRank, StatLine } from '../types/build'

export interface SharenianOptionDef {
  id: string
  label: string
  optionId: string
}

/** Unique+ Second Weapon — fixed Sharenian Ability lines (user enters %). */
export const SHARENIAN_ABILITY_OPTIONS: SharenianOptionDef[] = [
  {
    id: 'finalDmg',
    label: 'Final DMG Increase',
    optionId: 'finalPercent',
  },
  {
    id: 'bossAtk',
    label: 'Boss ATK Increase',
    optionId: 'bossAtkPercent',
  },
]

const SHARENIAN_RANKS: ReadonlySet<ItemRank> = new Set([
  'Unique',
  'Legendary',
  'Mythic',
])

export function isSharenianRank(rank: ItemRank): boolean {
  return SHARENIAN_RANKS.has(rank)
}

export function supportsSharenianAbility(
  slot: GearSlotId,
  rank: ItemRank,
): boolean {
  return slot === 'secondary' && isSharenianRank(rank)
}

export function emptySharenianAbility(): StatLine[] {
  return SHARENIAN_ABILITY_OPTIONS.map((opt) => ({
    optionId: opt.optionId,
    label: opt.label,
    value: 0,
  }))
}

export function normalizeSharenianAbility(
  slot: GearSlotId,
  rank: ItemRank,
  lines: StatLine[] | null | undefined,
): StatLine[] | null {
  if (!supportsSharenianAbility(slot, rank)) return null

  const src = Array.isArray(lines) ? lines : []
  return SHARENIAN_ABILITY_OPTIONS.map((opt) => {
    const found =
      src.find((l) => l.optionId === opt.optionId) ??
      src.find((l) => l.optionId === opt.id)
    return {
      optionId: opt.optionId,
      label: opt.label,
      value: Number(found?.value) || 0,
    }
  })
}
