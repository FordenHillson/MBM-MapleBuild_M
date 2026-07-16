import { calcDamageLine } from './damageLine'
import { calcDamageReduction, defDamageMultiplier } from './defense'
import type {
  AggregatedStats,
  EnemyTarget,
  SkillEntry,
} from '../types/build'

export interface SkillDpmRow {
  skillId: string
  label: string
  averageLine: number
  avgPerHit: number
  minPerHit: number
  maxPerHit: number
  castsPerMin: number
  hitsPerMin: number
  dpm: number
  share: number
}

export interface DpmContext {
  enemy: EnemyTarget
  characterLevel: number
}

export function calcSkillDpm(
  stats: AggregatedStats,
  skill: SkillEntry,
  ctx: DpmContext,
): Omit<SkillDpmRow, 'share'> {
  const skillRatio = skill.skillPercent / 100
  const hits = Math.max(skill.hitCount, 1)
  const isBoss = ctx.enemy.mode === 'boss'

  const dr = calcDamageReduction({
    characterLevel: ctx.characterLevel,
    targetLevel: ctx.enemy.level,
    mode: ctx.enemy.mode,
    defOverridePercent: ctx.enemy.defOverridePercent,
  })
  const defMult = defDamageMultiplier(dr.damageReduction, stats.ignoreDefPercent)
  const critRes = ctx.enemy.critResPercent / 100
  const damageCap = stats.maxDamage > 0 ? stats.maxDamage : null

  const line = calcDamageLine({
    attack: stats.attack,
    atkPercent: stats.atkPercent,
    dmgPercent: stats.dmgPercent,
    bossAtkPercent: stats.bossAtkPercent,
    finalPercent: stats.finalPercent,
    skillPercent: skillRatio,
    critRate: stats.critRate,
    critDmgPercent: stats.critDmgPercent,
    hitCount: hits,
    isBoss,
    critRes,
    defMultiplier: defMult,
    damageCap,
  })

  const cycleSec = Math.max(skill.cooldownSec, 0.1)
  const uptime = Math.min(Math.max(skill.uptimePercent, 0), 100) / 100
  const castsPerMin = (60 / cycleSec) * uptime
  const dpm = line.average * castsPerMin

  return {
    skillId: skill.skillId,
    label: skill.name.trim() || skill.skillId,
    averageLine: line.average,
    avgPerHit: line.avgPerHit,
    minPerHit: line.minPerHit,
    maxPerHit: line.maxPerHit,
    castsPerMin,
    hitsPerMin: hits * castsPerMin,
    dpm,
  }
}

export function calcBuildDpm(
  stats: AggregatedStats,
  skills: SkillEntry[],
  ctx: DpmContext,
): { totalDpm: number; rows: SkillDpmRow[] } {
  const raw = skills
    .filter((s) => s.enabled)
    .map((s) => calcSkillDpm(stats, s, ctx))
  const totalDpm = raw.reduce((sum, r) => sum + r.dpm, 0)
  const rows = raw
    .map((r) => ({
      ...r,
      share: totalDpm > 0 ? r.dpm / totalDpm : 0,
    }))
    .sort((a, b) => b.dpm - a.dpm)
  return { totalDpm, rows }
}

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return '—'
  const abs = Math.abs(n)
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return Math.round(n).toLocaleString()
}
