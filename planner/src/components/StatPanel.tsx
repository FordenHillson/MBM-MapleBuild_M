import { useMemo, useState } from 'react'
import { resolveAtkTotals } from '../engine/aggregate'
import { aggregateGearPlayerStats } from '../engine/gearStatMap'
import {
  resolveCategoryTotals,
  deriveFlameBases,
  type StatBreakdown,
} from '../engine/resolveStats'
import { useBuilds } from '../state/BuildContext'
import {
  ACQUIRE_STAT_KEYS,
  ACQUIRE_STAT_LABELS,
  ATK_STAT_KEYS,
  ATK_STAT_LABELS,
  CHANCE_STAT_KEYS,
  CHANCE_STAT_LABELS,
  DEF_STAT_KEYS,
  DEF_STAT_LABELS,
  OTHER_STAT_KEYS,
  OTHER_STAT_LABELS,
  PLAYER_PERCENT_KEYS,
  RESOURCE_STAT_KEYS,
  RESOURCE_STAT_LABELS,
  type EditableStatSource,
  type PlayerStatKey,
} from '../types/build'
import './StatPanel.css'

type CatId = 'atk' | 'def' | 'chance' | 'resource' | 'acquire' | 'other'

const CATEGORIES: { id: CatId; label: string }[] = [
  { id: 'atk', label: 'ประเภท ATK' },
  { id: 'def', label: 'ประเภท DEF' },
  { id: 'chance', label: 'โอกาสสำเร็จ/ล้มเหลว' },
  { id: 'resource', label: 'ทรัพยากร' },
  { id: 'acquire', label: 'การได้รับ' },
  { id: 'other', label: 'อื่นๆ' },
]

const SOURCE_ROWS: {
  key: EditableStatSource | 'equipment'
  label: string
  editable: boolean
}[] = [
  { key: 'character', label: 'ตัวละคร', editable: true },
  { key: 'equipment', label: 'อุปกรณ์', editable: false },
  { key: 'skill', label: 'สกิล', editable: true },
  { key: 'growth', label: 'การเติบโต', editable: true },
  { key: 'content', label: 'คอนเทนต์', editable: true },
]

const CAT_META: Record<
  Exclude<CatId, 'atk'>,
  {
    title: string
    hint: string
    keys: readonly PlayerStatKey[]
    labels: Record<string, string>
  }
> = {
  def: {
    title: 'ประเภท DEF',
    hint: 'ส่วนย่อยเหมือน ATK · อุปกรณ์มาจากแท็บ Gear (เมื่อมีออฟที่ map)',
    keys: DEF_STAT_KEYS,
    labels: DEF_STAT_LABELS,
  },
  chance: {
    title: 'โอกาสสำเร็จ/ล้มเหลว',
    hint: 'ACC / EVD / PEN / Block · อุปกรณ์มาจากแท็บ Gear',
    keys: CHANCE_STAT_KEYS,
    labels: CHANCE_STAT_LABELS,
  },
  resource: {
    title: 'ทรัพยากร',
    hint: 'HP/MP สูงสุดใช้เป็นฐาน Flame (Max HP × (1+HP%)) · รวมอุปกรณ์จาก Gear',
    keys: RESOURCE_STAT_KEYS,
    labels: RESOURCE_STAT_LABELS,
  },
  acquire: {
    title: 'การได้รับ',
    hint: 'EXP % เป็นฐาน Flame scales-with EXP (แคป 400%) · รวมอุปกรณ์จาก Gear',
    keys: ACQUIRE_STAT_KEYS,
    labels: ACQUIRE_STAT_LABELS,
  },
  other: {
    title: 'อื่นๆ',
    hint: 'SPD / JMP / KBK RES · อุปกรณ์มาจากแท็บ Gear (เมื่อมีออฟที่ map)',
    keys: OTHER_STAT_KEYS,
    labels: OTHER_STAT_LABELS,
  },
}

function formatStat(key: PlayerStatKey, value: number): string {
  if (PLAYER_PERCENT_KEYS.has(key)) return `${value.toFixed(2)}%`
  if (key === 'buffItemDurationSec' || key === 'feverDurationSec') {
    return `${Math.round(value)} วินาที`
  }
  return Math.round(value).toLocaleString()
}

