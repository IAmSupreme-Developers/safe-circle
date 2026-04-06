'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Release = { id: string; version: string; build_number: number; platform: string; channel: string; title: string; notes: string | null; download_url: string | null; is_latest: boolean; created_at: string }

const EMPTY = { version: '', build_number: '', platform: 'android', channel: 'beta', title: '', notes: '', download_url: '', is_latest: false }

export default function AdminPage() {
  const [authed, setAuthed] = useState<'loading' | 'ok' | 'denied'>('loading')
  const [token, setToken] = useState('')
  const [releases, setReleases] = useState<Release[]>([])
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { setAuthed('denied'); return }
      setToken(data.session.access_token)
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.session.user.id).single()
      setAuthed(profile?.role === 'admin' ? 'ok' : 'denied')
    })
  }, [])

  async function load() {
    const res = await fetch('/api/admin/releases', { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setReleases(Array.isArray(data) ? data : [])
  }

  useEffect(() => { if (authed === 'ok' && token) load() }, [authed, token])

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    const res = await fetch('/api/admin/releases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, build_number: Number(form.build_number) }),
    })
    if (!res.ok) { setError((await res.json()).error ?? 'Failed'); setSaving(false); return }
    setForm(EMPTY); load(); setSaving(false)
  }

  async function del(id: string) {
    if (!confirm('Delete this release?')) return
    await fetch(`/api/admin/releases/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    load()
  }

  async function toggleLatest(r: Release) {
    await fetch(`/api/admin/releases/${r.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ is_latest: !r.is_latest }),
    })
    load()
  }

  const s = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }))

  if (authed === 'loading') return <div style={center}>Loading…</div>
  if (authed === 'denied') return (
    <div style={{ ...center, flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 48 }}>🔒</div>
      <p style={{ color: '#64748b' }}>Admin access required.</p>
      <a href="/" style={btn}>Go home</a>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#060b18', color: '#f1f5f9', fontFamily: 'system-ui', padding: '60px 6vw' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#4F6EF7,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🛡️</div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Admin Panel</h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>SafeCircle</p>
          </div>
        </div>
        <a href="/" style={{ fontSize: 13, color: '#64748b' }}>← Back to site</a>
      </div>

      {/* Create release */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '28px 32px', marginBottom: 40 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>New Release</h2>
        <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
          {([['version', 'Version (e.g. 1.0.0-beta)'], ['build_number', 'Build Number'], ['title', 'Title'], ['download_url', 'Download URL']] as [keyof typeof form, string][]).map(([k, ph]) => (
            <input key={k} placeholder={ph} value={form[k] as string} onChange={s(k)} required={k !== 'download_url'}
              style={input} />
          ))}
          <select value={form.platform} onChange={s('platform')} style={input}>
            <option value="android">Android</option>
            <option value="ios">iOS</option>
            <option value="all">All</option>
          </select>
          <select value={form.channel} onChange={s('channel')} style={input}>
            <option value="beta">Beta</option>
            <option value="stable">Stable</option>
            <option value="alpha">Alpha</option>
          </select>
          <textarea placeholder="Release notes (markdown)" value={form.notes} onChange={s('notes')} rows={3}
            style={{ ...input, gridColumn: '1 / -1', resize: 'vertical' }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#94a3b8', gridColumn: '1 / -1' }}>
            <input type="checkbox" checked={form.is_latest as boolean} onChange={s('is_latest')} />
            Mark as latest
          </label>
          {error && <p style={{ color: '#ef4444', fontSize: 13, gridColumn: '1 / -1' }}>{error}</p>}
          <button type="submit" disabled={saving} style={{ ...btn, gridColumn: '1 / -1', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Publishing…' : 'Publish Release'}
          </button>
        </form>
      </div>

      {/* Releases list */}
      <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>All Releases</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {releases.map(r => (
          <div key={r.id} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${r.is_latest ? 'rgba(79,110,247,0.4)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 700 }}>{r.title}</span>
                <span style={{ fontSize: 11, color: '#64748b' }}>v{r.version} · build {r.build_number}</span>
                {r.is_latest && <span style={{ fontSize: 11, background: 'rgba(79,110,247,0.15)', color: '#4F6EF7', borderRadius: 999, padding: '2px 8px', fontWeight: 700 }}>LATEST</span>}
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{r.platform} · {r.channel} · {new Date(r.created_at).toLocaleDateString()}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => toggleLatest(r)} style={{ ...smallBtn, background: r.is_latest ? 'rgba(79,110,247,0.15)' : 'rgba(255,255,255,0.06)', color: r.is_latest ? '#4F6EF7' : '#94a3b8' }}>
                {r.is_latest ? '★ Latest' : '☆ Set Latest'}
              </button>
              <button onClick={() => del(r.id)} style={{ ...smallBtn, background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>Delete</button>
            </div>
          </div>
        ))}
        {releases.length === 0 && <p style={{ color: '#334155', textAlign: 'center', padding: 40 }}>No releases yet.</p>}
      </div>
    </div>
  )
}

const center: React.CSSProperties = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060b18', color: '#f1f5f9', fontFamily: 'system-ui' }
const btn: React.CSSProperties = { background: 'linear-gradient(135deg,#4F6EF7,#7c3aed)', color: '#fff', padding: '12px 28px', borderRadius: 999, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', textAlign: 'center' }
const smallBtn: React.CSSProperties = { padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }
const input: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px', fontSize: 14, color: '#f1f5f9', outline: 'none', width: '100%' }
