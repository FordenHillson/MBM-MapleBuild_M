import type { GearSlotId, ItemRank } from '../types/build'

/** Necro / Absolab / Arcane / Genesis — Main Weapon rank skill Fair Trade. */
const WEAPON_RANK_SKILL_RANKS: ReadonlySet<ItemRank> = new Set([
  'Necro',
  'Absolab',
  'Arcane',
  'Genesis',
])

export interface WeaponRankSkillDef {
  id: string
  name: string
  effectLabel: string
  note: string
  iconUrl: string
  critRateBonus: number
}

export const WEAPON_RANK_SKILL: WeaponRankSkillDef = {
  id: 'fairTrade',
  name: 'Fair Trade',
  effectLabel: '[ เพิ่มคริเรท 100% ]',
  note: 'สกิลจะสามารถใช้ได้เมื่อสวมใส่อุปกรณ์',
  iconUrl: '/textures/weapon-skill/fair-trade.png',
  critRateBonus: 100,
}

export function supportsWeaponRankSkill(
  slot: GearSlotId,
  rank: ItemRank,
): boolean {
  return slot === 'mainWeapon' && WEAPON_RANK_SKILL_RANKS.has(rank)
}

export function weaponRankSkillBonus(
  slot: GearSlotId,
  rank: ItemRank,
): { critRate: number } | null {
  if (!supportsWeaponRankSkill(slot, rank)) return null
  return { critRate: WEAPON_RANK_SKILL.critRateBonus }
}
