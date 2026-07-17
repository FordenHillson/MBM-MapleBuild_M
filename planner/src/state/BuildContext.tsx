import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  atkResolutionToEngine,
  migrateOverridesToSources,
  resolveAtkTotals,
  setEditableSource,
  statsToCombatPower,
} from '../engine/aggregate'
import { calcDamageReduction, defDamageMultiplier } from '../engine/defense'
import { calcBuildDpm, formatCompact, type SkillDpmRow } from '../engine/dpm'
import { deriveFlameBases } from '../engine/resolveStats'
import { aggregateGearPlayerStats } from '../engine/gearStatMap'
import { createBlankSkill, createEmptyBuild, defaultStatSources } from '../data/seed'
import {
  emptyFlameLines,
  isFlameRank,
  isFlameSlot,
  normalizeFlameLines,
} from '../data/flameWeapon'
import {
  isPotentialSlot,
  normalizePotentialGrade,
  normalizePotentialLines,
} from '../data/potentialWeapon'
import { normalizeBonusPotentialLines } from '../data/bonusPotentialWeapon'
import { normalizeEmblem } from '../data/emblems'
import { normalizeSoul } from '../data/souls'
import {
  isArmorBaseGearSlot,
  normalizeArmorMainOption,
  usesArmorMpBase,
} from '../data/armorBaseGear'
import { normalizeHighTierOption } from '../data/highTierOption'
import { normalizeSharenianAbility } from '../data/sharenianAbility'
import { normalizeIconUrl } from '../data/gearIcon'
import type {
  Build,
  BuildId,
  EditableStatSource,
  EnemyTarget,
  GearItem,
  GearSlotId,
  PlannerState,
  PlayerStatKey,
  SkillEntry,
  StatSources,
} from '../types/build'
import { ALL_GEAR_SLOTS, defaultEnemyTarget, defaultFlameBases } from '../types/build'

const STORAGE_KEY = 'msm-build-planner-v1'

function defaultState(): PlannerState {
  return {
    activeBuild: 'A',
    builds: {
      A: createEmptyBuild('A', 'Build A'),
      B: createEmptyBuild('B', 'Build B'),
    },
    enemyTarget: defaultEnemyTarget(),
  }
}

function migrateSkill(raw: SkillEntry & { name?: string }): SkillEntry {
  return {
    skillId: raw.skillId || crypto.randomUUID(),
    name: raw.name?.trim() ? raw.name : raw.skillId || '',
    enabled: raw.enabled ?? true,
    skillPercent: raw.skillPercent ?? 100,
    hitCount: raw.hitCount ?? 1,
    cooldownSec: raw.cooldownSec ?? 1,
    uptimePercent: raw.uptimePercent ?? 100,
  }
}

function migrateEnemyTarget(raw: Partial<EnemyTarget> | undefined): EnemyTarget {
  const base = defaultEnemyTarget()
  if (!raw) return base
  return {
    mode: raw.mode === 'normal' ? 'normal' : 'boss',
    level: Math.min(Math.max(Number(raw.level) || base.level, 1), 300),
    defOverridePercent: Math.max(Number(raw.defOverridePercent) || 0, 0),
    critResPercent: Math.max(Number(raw.critResPercent) || 0, 0),
  }
}

