/** Port of sim/combat_power.py — Combat.GetRenewalCombat */

export const PERM_DIV = 100_000
export const CRIT_RATE_DIV = 1_000
export const FINAL_DIV = 1_000
export const BASE_ATK_WEIGHT = 0.3
export const BOSS_WEIGHT = 0.3
export const BASE_CRIT_DAMAGE = 0.2
export const CRIT_RATE_RAW_CAP = 1000

export interface CombatInputs {
  attack: number
  attackPermill: number
  damageIncreasePermill: number
  bossAttackPermill: number
  criticalDamageIncreasePermill: number
  criticalIncreaseProbability: number
  totalDamageAdd: number
  totalDamageLimitIncrease?: number
  jobCoeff?: number
  extraAttackFromResult?: number
  extraCritFromResult?: number
}

export interface CombatBreakdown {
  attack: number
  atkRatio: number
  dmgRatio: number
  bossRatio: number
  critDmgRatio: number
  critRate: number
  finalRatio: number
  critMult: number
  atkTerm: number
  raw: number
  scale: number
  combatPower: number
}

export function percentToPerm(percent: number): number {
  return Math.round((percent / 100) * PERM_DIV)
}

export function percentToCritRaw(percent: number): number {
  return Math.round((percent / 100) * CRIT_RATE_DIV)
}

export function calcRenewalCombat(inp: CombatInputs): CombatBreakdown {
  const attack = inp.attack + (inp.extraAttackFromResult ?? 0)
  const atkRatio = inp.attackPermill / PERM_DIV
  const dmgRatio = inp.damageIncreasePermill / PERM_DIV
  const bossRatio = inp.bossAttackPermill / PERM_DIV
  const critDmgRatio = inp.criticalDamageIncreasePermill / PERM_DIV
  const finalRatio = inp.totalDamageAdd / FINAL_DIV

  let critRaw = inp.criticalIncreaseProbability + (inp.extraCritFromResult ?? 0)
  if (critRaw > CRIT_RATE_RAW_CAP) critRaw = CRIT_RATE_RAW_CAP
  const critRate = critRaw / CRIT_RATE_DIV

  const critMult = (critDmgRatio + BASE_CRIT_DAMAGE) * critRate
  const atkTerm = atkRatio + BASE_ATK_WEIGHT + bossRatio * BOSS_WEIGHT

  const raw =
    atkTerm * attack * (1 + dmgRatio) * (1 + finalRatio) * (1 + critMult)

  const jobCoeff = inp.jobCoeff ?? 1
  const exp = (inp.totalDamageLimitIncrease ?? 0) / 100_000_000
  const scale = jobCoeff > 0 ? jobCoeff ** exp : 1
  const combatPower = Math.trunc(raw * scale)

  return {
    attack,
    atkRatio,
    dmgRatio,
    bossRatio,
    critDmgRatio,
    critRate,
    finalRatio,
    critMult,
    atkTerm,
    raw,
    scale,
    combatPower,
  }
}
