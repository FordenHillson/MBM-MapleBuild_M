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
  flameRankFrameClass,
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
  WEAPON_RANK_SKILL,
  supportsWeaponRankSkill,
} from '../data/weaponRankSkill'
import {
  armorMainOptionOptions,
  emptyArmorMainOption,
  isArmorBaseGearSlot,
  normalizeArmorMainOption,
  supportsArmorMainOption,
  usesArmorMpBase,
} from '../data/armorBaseGear'
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
    maxMpBase: 0,
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
    <div className="dossier-edit-lines">
      {lines.map((line, idx) => (
        <div className="dossier-edit-line" key={idx}>
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
            className="dossier-edit-value"
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
    <div className="dossier-edit-lines">
      {rows.map((line, idx) => {
        const values = line.optionId
          ? flameValues(slot, line.optionId, flameRank)
          : []
        return (
          <div className="dossier-edit-line" key={idx}>
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
              className="dossier-edit-value"
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
    <div className="dossier-edit-lines">
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
          <div className="dossier-edit-line" key={idx}>
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
              className="dossier-edit-value"
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
      highTierOption: isArmorBaseGearSlot(slot)
          ? normalizeArmorMainOption(slot, normalizedRank, base.highTierOption)
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

  const starCount = Math.max(0, Math.min(30, Math.round(item.star) || 0))
  const flameClass = item.flameRank
    ? flameRankFrameClass(item.flameRank)
    : ''

  const setRank = (rank: ItemRank) => {
    const allowEmblem = canEquipEmblem(slot, rank)
    if (!allowEmblem) setEmblemPickerOpen(false)
    const nextHighTier = isArmorBaseGearSlot(slot)
      ? normalizeArmorMainOption(slot, rank, item.highTierOption)
      : normalizeHighTierOption(slot, rank, item.highTierOption)
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
  }

  return (
    <div
      className="popup-backdrop popup-fixed"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="summary-popup summary-dossier edit-dossier"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Edit gear"
      >
        <header className="dossier-header">
          <div className="dossier-header-text">
            <p className="summary-slot">{SLOT_LABELS[slot]}</p>
            <input
              className="title-input dossier-title-input"
              value={item.itemName}
              placeholder="ชื่อไอเทม"
              onChange={(e) => setItem({ ...item, itemName: e.target.value })}
            />
          </div>
          <button type="button" className="icon-btn dossier-close" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className="dossier-stars edit-dossier-stars" aria-label={`Star Force ${starCount}`}>
          <label className="edit-star-field">
            <span>★</span>
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
          <div className="edit-star-preview">
            {Array.from({ length: starCount }, (_, i) => (
              <span key={i} className="dossier-star">
                ★
              </span>
            ))}
            {starCount === 0 && (
              <span className="dossier-star muted-star">—</span>
            )}
          </div>
        </div>

        <div className="dossier-body">
          <div className="dossier-top">
            <div className="edit-dossier-icon-col">
              <div
                className={`dossier-icon ${rankFrameClass(item.rank)} has-rank-tex${layers.emblem ? ' has-emblem-tex' : ''}`}
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
                  <img src={item.iconUrl} alt="" className="dossier-icon-img" />
                ) : (
                  <SlotSilhouette
                    slot={slot}
                    className="dossier-icon-silhouette"
                  />
                )}
                {item.potential && (
                  <span
                    className={`dossier-badge pot ${potentialFrameClass(item.potential.grade)}`}
                  >
                    {item.potential.grade[0]}
                  </span>
                )}
                {item.bonusPotential && (
                  <span
                    className={`dossier-badge add ${potentialFrameClass(item.bonusPotential.grade)}`}
                  >
                    {item.bonusPotential.grade[0]}
                  </span>
                )}
                {item.emblem && (
                  <span className="dossier-badge emb" title={item.emblem.name}>
                    Em
                  </span>
                )}
                {starCount > 0 && (
                  <span className="dossier-badge star-n">{starCount}</span>
                )}
              </div>
              <div className="edit-icon-actions">
                <label className="btn ghost light gear-icon-upload">
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
                    className="btn ghost light"
                    onClick={() => setItem({ ...item, iconUrl: '' })}
                  >
                    ลบรูป
                  </button>
                )}
              </div>
              <input
                className="edit-icon-url"
                type="url"
                placeholder="URL รูป"
                value={item.iconUrl.startsWith('data:') ? '' : item.iconUrl}
                onChange={(e) =>
                  setItem({
                    ...item,
                    iconUrl: normalizeIconUrl(e.target.value),
                  })
                }
              />
            </div>

            <div className="dossier-meta">
              <div className="dossier-meta-row">
                <span>ช่อง</span>
                <strong>{SLOT_LABELS[slot]}</strong>
              </div>
              <div className="dossier-meta-row">
                <span>Rank</span>
                <select
                  className="dossier-meta-input"
                  value={item.rank}
                  disabled={rootAbyssLocked}
                  onChange={(e) => setRank(e.target.value as ItemRank)}
                >
                  {ranks.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="dossier-meta-row">
                <span>Level</span>
                <input
                  type="number"
                  className="dossier-meta-input"
                  value={item.level}
                  onChange={(e) =>
                    setItem({ ...item, level: Number(e.target.value) })
                  }
                />
              </div>
              {rootAbyssLocked && (
                <p className="muted edit-lock-hint">
                  Root Abyss ล็อกคู่ Top / Bottom
                </p>
              )}
            </div>
          </div>

          {isArmorBaseGearSlot(slot) ? (
            <section className="dossier-section dossier-opt-list" aria-label="Option">
              <div className="dossier-opt-row">
                <span>PHY / MAG DEF</span>
                <input
                  type="number"
                  className="dossier-opt-input"
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
              </div>
              <div className="dossier-opt-row">
                <span>{usesArmorMpBase(slot) ? 'MP สูงสุด' : 'HP สูงสุด'}</span>
                <input
                  type="number"
                  className="dossier-opt-input"
                  value={
                    usesArmorMpBase(slot) ? item.maxMpBase : item.maxHpBase
                  }
                  onChange={(e) => {
                    const n = Number(e.target.value)
                    setItem(
                      usesArmorMpBase(slot)
                        ? { ...item, maxMpBase: n, maxHpBase: 0 }
                        : { ...item, maxHpBase: n },
                    )
                  }}
                />
              </div>
              {supportsArmorMainOption(slot, item.rank) ? (
                <div className="dossier-opt-row dossier-opt-main dossier-opt-edit-pair">
                  <select
                    value={
                      item.highTierOption?.optionId ??
                      armorMainOptionOptions(slot, item.rank)[0]!.optionId
                    }
                    onChange={(e) => {
                      const optionId = e.target.value
                      setItem({
                        ...item,
                        highTierOption: emptyArmorMainOption(
                          slot,
                          optionId || undefined,
                          item.highTierOption?.value ?? 0,
                          item.rank,
                        ),
                      })
                    }}
                  >
                    {armorMainOptionOptions(slot, item.rank).map((opt) => (
                      <option key={opt.optionId} value={opt.optionId}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    className="dossier-opt-input"
                    value={item.highTierOption?.value ?? 0}
                    onChange={(e) =>
                      setItem({
                        ...item,
                        highTierOption: {
                          ...(item.highTierOption ??
                            emptyArmorMainOption(
                              slot,
                              undefined,
                              0,
                              item.rank,
                            )),
                          value: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              ) : null}
              <div className="dossier-opt-row">
                <span>DMG สูงสุด</span>
                <input
                  type="number"
                  className="dossier-opt-input"
                  value={item.maxDamageBase}
                  onChange={(e) =>
                    setItem({
                      ...item,
                      maxDamageBase: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="dossier-opt-row dossier-opt-set">
                <span className="dossier-opt-set-label">
                  ออปชั่นเซ็ต
                  <span className="dossier-opt-help" aria-hidden>
                    ?
                  </span>
                </span>
                <strong className="dossier-opt-set-value">ไม่มีเอฟเฟกต์</strong>
              </div>
            </section>
          ) : (
            <>
              <div className="dossier-atk">
                <div className="dossier-atk-main">
                  <span className="dossier-atk-label">PHY ATK</span>
                  <strong className="dossier-atk-value">
                    {total.toLocaleString()}
                  </strong>
                </div>
                <div className="edit-atk-break">
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
              </div>

              {supportsHighTierOption(slot, item.rank) &&
                item.highTierOption && (
                  <section className="dossier-section high-tier-sec">
                    <div className="dossier-sec-head">
                      <strong>Option หลัก</strong>
                    </div>
                    <div className="dossier-edit-line">
                      <select
                        value={item.highTierOption.optionId}
                        onChange={(e) => {
                          const def =
                            highTierOptionByOptionId(e.target.value) ??
                            WEAPON_HIGH_TIER_OPTIONS[0]!
                          setItem({
                            ...item,
                            highTierOption: {
                              optionId: def.optionId,
                              label: def.label,
                              value: item.highTierOption!.value,
                            },
                          })
                        }}
                      >
                        {WEAPON_HIGH_TIER_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.optionId}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        className="dossier-edit-value"
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
                    </div>
                  </section>
                )}
            </>
          )}

          {supportsSharenianAbility(slot, item.rank) &&
            item.sharenianAbility && (
              <section className="dossier-section sharenian-sec">
                <div className="dossier-sec-head">
                  <strong>Sharenian Ability</strong>
                </div>
                {item.sharenianAbility.map((line, idx) => (
                  <div className="dossier-opt-row" key={line.optionId}>
                    <span>{line.label}</span>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      className="dossier-opt-input"
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
                  </div>
                ))}
              </section>
            )}

          {(isFlameSlot(slot) || !isArmorBaseGearSlot(slot)) && (
            <section className={`dossier-section flame-sec ${flameClass}`}>
              <div className="dossier-sec-head">
                <strong className={item.flameRank ? `dossier-flame-text ${flameClass}` : ''}>
                  {isFlameSlot(slot) ? 'Rebirth Flame' : 'สายหลัก'}
                </strong>
                {isFlameSlot(slot) && (
                  <select
                    className="dossier-sec-select"
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
          )}

          <section
            className={`dossier-section pot-sec ${item.potential ? potentialFrameClass(item.potential.grade) : ''}`}
          >
            <div className="dossier-sec-head">
              {item.potential && (
                <span
                  className={`dossier-tag ${potentialFrameClass(item.potential.grade)}`}
                >
                  {item.potential.grade[0]}
                </span>
              )}
              <strong>Potential</strong>
              <select
                className="dossier-sec-select"
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
            className={`dossier-section bonus-sec ${item.bonusPotential ? potentialFrameClass(item.bonusPotential.grade) : ''}`}
          >
            <div className="dossier-sec-head">
              {item.bonusPotential && (
                <span
                  className={`dossier-tag ${potentialFrameClass(item.bonusPotential.grade)}`}
                >
                  {item.bonusPotential.grade[0]}
                </span>
              )}
              <strong>Bonus Potential</strong>
              <select
                className="dossier-sec-select"
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

          <section className="dossier-section emblem-sec">
            <div className="dossier-sec-head">
              <strong>
                {item.emblem
                  ? `Lv.${item.emblem.level} ${item.emblem.name}`
                  : 'Emblem'}
              </strong>
            </div>
            {!emblemSupported ? (
              <p className="muted">ช่องนี้ไม่มี Emblem</p>
            ) : !emblemAllowed ? (
              <p className="muted">ต้องเป็น Unique หรือสูงกว่าเพื่อใส่ Emblem</p>
            ) : item.emblem ? (
              <>
                <div className="dossier-emblem-row">
                  {emblemDef && (
                    <img
                      src={emblemDef.icon}
                      alt=""
                      className="dossier-mod-icon"
                    />
                  )}
                  <div className="dossier-emblem-stats">
                    <div className="dossier-opt-row">
                      <span>Lv</span>
                      <input
                        type="number"
                        min={0}
                        className="dossier-opt-input"
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
                    </div>
                    <div className="dossier-opt-row">
                      <span>Base options</span>
                      <input
                        type="number"
                        className="dossier-opt-input"
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
                    </div>
                    <div className="dossier-opt-row">
                      <span>{emblemDef?.effectLabel ?? 'Effect'} (%)</span>
                      <input
                        type="number"
                        step="0.01"
                        className="dossier-opt-input"
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
                    </div>
                    <div className="dossier-opt-row">
                      <span>DMG สูงสุด</span>
                      <input
                        type="number"
                        min={0}
                        className="dossier-opt-input"
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
                    </div>
                  </div>
                </div>
                <div className="soul-summary-actions">
                  <button
                    type="button"
                    className="btn ghost light"
                    onClick={() => setEmblemPickerOpen(true)}
                  >
                    เปลี่ยน Emblem
                  </button>
                  <button
                    type="button"
                    className="btn ghost light"
                    onClick={() => setItem({ ...item, emblem: null })}
                  >
                    ลบ Emblem
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                className="btn ghost light"
                onClick={() => setEmblemPickerOpen(true)}
              >
                เลือก Emblem
              </button>
            )}
          </section>

          <section className="dossier-section soul-sec">
            <div className="dossier-sec-head soul">
              <strong>
                {item.soul ? `Using ${item.soul.name}` : 'Soul'}
              </strong>
            </div>
            {!soulSupported ? (
              <p className="muted">ช่องนี้ยังไม่รองรับ Soul</p>
            ) : item.soul ? (
              <>
                <div className="dossier-emblem-row">
                  {soulBoss && (
                    <img
                      src={soulBoss.icon}
                      alt=""
                      className="dossier-mod-icon"
                    />
                  )}
                  <div className="dossier-emblem-stats">
                    <div className="dossier-row">
                      <span>
                        {item.soul.stat.label.replace(/\s*\([^)]*\)\s*$/, '')}
                      </span>
                      <strong className="soul-accent">
                        {item.soul.stat.value}
                        {item.soul.stat.optionId === 'maxDamage' ||
                        item.soul.stat.optionId === 'hpRecovery' ||
                        item.soul.stat.optionId === 'mpRecovery'
                          ? ''
                          : item.soul.stat.optionId === 'feverDurationSec'
                            ? 's'
                            : '%'}
                      </strong>
                    </div>
                    {item.soul.skillNote && (
                      <p className="dossier-skill-note">
                        Soul Skill: {item.soul.skillNote}
                      </p>
                    )}
                  </div>
                </div>
                <div className="soul-summary-actions">
                  <button
                    type="button"
                    className="btn ghost light"
                    onClick={() => setSoulPickerOpen(true)}
                  >
                    เปลี่ยน Soul
                  </button>
                  <button
                    type="button"
                    className="btn ghost light"
                    onClick={() => setItem({ ...item, soul: null })}
                  >
                    ลบ Soul
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                className="btn ghost light"
                onClick={() => setSoulPickerOpen(true)}
              >
                เลือก Soul
              </button>
            )}
          </section>

          {supportsWeaponRankSkill(slot, item.rank) && (
            <section
              className="dossier-section weapon-rank-skill-sec"
              aria-label="Weapon skill"
            >
              <div className="weapon-rank-skill-row">
                <img
                  src={WEAPON_RANK_SKILL.iconUrl}
                  alt=""
                  className="dossier-mod-icon"
                />
                <div className="weapon-rank-skill-text">
                  <strong className="weapon-rank-skill-name">
                    {WEAPON_RANK_SKILL.name}
                  </strong>
                  <span className="weapon-rank-skill-effect">
                    {WEAPON_RANK_SKILL.effectLabel}
                  </span>
                  <span className="weapon-rank-skill-note">
                    {WEAPON_RANK_SKILL.note}
                  </span>
                </div>
              </div>
            </section>
          )}
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

        <footer className="dossier-footer">
          <button type="button" className="btn ghost light" onClick={onClose}>
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
