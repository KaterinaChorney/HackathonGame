import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import formsApi from '../services/formsApi'
import sessionHubService from '../services/sessionHubService'

function DrawingCanvas({ value, onChange }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const isLoadedRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = '#ec4899' // neon-pink
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Only draw the initial value once
    if (value && value.startsWith('data:image/') && !isLoadedRef.current) {
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        isLoadedRef.current = true
      }
      img.src = value
    } else if (!value) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      isLoadedRef.current = true
    }
  }, [value])

  const getCoords = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    
    // Handle touch events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    }
  }

  const startDrawing = (e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { x, y } = getCoords(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { x, y } = getCoords(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      onChange(canvas.toDataURL())
    }
  }

  const clear = (e) => {
    e.stopPropagation()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    onChange('')
  }

  return (
    <div className="relative w-full h-[100px] bg-cyber-darker border border-cyber-border rounded overflow-hidden">
      <canvas
        ref={canvasRef}
        width={300}
        height={100}
        className="w-full h-full cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <button
        type="button"
        onClick={clear}
        className="absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded bg-black/50 hover:bg-black text-gray-400 hover:text-white transition-all border border-cyber-border/40"
      >
        Очистити
      </button>
    </div>
  )
}

export default function Crazy8sPage() {
  const { sessionId, teamId } = useParams()
  const [ideas, setIdeas] = useState(Array(8).fill({ text: '', mode: 'text' }))
  const [formId, setFormId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [timeLeft, setTimeLeft] = useState(480) // 8 minutes
  const [activeBlock, setActiveBlock] = useState(0)
  const saveTimerRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await formsApi.getForm(sessionId, teamId, 'CRAZY_8S')
        const parsed = JSON.parse(res.data.data)
        if (parsed.ideas) {
          setIdeas(parsed.ideas)
        } else {
          setIdeas(Array(8).fill({ text: '', mode: 'text' }))
        }
        setFormId(res.data.id)
      } catch (e) {
        // Reset states to empty defaults on failure/not found
        setIdeas(Array(8).fill({ text: '', mode: 'text' }))
        setFormId(null)
      }
    }
    load()
  }, [sessionId, teamId])

  useEffect(() => {
    sessionHubService.startConnection(sessionId)
    
    const handleTimerTick = ({ remaining }) => {
      setTimeLeft(remaining)
      // If remaining is 480, elapsed is 0 -> block 0.
      // Every 60s elapsed moves to next block.
      const elapsed = 480 - remaining
      if (elapsed >= 0) {
        const newBlock = Math.min(Math.floor(elapsed / 60), 7)
        setActiveBlock(prev => newBlock !== prev ? newBlock : prev)
      }
    }

    sessionHubService.onTimerTick(handleTimerTick)

    return () => {
      sessionHubService.offTimerTick(handleTimerTick)
      sessionHubService.stopConnection()
    }
  }, [sessionId])

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

      </div>

      {/* 8 blocks (2x4 grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ideas.map((idea, idx) => (
          <div key={idx}
               className={`card-cyber p-3 transition-all duration-300 cursor-pointer ${
                 idx === activeBlock
                   ? 'border-neon-pink shadow-neon-pink ring-1 ring-neon-pink'
                   : ''
               }`}
               onClick={() => setActiveBlock(idx)}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-cyber text-xs text-gray-400">#{idx + 1}</span>
              <button
                className={`text-xs px-2 py-0.5 rounded uppercase font-mono tracking-wider font-semibold ${
                  idea.mode === 'text' ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-neon-pink/20 text-neon-pink'
                }`}
                onClick={(e) => { e.stopPropagation(); updateIdea(idx, 'mode', idea.mode === 'text' ? 'draw' : 'text') }}>
                {idea.mode === 'text' ? 'Текст' : 'Малюнок'}
              </button>
            </div>
            {idea.mode === 'text' ? (
              <textarea
                className="w-full bg-transparent border-none text-sm resize-none focus:outline-none placeholder-gray-600 min-h-[100px]"
                placeholder={`Ідея ${idx + 1}...`}
                value={idea.text || ''}
                onChange={e => updateIdea(idx, 'text', e.target.value)}
              />
            ) : (
              <DrawingCanvas
                value={idea.text || ''}
                onChange={val => updateIdea(idx, 'text', val)}
              />
            )}
          </div>
        ))}
      </div>

      <div className="text-center">
        <button className="btn-neon-pink flex items-center justify-center gap-2 mx-auto uppercase tracking-widest font-cyber text-xs" onClick={() => autoSave(ideas)}>
          <svg className="w-4 h-4 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
          </svg>
          Зберегти всі ідеї
        </button>
      </div>
    </div>
  )
}
