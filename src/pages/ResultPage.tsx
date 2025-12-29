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
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-gradient-to-br from-amber-400/40 to-pink-500/30 blur-3xl" />
        <div className="absolute right-[-10%] bottom-10 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-500/30 to-cyan-400/25 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/10 backdrop-blur-2xl shadow-2xl shadow-indigo-900/30 p-8 lg:p-10 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-200 font-semibold">Game Over</p>
              <h1 className="mt-2 text-3xl lg:text-4xl font-bold">ラウンド終了</h1>
            </div>
            <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white border border-white/10">
              次のラウンドに自動で戻ります
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-wide text-cyan-200 font-semibold">Winner</p>
              <h2 className="text-3xl font-black text-white mt-2">{winner || '---'}</h2>
              <button
                onClick={handleReturnToLobby}
                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-500 px-6 py-3 text-base font-bold text-white shadow-xl shadow-amber-900/30 transition hover:shadow-amber-500/40"
              >
                ロビーに戻る
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-wide text-cyan-200 font-semibold">Answer</p>
              <h3 className="text-lg font-semibold text-white mt-2">正解アイコン</h3>
              <div className="mt-4 grid grid-cols-4 gap-3">
                {answer.map((num, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center p-3"
                  >
                    <img src={getIconPath(num)} alt={`Answer ${num}`} className="w-full h-full object-contain" />
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-200/80">10秒後にロビーへ戻ります。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultPage
