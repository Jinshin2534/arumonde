import { describe, it, expect } from 'vitest'
import { addItem, findItem, toggleRegistered, toggleOut, removeItem, inStock, groupByShelf } from '../src/lib/pantry.js'

const opts = () => {
  let n = 0
  return { now: 1000, makeId: () => `id${++n}` }
}

describe('addItem', () => {
  it('別名で追加すると正規名・棚になる', () => {
    const r = addItem([], { name: 'しょうゆ' }, opts())
    expect(r.status).toBe('added')
    expect(r.item).toEqual({ id: 'id1', name: '醤油', kind: 'seasoning', shelf: 'basic', outOfStock: false, addedAt: 1000 })
  })
  it('別名で重複追加しても増えない', () => {
    const o = opts()
    const a = addItem([], { name: '醤油' }, o).items
    const r = addItem(a, { name: 'ショウユ' }, o)
    expect(r.status).toBe('exists')
    expect(r.items).toHaveLength(1)
  })
  it('切らした品目を追加すると復活する', () => {
    const o = opts()
    const a = addItem([], { name: '卵' }, o).items
    const r = addItem(toggleOut(a, 'id1'), { name: 'たまご' }, o)
    expect(r.status).toBe('restored')
    expect(r.item.id).toBe('id1')
    expect(r.item.outOfStock).toBe(false)
  })
  it('自由入力は trim され、棚はその他', () => {
    const r = addItem([], { name: ' ドラゴンフルーツ ', kind: 'ingredient' }, opts())
    expect(r.item.name).toBe('ドラゴンフルーツ')
    expect(r.item.shelf).toBe('other_i')
  })
  it('自由入力で kind が不正なら invalid', () => {
    expect(addItem([], { name: 'なにか', kind: 'x' }, opts()).status).toBe('invalid')
  })
  it('空は empty', () => expect(addItem([], { name: '  ' }, opts()).status).toBe('empty'))
})

describe('toggleRegistered', () => {
  it('未登録→追加→削除', () => {
    const o = opts()
    const a = toggleRegistered([], { name: '塩' }, o)
    expect(a.map((i) => i.name)).toEqual(['塩'])
    expect(toggleRegistered(a, { name: '塩' }, o)).toEqual([])
  })
  it('切らしたものは復活', () => {
    const o = opts()
    const a = toggleOut(toggleRegistered([], { name: '塩' }, o), 'id1')
    const b = toggleRegistered(a, { name: '塩' }, o)
    expect(b).toHaveLength(1)
    expect(b[0].outOfStock).toBe(false)
  })
})

describe('その他の操作', () => {
  const o = opts()
  let items = []
  for (const name of ['玉ねぎ', '醤油', '鶏もも肉', '砂糖']) items = addItem(items, { name }, o).items
  it('findItem は表記ゆれで引ける', () => expect(findItem(items, 'たまねぎ').name).toBe('玉ねぎ'))
  it('toggleOut は反転する', () => {
    expect(toggleOut(items, 'id1')[0].outOfStock).toBe(true)
    expect(toggleOut(toggleOut(items, 'id1'), 'id1')[0].outOfStock).toBe(false)
  })
  it('removeItem', () => expect(removeItem(items, 'id2').map((i) => i.name)).toEqual(['玉ねぎ', '鶏もも肉', '砂糖']))
  it('inStock は kind と在庫で絞る', () => {
    expect(inStock(toggleOut(items, 'id1'), 'ingredient').map((i) => i.name)).toEqual(['鶏もも肉'])
  })
  it('groupByShelf は SHELVES 順で空の棚を省く', () => {
    expect(groupByShelf(items).map((g) => g.shelf.id)).toEqual(['basic', 'meat', 'veg'])
  })
})
