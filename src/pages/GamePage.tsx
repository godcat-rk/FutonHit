import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { calculateHitAndBlow, generateRandomGuess } from '../utils/gameLogic'
import { useAbly } from '../hooks/useAbly'
import { getIconPath, getIconCountByDifficulty } from '../utils/iconMapping'

const GAME_CHANNEL = 'futonhit-game'

const GamePage = () => {
  const navigate = useNavigate()
  const { publish, subscribe, unsubscribe } = useAbly(GAME_CHANNEL)

  const {
    players,
    currentTurn,
    history,
    currentPlayerId,
    gameStatus,
    roomHost,
    difficulty,
    removePlayer,
    addHistory,
    setCurrentTurn,
    setWinner,
    setGameStatus,
  } = useGameStore()

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(60)

  const currentPlayer = players.find((p) => p.id === currentPlayerId)
  const activePlayers = players.filter((p) => !p.isSpectator && !p.isCorrect)
  const activeCount = activePlayers.length
  const turnPlayer = activePlayers[currentTurn]
  const isMyTurn = turnPlayer?.id === currentPlayerId
  const isSpectator = currentPlayer?.isSpectator || false
  const isHost = currentPlayerId === roomHost
  const iconCount = getIconCountByDifficulty(difficulty)

  useEffect(() => {
    if (gameStatus !== 'playing') {
      navigate('/lobby')
    }
  }, [gameStatus, navigate])

  useEffect(() => {
    if (gameStatus === 'finished') {
      navigate('/result')
    }
  }, [gameStatus, navigate])

  useEffect(() => {
    // ホストが回答を受理し、全員に通知する
    const handleAnswerRequest = (message: any) => {
      const { guess, playerId: requestPlayerId } = message.data
      const currentState = useGameStore.getState()

      // ホストのみが回答を処理
      if (currentState.currentPlayerId !== currentState.roomHost) return

      const active = currentState.players.filter((p) => !p.isSpectator && !p.isCorrect)
      const currentTurnPlayer = active[currentState.currentTurn]
      if (!currentTurnPlayer || currentTurnPlayer.id !== requestPlayerId) return

      const { hit, blow } = calculateHitAndBlow(currentState.answer, guess)
      const newHistory = {
        playerId: currentTurnPlayer.id,
        playerName: currentTurnPlayer.name,
        guess,
        hit,
        blow,
        timestamp: Date.now(),
      }

      const nextTurn = (currentState.currentTurn + 1) % active.length
      const winner = hit === 4 ? currentTurnPlayer.name : null

      publish('answer:accepted', { history: newHistory, nextTurn, winner })

      addHistory(newHistory)
      if (winner) {
        setWinner(winner)
        setGameStatus('finished')
      } else {
        setCurrentTurn(nextTurn)
        setTimeLeft(60)
      }
    }

    // ホストからの承認を受信し、全員が状態を揃える
    const handleAnswerAccepted = (message: any) => {
      const { history: newHistory, nextTurn, winner } = message.data
      const currentState = useGameStore.getState()
      if (currentState.currentPlayerId === currentState.roomHost) return

      addHistory(newHistory)
      if (winner) {
        setWinner(winner)
        setGameStatus('finished')
      } else {
        setCurrentTurn(nextTurn)
        setTimeLeft(60)
      }
    }

    const handlePlayerKick = (message: any) => {
      const { playerId } = message.data
      const state = useGameStore.getState()
      removePlayer(playerId)
      const updatedActive = state.players.filter((p) => !p.isSpectator && !p.isCorrect && p.id !== playerId)
      if (updatedActive.length > 0) {
        const safeTurn = state.currentTurn % updatedActive.length
        setCurrentTurn(safeTurn)
      }
      if (playerId === state.currentPlayerId) {
        setGameStatus('lobby')
        navigate('/lobby')
      }
    }

    const handleSkipTurnEvent = (message: any) => {
      const { nextTurn } = message.data
      const state = useGameStore.getState()
      if (state.currentPlayerId === state.roomHost) return
      setCurrentTurn(nextTurn)
      setTimeLeft(60)
    }

    subscribe('answer:request', handleAnswerRequest)
    subscribe('answer:accepted', handleAnswerAccepted)
    subscribe('player:kick', handlePlayerKick)
    subscribe('host:skip-turn', handleSkipTurnEvent)

    return () => {
      unsubscribe('answer:request', handleAnswerRequest)
      unsubscribe('answer:accepted', handleAnswerAccepted)
      unsubscribe('player:kick', handlePlayerKick)
      unsubscribe('host:skip-turn', handleSkipTurnEvent)
    }
  }, [addHistory, publish, removePlayer, setCurrentTurn, setGameStatus, setWinner, subscribe, unsubscribe, navigate])

  // ターンが変わるたびにカウントをリセット
  useEffect(() => {
    setTimeLeft(60)
    if (!isMyTurn) {
      setSelectedNumbers([])
    }
  }, [currentTurn, isMyTurn])

  // 常にカウントダウンを進める（ホスト/参加者問わず）
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (isMyTurn) {
            handleAutoSubmit()
          }
          return 60
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isMyTurn, currentTurn])

  const handleAutoSubmit = () => {
    const randomGuess = generateRandomGuess(difficulty)
    submitAnswer(randomGuess)
  }

  const toggleNumber = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num))
    } else if (selectedNumbers.length < 4) {
      setSelectedNumbers([...selectedNumbers, num])
    }
  }

  const submitAnswer = (guess: number[]) => {
    if (!turnPlayer || !currentPlayerId) return
    if (!isMyTurn) return

    publish('answer:request', {
      guess,
      playerId: currentPlayerId,
    })

    setSelectedNumbers([])
  }

  const handleSubmit = () => {
    if (selectedNumbers.length === 4 && isMyTurn) {
      submitAnswer(selectedNumbers)
    }
  }

  const handleSkipTurn = () => {
    if (!isHost) return
    const active = useGameStore.getState().players.filter((p) => !p.isSpectator && !p.isCorrect)
    if (active.length === 0) return
    const nextTurn = (currentTurn + 1) % active.length
    publish('host:skip-turn', { nextTurn })
    setCurrentTurn(nextTurn)
    setTimeLeft(60)
  }

  const latestHistory = history[history.length - 1]

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-500/35 to-cyan-400/25 blur-3xl" />
        <div className="absolute right-[-8%] bottom-10 h-96 w-96 rounded-full bg-gradient-to-br from-fuchsia-500/30 to-indigo-500/25 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 lg:py-10 text-white">
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/10 backdrop-blur-2xl shadow-2xl shadow-indigo-900/30 p-5 flex flex-col gap-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-300 font-semibold">Gameplay</p>
              <h1 className="text-3xl font-bold mt-1">FutonHit</h1>
              <p className="text-sm text-slate-200/80">更新すると追い出されるからやめてね</p>
              <p className="mt-1 text-xs text-slate-200/70">プレイ中 {activeCount} 人</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-2xl shadow-2xl shadow-indigo-900/30 p-6">
              {isSpectator ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center">
                  <p className="text-lg font-semibold">観戦モード</p>
                  <p className="text-sm text-slate-200/80 mt-1">次のラウンドまでリザーブ。最新の動きを見守ろう。</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div
                    className={`flex items-center justify-between rounded-2xl border px-4 py-4 ${
                      isMyTurn
                        ? 'border-amber-300/60 bg-amber-100/10'
                        : 'border-cyan-300/60 bg-cyan-100/10'
                    }`}
                  >
                    <span className="text-xl font-bold">
                      {isMyTurn ? 'あなたのターン' : `${turnPlayer?.name || '---'} のターン`}
                    </span>
                    <span className="text-3xl font-black text-amber-200 drop-shadow-lg">残り {timeLeft}秒</span>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center justify-between">
                    <div className="flex gap-2 overflow-x-auto max-w-full">
                      {activePlayers.map((p, idx) => (
                        <div
                          key={p.id}
                          className={`flex items-center gap-2 rounded-2xl px-3 py-2 border ${
                            idx === currentTurn
                              ? 'border-emerald-300/60 bg-emerald-500/20 text-emerald-100'
                              : 'border-white/10 bg-white/5 text-white'
                          }`}
                        >
                          <span className="w-6 h-6 rounded-full bg-white/10 border border-white/20 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-semibold">{p.name}</span>
                          {idx === currentTurn && <span className="text-[11px] font-bold text-emerald-100">ターン中</span>}
                        </div>
                      ))}
                    </div>
                    {isHost && (
                      <button
                        onClick={handleSkipTurn}
                        className="text-xs rounded-full px-3 py-1 border border-white/20 bg-white/10 text-white hover:bg-white/20 transition"
                      >
                        ターンをスキップ（ホスト）
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {latestHistory && (
              <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-2xl shadow-2xl shadow-indigo-900/30 p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-cyan-200 font-semibold">Latest</p>
                    <h2 className="text-xl font-bold text-white">最新の結果</h2>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-xs text-slate-200/80">Hit</p>
                      <p className="text-3xl font-black text-emerald-200">{latestHistory.hit}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-200/80">Blow</p>
                      <p className="text-3xl font-black text-cyan-200">{latestHistory.blow}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white">
                    {latestHistory.playerName}
                  </div>
                  <div className="flex gap-2">
                    {latestHistory.guess.map((num, i) => (
                      <div
                        key={i}
                        className="w-16 h-16 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center p-2"
                      >
                        <img src={getIconPath(num)} alt={`Icon ${num}`} className="h-full w-full object-contain" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!isSpectator && (
              <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-2xl shadow-2xl shadow-indigo-900/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-cyan-200 font-semibold">Select</p>
                    <h2 className="text-xl font-bold text-white">アイコンを選択 ({selectedNumbers.length}/4)</h2>
                  </div>
                  <span className="text-sm text-slate-200/80">アイコン募集中</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
                  {Array.from({ length: iconCount }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => toggleNumber(num)}
                      disabled={!isMyTurn}
                      className={`relative aspect-square rounded-2xl border transition-all p-3 ${
                        selectedNumbers.includes(num)
                          ? 'border-cyan-200 bg-white/80 text-slate-900 shadow-lg shadow-cyan-500/30 scale-[1.02]'
                          : 'border-white/10 bg-white/5 hover:border-cyan-200/60'
                      } ${!isMyTurn ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <img src={getIconPath(num)} alt={`Icon ${num}`} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-white/90 mb-3">選択中</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-20 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center p-2"
                      >
                        {selectedNumbers[i] ? (
                          <img
                            src={getIconPath(selectedNumbers[i])}
                            alt={`Selected ${selectedNumbers[i]}`}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-3xl text-slate-400">?</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={selectedNumbers.length !== 4 || !isMyTurn}
                  className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-600 px-6 py-4 text-lg font-bold text-white shadow-xl shadow-cyan-900/30 transition hover:shadow-cyan-500/40 disabled:from-slate-400 disabled:via-slate-400 disabled:to-slate-400 disabled:text-slate-200 disabled:shadow-none"
                >
                  回答する
                </button>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-2xl shadow-2xl shadow-indigo-900/30 p-6 lg:p-7 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-cyan-200 font-semibold">History</p>
                <h2 className="text-xl font-bold text-white">回答履歴 ({history.length}件)</h2>
              </div>
            </div>

            <div className="space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
              {history.length === 0 ? (
                <p className="text-slate-200/70 text-center py-8">まだ回答がありません</p>
              ) : (
                [...history].reverse().map((h, index) => (
                  <div
                    key={history.length - index - 1}
                    className="rounded-2xl border border-white/10 bg-white/5 p-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-semibold text-sm text-white">{h.playerName}</span>
                      <div className="flex gap-3 text-xs">
                        <span className="text-emerald-200 font-bold">H: {h.hit}</span>
                        <span className="text-cyan-200 font-bold">B: {h.blow}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {h.guess.map((num, i) => (
                        <div
                          key={i}
                          className="flex-1 aspect-square rounded-xl border border-white/10 bg-white/5 flex items-center justify-center p-1"
                        >
                          <img src={getIconPath(num)} alt={`Icon ${num}`} className="h-full w-full object-contain" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GamePage
