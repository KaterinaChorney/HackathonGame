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
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const [sessionId, setSessionId] = useState('')
  const [activeSession, setActiveSession] = useState('')
  const [scores, setScores] = useState([])
  const [badgeTypes, setBadgeTypes] = useState([])
  const [forms, setForms] = useState([])
  const [drawnCards, setDrawnCards] = useState([])
  const [msg, setMsg] = useState('')

  // Score form
  const [teamId, setTeamId] = useState('')
  const [round, setRound] = useState(1)
  const [points, setPoints] = useState('')
  const [reason, setReason] = useState('')
  const [cardId, setCardId] = useState('')

  // Badge form
  const [badgeTeamId, setBadgeTeamId] = useState('')
  const [badgeType, setBadgeType] = useState('')

  // Check token on mount
  useEffect(() => {
    const token = sessionStorage.getItem('admin_token')
    if (token) {
      setIsAuthorized(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthorized) {
      scoresApi.getBadgeTypes().then(r => setBadgeTypes(r.data)).catch(() => {})
    }
  }, [isAuthorized])

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

  // Load cards from P2 whenever activeSession or round changes
  useEffect(() => {
    if (!isAuthorized) return
    const loadCards = async () => {
      if (!activeSession || !round) return
      import('../services/cardsApi').then(({ default: cardsApi }) => {
        cardsApi.getRoundSummary(activeSession, round).then(data => {
          setDrawnCards(data || [])
        })
      })
    }
    loadCards()
  }, [activeSession, round, isAuthorized])

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000) }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    try {
      const res = await scoresApi.login(password)
      sessionStorage.setItem('admin_token', res.data.token)
      setIsAuthorized(true)
      setPassword('')
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Невірний пароль')
    }
  }

  const handleLogout = async () => {
    try {
      await scoresApi.logout()
    } catch (e) {}
    sessionStorage.removeItem('admin_token')
    setIsAuthorized(false)
    setActiveSession('')
    setScores([])
    setForms([])
  }

  const addScore = async (tid, pts, rsn) => {
    try {
      await scoresApi.addScore(activeSession, tid, { round, points: pts, reason: rsn || reason, cardId: cardId || undefined, createdBy: 'Admin' })
      showMsg(`БАЛИ НАРАХОВАНО: ${pts > 0 ? '+' : ''}${pts} для команди #${tid}`)
      loadSession()
      setCardId('')
      setTeamId('')
      setPoints('')
      setReason('')
    } catch (e) { showMsg('ПОМИЛКА: Не вдалося виконати нарахування') }
  }

  const awardBadge = async () => {
    if (!badgeTeamId || !badgeType) return
    try {
      await scoresApi.awardBadge(activeSession, badgeTeamId, { badgeType, bonusPoints: 0 })
      showMsg(`БЕЙДЖ НАДАНО: "${badgeType}" для команди #${badgeTeamId}`)
      loadSession()
      setBadgeType('')
      setBadgeTeamId('')
    } catch (e) { showMsg('ПОМИЛКА: Не вдалося видати бейдж') }
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="w-full max-w-md card-cyber border-neon-cyan/50 shadow-[0_0_20px_rgba(34,211,238,0.2)] p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-neon-cyan animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h1 className="font-cyber text-2xl text-neon-cyan tracking-wider">SECURE ACCESS</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-mono">Авторизація адміністратора</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {loginError && (
              <div className="p-3 text-xs bg-red-950/30 border border-red-500/40 text-red-400 rounded-lg text-center font-mono">
                {loginError}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-gray-400 block text-center">Пароль Адміна</label>
              <input
                type="password"
                className="input-cyber w-full text-center tracking-widest font-mono text-lg"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
              />
            </div>

            <button type="submit" className="btn-neon w-full py-3 font-cyber text-sm tracking-widest uppercase">
              Увійти в систему
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center relative">
        <button 
          onClick={handleLogout}
          className="absolute top-0 right-0 text-xs px-3 py-1.5 rounded border border-red-500/50 text-red-400 hover:text-white hover:bg-red-500/20 transition-all font-mono uppercase tracking-wider"
        >
          Вийти
        </button>
        <div className="flex justify-center gap-3 mb-4">
          <a href="http://localhost:3001" className="text-xs px-3 py-1.5 rounded border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-all">
            Адмін сесій
          </a>
          <a href="http://localhost:3002/admin" className="text-xs px-3 py-1.5 rounded border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-all">
            Адмін карток
          </a>
        </div>
        <h1 className="font-cyber text-4xl text-neon-cyan mb-2">АДМІН ПАНЕЛЬ</h1>
        <p className="text-xs text-gray-400 uppercase tracking-widest font-mono">Управління балами та бейджами</p>
      </div>

      {msg && (
        <div className="text-center py-2.5 px-4 bg-cyber-card border border-neon-cyan/40 rounded-lg text-neon-cyan font-mono text-xs animate-fade-in tracking-wide">
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
              <input className="input-cyber" placeholder="ID Команди" type="number" min="1"
                     value={teamId} onChange={e => setTeamId(e.target.value)} />
              <div className="flex gap-2">
                <input className="input-cyber w-24 font-mono" placeholder="Раунд" type="number"
                       value={round} onChange={e => setRound(parseInt(e.target.value) || 1)} min={1} max={5} />
                <input className="input-cyber w-24 font-mono" placeholder="Бали" type="number"
                       value={points} onChange={e => setPoints(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <input className="input-cyber flex-1" placeholder="Причина"
                       value={reason} onChange={e => setReason(e.target.value)} />
                <select className="input-cyber w-48 text-sm"
                        value={cardId} onChange={e => setCardId(e.target.value)}>
                  <option value="">Без картки</option>
                  {drawnCards.map((c, idx) => (
                    <option key={`${c.teamId}-${c.cardId}-${idx}`} value={c.cardId}>
                      [Команда #{c.teamId}] {c.cardNameUa}
                    </option>
                  ))}
                </select>
              </div>
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
                <button className="btn-neon text-sm px-4 py-2 font-cyber" disabled={!teamId || !points}
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
              <input className="input-cyber" placeholder="ID Команди" type="number" min="1"
                     value={badgeTeamId} onChange={e => setBadgeTeamId(e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                {badgeTypes.map(bt => (
                  <button key={bt.type}
                          className={`text-left p-2.5 rounded-lg border text-sm transition-all ${
                            badgeType === bt.type
                              ? 'border-neon-pink bg-neon-pink/20 text-neon-pink'
                              : 'border-cyber-border text-gray-400 hover:border-gray-500'
                          }`}
                          onClick={() => setBadgeType(bt.type)}>
                    <span className="font-semibold block">{bt.name}</span>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">+{bt.defaultPoints} БАЛІВ</div>
                  </button>
                ))}
              </div>
              <button className="btn-neon-pink w-full text-sm font-cyber" disabled={!badgeTeamId || !badgeType}
                      onClick={awardBadge}>
                Видати бейдж
              </button>
            </div>
          </div>

          {/* Current Scores */}
          <div className="card-cyber">
            <h2 className="font-cyber text-lg text-neon-cyan mb-4">ПОТОЧНІ БАЛИ</h2>
            <div className="space-y-2">
              {scores.map((s, idx) => (
                <div key={s.teamId} className="flex items-center justify-between py-2 border-b border-cyber-border/50">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gray-500 text-sm w-6 font-mono">{idx + 1}.</span>
                    <span>Команда #{s.teamId}</span>
                    <div className="flex flex-wrap gap-1">
                      {s.badges?.map((b, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded text-[8px] bg-neon-pink/15 text-neon-pink border border-neon-pink/30 uppercase tracking-wider font-semibold font-mono flex items-center justify-center">
                          <svg className="w-2 h-2 mr-1 text-neon-pink animate-pulse" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                          </svg>
                          {b.badgeType}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-cyber text-neon-cyan mr-2">{s.totalScore}</span>
                    <div className="flex gap-1">
                      <button className="text-xs px-2 py-1 border border-neon-green/30 text-neon-green rounded hover:bg-neon-green/20 font-mono"
                              onClick={() => addScore(s.teamId, 5, 'Бонус')}>+5</button>
                      <button className="text-xs px-2 py-1 border border-red-500/30 text-red-400 rounded hover:bg-red-500/20 font-mono"
                              onClick={() => addScore(s.teamId, -5, 'Штраф')}>-5</button>
                    </div>
                  </div>
                </div>
              ))}
              {scores.length === 0 && <div className="text-gray-500 text-center py-4 font-mono text-xs">Немає команд</div>}
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
                    <span className="ml-2 text-[9px] px-1.5 py-0.5 bg-neon-pink/15 text-neon-pink border border-neon-pink/30 rounded uppercase font-mono font-semibold">
                      {f.formType}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">{new Date(f.updatedAt).toLocaleString('uk-UA')}</span>
                </div>
              )) : (
                <div className="text-gray-500 text-center py-4 font-mono text-xs">Немає заповнених форм</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
