import { describe, expect, it } from 'vitest'
import type { GearItem } from '../types/build'
import {
  SOUL_BOSSES,
  SOUL_SET_SLOTS,
  buildSoulBlock,
  isSoulSlot,
  normalizeSoul,
  parseSoulId,
  resolveSoulSet,
  soulOptionsForBoss,
} from './souls'

function bareGear(
  slot: GearItem['slotId'],
  soul: GearItem['soul'],
): GearItem {
  return {
    slotId: slot,
    itemName: slot,
    iconUrl: '',
    rank: 'Legendary',
    level: 1,
    star: 0,
    atkBase: 0,
    atkBonus: 0,
    phyDefBase: 0,
    magDefBase: 0,
    maxHpBase: 0,
    maxMpBase: 0,
    maxDamageBase: 0,
    flameRank: null,
    mainLines: [],
    highTierOption: null,
    sharenianAbility: null,
    potential: null,
    bonusPotential: null,
    emblem: null,
    soul,
  }
}

describe('souls catalog', () => {
  it('orders bosses highest → lowest', () => {
    expect(SOUL_BOSSES[0]?.id).toBe('will')
    expect(SOUL_BOSSES.at(-1)?.id).toBe('zakum')
  })

  it('supports main weapon and secondary', () => {
    expect(isSoulSlot('mainWeapon')).toBe(true)
    expect(isSoulSlot('secondary')).toBe(true)
    expect(isSoulSlot('hat')).toBe(false)
  })

  it('supports shoulder, belt, and cape with the secondary soul chart', () => {
    for (const slot of ['shoulder', 'belt', 'cape'] as const) {
      expect(isSoulSlot(slot)).toBe(true)

      const soul = buildSoulBlock('will', 'hearty', slot)
      expect(soul).toMatchObject({
        soulId: 'will:hearty',
        name: 'Hearty Will Soul',
        stat: { optionId: 'bossAtkPercent', value: 6 },
      })
    }
  })

  it('builds Hearty Will with Max HP % 16 on weapon', () => {
    const soul = buildSoulBlock('will', 'hearty', 'mainWeapon')
    expect(soul).toMatchObject({
      soulId: 'will:hearty',
      name: 'Hearty Will Soul',
      skillNote: 'Crushing Lunge',
      stat: { optionId: 'maxHpPercent', value: 16 },
    })
  })

  it('uses secondary chart for Hearty Will (Boss ATK % 6)', () => {
    const soul = buildSoulBlock('will', 'hearty', 'secondary')
    expect(soul).toMatchObject({
      soulId: 'will:hearty',
      name: 'Hearty Will Soul',
      stat: { optionId: 'bossAtkPercent', value: 6 },
    })
  })

  it('normalizes soul on secondary with secondary stats', () => {
    const raw = buildSoulBlock('will', 'hearty', 'mainWeapon')
    expect(normalizeSoul('secondary', raw)).toMatchObject({
      soulId: 'will:hearty',
      stat: { optionId: 'bossAtkPercent', value: 6 },
    })
    expect(normalizeSoul('cape', raw)).toMatchObject({
      soulId: 'will:hearty',
      stat: { optionId: 'bossAtkPercent', value: 6 },
    })
    expect(normalizeSoul('hat', raw)).toBeNull()
  })

  it('exposes secondary magnificent pool (Fever / Drop / ATK)', () => {
    const opts = soulOptionsForBoss('will', 'secondary')
    expect(opts.some((o) => o.id === 'magnificent_feverDurationSec')).toBe(true)
    expect(opts.some((o) => o.id === 'magnificent_itemDropPercent')).toBe(true)
    expect(opts.some((o) => o.id === 'magnificent_phyAtkPercent')).toBe(true)
    expect(opts.some((o) => o.id === 'magnificent_maxHpPercent')).toBe(false)

    const fever = buildSoulBlock(
      'will',
      'magnificent_feverDurationSec',
      'secondary',
    )
    expect(fever?.stat).toMatchObject({
      optionId: 'feverDurationSec',
      value: 4.8,
    })

    const maxDmg = buildSoulBlock('will', 'magnificent_maxDamage', 'secondary')
    expect(maxDmg?.stat.value).toBe(1_348_000)
    expect(
      soulOptionsForBoss('zakum', 'secondary').some(
        (o) => o.id === 'magnificent_maxDamage',
      ),
    ).toBe(false)
  })

  it('hides Max DMG Cap for Zakum Magnificent on weapon', () => {
    const opts = soulOptionsForBoss('zakum', 'mainWeapon')
    expect(opts.some((o) => o.id === 'magnificent_maxDamage')).toBe(false)
    expect(opts.some((o) => o.id === 'magnificent_finalPercent')).toBe(true)
  })

  it('parses soulId for slot catalogs', () => {
    expect(parseSoulId('will:potent', 'mainWeapon')).toEqual({
      bossId: 'will',
      optionId: 'potent',
    })
    expect(parseSoulId('will:magnificent_feverDurationSec', 'secondary')).toEqual(
      {
        bossId: 'will',
        optionId: 'magnificent_feverDurationSec',
      },
    )
    expect(
      parseSoulId('will:magnificent_feverDurationSec', 'mainWeapon'),
    ).toBeNull()
    expect(parseSoulId('legacy')).toBeNull()
  })
})

