import type { GearSlotId, SoulBlock, StatLine } from '../types/build'

/** Bosses ordered highest → lowest (UI pick order). */
export type SoulBossId =
  | 'will'
  | 'lucid'
  | 'damien'
  | 'lotus'
  | 'arkarium'
  | 'magnus'
  | 'vellum'
  | 'crimsonQueen'
  | 'hilla'
  | 'pierre'
  | 'vonBon'
  | 'vonLeon'
  | 'cygnus'
  | 'pinkBean'
  | 'zakum'

/** Fixed soul types + Magnificent option keys. */
export type SoulOptionId =
  | 'beefy'
  | 'swift'
  | 'clever'
  | 'fortuitous'
  | 'flashy'
  | 'potent'
  | 'radiant'
  | 'hearty'
  | 'magnificent_maxHpPercent'
  | 'magnificent_phyDmgPercent'
  | 'magnificent_magDmgPercent'
  | 'magnificent_bossAtkPercent'
  | 'magnificent_critRate'
  | 'magnificent_critDmgPercent'
  | 'magnificent_finalPercent'
  | 'magnificent_maxDamage'
  | 'magnificent_expGainPercent'
  | 'magnificent_feverDurationSec'
  | 'magnificent_itemDropPercent'
  | 'magnificent_phyAtkPercent'
  | 'magnificent_magAtkPercent'

export interface SoulBossDef {
  id: SoulBossId
  name: string
  /** Icon URL from Nexon Soul guide. */
  icon: string
  skillNormal: string
  skillMagnificent: string
}

export interface SoulOptionDef {
  id: SoulOptionId
  /** Display name e.g. "Potent" / "Magnificent · Boss ATK %" */
  label: string
  typeLabel: string
  optionId: string
  valueLabel: string
  /** Value per boss; null = unavailable for that boss. */
  valuesByBoss: Record<SoulBossId, number | null>
  magnificent?: boolean
}

/** Percent ladder — Weapon fixed % / Magnificent % (patch 2024.09). */
const PCT: Record<SoulBossId, number> = {
  will: 23,
  lucid: 22,
  damien: 21,
  lotus: 20,
  arkarium: 19,
  magnus: 18,
  vellum: 17,
  crimsonQueen: 15.5,
  hilla: 15,
  pierre: 15,
  vonBon: 15,
  vonLeon: 13,
  cygnus: 10,
  pinkBean: 7,
  zakum: 5,
}

/** Hearty / Magnificent Max HP % ladder. */
const HP_PCT: Record<SoulBossId, number> = {
  will: 16,
  lucid: 15,
  damien: 14,
  lotus: 13,
  arkarium: 13,
  magnus: 12,
  vellum: 11,
  crimsonQueen: 10.5,
  hilla: 10,
  pierre: 10,
  vonBon: 10,
  vonLeon: 8,
  cygnus: 6,
  pinkBean: 4,
  zakum: 3,
}

/** Fortuitous / Flashy flat recovery. */
const RECOVERY: Record<SoulBossId, number> = {
  will: 230,
  lucid: 220,
  damien: 210,
  lotus: 200,
  arkarium: 190,
  magnus: 180,
  vellum: 170,
  crimsonQueen: 155,
  hilla: 150,
  pierre: 150,
  vonBon: 150,
  vonLeon: 130,
  cygnus: 100,
  pinkBean: 70,
  zakum: 50,
}

/** Magnificent Max DMG Cap — unavailable for Zakum / Pink Bean / Cygnus. */
const MAX_DMG: Record<SoulBossId, number | null> = {
  will: 4_700_000,
  lucid: 4_200_000,
  damien: 3_700_000,
  lotus: 3_200_000,
  arkarium: 2_800_000,
  magnus: 2_400_000,
  vellum: 2_000_000,
  crimsonQueen: 1_600_000,
  hilla: 1_600_000,
  pierre: 1_600_000,
  vonBon: 1_600_000,
  vonLeon: 1_400_000,
  cygnus: null,
  pinkBean: null,
  zakum: null,
}

/**
 * Secondary / Belt / Shoulder / Cape ladders — columns Zakum → Will (2024.09 chart).
 */
const BOSS_ORDER_LOW_TO_HIGH: SoulBossId[] = [
  'zakum',
  'pinkBean',
  'cygnus',
  'vonLeon',
  'vonBon',
  'pierre',
  'hilla',
  'crimsonQueen',
  'vellum',
  'magnus',
  'arkarium',
  'lotus',
  'damien',
  'lucid',
  'will',
]

