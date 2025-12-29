import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { useAbly } from '../hooks/useAbly'

const GAME_CHANNEL = 'futonhit-game'

const LobbyPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { name } = location.state || {}
  const initialized = useRef(false)
  const { publish, subscribe, unsubscribe } = useAbly(GAME_CHANNEL)

  const {
    players,
    gameStatus,
    roomHost,
    currentPlayerId,
    addPlayer,
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
  const currentPlayer = players.find(p => p.id === currentPlayerId)

  useEffect(() => {
    if (!name) {
      navigate('/')
      return
    }

    if (initialized.current) return
    initialized.current = true

    const playerId = `player-${Date.now()}-${Math.random()}`
    setCurrentPlayerId(playerId)

    const newPlayer = {
      id: playerId,
      name,
      answerCount: 0,
      isCorrect: false,
      isHost: false,
      isSpectator: false,
    }

    addPlayer(newPlayer)

    // 新しいプレイヤーが参加したことをブロードキャスト
    publish('player:join', newPlayer)

    // 既存のプレイヤー情報をリクエスト
    publish('player:request-sync', { requesterId: playerId })
  }, [])

  useEffect(() => {
    // プレイヤー参加のリスニング
    const handlePlayerJoin = (message: any) => {
      const player = message.data
      const currentState = useGameStore.getState()

      // 自分自身や既存のプレイヤーは追加しない
      if (player.id === currentState.currentPlayerId) return
      if (currentState.players.some(p => p.id === player.id)) return

      addPlayer(player)
    }

    // プレイヤー情報同期リクエストのリスニング
    const handlePlayerRequestSync = (message: any) => {
      const { requesterId } = message.data
      const currentState = useGameStore.getState()

      // リクエスト者以外の全プレイヤー情報を送信
      if (requesterId !== currentState.currentPlayerId) {
        publish('player:sync-response', {
          players: currentState.players,
          gameStatus: currentState.gameStatus,
          roomHost: currentState.roomHost,
        })
      }
    }

    // プレイヤー情報同期レスポンスのリスニング
    const handlePlayerSyncResponse = (message: any) => {
      const { players: syncedPlayers, gameStatus: syncedStatus, roomHost: syncedHost } = message.data
      const currentState = useGameStore.getState()

      // 受信したプレイヤー情報を追加（重複チェック）
      syncedPlayers.forEach((player: any) => {
        if (player.id !== currentState.currentPlayerId && !currentState.players.some(p => p.id === player.id)) {
          addPlayer(player)
        }
      })

      // ゲーム状態と部屋主情報を同期
      if (syncedStatus && syncedStatus !== 'lobby') {
        setGameStatus(syncedStatus)
      }
      if (syncedHost) {
        setRoomHost(syncedHost)
      }
    }

    // 部屋作成のリスニング
    const handleRoomCreated = (message: any) => {
      const { hostId } = message.data
      setGameStatus('preparing')
      setRoomHost(hostId)
    }

    // ゲーム開始のリスニング
    const handleGameStart = (message: any) => {
      const { answer } = message.data
      setAnswer(answer)
      setGameStatus('playing')
      setCurrentTurn(0)
      setHistory([])
    }

    subscribe('player:join', handlePlayerJoin)
    subscribe('player:request-sync', handlePlayerRequestSync)
    subscribe('player:sync-response', handlePlayerSyncResponse)
    subscribe('room:created', handleRoomCreated)
    subscribe('game:start', handleGameStart)

    return () => {
      unsubscribe('player:join', handlePlayerJoin)
      unsubscribe('player:request-sync', handlePlayerRequestSync)
      unsubscribe('player:sync-response', handlePlayerSyncResponse)
      unsubscribe('room:created', handleRoomCreated)
      unsubscribe('game:start', handleGameStart)
    }
  }, [subscribe, unsubscribe])

  useEffect(() => {
    if (gameStatus === 'playing') {
      navigate('/game')
    }
  }, [gameStatus, navigate])

  const handleCreateRoom = () => {
    if (currentPlayerId) {
      createRoom(currentPlayerId)
      publish('room:created', { hostId: currentPlayerId })
    }
  }

  const handleStartGame = () => {
    startGame()
    const currentState = useGameStore.getState()
    publish('game:start', { answer: currentState.answer })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl p-8 mb-4">
          <h1 className="text-3xl font-bold text-center mb-6">
            {gameStatus === 'lobby' ? 'ロビー' : 'ゲーム準備中'}
          </h1>

          {currentPlayer && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-center text-gray-700">
                あなた: <span className="font-bold">{currentPlayer.name}</span>
              </p>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              参加者一覧 ({players.length}人)
            </h2>
            <div className="space-y-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium">{player.name}</span>
                  {player.id === roomHost && (
                    <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-semibold">
                      部屋主
                    </span>
                  )}
                </div>
              ))}
              {players.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  参加者がいません
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {gameStatus === 'lobby' && (
              <button
                onClick={handleCreateRoom}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
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
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    ゲーム開始
                  </button>
                ) : (
                  <div className="w-full p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg text-center">
                    <p className="text-yellow-800 font-medium">
                      部屋主がゲームを開始するまでお待ちください
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-3">ゲーム情報</h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• 1-13の数字から4つを当てるゲーム</li>
            <li>• 各プレイヤーは60秒以内に回答</li>
            <li>• 最も早く正解した人が勝利</li>
            <li>• 回答履歴は全員に公開されます</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default LobbyPage
