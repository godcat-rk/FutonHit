// アイコンと数字のマッピング
import type { Difficulty } from '../types/game'

const BASE_PATH = import.meta.env.BASE_URL || '/'

export const ICON_MAPPING = {
  1: { name: 'neko', path: `${BASE_PATH}icons/neko.png`, label: 'ねこ' },
  2: { name: 'hana', path: `${BASE_PATH}icons/hana.png`, label: 'はな' },
  3: { name: 'tama', path: `${BASE_PATH}icons/tama.png`, label: 'たま' },
  4: { name: 'bitou', path: `${BASE_PATH}icons/bitou.png`, label: 'びとう' },
  5: { name: 'omaru', path: `${BASE_PATH}icons/omaru.png`, label: 'おまる' },
  6: { name: 'oeru', path: `${BASE_PATH}icons/oeru.png`, label: 'おえる' },
  7: { name: 'rukario', path: `${BASE_PATH}icons/rukario.png`, label: 'るかりお' },
  8: { name: 'shari', path: `${BASE_PATH}icons/shari.png`, label: 'しゃり' },
  9: { name: 'tororo', path: `${BASE_PATH}icons/tororo.png`, label: 'とろろ' },
  10: { name: 'yatyunri', path: `${BASE_PATH}icons/yatyunri.png`, label: 'やちゅんり' },
} as const

export type IconNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export const getIconPath = (num: number): string => {
  if (num < 1 || num > 10) {
    console.warn(`Invalid icon number: ${num}. Using default.`)
    return ICON_MAPPING[1].path
  }
  return ICON_MAPPING[num as IconNumber].path
}

export const getIconLabel = (num: number): string => {
  if (num < 1 || num > 10) {
    return ''
  }
  return ICON_MAPPING[num as IconNumber].label
}

export const TOTAL_ICONS = 10

export const getIconCountByDifficulty = (difficulty: Difficulty): number => {
  switch (difficulty) {
    case 'easy':
      return 6
    case 'normal':
      return 10
    case 'hard':
      return 14
    default:
      return 10
  }
}
