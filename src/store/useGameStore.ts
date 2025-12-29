import { create } from 'zustand'
import type { GameState, Player, AnswerHistory } from '../types/game'
import { generateAnswer } from '../utils/gameLogic'

interface GameStore extends GameState {
  setAnswer: (answer: number[]) => void
  addPlayer: (player: Player) => void
  removePlayer: (playerId: string) => void
  setCurrentTurn: (turn: number) => void
  addHistory: (history: AnswerHistory) => void
  setGameStatus: (status: GameState['gameStatus']) => void
  setWinner: (winner: string) => void
  setRoomHost: (hostId: string | null) => void
  setCurrentPlayerId: (playerId: string | null) => void
  createRoom: (hostId: string) => void
  startGame: () => void
  resetGame: () => void
  syncGameState: (state: Partial<GameState>) => void
  setPlayers: (players: Player[]) => void
  setHistory: (history: AnswerHistory[]) => void
}

const initialState: GameState = {
  answer: [],
  players: [],
  currentTurn: 0,
  history: [],
  gameStatus: 'lobby',
  winner: null,
  roomHost: null,
  currentPlayerId: null,
}

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,
  setAnswer: (answer) => set({ answer }),
  addPlayer: (player) => set((state) => ({ players: [...state.players, player] })),
  removePlayer: (playerId) =>
    set((state) => ({ players: state.players.filter(p => p.id !== playerId) })),
  setCurrentTurn: (turn) => set({ currentTurn: turn }),
  addHistory: (history) => set((state) => ({ history: [...state.history, history] })),
  setGameStatus: (status) => set({ gameStatus: status }),
  setWinner: (winner) => set({ winner }),
  setRoomHost: (hostId) => set({ roomHost: hostId }),
  setCurrentPlayerId: (playerId) => set({ currentPlayerId: playerId }),
  setPlayers: (players) => set({ players }),
  setHistory: (history) => set({ history }),

  createRoom: (hostId) => set({
    gameStatus: 'preparing',
    roomHost: hostId
  }),

  startGame: () => set({
    gameStatus: 'playing',
    answer: generateAnswer(),
    currentTurn: 0,
    history: []
  }),

  resetGame: () => set({
    ...initialState,
    players: [],
  }),

  syncGameState: (state) => set((current) => ({ ...current, ...state })),
}))
