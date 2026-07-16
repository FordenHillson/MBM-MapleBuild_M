import { calcDamageReduction } from '../engine/defense'
import { formatCompact } from '../engine/dpm'
import { DEFENSE_RATING_MAX_LEVEL } from '../data/defenseRating'
import { useBuilds } from '../state/BuildContext'
import './SummaryPanel.css'

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min
  return Math.min(Math.max(Math.round(n), min), max)
}

export function SummaryPanel() {
  const { metrics, state, active, setEnemyTarget, updateActive } = useBuilds()
  const enemy = state.enemyTarget
  const delta = metrics.deltaPct
  const better = delta >= 0 ? 'B' : 'A'
  const dps = metrics.activeDpm / 60

  const drInfo = calcDamageReduction({
    characterLevel: active.characterLevel,
    targetLevel: enemy.level,
    mode: enemy.mode,
    defOverridePercent: enemy.defOverridePercent,
  })

  return (
    <aside className="summary-panel" aria-label="Combat estimate cockpit">
      <header className="summary-cockpit-head">
        <span className="summary-cockpit-title">Combat Estimate</span>
        <span className="summary-window">01:00</span>
      </header>

      <section className="summary-enemy" aria-label="Enemy target">
        <div className="summary-section-label">Enemy Target</div>

        <div className="summary-enemy-grid">
          <div className="summary-field">
            <span className="summary-chip-label">โหมด</span>
            <div className="summary-toggle">
              <button
                type="button"
                className={enemy.mode === 'boss' ? 'on' : ''}
                onClick={() => setEnemyTarget({ mode: 'boss' })}
              >
                Boss
              </button>
              <button
                type="button"
                className={enemy.mode === 'normal' ? 'on' : ''}
                onClick={() => setEnemyTarget({ mode: 'normal' })}
              >
                ทั่วไป
              </button>
            </div>
          </div>

          <label className="summary-field">
            <span className="summary-chip-label">เลเวลตัวละคร</span>
            <input
              type="number"
              min={1}
              max={DEFENSE_RATING_MAX_LEVEL}
              value={active.characterLevel}
              onChange={(e) =>
                updateActive({
                  characterLevel: clampInt(
                    Number(e.target.value),
                    1,
                    DEFENSE_RATING_MAX_LEVEL,
                  ),
                })
              }
            />
          </label>

          <label className="summary-field">
            <span className="summary-chip-label">เลเวลศัตรู</span>
            <input
              type="number"
              min={1}
              max={DEFENSE_RATING_MAX_LEVEL}
              value={enemy.level}
              onChange={(e) =>
                setEnemyTarget({
                  level: clampInt(
                    Number(e.target.value),
                    1,
                    DEFENSE_RATING_MAX_LEVEL,
                  ),
                })
              }
            />
          </label>

          <label className="summary-field">
            <span className="summary-chip-label">DEF % override</span>
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={enemy.defOverridePercent}
              onChange={(e) =>
                setEnemyTarget({
                  defOverridePercent: Math.max(0, Number(e.target.value) || 0),
                })
              }
            />
          </label>

          <label className="summary-field">
            <span className="summary-chip-label">Crit RES %</span>
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={enemy.critResPercent}
              onChange={(e) =>
                setEnemyTarget({
                  critResPercent: Math.max(0, Number(e.target.value) || 0),
                })
              }
            />
          </label>

          <div className="summary-field">
            <span className="summary-chip-label">
              DR {drInfo.usedOverride ? '(override)' : '(ตาราง)'}
            </span>
            <strong className="summary-dr-value">{pct(drInfo.damageReduction)}</strong>
          </div>
        </div>
      </section>

      <section className="summary-metrics" aria-label="DPM metrics">
        <div className="summary-chip hero">
          <span className="summary-chip-label">Total DPM · {state.activeBuild}</span>
          <strong>{metrics.activeDpmLabel}</strong>
        </div>
        <div className="summary-metrics-row">
          <div className="summary-chip">
            <span className="summary-chip-label">DPS</span>
            <strong className="mono">{formatCompact(dps)}</strong>
          </div>
          <div className="summary-chip">
            <span className="summary-chip-label">CP</span>
            <strong className="mono">{metrics.activeCpLabel}</strong>
          </div>
          <div className={`summary-chip delta ${delta >= 0 ? 'up' : 'down'}`}>
            <span className="summary-chip-label">Δ% · {better}</span>
            <strong>
              {delta >= 0 ? '+' : ''}
              {delta.toFixed(1)}%
            </strong>
          </div>
        </div>
        <div className="summary-chip pair">
          <span>
            A <em className="mono">{metrics.a.label}</em>
          </span>
          <span>
            B <em className="mono">{metrics.b.label}</em>
          </span>
        </div>
      </section>

      <div className="summary-table-wrap">
        <div className="summary-section-label sticky">Skill Breakdown</div>
        <table className="summary-table">
          <thead>
            <tr>
              <th>สกิล</th>
              <th>สัดส่วน</th>
              <th>DMG</th>
              <th>Max</th>
              <th>Min</th>
              <th>Avg</th>
              <th>Hits</th>
              <th>ใช้</th>
            </tr>
          </thead>
          <tbody>
            {metrics.activeRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="summary-empty">
                  ยังไม่มีสกิลที่เปิดใช้ — เพิ่มในแท็บ Skill
                </td>
              </tr>
            ) : (
              metrics.activeRows.map((row) => (
                <tr key={row.skillId}>
                  <td className="summary-skill-name">{row.label}</td>
                  <td>
                    <div className="summary-share">
                      <div className="summary-share-bar" aria-hidden>
                        <span style={{ width: `${Math.min(row.share * 100, 100)}%` }} />
                      </div>
                      <span className="mono">{pct(row.share)}</span>
                    </div>
                  </td>
                  <td className="mono">{formatCompact(row.dpm)}</td>
                  <td className="mono">{formatCompact(row.maxPerHit)}</td>
                  <td className="mono">{formatCompact(row.minPerHit)}</td>
                  <td className="mono">{formatCompact(row.avgPerHit)}</td>
                  <td className="mono">{row.hitsPerMin.toFixed(1)}</td>
                  <td className="mono">{row.castsPerMin.toFixed(1)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <p className="summary-hint">
          ประมาณการ sheet 60 วินาที · DEF จากตาราง / override · IED จากสเตต · Min =
          non-crit · Max = crit CD+50% · ไม่ใช่ combat log จริง
        </p>
      </div>
    </aside>
  )
}
