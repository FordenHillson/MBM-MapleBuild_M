import { useState } from 'react'
import { BuildProvider, useBuilds } from './state/BuildContext'
import { GearDoll } from './components/GearDoll'
import { SkillPanel } from './components/SkillPanel'
import { StatPanel } from './components/StatPanel'
import { SummaryPanel } from './components/SummaryPanel'
import './App.css'

type Tab = 'gear' | 'skill' | 'stat' | 'save'

const TABS: { id: Tab; label: string }[] = [
  { id: 'gear', label: 'Gear' },
  { id: 'skill', label: 'Skill' },
  { id: 'stat', label: 'Stat' },
  { id: 'save', label: 'Save' },
]

function Shell() {
  const [tab, setTab] = useState<Tab>('gear')
  const {
    state,
    setActiveBuild,
    active,
    updateActive,
    exportJson,
    importJson,
    resetBuilds,
  } = useBuilds()

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">MSM</span>
          <div>
            <div className="brand-title">Build Planner</div>
            <div className="brand-sub">DPM / gear theorycraft</div>
          </div>
        </div>
        <div className="build-tabs">
          {(['A', 'B'] as const).map((id) => (
            <button
              key={id}
              type="button"
              className={state.activeBuild === id ? 'on' : ''}
              onClick={() => setActiveBuild(id)}
            >
              Build {id}
            </button>
          ))}
        </div>
        <input
          className="build-name"
          value={active.name}
          onChange={(e) => updateActive({ name: e.target.value })}
        />
      </header>

      <div className="workspace">
        <section className="workshop" aria-label="Build workshop">
          <nav className="pane-tabs">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={tab === id ? 'on' : ''}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </nav>

          <main className="main-pane">
            {tab === 'gear' && <GearDoll />}
            {tab === 'skill' && <SkillPanel />}
            {tab === 'stat' && <StatPanel />}
            {tab === 'save' && (
              <div className="panel-pad save-pane">
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => {
                    const blob = new Blob([exportJson()], {
                      type: 'application/json',
                    })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'msm-builds.json'
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                >
                  Export JSON
                </button>
                <label className="btn ghost file-btn">
                  Import JSON
                  <input
                    type="file"
                    accept="application/json"
                    hidden
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      importJson(await file.text())
                    }}
                  />
                </label>
                <button type="button" className="btn ghost" onClick={resetBuilds}>
                  Reset builds
                </button>
                <p className="hint">บันทึกลง localStorage อัตโนมัติทุกครั้งที่แก้</p>
              </div>
            )}
          </main>
        </section>

        <SummaryPanel />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BuildProvider>
      <Shell />
    </BuildProvider>
  )
}
