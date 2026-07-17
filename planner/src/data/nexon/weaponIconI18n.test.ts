import { describe, expect, it } from 'vitest'
import {
  translateWeaponItemNameKo,
  translateWeaponTypeKo,
} from './weaponIconI18n'

describe('weaponIconI18n', () => {
  it('translates known Absolab / Arcane Shade names to English', () => {
    expect(translateWeaponItemNameKo('앱솔랩스 비트해머')).toBe(
      'Absolab Beat Hammer',
    )
    expect(translateWeaponItemNameKo('아케인셰이드 보우')).toBe(
      'Arcane Shade Bow',
    )
    expect(translateWeaponTypeKo('활')).toBe('Bow')
    expect(translateWeaponTypeKo('한손둔기')).toBe('One-Handed Mace')
  })

  it('falls back to Korean when unknown', () => {
    expect(translateWeaponItemNameKo('알수없는무기')).toBe('알수없는무기')
    expect(translateWeaponTypeKo('미지수')).toBe('미지수')
  })
})
