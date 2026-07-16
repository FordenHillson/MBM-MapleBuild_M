import type { GearSlotId } from '../types/build'

export type EquipCategory =
  | 'weapon'
  | 'secondary'
  | 'armor'
  | 'accessory'
  | 'misc'

export type MainLinesMode = 'flame' | 'free' | 'none'

export interface CategoryProfile {
  category: EquipCategory
  flame: { enabled: boolean; lineCount: number }
  potential: { enabled: boolean; lineCount: number }
  bonusPotential: { enabled: boolean; lineCount: number }
  emblem: { enabled: boolean; defaultBaseBoostPercent: number }
  soul: { enabled: boolean }
  highTierOption: { enabled: boolean }
  sharenianAbility: { enabled: boolean }
  mainLinesMode: MainLinesMode
}

const WEAPON_LIKE = {
  flame: { enabled: true, lineCount: 2 },
  potential: { enabled: true, lineCount: 3 },
  bonusPotential: { enabled: true, lineCount: 3 },
  emblem: { enabled: true, defaultBaseBoostPercent: 30 },
  soul: { enabled: true },
  mainLinesMode: 'flame' as const,
}

export const CATEGORY_PROFILES: Record<EquipCategory, CategoryProfile> = {
  weapon: {
    category: 'weapon',
    ...WEAPON_LIKE,
    highTierOption: { enabled: true },
    sharenianAbility: { enabled: false },
  },
  secondary: {
    category: 'secondary',
    ...WEAPON_LIKE,
    highTierOption: { enabled: false },
    sharenianAbility: { enabled: true },
  },
  armor: {
    category: 'armor',
    flame: { enabled: false, lineCount: 0 },
    potential: { enabled: false, lineCount: 0 },
    bonusPotential: { enabled: false, lineCount: 0 },
    emblem: { enabled: true, defaultBaseBoostPercent: 30 },
    soul: { enabled: false },
    highTierOption: { enabled: false },
    sharenianAbility: { enabled: false },
    mainLinesMode: 'free',
  },
  accessory: {
    category: 'accessory',
    flame: { enabled: false, lineCount: 0 },
    potential: { enabled: false, lineCount: 0 },
    bonusPotential: { enabled: false, lineCount: 0 },
    emblem: { enabled: true, defaultBaseBoostPercent: 0 },
    soul: { enabled: false },
    highTierOption: { enabled: false },
    sharenianAbility: { enabled: false },
    mainLinesMode: 'free',
  },
  misc: {
    category: 'misc',
    flame: { enabled: false, lineCount: 0 },
    potential: { enabled: false, lineCount: 0 },
    bonusPotential: { enabled: false, lineCount: 0 },
    emblem: { enabled: false, defaultBaseBoostPercent: 0 },
    soul: { enabled: false },
    highTierOption: { enabled: false },
    sharenianAbility: { enabled: false },
    mainLinesMode: 'none',
  },
}

export const SLOT_CATEGORY: Record<GearSlotId, EquipCategory> = {
  mainWeapon: 'weapon',
  secondary: 'secondary',
  hat: 'armor',
  gloves: 'armor',
  outfitTop: 'armor',
  outfitBottom: 'armor',
  shoulder: 'armor',
  shoes: 'armor',
  cape: 'armor',
  belt: 'accessory',
  pendant1: 'accessory',
  pendant2: 'accessory',
  ring1: 'accessory',
  ring2: 'accessory',
  ring3: 'accessory',
  ring4: 'accessory',
  earrings: 'accessory',
  face: 'accessory',
  eye: 'accessory',
  title: 'misc',
  badge: 'misc',
  medal: 'misc',
  socket: 'misc',
}

export function slotCategory(slot: GearSlotId): EquipCategory {
  return SLOT_CATEGORY[slot]
}

export function categoryProfile(category: EquipCategory): CategoryProfile {
  return CATEGORY_PROFILES[category]
}

export function slotProfile(slot: GearSlotId): CategoryProfile {
  return categoryProfile(slotCategory(slot))
}
