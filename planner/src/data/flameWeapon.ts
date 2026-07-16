import type { FlameRank, GearSlotId } from '../types/build'
import { slotProfile } from './equipCategory'
import { FLAME_HAT_OPTIONS } from './flameHat'

export const FLAME_RANKS: FlameRank[] = [
  'Mythic',
  'Legendary',
  'Unique',
  'Epic',
  'Rare',
]

export interface FlameOptionDef {
  id: string
  label: string
  /** Selectable values per flame rank (highest → lowest). Empty = unavailable. */
  valuesByRank: Record<FlameRank, number[]>
}

function ranks(
  rare: number[],
  epic: number[],
  unique: number[],
  legendary: number[],
  mythic: number[],
): Record<FlameRank, number[]> {
  return {
    Rare: rare,
    Epic: epic,
    Unique: unique,
    Legendary: legendary,
    Mythic: mythic,
  }
}

/** Weapon Rebirth Flame options — Nexon probability table 6459. */
export const FLAME_WEAPON_OPTIONS: FlameOptionDef[] = [
  {
    id: 'phyAtkMaxHp',
    label: 'PHY ATK scales with Max HP',
    valuesByRank: ranks(
      [0.2, 0.17, 0.15, 0.12],
      [0.4, 0.35, 0.29, 0.24],
      [0.6, 0.55, 0.49, 0.44],
      [0.8, 0.75, 0.69, 0.64],
      [1.0, 0.95, 0.89, 0.84],
    ),
  },
  {
    id: 'magAtkMaxHp',
    label: 'MAG ATK scales with Max HP',
    valuesByRank: ranks(
      [0.2, 0.17, 0.15, 0.12],
      [0.4, 0.35, 0.29, 0.24],
      [0.6, 0.55, 0.49, 0.44],
      [0.8, 0.75, 0.69, 0.64],
      [1.0, 0.95, 0.89, 0.84],
    ),
  },
  {
    id: 'phyAtkMaxMp',
    label: 'PHY ATK scales with Max MP',
    valuesByRank: ranks(
      [0.7, 0.61, 0.51, 0.42],
      [1.4, 1.21, 1.03, 0.84],
      [2.1, 1.91, 1.73, 1.54],
      [2.8, 2.61, 2.43, 2.24],
      [3.5, 3.31, 3.13, 2.94],
    ),
  },
  {
    id: 'magAtkMaxMp',
    label: 'MAG ATK scales with Max MP',
    valuesByRank: ranks(
      [0.7, 0.61, 0.51, 0.42],
      [1.4, 1.21, 1.03, 0.84],
      [2.1, 1.91, 1.73, 1.54],
      [2.8, 2.61, 2.43, 2.24],
      [3.5, 3.31, 3.13, 2.94],
    ),
  },
  {
    id: 'phyAtkExp',
    label: 'PHY ATK scales with EXP▲',
    valuesByRank: ranks(
      [22, 19, 16, 13],
      [44, 38, 32, 26],
      [66, 60, 54, 48],
      [88, 82, 76, 70],
      [110, 104, 98, 92],
    ),
  },
  {
    id: 'magAtkExp',
    label: 'MAG ATK scales with EXP▲',
    valuesByRank: ranks(
      [22, 19, 16, 13],
      [44, 38, 32, 26],
      [66, 60, 54, 48],
      [88, 82, 76, 70],
      [110, 104, 98, 92],
    ),
  },
  {
    id: 'phyAtkBossAtk',
    label: 'PHY ATK scales with Boss ATK',
    valuesByRank: ranks(
      [23, 20, 17, 14],
      [45, 39, 33, 27],
      [68, 62, 56, 50],
      [91, 85, 79, 73],
      [113, 107, 101, 95],
    ),
  },
  {
    id: 'magAtkBossAtk',
    label: 'MAG ATK scales with Boss ATK',
    valuesByRank: ranks(
      [23, 20, 17, 14],
      [45, 39, 33, 27],
      [68, 62, 56, 50],
      [91, 85, 79, 73],
      [113, 107, 101, 95],
    ),
  },
  {
    id: 'phyAtkCritRate',
    label: 'PHY ATK scales with Crit Rate',
    valuesByRank: ranks(
      [33.3, 28.9, 24.5, 20.1],
      [66.5, 57.7, 48.9, 40.1],
      [99.8, 91.0, 82.2, 73.4],
      [133.1, 124.3, 115.5, 106.7],
      [166.4, 157.6, 148.8, 140.0],
    ),
  },
  {
    id: 'magAtkCritRate',
    label: 'MAG ATK scales with Crit Rate',
    valuesByRank: ranks(
      [33.3, 28.9, 24.5, 20.1],
      [66.7, 57.8, 48.9, 40.0],
      [100.0, 91.1, 82.2, 73.3],
      [133.3, 124.4, 115.5, 106.6],
      [166.6, 157.7, 148.8, 139.9],
    ),
  },
  {
    id: 'phyAtkCritDmg',
    label: 'PHY ATK scales with Crit DMG',
    valuesByRank: ranks(
      [5.5, 4.77, 4.04, 3.31],
      [11.0, 9.53, 8.06, 6.59],
      [16.5, 15.03, 13.56, 12.09],
      [22.0, 20.53, 19.06, 17.59],
      [27.5, 26.03, 24.56, 23.09],
    ),
  },
  {
    id: 'magAtkCritDmg',
    label: 'MAG ATK scales with Crit DMG',
    valuesByRank: ranks(
      [5.5, 4.77, 4.04, 3.31],
      [11.0, 9.53, 8.06, 6.59],
      [16.5, 15.03, 13.56, 12.09],
      [22.0, 20.53, 19.06, 17.59],
      [27.5, 26.03, 24.56, 23.09],
    ),
  },
  {
    id: 'critDmgExp',
    label: 'Crit DMG scales with EXP▲',
    valuesByRank: ranks(
      [2.4, 2.1, 1.8, 1.5],
      [4.8, 4.2, 3.6, 3.0],
      [7.2, 6.6, 6.0, 5.4],
      [9.6, 9.0, 8.4, 7.8],
      [12.0, 11.4, 10.8, 10.2],
    ),
  },
  {
    id: 'critDmgBossAtk',
    label: 'Crit DMG scales with Boss ATK',
    valuesByRank: ranks(
      [1.2, 1.04, 0.88, 0.72],
      [2.4, 2.08, 1.76, 1.44],
      [3.6, 3.28, 2.96, 2.64],
      [4.8, 4.48, 4.16, 3.84],
      [6.0, 5.68, 5.36, 5.04],
    ),
  },
  {
    id: 'critDmgCritRate',
    label: 'Crit DMG scales with Crit Rate',
    valuesByRank: ranks(
      [2.2, 1.9, 1.6, 1.3],
      [4.4, 3.8, 3.2, 2.6],
      [6.6, 6.0, 5.4, 4.8],
      [8.8, 8.2, 7.6, 7.0],
      [11.0, 10.4, 9.8, 9.2],
    ),
  },
  {
    id: 'finalDmg',
    label: 'Final DMG Increase',
    valuesByRank: ranks(
      [],
      [],
      [],
      [4.0, 3.5, 3.0, 2.5],
      [6.0, 5.5, 5.0, 4.5],
    ),
  },
]