function StatRows({
  keys,
  labels,
  rows,
  expanded,
  setExpanded,
  setStatSource,
}: {
  keys: readonly PlayerStatKey[]
  labels: Record<string, string>
  rows: Partial<Record<PlayerStatKey, StatBreakdown>>
  expanded: PlayerStatKey | null
  setExpanded: (k: PlayerStatKey | null) => void
  setStatSource: (
    key: PlayerStatKey,
    source: EditableStatSource,
    value: number,
  ) => void
}) {
  return (
    <div className="stat-atk-list">
      {keys.map((key) => {
        const row = rows[key] ?? {
          equipment: 0,
          character: 0,
          skill: 0,
          growth: 0,
          content: 0,
          total: 0,
        }
        const open = expanded === key
        return (
          <div key={key} className={`stat-atk-block ${open ? 'open' : ''}`}>
            <button
              type="button"
              className="stat-atk-summary"
              onClick={() => setExpanded(open ? null : key)}
            >
              <span>{labels[key] ?? key}</span>
              <span className="stat-atk-total">
                {formatStat(key, row.total)}
                <span className={`tri ${open ? 'up' : ''}`}>▾</span>
              </span>
            </button>

            {open && (
              <div className="stat-atk-sources">
                {SOURCE_ROWS.map((src) => {
                  const value =
                    src.key === 'equipment' ? row.equipment : row[src.key]
                  return (
                    <div className="stat-source-row" key={src.key}>
                      <span className="bullet">•</span>
                      <span className="src-label">{src.label}</span>
                      {src.editable ? (
                        <input
                          type="number"
                          step={PLAYER_PERCENT_KEYS.has(key) ? 0.01 : 1}
                          value={Number(value.toFixed(4))}
                          onChange={(e) =>
                            setStatSource(
                              key,
                              src.key as EditableStatSource,
                              Number(e.target.value),
                            )
                          }
                        />
                      ) : (
                        <span className="src-readonly">
                          {formatStat(key, value)}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function StatPanel() {
  const { active, setStatSource } = useBuilds()
  const [cat, setCat] = useState<CatId>('atk')
  const [expanded, setExpanded] = useState<PlayerStatKey | null>('phyAtk')

  const gearStats = useMemo(
    () => aggregateGearPlayerStats(active.gear),
    [active.gear],
  )

  const flameBases = useMemo(
    () => deriveFlameBases(active.statSources, gearStats),
    [active.statSources, gearStats],
  )

  const atkResolved = useMemo(
    () => resolveAtkTotals(active.gear, active.statSources, flameBases),
    [active.gear, active.statSources, flameBases],
  )

  const categoryRows = useMemo(() => {
    if (cat === 'atk') return null
    return resolveCategoryTotals(
      CAT_META[cat].keys,
      active.statSources,
      gearStats,
    )
  }, [cat, active.statSources, gearStats])

  return (
    <div className="stat-layout">
      <aside className="stat-cats">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`stat-cat ${cat === c.id ? 'on' : ''}`}
            onClick={() => setCat(c.id)}
          >
            <span>{c.label}</span>
            <span className="chev">›</span>
          </button>
        ))}
      </aside>

      <div className="stat-main">
        {cat === 'atk' ? (
          <>
            <header className="stat-main-head">
              <h3>ประเภท ATK</h3>
              <p className="hint">
                ตัวละคร/สกิล/การเติบโต/คอนเทนต์ กรอกได้ · อุปกรณ์มาจากแท็บ Gear ·
                Flame scales จาก ATK + HP/MP (ทรัพยากร) + EXP (การได้รับ)
              </p>
            </header>
            <StatRows
              keys={ATK_STAT_KEYS}
              labels={ATK_STAT_LABELS}
              rows={atkResolved}
              expanded={expanded}
              setExpanded={setExpanded}
              setStatSource={setStatSource}
            />
          </>
        ) : (
          <>
            <header className="stat-main-head">
              <h3>{CAT_META[cat].title}</h3>
              <p className="hint">{CAT_META[cat].hint}</p>
              {cat === 'resource' && (
                <p className="hint mono">
                  Flame Max HP = {Math.round(flameBases.maxHp).toLocaleString()} ·
                  Max MP = {Math.round(flameBases.maxMp).toLocaleString()}
                </p>
              )}
              {cat === 'acquire' && (
                <p className="hint mono">
                  Flame EXP base = {flameBases.expPercent.toFixed(2)}%
                </p>
              )}
            </header>
            <StatRows
              keys={CAT_META[cat].keys}
              labels={CAT_META[cat].labels}
              rows={categoryRows ?? {}}
              expanded={expanded}
              setExpanded={setExpanded}
              setStatSource={setStatSource}
            />
          </>
        )}
      </div>
    </div>
  )
}
