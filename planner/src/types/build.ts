export type BuildId = 'A' | 'B'

export type GearSlotId =
  | 'mainWeapon'
  | 'secondary'
  | 'pendant1'
  | 'pendant2'
  | 'ring1'
  | 'ring2'
  | 'ring3'
  | 'ring4'
  | 'earrings'
  | 'socket'
  | 'hat'
  | 'gloves'
  | 'outfitTop'
  | 'outfitBottom'
  | 'shoulder'
  | 'shoes'
  | 'belt'
  | 'cape'
  | 'face'
  | 'eye'
  | 'title'
  | 'badge'
  | 'medal'

export type ItemRank =
  | 'Normal'
  | 'Rare'
  | 'Epic'
  | 'Unique'
  | 'Legendary'
  | 'Mythic'
  | 'Ancient'
  | 'Root Abyss'
  | 'Necro'
  | 'Dreamy Belt'
  | 'Chaos'
  | 'Absolab'
  | 'Arcane'
  | 'Genesis'

/** Highest → lowest. */
export const ITEM_RANKS_ORDERED: ItemRank[] = [
  'Genesis',
  'Arcane',
  'Absolab',
  'Chaos',
  'Dreamy Belt',
  'Necro',
  'Root Abyss',
  'Ancient',
  'Mythic',
  'Legendary',
  'Unique',
  'Epic',
  'Rare',
  'Normal',
]

const HIGH_TIER_RANKS: ReadonlySet<ItemRank> = new Set([
  'Absolab',
  'Arcane',
  'Necro',
  'Genesis',
])

/** Necro / Absolab / Arcane / Genesis — weapon selectable main option. */
export const WEAPON_MAIN_OPTION_RANKS: ReadonlySet<ItemRank> = HIGH_TIER_RANKS

export function isWeaponMainOptionRank(rank: ItemRank): boolean {
  return WEAPON_MAIN_OPTION_RANKS.has(rank)
}

/** Slots that can equip Absolab / Arcane / Necro / Genesis. */
export const HIGH_TIER_SLOTS: ReadonlySet<GearSlotId> = new Set([
  'mainWeapon',
  'hat',
  'gloves',
  'outfitTop',
  'cape',
])

/** Second Weapon: capped ranks (Mythic … Rare). Labels: Mystic=Mythic, Magic=Epic. */
export const SECONDARY_RANKS: ItemRank[] = [
  'Mythic',
  'Legendary',
  'Unique',
  'Epic',
  'Rare',
]

/** Root Abyss available on these slots (pair-lock only for Outfit Top/Bottom). */
export const ROOT_ABYSS_SLOTS: ReadonlySet<GearSlotId> = new Set([
  'mainWeapon',
  'hat',
  'outfitTop',
  'outfitBottom',
])

/** Outfit Top + Bottom pair-lock when either is Root Abyss. */
export const OUTFIT_PAIR_SLOTS: ReadonlySet<GearSlotId> = new Set([
  'outfitTop',
  'outfitBottom',
])

export function outfitPartnerSlot(slot: GearSlotId): GearSlotId | null {
  if (slot === 'outfitTop') return 'outfitBottom'
  if (slot === 'outfitBottom') return 'outfitTop'
  return null
}

export function ranksForSlot(
  slot: GearSlotId,
  options?: { rootAbyssLocked?: boolean },
): ItemRank[] {
  if (options?.rootAbyssLocked && OUTFIT_PAIR_SLOTS.has(slot)) {
    return ['Root Abyss']
  }

  if (slot === 'secondary') {
    return [...SECONDARY_RANKS]
  }

  let ranks = HIGH_TIER_SLOTS.has(slot)
    ? [...ITEM_RANKS_ORDERED]
    : ITEM_RANKS_ORDERED.filter((r) => !HIGH_TIER_RANKS.has(r))

  if (!ROOT_ABYSS_SLOTS.has(slot)) {
    ranks = ranks.filter((r) => r !== 'Root Abyss')
  }

  if (slot !== 'belt') {
    ranks = ranks.filter((r) => r !== 'Dreamy Belt')
  }

  return ranks
}

/** Cube Potential rank — Weapon/Secondary currently Rare→Legendary (Nexon 6438). */
export type PotentialGrade = 'Rare' | 'Epic' | 'Unique' | 'Legendary'

/** Rebirth Flame grade (Rare → Mythic). */
export type FlameRank = 'Rare' | 'Epic' | 'Unique' | 'Legendary' | 'Mythic'

export interface StatLine {
  optionId: string
  label: string
  value: number
}

export interface PotentialBlock {
  grade: PotentialGrade
  lines: StatLine[]
}

