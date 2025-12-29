// アイコンと数字のマッピング
const BASE_PATH = import.meta.env.BASE_URL || '/'

export const ICON_MAPPING = {
  1: { name: 'neko', path: `${BASE_PATH}icons/neko.png`, label: 'ねこ' },
  2: { name: 'hana', path: `${BASE_PATH}icons/hana.png`, label: 'はな' },
  3: { name: 'tama', path: `${BASE_PATH}icons/tama.png`, label: 'たま' },
  4: { name: 'bitou', path: `${BASE_PATH}icons/bitou.png`, label: 'びとう' },
  5: { name: 'omaru', path: `${BASE_PATH}icons/omaru.png`, label: 'おまる' },
  6: { name: 'oeru', path: `${BASE_PATH}icons/oeru.png`, label: 'おえる' },
} as const

export type IconNumber = 1 | 2 | 3 | 4 | 5 | 6

export const getIconPath = (num: number): string => {
  if (num < 1 || num > 6) {
    console.warn(`Invalid icon number: ${num}. Using default.`)
    return ICON_MAPPING[1].path
  }
  return ICON_MAPPING[num as IconNumber].path
}

export const getIconLabel = (num: number): string => {
  if (num < 1 || num > 6) {
    return ''
  }
  return ICON_MAPPING[num as IconNumber].label
}

export const TOTAL_ICONS = 6