describe('soul set resolver', () => {
  it('exposes the five set slots in UI order', () => {
    expect(SOUL_SET_SLOTS).toEqual([
      'mainWeapon',
      'secondary',
      'shoulder',
      'belt',
      'cape',
    ])
  })

  it('is inactive when main weapon has no soul', () => {
    const set = resolveSoulSet({
      mainWeapon: bareGear('mainWeapon', null),
      cape: bareGear('cape', buildSoulBlock('will', 'hearty', 'cape')),
    })
    expect(set.active).toBe(false)
    expect(set.bossId).toBeNull()
    expect(set.setLevel).toBe(0)
    expect(set.atkBonus).toBe(0)
    expect(set.slots.every((s) => !s.matched)).toBe(true)
  })

  it('anchors on main weapon boss and ignores soul type differences', () => {
    const set = resolveSoulSet({
      mainWeapon: bareGear(
        'mainWeapon',
        buildSoulBlock('will', 'hearty', 'mainWeapon'),
      ),
      secondary: bareGear(
        'secondary',
        buildSoulBlock('will', 'beefy', 'secondary'),
      ),
      cape: bareGear(
        'cape',
        buildSoulBlock('lucid', 'hearty', 'cape'),
      ),
    })
    expect(set.active).toBe(true)
    expect(set.bossId).toBe('will')
    expect(set.bossName).toBe('Will')
    expect(set.setLevel).toBe(2)
    expect(set.atkBonus).toBe(540)
    expect(set.slots.find((s) => s.slot === 'mainWeapon')?.matched).toBe(true)
    expect(set.slots.find((s) => s.slot === 'secondary')?.matched).toBe(true)
    expect(set.slots.find((s) => s.slot === 'cape')?.matched).toBe(false)
  })

  it('does not count other boss groups toward the main weapon set', () => {
    const set = resolveSoulSet({
      mainWeapon: bareGear(
        'mainWeapon',
        buildSoulBlock('will', 'potent', 'mainWeapon'),
      ),
      secondary: bareGear(
        'secondary',
        buildSoulBlock('lucid', 'hearty', 'secondary'),
      ),
      shoulder: bareGear(
        'shoulder',
        buildSoulBlock('lucid', 'beefy', 'shoulder'),
      ),
      belt: bareGear('belt', buildSoulBlock('lucid', 'flashy', 'belt')),
    })
    expect(set.setLevel).toBe(1)
    expect(set.atkBonus).toBe(270)
  })

  it('scales Zakum set 1 base ATK to 60', () => {
    const set = resolveSoulSet({
      mainWeapon: bareGear(
        'mainWeapon',
        buildSoulBlock('zakum', 'beefy', 'mainWeapon'),
      ),
    })
    expect(set.setLevel).toBe(1)
    expect(set.atkBonus).toBe(60)
  })
})