export interface EmblemBlock {
  typeId: string
  name: string
  level: number
  /** e.g. Ruthless +30% base options */
  baseOptionBoostPercent: number
  lines: StatLine[]
}

export interface SoulBlock {
  soulId: string
  name: string
  stat: StatLine
  skillNote?: string
}

export interface GearItem {
  slotId: GearSlotId
  itemName: string
  /** Custom icon: https URL or data:image… (user upload). Empty = placeholder. */
  iconUrl: string
  rank: ItemRank
  level: number
  star: number
  atkBase: number
  atkBonus: number
  /** Rebirth Flame grade — drives Main Weapon flame option pool. */
  flameRank: FlameRank
  mainLines: StatLine[]
  /**
   * Selectable main option for Necro / Absolab / Arcane / Genesis weapons.
   * Value (%) is user-entered.
   */
  highTierOption: StatLine | null
  /**
   * Second Weapon Unique+ — Sharenian Ability (Final DMG + Boss ATK).
   * Two fixed lines; values (%) are user-entered.
   */
  sharenianAbility: StatLine[] | null
  potential: PotentialBlock
  bonusPotential: PotentialBlock
  emblem: EmblemBlock | null
  soul: SoulBlock | null
}

export interface SkillEntry {
  skillId: string
  name: string
  enabled: boolean
  skillPercent: number
  hitCount: number
  cooldownSec: number
  uptimePercent: number
}

/** Stats used by DPM/CP engine (percents as 0–1 ratios). */
export interface AggregatedStats {
  attack: number
  atkPercent: number
  dmgPercent: number
  bossAtkPercent: number
  critRate: number
  critDmgPercent: number
  finalPercent: number
  ignoreDefPercent: number
  /** Soft cap line; null/0 = no cap in damage line */
  maxDamage: number
}

export type EnemyMode = 'boss' | 'normal'

/** Shared Sage Rock–style target (same dummy for A/B compare). */
export interface EnemyTarget {
  mode: EnemyMode
  level: number
  /** 0 = use level table DR; >0 = absolute DamageReduction% */
  defOverridePercent: number
  critResPercent: number
}

export function defaultEnemyTarget(): EnemyTarget {
  return {
    mode: 'boss',
    level: 218,
    defOverridePercent: 0,
    critResPercent: 0,
  }
}

export type AtkStatKey =
  | 'phyAtk'
  | 'phyAtkPercent'
  | 'phyDmgPercent'
  | 'magAtk'
  | 'magAtkPercent'
  | 'magDmgPercent'
  | 'bossAtkPercent'
  | 'critAtk'
  | 'critRate'
  | 'critDmgPercent'
  | 'maxDamage'
  | 'finalPercent'
  | 'ignoreDefPercent'

export type DefStatKey =
  | 'phyDef'
  | 'phyDefPercent'
  | 'phyDmgReducePercent'
  | 'magDef'
  | 'magDefPercent'
  | 'magDmgReducePercent'
  | 'bossDefPercent'
  | 'critResPercent'
  | 'critDmgReducePercent'
  | 'statusResistPercent'
  | 'dmgIgnoreChancePercent'

export type ChanceStatKey =
  | 'acc'
  | 'accPercent'
  | 'evd'
  | 'evdPercent'
  | 'penRatePercent'
  | 'blockPercent'
  | 'survivalRatePercent'

export type ResourceStatKey =
  | 'maxHp'
  | 'maxHpPercent'
  | 'maxMp'
  | 'maxMpPercent'
  | 'hpRecovery'
  | 'mpRecovery'
  | 'buffItemDurationSec'

export type AcquireStatKey =
  | 'expGainPercent'
  | 'itemDropPercent'
  | 'mesoGainPercent'
  | 'partyExpPercent'
  | 'feverDurationSec'
  | 'feverChargePercent'
  | 'maxFeverChancePercent'

export type OtherStatKey = 'spdPercent' | 'jmpPercent' | 'kbkRes'

export type ExtraStatKey =
  | DefStatKey
  | ChanceStatKey
  | ResourceStatKey
  | AcquireStatKey
  | OtherStatKey

export type PlayerStatKey = AtkStatKey | ExtraStatKey

export type EditableStatSource = 'character' | 'skill' | 'growth' | 'content'
export type StatSource = EditableStatSource | 'equipment'

/** All ATK keys in UI order */
export const ATK_STAT_KEYS: AtkStatKey[] = [
  'phyAtk',
  'phyAtkPercent',
  'phyDmgPercent',
  'magAtk',
  'magAtkPercent',
  'magDmgPercent',
  'bossAtkPercent',
  'critAtk',
  'critRate',
  'critDmgPercent',
  'maxDamage',
  'finalPercent',
  'ignoreDefPercent',
]

