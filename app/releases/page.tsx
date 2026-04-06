'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

type Release = {
  id: string
  version: string
  build_number: number
  platform: string
  channel: string
  title: string
  notes: string | null
  download_url: string | null
  is_latest: boolean
  created_at: string
}

const PLATFORM_ICON: Record<string, string> = { android: '🤖', ios: '🍎', all: '📱' }
const CHANNEL_COLOR: Record<string, string> = { stable: '#22c55e', beta: '#f59e0b', alpha: '#ef4444' }

export default function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'stable' | 'beta'>('all')

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/releases?select=*&order=created_at.desc`, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      }
    })
      .then(r => r.json())
      .then(data => { setReleases(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? releases : releases.filter(r => r.channel === filter)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)', fontFamily: 'system-ui', padding: '80px 6vw 60px' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 56 }}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 14, marginBottom: 32 }}>
          ← Back to home
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#4F6EF7,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🛡️</div>
          <div>
            <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, letterSpacing: '-1px', margin: 0 }}>Releases</h1>
            <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>SafeCircle app release history</p>
          </div>
        </div>
      </motion.div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
        {(['all', 'stable', 'beta'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '8px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', textTransform: 'capitalize', background: filter === f ? '#4F6EF7' : 'rgba(255,255,255,0.06)', color: filter === f ? '#fff' : '#64748b', transition: 'all 0.2s' }}>
            {f}
          </button>
        ))}
      </div>

      {/* Releases */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: 120, borderRadius: 20, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#334155' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <p>No releases yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${r.is_latest ? 'rgba(79,110,247,0.4)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 20, padding: '24px 28px', position: 'relative' }}>

              {r.is_latest && (
                <span style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(79,110,247,0.15)', color: '#4F6EF7', border: '1px solid rgba(79,110,247,0.3)', borderRadius: 999, padding: '3px 12px', fontSize: 11, fontWeight: 700 }}>
                  LATEST
                </span>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 20 }}>{PLATFORM_ICON[r.platform] ?? '📱'}</span>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{r.title}</h3>
                    <span style={{ fontSize: 12, fontWeight: 700, color: CHANNEL_COLOR[r.channel] ?? '#94a3b8', background: `${CHANNEL_COLOR[r.channel]}18`, border: `1px solid ${CHANNEL_COLOR[r.channel]}44`, borderRadius: 999, padding: '2px 10px', textTransform: 'uppercase' }}>
                      {r.channel}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b', marginBottom: r.notes ? 16 : 0 }}>
                    <span>v{r.version}</span>
                    <span>Build {r.build_number}</span>
                    <span>{new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  {r.notes && (
                    <div style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, whiteSpace: 'pre-line', marginTop: 8, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      {r.notes}
                    </div>
                  )}
                </div>

                {r.download_url && (
                  <a href={r.download_url} download
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#4F6EF7,#7c3aed)', color: '#fff', padding: '12px 24px', borderRadius: 999, fontSize: 14, fontWeight: 700, flexShrink: 0, alignSelf: 'flex-start' }}>
                    ⬇️ Download
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        [data-theme="light"] { --bg:#f8fafc; --fg:#0f172a; }
        [data-theme="dark"], :root { --bg:#060b18; --fg:#f1f5f9; }
      `}</style>
    </div>
  )
}
