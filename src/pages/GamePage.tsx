import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { calculateHitAndBlow, generateRandomGuess } from '../utils/gameLogic'

const GamePage = () => {
  const navigate = useNavigate()
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
  const [timeLeft, setTimeLeft] = useState(20)

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
    if (!isMyTurn) {
      setTimeLeft(20)
      setSelectedNumbers([])
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAutoSubmit()
          return 20
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

    addHistory(newHistory)

    if (hit === 4) {
      setWinner(turnPlayer.name)
      setGameStatus('finished')
      return
    }

    const activePlayers = players.filter(p => !p.isSpectator && !p.isCorrect)
    const nextTurn = (currentTurn + 1) % activePlayers.length
    setCurrentTurn(nextTurn)
    setTimeLeft(20)
    setSelectedNumbers([])
  }

  const handleSubmit = () => {
    if (selectedNumbers.length === 4 && isMyTurn) {
      submitAnswer(selectedNumbers)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">FutonHit</h1>
            <div className="text-right">
              <p className="text-sm text-gray-600">あなた</p>
              <p className="font-semibold">{currentPlayer?.name}</p>
            </div>
          </div>

          {isSpectator ? (
            <div className="p-4 bg-gray-100 rounded-lg border-2 border-gray-300 text-center">
              <p className="font-semibold text-gray-700">観戦モード</p>
              <p className="text-sm text-gray-600 mt-1">
                ゲーム終了後に参加できます
              </p>
            </div>
          ) : isMyTurn ? (
            <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300">
              <span className="font-semibold">あなたのターン</span>
              <div className="text-2xl font-bold text-red-600">
                残り {timeLeft}秒
              </div>
            </div>
          ) : (
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300 text-center">
              <p className="font-semibold">
                {turnPlayer?.name} のターン
              </p>
            </div>
          )}
        </div>

        {!isSpectator && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
            <h2 className="text-lg font-semibold mb-4">
              数字を選択 ({selectedNumbers.length}/4)
            </h2>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {Array.from({ length: 13 }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => toggleNumber(num)}
                  disabled={!isMyTurn}
                  className={`aspect-square rounded-lg text-xl font-bold transition-all ${
                    selectedNumbers.includes(num)
                      ? 'bg-blue-600 text-white scale-110'
                      : 'bg-gray-200 hover:bg-gray-300'
                  } ${!isMyTurn ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {num}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">選択中</h3>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-16 h-16 border-2 border-gray-300 rounded-lg flex items-center justify-center text-2xl font-bold"
                  >
                    {selectedNumbers[i] || '?'}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={selectedNumbers.length !== 4 || !isMyTurn}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              回答する
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            回答履歴 ({history.length}件)
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                まだ回答がありません
              </p>
            ) : (
              history.map((h, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold">{h.playerName}</span>
                    <div className="flex gap-4">
                      <span className="text-sm">
                        <span className="font-bold text-green-600">H:</span> {h.hit}
                      </span>
                      <span className="text-sm">
                        <span className="font-bold text-blue-600">B:</span> {h.blow}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {h.guess.map((num, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 bg-white border-2 border-gray-300 rounded flex items-center justify-center font-bold"
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
  )
}

export default GamePage
