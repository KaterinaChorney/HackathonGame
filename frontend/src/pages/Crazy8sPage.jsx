import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import formsApi from '../services/formsApi'

export default function Crazy8sPage() {
  const { sessionId, teamId } = useParams()
  const [ideas, setIdeas] = useState(Array(8).fill({ text: '', mode: 'text' }))
  const [formId, setFormId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(480) // 8 minutes
  const [activeBlock, setActiveBlock] = useState(0)
  const timerRef = useRef(null)
  const saveTimerRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await formsApi.getForm(sessionId, teamId, 'CRAZY_8S')
        const parsed = JSON.parse(res.data.data)
        if (parsed.ideas) setIdeas(parsed.ideas)
        setFormId(res.data.id)
      } catch (e) { /* not found */ }
    }
    load()
  }, [sessionId, teamId])

  useEffect(() => {
    if (!timerRunning) return
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          setTimerRunning(false)
          clearInterval(interval)
          return 0
        }
        // Switch block every 60 seconds
        const elapsed = 480 - prev + 1
        const newBlock = Math.min(Math.floor(elapsed / 60), 7)
        if (newBlock !== activeBlock) setActiveBlock(newBlock)
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timerRunning])

  const updateIdea = (idx, field, value) => {
    const newIdeas = [...ideas]
    newIdeas[idx] = { ...newIdeas[idx], [field]: value }
    setIdeas(newIdeas)
    setSaved(false)

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => autoSave(newIdeas), 2000)
  }

  const autoSave = async (saveIdeas) => {
    setSaving(true)
    try {
      const payload = JSON.stringify({ ideas: saveIdeas })
      if (formId) {
        await formsApi.updateForm(formId, { data: payload })
      } else {
        const res = await formsApi.saveForm(sessionId, teamId, {
          formType: 'CRAZY_8S', data: payload, round: 1
        })
        setFormId(res.data.id)
      }
      setSaved(true)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  const blockTime = Math.max(0, timeLeft - (7 - activeBlock) * 60)
  const blockTimeFormatted = formatTime(Math.min(blockTime, 60))

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
        <h1 className="font-cyber text-3xl text-neon-pink mb-1">CRAZY 8s</h1>
        <p className="text-gray-400 text-sm">8 ідей за 8 хвилин · Команда #{teamId}</p>
      </div>

      {/* Timer */}
      <div className="card-cyber text-center max-w-md mx-auto">
        <div className={`font-cyber text-4xl mb-2 ${
          timeLeft < 60 ? 'text-red-400 animate-pulse' :
          timeLeft < 180 ? 'text-yellow-400' : 'text-neon-cyan'
        }`}>
          {formatTime(timeLeft)}
        </div>
        <div className="text-sm text-gray-400 mb-3">
          Блок {activeBlock + 1}/8 · {blockTimeFormatted}
        </div>
        <div className="flex gap-2 justify-center">
          {!timerRunning ? (
            <button className="btn-neon text-sm px-4 py-2" onClick={() => setTimerRunning(true)}>
              ▶ Старт
            </button>
          ) : (
            <button className="btn-neon-pink text-sm px-4 py-2" onClick={() => setTimerRunning(false)}>
              ⏸ Пауза
            </button>
          )}
          <button className="text-sm px-4 py-2 border border-gray-600 text-gray-400 rounded-lg hover:text-white"
                  onClick={() => { setTimerRunning(false); setTimeLeft(480); setActiveBlock(0) }}>
            ↻ Скинути
          </button>
        </div>
      </div>

      {/* 8 blocks (2x4 grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ideas.map((idea, idx) => (
          <div key={idx}
               className={`card-cyber p-3 transition-all duration-300 cursor-pointer ${
                 idx === activeBlock && timerRunning
                   ? 'border-neon-pink shadow-neon-pink ring-1 ring-neon-pink'
                   : ''
               }`}
               onClick={() => setActiveBlock(idx)}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-cyber text-xs text-gray-400">#{idx + 1}</span>
              <button
                className={`text-xs px-2 py-0.5 rounded ${
                  idea.mode === 'text' ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-neon-pink/20 text-neon-pink'
                }`}
                onClick={(e) => { e.stopPropagation(); updateIdea(idx, 'mode', idea.mode === 'text' ? 'draw' : 'text') }}>
                {idea.mode === 'text' ? '📝' : '✏️'}
              </button>
            </div>
            <textarea
              className="w-full bg-transparent border-none text-sm resize-none focus:outline-none placeholder-gray-600 min-h-[100px]"
              placeholder={`Ідея ${idx + 1}...`}
              value={idea.text || ''}
              onChange={e => updateIdea(idx, 'text', e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="text-center">
        <button className="btn-neon-pink" onClick={() => autoSave(ideas)}>
          💾 Зберегти всі ідеї
        </button>
      </div>
    </div>
  )
}
