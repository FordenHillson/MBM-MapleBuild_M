import { useMemo, useState } from 'react'
import {
  SLOT_LABELS,
  ranksForSlot,
  type FlameRank,
  type GearItem,
  type GearSlotId,
  type ItemRank,
  type PotentialGrade,
  type StatLine,
} from '../types/build'
import {
  FLAME_RANKS,
  emptyFlameLines,
  flameOptionsAvailable,
  flameOptionById,
  flameValues,
  isFlameRank,
  isFlameSlot,
  normalizeFlameLines,
} from '../data/flameWeapon'
import {
  POTENTIAL_RANKS,
  emptyPotentialLines,
  isPotentialSlot,
  normalizePotentialGrade,
  normalizePotentialLines,
  potentialFrameClass,
  potentialOptionById,
  potentialOptionsAvailable,
  potentialValues,
} from '../data/potentialWeapon'
import {
  BONUS_POTENTIAL_RANKS,
  emptyBonusPotentialLines,
  normalizeBonusPotentialLines,
  bonusPotentialOptionById,
  bonusPotentialOptionsAvailable,
  bonusPotentialValues,
} from '../data/bonusPotentialWeapon'
import {
  buildEmblemLines,
  canEquipEmblem,
  defaultBaseBoost,
  emptyEmblem,
  emblemById,
  emblemEffectValue,
  emblemMaxDamageValue,
  normalizeEmblem,
  supportsEmblem,
} from '../data/emblems'
import {
  isSoulSlot,
  normalizeSoul,
  parseSoulId,
  soulBossById,
} from '../data/souls'
import {
  WEAPON_HIGH_TIER_OPTIONS,
  highTierOptionByOptionId,
  normalizeHighTierOption,
  supportsHighTierOption,
} from '../data/highTierOption'
import {
  HAT_MAIN_OPTIONS,
  emptyHatMainOption,
  normalizeHatMainOption,
  supportsHatMainOption,
} from '../data/hatMainOption'
import {
  normalizeSharenianAbility,
  supportsSharenianAbility,
} from '../data/sharenianAbility'
import { fileToGearIconDataUrl, normalizeIconUrl } from '../data/gearIcon'
import { rankFrameClass } from '../data/itemRankStyle'
import { resolveItemRankFrameLayers } from '../data/itemRankTextures'
import { EmblemPickerPopup } from './EmblemPickerPopup'
import { SoulPickerPopup } from './SoulPickerPopup'
import { SlotSilhouette } from './SlotSilhouette'
import './Popup.css'

function normalizeRank(
  slot: GearSlotId,
  rank: ItemRank,
  rootAbyssLocked: boolean,
): ItemRank {
  const available = ranksForSlot(slot, { rootAbyssLocked })
  if (available.includes(rank)) return rank
  return available[0] ?? 'Chaos'
}

function emptyItem(slot: GearSlotId): GearItem {
  return {
    slotId: slot,
    itemName: '',
    iconUrl: '',
    rank: 'Legendary',
    level: 40,
    star: 0,
    atkBase: 0,
    atkBonus: 0,
    phyDefBase: 0,
    magDefBase: 0,
    maxHpBase: 0,
    maxDamageBase: 0,
    flameRank: null,
    mainLines: isFlameSlot(slot)
      ? emptyFlameLines()
      : [
          { optionId: 'critDmg', label: 'Crit DMG', value: 0 },
          { optionId: 'phyAtkBossAtk', label: 'PHY ATK ตาม Boss ATK', value: 0 },
        ],
    potential: null,
    bonusPotential: null,
    emblem: supportsEmblem(slot) ? emptyEmblem(slot, 'ruthless') : null,
    highTierOption: null,
    sharenianAbility: null,
    soul: null,
  }
}

