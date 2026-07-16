import type {
  EmblemBlock,
  GearSlotId,
  StatLine,
} from '../types/build'

export type EmblemEquipCategory =
  | 'weapon'
  | 'armor'
  | 'secondary'
  | 'accessory'

export interface EmblemDef {
  id: string
  name: string
  effectLabel: string
  /** optionId for GEAR_OPTION_TO_STAT */
  optionId: string
  /** Icon from Nexon Emblem guide board 2698 / thread 2008237. */
  icon: string
  categories: EmblemEquipCategory[]
}

const ALL4: EmblemEquipCategory[] = [
  'weapon',
  'armor',
  'secondary',
  'accessory',
]

/** Icons — Nexon Forge guide board 2698 / thread 2008237. */
const ICON = {
  ruthless:
    'https://dszw1qtcnsa5e.cloudfront.net/community/20260521/372f057d-448e-4b0b-b7b2-d4c8cb783cee/image2026052109281255.png',
  powerful:
    'https://dszw1qtcnsa5e.cloudfront.net/community/20260521/7f282a97-ccd7-4c37-bf20-1696117d7b8b/image2026052109281256.png',
  sacred:
    'https://dszw1qtcnsa5e.cloudfront.net/community/20260521/b830b2af-ba40-46f5-86f3-afe15ac1271a/image2026052109281257.png',
  swift:
    'https://dszw1qtcnsa5e.cloudfront.net/community/20260521/8aa9b2b3-443a-4526-9f4e-1865e5683008/image2026052109281258.png',
  domination:
    'https://dszw1qtcnsa5e.cloudfront.net/community/20260521/07efa69f-2c7e-4187-9cae-b376eb0b530e/image2026052109281259.png',
  cleverness:
    'https://dszw1qtcnsa5e.cloudfront.net/community/20260521/54c0a5c5-821b-4853-8ba5-6e8e3378ad9e/image2026052109281260.png',
  destruction:
    'https://dszw1qtcnsa5e.cloudfront.net/community/20260521/ea359b55-beef-4a69-8253-15462d566548/image2026052109281261.png',
  judgment:
    'https://dszw1qtcnsa5e.cloudfront.net/community/20260521/40c1b171-7e7e-4bfc-825a-30ee769bef3c/image2026052109281262.png',
  experience:
    'https://dszw1qtcnsa5e.cloudfront.net/community/20260521/ca3b4618-d56c-43c6-a9a7-ef8aec06c133/image2026052109281263.png',
  patient:
    'https://dszw1qtcnsa5e.cloudfront.net/community/20260521/477bf686-8217-4bdc-b01a-f34eb5d3bd5c/image2026052109281264.png',
} as const

/** Emblem catalog — Nexon Forge guide board 2698 / thread 2008237. */
export const EMBLEM_DEFS: EmblemDef[] = [
  {
    id: 'ruthless',
    name: 'Ruthless Emblem',
    effectLabel: 'Crit DMG',
    optionId: 'critDmg',
    icon: ICON.ruthless,
    categories: ALL4,
  },
  {
    id: 'powerful',
    name: 'Powerful Emblem',
    effectLabel: 'PHY ATK Increase',
    optionId: 'phyAtkPercent',
    icon: ICON.powerful,
    categories: ALL4,
  },
  {
    id: 'sacred',
    name: 'Sacred Emblem',
    effectLabel: 'MAG ATK Increase',
    optionId: 'magAtkPercent',
    icon: ICON.sacred,
    categories: ALL4,
  },
  {
    id: 'swift',
    name: 'Swift Emblem',
    effectLabel: 'Boss DEF Increase',
    optionId: 'bossDefPercent',
    icon: ICON.swift,
    categories: ALL4,
  },
  {
    id: 'domination',
    name: 'Domination Emblem',
    effectLabel: 'Boss ATK Increase',
    optionId: 'bossAtkPercent',
    icon: ICON.domination,
    categories: ALL4,
  },
  {
    id: 'cleverness',
    name: 'Cleverness Emblem',
    effectLabel: 'Crit Rate',
    optionId: 'critRate',
    icon: ICON.cleverness,
    categories: ['secondary', 'accessory'],
  },
  {
    id: 'destruction',
    name: 'Destruction Emblem',
    effectLabel: 'PHY DMG Increase',
    optionId: 'phyDmgPercent',
    icon: ICON.destruction,
    categories: ['secondary'],
  },
  {
    id: 'judgment',
    name: 'Judgment Emblem',
    effectLabel: 'MAG DMG Increase',
    optionId: 'magDmgPercent',
    icon: ICON.judgment,
    categories: ['secondary'],
  },
  {
    id: 'experience',
    name: 'Experience Emblem',
    effectLabel: 'EXP Increase',
    optionId: 'expGainPercent',
    icon: ICON.experience,
    categories: ['secondary'],
  },
  {
    id: 'patient',
    name: 'Patient Emblem',
    effectLabel: 'PHY DEF Increase',
    optionId: 'phyDefPercent',
    icon: ICON.patient,
    categories: ['secondary'],
  },
]

