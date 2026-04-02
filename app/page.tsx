'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Onboarding from './components/Onboarding'

export default function Home() {
  const router = useRouter()
  const [show, setShow] = useState<'loading' | 'onboarding' | 'done'>('loading')

  useEffect(() => {
    const seen = localStorage.getItem('sc_onboarded')
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) { router.replace('/dashboard'); return }
      setShow(seen ? 'done' : 'onboarding')
    })
  }, [router])

  function handleDone() {
    localStorage.setItem('sc_onboarded', '1')
    router.push('/login')
  }

  if (show === 'loading') return null
  if (show === 'onboarding') return <Onboarding onDone={handleDone} />
  // already seen onboarding, not logged in
  if (show === 'done') { router.replace('/login'); return null }
}
