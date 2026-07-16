import type {
  AggregatedStats,
  AtkStatBag,
  AtkStatKey,
  EditableStatSource,
  FlameBases,
  GearItem,
  GearSlotId,
  PlayerStatKey,
  StatLine,
  StatSources,
} from '../types/build'
import {
  ATK_PERCENT_KEYS,
  ATK_STAT_KEYS,
} from '../types/build'
import { isFlameSlot } from '../data/flameWeapon'
import { applyFlameScales, mergeAtkBag } from './flameScale'
import {
  aggregateGearPlayerStats,
  pickAtkBag,
} from './gearStatMap'
import { deriveFlameBases } from './resolveStats'
import { percentToCritRaw, percentToPerm } from './combatPower'
import { calcRenewalCombat } from './combatPower'

const EDITABLE: EditableStatSource[] = [
  'character',
  'skill',
  'growth',
  'content',
]

export function emptyAtkBag(): AtkStatBag {
  return {
    phyAtk: 0,
    phyAtkPercent: 0,
    phyDmgPercent: 0,
    magAtk: 0,
    magAtkPercent: 0,
    magDmgPercent: 0,
    bossAtkPercent: 0,
    critAtk: 0,
    critRate: 0,
    critDmgPercent: 0,
    maxDamage: 0,
    finalPercent: 0,
    ignoreDefPercent: 0,
  }
}

/** Equipment contribution — percents as percentage points. Flame scale lines skipped. */
export function aggregateGearAtk(
  gear: Partial<Record<GearSlotId, GearItem | null>>,
): AtkStatBag {
  return pickAtkBag(aggregateGearPlayerStats(gear))
}

export function collectFlameLines(
  gear: Partial<Record<GearSlotId, GearItem | null>>,
): StatLine[] {
  const lines: StatLine[] = []
  for (const item of Object.values(gear)) {
    if (!item || !isFlameSlot(item.slotId)) continue
    for (const line of item.mainLines) {
      if (line.optionId) lines.push(line)
    }
  }
  return lines
}

/** @deprecated use aggregateGearAtk + resolveAtkTotals */
export function aggregateGear(
  gear: Partial<Record<GearSlotId, GearItem | null>>,
): AggregatedStats {
  const atk = aggregateGearAtk(gear)
  return atkMapToEngine(atk)
}

export interface AtkBreakdown {
  equipment: number
  character: number
  skill: number
  growth: number
  content: number
  total: number
}

export type AtkResolution = Record<AtkStatKey, AtkBreakdown>

export function emptyStatSources(): StatSources {
  return {}
}

export function getSourceValue(
  sources: StatSources | undefined,
  key: PlayerStatKey,
  source: EditableStatSource,
): number {
  return sources?.[key]?.[source] ?? 0
}

export function resolveAtkTotals(
  gear: Partial<Record<GearSlotId, GearItem | null>>,
  sources: StatSources | undefined,
  flameBases?: FlameBases,
): AtkResolution {
  let equipment = aggregateGearAtk(gear)

  const prelim = {} as AtkResolution
  for (const key of ATK_STAT_KEYS) {
    const character = getSourceValue(sources, key, 'character')
    const skill = getSourceValue(sources, key, 'skill')
    const growth = getSourceValue(sources, key, 'growth')
    const content = getSourceValue(sources, key, 'content')
    const eq = equipment[key]
    prelim[key] = {
      equipment: eq,
      character,
      skill,
      growth,
      content,
      total: eq + character + skill + growth + content,
    }
  }

  const bases =
    flameBases ??
    deriveFlameBases(sources, aggregateGearPlayerStats(gear))
  const flameBonus = applyFlameScales(
    {
      maxHp: bases.maxHp,
      maxMp: bases.maxMp,
      expPercent: bases.expPercent,
      bossAtkPercent: prelim.bossAtkPercent.total,
      critRate: prelim.critRate.total,
      critDmgPercent: prelim.critDmgPercent.total,
    },
    collectFlameLines(gear),
  )
  equipment = mergeAtkBag(equipment, flameBonus)

  const out = {} as AtkResolution
  for (const key of ATK_STAT_KEYS) {
    const character = getSourceValue(sources, key, 'character')
    const skill = getSourceValue(sources, key, 'skill')
    const growth = getSourceValue(sources, key, 'growth')
    const content = getSourceValue(sources, key, 'content')
    const eq = equipment[key]
    out[key] = {
      equipment: eq,
      character,
      skill,
      growth,
      content,
      total: eq + character + skill + growth + content,
    }
  }

  return out
}

