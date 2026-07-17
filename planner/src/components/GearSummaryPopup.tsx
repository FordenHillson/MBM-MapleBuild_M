import {
  PLAYER_PERCENT_KEYS,
  SLOT_LABELS,
  type GearItem,
  type GearSlotId,
  type PotentialGrade,
  type StatLine,
} from '../types/build'
import { resolveGearOptionId } from '../engine/gearStatMap'
import { potentialFrameClass } from '../data/potentialWeapon'
import {
  emblemById,
  emblemEffectValue,
  emblemMaxDamageValue,
} from '../data/emblems'
import {
  isArmorBaseGearSlot,
  supportsArmorMainOption,
  usesArmorMpBase,
} from '../data/armorBaseGear'
import { parseSoulId, soulBossById } from '../data/souls'
import { flameRankFrameClass, isFlameSlot } from '../data/flameWeapon'
import { supportsHighTierOption } from '../data/highTierOption'
import {
  WEAPON_RANK_SKILL,
  supportsWeaponRankSkill,
} from '../data/weaponRankSkill'
import { supportsSharenianAbility } from '../data/sharenianAbility'
import { rankFrameClass } from '../data/itemRankStyle'
import { resolveItemRankFrameLayers } from '../data/itemRankTextures'
import { SlotSilhouette } from './SlotSilhouette'
import './Popup.css'

function potGradeLetter(grade: PotentialGrade): string {
  return grade.charAt(0)
}

function formatLineValue(line: StatLine): string {
  const key = resolveGearOptionId(line.optionId)
  if (line.optionId === 'maxDamage' || key === 'maxDamage') {
    return line.value.toLocaleString('en-US')
  }
  if (key === 'feverDurationSec' || line.optionId === 'feverDurationSec') {
    return `${line.value}s`
  }
  if (
    key === 'hpRecovery' ||
    key === 'mpRecovery' ||
    key === 'phyAtk' ||
    key === 'magAtk' ||
    key === 'critAtk'
  ) {
    return key === 'critAtk' || key === 'phyAtk' || key === 'magAtk'
      ? line.value.toLocaleString('en-US')
      : String(line.value)
  }
  if (key && PLAYER_PERCENT_KEYS.has(key)) {
    return `${line.value}%`
  }
  // Flame / unlabeled labels often store percents without mapped key
  if (
    line.label.includes('%') ||
    /percent|dmg|rate|atk|def|acc|evd|exp|meso|drop|crit|final|boss/i.test(
      line.optionId,
    )
  ) {
    return `${line.value}%`
  }
  return String(line.value)
}

function activeLines(lines: StatLine[]): StatLine[] {
  return lines.filter((l) => Boolean(l.optionId))
}

