import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import formsApi from '../services/formsApi'

const SECTIONS = [
  { key: 'targetUser', label: 'Target User', placeholder: 'Хто ваш цільовий користувач? Опишіть його характеристики, демографію...' },
  { key: 'painPoint', label: 'Pain Point', placeholder: 'Яка больова точка? Що саме не влаштовує користувача?' },
  { key: 'currentSolutions', label: 'Current Solutions', placeholder: 'Які рішення існують зараз? Чому вони не задовольняють?' },
  { key: 'workarounds', label: 'Workarounds', placeholder: 'Як користувачі обходять проблему? Тимчасові рішення?' },
  { key: 'scale', label: 'Scale', placeholder: 'Який масштаб проблеми? Скільки людей стикаються? Ринок?' },
]

export default function ProblemCanvasPage() {
  const { sessionId, teamId } = useParams()
  const [data, setData] = useState({})
  const [formId, setFormId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await formsApi.getForm(sessionId, teamId, 'PROBLEM_CANVAS')
        setData(JSON.parse(res.data.data))
        setFormId(res.data.id)
      } catch (e) {
        // Form doesn't exist yet
        setData({})
        setFormId(null)
      }
    }
    load()
  }, [sessionId, teamId])

  const handleChange = (key, value) => {
    const newData = { ...data, [key]: value }
    setData(newData)
    setSaved(false)

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => autoSave(newData), 1500)
  }

  const autoSave = async (saveData) => {
    setSaving(true)
    try {
      if (formId) {
        await formsApi.updateForm(formId, { data: JSON.stringify(saveData) })
      } else {
        const res = await formsApi.saveForm(sessionId, teamId, {
          formType: 'PROBLEM_CANVAS',
          data: JSON.stringify(saveData),
          round: 1
        })
        setFormId(res.data.id)
      }
      setSaved(true)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to={`/forms?session=${sessionId}&team=${teamId}`} className="text-gray-400 hover:text-neon-cyan text-sm">← Назад</Link>
        <div className="text-sm flex items-center gap-2">
          {saving && (
            <span className="text-yellow-400 flex items-center gap-1">
              <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
              </svg>
              Збереження...
            </span>
          )}
          {saved && !saving && <span className="text-neon-green">✓ Збережено</span>}
        </div>
      </div>

      <div className="text-center">
        <h1 className="font-cyber text-3xl text-neon-pink mb-1">PROBLEM CANVAS</h1>
        <p className="text-gray-400 text-sm">
          Сесія: <span className="font-mono text-neon-cyan">{sessionId}</span> · Команда #{teamId}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {SECTIONS.map((section, idx) => (
          <div key={section.key}
               className={`card-cyber animate-fade-in ${idx === 4 ? 'md:col-span-2' : ''}`}
               style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-cyber text-sm text-neon-cyan">{section.label}</h3>
            </div>
            <textarea
              className="input-cyber min-h-[120px] resize-y"
              placeholder={section.placeholder}
              value={data[section.key] || ''}
              onChange={e => handleChange(section.key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="text-center">
        <button className="btn-neon-pink flex items-center justify-center gap-2 mx-auto uppercase tracking-widest font-cyber text-xs" onClick={() => autoSave(data)}>
          <svg className="w-4 h-4 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
          </svg>
          Зберегти
        </button>
      </div>
    </div>
  )
}
