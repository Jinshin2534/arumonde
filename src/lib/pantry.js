import { KINDS, SHELVES, findPreset, canonicalKey, shelfFor } from './presets.js'

const defaultId = () => crypto.randomUUID()

export function findItem(items, name) {
  const key = canonicalKey(name)
  return items.find((it) => canonicalKey(it.name) === key) ?? null
}

// 追加。既にあれば何もしない（切らしていれば戻す）
export function addItem(items, { name, kind, shelf } = {}, { now = Date.now(), makeId = defaultId } = {}) {
  const trimmed = String(name ?? '').trim()
  if (!trimmed) return { items, item: null, status: 'empty' }
  const existing = findItem(items, trimmed)
  if (existing) {
    if (!existing.outOfStock) return { items, item: existing, status: 'exists' }
    const item = { ...existing, outOfStock: false }
    return { items: items.map((it) => (it.id === item.id ? item : it)), item, status: 'restored' }
  }
  const preset = findPreset(trimmed)
  if (!preset && !KINDS.includes(kind)) return { items, item: null, status: 'invalid' }
  const k = preset ? preset.kind : kind
  const item = {
    id: makeId(),
    name: preset ? preset.name : trimmed,
    kind: k,
    shelf: preset ? preset.shelf : shelfFor(k, shelf),
    outOfStock: false,
    addedAt: now,
  }
  return { items: [...items, item], item, status: 'added' }
}

// 追加画面のタップ: 未登録→追加、在庫あり→削除、切らした→復活
export function toggleRegistered(items, entry, opts) {
  const existing = findItem(items, entry.name)
  if (existing && !existing.outOfStock) return removeItem(items, existing.id)
  return addItem(items, entry, opts).items
}

export function toggleOut(items, id) {
  return items.map((it) => (it.id === id ? { ...it, outOfStock: !it.outOfStock } : it))
}

export function removeItem(items, id) {
  return items.filter((it) => it.id !== id)
}

export function inStock(items, kind) {
  return items.filter((it) => !it.outOfStock && it.kind === kind)
}

export function groupByShelf(items) {
  return SHELVES.map((shelf) => ({ shelf, items: items.filter((it) => it.shelf === shelf.id) })).filter(
    (g) => g.items.length,
  )
}