export const DEF_STAT_KEYS: DefStatKey[] = [
  'phyDef',
  'phyDefPercent',
  'phyDmgReducePercent',
  'magDef',
  'magDefPercent',
  'magDmgReducePercent',
  'bossDefPercent',
  'critResPercent',
  'critDmgReducePercent',
  'statusResistPercent',
  'dmgIgnoreChancePercent',
]

export const CHANCE_STAT_KEYS: ChanceStatKey[] = [
  'acc',
  'accPercent',
  'evd',
  'evdPercent',
  'penRatePercent',
  'blockPercent',
  'survivalRatePercent',
]

export const RESOURCE_STAT_KEYS: ResourceStatKey[] = [
  'maxHp',
  'maxHpPercent',
  'maxMp',
  'maxMpPercent',
  'hpRecovery',
  'mpRecovery',
  'buffItemDurationSec',
]

export const ACQUIRE_STAT_KEYS: AcquireStatKey[] = [
  'expGainPercent',
  'itemDropPercent',
  'mesoGainPercent',
  'partyExpPercent',
  'feverDurationSec',
  'feverChargePercent',
  'maxFeverChancePercent',
]

export const OTHER_STAT_KEYS: OtherStatKey[] = [
  'spdPercent',
  'jmpPercent',
  'kbkRes',
]

export const ATK_STAT_LABELS: Record<AtkStatKey, string> = {
  phyAtk: 'PHY ATK',
  phyAtkPercent: 'PHY ATK (%)',
  phyDmgPercent: 'PHY DMG (%)',
  magAtk: 'MAG ATK',
  magAtkPercent: 'MAG ATK (%)',
  magDmgPercent: 'MAG DMG (%)',
  bossAtkPercent: 'Boss ATK (%)',
  critAtk: 'Crit ATK',
  critRate: 'อัตรา Crit (%)',
  critDmgPercent: 'Crit DMG (%)',
  maxDamage: 'DMG สูงสุด',
  finalPercent: 'DMG สุดท้าย (%)',
  ignoreDefPercent: 'อัตราไม่สน DEF (%)',
}

export const DEF_STAT_LABELS: Record<DefStatKey, string> = {
  phyDef: 'PHY DEF',
  phyDefPercent: 'PHY DEF (%)',
  phyDmgReducePercent: 'การลด PHY DMG (%)',
  magDef: 'MAG DEF',
  magDefPercent: 'MAG DEF (%)',
  magDmgReducePercent: 'การลด MAG DMG (%)',
  bossDefPercent: 'Boss DEF (%)',
  critResPercent: 'Crit RES (%)',
  critDmgReducePercent: 'การลด Crit DMG (%)',
  statusResistPercent: 'ต้านทานสถานะผิดปกติ (%)',
  dmgIgnoreChancePercent: 'โอกาสเพิกเฉย DMG (%)',
}

export const CHANCE_STAT_LABELS: Record<ChanceStatKey, string> = {
  acc: 'ACC',
  accPercent: 'ACC (%)',
  evd: 'EVD',
  evdPercent: 'EVD (%)',
  penRatePercent: 'อัตรา PEN (%)',
  blockPercent: 'Block (%)',
  survivalRatePercent: 'อัตราการอยู่รอด (%)',
}

export const RESOURCE_STAT_LABELS: Record<ResourceStatKey, string> = {
  maxHp: 'HP สูงสุด',
  maxHpPercent: 'HP สูงสุด (%)',
  maxMp: 'MP สูงสุด',
  maxMpPercent: 'MP สูงสุด (%)',
  hpRecovery: 'ฟื้นฟู HP',
  mpRecovery: 'ฟื้นฟู MP',
  buffItemDurationSec: 'ระยะเวลาไอเทมบัฟ (วิ)',
}

export const ACQUIRE_STAT_LABELS: Record<AcquireStatKey, string> = {
  expGainPercent: 'EXP ที่ได้รับ (%)',
  itemDropPercent: 'อัตราดรอปไอเทม (%)',
  mesoGainPercent: 'Meso ที่ได้รับ (%)',
  partyExpPercent: 'EXP ปาร์ตี้ที่ได้รับ (%)',
  feverDurationSec: 'ระยะเวลา Fever Buff (วิ)',
  feverChargePercent: 'ชาร์จ Fever Buff (%)',
  maxFeverChancePercent: 'โอกาส Max Fever (%)',
}

export const OTHER_STAT_LABELS: Record<OtherStatKey, string> = {
  spdPercent: 'SPD (%)',
  jmpPercent: 'JMP (%)',
  kbkRes: 'KBK RES',
}

