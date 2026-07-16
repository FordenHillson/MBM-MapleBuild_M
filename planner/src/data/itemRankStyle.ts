import type { ItemRank } from '../types/build'

/** CSS modifier class for gear slot / icon frame by rank. */
export function rankFrameClass(rank: ItemRank): string {
  switch (rank) {
    case 'Genesis':
      return 'rank-genesis'
    case 'Arcane':
    case 'Absolab':
      return 'rank-pink-neon'
    case 'Chaos':
    case 'Dreamy Belt':
      return 'rank-pink'
    case 'Necro':
      return 'rank-blue-neon'
    case 'Root Abyss':
    case 'Ancient':
      return 'rank-blue'
    case 'Mythic':
      return 'rank-red'
    case 'Legendary':
      return 'rank-green'
    case 'Unique':
      return 'rank-orange'
    case 'Epic':
      return 'rank-purple'
    case 'Rare':
      return 'rank-cyan'
    case 'Normal':
    default:
      return 'rank-gray'
  }
}