function ladder(values: number[]): Record<SoulBossId, number> {
  const out = {} as Record<SoulBossId, number>
  BOSS_ORDER_LOW_TO_HIGH.forEach((id, i) => {
    out[id] = values[i]!
  })
  return out
}

function ladderNullable(
  values: Array<number | null>,
): Record<SoulBossId, number | null> {
  const out = {} as Record<SoulBossId, number | null>
  BOSS_ORDER_LOW_TO_HIGH.forEach((id, i) => {
    out[id] = values[i]!
  })
  return out
}

/** Beefy / Swift — EXP % */
const SEC_EXP = ladder([
  1.4, 1.8, 2.4, 2.8, 3.2, 3.2, 3.2, 3.4, 3.7, 4, 5, 6, 7, 7.5, 8,
])

/** Clever / Fortuitous — Crit DMG % */
const SEC_CRIT_DMG = ladder([
  1.3, 1.7, 2.2, 2.4, 2.8, 2.8, 2.8, 3, 3.3, 3.5, 3.8, 4, 5, 5.5, 6,
])

/** Flashy / Potent — Item Drop % */
const SEC_DROP = ladder([
  1, 1.4, 2, 2.5, 3, 3, 3, 3.2, 3.5, 3.8, 4, 4.2, 4.4, 4.6, 4.8,
])

/** Radiant / Hearty — Boss ATK % */
const SEC_BOSS = ladder([
  1.2, 1.5, 2, 2.4, 2.8, 2.8, 2.8, 3, 3.3, 3.5, 3.8, 4, 5, 5.5, 6,
])

/** Magnificent EXP % */
const SEC_MAG_EXP = ladder([
  1.9, 2.5, 3.2, 3.7, 4.2, 4.2, 4.2, 4.4, 4.7, 5, 5.5, 6, 7, 7.5, 8,
])

/** Magnificent Fever Buff DUR (sec) */
const SEC_MAG_FEVER = ladder([
  0.5, 0.9, 1.3, 2.2, 3, 3, 3, 3.2, 3.5, 3.8, 4, 4.2, 4.4, 4.6, 4.8,
])

/** Magnificent Item Drop % */
const SEC_MAG_DROP = ladder([
  1.3, 1.9, 2.4, 3, 3.8, 3.8, 3.8, 4, 4.3, 4.5, 4.8, 5, 5.2, 5.4, 5.6,
])

/** Magnificent PHY / MAG ATK % */
const SEC_MAG_ATK = ladder([
  1.6, 2.1, 2.8, 3.3, 3.8, 3.8, 3.8, 4, 4.3, 4.5, 4.8, 5, 5.2, 5.4, 5.6,
])

/** Magnificent Final DMG % */
const SEC_MAG_FINAL = ladder([
  1.5, 2.1, 3, 3.8, 4.5, 4.5, 4.5, 4.5, 5, 5.3, 5.5, 6, 6.2, 6.4, 6.6,
])

/** Magnificent Max DMG Cap — Zakum / Pink Bean / Cygnus unavailable. */
const SEC_MAG_MAX_DMG = ladderNullable([
  null,
  null,
  null,
  120_000,
  180_000,
  180_000,
  180_000,
  180_000,
  420_000,
  706_000,
  810_000,
  960_000,
  1_092_000,
  1_221_000,
  1_348_000,
])

function mapAll(rec: Record<SoulBossId, number>): Record<SoulBossId, number | null> {
  return { ...rec }
}

function mapNullable(
  rec: Record<SoulBossId, number | null>,
): Record<SoulBossId, number | null> {
  return { ...rec }
}

