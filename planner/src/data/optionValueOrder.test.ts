import { describe, expect, it } from 'vitest'
import { flameValues } from './flameWeapon'
import { potentialValues } from './potentialWeapon'
import { bonusPotentialValues } from './bonusPotentialWeapon'

function expectDescending(values: number[]) {
  expect(values.length).toBeGreaterThan(1)
  for (let i = 1; i < values.length; i++) {
    expect(values[i - 1]!).toBeGreaterThanOrEqual(values[i]!)
  }
}

describe('option value dropdown order', () => {
  it('sorts flame values high → low', () => {
    const values = flameValues('mainWeapon', 'finalDmg', 'Legendary')
    expectDescending(values)
  })

  it('sorts potential values high → low', () => {
    const values = potentialValues('hat', 'maxHpPercent', 'Legendary', 1)
    expectDescending(values)
  })

  it('sorts bonus potential values high → low', () => {
    const values = bonusPotentialValues('hat', 'phyAtkPercent', 'Unique', 0)
    expectDescending(values)
  })
})
