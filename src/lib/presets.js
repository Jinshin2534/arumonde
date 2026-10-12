import { fold } from './normalize.js'

export const KINDS = ['seasoning', 'ingredient']

export const SHELVES = [
  { id: 'basic', label: 'さしすせそ', kind: 'seasoning' },
  { id: 'western', label: '洋風', kind: 'seasoning' },
  { id: 'asian', label: '中華・エスニック', kind: 'seasoning' },
  { id: 'spice', label: '香辛料・薬味', kind: 'seasoning' },
  { id: 'oilflour', label: '油・粉', kind: 'seasoning' },
  { id: 'other_s', label: 'その他の調味料', kind: 'seasoning' },
  { id: 'meat', label: '肉', kind: 'ingredient' },
  { id: 'fish', label: '魚介', kind: 'ingredient' },
  { id: 'veg', label: '野菜', kind: 'ingredient' },
  { id: 'mushroom', label: 'きのこ', kind: 'ingredient' },
  { id: 'eggdairy', label: '卵・乳・大豆', kind: 'ingredient' },
  { id: 'pantry', label: '乾物・缶詰', kind: 'ingredient' },
  { id: 'staple', label: '主食', kind: 'ingredient' },
  { id: 'other_i', label: 'その他の食材', kind: 'ingredient' },
]

const group = (kind, shelf, rows) => rows.map(([name, ...aliases]) => ({ name, kind, shelf, aliases }))

export const PRESETS = [
  ...group('seasoning', 'basic', [
    ['砂糖', 'さとう', '上白糖'], ['塩', 'しお', '食塩'], ['酢', 'す', '米酢', '穀物酢'],
    ['醤油', 'しょうゆ', 'しょう油', '濃口醤油'], ['味噌', 'みそ'], ['みりん', '本みりん', '味醂'],
    ['料理酒', '酒', '日本酒'], ['薄口醤油', 'うすくち醤油'], ['白だし'], ['めんつゆ'],
    ['ポン酢', 'ぽんず'], ['顆粒だし', 'だしの素', '和風だし'], ['はちみつ', '蜂蜜'],
  ]),
  ...group('seasoning', 'western', [
    ['ケチャップ', 'トマトケチャップ'], ['マヨネーズ', 'マヨ'], ['ウスターソース'], ['中濃ソース'],
    ['とんかつソース'], ['コンソメ', '顆粒コンソメ'], ['バター'], ['粒マスタード', 'マスタード'],
    ['ワインビネガー'], ['デミグラスソース'],
  ]),
  ...group('seasoning', 'asian', [
    ['鶏がらスープの素', '鶏ガラスープの素', '鶏ガラ'], ['オイスターソース'], ['豆板醤'], ['甜麺醤'],
    ['コチュジャン'], ['ごま油', '胡麻油'], ['ナンプラー'], ['ラー油'], ['紹興酒'],
    ['中華だし', '中華スープの素'],
  ]),
  ...group('seasoning', 'spice', [
    ['こしょう', '胡椒'], ['黒こしょう', 'ブラックペッパー'], ['一味唐辛子', '一味'],
    ['七味唐辛子', '七味'], ['カレー粉'], ['カレールウ', 'カレールー'],
    ['おろしにんにく', 'にんにくチューブ'], ['おろし生姜', 'しょうがチューブ', '生姜チューブ'],
    ['わさび'], ['からし', '辛子', '練りからし'], ['柚子胡椒', 'ゆずこしょう'], ['山椒'],
    ['クミン'], ['パプリカパウダー'], ['ローリエ'],
  ]),
  ...group('seasoning', 'oilflour', [
    ['サラダ油', '油'], ['オリーブオイル'], ['小麦粉', '薄力粉'], ['片栗粉'], ['パン粉'],
    ['天ぷら粉'], ['白ごま', 'ごま', 'いりごま'],
  ]),
  ...group('ingredient', 'meat', [
    ['鶏もも肉', '鶏もも'], ['鶏むね肉', '鶏むね'], ['ささみ'], ['手羽先'], ['手羽元'],
    ['豚バラ肉', '豚バラ'], ['豚こま切れ肉', '豚こま'], ['豚ロース'], ['豚ひき肉'],
    ['牛こま切れ肉', '牛こま'], ['牛ひき肉'], ['合いびき肉', '合挽き肉', '合い挽き肉'],
    ['ベーコン'], ['ハム'], ['ウインナー', 'ソーセージ', 'ウィンナー'],
  ]),
  ...group('ingredient', 'fish', [
    ['鮭', 'さけ', 'しゃけ', 'サーモン'], ['さば', '鯖'], ['ぶり', '鰤'], ['たら', '鱈'],
    ['えび', '海老'], ['いか'], ['あさり'], ['しらす'], ['ちくわ'], ['かにかま'],
  ]),
  ...group('ingredient', 'veg', [
    ['玉ねぎ', 'たまねぎ', '玉葱'], ['にんじん', '人参'], ['じゃがいも'], ['キャベツ'], ['白菜'],
    ['大根'], ['もやし'], ['ピーマン'], ['なす', '茄子'], ['トマト'], ['ミニトマト'],
    ['きゅうり', '胡瓜'], ['ほうれん草'], ['小松菜'], ['ブロッコリー'], ['長ねぎ', 'ねぎ'],
    ['青ねぎ', '小ねぎ', '万能ねぎ'], ['レタス'], ['かぼちゃ'], ['さつまいも'], ['ごぼう'],
    ['れんこん'], ['にんにく'], ['しょうが', '生姜'], ['大葉', 'しそ'], ['ニラ'], ['アボカド'],
  ]),
  ...group('ingredient', 'mushroom', [
    ['しめじ'], ['えのき', 'えのきだけ'], ['しいたけ', '椎茸'], ['エリンギ'], ['まいたけ', '舞茸'],
  ]),
  ...group('ingredient', 'eggdairy', [
    ['卵', 'たまご', '玉子'], ['牛乳'], ['ピザ用チーズ', 'とろけるチーズ'], ['スライスチーズ'],
    ['粉チーズ'], ['生クリーム'], ['ヨーグルト'], ['豆腐', '木綿豆腐', '絹豆腐'],
    ['油揚げ', 'あぶらあげ'], ['厚揚げ'], ['納豆'],
  ]),
  ...group('ingredient', 'pantry', [
    ['ツナ缶', 'ツナ'], ['トマト缶', 'カットトマト'], ['サバ缶'], ['コーン缶', 'コーン'],
    ['わかめ'], ['ひじき'], ['切り干し大根'], ['春雨'], ['かつお節', '鰹節', 'おかか'],
    ['昆布'], ['のり', '海苔'], ['こんにゃく'],
  ]),
  ...group('ingredient', 'staple', [
    ['米', 'ごはん', 'ご飯', '白米'], ['パスタ', 'スパゲッティ'], ['うどん'], ['そば'],
    ['中華麺', '焼きそば麺', 'ラーメン'], ['そうめん'], ['食パン'], ['餅', 'もち'],
  ]),
]

const INDEX = new Map()
for (const p of PRESETS) for (const n of [p.name, ...p.aliases]) INDEX.set(fold(n), p)

export function findPreset(name) {
  return INDEX.get(fold(name)) ?? null
}

// 重複判定のキー。別名は正規名に寄せる
export function canonicalKey(name) {
  const p = findPreset(name)
  return fold(p ? p.name : name)
}

export function shelfFor(kind, shelf) {
  const s = SHELVES.find((x) => x.id === shelf)
  if (s && s.kind === kind) return s.id
  return kind === 'seasoning' ? 'other_s' : 'other_i'
}