function LineEditor({
  lines,
  onChange,
}: {
  lines: StatLine[]
  onChange: (lines: StatLine[]) => void
}) {
  return (
    <div className="line-list">
      {lines.map((line, idx) => (
        <div className="line-row" key={idx}>
          <input
            value={line.label}
            onChange={(e) => {
              const next = [...lines]
              next[idx] = {
                ...line,
                label: e.target.value,
                optionId: line.optionId || e.target.value,
              }
              onChange(next)
            }}
          />
          <input
            type="number"
            step="0.01"
            value={line.value}
            onChange={(e) => {
              const next = [...lines]
              next[idx] = { ...line, value: Number(e.target.value) }
              onChange(next)
            }}
          />
        </div>
      ))}
    </div>
  )
}

function FlameLineEditor({
  slot,
  flameRank,
  lines,
  onChange,
}: {
  slot: GearSlotId
  flameRank: FlameRank
  lines: StatLine[]
  onChange: (lines: StatLine[]) => void
}) {
  const options = useMemo(
    () => flameOptionsAvailable(slot, flameRank),
    [slot, flameRank],
  )
  const rows = useMemo(
    () => normalizeFlameLines(slot, flameRank, lines),
    [slot, flameRank, lines],
  )

  const setRow = (idx: number, patch: Partial<StatLine>) => {
    const next = rows.map((r, i) => (i === idx ? { ...r, ...patch } : r))
    onChange(next)
  }

  return (
    <div className="line-list">
      {rows.map((line, idx) => {
        const values = line.optionId
          ? flameValues(slot, line.optionId, flameRank)
          : []
        return (
          <div className="line-row" key={idx}>
            <select
              value={line.optionId}
              onChange={(e) => {
                const id = e.target.value
                if (!id) {
                  setRow(idx, { optionId: '', label: '', value: 0 })
                  return
                }
                const opt = flameOptionById(slot, id)
                const vals = flameValues(slot, id, flameRank)
                setRow(idx, {
                  optionId: id,
                  label: opt?.label ?? id,
                  value: vals[0] ?? 0,
                })
              }}
            >
              <option value="">None</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={line.optionId ? String(line.value) : ''}
              disabled={!line.optionId || values.length === 0}
              onChange={(e) =>
                setRow(idx, { value: Number(e.target.value) })
              }
            >
              {!line.optionId && <option value="">—</option>}
              {values.map((v) => (
                <option key={v} value={v}>
                  {v}%
                </option>
              ))}
            </select>
          </div>
        )
      })}
    </div>
  )
}

function PotentialLineEditor({
  slot,
  grade,
  lines,
  onChange,
  kind = 'main',
}: {
  slot: GearSlotId
  grade: PotentialGrade
  lines: StatLine[]
  onChange: (lines: StatLine[]) => void
  kind?: 'main' | 'bonus'
}) {
  const rows = useMemo(
    () =>
      kind === 'bonus'
        ? normalizeBonusPotentialLines(slot, grade, lines)
        : normalizePotentialLines(slot, grade, lines),
    [slot, grade, lines, kind],
  )

  const setRow = (idx: number, patch: Partial<StatLine>) => {
    const next = rows.map((r, i) => (i === idx ? { ...r, ...patch } : r))
    onChange(next)
  }

  return (
    <div className="line-list">
      {rows.map((line, idx) => {
        const options =
          kind === 'bonus'
            ? bonusPotentialOptionsAvailable(slot, grade, idx)
            : potentialOptionsAvailable(slot, grade, idx)
        const opt = line.optionId
          ? kind === 'bonus'
            ? bonusPotentialOptionById(slot, line.optionId)
            : potentialOptionById(slot, line.optionId)
          : undefined
        const values = line.optionId
          ? kind === 'bonus'
            ? bonusPotentialValues(slot, line.optionId, grade, idx)
            : potentialValues(slot, line.optionId, grade, idx)
          : []
        const suffix = opt?.isPercent ? '%' : ''
        const labelPrefix = kind === 'bonus' ? 'Bonus Potential' : 'Potential'
        return (
          <div className="line-row" key={idx}>
            <select
              value={line.optionId}
              aria-label={`${labelPrefix} line ${idx + 1} option`}
              onChange={(e) => {
                const id = e.target.value
                if (!id) {
                  setRow(idx, { optionId: '', label: '', value: 0 })
                  return
                }
                const next =
                  kind === 'bonus'
                    ? bonusPotentialOptionById(slot, id)
                    : potentialOptionById(slot, id)
                const vals =
                  kind === 'bonus'
                    ? bonusPotentialValues(slot, id, grade, idx)
                    : potentialValues(slot, id, grade, idx)
                setRow(idx, {
                  optionId: id,
                  label: next?.label ?? id,
                  value: vals[0] ?? 0,
                })
              }}
            >
              <option value="">None</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={line.optionId ? String(line.value) : ''}
              disabled={!line.optionId || values.length === 0}
              aria-label={`${labelPrefix} line ${idx + 1} value`}
              onChange={(e) =>
                setRow(idx, { value: Number(e.target.value) })
              }
            >
              {!line.optionId && <option value="">—</option>}
              {values.map((v) => (
                <option key={v} value={v}>
                  {suffix ? `${v}%` : v}
                </option>
              ))}
            </select>
          </div>
        )
      })}
    </div>
  )
}

