export type GameStatus = 'lobby' | 'preparing' | 'playing' | 'finished'

export type Difficulty = 'easy' | 'normal' | 'hard'

export interface Player {
  id: string
  name: string
  answerCount: number
  isCorrect: boolean
  isHost: boolean
  isSpectator: boolean
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
  roomHost: string | null
  currentPlayerId: string | null
  difficulty: Difficulty
}
