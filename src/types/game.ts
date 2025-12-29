export type GameStatus = 'waiting' | 'playing' | 'finished'

export interface Player {
  id: string
  name: string
  answerCount: number
  isCorrect: boolean
}

export interface AnswerHistory {
  playerId: string
  playerName: string
  guess: number[]
  hit: number
  blow: number
  timestamp: number
}

export interface GameState {
  answer: number[]
  players: Player[]
  currentTurn: number
  history: AnswerHistory[]
  gameStatus: GameStatus
  winner: string | null
}
