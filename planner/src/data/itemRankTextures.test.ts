import { describe, expect, it } from 'vitest'
import {
  hasEmblemRankTexture,
  itemRankTextureUrl,
  resolveItemRankFrameLayers,
  resolveItemRankFrameUrl,
} from './itemRankTextures'

describe('itemRankTextures', () => {
  it('builds public URLs by use folder', () => {
    expect(itemRankTextureUrl('Legendary', 'summary')).toBe(
      '/textures/item-rank/summary/legendary.png',
    )
    expect(itemRankTextureUrl('Rare', 'table')).toBe(
      '/textures/item-rank/table/rare.png',
    )
    expect(itemRankTextureUrl('Genesis', 'emblem')).toBe(
      '/textures/item-rank/emblem/genesis.png',
    )
  })

  it('returns null emblem URL for ranks without leaf texture', () => {
    expect(itemRankTextureUrl('Normal', 'emblem')).toBeNull()
    expect(hasEmblemRankTexture('Normal')).toBe(false)
    expect(hasEmblemRankTexture('Unique')).toBe(true)
  })

  it('resolves frame URL; keeps colored frame even with emblem', () => {
    expect(resolveItemRankFrameUrl('Rare', 'table')).toBe(
      '/textures/item-rank/table/rare.png',
    )
    expect(
      resolveItemRankFrameUrl('Legendary', 'table', { hasEmblem: true }),
    ).toBe('/textures/item-rank/table/legendary.png')
    expect(
      resolveItemRankFrameUrl('Legendary', 'summary', { hasEmblem: true }),
    ).toBe('/textures/item-rank/summary/legendary.png')
  })

  it('layers emblem leaf under summary/table frame when equipped', () => {
    expect(resolveItemRankFrameLayers('Rare', 'table')).toEqual({
      frame: '/textures/item-rank/table/rare.png',
      emblem: null,
      emblemLines: null,
    })
    expect(
      resolveItemRankFrameLayers('Legendary', 'table', { hasEmblem: true }),
    ).toEqual({
      frame: '/textures/item-rank/table/legendary.png',
      emblem: '/textures/item-rank/emblem/legendary.png',
      emblemLines: '/textures/item-rank/emblem-lines/legendary.png',
    })
    expect(
      resolveItemRankFrameLayers('Legendary', 'summary', { hasEmblem: true }),
    ).toEqual({
      frame: '/textures/item-rank/summary/legendary.png',
      emblem: '/textures/item-rank/emblem/legendary.png',
      emblemLines: '/textures/item-rank/emblem-lines/legendary.png',
    })
    expect(
      resolveItemRankFrameLayers('Rare', 'summary', { hasEmblem: true }),
    ).toEqual({
      frame: '/textures/item-rank/summary/rare.png',
      emblem: null,
      emblemLines: null,
    })
  })
})
