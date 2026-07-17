import type {
  AtkStatBag,
  GearItem,
  GearSlotId,
  PlayerStatKey,
  StatLine,
} from '../types/build'
import { ATK_STAT_KEYS } from '../types/build'
import { isFlameSlot } from '../data/flameWeapon'
import { resolveSoulSet } from '../data/souls'
import { weaponRankSkillBonus } from '../data/weaponRankSkill'

/** Central optionId → PlayerStatKey map. Future gear systems register here. */
export const GEAR_OPTION_TO_STAT: Record<string, PlayerStatKey> = {
  // ATK
  phyAtk: 'phyAtk',
  atk: 'phyAtk',
  'PHY ATK': 'phyAtk',
  magAtk: 'magAtk',
  'MAG ATK': 'magAtk',
  phyAtkPercent: 'phyAtkPercent',
  atkPercent: 'phyAtkPercent',
  'ATK%': 'phyAtkPercent',
  magAtkPercent: 'magAtkPercent',
  'MAG ATK%': 'magAtkPercent',
  phyDmgPercent: 'phyDmgPercent',
  dmgPercent: 'phyDmgPercent',
  'DMG%': 'phyDmgPercent',
  magDmgPercent: 'magDmgPercent',
  'MAG DMG%': 'magDmgPercent',
  bossAtkPercent: 'bossAtkPercent',
  bossAtk: 'bossAtkPercent',
  'Boss ATK%': 'bossAtkPercent',
  critAtk: 'critAtk',
  'Crit ATK': 'critAtk',
  critRate: 'critRate',
  'Crit Rate': 'critRate',
  critDmg: 'critDmgPercent',
  critDmgPercent: 'critDmgPercent',
  'Crit DMG': 'critDmgPercent',
  critDmgRes: 'critDmgReducePercent',
  'Crit DMG RES': 'critDmgReducePercent',
  finalPercent: 'finalPercent',
  finalDmg: 'finalPercent',
  'Final%': 'finalPercent',
  'Final DMG': 'finalPercent',
  'Boss ATK Increase': 'bossAtkPercent',
  ignoreDef: 'ignoreDefPercent',
  ignoreDefPercent: 'ignoreDefPercent',
  maxDamage: 'maxDamage',

  // DEF (emblem / soul / potential)
  phyDef: 'phyDef',
  'PHY DEF': 'phyDef',
  magDef: 'magDef',
  'MAG DEF': 'magDef',
  phyDefPercent: 'phyDefPercent',
  magDefPercent: 'magDefPercent',
  bossDefPercent: 'bossDefPercent',
  'Boss DEF%': 'bossDefPercent',
  'Boss DEF Increase': 'bossDefPercent',
  phyDmgReducePercent: 'phyDmgReducePercent',
  'PHY DMG Reduction': 'phyDmgReducePercent',
  magDmgReducePercent: 'magDmgReducePercent',
  'MAG DMG Reduction': 'magDmgReducePercent',

  // Chance — potential ACC / soul EVD
  acc: 'accPercent',
  ACC: 'accPercent',
  accPercent: 'accPercent',
  evd: 'evd',
  EVD: 'evd',
  evdFlat: 'evd',
  evdPercent: 'evdPercent',

  // Resource
  maxHp: 'maxHp',
  maxHpPercent: 'maxHpPercent',
  'maxHp%': 'maxHpPercent',
  maxHpPct: 'maxHpPercent',
  maxMp: 'maxMp',
  maxMpPercent: 'maxMpPercent',
  'maxMp%': 'maxMpPercent',
  maxMpPct: 'maxMpPercent',
  hpRecovery: 'hpRecovery',
  mpRecovery: 'mpRecovery',

  // Acquire
  expGainPercent: 'expGainPercent',
  itemDropPercent: 'itemDropPercent',
  mesoGainPercent: 'mesoGainPercent',
  meso: 'mesoGainPercent',
  'Meso Acquisition Increase': 'mesoGainPercent',
  'Meso Acquisition': 'mesoGainPercent',
  spdPercent: 'spdPercent',
  'SPD Increase': 'spdPercent',
  feverDurationSec: 'feverDurationSec',
  'Fever Buff DUR': 'feverDurationSec',
}