const ARMOR_SLOTS: ReadonlySet<GearSlotId> = new Set([
  'hat',
  'gloves',
  'outfitTop',
  'outfitBottom',
  'shoulder',
  'shoes',
  'belt',
  'cape',
])

const ACCESSORY_SLOTS: ReadonlySet<GearSlotId> = new Set([
  'pendant1',
  'pendant2',
  'ring1',
  'ring2',
  'ring3',
  'ring4',
  'earrings',
  'face',
  'eye',
])

export function slotEmblemCategory(
  slot: GearSlotId,
): EmblemEquipCategory | null {
  if (slot === 'mainWeapon') return 'weapon'
  if (slot === 'secondary') return 'secondary'
  if (ARMOR_SLOTS.has(slot)) return 'armor'
  if (ACCESSORY_SLOTS.has(slot)) return 'accessory'
  return null
}

export function supportsEmblem(slot: GearSlotId): boolean {
  return slotEmblemCategory(slot) != null
}

export function emblemById(id: string): EmblemDef | undefined {
  return EMBLEM_DEFS.find((e) => e.id === id)
}

export function emblemsForSlot(slot: GearSlotId): EmblemDef[] {
  const cat = slotEmblemCategory(slot)
  if (!cat) return []
  return EMBLEM_DEFS.filter((e) => e.categories.includes(cat))
}

/** Accessories get no basic-option boost; weapon/armor/secondary default +30%. */
export function defaultBaseBoost(slot: GearSlotId): number {
  const cat = slotEmblemCategory(slot)
  if (cat === 'accessory' || cat == null) return 0
  return 30
}

function resolveTypeId(
  slot: GearSlotId,
  typeId: string | undefined,
  name: string | undefined,
): string | null {
  const available = emblemsForSlot(slot)
  if (available.length === 0) return null
  if (typeId && available.some((e) => e.id === typeId)) return typeId
  if (name) {
    const byName = available.find(
      (e) => e.name.toLowerCase() === name.toLowerCase(),
    )
    if (byName) return byName.id
  }
  if (available.some((e) => e.id === 'ruthless')) return 'ruthless'
  return available[0]!.id
}

function effectLine(def: EmblemDef, value: number): StatLine {
  return {
    optionId: def.optionId,
    label: def.effectLabel,
    value,
  }
}

function maxDamageLine(value: number): StatLine {
  return {
    optionId: 'maxDamage',
    label: 'DMG สูงสุด',
    value,
  }
}

export function emblemEffectValue(emblem: EmblemBlock): number {
  const def = emblemById(emblem.typeId)
  const effect = emblem.lines?.find(
    (l) =>
      l.optionId !== 'maxDamage' &&
      (def == null || l.optionId === def.optionId || l.optionId === 'critDmg'),
  )
  if (effect) return Number(effect.value) || 0
  const first = emblem.lines?.find((l) => l.optionId !== 'maxDamage')
  return Number(first?.value) || 0
}

export function emblemMaxDamageValue(emblem: EmblemBlock): number {
  const line = emblem.lines?.find((l) => l.optionId === 'maxDamage')
  return Number(line?.value) || 0
}

export function buildEmblemLines(
  def: EmblemDef,
  effectValue: number,
  maxDamage: number,
): StatLine[] {
  return [effectLine(def, effectValue), maxDamageLine(maxDamage)]
}

export function emptyEmblem(
  slot: GearSlotId,
  typeId?: string,
): EmblemBlock | null {
  const id = resolveTypeId(slot, typeId, undefined)
  if (!id) return null
  const def = emblemById(id)!
  return {
    typeId: def.id,
    name: def.name,
    level: 1,
    baseOptionBoostPercent: defaultBaseBoost(slot),
    lines: buildEmblemLines(def, 0, 0),
  }
}

export function normalizeEmblem(
  slot: GearSlotId,
  emblem: EmblemBlock | null | undefined,
): EmblemBlock | null {
  if (!emblem) return null
  if (!supportsEmblem(slot)) return null

  const id = resolveTypeId(slot, emblem.typeId, emblem.name)
  if (!id) return null
  const def = emblemById(id)!
  const effectVal = emblemEffectValue(emblem)
  const maxDmg = emblemMaxDamageValue(emblem)
  const boost =
    slotEmblemCategory(slot) === 'accessory'
      ? 0
      : Number.isFinite(emblem.baseOptionBoostPercent)
        ? emblem.baseOptionBoostPercent
        : defaultBaseBoost(slot)

  return {
    typeId: def.id,
    name: def.name,
    level: Math.max(0, Math.round(Number(emblem.level) || 1)),
    baseOptionBoostPercent: boost,
    lines: buildEmblemLines(def, effectVal, maxDmg),
  }
}
