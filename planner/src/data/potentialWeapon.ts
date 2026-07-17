import type { GearSlotId, PotentialGrade, StatLine } from '../types/build'
import { slotProfile } from './equipCategory'
import { POTENTIAL_GLOVES_OPTIONS } from './potentialGloves'
import { POTENTIAL_HAT_OPTIONS } from './potentialHat'
import { POTENTIAL_OUTFIT_BOTTOM_OPTIONS } from './potentialOutfitBottom'
import { POTENTIAL_OUTFIT_TOP_OPTIONS } from './potentialOutfitTop'

/** Cube Potential ranks for Weapon / Secondary — Nexon table 6438. */
export const POTENTIAL_RANKS: PotentialGrade[] = [
  'Legendary',
  'Unique',
  'Epic',
  'Rare',
]

export interface PotentialOptionDef {
  id: string
  label: string
  isPercent: boolean
  /** First line values per item Potential rank. */
  firstByRank: Record<PotentialGrade, number[]>
  /** Second / third line values per item Potential rank. */
  laterByRank: Record<PotentialGrade, number[]>
}

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

/** Weapon / Secondary main Potential options. */
export const POTENTIAL_WEAPON_OPTIONS: PotentialOptionDef[] = [
  {
    id: 'phyAtk',
    label: 'PHY ATK',
    isPercent: false,
    ...pools([420, 400, 380, 360, 340, 320], [420, 400, 380, 360, 340, 320, 300, 280, 260, 240, 220, 200, 140, 132, 124, 116, 108, 100, 60, 56, 52, 48, 44, 40], [300, 280, 260, 240, 220, 200], [300, 280, 260, 240, 220, 200, 140, 132, 124, 116, 108, 100, 60, 56, 52, 48, 44, 40], [140, 132, 124, 116, 108, 100], [140, 132, 124, 116, 108, 100, 60, 56, 52, 48, 44, 40], [60, 56, 52, 48, 44, 40], [60, 56, 52, 48, 44, 40]),
  },
  {
    id: 'magAtk',
    label: 'MAG ATK',
    isPercent: false,
    ...pools([420, 400, 380, 360, 340, 320], [420, 400, 380, 360, 340, 320, 300, 280, 260, 240, 220, 200, 140, 132, 124, 116, 108, 100, 60, 56, 52, 48, 44, 40], [300, 280, 260, 240, 220, 200], [300, 280, 260, 240, 220, 200, 140, 132, 124, 116, 108, 100, 60, 56, 52, 48, 44, 40], [140, 132, 124, 116, 108, 100], [140, 132, 124, 116, 108, 100, 60, 56, 52, 48, 44, 40], [60, 56, 52, 48, 44, 40], [60, 56, 52, 48, 44, 40]),
  },
  {
    id: 'critAtk',
    label: 'Crit ATK',
    isPercent: false,
    ...pools([239, 227, 215, 203, 191, 182], [239, 227, 215, 203, 191, 182, 171, 159, 147, 135, 123, 114, 80, 75, 70, 65, 60, 57, 34, 31, 28, 25, 23], [171, 159, 147, 135, 123, 114], [171, 159, 147, 135, 123, 114, 80, 75, 70, 65, 60, 57, 34, 31, 28, 25, 23], [80, 75, 70, 65, 60, 57], [80, 75, 70, 65, 60, 57, 34, 31, 28, 25, 23], [34, 31, 28, 25, 23], [34, 31, 28, 25, 23]),
  },
  {
    id: 'critDmg',
    label: 'Crit DMG',
    isPercent: true,
    ...pools([9.5, 9.04, 8.58, 8.12, 7.66, 7.2], [9.5, 9.04, 8.58, 8.12, 7.66, 7.2, 6.8, 6.34, 5.88, 5.42, 4.96, 4.5, 3.2, 3.02, 2.84, 2.66, 2.48, 2.3, 1.4, 1.3, 1.2, 1.1, 1, 0.9], [6.8, 6.34, 5.88, 5.42, 4.96, 4.5], [6.8, 6.34, 5.88, 5.42, 4.96, 4.5, 3.2, 3.02, 2.84, 2.66, 2.48, 2.3, 1.4, 1.3, 1.2, 1.1, 1, 0.9], [3.2, 3.02, 2.84, 2.66, 2.48, 2.3], [3.2, 3.02, 2.84, 2.66, 2.48, 2.3, 1.4, 1.3, 1.2, 1.1, 1, 0.9], [1.4, 1.3, 1.2, 1.1, 1, 0.9], [1.4, 1.3, 1.2, 1.1, 1, 0.9]),
  },
  {
    id: 'acc',
    label: 'ACC',
    isPercent: true,
    ...pools([2.3, 2.2, 2.1, 2, 1.9, 1.8], [2.3, 2.2, 2.1, 2, 1.9, 1.8, 1.7, 1.5, 1.3, 1.1, 0.8, 0.7, 0.6, 0.3, 0.2], [1.7, 1.5, 1.3, 1.1], [1.7, 1.5, 1.3, 1.1, 0.8, 0.7, 0.6, 0.3, 0.2], [0.8, 0.7, 0.6], [0.8, 0.7, 0.6, 0.3, 0.2], [0.3, 0.2], [0.3, 0.2]),
  },
  {
    id: 'maxHp',
    label: 'Max HP',
    isPercent: false,
    ...pools([1218, 1160, 1102, 1044, 986, 928], [1218, 1160, 1102, 1044, 986, 928, 870, 812, 754, 696, 638, 580, 406, 382, 358, 334, 310, 290, 174, 162, 150, 138, 126, 116], [870, 812, 754, 696, 638, 580], [870, 812, 754, 696, 638, 580, 406, 382, 358, 334, 310, 290, 174, 162, 150, 138, 126, 116], [406, 382, 358, 334, 310, 290], [406, 382, 358, 334, 310, 290, 174, 162, 150, 138, 126, 116], [174, 162, 150, 138, 126, 116], [174, 162, 150, 138, 126, 116]),
  },
  {
    id: 'maxMp',
    label: 'Max MP',
    isPercent: false,
    ...pools([1050, 1000, 950, 900, 850, 800], [1050, 1000, 950, 900, 850, 800, 750, 700, 650, 600, 550, 500, 350, 330, 310, 290, 270, 250, 150, 140, 130, 120, 110, 100], [750, 700, 650, 600, 550, 500], [750, 700, 650, 600, 550, 500, 350, 330, 310, 290, 270, 250, 150, 140, 130, 120, 110, 100], [350, 330, 310, 290, 270, 250], [350, 330, 310, 290, 270, 250, 150, 140, 130, 120, 110, 100], [150, 140, 130, 120, 110, 100], [150, 140, 130, 120, 110, 100]),
  },
  {
    id: 'maxHpPercent',
    label: 'Max HP %',
    isPercent: true,
    ...pools([3.4, 3.24, 3.08, 2.92, 2.76, 2.6], [3.4, 3.24, 3.08, 2.92, 2.76, 2.6, 2.4, 2.24, 2.08, 1.92, 1.76, 1.6, 1.1, 1.04, 0.98, 0.92, 0.86, 0.8, 0.5, 0.46, 0.42, 0.38, 0.34, 0.3], [2.4, 2.24, 2.08, 1.92, 1.76, 1.6], [2.4, 2.24, 2.08, 1.92, 1.76, 1.6, 1.1, 1.04, 0.98, 0.92, 0.86, 0.8, 0.5, 0.46, 0.42, 0.38, 0.34, 0.3], [1.1, 1.04, 0.98, 0.92, 0.86, 0.8], [1.1, 1.04, 0.98, 0.92, 0.86, 0.8, 0.5, 0.46, 0.42, 0.38, 0.34, 0.3], [0.5, 0.46, 0.42, 0.38, 0.34, 0.3], [0.5, 0.46, 0.42, 0.38, 0.34, 0.3]),
  },
  {
    id: 'maxMpPercent',
    label: 'Max MP %',
    isPercent: true,
    ...pools([3.4, 3.24, 3.08, 2.92, 2.76, 2.6], [3.4, 3.24, 3.08, 2.92, 2.76, 2.6, 2.4, 2.24, 2.08, 1.92, 1.76, 1.6, 1.1, 1.04, 0.98, 0.92, 0.86, 0.8, 0.5, 0.46, 0.42, 0.38, 0.34, 0.3], [2.4, 2.24, 2.08, 1.92, 1.76, 1.6], [2.4, 2.24, 2.08, 1.92, 1.76, 1.6, 1.1, 1.04, 0.98, 0.92, 0.86, 0.8, 0.5, 0.46, 0.42, 0.38, 0.34, 0.3], [1.1, 1.04, 0.98, 0.92, 0.86, 0.8], [1.1, 1.04, 0.98, 0.92, 0.86, 0.8, 0.5, 0.46, 0.42, 0.38, 0.34, 0.3], [0.5, 0.46, 0.42, 0.38, 0.34, 0.3], [0.5, 0.46, 0.42, 0.38, 0.34, 0.3]),
  },
  {
    id: 'expGainPercent',
    label: 'EXP Increase',
    isPercent: true,
    ...pools([1.8, 1.7, 1.6, 1.5, 1.4, 1.3], [1.8, 1.7, 1.6, 1.5, 1.4, 1.3, 1.2, 1.1, 1, 0.9, 0.8, 0.6, 0.5, 0.4, 0.2, 0.1], [1.2, 1.1, 1, 0.9, 0.8], [1.2, 1.1, 1, 0.9, 0.8, 0.6, 0.5, 0.4, 0.2, 0.1], [0.6, 0.5, 0.4], [0.6, 0.5, 0.4, 0.2, 0.1], [0.2, 0.1], [0.2, 0.1]),
  },
  {
    id: 'itemDropPercent',
    label: 'Item Drop Rate',
    isPercent: true,
    ...pools([3.2, 3, 2.8, 2.6, 2.4], [3.2, 3, 2.8, 2.6, 2.4, 2.3, 2.1, 1.9, 1.7, 1.5, 1.1, 1, 0.9, 0.8, 0.5, 0.4, 0.3], [2.3, 2.1, 1.9, 1.7, 1.5], [2.3, 2.1, 1.9, 1.7, 1.5, 1.1, 1, 0.9, 0.8, 0.5, 0.4, 0.3], [1.1, 1, 0.9, 0.8], [1.1, 1, 0.9, 0.8, 0.5, 0.4, 0.3], [0.5, 0.4, 0.3], [0.5, 0.4, 0.3]),
  },
  {
    id: 'mesoGainPercent',
    label: 'Meso Acquisition',
    isPercent: true,
    ...pools([1.8, 1.7, 1.6, 1.5, 1.4, 1.3], [1.8, 1.7, 1.6, 1.5, 1.4, 1.3, 1.2, 1.1, 1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1], [1.2, 1.1, 1, 0.9, 0.8, 0.7], [1.2, 1.1, 1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1], [0.6, 0.5, 0.4, 0.3], [0.6, 0.5, 0.4, 0.3, 0.2, 0.1], [0.2, 0.1], [0.2, 0.1]),
  },
]

