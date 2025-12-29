import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const GAME_PASSWORD = 'futon'

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

    // 再入室時にも名前を保持できるようローカルに保存
    localStorage.setItem('playerName', name)
    navigate('/lobby', { state: { name } })
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-500/50 to-cyan-400/40 blur-3xl" />
        <div className="absolute right-[-10%] top-20 h-80 w-80 rounded-full bg-gradient-to-br from-fuchsia-500/50 to-indigo-500/40 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.06),transparent_20%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl shadow-indigo-900/30 p-8 lg:p-10 text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-200 border border-white/10">
              布団鯖ヒット＆ブロー
            </div>
            <h1 className="mt-4 text-4xl lg:text-5xl font-bold leading-tight text-white">
              布団鯖ヒット＆ブロー
              <span className="block text-cyan-300">完全無料なのにたのしい神ゲー</span>
            </h1>
            <p className="mt-4 text-base text-slate-200/90">
              鯖民専用のオンライン推理ゲーム。制限時間内に4つのアイコンの並びを当てたら勝利。才能と教養を格付けしよう！
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-100/80">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase text-cyan-200 tracking-wide">ルール</p>
                <p className="mt-1 font-semibold">6種のアイコンから4つの並びを当てる</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase text-cyan-200 tracking-wide">判定</p>
                <p className="mt-1 font-semibold">Hit: アイコン+位置 / Blow: アイコンのみ</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase text-cyan-200 tracking-wide">テンポ</p>
                <p className="mt-1 font-semibold">回答時間 60秒 </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/80 backdrop-blur-xl shadow-2xl shadow-indigo-900/30 p-8 lg:p-10 text-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Join Lobby</p>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">プレイヤー登録</h2>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  名前
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setError('')
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-900 shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                    placeholder="プレイヤーネームを入力"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  パスワード
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-900 shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  placeholder="ゲームパスワードを入力"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 shadow-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleStart}
                disabled={!name || !password}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 px-6 py-3 text-base font-bold text-white shadow-lg transition hover:shadow-indigo-500/40 disabled:from-slate-300 disabled:via-slate-300 disabled:to-slate-300 disabled:text-slate-600 disabled:shadow-none"
              >
                <span className="absolute inset-0 translate-y-full bg-white/20 transition duration-500 group-hover:translate-y-0" />
                <span className="relative">ロビーに入る</span>
              </button>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tips</p>
              <p className="mt-2 text-sm text-slate-700">
                布団はhutonじゃなくてfutonだよ<br />
                URLは流出させないようにね
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopPage
