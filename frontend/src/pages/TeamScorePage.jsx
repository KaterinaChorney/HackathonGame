import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import scoresApi from '../services/scoresApi'

const BADGE_ICONS = {
  innovator: '💡', speedster: '⚡', presenter: '🎤', teamwork: '🤝',
  problem_solver: '🧩', creative: '🎨', survivor: '🛡️', mvp: '🏆'
}

export default function TeamScorePage() {
  const { sessionId, teamId } = useParams()
  const [score, setScore] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [scoreRes, historyRes] = await Promise.all([
          scoresApi.getTeamScore(sessionId, teamId),
          scoresApi.getTeamHistory(sessionId, teamId)
        ])
        setScore(scoreRes.data)
        setHistory(historyRes.data)
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [sessionId, teamId])

  if (loading) return <div className="text-center text-gray-400 py-20">Завантаження...</div>

  // Build round chart data
  const roundData = {}
  history.forEach(h => {
    if (!roundData[h.round]) roundData[h.round] = 0
    roundData[h.round] += h.points
  })
  const rounds = Object.keys(roundData).sort((a, b) => a - b)
  const maxPoints = Math.max(...Object.values(roundData).map(Math.abs), 1)

  return (
    <div className="space-y-8">
      <Link to="/" className="text-gray-400 hover:text-neon-cyan text-sm">← Назад до лідерборду</Link>

      <div className="text-center">
        <h1 className="font-cyber text-3xl text-neon-cyan mb-1">КОМАНДА #{teamId}</h1>
        <p className="text-gray-400">Сесія: <span className="font-mono text-neon-pink">{sessionId}</span></p>
      </div>

      {/* Total score card */}
      <div className="card-cyber text-center animate-pulse-glow max-w-sm mx-auto">
        <div className="text-sm text-gray-400 mb-2">Загальний бал</div>
        <div className="font-cyber text-5xl text-neon-cyan">{score?.totalScore || 0}</div>
        <div className="flex gap-2 justify-center mt-4">
          {score?.badges?.map((b, i) => (
            <span key={i} className="bg-cyber-dark px-3 py-1 rounded-full text-sm border border-cyber-border">
              {BADGE_ICONS[b.badgeType] || '🏅'} {b.badgeType}
            </span>
          ))}
        </div>
      </div>

      {/* Round chart */}
      {rounds.length > 0 && (
        <div className="card-cyber">
          <h2 className="font-cyber text-lg text-neon-pink mb-4">БАЛИ ПО РАУНДАХ</h2>
          <div className="flex items-end gap-4 h-40 justify-center">
            {rounds.map(r => {
              const val = roundData[r]
              const height = Math.abs(val) / maxPoints * 100
              return (
                <div key={r} className="flex flex-col items-center gap-2">
                  <span className={`text-sm font-mono ${val >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                    {val > 0 ? '+' : ''}{val}
                  </span>
                  <div
                    className={`w-12 rounded-t transition-all ${val >= 0 ? 'bg-neon-cyan/60' : 'bg-red-500/60'}`}
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                  <span className="text-xs text-gray-400">R{r}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* History table */}
      <div className="card-cyber">
        <h2 className="font-cyber text-lg text-neon-pink mb-4">ІСТОРІЯ НАРАХУВАНЬ</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyber-border text-gray-400">
                <th className="text-left py-2">Раунд</th>
                <th className="text-left py-2">Бали</th>
                <th className="text-left py-2">Причина</th>
                <th className="text-left py-2">Від</th>
                <th className="text-left py-2">Час</th>
              </tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id} className="border-b border-cyber-border/50 hover:bg-white/5">
                  <td className="py-2">{h.round || '—'}</td>
                  <td className={`py-2 font-mono font-bold ${h.points >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                    {h.points > 0 ? '+' : ''}{h.points}
                  </td>
                  <td className="py-2">{h.reason}</td>
                  <td className="py-2 text-gray-400">{h.createdBy}</td>
                  <td className="py-2 text-gray-500">{new Date(h.createdAt).toLocaleTimeString('uk-UA')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && (
            <div className="text-center text-gray-500 py-8">Немає нарахувань</div>
          )}
        </div>
      </div>
    </div>
  )
}