/** Icon CDN — Nexon guide board 2697 / thread 2008177. */
const ICON = {
  will: 'https://dszw1qtcnsa5e.cloudfront.net/community/20251217/e98f6c40-a408-4bcf-9193-c6a998ff2277/image2025121720543349.png',
  lucid:
    'https://dszw1qtcnsa5e.cloudfront.net/community/20251217/645afd98-64f0-4bf4-8fe8-3b6593236f87/image2025121720543348.png',
  damien:
    'https://dszw1qtcnsa5e.cloudfront.net/community/20251217/15a5f8ee-1274-49ca-bf29-65bc9c0a3416/image2025121720543347.png',
  lotus:
    'https://dszw1qtcnsa5e.cloudfront.net/community/20251217/58c0e48d-733b-4ca3-a7d5-5028b51e7d33/image2025121720543346.png',
  arkarium:
    'https://dszw1qtcnsa5e.cloudfront.net/community/20251217/b4958e76-4152-4e86-9c6d-ef21fad6911b/image2025121720543345.png',
  magnus:
    'https://dszw1qtcnsa5e.cloudfront.net/community/20251217/89f6073f-52c1-4c0c-9d22-8186f44fee5b/image2025121720543344.png',
  vellum:
    'https://dszw1qtcnsa5e.cloudfront.net/community/20251217/20c2df43-93c4-4317-99cc-175d24f69c41/image2025121720543341.png',
  crimsonQueen:
    'https://dszw1qtcnsa5e.cloudfront.net/community/20251217/cbe96e34-4b23-41e1-8549-59aa1587ae30/image2025121720543340.png',
  hilla:
    'https://dszw1qtcnsa5e.cloudfront.net/community/20251217/5950e134-4301-47e7-9622-2719bb1815c9/image2025121720543343.png',
  pierre:
    'https://dszw1qtcnsa5e.cloudfront.net/community/20251217/5cae5b02-a5de-4a84-93af-145cb2ff0040/image2025121720543339.png',
  vonBon:
    'https://dszw1qtcnsa5e.cloudfront.net/community/20251217/9b83867a-ee3f-430d-9cce-2329c851cbdc/image2025121720543338.png',
  vonLeon:
    'https://dszw1qtcnsa5e.cloudfront.net/community/20251217/9c267643-75ba-47ae-9763-e183d1bbf433/image2025121720543342.png',
  cygnus:
    'https://dszw1qtcnsa5e.cloudfront.net/community/20251217/c5b14154-bf84-4988-ae17-8f3ab01e632b/image2025121720543337.png',
  pinkBean:
    'https://dszw1qtcnsa5e.cloudfront.net/community/20251217/34dac4bc-f5d6-4b53-8dcb-1183201fbdaf/image2025121720543336.png',
  zakum:
    'https://dszw1qtcnsa5e.cloudfront.net/community/20251217/b317f2e6-12b2-433f-9ec9-b381549b3ef3/image2025121720543335.png',
} as const

/** Soul bosses — highest tier first. */
export const SOUL_BOSSES: SoulBossDef[] = [
  {
    id: 'will',
    name: 'Will',
    icon: ICON.will,
    skillNormal: 'Crushing Lunge',
    skillMagnificent: 'King of Spiders',
  },
  {
    id: 'lucid',
    name: 'Lucid',
    icon: ICON.lucid,
    skillNormal: 'Nightmare Invite',
    skillMagnificent: 'Master of Nightmares',
  },
  {
    id: 'damien',
    name: 'Damien',
    icon: ICON.damien,
    skillNormal: 'Dark Hunt',
    skillMagnificent: 'Sword of Destruction',
  },
  {
    id: 'lotus',
    name: 'Lotus',
    icon: ICON.lotus,
    skillNormal: 'Lotus Strike',
    skillMagnificent: 'Lotus Enraged',
  },
  {
    id: 'arkarium',
    name: 'Arkarium',
    icon: ICON.arkarium,
    skillNormal: 'Snake Bite',
    skillMagnificent: 'Snake Eye',
  },
  {
    id: 'magnus',
    name: 'Magnus',
    icon: ICON.magnus,
    skillNormal: 'Advance of Magnus',
    skillMagnificent: 'Wrath of Magnus',
  },
  {
    id: 'vellum',
    name: 'Vellum',
    icon: ICON.vellum,
    skillNormal: "Vellum's Giga-Laser",
    skillMagnificent: 'Jr. Vellum',
  },
  {
    id: 'crimsonQueen',
    name: 'Crimson Queen',
    icon: ICON.crimsonQueen,
    skillNormal: 'Fickle Queen',
    skillMagnificent: 'Long Live the Queen',
  },
  {
    id: 'hilla',
    name: 'Hilla',
    icon: ICON.hilla,
    skillNormal: "Hilla's Fury",
    skillMagnificent: "Hilla's Thunder",
  },
  {
    id: 'pierre',
    name: 'Pierre',
    icon: ICON.pierre,
    skillNormal: "Pierre's Hat Trick",
    skillMagnificent: "Pierre's Surprise",
  },
  {
    id: 'vonBon',
    name: 'Von Bon',
    icon: ICON.vonBon,
    skillNormal: 'Buffalo Chicken Kick',
    skillMagnificent: 'Flying Chicken',
  },
  {
    id: 'vonLeon',
    name: 'Von Leon',
    icon: ICON.vonLeon,
    skillNormal: 'Cat Smack',
    skillMagnificent: 'Kitty Claws',
  },
  {
    id: 'cygnus',
    name: 'Cygnus',
    icon: ICON.cygnus,
    skillNormal: 'Flame Empress',
    skillMagnificent: 'Storm Empress',
  },
  {
    id: 'pinkBean',
    name: 'Pink Bean',
    icon: ICON.pinkBean,
    skillNormal: 'Feisty Cutie',
    skillMagnificent: 'Fatal Cutie',
  },
  {
    id: 'zakum',
    name: 'Zakum',
    icon: ICON.zakum,
    skillNormal: 'Hot Totem Drop',
    skillMagnificent: 'Burning Totem Drop',
  },
]

