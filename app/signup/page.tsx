'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/dashboard')
    })
  }, [router])

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/dashboard` }
    })
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: `${form.first_name} ${form.last_name}`.trim() } }
    })
    if (error) { setError(error.message); setLoading(false) }
    else setDone(true)
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  if (done) return (
    <div className="flex h-screen flex-col items-center justify-center px-8 gap-4 text-center" style={{ background: 'var(--bg)' }}>
      <div className="text-5xl">📧</div>
      <h1 className="text-2xl font-black">Check your email</h1>
      <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
        We sent a verification link to <strong>{form.email}</strong>. Click it to activate your account.
      </p>
      <Link href="/login" className="mt-2 rounded-full px-8 py-3.5 font-semibold text-sm"
        style={{ background: 'var(--primary)', color: '#fff' }}>Go to Sign In</Link>
    </div>
  )

  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )

  return (
    <div className="flex h-screen flex-col" style={{ background: 'var(--bg)' }}>
      <div className="flex-1 bg-gradient-to-br from-orange-300 via-pink-400 to-purple-400" />
      <div className="rounded-t-3xl px-6 py-8 space-y-4 shadow-xl" style={{ background: 'var(--bg)' }}>
        <button onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 rounded-full border py-3.5 text-sm font-medium"
          style={{ borderColor: '#e0e0e0' }}>
          <GoogleIcon /> Sign in with google
        </button>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-sm" style={{ color: 'var(--fg-muted)' }}>or</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="First name" value={form.first_name} onChange={set('first_name')} required
            className="rounded-full px-4 py-3.5 text-sm outline-none"
            style={{ background: 'var(--bg-input)', color: 'var(--fg)' }} />
          <input placeholder="Last name" value={form.last_name} onChange={set('last_name')} required
            className="rounded-full px-4 py-3.5 text-sm outline-none"
            style={{ background: 'var(--bg-input)', color: 'var(--fg)' }} />
        </div>
        <input type="email" placeholder="Email" value={form.email} onChange={set('email')} required
          className="w-full rounded-full px-5 py-3.5 text-sm outline-none"
          style={{ background: 'var(--bg-input)', color: 'var(--fg)' }} />
        <input type="password" placeholder="password" value={form.password} onChange={set('password')} required
          className="w-full rounded-full px-5 py-3.5 text-sm outline-none"
          style={{ background: 'var(--bg-input)', color: 'var(--fg)' }} />
        {error && <p className="text-xs text-center" style={{ color: 'var(--danger)' }}>{error}</p>}
        <button onClick={handleSignup} disabled={loading}
          className="w-full rounded-full py-4 font-semibold text-sm disabled:opacity-60"
          style={{ background: 'var(--primary)', color: '#fff' }}>
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
        <p className="text-xs text-center" style={{ color: 'var(--fg-muted)' }}>
          signing up for an account means you agree with our{' '}
          <strong>privacy and policies</strong> and <strong>terms of services</strong>
        </p>
        <p className="text-xs text-center" style={{ color: 'var(--fg-muted)' }}>
          Have an account?{' '}
          <Link href="/login" style={{ color: 'var(--primary)' }} className="font-semibold">Login here</Link>
        </p>
      </div>
    </div>
  )
}
