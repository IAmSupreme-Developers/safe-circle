'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/dashboard')
    })
  }, [router])

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    setDone(true)
  }

  if (done) return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center gap-4">
      <Shield size={48} style={{ color: 'var(--accent)' }} />
      <h1 className="text-2xl font-bold">Check your email</h1>
      <p className="text-sm max-w-xs" style={{ color: 'var(--fg-muted)' }}>
        We sent a verification link to <strong>{form.email}</strong>. Click it to activate your account, then sign in.
      </p>
      <Link href="/login" className="mt-2 rounded-xl px-6 py-3 font-semibold text-sm"
        style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
        Go to Sign In
      </Link>
    </div>
  )

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [key]: e.target.value }))
  })

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Shield size={40} style={{ color: 'var(--accent)' }} />
          <h1 className="text-2xl font-bold">Create Account</h1>
        </div>
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          {(['name', 'email', 'password'] as const).map(key => (
            <input key={key} type={key === 'password' ? 'password' : key === 'email' ? 'email' : 'text'}
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              required {...field(key)}
              className="rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--fg)' }} />
          ))}
          {error && <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}
          <button type="submit" disabled={loading}
            className="rounded-xl py-3 font-semibold transition-opacity disabled:opacity-60"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm" style={{ color: 'var(--fg-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent)' }} className="font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
