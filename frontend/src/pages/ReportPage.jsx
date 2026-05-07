import { useState } from 'react'
import scoresApi from '../services/scoresApi'
import formsApi from '../services/formsApi'

export default function ReportPage() {
  const [sessionId, setSessionId] = useState('')
  const [scores, setScores] = useState([])
  const [history, setHistory] = useState([])
  const [forms, setForms] = useState([])
  const [badges, setBadges] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadReport = async () => {
    if (!sessionId) return
    setLoading(true)
    try {
      const [scoresRes, historyRes, formsRes, badgesRes] = await Promise.all([
        scoresApi.getLeaderboard(sessionId),
        scoresApi.getSessionHistory(sessionId),
        formsApi.getSessionForms(sessionId),
        scoresApi.getSessionBadges(sessionId)
      ])
      setScores(scoresRes.data)
      setHistory(historyRes.data)
      setForms(formsRes.data)
      setBadges(badgesRes.data)
      setLoaded(true)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const totalPoints = history.reduce((sum, h) => sum + (h.points > 0 ? h.points : 0), 0)
  const totalPenalties = history.reduce((sum, h) => sum + (h.points < 0 ? Math.abs(h.points) : 0), 0)
  const roundStats = {}
  history.forEach(h => {
    if (!roundStats[h.round]) roundStats[h.round] = { count: 0, total: 0 }
    roundStats[h.round].count++
    roundStats[h.round].total += h.points
  })

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-cyber text-4xl text-neon-green mb-2">ЗВІТ СЕСІЇ</h1>
        <p className="text-gray-400">Підсумкова статистика</p>
      </div>

      <div className="flex gap-4 justify-center">
        <input className="input-cyber max-w-xs text-center font-mono tracking-widest uppercase"
               placeholder="Код сесії" value={sessionId}
               onChange={e => setSessionId(e.target.value.toUpperCase())} maxLength={6} />
        <button className="btn-neon" onClick={loadReport}>Створити звіт</button>
      </div>

      {loading && <div className="text-center text-gray-400">Завантаження...</div>}

      {loaded && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Команд', value: scores.length, color: 'text-neon-cyan' },
              { label: 'Нарахувань', value: history.length, color: 'text-neon-pink' },
              { label: 'Балів видано', value: totalPoints, color: 'text-neon-green' },
              { label: 'Штрафів', value: totalPenalties, color: 'text-red-400' },
            ].map((stat, idx) => (
              <div key={idx} className="card-cyber text-center">
                <div className={`font-cyber text-3xl ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Final Leaderboard */}
          <div className="card-cyber">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-cyber text-lg text-neon-cyan">ФІНАЛЬНИЙ РЕЙТИНГ</h2>
              <div className="flex gap-2">
                <a href={scoresApi.exportLeaderboardCsv(sessionId)}
                   className="text-sm text-neon-pink hover:underline" download>📥 CSV</a>
                <a href={scoresApi.exportHistoryCsv(sessionId)}
                   className="text-sm text-neon-cyan hover:underline" download>📥 Історія</a>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyber-border text-gray-400">
                  <th className="text-left py-2">#</th>
                  <th className="text-left py-2">Команда</th>
                  <th className="text-left py-2">Бали</th>
                  <th className="text-left py-2">Бейджі</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((s, idx) => (
                  <tr key={s.teamId} className={`border-b border-cyber-border/50 ${
                    idx === 0 ? 'bg-yellow-400/5' : ''
                  }`}>
                    <td className="py-2 font-cyber">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}</td>
                    <td className="py-2">Команда #{s.teamId}</td>
                    <td className="py-2 font-cyber text-neon-cyan">{s.totalScore}</td>
                    <td className="py-2">
                      {s.badges?.map((b, i) => (
                        <span key={i} className="mr-1 text-xs px-2 py-0.5 bg-neon-pink/10 text-neon-pink rounded">
                          {b.badgeType}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Round Stats */}
          {Object.keys(roundStats).length > 0 && (
            <div className="card-cyber">
              <h2 className="font-cyber text-lg text-neon-pink mb-4">СТАТИСТИКА ПО РАУНДАХ</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(roundStats).sort(([a],[b]) => a - b).map(([r, stats]) => (
                  <div key={r} className="bg-cyber-dark p-3 rounded-lg border border-cyber-border text-center">
                    <div className="font-cyber text-sm text-gray-400">Раунд {r}</div>
                    <div className="font-cyber text-xl text-neon-cyan mt-1">{stats.total}</div>
                    <div className="text-xs text-gray-500">{stats.count} нарахувань</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badges */}
          {badges.length > 0 && (
            <div className="card-cyber">
              <h2 className="font-cyber text-lg text-neon-pink mb-4">ВИДАНІ БЕЙДЖІ</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {badges.map(b => (
                  <div key={b.id} className="bg-cyber-dark p-3 rounded-lg border border-neon-pink/20 text-center">
                    <div className="text-2xl mb-1">🏅</div>
                    <div className="text-sm font-semibold">{b.badgeType}</div>
                    <div className="text-xs text-gray-400">Команда #{b.teamId}</div>
                    <div className="text-xs text-neon-green mt-1">+{b.bonusPoints}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Forms Summary */}
          <div className="card-cyber">
            <h2 className="font-cyber text-lg text-neon-pink mb-4">ЗАПОВНЕНІ ФОРМИ</h2>
            {forms.length > 0 ? (
              <div className="space-y-2">
                {forms.map(f => (
                  <div key={f.id} className="flex justify-between py-2 border-b border-cyber-border/50">
                    <span>Команда #{f.teamId} — <span className="text-neon-pink">{f.formType}</span></span>
                    <span className="text-xs text-gray-500">
                      {new Date(f.updatedAt).toLocaleString('uk-UA')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">Немає заповнених форм</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
