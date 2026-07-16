import type { ItemRank } from '../types/build'

/** Where the rank frame texture is used in the UI. */
export type ItemRankTextureUse = 'summary' | 'table' | 'emblem'

const RANK_SLUG: Record<ItemRank, string> = {
  Normal: 'normal',
  Rare: 'rare',
  Epic: 'epic',
  Unique: 'unique',
  Legendary: 'legendary',
  Mythic: 'mythic',
  Ancient: 'ancient',
  'Root Abyss': 'root-abyss',
  Necro: 'necro',
  'Dreamy Belt': 'dreamy-belt',
  Chaos: 'chaos',
  Absolab: 'absolab',
  Arcane: 'arcane',
  Genesis: 'genesis',
}

/** Ranks that have an Emblem leaf frame texture. */
const EMBLEM_RANKS: ReadonlySet<ItemRank> = new Set([
  'Unique',
  'Legendary',
  'Mythic',
  'Ancient',
  'Root Abyss',
  'Necro',
  'Dreamy Belt',
  'Chaos',
  'Absolab',
  'Arcane',
  'Genesis',
])

export function rankTextureSlug(rank: ItemRank): string {
  return RANK_SLUG[rank]
}

export function hasEmblemRankTexture(rank: ItemRank): boolean {
  return EMBLEM_RANKS.has(rank)
}

/**
 * Public URL for a rank frame texture.
 * - summary: สรุป / แก้ไข
 * - table: ตารางก่อนเข้าแก้ไข
 * - emblem: ไอเทมที่มี Emblem (Unique+)
 */
export function itemRankTextureUrl(
  rank: ItemRank,
  use: ItemRankTextureUse,
): string | null {
  if (use === 'emblem' && !hasEmblemRankTexture(rank)) return null
  return `/textures/item-rank/${use}/${RANK_SLUG[rank]}.png`
}

export type ItemRankFrameLayers = {
  /** Colored border frame (summary or table). */
  frame: string
  /** Leaf fill under the frame when Emblem is equipped. */
  emblem: string | null
  /** Line-only mask for emblem sparkle (same slug as emblem). */
  emblemLines: string | null
}

/**
 * Layered textures for gear UI.
 * Emblem items keep the colored summary/table frame and put the leaf underneath
 * (frame PNGs already have a transparent center).
 */
export function resolveItemRankFrameLayers(
  rank: ItemRank,
  use: Exclude<ItemRankTextureUse, 'emblem'>,
  options?: { hasEmblem?: boolean },
): ItemRankFrameLayers {
  const frame = itemRankTextureUrl(rank, use)!
  if (!options?.hasEmblem || !hasEmblemRankTexture(rank)) {
    return { frame, emblem: null, emblemLines: null }
  }
  const slug = RANK_SLUG[rank]
  return {
    frame,
    emblem: `/textures/item-rank/emblem/${slug}.png`,
    emblemLines: `/textures/item-rank/emblem-lines/${slug}.png`,
  }
}

/** Colored frame URL only (summary/table). */
export function resolveItemRankFrameUrl(
  rank: ItemRank,
  use: Exclude<ItemRankTextureUse, 'emblem'>,
  _options?: { hasEmblem?: boolean },
): string {
  return resolveItemRankFrameLayers(rank, use, _options).frame
}
