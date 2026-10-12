const enc = encodeURIComponent

export const TARGETS = [
  { id: 'chatgpt', label: 'ChatGPT', type: 'ai', build: ({ prompt }) => `https://chatgpt.com/?q=${enc(prompt)}` },
  { id: 'claude', label: 'Claude', type: 'ai', build: ({ prompt }) => `https://claude.ai/new?q=${enc(prompt)}` },
  { id: 'perplexity', label: 'Perplexity', type: 'ai', build: ({ prompt }) => `https://www.perplexity.ai/search?q=${enc(prompt)}` },
  // Gemini は URL で文を渡せないので、コピーしてから開く
  { id: 'gemini', label: 'Gemini', type: 'ai', copy: true, build: () => 'https://gemini.google.com/app' },
  { id: 'cookpad', label: 'クックパッド', type: 'site', build: ({ keywords }) => `https://cookpad.com/jp/search/${enc(keywords.join(' '))}` },
  { id: 'google', label: 'Google', type: 'site', build: ({ keywords }) => `https://www.google.com/search?q=${enc([...keywords, 'レシピ'].join(' '))}` },
]

export function getTarget(id) {
  return TARGETS.find((t) => t.id === id) ?? null
}

export function handoffUrl(target, { prompt = '', keywords = [] } = {}) {
  if (!target) return null
  if (target.type === 'site' && !keywords.length) return null
  return target.build({ prompt, keywords })
}
