import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import scoresApi from '../services/scoresApi'

const BADGE_NAMES = {
  innovator: 'Інноватор', speedster: 'Швидкий', presenter: 'Оратор', teamwork: 'Команда',
  problem_solver: 'Аналітик', creative: 'Креатив', survivor: 'Виживач', mvp: 'MVP'
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
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {score?.badges?.map((b, i) => (
            <span key={i} className="px-2.5 py-1 rounded text-xs bg-neon-pink/15 text-neon-pink border border-neon-pink/30 uppercase tracking-widest font-semibold font-mono flex items-center justify-center">
              <svg className="w-3.5 h-3.5 mr-1.5 text-neon-pink animate-pulse" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
              {BADGE_NAMES[b.badgeType] || b.badgeType}
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
