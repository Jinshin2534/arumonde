export const SERVINGS = [1, 2, 3, 4]
export const TIMES = [
  { id: 15, label: '15分以内' },
  { id: 30, label: '30分以内' },
]
export const MOODS = [
  { id: 'light', label: 'さっぱり', adj: 'さっぱりした' },
  { id: 'hearty', label: 'がっつり', adj: 'がっつりした' },
  { id: 'warm', label: 'あったか', adj: '体があたたまる' },
  { id: 'healthy', label: 'ヘルシー', adj: 'ヘルシーな' },
]
export const MAX_ENCODED = 6000
export const CLOSING =
  'これ以外の材料を使う場合は「要買い足し」と明記してください。各案に材料と分量、手順を簡潔にお願いします。'

function requestLine({ starred, servings, time, moods }) {
  const parts = []
  if (starred.length) parts.push(`${starred.join('と')}を必ず使った`)
  const t = TIMES.find((x) => x.id === time)
  if (servings && t) parts.push(`${servings}人分・${t.label}で作れる`)
  else if (servings) parts.push(`${servings}人分の`)
  else if (t) parts.push(`${t.label}で作れる`)
  const adj = MOODS.filter((m) => moods.includes(m.id)).map((m) => m.adj)
  if (adj.length) parts.push(adj.join('、'))
  return `${parts.join('、')}晩ごはんのレシピを3案ください。`
}

function compose(input, others, seasonings, cut) {
  const lines = [requestLine(input)]
  if (!input.starred.length && !input.others.length) {
    lines.push('食材は特に指定しません。調味料だけで作れるもの、または少しの買い足しで作れるものでお願いします。')
  }
  if (others.length || cut.others) {
    const label = input.starred.length ? '他に使ってよい食材' : '使ってよい食材'
    lines.push(`${label}：${[...others, ...(cut.others ? ['ほか'] : [])].join('、')}`)
  }
  if (seasonings.length || cut.seasonings) {
    lines.push(`使ってよい調味料：${[...seasonings, ...(cut.seasonings ? ['ほか基本調味料'] : [])].join('、')}`)
  }
  lines.push(CLOSING)
  return lines.join('\n')
}

export function buildPrompt(input = {}, { maxEncoded = MAX_ENCODED } = {}) {
  const inp = { starred: [], others: [], seasonings: [], servings: null, time: null, moods: [], ...input }
  const others = [...inp.others]
  const seasonings = [...inp.seasonings]
  const cut = { others: false, seasonings: false }
  let text = compose(inp, others, seasonings, cut)
  // URL に載る長さに収める。★と条件は削らない
  while (encodeURIComponent(text).length > maxEncoded) {
    if (seasonings.length) {
      seasonings.pop()
      cut.seasonings = true
    } else if (others.length) {
      others.pop()
      cut.others = true
    } else break
    text = compose(inp, others, seasonings, cut)
  }
  return text
}

export function buildKeywords({ starred = [], others = [] } = {}) {
  return starred.length ? [...starred] : others.slice(0, 3)
}
