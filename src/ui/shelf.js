import { groupByShelf, toggleOut, removeItem } from '../lib/pantry.js'
import { esc } from './html.js'

const KIND_LABEL = { seasoning: '調味料', ingredient: '食材' }

function chip(it, editing) {
  const cls = `chip${it.outOfStock ? ' out' : ''}`
  const label = `${esc(it.name)}${it.outOfStock ? '（切らした）' : ''}`
  if (editing) {
    return `<button type="button" class="${cls}" data-action="deleteItem" data-id="${esc(it.id)}" aria-label="${label}を削除"><span class="name">${esc(it.name)}</span><span class="x" aria-hidden="true">×</span></button>`
  }
  return `<button type="button" class="${cls}" data-action="tapItem" data-longpress="1" data-id="${esc(it.id)}" aria-label="${label}"><span class="name">${esc(it.name)}</span>${it.outOfStock ? '<small>切らした</small>' : ''}</button>`
}

export function shelfView(app) {
  const { items } = app.state
  if (!items.length) {
    return `<section class="empty"><p>まだ何も登録されていません。</p><button type="button" class="primary" data-action="goTab" data-tab="add">持っているものを登録する</button></section>`
  }
  const editing = app.ui.editing
  const kinds = ['seasoning', 'ingredient']
    .map((kind) => {
      const groups = groupByShelf(items.filter((it) => it.kind === kind))
      if (!groups.length) return ''
      const body = groups
        .map((g) => `<div class="shelf"><h3>${esc(g.shelf.label)}</h3><div class="chips">${g.items.map((it) => chip(it, editing)).join('')}</div></div>`)
        .join('')
      return `<section class="kind"><h2>${KIND_LABEL[kind]}</h2>${body}</section>`
    })
    .join('')
  const hint = editing ? '× をタップで削除' : '長押しで「切らした」／切らしたものはタップで戻す'
  return `<div class="bar"><p class="hint">${hint}</p><button type="button" class="ghost" data-action="toggleEdit">${editing ? '完了' : '編集'}</button></div>${kinds}`
}

export const shelfActions = {
  toggleEdit(app) {
    app.update((a) => {
      a.ui.editing = !a.ui.editing
    })
  },
  tapItem(app, el) {
    const it = app.state.items.find((i) => i.id === el.dataset.id)
    if (!it) return
    if (it.outOfStock) {
      app.update((a) => {
        a.state.items = toggleOut(a.state.items, it.id)
      })
      app.toast(`${it.name} を戻しました`)
    } else {
      app.toast('長押しで「切らした」にできます')
    }
  },
  longItem(app, el) {
    const it = app.state.items.find((i) => i.id === el.dataset.id)
    if (!it) return
    app.update((a) => {
      a.state.items = toggleOut(a.state.items, it.id)
    })
    app.toast(it.outOfStock ? `${it.name} を戻しました` : `${it.name} を切らしたにしました`)
  },
  deleteItem(app, el) {
    app.update((a) => {
      a.state.items = removeItem(a.state.items, el.dataset.id)
    })
  },
}