export const PLAYER_STAT_LABELS: Record<PlayerStatKey, string> = {
  ...ATK_STAT_LABELS,
  ...DEF_STAT_LABELS,
  ...CHANCE_STAT_LABELS,
  ...RESOURCE_STAT_LABELS,
  ...ACQUIRE_STAT_LABELS,
  ...OTHER_STAT_LABELS,
}

/** Percent fields stored as percentage points (74.3 = 74.3%). Flats are absolute. */
export const ATK_PERCENT_KEYS = new Set<AtkStatKey>([
  'phyAtkPercent',
  'phyDmgPercent',
  'magAtkPercent',
  'magDmgPercent',
  'bossAtkPercent',
  'critRate',
  'critDmgPercent',
  'finalPercent',
  'ignoreDefPercent',
])

export const PLAYER_PERCENT_KEYS = new Set<PlayerStatKey>([
  ...ATK_PERCENT_KEYS,
  'phyDefPercent',
  'phyDmgReducePercent',
  'magDefPercent',
  'magDmgReducePercent',
  'bossDefPercent',
  'critResPercent',
  'critDmgReducePercent',
  'statusResistPercent',
  'dmgIgnoreChancePercent',
  'accPercent',
  'evdPercent',
  'penRatePercent',
  'blockPercent',
  'survivalRatePercent',
  'maxHpPercent',
  'maxMpPercent',
  'expGainPercent',
  'itemDropPercent',
  'mesoGainPercent',
  'partyExpPercent',
  'feverChargePercent',
  'maxFeverChancePercent',
  'spdPercent',
  'jmpPercent',
])

export type AtkStatBag = Record<AtkStatKey, number>

/** Player-entered sources (not equipment). */
export type StatSources = Partial<
  Record<PlayerStatKey, Partial<Record<EditableStatSource, number>>>
>

export interface Build {
  id: BuildId
  name: string
  jobId: string
  /** Used for YourDR lookup vs enemy DEF table */
  characterLevel: number
  skills: SkillEntry[]
  gear: Partial<Record<GearSlotId, GearItem | null>>
  /** Character / skill / growth / content — additive with gear */
  statSources: StatSources
  /**
   * Deprecated storage mirror — Flame scale bases are derived from
   * ทรัพยากร (HP/MP) + การได้รับ (EXP) at resolve time.
   */
  flameBases: FlameBases
  /** @deprecated migrated into statSources.character */
  statOverrides?: Partial<AggregatedStats>
}

/** Player stats used only as Flame scale inputs (not full HP model). */
export interface FlameBases {
  maxHp: number
  maxMp: number
  expPercent: number
}

export function defaultFlameBases(): FlameBases {
  return {
    maxHp: 0,
    maxMp: 0,
    expPercent: 0,
  }
}

export interface PlannerState {
  activeBuild: BuildId
  builds: Record<BuildId, Build>
  enemyTarget: EnemyTarget
}

export const SLOT_LABELS: Record<GearSlotId, string> = {
  mainWeapon: 'Main Weapon',
  secondary: 'Second Weapon',
  pendant1: 'Pendant 1',
  pendant2: 'Pendant 2',
  ring1: 'Ring 1',
  ring2: 'Ring 2',
  ring3: 'Ring 3',
  ring4: 'Ring 4',
  earrings: 'Earring',
  socket: 'Socket',
  hat: 'Helmet',
  gloves: 'Gloves',
  outfitTop: 'Outfit (Top)',
  outfitBottom: 'Outfit (Bottom)',
  shoulder: 'Shoulder',
  shoes: 'Shoes',
  belt: 'Belt',
  cape: 'Cape',
  face: 'Face Acc',
  eye: 'Eye Acc',
  title: 'Book / ฉายา',
  badge: 'Badge',
  medal: 'เหรียญตรา',
}

/** Left column pairs (row-major order 1–10). */
export const DOLL_LEFT: GearSlotId[][] = [
  ['mainWeapon', 'secondary'],
  ['pendant1', 'pendant2'],
  ['ring1', 'ring2'],
  ['ring3', 'ring4'],
  ['earrings', 'socket'],
]

/** Right column pairs (row-major order 1–10). */
export const DOLL_RIGHT: GearSlotId[][] = [
  ['hat', 'gloves'],
  ['outfitTop', 'outfitBottom'],
  ['shoulder', 'shoes'],
  ['belt', 'cape'],
  ['face', 'eye'],
]

/** Under character, left → right */
export const DOLL_BOTTOM: GearSlotId[] = ['title', 'badge', 'medal']

export const ALL_GEAR_SLOTS: GearSlotId[] = [
  ...DOLL_LEFT.flat(),
  ...DOLL_RIGHT.flat(),
  ...DOLL_BOTTOM,
]
