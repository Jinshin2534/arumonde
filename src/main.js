import './style.css'
import { loadState, saveState } from './lib/storage.js'
import { shelfView, shelfActions } from './ui/shelf.js'
import { addView, addList, addActions } from './ui/add.js'
import { searchView, searchActions, currentPrompt } from './ui/search.js'

const VIEWS = { shelf: shelfView, add: addView, search: searchView }
const ACTIONS = {
  ...shelfActions,
  ...addActions,
  ...searchActions,
  goTab(app, el) {
    app.setTab(el.dataset.tab)
  },
}
const LONG_PRESS_MS = 500

const view = document.getElementById('view')
const tabs = document.getElementById('tabs')
const toastEl = document.getElementById('toast')

const state = loadState(localStorage)
let toastTimer = null

const app = {
  state,
  ui: { tab: state.items.length ? 'search' : 'add', pick: {}, editing: false, query: '', promptDraft: null },
  update(fn) {
    fn(app)
    saveState(localStorage, app.state)
    render()
  },
  setTab(tab) {
    if (!VIEWS[tab]) return
    app.ui.tab = tab
    app.ui.editing = false
    render()
    window.scrollTo(0, 0)
  },
  toast(msg) {
    toastEl.textContent = msg
    toastEl.classList.add('show')
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600)
  },
  // 検証用
  currentPrompt: () => currentPrompt(app),
}
window.__app = app

// 質問文の欄は中身に合わせて伸ばす
function fitPrompt() {
  const ta = document.getElementById('prompt')
  if (!ta) return
  ta.style.height = 'auto'
  ta.style.height = `${ta.scrollHeight + 2}px`
}

function render() {
  view.innerHTML = VIEWS[app.ui.tab](app)
  fitPrompt()
  for (const b of tabs.querySelectorAll('button')) {
    if (b.dataset.tab === app.ui.tab) b.setAttribute('aria-current', 'page')
    else b.removeAttribute('aria-current')
  }
}

tabs.addEventListener('click', (e) => {
  const b = e.target.closest('[data-tab]')
  if (b) app.setTab(b.dataset.tab)
})

// 長押しの直後に来る click は捨てる
let suppressClick = false
let pressTimer = null
let lastPointer = 'mouse'

view.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]')
  if (!el || el.disabled) return
  if (suppressClick) {
    suppressClick = false
    return
  }
  ACTIONS[el.dataset.action]?.(app, el)
})

view.addEventListener('input', (e) => {
  const el = e.target
  if (el.dataset.input === 'query') {
    app.ui.query = el.value
    document.getElementById('addList').innerHTML = addList(app)
  } else if (el.dataset.input === 'prompt') {
    app.ui.promptDraft = el.value
    document.getElementById('draftNote').hidden = false
    fitPrompt()
  }
})

const cancelPress = () => {
  clearTimeout(pressTimer)
  pressTimer = null
}

view.addEventListener('pointerdown', (e) => {
  lastPointer = e.pointerType
  suppressClick = false
  const el = e.target.closest('[data-longpress]')
  if (!el || e.button !== 0) return
  cancelPress()
  pressTimer = setTimeout(() => {
    pressTimer = null
    suppressClick = true
    navigator.vibrate?.(15)
    shelfActions.longItem(app, el)
  }, LONG_PRESS_MS)
})
for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) view.addEventListener(ev, cancelPress)

// タッチの長押しで出るメニューは止める。マウスは右クリックを長押しの代わりにする
view.addEventListener('contextmenu', (e) => {
  const el = e.target.closest('[data-longpress]')
  if (!el) return
  e.preventDefault()
  if (lastPointer === 'mouse') shelfActions.longItem(app, el)
})

render()

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {})
}