const EMPTY_LINE: StatLine = { optionId: '', label: '', value: 0 }

const LETTER_TO_RANK: Record<string, PotentialGrade> = {
  R: 'Rare',
  E: 'Epic',
  U: 'Unique',
  L: 'Legendary',
  M: 'Legendary',
  A: 'Legendary',
  C: 'Legendary',
}

export function isPotentialSlot(slot: GearSlotId): boolean {
  return (
    slotProfile(slot).potential.enabled ||
    slot === 'hat' ||
    slot === 'gloves' ||
    slot === 'outfitTop' ||
    slot === 'outfitBottom'
  )
}

export function isPotentialGrade(v: unknown): v is PotentialGrade {
  return typeof v === 'string' && (POTENTIAL_RANKS as string[]).includes(v)
}

/** Migrate old letter grades (R/E/U/L/M/A/C) → full rank names. */
export function normalizePotentialGrade(grade: unknown): PotentialGrade {
  if (isPotentialGrade(grade)) return grade
  if (typeof grade === 'string' && grade in LETTER_TO_RANK) {
    return LETTER_TO_RANK[grade]
  }
  return 'Legendary'
}

export function potentialOptionsForSlot(slot: GearSlotId): PotentialOptionDef[] {
  if (!isPotentialSlot(slot)) return []
  if (slot === 'hat') return POTENTIAL_HAT_OPTIONS
  if (slot === 'gloves') return POTENTIAL_GLOVES_OPTIONS
  if (slot === 'outfitTop') return POTENTIAL_OUTFIT_TOP_OPTIONS
  if (slot === 'outfitBottom') return POTENTIAL_OUTFIT_BOTTOM_OPTIONS
  return POTENTIAL_WEAPON_OPTIONS
}