export function GearEditModal({
  slot,
  initial,
  rootAbyssLocked = false,
  onClose,
  onSave,
}: {
  slot: GearSlotId
  initial: GearItem | null
  /** When Outfit Top/Bottom pair has Root Abyss, rank dropdown is locked. */
  rootAbyssLocked?: boolean
  onClose: () => void
  onSave: (item: GearItem) => void
}) {
  const [item, setItem] = useState<GearItem>(() => {
    const base = initial ? structuredClone(initial) : emptyItem(slot)
    const flameRank =
      base.flameRank === null
        ? null
        : isFlameRank(base.flameRank)
          ? base.flameRank
          : 'Legendary'
    const potential =
      base.potential === null
        ? null
        : (() => {
            const potGrade = normalizePotentialGrade(base.potential?.grade)
            const potLines = isPotentialSlot(slot)
              ? normalizePotentialLines(
                  slot,
                  potGrade,
                  base.potential?.lines ?? [],
                )
              : (base.potential?.lines ?? [])
            return { grade: potGrade, lines: potLines }
          })()
    const bonusPotential =
      base.bonusPotential === null
        ? null
        : (() => {
            const bonusGrade = normalizePotentialGrade(
              base.bonusPotential?.grade,
            )
            const bonusLines = isPotentialSlot(slot)
              ? normalizeBonusPotentialLines(
                  slot,
                  bonusGrade,
                  base.bonusPotential?.lines ?? [],
                )
              : (base.bonusPotential?.lines ?? [])
            return { grade: bonusGrade, lines: bonusLines }
          })()
    const normalizedRank = normalizeRank(
      slot,
      base.rank,
      rootAbyssLocked,
    )
    return {
      ...base,
      flameRank,
      rank: normalizedRank,
      mainLines:
        isFlameSlot(slot) && flameRank
          ? normalizeFlameLines(slot, flameRank, base.mainLines ?? [])
          : isFlameSlot(slot)
            ? emptyFlameLines()
            : base.mainLines,
      potential,
      bonusPotential,
      emblem: normalizeEmblem(slot, base.emblem, normalizedRank),
      soul: normalizeSoul(slot, base.soul),
      highTierOption:
        slot === 'hat'
          ? normalizeHatMainOption(slot, normalizedRank, base.highTierOption)
          : normalizeHighTierOption(slot, normalizedRank, base.highTierOption),
      sharenianAbility: normalizeSharenianAbility(
        slot,
        normalizedRank,
        base.sharenianAbility,
      ),
      iconUrl: normalizeIconUrl(base.iconUrl),
    }
  })

  const [soulPickerOpen, setSoulPickerOpen] = useState(false)
  const [emblemPickerOpen, setEmblemPickerOpen] = useState(false)

  const ranks = useMemo(
    () => ranksForSlot(slot, { rootAbyssLocked }),
    [slot, rootAbyssLocked],
  )

  const emblemSupported = supportsEmblem(slot)
  const emblemAllowed = emblemSupported && canEquipEmblem(slot, item.rank)
  const isAccessoryEmblem = defaultBaseBoost(slot) === 0 && emblemSupported
  const soulSupported = isSoulSlot(slot)
  const soulBoss = item.soul
    ? soulBossById(parseSoulId(item.soul.soulId, slot)?.bossId ?? '')
    : undefined
  const emblemDef = item.emblem ? emblemById(item.emblem.typeId) : undefined
  const layers = resolveItemRankFrameLayers(item.rank, 'summary', {
    hasEmblem: Boolean(item.emblem),
  })

  const total = useMemo(
    () => item.atkBase + item.atkBonus,
    [item.atkBase, item.atkBonus],
  )

  const setFlameRank = (flameRank: FlameRank | null) => {
    setItem({
      ...item,
      flameRank,
      mainLines: flameRank
        ? normalizeFlameLines(slot, flameRank, item.mainLines)
        : emptyFlameLines(),
    })
  }

  const setPotentialGrade = (grade: PotentialGrade | null) => {
    if (grade == null) {
      setItem({ ...item, potential: null })
      return
    }
    setItem({
      ...item,
      potential: {
        grade,
        lines: isPotentialSlot(slot)
          ? normalizePotentialLines(
              slot,
              grade,
              item.potential?.lines ?? emptyPotentialLines(),
            )
          : (item.potential?.lines ?? []),
      },
    })
  }

  const setBonusPotentialGrade = (grade: PotentialGrade | null) => {
    if (grade == null) {
      setItem({ ...item, bonusPotential: null })
      return
    }
    setItem({
      ...item,
      bonusPotential: {
        grade,
        lines: isPotentialSlot(slot)
          ? normalizeBonusPotentialLines(
              slot,
              grade,
              item.bonusPotential?.lines ?? emptyBonusPotentialLines(),
            )
          : (item.bonusPotential?.lines ?? []),
      },
    })
  }

  return (
    <div className="popup-backdrop" onClick={onClose} role="presentation">
      <div
        className="edit-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Edit gear"
      >
        <header className="edit-header">
          <div>
            <div className="summary-slot">{SLOT_LABELS[slot]}</div>
            <input
              className="title-input"
              value={item.itemName}
              placeholder="ชื่อไอเทม"
              onChange={(e) => setItem({ ...item, itemName: e.target.value })}
            />
          </div>
          <div className="atk-big">{total.toLocaleString()}</div>
        </header>

        <div className="edit-scroll">
          <section>
            <h4>ไอคอน</h4>
            <div className="gear-icon-editor">
              <div
                className={`gear-icon-preview has-rank-tex ${rankFrameClass(item.rank)}${layers.emblem ? ' has-emblem-tex' : ''}${item.iconUrl ? ' has-img' : ''}`}
                style={{
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
                }}
              >
                {layers.emblem && (
                  <>
                    <span className="emblem-detail-shine" aria-hidden />
                    <span className="emblem-line-glow" aria-hidden />
                  </>
                )}
                {item.iconUrl ? (
                  <img src={item.iconUrl} alt="" />
                ) : (
                  <SlotSilhouette
                    slot={slot}
                    className="gear-icon-silhouette"
                  />
                )}
              </div>
              <div className="gear-icon-fields">
                <label>
                  URL รูป
                  <input
                    type="url"
                    placeholder="https://… หรือปล่อยว่าง"
                    value={
                      item.iconUrl.startsWith('data:') ? '' : item.iconUrl
                    }
                    onChange={(e) =>
                      setItem({
                        ...item,
                        iconUrl: normalizeIconUrl(e.target.value),
                      })
                    }
                  />
                </label>
                <div className="gear-icon-actions">
                  <label className="btn ghost gear-icon-upload">
                    อัปโหลด
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        e.target.value = ''
                        if (!file) return
                        try {
                          const dataUrl = await fileToGearIconDataUrl(file)
                          setItem({ ...item, iconUrl: dataUrl })
                        } catch (err) {
                          window.alert(
                            err instanceof Error
                              ? err.message
                              : 'อัปโหลดไม่สำเร็จ',
                          )
                        }
                      }}
                    />
                  </label>
                  {item.iconUrl && (
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => setItem({ ...item, iconUrl: '' })}
                    >
                      ลบรูป
                    </button>
                  )}
                </div>
                {item.iconUrl.startsWith('data:') && (
                  <p className="muted" style={{ margin: 0 }}>
                    ใช้รูปที่อัปโหลดแล้ว (ย่อขนาดอัตโนมัติ)
                  </p>
                )}
              </div>
            </div>
          </section>

          <section>
            <div className="field-grid">
              <label>
                ระดับ
                <select
                  value={item.rank}
                  disabled={rootAbyssLocked}
                  onChange={(e) => {
                    const rank = e.target.value as ItemRank
                    const allowEmblem = canEquipEmblem(slot, rank)
                    if (!allowEmblem) setEmblemPickerOpen(false)
                    const nextHighTier =
                      slot === 'hat'
                        ? normalizeHatMainOption(
                            slot,
                            rank,
                            item.highTierOption,
                          )
                        : normalizeHighTierOption(
                            slot,
                            rank,
                            item.highTierOption,
                          )
                    setItem({
                      ...item,
                      rank,
                      emblem: allowEmblem ? item.emblem : null,
                      highTierOption: nextHighTier,
                      sharenianAbility: normalizeSharenianAbility(
                        slot,
                        rank,
                        item.sharenianAbility,
                      ),
                    })
                  }}
                >
                  {ranks.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                {rootAbyssLocked && (
                  <span className="muted" style={{ marginTop: 4 }}>
                    Root Abyss ล็อกคู่ Top / Bottom — ล้างทั้งสองช่องเพื่อปลดล็อก
                  </span>
                )}
              </label>
              <label>
                เลเวล
                <input
                  type="number"
                  value={item.level}
                  onChange={(e) =>
                    setItem({ ...item, level: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                ★ Star
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={item.star}
                  onChange={(e) =>
                    setItem({ ...item, star: Number(e.target.value) })
                  }
                />
              </label>
            </div>
          </section>

          {supportsHighTierOption(slot, item.rank) && item.highTierOption && (
            <section>
              <h4>Option หลัก</h4>
              <p className="muted" style={{ marginTop: 0 }}>
                Necro / Absolab / Arcane / Genesis — เลือกออฟ แล้วใส่ค่า % เอง
              </p>
              <div
                className="high-tier-option-grid"
                role="radiogroup"
                aria-label="Option หลัก"
              >
                {WEAPON_HIGH_TIER_OPTIONS.map((opt) => {
                  const selected =
                    item.highTierOption!.optionId === opt.optionId
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={`high-tier-option-card${selected ? ' selected' : ''}`}
                      onClick={() =>
                        setItem({
                          ...item,
                          highTierOption: {
                            optionId: opt.optionId,
                            label: opt.label,
                            value: item.highTierOption!.value,
                          },
                        })
                      }
                    >
                      <span className="high-tier-radio" aria-hidden />
                      <span className="high-tier-label">{opt.label}</span>
                      {selected && (
                        <span className="high-tier-preview">
                          {item.highTierOption!.value}%
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              <label className="high-tier-value">
                ค่า %
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={item.highTierOption.value}
                  onChange={(e) => {
                    const def =
                      highTierOptionByOptionId(
                        item.highTierOption!.optionId,
                      ) ?? WEAPON_HIGH_TIER_OPTIONS[0]!
                    setItem({
                      ...item,
                      highTierOption: {
                        optionId: def.optionId,
                        label: def.label,
                        value: Number(e.target.value),
                      },
                    })
                  }}
                />
              </label>
            </section>
          )}

          {supportsHatMainOption(slot, item.rank) && (
            <section>
              <h4>Option หลัก</h4>
              <p className="muted" style={{ marginTop: 0 }}>
                Helmet: เลือกออฟหลัก แล้วใส่ค่าเอง
              </p>
              <div
                className="field-grid"
                style={{ gridTemplateColumns: '2fr 1fr', maxWidth: 320 }}
              >
                <label>
                  ออฟหลัก
                  <select
                    value={item.highTierOption?.optionId ?? HAT_MAIN_OPTIONS[0]!.optionId}
                    onChange={(e) => {
                      const optionId = e.target.value
                      setItem({
                        ...item,
                        highTierOption: emptyHatMainOption(
                          optionId || undefined,
                          item.highTierOption?.value ?? 0,
                        ),
                      })
                    }}
                  >
                    {HAT_MAIN_OPTIONS.map((opt) => (
                      <option key={opt.optionId} value={opt.optionId}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  ค่า
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={item.highTierOption?.value ?? 0}
                    onChange={(e) =>
                      setItem({
                        ...item,
                        highTierOption: {
                          ...(item.highTierOption ??
                            emptyHatMainOption(undefined, 0)),
                          value: Number(e.target.value),
                        },
                      })
                    }
                  />
                </label>
              </div>
            </section>
          )}

          {supportsSharenianAbility(slot, item.rank) &&
            item.sharenianAbility && (
            <section>
              <h4>Sharenian Ability</h4>
              <p className="muted" style={{ marginTop: 0 }}>
                Second Weapon Unique ขึ้นไป — ออฟคงที่ 2 แถว ใส่ค่า % เอง
              </p>
              <div className="sharenian-ability-list">
                {item.sharenianAbility.map((line, idx) => (
                  <label key={line.optionId} className="sharenian-ability-row">
                    <span className="sharenian-ability-label">{line.label}</span>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={line.value}
                      onChange={(e) => {
                        const next = item.sharenianAbility!.map((l, i) =>
                          i === idx
                            ? { ...l, value: Number(e.target.value) }
                            : l,
                        )
                        setItem({ ...item, sharenianAbility: next })
                      }}
                    />
                    <span className="sharenian-ability-unit">%</span>
                  </label>
                ))}
              </div>
            </section>
          )}

          <section>
            <h4>{slot === 'hat' ? 'DEF / HP / DMG' : 'ATK'}</h4>
            {slot === 'hat' ? (
              <div
                className="field-grid"
                style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}
              >
                <label>
                  PHY / MAG DEF
                  <input
                    type="number"
                    value={item.phyDefBase}
                    onChange={(e) => {
                      const def = Number(e.target.value)
                      setItem({
                        ...item,
                        phyDefBase: def,
                        magDefBase: def,
                      })
                    }}
                  />
                </label>
                <label>
                  HP สูงสุด
                  <input
                    type="number"
                    value={item.maxHpBase}
                    onChange={(e) =>
                      setItem({
                        ...item,
                        maxHpBase: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  DMG สูงสุด
                  <input
                    type="number"
                    value={item.maxDamageBase}
                    onChange={(e) =>
                      setItem({
                        ...item,
                        maxDamageBase: Number(e.target.value),
                      })
                    }
                  />
                </label>
              </div>
            ) : (
              <div className="field-grid">
                <label>
                  Base
                  <input
                    type="number"
                    value={item.atkBase}
                    onChange={(e) =>
                      setItem({ ...item, atkBase: Number(e.target.value) })
                    }
                  />
                </label>
                <label>
                  Bonus
                  <input
                    type="number"
                    value={item.atkBonus}
                    onChange={(e) =>
                      setItem({ ...item, atkBonus: Number(e.target.value) })
                    }
                  />
                </label>
              </div>
            )}
            <div className="block-head" style={{ marginBottom: 6 }}>
              <h4 style={{ margin: 0 }}>สายหลัก / Flame</h4>
              {isFlameSlot(slot) && (
                <select
                  value={item.flameRank ?? ''}
                  onChange={(e) =>
                    setFlameRank(
                      e.target.value
                        ? (e.target.value as FlameRank)
                        : null,
                    )
                  }
                  aria-label="Flame rank"
                >
                  <option value="">None</option>
                  {FLAME_RANKS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {isFlameSlot(slot) ? (
              item.flameRank ? (
                <FlameLineEditor
                  slot={slot}
                  flameRank={item.flameRank}
                  lines={item.mainLines}
                  onChange={(mainLines) => setItem({ ...item, mainLines })}
                />
              ) : (
                <p className="muted">ไม่มี Flame</p>
              )
            ) : (
              <LineEditor
                lines={item.mainLines}
                onChange={(mainLines) => setItem({ ...item, mainLines })}
              />
            )}
          </section>

          <section
            className={`block pot ${item.potential ? potentialFrameClass(item.potential.grade) : ''}`}
          >
            <div className="block-head">
              <strong>Potential</strong>
              <select
                value={item.potential?.grade ?? ''}
                onChange={(e) =>
                  setPotentialGrade(
                    e.target.value
                      ? (e.target.value as PotentialGrade)
                      : null,
                  )
                }
                aria-label="Potential rank"
              >
                <option value="">None</option>
                {POTENTIAL_RANKS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            {item.potential == null ? (
              <p className="muted">ไม่มี Potential</p>
            ) : isPotentialSlot(slot) ? (
              <PotentialLineEditor
                slot={slot}
                grade={item.potential.grade}
                lines={item.potential.lines}
                onChange={(lines) =>
                  setItem({
                    ...item,
                    potential: { ...item.potential!, lines },
                  })
                }
              />
            ) : (
              <LineEditor
                lines={item.potential.lines}
                onChange={(lines) =>
                  setItem({
                    ...item,
                    potential: { ...item.potential!, lines },
                  })
                }
              />
            )}
          </section>

          <section
            className={`block addpot ${item.bonusPotential ? potentialFrameClass(item.bonusPotential.grade) : ''}`}
          >
            <div className="block-head">
              <strong>Bonus Potential</strong>
              <select
                value={item.bonusPotential?.grade ?? ''}
                onChange={(e) =>
                  setBonusPotentialGrade(
                    e.target.value
                      ? (e.target.value as PotentialGrade)
                      : null,
                  )
                }
                aria-label="Bonus Potential rank"
              >
                <option value="">None</option>
                {BONUS_POTENTIAL_RANKS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            {item.bonusPotential == null ? (
              <p className="muted">ไม่มี Bonus Potential</p>
            ) : isPotentialSlot(slot) ? (
              <PotentialLineEditor
                slot={slot}
                grade={item.bonusPotential.grade}
                lines={item.bonusPotential.lines}
                kind="bonus"
                onChange={(lines) =>
                  setItem({
                    ...item,
                    bonusPotential: { ...item.bonusPotential!, lines },
                  })
                }
              />
            ) : (
              <LineEditor
                lines={item.bonusPotential.lines}
                onChange={(lines) =>
                  setItem({
                    ...item,
                    bonusPotential: { ...item.bonusPotential!, lines },
                  })
                }
              />
            )}
          </section>

          <section>
            <h4>Emblem</h4>
            {!emblemSupported ? (
              <p className="muted">ช่องนี้ไม่มี Emblem</p>
            ) : !emblemAllowed ? (
              <p className="muted">
                ต้องเป็น Unique หรือสูงกว่าเพื่อใส่ Emblem
              </p>
            ) : item.emblem ? (
              <>
                <div className="soul-summary">
                  {emblemDef && (
                    <img
                      src={emblemDef.icon}
                      alt=""
                      className="soul-icon lg"
                    />
                  )}
                  <div className="soul-summary-text">
                    <strong>{item.emblem.name}</strong>
                    <p className="muted">{emblemDef?.effectLabel ?? 'Effect'}</p>
                  </div>
                </div>
                <div className="field-grid" style={{ marginTop: 8 }}>
                  <label>
                    Lv
                    <input
                      type="number"
                      min={0}
                      value={item.emblem.level}
                      onChange={(e) =>
                        setItem({
                          ...item,
                          emblem: {
                            ...item.emblem!,
                            level: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </label>
                  <label>
                    Base opt +%
                    <input
                      type="number"
                      value={item.emblem.baseOptionBoostPercent}
                      disabled={isAccessoryEmblem}
                      onChange={(e) =>
                        setItem({
                          ...item,
                          emblem: {
                            ...item.emblem!,
                            baseOptionBoostPercent: Number(e.target.value),
                          },
                        })
                      }
                    />
                    {isAccessoryEmblem && (
                      <span className="muted" style={{ marginTop: 4 }}>
                        เครื่องประดับไม่มีโบนัสออฟพื้นฐาน
                      </span>
                    )}
                  </label>
                  <label>
                    {emblemDef?.effectLabel ?? 'Effect'} (%)
                    <input
                      type="number"
                      step="0.01"
                      value={emblemEffectValue(item.emblem)}
                      onChange={(e) => {
                        const def = emblemById(item.emblem!.typeId)
                        if (!def) return
                        setItem({
                          ...item,
                          emblem: {
                            ...item.emblem!,
                            lines: buildEmblemLines(
                              def,
                              Number(e.target.value),
                              emblemMaxDamageValue(item.emblem!),
                            ),
                          },
                        })
                      }}
                    />
                  </label>
                  <label>
                    DMG สูงสุด
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={emblemMaxDamageValue(item.emblem)}
                      onChange={(e) => {
                        const def = emblemById(item.emblem!.typeId)
                        if (!def) return
                        setItem({
                          ...item,
                          emblem: {
                            ...item.emblem!,
                            lines: buildEmblemLines(
                              def,
                              emblemEffectValue(item.emblem!),
                              Number(e.target.value),
                            ),
                          },
                        })
                      }}
                    />
                  </label>
                </div>
                <div className="soul-summary-actions">
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => setEmblemPickerOpen(true)}
                  >
                    เปลี่ยน Emblem
                  </button>
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => setItem({ ...item, emblem: null })}
                  >
                    ลบ Emblem
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                className="btn ghost"
                onClick={() => setEmblemPickerOpen(true)}
              >
                เลือก Emblem
              </button>
            )}
          </section>

          <section>
            <h4>Soul</h4>
            {!soulSupported ? (
              <p className="muted">ช่องนี้ยังไม่รองรับ Soul</p>
            ) : item.soul ? (
              <>
                <div className="soul-summary">
                  {soulBoss && (
                    <img
                      src={soulBoss.icon}
                      alt=""
                      className="soul-icon lg"
                    />
                  )}
                  <div className="soul-summary-text">
                    <strong>{item.soul.name}</strong>
                    <p className="muted">{item.soul.stat.label}</p>
                    {item.soul.skillNote && (
                      <p className="muted">Skill: {item.soul.skillNote}</p>
                    )}
                  </div>
                </div>
                <div className="soul-summary-actions">
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => setSoulPickerOpen(true)}
                  >
                    เปลี่ยน Soul
                  </button>
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => setItem({ ...item, soul: null })}
                  >
                    ลบ Soul
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                className="btn ghost"
                onClick={() => setSoulPickerOpen(true)}
              >
                เลือก Soul
              </button>
            )}
          </section>
        </div>

        {soulPickerOpen && (
          <SoulPickerPopup
            slot={slot}
            initial={item.soul}
            onClose={() => setSoulPickerOpen(false)}
            onPick={(soul) => {
              setItem({ ...item, soul })
              setSoulPickerOpen(false)
            }}
          />
        )}

        {emblemPickerOpen && (
          <EmblemPickerPopup
            slot={slot}
            selectedTypeId={item.emblem?.typeId}
            onClose={() => setEmblemPickerOpen(false)}
            onPick={(def) => {
              const prev = item.emblem
              const effect = prev ? emblemEffectValue(prev) : 0
              const maxDmg = prev ? emblemMaxDamageValue(prev) : 0
              setItem({
                ...item,
                emblem: {
                  typeId: def.id,
                  name: def.name,
                  level: prev?.level ?? 1,
                  baseOptionBoostPercent:
                    prev?.baseOptionBoostPercent ?? defaultBaseBoost(slot),
                  lines: buildEmblemLines(def, effect, maxDmg),
                },
              })
              setEmblemPickerOpen(false)
            }}
          />
        )}

        <footer className="edit-footer">
          <button type="button" className="btn ghost" onClick={onClose}>
            ยกเลิก
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() =>
              onSave({
                ...item,
                slotId: slot,
                itemName: item.itemName || SLOT_LABELS[slot],
              })
            }
          >
            บันทึก
          </button>
        </footer>
      </div>
    </div>
  )
}
