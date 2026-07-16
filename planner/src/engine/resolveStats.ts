import type {
  EditableStatSource,
  FlameBases,
  PlayerStatKey,
  StatSources,
} from '../types/build'

export interface StatBreakdown {
  equipment: number
  character: number
  skill: number
  growth: number
  content: number
  total: number
}

function sourceValue(
  sources: StatSources | undefined,
  key: PlayerStatKey,
  source: EditableStatSource,
): number {
  return sources?.[key]?.[source] ?? 0
}

export function resolveStatRow(
  sources: StatSources | undefined,
  key: PlayerStatKey,
  equipment = 0,
): StatBreakdown {
  const character = sourceValue(sources, key, 'character')
  const skill = sourceValue(sources, key, 'skill')
  const growth = sourceValue(sources, key, 'growth')
  const content = sourceValue(sources, key, 'content')
  return {
    equipment,
    character,
    skill,
    growth,
    content,
    total: equipment + character + skill + growth + content,
  }
}

export function resolveCategoryTotals(
  keys: readonly PlayerStatKey[],
  sources: StatSources | undefined,
  equipmentByKey?: Partial<Record<PlayerStatKey, number>>,
): Partial<Record<PlayerStatKey, StatBreakdown>> {
  const out: Partial<Record<PlayerStatKey, StatBreakdown>> = {}
  for (const key of keys) {
    out[key] = resolveStatRow(sources, key, equipmentByKey?.[key] ?? 0)
  }
  return out
}

/** Effective Max HP / MP / EXP% for Flame scales-with. */
export function deriveFlameBases(
  sources: StatSources | undefined,
  equipmentByKey?: Partial<Record<PlayerStatKey, number>>,
): FlameBases {
  const eq = (key: PlayerStatKey) => equipmentByKey?.[key] ?? 0
  const maxHpFlat = resolveStatRow(sources, 'maxHp', eq('maxHp')).total
  const maxHpPct = resolveStatRow(sources, 'maxHpPercent', eq('maxHpPercent')).total
  const maxMpFlat = resolveStatRow(sources, 'maxMp', eq('maxMp')).total
  const maxMpPct = resolveStatRow(sources, 'maxMpPercent', eq('maxMpPercent')).total
  const expGain = resolveStatRow(
    sources,
    'expGainPercent',
    eq('expGainPercent'),
  ).total

  return {
    maxHp: maxHpFlat * (1 + maxHpPct / 100),
    maxMp: maxMpFlat * (1 + maxMpPct / 100),
    expPercent: Math.min(Math.max(expGain, 0), 400),
  }
}
