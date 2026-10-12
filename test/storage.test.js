import { describe, it, expect } from 'vitest'
import { KEY, defaultState, loadState, saveState } from '../src/lib/storage.js'

const mem = (init = {}) => {
  const m = new Map(Object.entries(init))
  return { m, getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) }
}
const item = { id: 'a', name: '醤油', kind: 'seasoning', shelf: 'basic', outOfStock: false, addedAt: 1 }

describe('storage', () => {
  it('空なら既定値', () => expect(loadState(mem())).toEqual(defaultState()))
  it('保存して読み戻せる', () => {
    const s = mem()
    const state = { items: [item], prefs: { servings: 3, time: 15, moods: ['warm'] } }
    expect(saveState(s, state)).toBe(true)
    expect(loadState(s)).toEqual(state)
  })
  it('壊れた JSON は既定値で起動し、生データを退避', () => {
    const s = mem({ [KEY]: '{oops' })
    expect(loadState(s)).toEqual(defaultState())
    expect(s.m.get(`${KEY}:broken`)).toBe('{oops')
  })
  it('items が配列でなければ壊れ扱い', () => {
    const s = mem({ [KEY]: '{"items":1}' })
    expect(loadState(s)).toEqual(defaultState())
    expect(s.m.has(`${KEY}:broken`)).toBe(true)
  })
  it('不正な品目は捨て、棚と prefs を直す', () => {
    const s = mem({
      [KEY]: JSON.stringify({
        items: [item, { id: 'b', name: '', kind: 'seasoning' }, { id: 'c', name: '謎', kind: 'x' },
          { id: 'd', name: '卵', kind: 'ingredient', shelf: 'basic', outOfStock: 1 }],
        prefs: { servings: 9, time: 45, moods: ['light', 'zzz'] },
      }),
    })
    const st = loadState(s)
    expect(st.items.map((i) => i.id)).toEqual(['a', 'd'])
    expect(st.items[1]).toEqual({ id: 'd', name: '卵', kind: 'ingredient', shelf: 'other_i', outOfStock: true, addedAt: 0 })
    expect(st.prefs).toEqual({ servings: 2, time: null, moods: ['light'] })
  })
  it('servings は null を許す', () => {
    const s = mem({ [KEY]: JSON.stringify({ items: [], prefs: { servings: null } }) })
    expect(loadState(s).prefs.servings).toBeNull()
  })
  it('読み書きが例外でも落ちない', () => {
    const bad = { getItem: () => { throw new Error('x') }, setItem: () => { throw new Error('x') } }
    expect(loadState(bad)).toEqual(defaultState())
    expect(saveState(bad, defaultState())).toBe(false)
  })
})
