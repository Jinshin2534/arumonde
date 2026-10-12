import { describe, it, expect } from 'vitest'
import { TARGETS, getTarget, handoffUrl } from '../src/lib/handoff.js'

const prompt = '鶏もも肉を必ず使った晩ごはん\n醤油、みりん&塩'
const url = (id, kw = ['鶏もも肉', '卵']) => handoffUrl(getTarget(id), { prompt, keywords: kw })

describe('handoffUrl', () => {
  it.each([
    ['chatgpt', 'https://chatgpt.com/?q='],
    ['claude', 'https://claude.ai/new?q='],
    ['perplexity', 'https://www.perplexity.ai/search?q='],
  ])('%s は質問文をそのまま渡す', (id, prefix) => {
    const u = url(id)
    expect(u.startsWith(prefix)).toBe(true)
    expect(decodeURIComponent(u.slice(prefix.length))).toBe(prompt)
  })
  it('gemini はコピー方式で固定URL', () => {
    expect(getTarget('gemini').copy).toBe(true)
    expect(url('gemini')).toBe('https://gemini.google.com/app')
  })
  it('cookpad はキーワードをパスに', () => {
    expect(url('cookpad')).toBe(`https://cookpad.com/jp/search/${encodeURIComponent('鶏もも肉 卵')}`)
  })
  it('google は「レシピ」を足す', () => {
    expect(url('google')).toBe(`https://www.google.com/search?q=${encodeURIComponent('鶏もも肉 卵 レシピ')}`)
  })
  it('サイトはキーワードが空なら null', () => {
    expect(url('cookpad', [])).toBeNull()
    expect(url('google', [])).toBeNull()
  })
  it('AI とサイトが両方ある', () => {
    expect(TARGETS.filter((t) => t.type === 'ai').length).toBe(4)
    expect(TARGETS.filter((t) => t.type === 'site').length).toBe(2)
  })
  it('未知の id は null', () => expect(getTarget('x')).toBeNull())
})
