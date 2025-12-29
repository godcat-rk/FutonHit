import { create } from 'zustand'
import type { GameState, Player, AnswerHistory } from '../types/game'

interface GameStore extends GameState {
  setAnswer: (answer: number[]) => void
  addPlayer: (player: Player) => void
  setCurrentTurn: (turn: number) => void
  addHistory: (history: AnswerHistory) => void
  setGameStatus: (status: GameState['gameStatus']) => void
  setWinner: (winner: string) => void
  resetGame: () => void
}

const initialState: GameState = {
  answer: [],
  players: [],
  currentTurn: 0,
  history: [],
  gameStatus: 'waiting',
  winner: null,
}

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,
  setAnswer: (answer) => set({ answer }),
  addPlayer: (player) => set((state) => ({ players: [...state.players, player] })),
  setCurrentTurn: (turn) => set({ currentTurn: turn }),
  addHistory: (history) => set((state) => ({ history: [...state.history, history] })),
  setGameStatus: (status) => set({ gameStatus: status }),
  setWinner: (winner) => set({ winner }),
  resetGame: () => set(initialState),
}))
