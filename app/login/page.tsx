'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GoogleIcon } from '../components/ui'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/dashboard')
    })
  }, [router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword(form)
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  async function handleGoogle() {

    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/dashboard` }
    })
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="flex h-screen flex-col" style={{ background: 'var(--bg)' }}>
      <div className="max-h-[300px] flex-1 bg-gradient-to-br from-blue-300 via-blue-400 to-indigo-500">
        <img src="/img/signin.jpg" alt="Logo" className="w-full h-full object-fit" />
      </div>

      <div className="rounded-t-3xl px-6 py-8 space-y-4 shadow-xl bottom-0 absolute h-[70%]" style={{ background: 'var(--bg)' }}>
        <button onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 rounded-full border py-3.5 text-sm font-medium"
          style={{ borderColor: '#e0e0e0' }}>
          <GoogleIcon />
          Sign in with google
        </button>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-sm" style={{ color: 'var(--fg-muted)' }}>or</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>
        <input type="email" placeholder="Email" value={form.email} onChange={set('email')} required
          className="w-full rounded-full px-5 py-3.5 text-sm outline-none"
          style={{ background: 'var(--bg-input)', color: 'var(--fg)' }} />
        <input type="password" placeholder="password" value={form.password} onChange={set('password')} required
          className="w-full rounded-full px-5 py-3.5 text-sm outline-none"
          style={{ background: 'var(--bg-input)', color: 'var(--fg)' }} />
        {error && <p className="text-xs text-center" style={{ color: 'var(--danger)' }}>{error}</p>}
        <button onClick={handleLogin} disabled={loading}
          className="w-full rounded-full py-4 font-semibold text-sm disabled:opacity-60"
          style={{ background: 'var(--primary)', color: '#fff' }}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
        <p className="text-xs text-center" style={{ color: 'var(--fg-muted)' }}>
          Don't have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--primary)' }} className="font-semibold">Sign up here</Link>
        </p>
      </div>
    </div>
  )
}
