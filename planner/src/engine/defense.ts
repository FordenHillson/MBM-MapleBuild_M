import {
  DEFENSE_RATING_BY_LEVEL,
  DEFENSE_RATING_MAX_LEVEL,
} from '../data/defenseRating'
import type { EnemyMode } from '../types/build'

/** Mob sheet columns use ~1/9 of boss TargetDefense. */
export const MOB_DEFENSE_SCALE = 1 / 9

export function defenseRatingAt(level: number): number {
  const lv = Math.min(
    Math.max(Math.round(level), 1),
    DEFENSE_RATING_MAX_LEVEL,
  )
  if (DEFENSE_RATING_BY_LEVEL[lv] != null) return DEFENSE_RATING_BY_LEVEL[lv]
  // fallback: nearest lower known level
  for (let i = lv; i >= 1; i--) {
    if (DEFENSE_RATING_BY_LEVEL[i] != null) return DEFENSE_RATING_BY_LEVEL[i]
  }
  return 0
}

export interface DamageReductionInput {
  characterLevel: number
  targetLevel: number
  mode: EnemyMode
  /** Percentage points. 0 = use level table; >0 = absolute DR%. */
  defOverridePercent: number
}

export interface DamageReductionResult {
  yourDr: number
  targetDefense: number
  /** 0–1 ratio */
  damageReduction: number
  usedOverride: boolean
}

/**
 * DR% = TargetDefense / (YourDR + TargetDefenseRating)
 * Override > 0 replaces DR% entirely (Sage Rock DEF slider).
 * Normal (mob): numerator ≈ rating/9 but denominator still uses full rating (sheet).
 */
export function calcDamageReduction(inp: DamageReductionInput): DamageReductionResult {
  const yourDr = defenseRatingAt(inp.characterLevel)
  const targetRating = defenseRatingAt(inp.targetLevel)
  const targetDefense =
    inp.mode === 'normal' ? targetRating * MOB_DEFENSE_SCALE : targetRating

  if (inp.defOverridePercent > 0) {
    return {
      yourDr,
      targetDefense,
      damageReduction: Math.min(inp.defOverridePercent / 100, 1),
      usedOverride: true,
    }
  }

  // Sheet TotalDR columns use full target DefenseRating in the denominator.
  const denom = yourDr + targetRating
  const damageReduction = denom > 0 ? targetDefense / denom : 0
  return {
    yourDr,
    targetDefense,
    damageReduction,
    usedOverride: false,
  }
}

/** effectiveDR = DR * (1 - IED); mult = max(0, 1 - effectiveDR) */
export function defDamageMultiplier(
  damageReduction: number,
  ignoreDefRatio: number,
): number {
  const ied = Math.min(Math.max(ignoreDefRatio, 0), 1)
  const effectiveDr = Math.min(Math.max(damageReduction, 0), 1) * (1 - ied)
  return Math.max(0, 1 - effectiveDr)
}
