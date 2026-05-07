import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import formsApi from '../services/formsApi'

export default function FormsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [sessionId, setSessionId] = useState('')
  const [teamId, setTeamId] = useState('')
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Prefill from URL query params or localStorage
  useEffect(() => {
    const urlSession = searchParams.get('session')
    const urlTeam = searchParams.get('team')
    const s = urlSession || localStorage.getItem('hackathon_session') || ''
    const t = urlTeam || localStorage.getItem('hackathon_teamId') || ''
    setSessionId(s)
    setTeamId(t)
  }, [])

  const loadForms = async () => {
    if (!sessionId || !teamId) return
    setLoading(true)
    try {
      const res = await formsApi.getTeamForms(sessionId, teamId)
      setForms(res.data)
      setLoaded(true)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const FORM_TYPES = [
    { type: 'PROBLEM_CANVAS', name: 'Problem Canvas', icon: '🧩', desc: 'Визначте проблему, цільового користувача та поточні рішення', route: 'canvas' },
    { type: 'CRAZY_8S', name: 'Crazy 8s', icon: '🎨', desc: '8 ідей за 8 хвилин — швидка генерація концепцій', route: 'crazy8s' },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-cyber text-4xl text-neon-pink mb-2">ФОРМИ</h1>
        <p className="text-gray-400">Інтерактивні шаблони для хакатону</p>
      </div>

      <div className="flex gap-4 justify-center flex-wrap">
        <input className="input-cyber max-w-xs text-center font-mono tracking-widest uppercase"
               placeholder="Код сесії" value={sessionId}
               onChange={e => setSessionId(e.target.value.toUpperCase())} maxLength={6} />
        <input className="input-cyber max-w-[120px] text-center"
               placeholder="Team ID" value={teamId} type="number"
               onChange={e => setTeamId(e.target.value)} />
        <button className="btn-neon" onClick={loadForms}>
          {loading ? 'Завантаження...' : 'Завантажити'}
        </button>
      </div>

      {sessionId && teamId && (
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {FORM_TYPES.map(ft => {
            const existing = forms.find(f => f.formType === ft.type)
            return (
              <div key={ft.type} className="card-cyber hover:border-neon-pink/50 cursor-pointer group"
                   onClick={() => navigate(`/forms/${ft.route}/${sessionId}/${teamId}`)}>
                <div className="text-4xl mb-3">{ft.icon}</div>
                <h3 className="font-cyber text-lg text-neon-pink mb-2 group-hover:text-neon-cyan transition-colors">
                  {ft.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{ft.desc}</p>
                {existing ? (
                  <span className="text-xs px-3 py-1 bg-neon-green/20 text-neon-green rounded-full border border-neon-green/30">
                    ✓ Заповнено
                  </span>
                ) : (
                  <span className="text-xs px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full border border-gray-500/30">
                    Не заповнено
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {loaded && forms.length === 0 && (
        <div className="text-center text-gray-500">
          Форми ще не заповнені. Оберіть шаблон щоб почати.
        </div>
      )}
    </div>
  )
}
