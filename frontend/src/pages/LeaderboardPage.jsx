import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import scoresApi from '../services/scoresApi'

const BADGE_ICONS = {
  innovator: '💡', speedster: '⚡', presenter: '🎤', teamwork: '🤝',
  problem_solver: '🧩', creative: '🎨', survivor: '🛡️', mvp: '🏆'
}

const RANK_STYLES = [
  'border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)]',
  'border-gray-300 shadow-[0_0_10px_rgba(156,163,175,0.3)]',
  'border-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.3)]',
]

export default function LeaderboardPage() {
  const [sessionId, setSessionId] = useState('')
  const [activeSession, setActiveSession] = useState('')
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(false)

  const loadLeaderboard = async (sid) => {
    if (!sid) return
    setLoading(true)
    try {
      const res = await scoresApi.getLeaderboard(sid)
      setScores(res.data)
      setActiveSession(sid)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => {
    if (!activeSession) return
    const interval = setInterval(() => loadLeaderboard(activeSession), 5000)
    return () => clearInterval(interval)
  }, [activeSession])

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-cyber text-4xl text-neon-cyan mb-2">ЛІДЕРБОРД</h1>
        <p className="text-gray-400">Рейтинг команд у реальному часі</p>
      </div>

      <div className="flex gap-4 justify-center">
        <input
          className="input-cyber max-w-xs text-center font-mono text-lg tracking-widest uppercase"
          placeholder="Код сесії"
          value={sessionId}
          onChange={e => setSessionId(e.target.value.toUpperCase())}
          maxLength={6}
        />
        <button className="btn-neon" onClick={() => loadLeaderboard(sessionId)}>
          Завантажити
        </button>
      </div>

      {activeSession && (
        <div className="text-center text-sm text-gray-500">
          Сесія: <span className="text-neon-cyan font-mono">{activeSession}</span>
          <span className="ml-4">
            <a href={scoresApi.exportLeaderboardCsv(activeSession)}
               className="text-neon-pink hover:underline" download>
              📥 CSV
            </a>
          </span>
        </div>
      )}

      {loading && <div className="text-center text-gray-400">Завантаження...</div>}

      <div className="space-y-4 max-w-2xl mx-auto">
        {scores.map((score, idx) => (
          <div
            key={score.teamId}
            className={`card-cyber flex items-center gap-4 animate-fade-in border-2 ${
              idx < 3 ? RANK_STYLES[idx] : 'border-cyber-border'
            }`}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className={`w-12 h-12 flex items-center justify-center rounded-full font-cyber text-xl font-bold ${
              idx === 0 ? 'bg-yellow-400/20 text-yellow-400' :
              idx === 1 ? 'bg-gray-300/20 text-gray-300' :
              idx === 2 ? 'bg-amber-600/20 text-amber-600' :
              'bg-cyber-dark text-gray-500'
            }`}>
              {idx + 1}
            </div>

            <div className="flex-1">
              <Link to={`/team/${activeSession}/${score.teamId}`}
                    className="text-lg font-semibold hover:text-neon-cyan transition-colors">
                Команда #{score.teamId}
              </Link>
              <div className="flex gap-1 mt-1">
                {score.badges?.map((b, i) => (
                  <span key={i} title={b.badgeType} className="text-lg">
                    {BADGE_ICONS[b.badgeType] || '🏅'}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-right">
              <div className={`font-cyber text-2xl ${
                idx === 0 ? 'text-yellow-400' : 'text-neon-cyan'
              }`}>
                {score.totalScore}
              </div>
              <div className="text-xs text-gray-500">балів</div>
            </div>
          </div>
        ))}

        {activeSession && scores.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-12">
            Немає даних для цієї сесії
          </div>
        )}
      </div>
    </div>
  )
}
