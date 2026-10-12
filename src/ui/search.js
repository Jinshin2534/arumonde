import { inStock } from '../lib/pantry.js'
import { buildPrompt, buildKeywords, SERVINGS, TIMES, MOODS } from '../lib/prompt.js'
import { TARGETS, getTarget, handoffUrl } from '../lib/handoff.js'
import { esc } from './html.js'

const MAX_STARS = 2

export function selection(app) {
  const ings = inStock(app.state.items, 'ingredient')
  return {
    ings,
    starred: ings.filter((i) => app.ui.pick[i.id] === 'star').map((i) => i.name),
    others: ings.filter((i) => app.ui.pick[i.id] === 'on').map((i) => i.name),
    seasonings: inStock(app.state.items, 'seasoning').map((i) => i.name),
  }
}

export function generatedPrompt(app) {
  const { starred, others, seasonings } = selection(app)
  return buildPrompt({ starred, others, seasonings, ...app.state.prefs })
}

export function currentPrompt(app) {
  return app.ui.promptDraft ?? generatedPrompt(app)
}

const opt = (action, v, on, label) =>
  `<button type="button" class="chip${on ? ' on' : ''}" data-action="${action}" data-v="${v}" aria-pressed="${on}">${esc(label)}</button>`

export function searchView(app) {
  const s = selection(app)
  const { servings, time, moods } = app.state.prefs

  const ingChips = s.ings.length
    ? `<div class="chips">${s.ings
        .map((i) => {
          const p = app.ui.pick[i.id]
          const cls = p === 'star' ? ' star' : p === 'on' ? ' on' : ''
          return `<button type="button" class="chip${cls}" data-action="pick" data-id="${esc(i.id)}" aria-pressed="${Boolean(p)}">${p === 'star' ? '★ ' : ''}${esc(i.name)}</button>`
        })
        .join('')}</div>`
    : `<p class="muted">食材が登録されていません。調味料だけで探せます。<button type="button" class="ghost" data-action="goTab" data-tab="add">食材を登録</button></p>`

  const keywords = buildKeywords(s)
  const ai = TARGETS.filter((t) => t.type === 'ai')
    .map((t) => `<button type="button" class="go ai" data-action="send" data-target="${t.id}">${esc(t.label)}${t.copy ? '<small>コピーして開く</small>' : ''}</button>`)
    .join('')
  const sites = TARGETS.filter((t) => t.type === 'site')
    .map((t) => `<button type="button" class="go" data-action="send" data-target="${t.id}"${keywords.length ? '' : ' disabled'}>${esc(t.label)}</button>`)
    .join('')

  return `<section><h2>今日つかう食材<small>タップで選ぶ → もう一度で ★必ず使う（${MAX_STARS}つまで）</small></h2>${ingChips}</section>
<section><h2>条件</h2>
  <div class="row"><span>人数</span><div class="chips">${SERVINGS.map((n) => opt('setServings', n, servings === n, `${n}人分`)).join('')}</div></div>
  <div class="row"><span>時間</span><div class="chips">${TIMES.map((t) => opt('setTime', t.id, time === t.id, t.label)).join('')}${opt('setTime', '', time == null, 'こだわらない')}</div></div>
  <div class="row"><span>気分</span><div class="chips">${MOODS.map((m) => opt('toggleMood', m.id, moods.includes(m.id), m.label)).join('')}</div></div>
</section>
<section><h2>質問文<small>このまま送られます。書き換えてもOK</small></h2>
  <textarea id="prompt" data-input="prompt" rows="8" aria-label="質問文">${esc(currentPrompt(app))}</textarea>
  <p class="note" id="draftNote"${app.ui.promptDraft == null ? ' hidden' : ''}>書き換え中です。食材や条件を変えると作り直します。</p>
</section>
<section><h2>AIにきく</h2><div class="targets">${ai}</div></section>
<section><h2>レシピサイトでさがす<small>${keywords.length ? `キーワード：${esc(keywords.join(' '))}` : '食材を選ぶとさがせます'}</small></h2><div class="targets">${sites}</div></section>`
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = Object.assign(document.createElement('textarea'), { value: text })
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.append(ta)
    ta.select()
    const ok = document.execCommand?.('copy') ?? false
    ta.remove()
    return ok
  }
}

// 条件が変わったら手編集は捨てて作り直す
const changePrefs = (app, fn) =>
  app.update((a) => {
    fn(a.state.prefs)
    a.ui.promptDraft = null
  })

export const searchActions = {
  pick(app, el) {
    const id = el.dataset.id
    const cur = app.ui.pick[id]
    const stars = selection(app).starred.length
    let next
    if (!cur) next = 'on'
    else if (cur === 'on') {
      if (stars < MAX_STARS) next = 'star'
      else app.toast(`★は${MAX_STARS}つまでです`)
    }
    app.update((a) => {
      if (next) a.ui.pick[id] = next
      else delete a.ui.pick[id]
      a.ui.promptDraft = null
    })
  },
  setServings(app, el) {
    const v = Number(el.dataset.v)
    changePrefs(app, (p) => {
      p.servings = p.servings === v ? null : v
    })
  },
  setTime(app, el) {
    const v = el.dataset.v === '' ? null : Number(el.dataset.v)
    changePrefs(app, (p) => {
      p.time = v
    })
  },
  toggleMood(app, el) {
    const id = el.dataset.v
    changePrefs(app, (p) => {
      p.moods = p.moods.includes(id) ? p.moods.filter((m) => m !== id) : [...p.moods, id]
    })
  },
  send(app, el) {
    const target = getTarget(el.dataset.target)
    const prompt = document.getElementById('prompt')?.value ?? currentPrompt(app)
    const url = handoffUrl(target, { prompt, keywords: buildKeywords(selection(app)) })
    if (!url) return
    window.open(url, '_blank', 'noopener')
    if (target.copy) {
      copyText(prompt).then((ok) =>
        app.toast(ok ? `質問文をコピーしました。${target.label}に貼り付けてください` : 'コピーできませんでした。質問文を選んでコピーしてください'),
      )
    }
  },
}
