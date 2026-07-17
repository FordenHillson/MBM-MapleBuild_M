import type { FlameRank } from '../types/build'
import type { FlameOptionDef } from './flameWeapon'

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

/** Shoulder Rebirth Flame options — Nexon probability table 6459. */
export const FLAME_SHOULDER_OPTIONS: FlameOptionDef[] = [
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
    id: 'phyDefMaxHp',
    label: 'PHY DEF scales with Max HP',
    valuesByRank: ranks(
      [0.09, 0.08, 0.07, 0.05],
      [0.18, 0.16, 0.13, 0.11],
      [0.27, 0.25, 0.22, 0.2],
      [0.36, 0.34, 0.31, 0.29],
      [0.45, 0.43, 0.4, 0.38],
    ),
  },
  {
    id: 'phyDefMaxMp',
    label: 'PHY DEF scales with Max MP',
    valuesByRank: ranks(
      [0.4, 0.35, 0.29, 0.24],
      [0.8, 0.69, 0.59, 0.48],
      [1.2, 1.09, 0.99, 0.88],
      [1.6, 1.49, 1.39, 1.28],
      [2.0, 1.89, 1.79, 1.68],
    ),
  },
  {
    id: 'phyDefExp',
    label: 'PHY DEF scales with EXP▲',
    valuesByRank: ranks(
      [13, 12, 11, 10],
      [26, 23, 20, 17],
      [39, 36, 33, 30],
      [52, 49, 46, 43],
      [65, 62, 59, 56],
    ),
  },
  {
    id: 'phyDefBossAtk',
    label: 'PHY DEF scales with Boss ATK',
    valuesByRank: ranks(
      [13.6, 11.8, 10, 8.2],
      [27.2, 23.6, 20, 16.4],
      [40.8, 37.2, 33.6, 30],
      [54.4, 50.8, 47.2, 43.6],
      [68, 64.4, 60.8, 57.2],
    ),
  },
  {
    id: 'phyDefCritRate',
    label: 'PHY DEF scales with Crit Rate',
    valuesByRank: ranks(
      [20, 17.3, 14.6, 11.9],
      [40, 34.7, 29.4, 24.1],
      [60, 54.7, 49.4, 44.1],
      [80, 74.7, 69.4, 64.1],
      [100, 94.7, 89.4, 84.1],
    ),
  },
  {
    id: 'phyDefCritDmg',
    label: 'PHY DEF scales with Crit DMG',
    valuesByRank: ranks(
      [3.28, 2.84, 2.4, 1.96],
      [6.56, 5.69, 4.82, 3.95],
      [9.84, 8.97, 8.1, 7.23],
      [13.12, 12.25, 11.38, 10.51],
      [16.4, 15.53, 14.66, 13.79],
    ),
  },
  {
    id: 'critRateExp',
    label: 'Crit Rate scales with EXP▲',
    valuesByRank: ranks(
      [1.2, 1.04, 0.88, 0.72],
      [2.4, 2.08, 1.76, 1.44],
      [3.6, 3.28, 2.96, 2.64],
      [4.8, 4.48, 4.16, 3.84],
      [6.0, 5.68, 5.36, 5.04],
    ),
  },
  {
    id: 'critRateBossAtk',
    label: 'Crit Rate scales with Boss ATK',
    valuesByRank: ranks(
      [1.2, 1.04, 0.88, 0.72],
      [2.4, 2.08, 1.76, 1.44],
      [3.6, 3.28, 2.96, 2.64],
      [4.8, 4.48, 4.16, 3.84],
      [6.0, 5.68, 5.36, 5.04],
    ),
  },
  {
    id: 'critRateCritDmg',
    label: 'Crit Rate scales with Crit DMG',
    valuesByRank: ranks(
      [0.28, 0.24, 0.21, 0.17],
      [0.56, 0.49, 0.41, 0.34],
      [0.84, 0.77, 0.69, 0.62],
      [1.12, 1.05, 0.97, 0.9],
      [1.4, 1.33, 1.25, 1.18],
    ),
  },
  {
    id: 'ignoreDef',
    label: 'Ignore DEF',
    valuesByRank: ranks(
      [],
      [],
      [],
      [1.5, 1.8, 2.1, 2.4],
      [2.8, 3.2, 3.6, 4.0],
    ),
  },
]