/** Weapon soul options — values from patch 2024.09 Soul chart. */
export const SOUL_WEAPON_OPTIONS: SoulOptionDef[] = [
  {
    id: 'beefy',
    label: 'Beefy',
    typeLabel: 'Beefy',
    optionId: 'phyDefPercent',
    valueLabel: 'PHY DEF %',
    valuesByBoss: mapAll(PCT),
  },
  {
    id: 'swift',
    label: 'Swift',
    typeLabel: 'Swift',
    optionId: 'evdPercent',
    valueLabel: 'EVD %',
    valuesByBoss: mapAll(PCT),
  },
  {
    id: 'clever',
    label: 'Clever',
    typeLabel: 'Clever',
    optionId: 'magDefPercent',
    valueLabel: 'MAG DEF %',
    valuesByBoss: mapAll(PCT),
  },
  {
    id: 'fortuitous',
    label: 'Fortuitous',
    typeLabel: 'Fortuitous',
    optionId: 'hpRecovery',
    valueLabel: 'HP Recovery',
    valuesByBoss: mapAll(RECOVERY),
  },
  {
    id: 'flashy',
    label: 'Flashy',
    typeLabel: 'Flashy',
    optionId: 'mpRecovery',
    valueLabel: 'MP Recovery',
    valuesByBoss: mapAll(RECOVERY),
  },
  {
    id: 'potent',
    label: 'Potent',
    typeLabel: 'Potent',
    optionId: 'phyAtkPercent',
    valueLabel: 'PHY ATK %',
    valuesByBoss: mapAll(PCT),
  },
  {
    id: 'radiant',
    label: 'Radiant',
    typeLabel: 'Radiant',
    optionId: 'magAtkPercent',
    valueLabel: 'MAG ATK %',
    valuesByBoss: mapAll(PCT),
  },
  {
    id: 'hearty',
    label: 'Hearty',
    typeLabel: 'Hearty',
    optionId: 'maxHpPercent',
    valueLabel: 'Max HP %',
    valuesByBoss: mapAll(HP_PCT),
  },
  {
    id: 'magnificent_maxHpPercent',
    label: 'Magnificent · Max HP %',
    typeLabel: 'Magnificent',
    optionId: 'maxHpPercent',
    valueLabel: 'Max HP %',
    valuesByBoss: mapAll(HP_PCT),
    magnificent: true,
  },
  {
    id: 'magnificent_phyDmgPercent',
    label: 'Magnificent · PHY DMG %',
    typeLabel: 'Magnificent',
    optionId: 'phyDmgPercent',
    valueLabel: 'PHY DMG %',
    valuesByBoss: mapAll(PCT),
    magnificent: true,
  },
  {
    id: 'magnificent_magDmgPercent',
    label: 'Magnificent · MAG DMG %',
    typeLabel: 'Magnificent',
    optionId: 'magDmgPercent',
    valueLabel: 'MAG DMG %',
    valuesByBoss: mapAll(PCT),
    magnificent: true,
  },
  {
    id: 'magnificent_bossAtkPercent',
    label: 'Magnificent · Boss ATK %',
    typeLabel: 'Magnificent',
    optionId: 'bossAtkPercent',
    valueLabel: 'Boss ATK %',
    valuesByBoss: mapAll(PCT),
    magnificent: true,
  },
  {
    id: 'magnificent_critRate',
    label: 'Magnificent · Crit Rate %',
    typeLabel: 'Magnificent',
    optionId: 'critRate',
    valueLabel: 'Crit Rate %',
    valuesByBoss: mapAll(PCT),
    magnificent: true,
  },
  {
    id: 'magnificent_critDmgPercent',
    label: 'Magnificent · Crit DMG %',
    typeLabel: 'Magnificent',
    optionId: 'critDmgPercent',
    valueLabel: 'Crit DMG %',
    valuesByBoss: mapAll(PCT),
    magnificent: true,
  },
  {
    id: 'magnificent_finalPercent',
    label: 'Magnificent · Final DMG %',
    typeLabel: 'Magnificent',
    optionId: 'finalPercent',
    valueLabel: 'Final DMG %',
    valuesByBoss: mapAll(PCT),
    magnificent: true,
  },
  {
    id: 'magnificent_maxDamage',
    label: 'Magnificent · Max DMG Cap',
    typeLabel: 'Magnificent',
    optionId: 'maxDamage',
    valueLabel: 'Max DMG Cap',
    valuesByBoss: mapNullable(MAX_DMG),
    magnificent: true,
  },
]

