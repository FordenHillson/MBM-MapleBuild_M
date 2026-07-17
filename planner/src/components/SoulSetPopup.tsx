import type { GearItem, GearSlotId } from '../types/build'
import { SLOT_LABELS } from '../types/build'
import {
  resolveSoulSet,
  soulBossById,
  type SoulSetResult,
} from '../data/souls'
import { SlotSilhouette } from './SlotSilhouette'
import './Popup.css'

export function SoulSetPopup({
  gear,
  onClose,
}: {
  gear: Partial<Record<GearSlotId, GearItem | null | undefined>>
  onClose: () => void
}) {
  const set: SoulSetResult = resolveSoulSet(gear)
  const boss = set.bossId ? soulBossById(set.bossId) : undefined

  return (
    <div
      className="popup-backdrop soul-set-backdrop"
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
      role="presentation"
    >
      <div
        className="soul-set-popup"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="ออปชันเซ็ต Soul"
      >
        <header className="soul-set-header">
          <div className="soul-set-title-row">
            {boss ? (
              <img src={boss.icon} alt="" className="soul-icon" />
            ) : (
              <span className="soul-set-boss-placeholder" aria-hidden />
            )}
            <div>
              <p className="summary-slot">ออปชันเซ็ต</p>
              <h3>
                {set.active && set.bossName
                  ? `${set.bossName} Soul Set`
                  : 'ยังไม่เปิดใช้งาน Set'}
              </h3>
            </div>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className="soul-set-body">
          {set.active ? (
            <>
              <div className="soul-set-stat-row">
                <span>PHY / MAG ATK</span>
                <strong>+{set.atkBonus.toLocaleString('en-US')}</strong>
              </div>
              <p className="soul-set-skill-note">
                สามารถใช้สกิล {set.bossName} Lv.{set.setLevel}
              </p>
            </>
          ) : (
            <p className="muted">
              ใส่ Soul ที่ Main Weapon เพื่อเปิดใช้งาน Soul Set
            </p>
          )}

          <div className="soul-set-slot-row" aria-label="Soul set slots">
            {set.slots.map(({ slot, matched }) => (
              <div
                key={slot}
                className={`soul-set-slot${matched ? ' matched' : ' unmatched'}`}
                title={`${SLOT_LABELS[slot]}${matched ? ' · ตรง Set' : ' · ไม่ตรง'}`}
              >
                <SlotSilhouette
                  slot={slot}
                  className={`soul-set-slot-icon${matched ? ' on' : ' off'}`}
                />
                <span className="soul-set-slot-label">{SLOT_LABELS[slot]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
