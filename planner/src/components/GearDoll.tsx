import { useState, type CSSProperties } from 'react'
import { useBuilds } from '../state/BuildContext'
import {
  SLOT_LABELS,
  outfitPartnerSlot,
  type GearItem,
  type GearSlotId,
  type PotentialGrade,
} from '../types/build'
import { potentialFrameClass } from '../data/potentialWeapon'
import { rankFrameClass } from '../data/itemRankStyle'
import { resolveItemRankFrameLayers } from '../data/itemRankTextures'
import { SlotSilhouette } from './SlotSilhouette'
import { GearSummaryPopup } from './GearSummaryPopup'
import { GearEditModal } from './GearEditModal'
import './GearDoll.css'

export { rankFrameClass } from '../data/itemRankStyle'

function potGradeLetter(grade: PotentialGrade | string): string {
  if (!grade) return '?'
  return grade[0]!.toUpperCase()
}

/** 7×5 grid: left 2 + center 3 + right 2 */
const GRID_SLOTS: { slot: GearSlotId; col: number; row: number }[] = [
  // left
  { slot: 'mainWeapon', col: 1, row: 1 },
  { slot: 'secondary', col: 2, row: 1 },
  { slot: 'pendant1', col: 1, row: 2 },
  { slot: 'pendant2', col: 2, row: 2 },
  { slot: 'ring1', col: 1, row: 3 },
  { slot: 'ring2', col: 2, row: 3 },
  { slot: 'ring3', col: 1, row: 4 },
  { slot: 'ring4', col: 2, row: 4 },
  { slot: 'earrings', col: 1, row: 5 },
  { slot: 'socket', col: 2, row: 5 },
  // center bottom
  { slot: 'title', col: 3, row: 5 },
  { slot: 'badge', col: 4, row: 5 },
  { slot: 'medal', col: 5, row: 5 },
  // right
  { slot: 'hat', col: 6, row: 1 },
  { slot: 'gloves', col: 7, row: 1 },
  { slot: 'outfitTop', col: 6, row: 2 },
  { slot: 'outfitBottom', col: 7, row: 2 },
  { slot: 'shoulder', col: 6, row: 3 },
  { slot: 'shoes', col: 7, row: 3 },
  { slot: 'belt', col: 6, row: 4 },
  { slot: 'cape', col: 7, row: 4 },
  { slot: 'face', col: 6, row: 5 },
  { slot: 'eye', col: 7, row: 5 },
]

function SlotCell({
  slot,
  item,
  onClick,
  style,
}: {
  slot: GearSlotId
  item: GearItem | null | undefined
  onClick: () => void
  style?: CSSProperties
}) {
  const filled = Boolean(item)
  const rankClass = item ? rankFrameClass(item.rank) : ''
  const layers = item
    ? resolveItemRankFrameLayers(item.rank, 'table', {
        hasEmblem: Boolean(item.emblem),
      })
    : null
  const slotStyle: CSSProperties = {
    ...style,
    ...(layers
      ? {
          ['--rank-frame' as string]: `url("${layers.frame}")`,
          ...(layers.emblem
            ? {
                ['--rank-emblem' as string]: `url("${layers.emblem}")`,
                ...(layers.emblemLines
                  ? {
                      ['--emblem-lines' as string]: `url("${layers.emblemLines}")`,
                    }
                  : {}),
              }
            : {}),
        }
      : {}),
  }
  return (
    <button
      type="button"
      className={`gear-slot ${filled ? `filled ${rankClass}` : 'empty'}${layers ? ' has-rank-tex' : ''}${layers?.emblem ? ' has-emblem-tex' : ''}`}
      onClick={onClick}
      title={
        item
          ? `${SLOT_LABELS[slot]} · ${item.rank}`
          : SLOT_LABELS[slot]
      }
      style={slotStyle}
    >
      {item ? (
        <>
          {layers?.emblem && (
            <>
              <span className="emblem-detail-shine" aria-hidden />
              <span className="emblem-line-glow" aria-hidden />
            </>
          )}
          {item.iconUrl ? (
            <img src={item.iconUrl} alt="" className="slot-icon-img" />
          ) : (
            <SlotSilhouette slot={slot} className="slot-silhouette filled" />
          )}
          {item.potential && (
            <span
              className={`badge pot ${potentialFrameClass(item.potential.grade)}`}
            >
              {potGradeLetter(item.potential.grade)}
            </span>
          )}
          {item.bonusPotential && (
            <span
              className={`badge add ${potentialFrameClass(item.bonusPotential.grade)}`}
            >
              {potGradeLetter(item.bonusPotential.grade)}
            </span>
          )}
          <span className="badge star">★{item.star}</span>
          <span className="slot-lv">Lv.{item.level}</span>
          <span className="slot-name">{SLOT_LABELS[slot]}</span>
        </>
      ) : (
        <>
          <SlotSilhouette slot={slot} className="slot-silhouette empty" />
          <span className="slot-empty-label">{SLOT_LABELS[slot]}</span>
        </>
      )}
    </button>
  )
}

export function GearDoll() {
  const { active, setGear } = useBuilds()
  const [summarySlot, setSummarySlot] = useState<GearSlotId | null>(null)
  const [editing, setEditing] = useState<GearSlotId | null>(null)

  const openSlot = (slot: GearSlotId) => {
    const item = active.gear[slot]
    if (item) setSummarySlot(slot)
    else setEditing(slot)
  }

  const summaryItem = summarySlot ? active.gear[summarySlot] : null

  const editingPartner = editing ? outfitPartnerSlot(editing) : null
  const rootAbyssLocked =
    !!editing &&
    (active.gear[editing]?.rank === 'Root Abyss' ||
      (editingPartner != null &&
        active.gear[editingPartner]?.rank === 'Root Abyss'))

  return (
    <div className="gear-doll">
      <div className="doll-board" aria-label="Equipment grid">
        <div className="char-stage">
          <div className="char-silhouette" aria-hidden />
          <div className="char-meta">{active.name}</div>
          <div className="preset-row">
            <span className="preset on">1</span>
            <span className="preset">2</span>
            <span className="preset">3</span>
          </div>
        </div>

        {GRID_SLOTS.map(({ slot, col, row }) => (
          <SlotCell
            key={slot}
            slot={slot}
            item={active.gear[slot]}
            onClick={() => openSlot(slot)}
            style={{ gridColumn: col, gridRow: row }}
          />
        ))}
      </div>

      {summarySlot && summaryItem && (
        <GearSummaryPopup
          slot={summarySlot}
          item={summaryItem}
          gear={active.gear}
          onClose={() => setSummarySlot(null)}
          onEdit={() => {
            setSummarySlot(null)
            setEditing(summarySlot)
          }}
          onClear={() => {
            setGear(summarySlot, null)
            setSummarySlot(null)
          }}
        />
      )}

      {editing && (
        <GearEditModal
          slot={editing}
          initial={active.gear[editing] ?? null}
          rootAbyssLocked={rootAbyssLocked}
          onClose={() => setEditing(null)}
          onSave={(item) => {
            setGear(editing, item)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}
