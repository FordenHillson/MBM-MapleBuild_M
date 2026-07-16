import { describe, expect, it } from 'vitest'
import {
  SOUL_BOSSES,
  buildSoulBlock,
  isSoulSlot,
  normalizeSoul,
  parseSoulId,
  soulOptionsForBoss,
} from './souls'

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
