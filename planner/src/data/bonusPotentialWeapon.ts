import type { GearSlotId, PotentialGrade, StatLine } from '../types/build'
import { isPotentialSlot } from './potentialWeapon'
import type { PotentialOptionDef } from './potentialWeapon'
import { BONUS_POTENTIAL_GLOVES_OPTIONS } from './bonusPotentialGloves'
import { BONUS_POTENTIAL_HAT_OPTIONS } from './bonusPotentialHat'
import { BONUS_POTENTIAL_OUTFIT_BOTTOM_OPTIONS } from './bonusPotentialOutfitBottom'
import { BONUS_POTENTIAL_OUTFIT_TOP_OPTIONS } from './bonusPotentialOutfitTop'
import { BONUS_POTENTIAL_SHOULDER_OPTIONS } from './bonusPotentialShoulder'
import { BONUS_POTENTIAL_SHOES_OPTIONS } from './bonusPotentialShoes'

/** Bonus Potential ranks for Weapon / Secondary — Nexon table 6438. */
export const BONUS_POTENTIAL_RANKS: PotentialGrade[] = [
  'Legendary',
  'Unique',
  'Epic',
  'Rare',
]

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

/** Weapon / Secondary Bonus Potential options (distinct value pools from main Pot). */
export const BONUS_POTENTIAL_WEAPON_OPTIONS: PotentialOptionDef[] = [
  {
    id: 'phyAtk',
    label: 'PHY ATK',
    isPercent: false,
    ...pools([420, 386, 353, 320], [420, 386, 353, 320, 240, 226, 213, 200, 140, 126, 113, 100, 60, 54, 47, 40], [240, 226, 213, 200], [240, 226, 213, 200, 140, 126, 113, 100, 60, 54, 47, 40], [140, 126, 113, 100], [140, 126, 113, 100, 60, 54, 47, 40], [60, 54, 47, 40], [60, 54, 47, 40]),
  },
  {
    id: 'magAtk',
    label: 'MAG ATK',
    isPercent: false,
    ...pools([420, 386, 353, 320], [420, 386, 353, 320, 240, 226, 213, 200, 140, 126, 113, 100, 60, 54, 47, 40], [240, 226, 213, 200], [240, 226, 213, 200, 140, 126, 113, 100, 60, 54, 47, 40], [140, 126, 113, 100], [140, 126, 113, 100, 60, 54, 47, 40], [60, 54, 47, 40], [60, 54, 47, 40]),
  },
  {
    id: 'critAtk',
    label: 'Crit ATK',
    isPercent: false,
    ...pools([239, 220, 201, 182], [239, 220, 201, 182, 137, 130, 122, 114, 80, 73, 65, 57, 34, 31, 27, 23], [137, 130, 122, 114], [137, 130, 122, 114, 80, 73, 65, 57, 34, 31, 27, 23], [80, 73, 65, 57], [80, 73, 65, 57, 34, 31, 27, 23], [34, 31, 27, 23], [34, 31, 27, 23]),
  },
  {
    id: 'critDmg',
    label: 'Crit DMG',
    isPercent: true,
    ...pools([9.5, 8.8, 8, 7.2], [9.5, 8.8, 8, 7.2, 5.4, 5.1, 4.8, 4.5, 3.2, 2.9, 2.6, 2.3, 1.4, 1.3, 1.1, 0.9], [5.4, 5.1, 4.8, 4.5], [5.4, 5.1, 4.8, 4.5, 3.2, 2.9, 2.6, 2.3, 1.4, 1.3, 1.1, 0.9], [3.2, 2.9, 2.6, 2.3], [3.2, 2.9, 2.6, 2.3, 1.4, 1.3, 1.1, 0.9], [1.4, 1.3, 1.1, 0.9], [1.4, 1.3, 1.1, 0.9]),
  },
  {
    id: 'acc',
    label: 'ACC',
    isPercent: true,
    ...pools([2.3, 2.2, 2, 1.8], [2.3, 2.2, 2, 1.8, 1.4, 1.3, 1.2, 1.1, 0.8, 0.7, 0.6, 0.3, 0.2], [1.4, 1.3, 1.2, 1.1], [1.4, 1.3, 1.2, 1.1, 0.8, 0.7, 0.6, 0.3, 0.2], [0.8, 0.7, 0.6], [0.8, 0.7, 0.6, 0.3, 0.2], [0.3, 0.2], [0.3, 0.2]),
  },
  {
    id: 'maxHp',
    label: 'Max HP',
    isPercent: false,
    ...pools([1218, 1122, 1025, 928], [1218, 1122, 1025, 928, 696, 658, 619, 580, 406, 368, 329, 290, 174, 154, 135, 116], [696, 658, 619, 580], [696, 658, 619, 580, 406, 368, 329, 290, 174, 154, 135, 116], [406, 368, 329, 290], [406, 368, 329, 290, 174, 154, 135, 116], [174, 154, 135, 116], [174, 154, 135, 116]),
  },
  {
    id: 'maxMp',
    label: 'Max MP',
    isPercent: false,
    ...pools([1050, 966, 883, 800], [1050, 966, 883, 800, 600, 566, 533, 500, 350, 316, 283, 250, 150, 134, 117, 100], [600, 566, 533, 500], [600, 566, 533, 500, 350, 316, 283, 250, 150, 134, 117, 100], [350, 316, 283, 250], [350, 316, 283, 250, 150, 134, 117, 100], [150, 134, 117, 100], [150, 134, 117, 100]),
  },
  {
    id: 'maxHpPercent',
    label: 'Max HP %',
    isPercent: true,
    ...pools([3.4, 3.2, 2.9, 2.6], [3.4, 3.2, 2.9, 2.6, 1.9, 1.8, 1.7, 1.6, 1.1, 1, 0.9, 0.8, 0.5, 0.4, 0.3], [1.9, 1.8, 1.7, 1.6], [1.9, 1.8, 1.7, 1.6, 1.1, 1, 0.9, 0.8, 0.5, 0.4, 0.3], [1.1, 1, 0.9, 0.8], [1.1, 1, 0.9, 0.8, 0.5, 0.4, 0.3], [0.5, 0.4, 0.3], [0.5, 0.4, 0.3]),
  },
  {
    id: 'maxMpPercent',
    label: 'Max MP %',
    isPercent: true,
    ...pools([3.4, 3.2, 2.9, 2.6], [3.4, 3.2, 2.9, 2.6, 1.9, 1.8, 1.7, 1.6, 1.1, 1, 0.9, 0.8, 0.5, 0.4, 0.3], [1.9, 1.8, 1.7, 1.6], [1.9, 1.8, 1.7, 1.6, 1.1, 1, 0.9, 0.8, 0.5, 0.4, 0.3], [1.1, 1, 0.9, 0.8], [1.1, 1, 0.9, 0.8, 0.5, 0.4, 0.3], [0.5, 0.4, 0.3], [0.5, 0.4, 0.3]),
  },
  {
    id: 'expGainPercent',
    label: 'EXP Increase',
    isPercent: true,
    ...pools([1.8, 1.7, 1.5, 1.3], [1.8, 1.7, 1.5, 1.3, 1, 0.9, 0.8, 0.6, 0.5, 0.4, 0.2, 0.1], [1, 0.9, 0.8], [1, 0.9, 0.8, 0.6, 0.5, 0.4, 0.2, 0.1], [0.6, 0.5, 0.4], [0.6, 0.5, 0.4, 0.2, 0.1], [0.2, 0.1], [0.2, 0.1]),
  },
]

