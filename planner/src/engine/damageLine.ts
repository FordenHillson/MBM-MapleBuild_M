/** Port of sim/damage_line.py — community sheet estimate */

export const BASE_CRIT_DAMAGE = 0.2
/** Community sheet: crit line variance CD+0% … CD+50% */
export const CRIT_DMG_VARIANCE_MAX = 0.5

export interface DamageInputs {
  attack: number
  atkPercent?: number
  dmgPercent?: number
  bossAtkPercent?: number
  finalPercent?: number
  skillPercent?: number
  critRate?: number
  critDmgPercent?: number
  hitCount?: number
  isBoss?: boolean
  damageCap?: number | null
  critRes?: number
  /** Multiplier after DEF/IED (default 1 = no DEF). */
  defMultiplier?: number
}

export interface DamageBreakdown {
  nonCrit: number
  /** Mid crit (CD+0% extra) */
  crit: number
  /** Crit at CD+50% */
  critMax: number
  average: number
  effectiveCritRate: number
  minPerHit: number
  maxPerHit: number
  avgPerHit: number
}

export function calcDamageLine(inp: DamageInputs): DamageBreakdown {
  const atkPercent = inp.atkPercent ?? 0
  const dmgPercent = inp.dmgPercent ?? 0
  const bossAtkPercent = inp.bossAtkPercent ?? 0
  const finalPercent = inp.finalPercent ?? 0
  const skillPercent = inp.skillPercent ?? 1
  const critRate = inp.critRate ?? 0
  const critDmgPercent = inp.critDmgPercent ?? 0
  const hitCount = Math.max(inp.hitCount ?? 1, 1)
  const isBoss = inp.isBoss ?? true
  const critRes = inp.critRes ?? 0
  const defMult = inp.defMultiplier ?? 1

  const bossTerm = isBoss ? skillPercent * bossAtkPercent : 0
  let nonCrit =
    inp.attack *
    (1 + dmgPercent) *
    (1 + atkPercent + bossTerm) *
    skillPercent *
    (1 + finalPercent) *
    hitCount *
    defMult

  let crit = nonCrit * (1 + BASE_CRIT_DAMAGE + critDmgPercent)
  let critMax =
    nonCrit * (1 + BASE_CRIT_DAMAGE + critDmgPercent + CRIT_DMG_VARIANCE_MAX)

  let effectiveCritRate: number
  if (critRes > 0) {
    if (critRes >= critRate) effectiveCritRate = 0
    else effectiveCritRate = Math.min(critRate - critRes, 0.9)
  } else {
    effectiveCritRate = Math.min(critRate, 1)
  }

  let average =
    (1 - effectiveCritRate) * nonCrit + effectiveCritRate * crit

  if (inp.damageCap != null && inp.damageCap > 0) {
    const cappedCrit = Math.min(crit, inp.damageCap)
    const cappedMax = Math.min(critMax, inp.damageCap)
    average =
      (1 - effectiveCritRate) * nonCrit + effectiveCritRate * cappedCrit
    crit = cappedCrit
    critMax = cappedMax
  }

  return {
    nonCrit,
    crit,
    critMax,
    average,
    effectiveCritRate,
    minPerHit: nonCrit / hitCount,
    maxPerHit: critMax / hitCount,
    avgPerHit: average / hitCount,
  }
}
