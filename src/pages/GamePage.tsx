import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const GamePage = () => {
  const location = useLocation()
  const { name } = location.state || { name: 'Guest' }
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(20)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const toggleNumber = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num))
    } else if (selectedNumbers.length < 4) {
      setSelectedNumbers([...selectedNumbers, num])
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">FutonHit</h1>
            <div className="text-right">
              <p className="text-sm text-gray-600">プレイヤー</p>
              <p className="font-semibold">{name}</p>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300">
            <span className="font-semibold">あなたのターン</span>
            <div className="text-2xl font-bold text-red-600">
              残り {timeLeft}秒
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">数字を選択 ({selectedNumbers.length}/4)</h2>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {Array.from({ length: 13 }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => toggleNumber(num)}
                className={`aspect-square rounded-lg text-xl font-bold transition-all ${
                  selectedNumbers.includes(num)
                    ? 'bg-blue-600 text-white scale-110'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
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
            disabled={selectedNumbers.length !== 4}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            回答する
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">回答履歴</h2>
          <p className="text-gray-500 text-center py-8">まだ回答がありません</p>
        </div>
      </div>
    </div>
  )
}

export default GamePage
