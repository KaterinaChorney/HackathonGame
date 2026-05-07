import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import formsApi from '../services/formsApi'

const SECTIONS = [
  { key: 'targetUser', label: 'Target User', icon: '👤', placeholder: 'Хто ваш цільовий користувач? Опишіть його характеристики, демографію...' },
  { key: 'painPoint', label: 'Pain Point', icon: '😣', placeholder: 'Яка больова точка? Що саме не влаштовує користувача?' },
  { key: 'currentSolutions', label: 'Current Solutions', icon: '🔧', placeholder: 'Які рішення існують зараз? Чому вони не задовольняють?' },
  { key: 'workarounds', label: 'Workarounds', icon: '🔄', placeholder: 'Як користувачі обходять проблему? Тимчасові рішення?' },
  { key: 'scale', label: 'Scale', icon: '📊', placeholder: 'Який масштаб проблеми? Скільки людей стикаються? Ринок?' },
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
        <div className="text-sm">
          {saving && <span className="text-yellow-400">💾 Збереження...</span>}
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
              <span className="text-2xl">{section.icon}</span>
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
        <button className="btn-neon-pink" onClick={() => autoSave(data)}>
          💾 Зберегти
        </button>
      </div>
    </div>
  )
}
