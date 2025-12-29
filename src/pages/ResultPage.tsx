import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { getIconPath } from '../utils/iconMapping'

const ResultPage = () => {
  const navigate = useNavigate()
  const { winner, answer, resetGame } = useGameStore()

  useEffect(() => {
    const timer = setTimeout(() => {
      resetGame()
      navigate('/lobby')
    }, 10000)

    return () => clearTimeout(timer)
  }, [resetGame, navigate])

  const handleReturnToLobby = () => {
    resetGame()
    navigate('/lobby')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-4 text-yellow-600">
          🏆 ゲーム終了！
        </h1>

        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300">
          <p className="text-center text-gray-700 mb-2">勝者</p>
          <p className="text-2xl font-bold text-center text-blue-600">
            {winner || '---'}
          </p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-center text-gray-700 mb-2">正解</p>
          <div className="flex justify-center gap-3">
            {answer.map((num, i) => (
              <div
                key={i}
                className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border-2 border-blue-400 p-2"
              >
                <img
                  src={getIconPath(num)}
                  alt={`Answer ${num}`}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 p-3 bg-gray-100 rounded-lg text-center">
          <p className="text-sm text-gray-600">
            10秒後に自動的にロビーに戻ります
          </p>
        </div>

        <button
          onClick={handleReturnToLobby}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          ロビーに戻る
        </button>
      </div>
    </div>
  )
}

export default ResultPage