function migrateGearItem(item: GearItem, slotId: GearSlotId): GearItem {
  const flameRank =
    item.flameRank === null
      ? null
      : isFlameRank(item.flameRank)
        ? item.flameRank
        : 'Legendary'
  let mainLines = item.mainLines ?? []
  if (isFlameSlot(slotId) && flameRank) {
    mainLines = normalizeFlameLines(slotId, flameRank, mainLines)
  } else if (isFlameSlot(slotId) && flameRank === null) {
    mainLines = emptyFlameLines()
  }

  const potential =
    item.potential === null
      ? null
      : (() => {
          const potGrade = normalizePotentialGrade(item.potential?.grade)
          const potLines = isPotentialSlot(slotId)
            ? normalizePotentialLines(
                slotId,
                potGrade,
                item.potential?.lines ?? [],
              )
            : (item.potential?.lines ?? [])
          return { grade: potGrade, lines: potLines }
        })()

  const bonusPotential =
    item.bonusPotential === null
      ? null
      : (() => {
          const bonusGrade = normalizePotentialGrade(item.bonusPotential?.grade)
          const bonusLines = isPotentialSlot(slotId)
            ? normalizeBonusPotentialLines(
                slotId,
                bonusGrade,
                item.bonusPotential?.lines ?? [],
              )
            : (item.bonusPotential?.lines ?? [])
          return { grade: bonusGrade, lines: bonusLines }
        })()

  const phyDefBase = Number(item.phyDefBase) || 0
  const magDefBase = isArmorBaseGearSlot(slotId)
    ? phyDefBase
    : Number(item.magDefBase) || 0
  let maxHpBase = Number(item.maxHpBase) || 0
  let maxMpBase = Number(item.maxMpBase) || 0
  if (usesArmorMpBase(slotId) && maxMpBase === 0 && maxHpBase !== 0) {
    maxMpBase = maxHpBase
    maxHpBase = 0
  }
  const maxDamageBase = Number(item.maxDamageBase) || 0

  const highTierOption = isArmorBaseGearSlot(slotId)
      ? normalizeArmorMainOption(slotId, item.rank, item.highTierOption)
      : normalizeHighTierOption(slotId, item.rank, item.highTierOption)

  return {
    ...item,
    slotId,
    phyDefBase,
    magDefBase,
    maxHpBase,
    maxMpBase,
    maxDamageBase,
    flameRank,
    mainLines,
    potential,
    bonusPotential,
    emblem: normalizeEmblem(slotId, item.emblem, item.rank),
    soul: normalizeSoul(slotId, item.soul),
    highTierOption,
    sharenianAbility: normalizeSharenianAbility(
      slotId,
      item.rank,
      item.sharenianAbility,
    ),
    iconUrl: normalizeIconUrl(item.iconUrl),
  }
}

function migrateGear(
  raw: Partial<Record<string, GearItem | null>> | undefined,
): Partial<Record<GearSlotId, GearItem | null>> {
  const src = raw ?? {}
  const out: Partial<Record<GearSlotId, GearItem | null>> = {}

  for (const [key, item] of Object.entries(src)) {
    if (key === 'outfit') {
      if (item) out.outfitTop = migrateGearItem({ ...item, slotId: 'outfitTop' }, 'outfitTop')
      continue
    }
    if (
      key === 'android' ||
      key === 'heart' ||
      key === 'pocket' ||
      key === 'totem'
    ) {
      continue
    }
    if ((ALL_GEAR_SLOTS as string[]).includes(key)) {
      const slot = key as GearSlotId
      out[slot] = item ? migrateGearItem(item, slot) : item
    }
  }

  return out
}

function migrateBuild(build: Build & { statOverrides?: Build['statOverrides'] }): Build {
  let statSources: StatSources
  if (build.statSources && Object.keys(build.statSources).length > 0) {
    statSources = build.statSources
  } else if (build.statOverrides) {
    statSources = migrateOverridesToSources(build.statOverrides)
  } else {
    statSources = defaultStatSources()
  }

  return {
    id: build.id,
    name: build.name,
    jobId: build.jobId || 'custom',
    characterLevel: Math.min(
      Math.max(Number(build.characterLevel) || 250, 1),
      300,
    ),
    skills: (build.skills ?? []).map((s) => migrateSkill(s)),
    gear: migrateGear(build.gear as Partial<Record<string, GearItem | null>>),
    statSources,
    flameBases: migrateFlameBases(build.flameBases),
  }
}

function migrateFlameBases(
  raw: Build['flameBases'] | undefined,
): Build['flameBases'] {
  const base = defaultFlameBases()
  if (!raw) return base
  return {
    maxHp: Math.max(Number(raw.maxHp) || base.maxHp, 0),
    maxMp: Math.max(Number(raw.maxMp) || base.maxMp, 0),
    expPercent: Math.max(Number(raw.expPercent) || 0, 0),
  }
}

