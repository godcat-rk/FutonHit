import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { useAbly } from '../hooks/useAbly'

const GAME_CHANNEL = 'futonhit-game'

const LobbyPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const routeState = location.state as { name?: string } | undefined
  const persistedName = typeof localStorage !== 'undefined' ? localStorage.getItem('playerName') : null
  const persistedPlayerId = typeof localStorage !== 'undefined' ? localStorage.getItem('playerId') : null
  const name = routeState?.name || persistedName || ''
  const initialized = useRef(false)
  const { publish, subscribe, unsubscribe } = useAbly(GAME_CHANNEL)

  const {
    players,
    gameStatus,
    roomHost,
    currentPlayerId,
    addPlayer,
    removePlayer,
    createRoom,
    startGame,
    setCurrentPlayerId,
    setGameStatus,
    setRoomHost,
    setAnswer,
    setCurrentTurn,
    setHistory,
  } = useGameStore()

  const isHost = currentPlayerId === roomHost
  const currentPlayer = players.find((p) => p.id === currentPlayerId)

  useEffect(() => {
    // イベント購読を最優先でセット
    const handlePlayerJoin = (message: any) => {
      const player = message.data
      const currentState = useGameStore.getState()
      if (player.id === currentState.currentPlayerId) return
      if (currentState.players.some((p) => p.id === player.id)) return
      addPlayer(player)
    }

    const handlePlayerRequestSync = (message: any) => {
      const { requesterId } = message.data
      const currentState = useGameStore.getState()
      // 自分からのリクエストは無視
      if (requesterId === currentState.currentPlayerId) return

      // 他のプレイヤーからのリクエストには応答
      publish('player:sync-response', {
        players: currentState.players,
        gameStatus: currentState.gameStatus,
        roomHost: currentState.roomHost,
      })
    }

    const handlePlayerSyncResponse = (message: any) => {
      const { players: syncedPlayers, gameStatus: syncedStatus, roomHost: syncedHost } = message.data
      const currentState = useGameStore.getState()

      syncedPlayers.forEach((player: any) => {
        if (player.id !== currentState.currentPlayerId && !currentState.players.some((p) => p.id === player.id)) {
          addPlayer(player)
        }
      })

      if (syncedStatus && syncedStatus !== 'lobby') {
        setGameStatus(syncedStatus)
        if (syncedStatus === 'playing' || syncedStatus === 'preparing') {
          const me = currentState.players.find((p) => p.id === currentState.currentPlayerId)
          if (me) {
            me.isSpectator = true
          }
        }
      }
      if (syncedHost) {
        setRoomHost(syncedHost)
      }
    }

    const handleRoomCreated = (message: any) => {
      const { hostId, playerOrder } = message.data
      const state = useGameStore.getState()

      // すでに他のホストが存在する場合は無視（1部屋のみ）
      if (state.roomHost && state.roomHost !== hostId) {
        return
      }

      setGameStatus('preparing')
      setRoomHost(hostId)

      if (playerOrder) {
        const currentState = useGameStore.getState()
        const orderedPlayers = playerOrder
          .map((id: string) => currentState.players.find((p) => p.id === id))
          .filter(Boolean)

        if (orderedPlayers.length > 0) {
          useGameStore.setState({ players: orderedPlayers as typeof players })
        }
      }
    }

    const handleGameStart = (message: any) => {
      const { answer, playerOrder } = message.data

      if (playerOrder) {
        const currentState = useGameStore.getState()
        const orderedPlayers = playerOrder
          .map((id: string) => currentState.players.find((p) => p.id === id))
          .filter(Boolean)

        if (orderedPlayers.length > 0) {
          useGameStore.setState({ players: orderedPlayers as typeof players })
        }
      }

      setAnswer(answer)
      setGameStatus('playing')
      setCurrentTurn(0)
      setHistory([])
    }

    const handlePlayerLeave = (message: any) => {
      const { playerId } = message.data
      removePlayer(playerId)
    }

    subscribe('player:join', handlePlayerJoin)
    subscribe('player:request-sync', handlePlayerRequestSync)
    subscribe('player:sync-response', handlePlayerSyncResponse)
    subscribe('room:created', handleRoomCreated)
    subscribe('game:start', handleGameStart)
    subscribe('player:leave', handlePlayerLeave)

    return () => {
      unsubscribe('player:join', handlePlayerJoin)
      unsubscribe('player:request-sync', handlePlayerRequestSync)
      unsubscribe('player:sync-response', handlePlayerSyncResponse)
      unsubscribe('room:created', handleRoomCreated)
      unsubscribe('game:start', handleGameStart)
      unsubscribe('player:leave', handlePlayerLeave)
    }
  }, [addPlayer, publish, removePlayer, setAnswer, setCurrentTurn, setGameStatus, setHistory, setRoomHost, subscribe, unsubscribe])

  useEffect(() => {
    // 購読が確立した後にプレイヤーを初期化
    if (currentPlayerId) return
    if (!name) {
      navigate('/')
      return
    }
    if (initialized.current) return
    initialized.current = true

    const playerId = persistedPlayerId || `player-${Date.now()}-${Math.random()}`
    setCurrentPlayerId(playerId)
    if (!persistedPlayerId) {
      localStorage.setItem('playerId', playerId)
    }

    const newPlayer = {
      id: playerId,
      name,
      answerCount: 0,
      isCorrect: false,
      isHost: false,
      isSpectator: false,
    }

    const alreadyExists = players.some((p) => p.id === playerId)
    if (!alreadyExists) {
      addPlayer(newPlayer)
    }

    setTimeout(() => {
      if (!alreadyExists) {
        publish('player:join', newPlayer)
      }
      publish('player:request-sync', { requesterId: playerId })
    }, 100)
  }, [addPlayer, currentPlayerId, name, navigate, persistedPlayerId, players, publish, setCurrentPlayerId])

  // ブラウザクローズ時に離脱通知を送る
  useEffect(() => {
    const handleBeforeUnload = () => {
      const state = useGameStore.getState()
      if (!state.currentPlayerId) return
      publish('player:leave', { playerId: state.currentPlayerId })
      removePlayer(state.currentPlayerId)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [publish])

  useEffect(() => {
    if (gameStatus === 'playing') {
      navigate('/game')
    }
  }, [gameStatus, navigate])

  const handleCreateRoom = () => {
    // すでに部屋がある場合は新規作成しない
    if (!currentPlayerId || roomHost) return

    createRoom(currentPlayerId)
    const currentState = useGameStore.getState()
    const playerOrder = currentState.players.map((p) => p.id)
    publish('room:created', { hostId: currentPlayerId, playerOrder })
  }

  const handleStartGame = () => {
    if (!isHost) return
    startGame()
    const currentState = useGameStore.getState()
    const playerOrder = currentState.players.map((p) => p.id)
    publish('game:start', { answer: currentState.answer, playerOrder })
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-500/40 to-cyan-400/30 blur-3xl" />
        <div className="absolute right-[-5%] bottom-0 h-96 w-96 rounded-full bg-gradient-to-br from-fuchsia-500/35 to-indigo-500/30 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(255,255,255,0.05),transparent_25%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.06),transparent_20%)]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10 lg:py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300 font-semibold">Lobby</p>
            <h1 className="mt-2 text-3xl lg:text-4xl font-bold text-white">リアルタイムロビー</h1>
            <p className="text-sm text-slate-200/80 mt-1">プレイヤーが揃ったらホストがゲームを開始できます。</p>
          </div>
          {currentPlayer && (
            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-lg px-4 py-3 text-right">
              <p className="text-xs text-slate-200/80">あなた</p>
              <p className="text-lg font-semibold text-white">{currentPlayer.name}</p>
              {isHost && <span className="text-[11px] font-semibold text-cyan-200">ホスト権限</span>}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-2xl shadow-2xl shadow-indigo-900/30 p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-cyan-200 font-semibold">Players</p>
                <h2 className="text-2xl font-bold text-white">参加者一覧</h2>
              </div>
              <div className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white border border-white/10">
                {players.length} / 4
              </div>
            </div>

            <div className="space-y-3">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/60 to-cyan-400/60 flex items-center justify-center text-lg font-bold text-white">
                      {player.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-base font-semibold">{player.name}</p>
                      <p className="text-xs text-slate-200/70">ID: {player.id.slice(0, 6)}</p>
                    </div>
                  </div>
                  {player.id === roomHost && (
                    <span className="rounded-full bg-amber-400/20 text-amber-200 border border-amber-200/50 px-3 py-1 text-xs font-semibold">
                      ホスト
                    </span>
                  )}
                </div>
              ))}

              {players.length === 0 && (
                <p className="text-center text-slate-200/70 py-10 rounded-2xl border border-dashed border-white/20">
                  まだ参加者がいません。ロビーをシェアして招待しましょう。
                </p>
              )}
            </div>

            <div className="mt-8 space-y-3">
              {gameStatus === 'lobby' && (
                <button
                  onClick={handleCreateRoom}
                  className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 px-6 py-3 text-base font-bold text-white shadow-lg shadow-indigo-900/30 transition hover:shadow-indigo-500/50"
                >
                  部屋を立てる
                </button>
              )}

              {gameStatus === 'preparing' && (
                <>
                  {isHost ? (
                    <button
                      onClick={handleStartGame}
                      disabled={players.length === 0}
                      className="w-full rounded-2xl bg-white text-slate-900 px-6 py-3 text-base font-bold shadow-lg shadow-indigo-900/30 transition hover:-translate-y-0.5 disabled:bg-slate-200 disabled:text-slate-500"
                    >
                      ゲーム開始
                    </button>
                  ) : (
                    <div className="w-full rounded-2xl border border-amber-200/50 bg-amber-50/80 px-4 py-4 text-center text-amber-800 font-semibold">
                      ホストがゲームを開始するまでお待ちください
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-2xl shadow-xl shadow-indigo-900/30 p-6">
              <p className="text-xs uppercase tracking-wide text-cyan-200 font-semibold">Rules</p>
              <h3 className="text-xl font-bold text-white mt-1">ゲーム概要</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-100/90">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-300" />
                  <span>用意されたアイコンから4つを推理して当てる</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-300" />
                  <span>60秒以内に回答。Hitはアイコン+位置一致、Blowはアイコンのみ一致</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-300" />
                  <span>最速で正解したプレイヤーが勝利。履歴は全員に共有</span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-xl shadow-indigo-900/30 p-6 text-slate-100">
              <p className="text-xs uppercase tracking-wide text-cyan-200 font-semibold">Status</p>
              <div className="mt-3 flex items-center gap-3">
                <span
                  className={`h-3 w-3 rounded-full ${
                    gameStatus === 'playing' ? 'bg-emerald-400' : 'bg-amber-300 animate-pulse'
                  }`}
                />
                <p className="text-sm">
                  {gameStatus === 'lobby' && 'ロビー待機中'}
                  {gameStatus === 'preparing' && 'ゲーム準備中'}
                  {gameStatus === 'playing' && 'ゲーム進行中'}
                </p>
              </div>
              {roomHost && <p className="mt-2 text-xs text-slate-200/70">ホスト: {roomHost.slice(0, 8)}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LobbyPage
