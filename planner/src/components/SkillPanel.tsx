import { useBuilds } from '../state/BuildContext'

export function SkillPanel() {
  const { active, setSkill, addSkill, removeSkill } = useBuilds()

  return (
    <div className="panel-pad">
      <div className="skill-toolbar">
        <p className="hint" style={{ margin: 0 }}>
          เพิ่มสกิลเอง — ตั้งชื่อ + Skill% + Hits (CD/Uptime ใช้คำนวณ DPM)
        </p>
        <button type="button" className="btn primary" onClick={addSkill}>
          เพิ่มสกิล
        </button>
      </div>

      <div className="skill-table">
        <div className="skill-head">
          <span>ใช้</span>
          <span>ชื่อสกิล</span>
          <span>Skill%</span>
          <span>Hits</span>
          <span>CD</span>
          <span>Uptime%</span>
          <span />
        </div>
        {active.skills.length === 0 && (
          <p className="hint">ยังไม่มีสกิล — กด “เพิ่มสกิล” เพื่อเริ่ม</p>
        )}
        {active.skills.map((sk) => (
          <div className="skill-row" key={sk.skillId}>
            <input
              type="checkbox"
              checked={sk.enabled}
              onChange={(e) =>
                setSkill(sk.skillId, { enabled: e.target.checked })
              }
              aria-label="เปิดใช้สกิล"
            />
            <input
              type="text"
              className="skill-name-input"
              placeholder="ชื่อสกิล"
              value={sk.name}
              onChange={(e) => setSkill(sk.skillId, { name: e.target.value })}
            />
            <input
              type="number"
              value={sk.skillPercent}
              onChange={(e) =>
                setSkill(sk.skillId, { skillPercent: Number(e.target.value) })
              }
            />
            <input
              type="number"
              value={sk.hitCount}
              onChange={(e) =>
                setSkill(sk.skillId, { hitCount: Number(e.target.value) })
              }
            />
            <input
              type="number"
              step="0.1"
              value={sk.cooldownSec}
              onChange={(e) =>
                setSkill(sk.skillId, { cooldownSec: Number(e.target.value) })
              }
            />
            <input
              type="number"
              value={sk.uptimePercent}
              onChange={(e) =>
                setSkill(sk.skillId, {
                  uptimePercent: Number(e.target.value),
                })
              }
            />
            <button
              type="button"
              className="btn ghost skill-remove"
              onClick={() => removeSkill(sk.skillId)}
              aria-label="ลบสกิล"
            >
              ลบ
            </button>
          </div>
        ))}
      </div>
      <p className="hint">
        DPM = average line × (60/CD) × uptime — เป็นประมาณการจากสูตร sheet
      </p>
    </div>
  )
}