function migrateState(parsed: PlannerState): PlannerState {
  return {
    activeBuild: parsed.activeBuild === 'B' ? 'B' : 'A',
    builds: {
      A: migrateBuild(parsed.builds?.A ?? createEmptyBuild('A', 'Build A')),
      B: migrateBuild(parsed.builds?.B ?? createEmptyBuild('B', 'Build B')),
    },
    enemyTarget: migrateEnemyTarget(parsed.enemyTarget),
  }
}

function loadState(): PlannerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    return migrateState(JSON.parse(raw) as PlannerState)
  } catch {
    return defaultState()
  }
}

interface BuildContextValue {
  state: PlannerState
  active: Build
  setActiveBuild: (id: BuildId) => void
  updateActive: (patch: Partial<Build>) => void
  setEnemyTarget: (patch: Partial<EnemyTarget>) => void
  setGear: (slot: GearSlotId, item: GearItem | null) => void
  setSkill: (skillId: string, patch: Partial<SkillEntry>) => void
  addSkill: () => void
  removeSkill: (skillId: string) => void
  setStatSource: (
    key: PlayerStatKey,
    source: EditableStatSource,
    value: number,
  ) => void
  resetBuilds: () => void
  exportJson: () => string
  importJson: (raw: string) => void
  metrics: {
    a: { dpm: number; cp: number; label: string }
    b: { dpm: number; cp: number; label: string }
    deltaPct: number
    activeDpm: number
    activeDpmLabel: string
    activeCpLabel: string
    activeRows: SkillDpmRow[]
    damageReduction: number
    defMultiplier: number
  }
}

const BuildContext = createContext<BuildContextValue | null>(null)

function metricsFor(build: Build, enemy: EnemyTarget) {
  const gearStats = aggregateGearPlayerStats(build.gear)
  const flameBases = deriveFlameBases(build.statSources, gearStats)
  const resolved = resolveAtkTotals(build.gear, build.statSources, flameBases)
  const stats = atkResolutionToEngine(resolved)
  if (stats.attack <= 0) stats.attack = 10000
  const ctx = { enemy, characterLevel: build.characterLevel }
  const { totalDpm, rows } = calcBuildDpm(stats, build.skills, ctx)
  const cp = statsToCombatPower(stats).combatPower
  const dr = calcDamageReduction({
    characterLevel: build.characterLevel,
    targetLevel: enemy.level,
    mode: enemy.mode,
    defOverridePercent: enemy.defOverridePercent,
  })
  const defMult = defDamageMultiplier(
    dr.damageReduction,
    stats.ignoreDefPercent,
  )
  return {
    dpm: totalDpm,
    cp,
    rows,
    stats,
    resolved,
    flameBases,
    damageReduction: dr.damageReduction,
    defMultiplier: defMult,
  }
}