/** Secondary Weapon (also Belt / Shoulder / Cape chart) — patch 2024.09. */
export const SOUL_SECONDARY_OPTIONS: SoulOptionDef[] = [
  {
    id: 'beefy',
    label: 'Beefy',
    typeLabel: 'Beefy',
    optionId: 'expGainPercent',
    valueLabel: 'EXP %',
    valuesByBoss: mapAll(SEC_EXP),
  },
  {
    id: 'swift',
    label: 'Swift',
    typeLabel: 'Swift',
    optionId: 'expGainPercent',
    valueLabel: 'EXP %',
    valuesByBoss: mapAll(SEC_EXP),
  },
  {
    id: 'clever',
    label: 'Clever',
    typeLabel: 'Clever',
    optionId: 'critDmgPercent',
    valueLabel: 'Crit DMG %',
    valuesByBoss: mapAll(SEC_CRIT_DMG),
  },
  {
    id: 'fortuitous',
    label: 'Fortuitous',
    typeLabel: 'Fortuitous',
    optionId: 'critDmgPercent',
    valueLabel: 'Crit DMG %',
    valuesByBoss: mapAll(SEC_CRIT_DMG),
  },
  {
    id: 'flashy',
    label: 'Flashy',
    typeLabel: 'Flashy',
    optionId: 'itemDropPercent',
    valueLabel: 'Item Drop %',
    valuesByBoss: mapAll(SEC_DROP),
  },
  {
    id: 'potent',
    label: 'Potent',
    typeLabel: 'Potent',
    optionId: 'itemDropPercent',
    valueLabel: 'Item Drop %',
    valuesByBoss: mapAll(SEC_DROP),
  },
  {
    id: 'radiant',
    label: 'Radiant',
    typeLabel: 'Radiant',
    optionId: 'bossAtkPercent',
    valueLabel: 'Boss ATK %',
    valuesByBoss: mapAll(SEC_BOSS),
  },
  {
    id: 'hearty',
    label: 'Hearty',
    typeLabel: 'Hearty',
    optionId: 'bossAtkPercent',
    valueLabel: 'Boss ATK %',
    valuesByBoss: mapAll(SEC_BOSS),
  },
  {
    id: 'magnificent_expGainPercent',
    label: 'Magnificent · EXP %',
    typeLabel: 'Magnificent',
    optionId: 'expGainPercent',
    valueLabel: 'EXP %',
    valuesByBoss: mapAll(SEC_MAG_EXP),
    magnificent: true,
  },
  {
    id: 'magnificent_feverDurationSec',
    label: 'Magnificent · Fever Buff DUR',
    typeLabel: 'Magnificent',
    optionId: 'feverDurationSec',
    valueLabel: 'Fever Buff DUR',
    valuesByBoss: mapAll(SEC_MAG_FEVER),
    magnificent: true,
  },
  {
    id: 'magnificent_itemDropPercent',
    label: 'Magnificent · Item Drop %',
    typeLabel: 'Magnificent',
    optionId: 'itemDropPercent',
    valueLabel: 'Item Drop %',
    valuesByBoss: mapAll(SEC_MAG_DROP),
    magnificent: true,
  },
  {
    id: 'magnificent_phyAtkPercent',
    label: 'Magnificent · PHY ATK %',
    typeLabel: 'Magnificent',
    optionId: 'phyAtkPercent',
    valueLabel: 'PHY ATK %',
    valuesByBoss: mapAll(SEC_MAG_ATK),
    magnificent: true,
  },
  {
    id: 'magnificent_magAtkPercent',
    label: 'Magnificent · MAG ATK %',
    typeLabel: 'Magnificent',
    optionId: 'magAtkPercent',
    valueLabel: 'MAG ATK %',
    valuesByBoss: mapAll(SEC_MAG_ATK),
    magnificent: true,
  },
  {
    id: 'magnificent_finalPercent',
    label: 'Magnificent · Final DMG %',
    typeLabel: 'Magnificent',
    optionId: 'finalPercent',
    valueLabel: 'Final DMG %',
    valuesByBoss: mapAll(SEC_MAG_FINAL),
    magnificent: true,
  },
  {
    id: 'magnificent_maxDamage',
    label: 'Magnificent · Max DMG Cap',
    typeLabel: 'Magnificent',
    optionId: 'maxDamage',
    valueLabel: 'Max DMG Cap',
    valuesByBoss: mapNullable(SEC_MAG_MAX_DMG),
    magnificent: true,
  },
]