/** Convert resolved ATK totals into engine AggregatedStats (ratios 0–1). */
export function atkResolutionToEngine(res: AtkResolution): AggregatedStats {
  const pct = (n: number) => n / 100
  return {
    attack: res.phyAtk.total,
    atkPercent: pct(res.phyAtkPercent.total),
    dmgPercent: pct(res.phyDmgPercent.total),
    bossAtkPercent: pct(res.bossAtkPercent.total),
    critRate: pct(res.critRate.total),
    critDmgPercent: pct(res.critDmgPercent.total),
    finalPercent: pct(res.finalPercent.total),
    ignoreDefPercent: pct(res.ignoreDefPercent.total),
    maxDamage: res.maxDamage.total,
  }
}

export function atkMapToEngine(bag: AtkStatBag): AggregatedStats {
  const pct = (n: number) => n / 100
  return {
    attack: bag.phyAtk,
    atkPercent: pct(bag.phyAtkPercent),
    dmgPercent: pct(bag.phyDmgPercent),
    bossAtkPercent: pct(bag.bossAtkPercent),
    critRate: pct(bag.critRate),
    critDmgPercent: pct(bag.critDmgPercent),
    finalPercent: pct(bag.finalPercent),
    ignoreDefPercent: pct(bag.ignoreDefPercent),
    maxDamage: bag.maxDamage,
  }
}

export function setEditableSource(
  sources: StatSources,
  key: PlayerStatKey,
  source: EditableStatSource,
  value: number,
): StatSources {
  const prev = sources[key] ?? {}
  return {
    ...sources,
    [key]: { ...prev, [source]: value },
  }
}

/** Migrate old ratio-based overrides into character percentage points / flats. */
export function migrateOverridesToSources(
  overrides?: Partial<AggregatedStats>,
): StatSources {
  if (!overrides) return {}
  const sources: StatSources = {}
  const put = (key: AtkStatKey, value: number) => {
    sources[key] = { ...(sources[key] ?? {}), character: value }
  }
  if (overrides.attack != null) put('phyAtk', overrides.attack)
  if (overrides.atkPercent != null) put('phyAtkPercent', overrides.atkPercent * 100)
  if (overrides.dmgPercent != null) put('phyDmgPercent', overrides.dmgPercent * 100)
  if (overrides.bossAtkPercent != null)
    put('bossAtkPercent', overrides.bossAtkPercent * 100)
  if (overrides.critRate != null) put('critRate', overrides.critRate * 100)
  if (overrides.critDmgPercent != null)
    put('critDmgPercent', overrides.critDmgPercent * 100)
  if (overrides.finalPercent != null)
    put('finalPercent', overrides.finalPercent * 100)
  return sources
}

export function isPercentAtkKey(key: AtkStatKey): boolean {
  return ATK_PERCENT_KEYS.has(key)
}

export { EDITABLE }

export function statsToCombatPower(stats: AggregatedStats) {
  return calcRenewalCombat({
    attack: Math.round(stats.attack),
    attackPermill: percentToPerm(stats.atkPercent * 100),
    damageIncreasePermill: percentToPerm(stats.dmgPercent * 100),
    bossAttackPermill: percentToPerm(stats.bossAtkPercent * 100),
    criticalDamageIncreasePermill: percentToPerm(stats.critDmgPercent * 100),
    criticalIncreaseProbability: percentToCritRaw(stats.critRate * 100),
    totalDamageAdd: Math.round(stats.finalPercent * 1000),
    jobCoeff: 1,
  })
}
