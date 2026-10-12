// 名前の表記ゆれを畳む: NFKC → 空白除去 → カタカナをひらがな → 小文字
export function fold(name) {
  return String(name ?? '')
    .normalize('NFKC')
    .replace(/\s+/g, '')
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .toLowerCase()
}
