'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/dashboard')
    })
  }, [router])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Shield size={40} style={{ color: 'var(--accent)' }} />
          <h1 className="text-2xl font-bold">SafeCircle</h1>
          <p style={{ color: 'var(--fg-muted)' }} className="text-sm">Sign in to your account</p>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            required className="rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--fg)' }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
            required className="rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--fg)' }} />
          {error && <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}
          <button type="submit" disabled={loading}
            className="rounded-xl py-3 font-semibold transition-opacity disabled:opacity-60"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm" style={{ color: 'var(--fg-muted)' }}>
          No account?{' '}
          <Link href="/signup" style={{ color: 'var(--accent)' }} className="font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
