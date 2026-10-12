import { PRESETS, SHELVES, findPreset } from '../lib/presets.js'
import { fold } from '../lib/normalize.js'
import { addItem, findItem, toggleRegistered } from '../lib/pantry.js'
import { esc } from './html.js'

const KIND_LABEL = { seasoning: '調味料', ingredient: '食材' }

function entryChip(name, items) {
  const it = findItem(items, name)
  const state = !it ? '' : it.outOfStock ? ' out' : ' on'
  const pressed = Boolean(it && !it.outOfStock)
  return `<button type="button" class="chip${state}" data-action="toggleEntry" data-name="${esc(name)}" aria-pressed="${pressed}"><span class="name">${esc(name)}</span></button>`
}

export function addList(app) {
  const items = app.state.items
  const q = app.ui.query.trim()
  if (q) {
    const key = fold(q)
    const names = [
      ...PRESETS.filter((p) => [p.name, ...p.aliases].some((n) => fold(n).includes(key))).map((p) => p.name),
      ...items.filter((it) => !findPreset(it.name) && fold(it.name).includes(key)).map((it) => it.name),
    ]
    const known = findPreset(q) || findItem(items, q)
    const hits = names.length ? `<div class="chips">${names.map((n) => entryChip(n, items)).join('')}</div>` : ''
    const custom = known
      ? ''
      : `<div class="custom"><p>「${esc(q)}」を追加：</p><button type="button" class="primary" data-action="addCustom" data-kind="seasoning">調味料として</button><button type="button" class="primary" data-action="addCustom" data-kind="ingredient">食材として</button></div>`
    return hits + custom
  }
  return ['seasoning', 'ingredient']
    .map((kind) => {
      const shelves = SHELVES.filter((s) => s.kind === kind)
        .map((s) => {
          const names = [
            ...PRESETS.filter((p) => p.shelf === s.id).map((p) => p.name),
            ...items.filter((it) => it.shelf === s.id && !findPreset(it.name)).map((it) => it.name),
          ]
          if (!names.length) return ''
          return `<div class="shelf"><h3>${esc(s.label)}</h3><div class="chips">${names.map((n) => entryChip(n, items)).join('')}</div></div>`
        })
        .join('')
      return `<section class="kind"><h2>${KIND_LABEL[kind]}</h2>${shelves}</section>`
    })
    .join('')
}

export function addView(app) {
  return `<div class="search-box"><input type="search" id="addQuery" data-input="query" placeholder="さがす・追加する（例: 豆板醤）" value="${esc(app.ui.query)}" autocomplete="off" enterkeyhint="search" aria-label="品目をさがす" /></div>
<p class="hint">持っているものをタップ。もう一度タップで外せます。</p>
<div id="addList">${addList(app)}</div>`
}

export const addActions = {
  toggleEntry(app, el) {
    const name = el.dataset.name
    const entry = findPreset(name) ?? findItem(app.state.items, name)
    if (!entry) return
    app.update((a) => {
      a.state.items = toggleRegistered(a.state.items, entry)
    })
  },
  addCustom(app, el) {
    const name = app.ui.query.trim()
    const r = addItem(app.state.items, { name, kind: el.dataset.kind })
    if (r.status !== 'added' && r.status !== 'restored') return
    app.update((a) => {
      a.state.items = r.items
      a.ui.query = ''
    })
    app.toast(`${r.item.name} を${KIND_LABEL[r.item.kind]}に追加しました`)
  },
}
