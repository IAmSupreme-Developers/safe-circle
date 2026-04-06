'use client'
import { useRef, useState, useEffect } from 'react'
import { X, Send, Bot } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { useRouter } from 'next/navigation'

type Action = { label: string; href: string }
type Msg = { role: 'user' | 'ai'; text: string; action?: Action | null }

export default function AIAssistant() {
  const { token } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pos, setPos] = useState({ x: 24, y: 120 })
  const dragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return
    const BUTTON_W = 140, BUTTON_H = 44
    const x = Math.min(Math.max(0, e.clientX - offset.current.x), window.innerWidth - BUTTON_W)
    const y = Math.min(Math.max(0, e.clientY - offset.current.y), window.innerHeight - BUTTON_H)
    setPos({ x, y })
  }
  function onPointerUp() { dragging.current = false }

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading || !token) return
    const question = input.trim()
    setInput('')
    setMsgs(m => [...m, { role: 'user', text: question }])
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()
      setMsgs(m => [...m, { role: 'ai', text: data.answer ?? 'Sorry, I could not get a response.', action: data.action }])
    } catch {
      setMsgs(m => [...m, { role: 'ai', text: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Draggable trigger button */}
      <div
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
        style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 50, touchAction: 'none' }}
      >
        <button onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2 rounded-full px-4 py-3 shadow-xl"
          style={{ background: 'var(--primary)', color: '#fff', boxShadow: '0 4px 20px rgba(79,110,247,0.5)' }}>
          {open ? <X size={18} /> : <Bot size={18} />}
          <span className="text-xs font-semibold">{open ? 'Close' : 'AI Assistant'}</span>
        </button>
        {!open && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full animate-ping"
            style={{ background: '#4F6EF7', opacity: 0.6 }} />
        )}
      </div>

      {/* Chat panel — always opens above the button */}
      {open && (
        <div className="fixed z-40 rounded-2xl flex flex-col overflow-hidden"
          style={{
            left: Math.min(pos.x, window.innerWidth - 320),
            bottom: window.innerHeight - pos.y + 8,
            width: 300, height: 400,
            background: 'var(--bg-card)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}>
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
            <Bot size={16} style={{ color: 'var(--primary)' }} />
            <p className="font-semibold text-sm flex-1">SafeCircle AI</p>
            <button onClick={() => setOpen(false)}><X size={15} style={{ color: 'var(--fg-muted)' }} /></button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {msgs.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: 'var(--fg-muted)' }}>
                Ask me anything — "Is Ana safe?", "Any missing kids nearby?", "How many resolved posts do I have?"
              </p>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="rounded-2xl px-3 py-2 text-xs max-w-[85%] leading-relaxed"
                  style={{
                    background: m.role === 'user' ? 'var(--primary)' : 'var(--bg)',
                    color: m.role === 'user' ? '#fff' : 'var(--fg)',
                  }}>
                  {m.text}
                </div>
                {m.action && (
                  <button onClick={() => { router.push(m.action!.href); setOpen(false) }}
                    className="mt-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
                    style={{ background: 'var(--primary)', color: '#fff' }}>
                    {m.action.label} →
                  </button>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-3 py-2 text-xs" style={{ background: 'var(--bg)', color: 'var(--fg-muted)' }}>
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={send} className="flex items-center gap-2 px-3 py-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <input value={input} onChange={e => setInput(e.target.value)} disabled={loading}
              placeholder="Ask something…"
              className="flex-1 bg-transparent text-xs outline-none py-1.5"
              style={{ color: 'var(--fg)' }} />
            <button type="submit" disabled={!input.trim() || loading}
              className="h-7 w-7 rounded-full flex items-center justify-center disabled:opacity-40 flex-shrink-0"
              style={{ background: '#4F6EF7', color: '#fff' }}>
              <Send size={12} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
