import type { AtkStatBag, PlayerStatKey, StatLine } from '../types/build'
import type { GearStatBag } from './gearStatMap'

/** Inputs used for Rebirth Flame “scales with” conversion (percentage points for %). */
export interface FlameScaleBases {
  maxHp: number
  maxMp: number
  expPercent: number
  bossAtkPercent: number
  critRate: number
  critDmgPercent: number
}

function emptyBag(): GearStatBag {
  return {
    phyAtk: 0,
    phyAtkPercent: 0,
    phyDmgPercent: 0,
    magAtk: 0,
    magAtkPercent: 0,
    magDmgPercent: 0,
    bossAtkPercent: 0,
    critAtk: 0,
    critRate: 0,
    critDmgPercent: 0,
    maxDamage: 0,
    finalPercent: 0,
    ignoreDefPercent: 0,
  }
}

function add(bag: GearStatBag, key: PlayerStatKey, value: number): void {
  bag[key] = (bag[key] ?? 0) + value
}

/**
 * [Percent] scales with [Percent]
 * e.g. Crit DMG × EXP 100%, EXP 9.7% → Crit DMG 9.7%
 */
export function scalePercentWithPercent(
  basePercent: number,
  coefPercent: number,
): number {
  return basePercent * (coefPercent / 100)
}

/**
 * [Fixed] scales with [Fixed]
 * e.g. MAG ATK × Max MP 19.7%, MP 1115 → floor(219.655) = 219
 */
export function scaleFixedWithFixed(
  baseFlat: number,
  coefPercent: number,
): number {
  return Math.floor(baseFlat * (coefPercent / 100))
}

/**
 * Flat result scales with a percentage base (Nexon “Adjustments”: ×10).
 * e.g. PHY DMG × Crit Rate 500%, Crit Rate 5.5% → 55 × 500% = 275
 */
export function scaleFixedWithPercent(
  basePercent: number,
  coefPercent: number,
): number {
  return Math.floor(basePercent * 10 * (coefPercent / 100))
}

/** @deprecated use scalePercentWithPercent / scaleFixedWithFixed / scaleFixedWithPercent */
export function scaleBonus(base: number, flameValuePercent: number): number {
  return scalePercentWithPercent(base, flameValuePercent)
}

/**
 * Convert flame option lines into a GearStatBag (ATK, DEF, ignoreDef, etc.)
 * using non-flame base stats. Flat Final DMG is added as percentage points
 * directly.
 *
 * Nexon proportional rules (Forge guide thread 2008238):
 * - Percent × Percent → percent result, no adjust
 * - Fixed × Fixed → flat result, floor
 * - Flat × Percent base → adjust base×10, then floor
 */