const EMPTY_LINE = { optionId: '', label: '', value: 0 }

export function isFlameSlot(slot: GearSlotId): boolean {
  return slotProfile(slot).flame.enabled || slot === 'hat'
}

export function flameOptionsForSlot(slot: GearSlotId): FlameOptionDef[] {
  if (slot === 'hat') return FLAME_HAT_OPTIONS
  if (slot === 'mainWeapon' || slot === 'secondary') return FLAME_WEAPON_OPTIONS
  return []
}

export function flameOptionById(
  slot: GearSlotId,
  optionId: string,
): FlameOptionDef | undefined {
  return flameOptionsForSlot(slot).find((o) => o.id === optionId)
}

export function flameValues(
  slot: GearSlotId,
  optionId: string,
  rank: FlameRank,
): number[] {
  return flameOptionById(slot, optionId)?.valuesByRank[rank] ?? []
}

export function flameOptionsAvailable(
  slot: GearSlotId,
  rank: FlameRank,
): FlameOptionDef[] {
  return flameOptionsForSlot(slot).filter((o) => o.valuesByRank[rank].length > 0)
}

export function emptyFlameLines(): typeof EMPTY_LINE[] {
  return [
    { ...EMPTY_LINE },
    { ...EMPTY_LINE },
  ]
}

export function normalizeFlameLines(
  slot: GearSlotId,
  rank: FlameRank,
  lines: { optionId: string; label: string; value: number }[],
): { optionId: string; label: string; value: number }[] {
  const padded = [...lines]
  while (padded.length < 2) padded.push({ ...EMPTY_LINE })
  return padded.slice(0, 2).map((line) => {
    if (!line.optionId) return { ...EMPTY_LINE }
    const values = flameValues(slot, line.optionId, rank)
    if (values.length === 0) return { ...EMPTY_LINE }
    const opt = flameOptionById(slot, line.optionId)
    const value = values.includes(line.value) ? line.value : values[0]!
    return {
      optionId: line.optionId,
      label: opt?.label ?? line.label,
      value,
    }
  })
}

export function isFlameRank(v: unknown): v is FlameRank {
  return (
    v === 'Rare' ||
    v === 'Epic' ||
    v === 'Unique' ||
    v === 'Legendary' ||
    v === 'Mythic'
  )
}

/** Text/frame color class for Flame rank (matches potential / gear palette). */
export function flameRankFrameClass(rank: FlameRank): string {
  switch (rank) {
    case 'Mythic':
      return 'rank-red'
    case 'Legendary':
      return 'rank-green'
    case 'Unique':
      return 'rank-orange'
    case 'Epic':
      return 'rank-purple'
    case 'Rare':
      return 'rank-cyan'
    default:
      return 'rank-gray'
  }
}
