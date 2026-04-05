'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type State = 'loading' | 'success' | 'missing_token' | 'error'

export default function AuthCallback() {
  const [state, setState] = useState<State>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')

    if (!access_token || !refresh_token) {
      setState('missing_token')
      return
    }

    supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
      if (error) { setErrorMsg(error.message); setState('error') }
      else setState('success')
    })
  }, [])

  const screens: Record<State, { icon: string; title: string; body: string; btn: string }> = {
    loading:       { icon: '🛡️', title: 'Signing you in…',          body: 'Please wait while we verify your credentials.',                    btn: '' },
    success:       { icon: '✅', title: 'You\'re signed in!',        body: 'Your account has been verified. Tap below to open SafeCircle.',    btn: 'Open SafeCircle' },
    missing_token: { icon: '⚠️', title: 'Missing credentials',       body: 'The sign-in link is incomplete or has already been used.',         btn: 'Back to Home' },
    error:         { icon: '❌', title: 'Sign in failed',             body: errorMsg || 'Something went wrong. Please try signing in again.',   btn: 'Back to Home' },
  }

  const s = screens[state]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#060b18', color: '#f1f5f9', fontFamily: 'system-ui', gap: 20, padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 56, animation: state === 'loading' ? 'spin 1.2s linear infinite' : undefined }}>{s.icon}</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{s.title}</h2>
      <p style={{ color: '#64748b', fontSize: 15, maxWidth: 360, lineHeight: 1.6, margin: 0 }}>{s.body}</p>
      {s.btn && (
        <a href="/" style={{ marginTop: 8, background: state === 'success' ? 'linear-gradient(135deg,#4F6EF7,#7c3aed)' : 'rgba(255,255,255,0.08)', color: '#fff', padding: '14px 36px', borderRadius: 999, fontSize: 15, fontWeight: 700, border: state === 'success' ? 'none' : '1px solid rgba(255,255,255,0.12)' }}>
          {s.btn}
        </a>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