export type GearStatBag = Partial<Record<PlayerStatKey, number>>

export function emptyGearStatBag(): GearStatBag {
  return {}
}

export function mergeGearStatBag(
  into: GearStatBag,
  addend: GearStatBag,
): GearStatBag {
  const out: GearStatBag = { ...into }
  for (const key of Object.keys(addend) as PlayerStatKey[]) {
    const v = addend[key]
    if (v == null || v === 0) continue
    out[key] = (out[key] ?? 0) + v
  }
  return out
}

export function resolveGearOptionId(optionId: string): PlayerStatKey | null {
  if (!optionId) return null
  return GEAR_OPTION_TO_STAT[optionId] ?? null
}

export function contributeGearLine(bag: GearStatBag, line: StatLine): void {
  const key = resolveGearOptionId(line.optionId)
  if (!key) return
  bag[key] = (bag[key] ?? 0) + line.value
}

function contributeLines(bag: GearStatBag, lines: StatLine[]): void {
  for (const line of lines) contributeGearLine(bag, line)
}

/**
 * Sum all non-flame gear StatLines into PlayerStatKey totals.
 * Flame mainLines are excluded (converted later via applyFlameScales).
 */
export function aggregateGearPlayerStats(
  gear: Partial<Record<GearSlotId, GearItem | null>>,
): GearStatBag {
  const bag = emptyGearStatBag()

  for (const item of Object.values(gear)) {
    if (!item) continue
    const pieceAtk = item.atkBase + item.atkBonus
    bag.phyAtk = (bag.phyAtk ?? 0) + pieceAtk
    bag.phyDef = (bag.phyDef ?? 0) + item.phyDefBase
    bag.magDef = (bag.magDef ?? 0) + item.magDefBase
    bag.maxHp = (bag.maxHp ?? 0) + item.maxHpBase
    bag.maxMp = (bag.maxMp ?? 0) + (item.maxMpBase ?? 0)
    bag.maxDamage = (bag.maxDamage ?? 0) + item.maxDamageBase

    if (!isFlameSlot(item.slotId)) {
      contributeLines(bag, item.mainLines)
    }
    if (item.potential) contributeLines(bag, item.potential.lines)
    if (item.bonusPotential) contributeLines(bag, item.bonusPotential.lines)

    if (item.emblem) {
      const baseBoost = item.emblem.baseOptionBoostPercent / 100
      bag.phyAtk = (bag.phyAtk ?? 0) + pieceAtk * baseBoost
      bag.phyDef = (bag.phyDef ?? 0) + item.phyDefBase * baseBoost
      bag.magDef = (bag.magDef ?? 0) + item.magDefBase * baseBoost
      contributeLines(bag, item.emblem.lines)
    }
    if (item.soul) contributeLines(bag, [item.soul.stat])
    if (item.highTierOption) contributeLines(bag, [item.highTierOption])
    if (item.sharenianAbility) contributeLines(bag, item.sharenianAbility)
  }

  const soulSet = resolveSoulSet(gear)
  if (soulSet.atkBonus > 0) {
    bag.phyAtk = (bag.phyAtk ?? 0) + soulSet.atkBonus
    bag.magAtk = (bag.magAtk ?? 0) + soulSet.atkBonus
  }

  const mainWeapon = gear.mainWeapon
  if (mainWeapon) {
    const skillBonus = weaponRankSkillBonus(
      mainWeapon.slotId,
      mainWeapon.rank,
    )
    if (skillBonus) {
      bag.critRate = (bag.critRate ?? 0) + skillBonus.critRate
    }
  }

  return bag
}

export function pickAtkBag(bag: GearStatBag): AtkStatBag {
  const out = {} as AtkStatBag
  for (const key of ATK_STAT_KEYS) {
    out[key] = bag[key] ?? 0
  }
  return out
}

export function pickStatsByKeys(
  bag: GearStatBag,
  keys: readonly PlayerStatKey[],
): GearStatBag {
  const out: GearStatBag = {}
  for (const key of keys) {
    const v = bag[key]
    if (v != null && v !== 0) out[key] = v
  }
  return out
}
