'use client'
import { useState } from 'react'
import { Shield, MapPin, Users, ChevronRight } from 'lucide-react'

const slides = [
  {
    icon: Shield,
    title: 'Welcome to SafeCircle',
    body: 'Your community-powered safety net. Keep your loved ones protected, wherever they are.',
  },
  {
    icon: MapPin,
    title: 'Track Your Kids',
    body: 'Register a SafeCircle tracker to see your child\'s location in real time and get instant alerts when they leave a safe zone.',
  },
  {
    icon: Users,
    title: 'Search Together',
    body: 'When every second counts, activate Search Party mode to coordinate with your community and cover more ground — fast.',
  },
]

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0)
  const last = index === slides.length - 1
  const { icon: Icon, title, body } = slides[index]

  return (
    <div className="flex min-h-screen flex-col items-center justify-between px-8 py-16">
      {/* Slide */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full"
          style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}>
          <Icon size={44} style={{ color: 'var(--accent)' }} />
        </div>
        <h1 className="text-2xl font-bold leading-snug">{title}</h1>
        <p className="text-base leading-relaxed max-w-xs" style={{ color: 'var(--fg-muted)' }}>{body}</p>
      </div>

      {/* Dots */}
      <div className="flex gap-2 mb-8">
        {slides.map((_, i) => (
          <span key={i} className="h-2 rounded-full transition-all"
            style={{
              width: i === index ? 20 : 8,
              background: i === index ? 'var(--accent)' : 'var(--border)'
            }} />
        ))}
      </div>

      {/* CTA */}
      <div className="w-full space-y-3">
        <button onClick={() => last ? onDone() : setIndex(i => i + 1)}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-base"
          style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
          {last ? 'Get Started' : 'Next'} <ChevronRight size={18} />
        </button>
        {!last && (
          <button onClick={onDone} className="w-full py-3 text-sm" style={{ color: 'var(--fg-muted)' }}>
            Skip
          </button>
        )}
      </div>
    </div>
  )
}
