import { useState, useEffect } from 'react'
import scoresApi from '../services/scoresApi'
import formsApi from '../services/formsApi'

const QUICK_POINTS = [
  { label: '+5', value: 5 },
  { label: '+10', value: 10 },
  { label: '+20', value: 20 },
  { label: '-5', value: -5 },
]

export default function AdminScoresPage() {
  const [sessionId, setSessionId] = useState('')
  const [activeSession, setActiveSession] = useState('')
  const [scores, setScores] = useState([])
  const [badgeTypes, setBadgeTypes] = useState([])
  const [forms, setForms] = useState([])
  const [msg, setMsg] = useState('')

  // Score form
  const [teamId, setTeamId] = useState('')
  const [round, setRound] = useState(1)
  const [points, setPoints] = useState('')
  const [reason, setReason] = useState('')

  // Badge form
  const [badgeTeamId, setBadgeTeamId] = useState('')
  const [badgeType, setBadgeType] = useState('')

  useEffect(() => {
    scoresApi.getBadgeTypes().then(r => setBadgeTypes(r.data)).catch(() => {})
  }, [])

  const loadSession = async () => {
    if (!sessionId) return
    setActiveSession(sessionId)
    try {
      const [scoresRes, formsRes] = await Promise.all([
        scoresApi.getLeaderboard(sessionId),
        formsApi.getSessionForms(sessionId)
      ])
      setScores(scoresRes.data)
      setForms(formsRes.data)
    } catch (e) { console.error(e) }
  }

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000) }

  const addScore = async (tid, pts, rsn) => {
    try {
      await scoresApi.addScore(activeSession, tid, { round, points: pts, reason: rsn || reason })
      showMsg(`✅ ${pts > 0 ? '+' : ''}${pts} балів для команди #${tid}`)
      loadSession()
    } catch (e) { showMsg('❌ Помилка') }
  }

  const awardBadge = async () => {
    if (!badgeTeamId || !badgeType) return
    try {
      await scoresApi.awardBadge(activeSession, badgeTeamId, { badgeType, bonusPoints: 0 })
      showMsg(`🏅 Бейдж "${badgeType}" для команди #${badgeTeamId}`)
      loadSession()
      setBadgeType('')
    } catch (e) { showMsg('❌ Помилка') }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex justify-center gap-3 mb-4">
          <a href="http://localhost:3001" className="text-xs px-3 py-1.5 rounded border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-all">
            Адмін сесій →
          </a>
          <a href="http://localhost:3002/admin" className="text-xs px-3 py-1.5 rounded border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-all">
            Адмін карток →
          </a>
        </div>
        <h1 className="font-cyber text-4xl text-neon-cyan mb-2">АДМІН ПАНЕЛЬ</h1>
        <p className="text-gray-400">Управління балами та бейджами</p>
      </div>

      {msg && (
        <div className="text-center py-2 px-4 bg-cyber-card border border-neon-cyan/30 rounded-lg text-neon-cyan animate-fade-in">
          {msg}
        </div>
      )}

      <div className="flex gap-4 justify-center">
        <input className="input-cyber max-w-xs text-center font-mono tracking-widest uppercase"
               placeholder="Код сесії" value={sessionId}
               onChange={e => setSessionId(e.target.value.toUpperCase())} maxLength={6} />
        <button className="btn-neon" onClick={loadSession}>Завантажити</button>
      </div>

      {activeSession && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Add Score */}
          <div className="card-cyber">
            <h2 className="font-cyber text-lg text-neon-cyan mb-4">НАРАХУВАТИ БАЛИ</h2>
            <div className="space-y-3">
              <input className="input-cyber" placeholder="Team ID" type="number"
                     value={teamId} onChange={e => setTeamId(e.target.value)} />
              <div className="flex gap-2">
                <input className="input-cyber w-24" placeholder="Раунд" type="number"
                       value={round} onChange={e => setRound(parseInt(e.target.value) || 1)} min={1} max={5} />
                <input className="input-cyber w-24" placeholder="Бали" type="number"
                       value={points} onChange={e => setPoints(e.target.value)} />
              </div>
              <input className="input-cyber" placeholder="Причина"
                     value={reason} onChange={e => setReason(e.target.value)} />
              <div className="flex gap-2 flex-wrap">
                {QUICK_POINTS.map(qp => (
                  <button key={qp.value}
                          className={`px-4 py-2 rounded-lg font-mono font-bold text-sm border transition-all ${
                            qp.value > 0
                              ? 'border-neon-green/50 text-neon-green hover:bg-neon-green/20'
                              : 'border-red-500/50 text-red-400 hover:bg-red-500/20'
                          }`}
                          disabled={!teamId}
                          onClick={() => addScore(teamId, qp.value, `Швидке нарахування ${qp.label}`)}>
                    {qp.label}
                  </button>
                ))}
                <button className="btn-neon text-sm px-4 py-2" disabled={!teamId || !points}
                        onClick={() => addScore(teamId, parseInt(points), reason)}>
                  Додати
                </button>
              </div>
            </div>
          </div>

          {/* Award Badge */}
          <div className="card-cyber">
            <h2 className="font-cyber text-lg text-neon-pink mb-4">ВИДАТИ БЕЙДЖ</h2>
            <div className="space-y-3">
              <input className="input-cyber" placeholder="Team ID" type="number"
                     value={badgeTeamId} onChange={e => setBadgeTeamId(e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                {badgeTypes.map(bt => (
                  <button key={bt.type}
                          className={`text-left p-2 rounded-lg border text-sm transition-all ${
                            badgeType === bt.type
                              ? 'border-neon-pink bg-neon-pink/20 text-neon-pink'
                              : 'border-cyber-border text-gray-400 hover:border-gray-500'
                          }`}
                          onClick={() => setBadgeType(bt.type)}>
                    <span className="text-lg mr-1">{bt.icon}</span>
                    <span className="font-semibold">{bt.name}</span>
                    <div className="text-xs text-gray-500 mt-0.5">+{bt.defaultPoints} бал.</div>
                  </button>
                ))}
              </div>
              <button className="btn-neon-pink w-full text-sm" disabled={!badgeTeamId || !badgeType}
                      onClick={awardBadge}>
                🏅 Видати бейдж
              </button>
            </div>
          </div>

          {/* Current Scores */}
          <div className="card-cyber">
            <h2 className="font-cyber text-lg text-neon-cyan mb-4">ПОТОЧНІ БАЛИ</h2>
            <div className="space-y-2">
              {scores.map((s, idx) => (
                <div key={s.teamId} className="flex items-center justify-between py-2 border-b border-cyber-border/50">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm w-6">{idx + 1}.</span>
                    <span>Команда #{s.teamId}</span>
                    <span className="text-sm">{s.badges?.map(b => b.badgeType === 'mvp' ? '🏆' : '🏅').join('')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-cyber text-neon-cyan">{s.totalScore}</span>
                    <div className="flex gap-1">
                      <button className="text-xs px-2 py-1 border border-neon-green/30 text-neon-green rounded hover:bg-neon-green/20"
                              onClick={() => addScore(s.teamId, 5, 'Бонус')}>+5</button>
                      <button className="text-xs px-2 py-1 border border-red-500/30 text-red-400 rounded hover:bg-red-500/20"
                              onClick={() => addScore(s.teamId, -5, 'Штраф')}>-5</button>
                    </div>
                  </div>
                </div>
              ))}
              {scores.length === 0 && <div className="text-gray-500 text-center py-4">Немає команд</div>}
            </div>
          </div>

          {/* Forms Overview */}
          <div className="card-cyber">
            <h2 className="font-cyber text-lg text-neon-pink mb-4">ФОРМИ КОМАНД</h2>
            <div className="space-y-2">
              {forms.length > 0 ? forms.map(f => (
                <div key={f.id} className="flex items-center justify-between py-2 border-b border-cyber-border/50">
                  <div>
                    <span className="text-sm">Команда #{f.teamId}</span>
                    <span className="ml-2 text-xs px-2 py-0.5 bg-neon-pink/20 text-neon-pink rounded">
                      {f.formType}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(f.updatedAt).toLocaleString('uk-UA')}</span>
                </div>
              )) : (
                <div className="text-gray-500 text-center py-4">Немає заповнених форм</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
