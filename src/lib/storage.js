import { KINDS, shelfFor } from './presets.js'
import { SERVINGS, TIMES, MOODS } from './prompt.js'

export const KEY = 'arumonde:v1'

export function defaultState() {
  return { items: [], prefs: { servings: 2, time: null, moods: [] } }
}

function cleanItem(it) {
  if (!it || typeof it.id !== 'string' || !it.id) return null
  if (typeof it.name !== 'string' || !it.name.trim()) return null
  if (!KINDS.includes(it.kind)) return null
  return {
    id: it.id,
    name: it.name.trim(),
    kind: it.kind,
    shelf: shelfFor(it.kind, it.shelf),
    outOfStock: Boolean(it.outOfStock),
    addedAt: Number.isFinite(it.addedAt) ? it.addedAt : 0,
  }
}

function cleanPrefs(p = {}) {
  const d = defaultState().prefs
  return {
    servings: p.servings === null ? null : SERVINGS.includes(p.servings) ? p.servings : d.servings,
    time: TIMES.some((t) => t.id === p.time) ? p.time : null,
    moods: Array.isArray(p.moods) ? MOODS.filter((m) => p.moods.includes(m.id)).map((m) => m.id) : [],
  }
}

export function loadState(storage) {
  let raw
  try {
    raw = storage.getItem(KEY)
  } catch {
    return defaultState()
  }
  if (raw == null) return defaultState()
  try {
    const data = JSON.parse(raw)
    if (!data || !Array.isArray(data.items)) throw new Error('shape')
    return { items: data.items.map(cleanItem).filter(Boolean), prefs: cleanPrefs(data.prefs ?? {}) }
  } catch {
    try {
      storage.setItem(`${KEY}:broken`, raw)
    } catch {
      // 退避できなくても起動は続ける
    }
    return defaultState()
  }
}

export function saveState(storage, state) {
  try {
    storage.setItem(KEY, JSON.stringify({ items: state.items, prefs: state.prefs }))
    return true
  } catch {
    return false
  }
}
