import { describe, it, expect } from 'vitest'
import { fold } from '../src/lib/normalize.js'

describe('fold', () => {
  it('カタカナをひらがなに寄せる', () => expect(fold('ショウユ')).toBe('しょうゆ'))
  it('全角英数と空白を畳む', () => expect(fold(' ＡＢＣ　ソース ')).toBe('abcそーす'))
  it('null/undefined は空文字', () => {
    expect(fold(null)).toBe('')
    expect(fold(undefined)).toBe('')
  })
})
