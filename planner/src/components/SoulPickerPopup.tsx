import { useMemo, useState } from 'react'
import { SLOT_LABELS, type GearSlotId, type SoulBlock } from '../types/build'
import {
  SOUL_BOSSES,
  buildSoulBlock,
  parseSoulId,
  soulBossById,
  soulOptionsForBoss,
  type SoulBossId,
  type SoulOptionId,
} from '../data/souls'
import './Popup.css'

type Step = 'boss' | 'option'

function formatValue(optionId: string, value: number): string {
  if (optionId === 'maxDamage') return value.toLocaleString('en-US')
  if (optionId === 'hpRecovery' || optionId === 'mpRecovery') return String(value)
  if (optionId === 'feverDurationSec') return `${value}s`
  return `${value}%`
}

export function SoulPickerPopup({
  slot,
  initial,
  onClose,
  onPick,
}: {
  slot: GearSlotId
  initial: SoulBlock | null
  onClose: () => void
  onPick: (soul: SoulBlock) => void
}) {
  const parsed = initial ? parseSoulId(initial.soulId, slot) : null
  const [step, setStep] = useState<Step>(parsed ? 'option' : 'boss')
  const [bossId, setBossId] = useState<SoulBossId | null>(parsed?.bossId ?? null)

  const boss = bossId ? soulBossById(bossId) : undefined
  const options = useMemo(
    () => (bossId ? soulOptionsForBoss(bossId, slot) : []),
    [bossId, slot],
  )

  const fixed = options.filter((o) => !o.magnificent)
  const magnificent = options.filter((o) => o.magnificent)
  const slotLabel = SLOT_LABELS[slot]

  return (
    <div
      className="popup-backdrop soul-picker-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="soul-picker"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="เลือก Soul"
      >
        <header className="soul-picker-header">
          <div>
            <p className="summary-slot">Soul · {slotLabel}</p>
            <h3>
              {step === 'boss'
                ? 'เลือกบอส'
                : `เลือกออฟ · ${boss?.name ?? ''}`}
            </h3>
          </div>
          <div className="soul-picker-tools">
            {step === 'option' && (
              <button
                type="button"
                className="btn ghost"
                onClick={() => setStep('boss')}
              >
                ← บอส
              </button>
            )}
            <button type="button" className="icon-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </header>

        {step === 'boss' ? (
          <div className="soul-grid boss-grid">
            {SOUL_BOSSES.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`soul-tile${bossId === b.id ? ' selected' : ''}`}
                onClick={() => {
                  setBossId(b.id)
                  setStep('option')
                }}
              >
                <img src={b.icon} alt="" className="soul-icon" loading="lazy" />
                <span className="soul-tile-name">{b.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="soul-option-panels">
            {boss && (
              <div className="soul-boss-banner">
                <img src={boss.icon} alt="" className="soul-icon lg" />
                <div>
                  <strong>{boss.name}</strong>
                  <p className="muted">Skill: {boss.skillNormal}</p>
                </div>
              </div>
            )}

            <p className="soul-group-label">ประเภท Soul</p>
            <div className="soul-grid option-grid">
              {fixed.map((o) => {
                const value = bossId ? o.valuesByBoss[bossId] : null
                if (value == null || !bossId) return null
                return (
                  <button
                    key={o.id}
                    type="button"
                    className="soul-tile option"
                    onClick={() => {
                      const block = buildSoulBlock(
                        bossId,
                        o.id as SoulOptionId,
                        slot,
                      )
                      if (block) onPick(block)
                    }}
                  >
                    <span className="soul-tile-name">{o.typeLabel}</span>
                    <span className="soul-tile-stat">{o.valueLabel}</span>
                    <span className="soul-tile-value">
                      {formatValue(o.optionId, value)}
                    </span>
                  </button>
                )
              })}
            </div>

            <p className="soul-group-label">Magnificent (สุ่ม 1 ออฟ)</p>
            <div className="soul-grid option-grid">
              {magnificent.map((o) => {
                const value = bossId ? o.valuesByBoss[bossId] : null
                if (value == null || !bossId) return null
                return (
                  <button
                    key={o.id}
                    type="button"
                    className="soul-tile option magnificent"
                    onClick={() => {
                      const block = buildSoulBlock(
                        bossId,
                        o.id as SoulOptionId,
                        slot,
                      )
                      if (block) onPick(block)
                    }}
                  >
                    <span className="soul-tile-name">{o.valueLabel}</span>
                    <span className="soul-tile-value">
                      {formatValue(o.optionId, value)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
