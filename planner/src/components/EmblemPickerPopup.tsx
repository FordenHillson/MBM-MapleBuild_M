import type { GearSlotId } from '../types/build'
import { emblemsForSlot, type EmblemDef } from '../data/emblems'
import './Popup.css'

export function EmblemPickerPopup({
  slot,
  selectedTypeId,
  onClose,
  onPick,
}: {
  slot: GearSlotId
  selectedTypeId?: string
  onClose: () => void
  onPick: (def: EmblemDef) => void
}) {
  const options = emblemsForSlot(slot)

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
        aria-label="เลือก Emblem"
      >
        <header className="soul-picker-header">
          <div>
            <p className="summary-slot">Emblem</p>
            <h3>เลือก Emblem</h3>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className="soul-grid emblem-grid">
          {options.map((def) => (
            <button
              key={def.id}
              type="button"
              className={`soul-tile${selectedTypeId === def.id ? ' selected' : ''}`}
              onClick={() => onPick(def)}
            >
              <img src={def.icon} alt="" className="soul-icon" loading="lazy" />
              <span className="soul-tile-name">{def.name.replace(' Emblem', '')}</span>
              <span className="soul-tile-stat">{def.effectLabel}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
