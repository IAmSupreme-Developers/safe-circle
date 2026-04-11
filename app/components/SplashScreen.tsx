'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SplashScreen() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) router.replace('/dashboard')
      else {
        const seen = localStorage.getItem('sc_onboarded')
        router.replace(seen ? '/login' : '/onboarding')
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex h-screen w-full items-center justify-center" style={{ background: 'var(--bg)' }}>
      {/* Replace src with actual logo asset */}
      <img src="/devices/logo.png" alt="SafeCircle" className="w-24 h-24 object-contain"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
      {/* Fallback text logo if image missing */}
      <span className="text-3xl font-black" style={{ color: 'var(--primary)' }}>SafeCircle</span>
    </div>
  )
}
