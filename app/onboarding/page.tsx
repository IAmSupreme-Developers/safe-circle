'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import { ONBOARDING_SLIDES } from '@/lib/data'

export default function OnboardingPage() {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const slide = ONBOARDING_SLIDES[index]
  const last = index === ONBOARDING_SLIDES.length - 1

  function done() {
    localStorage.setItem('sc_onboarded', '1')
    router.push('/login')
  }

  return (
    <div className="flex h-screen flex-col" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <div className="flex justify-end px-6 pt-10">
        {!last && <button onClick={done} className="text-sm" style={{ color: 'var(--fg-muted)' }}>skip</button>}
      </div>

      <div className="flex flex-1 items-center justify-center px-8">
        <img src={slide.img} alt={slide.title} className="w-full max-w-xs object-contain" style={{ maxHeight: 320 }} />
      </div>

      <div className="flex justify-center gap-2 pb-6">
        {ONBOARDING_SLIDES.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} className="h-2.5 rounded-full transition-all"
            style={{ width: i === index ? 24 : 10, background: i === index ? 'var(--primary)' : 'var(--border)' }} />
        ))}
      </div>

      <div className="px-8 pb-12 space-y-3">
        <h2 className="text-2xl font-black text-center">{slide.title}</h2>
        <p className="text-center text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>{slide.body}</p>
        {last
          ? <button onClick={done} className="mt-4 w-full flex items-center justify-center gap-2 rounded-full py-4 font-semibold"
              style={{ background: 'var(--primary)', color: '#fff' }}>
              <ArrowUpRight size={18} /> Get Started
            </button>
          : <button onClick={() => setIndex(i => i + 1)} className="mt-4 w-full rounded-full py-4 font-semibold"
              style={{ background: 'var(--primary)', color: '#fff' }}>
              Next
            </button>}
      </div>
    </div>
  )
}