const EMPTY_LINE: StatLine = { optionId: '', label: '', value: 0 }

export function bonusPotentialOptionsForSlot(slot: GearSlotId): PotentialOptionDef[] {
  if (!isPotentialSlot(slot)) return []
  if (slot === 'hat') return BONUS_POTENTIAL_HAT_OPTIONS
  if (slot === 'gloves') return BONUS_POTENTIAL_GLOVES_OPTIONS
  if (slot === 'outfitTop') return BONUS_POTENTIAL_OUTFIT_TOP_OPTIONS
  if (slot === 'outfitBottom') return BONUS_POTENTIAL_OUTFIT_BOTTOM_OPTIONS
  if (slot === 'shoulder') return BONUS_POTENTIAL_SHOULDER_OPTIONS
  if (slot === 'shoes') return BONUS_POTENTIAL_SHOES_OPTIONS
  return BONUS_POTENTIAL_WEAPON_OPTIONS
}

export function bonusPotentialOptionById(
  slot: GearSlotId,
  optionId: string,
): PotentialOptionDef | undefined {
  return bonusPotentialOptionsForSlot(slot).find((o) => o.id === optionId)
}

export function bonusPotentialValues(
  slot: GearSlotId,
  optionId: string,
  grade: PotentialGrade,
  lineIndex: number,
): number[] {
  const opt = bonusPotentialOptionById(slot, optionId)
  if (!opt) return []
  return lineIndex === 0 ? opt.firstByRank[grade] : opt.laterByRank[grade]
}

export function bonusPotentialOptionsAvailable(
  slot: GearSlotId,
  grade: PotentialGrade,
  lineIndex: number,
): PotentialOptionDef[] {
  return bonusPotentialOptionsForSlot(slot).filter((o) => {
    const vals = lineIndex === 0 ? o.firstByRank[grade] : o.laterByRank[grade]
    return vals.length > 0
  })
}

export function emptyBonusPotentialLines(): StatLine[] {
  return [{ ...EMPTY_LINE }, { ...EMPTY_LINE }, { ...EMPTY_LINE }]
}

export function normalizeBonusPotentialLines(
  slot: GearSlotId,
  grade: PotentialGrade,
  lines: StatLine[],
): StatLine[] {
  const padded = [...lines]
  while (padded.length < 3) padded.push({ ...EMPTY_LINE })
  return padded.slice(0, 3).map((line, idx) => {
    let optionId = line.optionId
    if (optionId === 'meso') optionId = 'mesoGainPercent'
    if (optionId === 'maxHp%' || optionId === 'maxHpPct') optionId = 'maxHpPercent'
    if (optionId === 'maxMp%' || optionId === 'maxMpPct') optionId = 'maxMpPercent'
    if (!optionId) return { ...EMPTY_LINE }
    const values = bonusPotentialValues(slot, optionId, grade, idx)
    if (values.length === 0) return { ...EMPTY_LINE }
    const opt = bonusPotentialOptionById(slot, optionId)
    const value = values.includes(line.value) ? line.value : values[0]!
    return {
      optionId,
      label: opt?.label ?? line.label,
      value,
    }
  })
}


