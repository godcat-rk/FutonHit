import { useNavigate } from 'react-router-dom'

const ResultPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-4 text-yellow-600">
          🏆 勝利！
        </h1>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-center text-gray-700 mb-2">勝者</p>
          <p className="text-2xl font-bold text-center text-blue-600">
            Player 1
          </p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-center text-gray-700 mb-2">正解</p>
          <div className="flex justify-center gap-2">
            {[5, 8, 12, 3].map((num, i) => (
              <div
                key={i}
                className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xl font-bold"
              >
                {num}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          もう一度プレイ
        </button>
      </div>
    </div>
  )
}

export default ResultPage
