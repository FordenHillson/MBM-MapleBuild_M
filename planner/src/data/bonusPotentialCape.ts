import type { PotentialGrade } from '../types/build'
import type { PotentialOptionDef } from './potentialWeapon'

function pools(
  legendaryFirst: number[],
  legendaryLater: number[],
  uniqueFirst: number[],
  uniqueLater: number[],
  epicFirst: number[],
  epicLater: number[],
  rareFirst: number[],
  rareLater: number[],
): Pick<PotentialOptionDef, 'firstByRank' | 'laterByRank'> {
  return {
    firstByRank: {
      Legendary: legendaryFirst,
      Unique: uniqueFirst,
      Epic: epicFirst,
      Rare: rareFirst,
    },
    laterByRank: {
      Legendary: legendaryLater,
      Unique: uniqueLater,
      Epic: epicLater,
      Rare: rareLater,
    },
  }
}

/** Cape Bonus Potential ranks — Nexon table 6452. */
export const BONUS_POTENTIAL_CAPE_RANKS: PotentialGrade[] = [
  'Legendary',
  'Unique',
  'Epic',
  'Rare',
]

/** Cape Bonus Potential — Nexon table 6452. */
export const BONUS_POTENTIAL_CAPE_OPTIONS: PotentialOptionDef[] = [
  {
    id: 'phyDefPercent',
    label: 'PHY DEF Increase',
    isPercent: true,
    ...pools(
      [3,3.3,3.6,4],
      [0.4,0.5,0.6,1,1.1,1.2,1.3,1.9,2,2.1,2.3,3,3.3,3.6,4],
      [1.9,2,2.1,2.3],
      [0.4,0.5,0.6,1,1.1,1.2,1.3,1.9,2,2.1,2.3],
      [1,1.1,1.2,1.3],
      [0.4,0.5,0.6,1,1.1,1.2,1.3],
      [0.4,0.5,0.6],
      [0.4,0.5,0.6],
    ),
  },
  {
    id: 'magDefPercent',
    label: 'MAG DEF Increase',
    isPercent: true,
    ...pools(
      [3,3.3,3.6,4],
      [0.4,0.5,0.6,1,1.1,1.2,1.3,1.9,2,2.1,2.3,3,3.3,3.6,4],
      [1.9,2,2.1,2.3],
      [0.4,0.5,0.6,1,1.1,1.2,1.3,1.9,2,2.1,2.3],
      [1,1.1,1.2,1.3],
      [0.4,0.5,0.6,1,1.1,1.2,1.3],
      [0.4,0.5,0.6],
      [0.4,0.5,0.6],
    ),
  },
  {
    id: 'acc',
    label: 'ACC',
    isPercent: true,
    ...pools(
      [1.8,2,2.2,2.3],
      [0.2,0.3,0.6,0.7,0.8,1.1,1.2,1.3,1.4,1.8,2,2.2,2.3],
      [1.1,1.2,1.3,1.4],
      [0.2,0.3,0.6,0.7,0.8,1.1,1.2,1.3,1.4],
      [0.6,0.7,0.8],
      [0.2,0.3,0.6,0.7,0.8],
      [0.2,0.3],
      [0.2,0.3],
    ),
  },
  {
    id: 'maxHp',
    label: 'Max HP',
    isPercent: false,
    ...pools(
      [928,1025,1122,1218],
      [116,135,154,174,290,329,368,406,580,619,658,696,928,1025,1122,1218],
      [580,619,658,696],
      [116,135,154,174,290,329,368,406,580,619,658,696],
      [290,329,368,406],
      [116,135,154,174,290,329,368,406],
      [116,135,154,174],
      [116,135,154,174],
    ),
  },
  {
    id: 'maxHpPercent',
    label: 'Max HP %',
    isPercent: true,
    ...pools(
      [2.6,2.9,3.2,3.4],
      [0.3,0.4,0.5,0.8,0.9,1,1.1,1.6,1.7,1.8,1.9,2.6,2.9,3.2,3.4],
      [1.6,1.7,1.8,1.9],
      [0.3,0.4,0.5,0.8,0.9,1,1.1,1.6,1.7,1.8,1.9],
      [0.8,0.9,1,1.1],
      [0.3,0.4,0.5,0.8,0.9,1,1.1],
      [0.3,0.4,0.5],
      [0.3,0.4,0.5],
    ),
  },
  {
    id: 'maxMpPercent',
    label: 'Max MP %',
    isPercent: true,
    ...pools(
      [2.6,2.9,3.2,3.4],
      [0.3,0.4,0.5,0.8,0.9,1,1.1,1.6,1.7,1.8,1.9,2.6,2.9,3.2,3.4],
      [1.6,1.7,1.8,1.9],
      [0.3,0.4,0.5,0.8,0.9,1,1.1,1.6,1.7,1.8,1.9],
      [0.8,0.9,1,1.1],
      [0.3,0.4,0.5,0.8,0.9,1,1.1],
      [0.3,0.4,0.5],
      [0.3,0.4,0.5],
    ),
  },
  {
    id: 'spdPercent',
    label: 'SPD Increase',
    isPercent: true,
    ...pools(
      [5.9,6.5,7.1,7.7],
      [0.7,0.8,0.9,1.1,1.8,2.1,2.4,2.6,3.7,3.9,4.1,4.4,5.9,6.5,7.1,7.7],
      [3.7,3.9,4.1,4.4],
      [0.7,0.8,0.9,1.1,1.8,2.1,2.4,2.6,3.7,3.9,4.1,4.4],
      [1.8,2.1,2.4,2.6],
      [0.7,0.8,0.9,1.1,1.8,2.1,2.4,2.6],
      [0.7,0.8,0.9,1.1],
      [0.7,0.8,0.9,1.1],
    ),
  },
  {
    id: 'expGainPercent',
    label: 'EXP Increase',
    isPercent: true,
    ...pools(
      [1.3,1.5,1.7,1.8],
      [0.1,0.2,0.4,0.5,0.6,0.8,0.9,1,1.3,1.5,1.7,1.8],
      [0.8,0.9,1],
      [0.1,0.2,0.4,0.5,0.6,0.8,0.9,1],
      [0.4,0.5,0.6],
      [0.1,0.2,0.4,0.5,0.6],
      [0.1,0.2],
      [0.1,0.2],
    ),
  },
]