const SOUL_SLOTS: ReadonlySet<GearSlotId> = new Set(['mainWeapon', 'secondary'])

export function isSoulSlot(slot: GearSlotId): boolean {
  return SOUL_SLOTS.has(slot)
}

export function soulOptionsForSlot(slot: GearSlotId): SoulOptionDef[] {
  if (slot === 'secondary') return SOUL_SECONDARY_OPTIONS
  if (slot === 'mainWeapon') return SOUL_WEAPON_OPTIONS
  return []
}

export function soulBossById(id: string): SoulBossDef | undefined {
  return SOUL_BOSSES.find((b) => b.id === id)
}

export function soulOptionById(
  id: string,
  slot: GearSlotId = 'mainWeapon',
): SoulOptionDef | undefined {
  return soulOptionsForSlot(slot).find((o) => o.id === id)
}

export function parseSoulId(
  soulId: string,
  slot: GearSlotId = 'mainWeapon',
): { bossId: SoulBossId; optionId: SoulOptionId } | null {
  const sep = soulId.indexOf(':')
  if (sep < 0) return null
  const bossId = soulId.slice(0, sep) as SoulBossId
  const optionId = soulId.slice(sep + 1) as SoulOptionId
  if (!soulBossById(bossId) || !soulOptionById(optionId, slot)) return null
  return { bossId, optionId }
}

export function soulOptionsForBoss(
  bossId: SoulBossId,
  slot: GearSlotId = 'mainWeapon',
): SoulOptionDef[] {
  return soulOptionsForSlot(slot).filter((o) => o.valuesByBoss[bossId] != null)
}

function formatSoulValue(option: SoulOptionDef, value: number): string {
  if (option.optionId === 'maxDamage') {
    return value.toLocaleString('en-US')
  }
  if (
    option.optionId === 'hpRecovery' ||
    option.optionId === 'mpRecovery'
  ) {
    return String(value)
  }
  if (option.optionId === 'feverDurationSec') {
    return `${value}s`
  }
  return `${value}%`
}

export function buildSoulBlock(
  bossId: SoulBossId,
  optionId: SoulOptionId,
  slot: GearSlotId = 'mainWeapon',
): SoulBlock | null {
  const boss = soulBossById(bossId)
  const option = soulOptionById(optionId, slot)
  if (!boss || !option) return null
  const value = option.valuesByBoss[bossId]
  if (value == null) return null

  const name = option.magnificent
    ? `Magnificent ${boss.name} Soul`
    : `${option.typeLabel} ${boss.name} Soul`

  const skillNote = option.magnificent
    ? boss.skillMagnificent
    : boss.skillNormal

  const stat: StatLine = {
    optionId: option.optionId,
    label: `${option.valueLabel} (${formatSoulValue(option, value)})`,
    value,
  }

  return {
    soulId: `${bossId}:${optionId}`,
    name,
    stat,
    skillNote,
  }
}

export function normalizeSoul(
  slot: GearSlotId,
  soul: SoulBlock | null | undefined,
): SoulBlock | null {
  if (!isSoulSlot(slot) || !soul) return null
  const parsed = parseSoulId(soul.soulId, slot)
  if (parsed) {
    return buildSoulBlock(parsed.bossId, parsed.optionId, slot) ?? soul
  }
  // Legacy soul ids from weapon catalog applied on secondary — remap if possible.
  if (slot === 'secondary') {
    const asWeapon = parseSoulId(soul.soulId, 'mainWeapon')
    if (asWeapon) {
      return buildSoulBlock(asWeapon.bossId, asWeapon.optionId, slot) ?? soul
    }
  }
  return soul
}
