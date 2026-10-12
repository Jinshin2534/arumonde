import { describe, it, expect } from 'vitest'
import { PRESETS, SHELVES, findPreset, canonicalKey, shelfFor } from '../src/lib/presets.js'
import { fold } from '../src/lib/normalize.js'

describe('presets', () => {
  it('品目は100以上', () => expect(PRESETS.length).toBeGreaterThanOrEqual(100))
  it('名前と別名は全品目を通して一意', () => {
    const seen = new Map()
    for (const p of PRESETS) {
      for (const k of new Set([p.name, ...p.aliases].map(fold))) {
        expect(seen.has(k) ? `${k}: ${seen.get(k)} / ${p.name}` : null).toBeNull()
        seen.set(k, p.name)
      }
    }
  })
  it('棚は kind と整合する', () => {
    for (const p of PRESETS) expect(SHELVES.find((s) => s.id === p.shelf)?.kind).toBe(p.kind)
  })
  it('別名・表記ゆれから引ける', () => {
    expect(findPreset('しょうゆ').name).toBe('醤油')
    expect(findPreset('ショウユ').name).toBe('醤油')
    expect(findPreset('たまご').name).toBe('卵')
    expect(findPreset(' 豚こま ').name).toBe('豚こま切れ肉')
  })
  it('未知は null', () => expect(findPreset('ドラゴンフルーツ')).toBeNull())
  it('canonicalKey は別名を正規名に寄せ、未知は fold', () => {
    expect(canonicalKey('しょう油')).toBe(canonicalKey('醤油'))
    expect(canonicalKey('ドラゴン')).toBe('どらごん')
  })
  it('shelfFor は kind に合わない棚を「その他」に直す', () => {
    expect(shelfFor('ingredient', 'veg')).toBe('veg')
    expect(shelfFor('ingredient', 'basic')).toBe('other_i')
    expect(shelfFor('seasoning', undefined)).toBe('other_s')
  })
})