export function GearSummaryPopup({
  slot,
  item,
  onClose,
  onEdit,
  onClear,
}: {
  slot: GearSlotId
  item: GearItem
  onClose: () => void
  onEdit: () => void
  onClear: () => void
}) {
  const total = item.atkBase + item.atkBonus
  const title = item.itemName || SLOT_LABELS[slot]
  const soulSuffix = item.soul
    ? ` ของ ${item.soul.name.replace(/ Soul$/, '')}`
    : ''
  const potLines = activeLines(item.potential?.lines ?? [])
  const bonusLines = activeLines(item.bonusPotential?.lines ?? [])
  const flameLines =
    isFlameSlot(slot) && item.flameRank
      ? activeLines(item.mainLines)
      : []
  const otherMainLines = !isFlameSlot(slot)
    ? activeLines(item.mainLines)
    : []
  const emblemDef = item.emblem ? emblemById(item.emblem.typeId) : undefined
  const soulParsed = item.soul ? parseSoulId(item.soul.soulId, slot) : null
  const soulBoss = soulParsed
    ? soulBossById(soulParsed.bossId)
    : undefined
  const starCount = Math.max(0, Math.min(30, Math.round(item.star) || 0))
  const flameClass = item.flameRank
    ? flameRankFrameClass(item.flameRank)
    : ''
  const showFlame = flameLines.length > 0
  const showPotential = potLines.length > 0 && item.potential != null
  const showBonus = bonusLines.length > 0 && item.bonusPotential != null
  const layers = resolveItemRankFrameLayers(item.rank, 'summary', {
    hasEmblem: Boolean(item.emblem),
  })

  return (
    <div
      className="popup-backdrop popup-fixed"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="summary-popup summary-dossier"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Gear summary"
      >
        <header className="dossier-header">
          <div className="dossier-header-text">
            <p className="summary-slot">{SLOT_LABELS[slot]}</p>
            <h3>
              {title}
              {soulSuffix}
            </h3>
          </div>
          <button type="button" className="icon-btn dossier-close" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className="dossier-stars" aria-label={`Star Force ${starCount}`}>
          {Array.from({ length: starCount }, (_, i) => (
            <span key={i} className="dossier-star">
              ★
            </span>
          ))}
          {starCount === 0 && <span className="dossier-star muted-star">—</span>}
        </div>

        <div className="dossier-body">
          <div className="dossier-top">
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
                <img
                  src={item.iconUrl}
                  alt=""
                  className="dossier-icon-img"
                />
              ) : (
                <SlotSilhouette
                  slot={slot}
                  className="dossier-icon-silhouette"
                />
              )}
              {showPotential && item.potential && (
                <span
                  className={`dossier-badge pot ${potentialFrameClass(item.potential.grade)}`}
                  title={`Potential ${item.potential.grade}`}
                >
                  {potGradeLetter(item.potential.grade)}
                </span>
              )}
              {item.bonusPotential && (
                <span
                  className={`dossier-badge add ${potentialFrameClass(item.bonusPotential.grade)}`}
                  title={`Bonus Potential ${item.bonusPotential.grade}`}
                >
                  {potGradeLetter(item.bonusPotential.grade)}
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

            <div className="dossier-meta">
              <div className="dossier-meta-row">
                <span>ช่อง</span>
                <strong>{SLOT_LABELS[slot]}</strong>
              </div>
              <div className="dossier-meta-row">
                <span>Level</span>
                <strong>{item.level}</strong>
              </div>
              <div className="dossier-meta-row">
                <span>Rank</span>
                <strong>{item.rank}</strong>
              </div>
              {showFlame && (
                <div className="dossier-meta-row">
                  <span>Flame</span>
                  <strong className={`dossier-flame-text ${flameClass}`}>
                    {item.flameRank}
                  </strong>
                </div>
              )}
            </div>
          </div>

          {isArmorBaseGearSlot(slot) ? (
            <section className="dossier-section dossier-opt-list" aria-label="Option">
              <div className="dossier-opt-row">
                <span>PHY / MAG DEF</span>
                <strong className="dossier-opt-value">
                  {item.phyDefBase.toLocaleString('en-US')}
                </strong>
              </div>
              <div className="dossier-opt-row">
                <span>{usesArmorMpBase(slot) ? 'MP สูงสุด' : 'HP สูงสุด'}</span>
                <strong className="dossier-opt-value">
                  {(usesArmorMpBase(slot)
                    ? item.maxMpBase
                    : item.maxHpBase
                  ).toLocaleString('en-US')}
                </strong>
              </div>
              {item.highTierOption &&
                supportsArmorMainOption(slot, item.rank) && (
                  <div className="dossier-opt-row dossier-opt-main">
                    <span>{item.highTierOption.label}</span>
                    <strong className="dossier-opt-value">
                      {formatLineValue(item.highTierOption)}
                    </strong>
                  </div>
                )}
              <div className="dossier-opt-row">
                <span>DMG สูงสุด</span>
                <strong className="dossier-opt-value">
                  {item.maxDamageBase.toLocaleString('en-US')}
                </strong>
              </div>
              <div className="dossier-opt-row dossier-opt-set">
                <span className="dossier-opt-set-label">
                  ออปชั่นเซ็ต
                  <span className="dossier-opt-help" title="จะเพิ่มสเตตทีหลัง" aria-hidden>
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
                    {total.toLocaleString('en-US')}
                  </strong>
                </div>
                <p className="dossier-atk-break">
                  ({item.atkBase.toLocaleString('en-US')} +{' '}
                  {item.atkBonus.toLocaleString('en-US')})
                </p>
              </div>

              {item.highTierOption &&
                supportsHighTierOption(slot, item.rank) && (
                  <section className="dossier-section high-tier-sec">
                    <div className="dossier-sec-head">
                      <strong>Option หลัก</strong>
                    </div>
                    <div className="dossier-row">
                      <span>{item.highTierOption.label}</span>
                      <strong>{item.highTierOption.value}%</strong>
                    </div>
                  </section>
                )}
            </>
          )}

          {item.sharenianAbility &&
            supportsSharenianAbility(slot, item.rank) && (
            <section className="dossier-section sharenian-sec">
              <div className="dossier-sec-head">
                <strong>Sharenian Ability</strong>
              </div>
              {item.sharenianAbility.map((line) => (
                <div className="dossier-row" key={line.optionId}>
                  <span>{line.label}</span>
                  <strong>{line.value}%</strong>
                </div>
              ))}
            </section>
          )}

          {showFlame && (
            <section className={`dossier-section flame-sec ${flameClass}`}>
              <div className="dossier-sec-head">
                <strong className={`dossier-flame-text ${flameClass}`}>
                  Rebirth Flame
                </strong>
                <span className={`dossier-grade-name dossier-flame-text ${flameClass}`}>
                  {item.flameRank}
                </span>
              </div>
              {flameLines.map((line, i) => (
                <div
                  className={`dossier-row dossier-flame-row ${flameClass}`}
                  key={`${line.optionId}-${i}`}
                >
                  <span>{line.label || line.optionId}</span>
                  <strong>{formatLineValue(line)}</strong>
                </div>
              ))}
            </section>
          )}

          {otherMainLines.length > 0 && (
            <section className="dossier-section">
              {otherMainLines.map((line, i) => (
                <div className="dossier-row" key={`${line.optionId}-${i}`}>
                  <span>{line.label || line.optionId}</span>
                  <strong>{formatLineValue(line)}</strong>
                </div>
              ))}
            </section>
          )}

          {showPotential && item.potential && (
            <section className="dossier-section pot-sec">
              <div className="dossier-sec-head">
                <span
                  className={`dossier-tag ${potentialFrameClass(item.potential.grade)}`}
                >
                  {potGradeLetter(item.potential.grade)}
                </span>
                <strong>Potential</strong>
                <span className="dossier-grade-name">{item.potential.grade}</span>
              </div>
              {potLines.map((line, i) => (
                <div className="dossier-row" key={`pot-${i}`}>
                  <span>{line.label}</span>
                  <strong>{formatLineValue(line)}</strong>
                </div>
              ))}
            </section>
          )}

          {showBonus && item.bonusPotential && (
            <section className="dossier-section bonus-sec">
              <div className="dossier-sec-head">
                <span
                  className={`dossier-tag ${potentialFrameClass(item.bonusPotential.grade)}`}
                >
                  {potGradeLetter(item.bonusPotential.grade)}
                </span>
                <strong>Bonus Potential</strong>
                <span className="dossier-grade-name">
                  {item.bonusPotential.grade}
                </span>
              </div>
              {bonusLines.map((line, i) => (
                <div className="dossier-row" key={`bonus-${i}`}>
                  <span>{line.label}</span>
                  <strong>{formatLineValue(line)}</strong>
                </div>
              ))}
            </section>
          )}

          {item.emblem && (
            <section className="dossier-section emblem-sec">
              <div className="dossier-sec-head">
                <strong>
                  Lv.{item.emblem.level} {item.emblem.name}
                </strong>
              </div>
              <div className="dossier-emblem-row">
                {emblemDef && (
                  <img
                    src={emblemDef.icon}
                    alt=""
                    className="dossier-mod-icon"
                  />
                )}
                <div className="dossier-emblem-stats">
                  <div className="dossier-row">
                    <span>Base options ของอุปกรณ์</span>
                    <strong>+{item.emblem.baseOptionBoostPercent}%</strong>
                  </div>
                  <div className="dossier-row">
                    <span>
                      {emblemDef?.effectLabel ??
                        item.emblem.lines[0]?.label ??
                        'Effect'}
                    </span>
                    <strong>{emblemEffectValue(item.emblem)}%</strong>
                  </div>
                  {emblemMaxDamageValue(item.emblem) > 0 && (
                    <div className="dossier-row">
                      <span>DMG สูงสุด</span>
                      <strong>
                        {emblemMaxDamageValue(item.emblem).toLocaleString(
                          'en-US',
                        )}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {item.soul && (
            <section className="dossier-section soul-sec">
              <div className="dossier-sec-head soul">
                <strong>Using {item.soul.name}</strong>
              </div>
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
                    <span>{item.soul.stat.label.replace(/\s*\([^)]*\)\s*$/, '')}</span>
                    <strong className="soul-accent">
                      {formatLineValue(item.soul.stat)}
                    </strong>
                  </div>
                  {item.soul.skillNote && (
                    <p className="dossier-skill-note">
                      Soul Skill: {item.soul.skillNote}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}
          {supportsWeaponRankSkill(item.slotId, item.rank) && (
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

        <footer className="dossier-footer">
          <button type="button" className="btn ghost light" onClick={onClear}>
            ลบชิ้นนี้
          </button>
          <button type="button" className="btn primary" onClick={onEdit}>
            แก้ไขรายละเอียด
          </button>
        </footer>
      </div>
    </div>
  )
}
