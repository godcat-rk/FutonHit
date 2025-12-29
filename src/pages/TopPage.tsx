import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const GAME_PASSWORD = 'nekonekofever'

const TopPage = () => {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleStart = () => {
    if (!name) {
      setError('名前を入力してください')
      return
    }

    if (password !== GAME_PASSWORD) {
      setError('パスワードが正しくありません')
      return
    }

    navigate('/lobby', { state: { name } })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          FutonHit
        </h1>
        <p className="text-center text-gray-600 mb-8">
          ヒットアンドブロー オンライン対戦
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              名前
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="あなたの名前を入力"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ゲームパスワード"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={!name || !password}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            ゲーム開始
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            ゲームルール
          </h2>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 6種類のアイコンから4つを当てよう</li>
            <li>• ヒット: 位置とアイコンが一致</li>
            <li>• ブロー: アイコンのみ一致</li>
            <li>• 回答時間: 60秒</li>
            <li>• 最大4人まで参加可能</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default TopPage
