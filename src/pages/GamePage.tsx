import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { calculateHitAndBlow, generateRandomGuess } from '../utils/gameLogic'
import { useAbly } from '../hooks/useAbly'

const GAME_CHANNEL = 'futonhit-game'

const GamePage = () => {
  const navigate = useNavigate()
  const { publish, subscribe, unsubscribe } = useAbly(GAME_CHANNEL)

  const {
    players,
    currentTurn,
    history,
    answer,
    currentPlayerId,
    gameStatus,
    addHistory,
    setCurrentTurn,
    setWinner,
    setGameStatus,
  } = useGameStore()

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(60)

  const currentPlayer = players.find(p => p.id === currentPlayerId)
  const activePlayers = players.filter(p => !p.isSpectator && !p.isCorrect)
  const turnPlayer = activePlayers[currentTurn]
  const isMyTurn = turnPlayer?.id === currentPlayerId
  const isSpectator = currentPlayer?.isSpectator || false

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
    // 回答のリスニング
    const handleAnswerSubmitted = (message: any) => {
      const { history: newHistory, nextTurn, winner } = message.data

      addHistory(newHistory)

      if (winner) {
        setWinner(winner)
        setGameStatus('finished')
      } else {
        setCurrentTurn(nextTurn)
        setTimeLeft(60)
      }
    }

    subscribe('answer:submitted', handleAnswerSubmitted)

    return () => {
      unsubscribe('answer:submitted', handleAnswerSubmitted)
    }
  }, [subscribe, unsubscribe])

  useEffect(() => {
    if (!isMyTurn) {
      setTimeLeft(60)
      setSelectedNumbers([])
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAutoSubmit()
          return 60
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isMyTurn, currentTurn])

  const handleAutoSubmit = () => {
    const randomGuess = generateRandomGuess()
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

    const { hit, blow } = calculateHitAndBlow(answer, guess)

    const newHistory = {
      playerId: turnPlayer.id,
      playerName: turnPlayer.name,
      guess,
      hit,
      blow,
      timestamp: Date.now(),
    }

    const activePlayers = players.filter(p => !p.isSpectator && !p.isCorrect)
    const nextTurn = (currentTurn + 1) % activePlayers.length

    let winner: string | null = null
    if (hit === 4) {
      winner = turnPlayer.name
    }

    // リアルタイムで他のプレイヤーに送信
    publish('answer:submitted', {
      history: newHistory,
      nextTurn,
      winner,
    })

    // ローカルの状態を更新
    addHistory(newHistory)

    if (winner) {
      setWinner(winner)
      setGameStatus('finished')
    } else {
      setCurrentTurn(nextTurn)
      setTimeLeft(60)
    }

    setSelectedNumbers([])
  }

  const handleSubmit = () => {
    if (selectedNumbers.length === 4 && isMyTurn) {
      submitAnswer(selectedNumbers)
    }
  }

  const latestHistory = history[history.length - 1]

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">FutonHit</h1>
            <div className="text-right">
              <p className="text-sm text-gray-600">あなた</p>
              <p className="font-semibold">{currentPlayer?.name}</p>
            </div>
          </div>
        </div>

        {/* メインコンテンツ: 2カラムレイアウト */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 左カラム: 回答エリア */}
          <div className="lg:col-span-2 space-y-4">
            {/* ターン情報 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              {isSpectator ? (
                <div className="p-4 bg-gray-100 rounded-lg border-2 border-gray-300 text-center">
                  <p className="font-semibold text-gray-700">観戦モード</p>
                  <p className="text-sm text-gray-600 mt-1">
                    ゲーム終了後に参加できます
                  </p>
                </div>
              ) : isMyTurn ? (
                <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300">
                  <span className="text-xl font-bold">あなたのターン</span>
                  <div className="text-4xl font-bold text-red-600">
                    残り {timeLeft}秒
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300 text-center">
                  <p className="text-xl font-semibold">
                    {turnPlayer?.name} のターン
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    残り {timeLeft}秒
                  </p>
                </div>
              )}
            </div>

            {/* 最新の結果表示 */}
            {latestHistory && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold mb-3">最新の結果</h2>
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold">{latestHistory.playerName}</span>
                    <div className="flex gap-6">
                      <div className="text-center">
                        <p className="text-xs text-gray-600">ヒット</p>
                        <p className="text-3xl font-bold text-green-600">{latestHistory.hit}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">ブロー</p>
                        <p className="text-3xl font-bold text-blue-600">{latestHistory.blow}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center">
                    {latestHistory.guess.map((num, i) => (
                      <div
                        key={i}
                        className="w-16 h-16 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center text-2xl font-bold"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 回答入力エリア */}
            {!isSpectator && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold mb-4">
                  数字を選択 ({selectedNumbers.length}/4)
                </h2>
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {Array.from({ length: 13 }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => toggleNumber(num)}
                      disabled={!isMyTurn}
                      className={`aspect-square rounded-lg text-xl font-bold transition-all ${
                        selectedNumbers.includes(num)
                          ? 'bg-blue-600 text-white scale-110 shadow-lg'
                          : 'bg-gray-200 hover:bg-gray-300'
                      } ${!isMyTurn ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3">選択中</h3>
                  <div className="flex gap-3 justify-center">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-20 h-20 border-2 border-gray-300 rounded-lg flex items-center justify-center text-3xl font-bold bg-white"
                      >
                        {selectedNumbers[i] || '?'}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={selectedNumbers.length !== 4 || !isMyTurn}
                  className="w-full bg-green-600 text-white py-4 rounded-lg text-lg font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  回答する
                </button>
              </div>
            )}
          </div>

          {/* 右カラム: 回答履歴 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">
                回答履歴 ({history.length}件)
              </h2>
              <div className="space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    まだ回答がありません
                  </p>
                ) : (
                  [...history].reverse().map((h, index) => (
                    <div
                      key={history.length - index - 1}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-sm">{h.playerName}</span>
                        <div className="flex gap-3">
                          <span className="text-xs">
                            <span className="font-bold text-green-600">H:</span> {h.hit}
                          </span>
                          <span className="text-xs">
                            <span className="font-bold text-blue-600">B:</span> {h.blow}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {h.guess.map((num, i) => (
                          <div
                            key={i}
                            className="flex-1 aspect-square bg-white border border-gray-300 rounded flex items-center justify-center text-sm font-bold"
                          >
                            {num}
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
    </div>
  )
}

export default GamePage
