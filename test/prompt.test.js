import { describe, it, expect } from 'vitest'
import { buildPrompt, buildKeywords, CLOSING, MAX_ENCODED } from '../src/lib/prompt.js'

describe('buildPrompt', () => {
  it('全部入りの文', () => {
    const text = buildPrompt({
      starred: ['鶏もも肉'], others: ['玉ねぎ', 'しめじ'], seasonings: ['醤油', 'みりん'],
      servings: 2, time: 30, moods: ['light'],
    })
    expect(text).toBe(
      '鶏もも肉を必ず使った、2人分・30分以内で作れる、さっぱりした晩ごはんのレシピを3案ください。\n' +
        '他に使ってよい食材：玉ねぎ、しめじ\n' +
        '使ってよい調味料：醤油、みりん\n' + CLOSING,
    )
  })
  it('食材なしは調味料だけで作る依頼になる', () => {
    const t = buildPrompt({ seasonings: ['塩'] })
    expect(t).toContain('調味料だけで')
    expect(t).not.toContain('食材：')
  })
  it('★だけなら「他に」の行は出ない', () => {
    expect(buildPrompt({ starred: ['卵'] })).not.toContain('他に使ってよい食材')
  })
  it('★なしの食材は「使ってよい食材」', () => {
    const t = buildPrompt({ others: ['卵'] })
    expect(t).toContain('\n使ってよい食材：卵')
    expect(t).not.toContain('必ず')
  })
  it('調味料なしなら調味料の行を省く', () => expect(buildPrompt({ others: ['卵'] })).not.toContain('調味料：'))
  it('人数だけ → 「2人分の」', () => expect(buildPrompt({ servings: 2 })).toMatch(/^2人分の晩ごはん/))
  it('時間だけ → 「15分以内で作れる」', () => expect(buildPrompt({ time: 15 })).toMatch(/^15分以内で作れる晩ごはん/))
  it('何もなし', () => expect(buildPrompt({})).toMatch(/^晩ごはんのレシピを3案ください。/))

  it('総当たりで文が崩れない', () => {
    const many = (p, n) => Array.from({ length: n }, (_, i) => `${p}${i}`)
    for (const starred of [[], ['鶏もも肉'], ['鶏もも肉', '卵']])
      for (const others of [[], ['玉ねぎ'], many('野菜', 30)])
        for (const seasonings of [[], ['醤油'], many('調味料', 60)])
          for (const servings of [null, 2])
            for (const time of [null, 30])
              for (const moods of [[], ['light', 'warm']]) {
                const t = buildPrompt({ starred, others, seasonings, servings, time, moods })
                expect(t).toContain('3案ください。')
                expect(t.endsWith(CLOSING)).toBe(true)
                expect(t).not.toMatch(/undefined|null|、、|、晩|：\n/)
                for (const s of starred) expect(t).toContain(s)
                expect(encodeURIComponent(t).length).toBeLessThanOrEqual(MAX_ENCODED)
              }
  })
  it('長すぎると調味料から削り「ほか基本調味料」で締める。★と条件は残る', () => {
    const seasonings = Array.from({ length: 500 }, (_, i) => `調味料${i}`)
    const t = buildPrompt({ starred: ['鶏もも肉'], others: ['玉ねぎ'], seasonings, servings: 2 })
    expect(encodeURIComponent(t).length).toBeLessThanOrEqual(MAX_ENCODED)
    expect(t).toContain('ほか基本調味料')
    expect(t).toContain('鶏もも肉を必ず使った')
    expect(t).toContain('2人分')
    expect(t).toContain('玉ねぎ')
  })
  it('調味料を削っても足りなければ食材も削る', () => {
    const others = Array.from({ length: 800 }, (_, i) => `食材${i}`)
    const t = buildPrompt({ others, seasonings: ['塩'] })
    expect(encodeURIComponent(t).length).toBeLessThanOrEqual(MAX_ENCODED)
    expect(t).toContain('ほか基本調味料')
    expect(t).toMatch(/食材\d+、ほか\n/)
  })
})

describe('buildKeywords', () => {
  it('★があれば★だけ', () => expect(buildKeywords({ starred: ['鮭'], others: ['卵'] })).toEqual(['鮭']))
  it('なければ先頭3つ', () => expect(buildKeywords({ starred: [], others: ['a', 'b', 'c', 'd'] })).toEqual(['a', 'b', 'c']))
  it('空なら空', () => expect(buildKeywords({})).toEqual([]))
})