export function applyFlameScales(
  bases: FlameScaleBases,
  lines: StatLine[],
): GearStatBag {
  const bag = emptyBag()

  for (const line of lines) {
    const id = line.optionId
    if (!id) continue
    const v = line.value

    switch (id) {
      // Fixed × Fixed → flat ATK
      case 'phyAtkMaxHp':
        add(bag, 'phyAtk', scaleFixedWithFixed(bases.maxHp, v))
        break
      case 'magAtkMaxHp':
        add(bag, 'magAtk', scaleFixedWithFixed(bases.maxHp, v))
        break
      case 'phyAtkMaxMp':
        add(bag, 'phyAtk', scaleFixedWithFixed(bases.maxMp, v))
        break
      case 'magAtkMaxMp':
        add(bag, 'magAtk', scaleFixedWithFixed(bases.maxMp, v))
        break

      // Fixed × Fixed → flat DEF
      case 'phyDefMaxHp':
        add(bag, 'phyDef', scaleFixedWithFixed(bases.maxHp, v))
        break
      case 'magDefMaxHp':
        add(bag, 'magDef', scaleFixedWithFixed(bases.maxHp, v))
        break
      case 'phyDefMaxMp':
        add(bag, 'phyDef', scaleFixedWithFixed(bases.maxMp, v))
        break
      case 'magDefMaxMp':
        add(bag, 'magDef', scaleFixedWithFixed(bases.maxMp, v))
        break

      // Percent × Percent → ATK%
      case 'phyAtkExp':
        add(bag, 'phyAtkPercent', scalePercentWithPercent(bases.expPercent, v))
        break
      case 'magAtkExp':
        add(bag, 'magAtkPercent', scalePercentWithPercent(bases.expPercent, v))
        break
      case 'phyAtkBossAtk':
      case 'PHY ATK ตาม Boss ATK':
        add(
          bag,
          'phyAtkPercent',
          scalePercentWithPercent(bases.bossAtkPercent, v),
        )
        break
      case 'magAtkBossAtk':
        add(
          bag,
          'magAtkPercent',
          scalePercentWithPercent(bases.bossAtkPercent, v),
        )
        break
      case 'phyAtkCritRate':
        add(bag, 'phyAtkPercent', scalePercentWithPercent(bases.critRate, v))
        break
      case 'magAtkCritRate':
        add(bag, 'magAtkPercent', scalePercentWithPercent(bases.critRate, v))
        break
      case 'phyAtkCritDmg':
        add(
          bag,
          'phyAtkPercent',
          scalePercentWithPercent(bases.critDmgPercent, v),
        )
        break
      case 'magAtkCritDmg':
        add(
          bag,
          'magAtkPercent',
          scalePercentWithPercent(bases.critDmgPercent, v),
        )
        break

      // Percent × Percent → DEF%
      case 'phyDefExp':
        add(
          bag,
          'phyDefPercent',
          scalePercentWithPercent(bases.expPercent, v),
        )
        break
      case 'magDefExp':
        add(
          bag,
          'magDefPercent',
          scalePercentWithPercent(bases.expPercent, v),
        )
        break
      case 'phyDefBossAtk':
        add(
          bag,
          'phyDefPercent',
          scalePercentWithPercent(bases.bossAtkPercent, v),
        )
        break
      case 'magDefBossAtk':
        add(
          bag,
          'magDefPercent',
          scalePercentWithPercent(bases.bossAtkPercent, v),
        )
        break
      case 'phyDefCritRate':
        add(
          bag,
          'phyDefPercent',
          scalePercentWithPercent(bases.critRate, v),
        )
        break
      case 'magDefCritRate':
        add(
          bag,
          'magDefPercent',
          scalePercentWithPercent(bases.critRate, v),
        )
        break
      case 'phyDefCritDmg':
        add(
          bag,
          'phyDefPercent',
          scalePercentWithPercent(bases.critDmgPercent, v),
        )
        break
      case 'magDefCritDmg':
        add(
          bag,
          'magDefPercent',
          scalePercentWithPercent(bases.critDmgPercent, v),
        )
        break

      // Percent × Percent → Crit DMG%
      case 'critDmgExp':
        add(bag, 'critDmgPercent', scalePercentWithPercent(bases.expPercent, v))
        break
      case 'critDmgBossAtk':
        add(
          bag,
          'critDmgPercent',
          scalePercentWithPercent(bases.bossAtkPercent, v),
        )
        break
      case 'critDmgCritRate':
        add(bag, 'critDmgPercent', scalePercentWithPercent(bases.critRate, v))
        break

      case 'finalDmg':
      case 'Final DMG Increase':
        add(bag, 'finalPercent', v)
        break

      case 'ignoreDef':
        add(bag, 'ignoreDefPercent', v)
        break
      default:
        break
    }
  }

  return bag
}

export function mergeAtkBag(into: AtkStatBag, addend: AtkStatBag): AtkStatBag {
  const out = { ...into }
  for (const key of Object.keys(addend) as (keyof AtkStatBag)[]) {
    out[key] += addend[key]
  }
  return out
}