export function potentialOptionById(
  slot: GearSlotId,
  optionId: string,
): PotentialOptionDef | undefined {
  return potentialOptionsForSlot(slot).find((o) => o.id === optionId)
}

export function potentialValues(
  slot: GearSlotId,
  optionId: string,
  grade: PotentialGrade,
  lineIndex: number,
): number[] {
  const opt = potentialOptionById(slot, optionId)
  if (!opt) return []
  return lineIndex === 0 ? opt.firstByRank[grade] : opt.laterByRank[grade]
}

export function potentialOptionsAvailable(
  slot: GearSlotId,
  grade: PotentialGrade,
  lineIndex: number,
): PotentialOptionDef[] {
  return potentialOptionsForSlot(slot).filter((o) => {
    const vals = lineIndex === 0 ? o.firstByRank[grade] : o.laterByRank[grade]
    return vals.length > 0
  })
}

export function emptyPotentialLines(): StatLine[] {
  return [{ ...EMPTY_LINE }, { ...EMPTY_LINE }, { ...EMPTY_LINE }]
}

export function normalizePotentialLines(
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
    const values = potentialValues(slot, optionId, grade, idx)
    if (values.length === 0) return { ...EMPTY_LINE }
    const opt = potentialOptionById(slot, optionId)
    const value = values.includes(line.value) ? line.value : values[0]!
    return {
      optionId,
      label: opt?.label ?? line.label,
      value,
    }
  })
}

/** Frame / badge color class by Potential grade (matches gear doll rank palette). */
export function potentialFrameClass(grade: PotentialGrade): string {
  switch (grade) {
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