export function BuildProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlannerState>(() => loadState())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const active = state.builds[state.activeBuild]

  const setActiveBuild = useCallback((id: BuildId) => {
    setState((s) => ({ ...s, activeBuild: id }))
  }, [])

  const updateActive = useCallback((patch: Partial<Build>) => {
    setState((s) => {
      const cur = s.builds[s.activeBuild]
      return {
        ...s,
        builds: {
          ...s.builds,
          [s.activeBuild]: { ...cur, ...patch },
        },
      }
    })
  }, [])

  const setEnemyTarget = useCallback((patch: Partial<EnemyTarget>) => {
    setState((s) => ({
      ...s,
      enemyTarget: migrateEnemyTarget({ ...s.enemyTarget, ...patch }),
    }))
  }, [])

  const setGear = useCallback((slot: GearSlotId, item: GearItem | null) => {
    setState((s) => {
      const cur = s.builds[s.activeBuild]
      const gear = { ...cur.gear, [slot]: item }

      // Root Abyss is a Top+Bottom pair — sync partner rank when equipping
      if (
        item?.rank === 'Root Abyss' &&
        (slot === 'outfitTop' || slot === 'outfitBottom')
      ) {
        const partner = slot === 'outfitTop' ? 'outfitBottom' : 'outfitTop'
        const partnerItem = gear[partner]
        if (partnerItem && partnerItem.rank !== 'Root Abyss') {
          gear[partner] = { ...partnerItem, rank: 'Root Abyss' }
        }
      }

      return {
        ...s,
        builds: {
          ...s.builds,
          [s.activeBuild]: {
            ...cur,
            gear,
          },
        },
      }
    })
  }, [])

  const setSkill = useCallback((skillId: string, patch: Partial<SkillEntry>) => {
    setState((s) => {
      const cur = s.builds[s.activeBuild]
      return {
        ...s,
        builds: {
          ...s.builds,
          [s.activeBuild]: {
            ...cur,
            skills: cur.skills.map((sk) =>
              sk.skillId === skillId ? { ...sk, ...patch } : sk,
            ),
          },
        },
      }
    })
  }, [])

  const addSkill = useCallback(() => {
    setState((s) => {
      const cur = s.builds[s.activeBuild]
      return {
        ...s,
        builds: {
          ...s.builds,
          [s.activeBuild]: {
            ...cur,
            skills: [...cur.skills, createBlankSkill()],
          },
        },
      }
    })
  }, [])

  const removeSkill = useCallback((skillId: string) => {
    setState((s) => {
      const cur = s.builds[s.activeBuild]
      return {
        ...s,
        builds: {
          ...s.builds,
          [s.activeBuild]: {
            ...cur,
            skills: cur.skills.filter((sk) => sk.skillId !== skillId),
          },
        },
      }
    })
  }, [])

  const setStatSource = useCallback(
    (key: PlayerStatKey, source: EditableStatSource, value: number) => {
      setState((s) => {
        const cur = s.builds[s.activeBuild]
        return {
          ...s,
          builds: {
            ...s.builds,
            [s.activeBuild]: {
              ...cur,
              statSources: setEditableSource(cur.statSources ?? {}, key, source, value),
            },
          },
        }
      })
    },
    [],
  )

  const resetBuilds = useCallback(() => setState(defaultState()), [])

  const exportJson = useCallback(() => JSON.stringify(state, null, 2), [state])

  const importJson = useCallback((raw: string) => {
    setState(migrateState(JSON.parse(raw) as PlannerState))
  }, [])

  const metrics = useMemo(() => {
    const enemy = state.enemyTarget
    const a = metricsFor(state.builds.A, enemy)
    const b = metricsFor(state.builds.B, enemy)
    const deltaPct = a.dpm === 0 ? 0 : ((b.dpm - a.dpm) / a.dpm) * 100
    const activeM = state.activeBuild === 'A' ? a : b
    return {
      a: { dpm: a.dpm, cp: a.cp, label: formatCompact(a.dpm) },
      b: { dpm: b.dpm, cp: b.cp, label: formatCompact(b.dpm) },
      deltaPct,
      activeDpm: activeM.dpm,
      activeDpmLabel: formatCompact(activeM.dpm),
      activeCpLabel: formatCompact(activeM.cp),
      activeRows: activeM.rows,
      damageReduction: activeM.damageReduction,
      defMultiplier: activeM.defMultiplier,
    }
  }, [state])

  const value: BuildContextValue = {
    state,
    active,
    setActiveBuild,
    updateActive,
    setEnemyTarget,
    setGear,
    setSkill,
    addSkill,
    removeSkill,
    setStatSource,
    resetBuilds,
    exportJson,
    importJson,
    metrics,
  }

  return <BuildContext.Provider value={value}>{children}</BuildContext.Provider>
}

export function useBuilds() {
  const ctx = useContext(BuildContext)
  if (!ctx) throw new Error('useBuilds outside provider')
  return ctx
}
