'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/app/components/AuthProvider'
import { createDb } from '@/lib/db'
import { severityColor, type Alert, type Tracker } from '@/lib/types'
import { Card, SectionHeader } from '@/app/components/ui'
import { Bell, MapPin, Shield, Users } from 'lucide-react'
import Link from 'next/link'

function UnreadBadge({ count }: { count: number }) {
  if (!count) return null
  return (
    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold"
      style={{ background: 'var(--danger)', color: '#fff' }}>{count}</span>
  )
}

function StatCard({ icon: Icon, label, value, href }: { icon: React.ElementType; label: string; value: React.ReactNode; href: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 rounded-2xl border p-4"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <Icon size={20} style={{ color: 'var(--accent)' }} />
      <span className="text-lg font-bold">{value}</span>
      <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>{label}</span>
    </Link>
  )
}

export default function DashboardPage() {
  const { user, token } = useAuth()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [trackers, setTrackers] = useState<Tracker[]>([])
  const [name, setName] = useState('')

  useEffect(() => {
    if (!user || !token) return
    const db = createDb(token)
    db.profile.get().then((data: any) => setName(data?.full_name ?? ''))
    db.alerts.list(5).then((data: any) => setAlerts(data ?? []))
    db.trackers.list().then((data: any) => setTrackers(data ?? []))
  }, [user, token])

  const unread = alerts.filter(a => !a.is_read).length

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>Welcome back</p>
          <h1 className="text-xl font-bold">{name || 'Guardian'}</h1>
        </div>
        <Link href="/alerts" className="relative"><Bell size={24} /><UnreadBadge count={unread} /></Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={MapPin} label="Trackers" value={trackers.length} href="/tracking" />
        <StatCard icon={Bell} label="Alerts" value={unread} href="/alerts" />
        <StatCard icon={Users} label="Search" value="Party" href="/search-party" />
      </div>

      <section>
        <SectionHeader title="Trackers" action={<Link href="/tracking" className="text-sm" style={{ color: 'var(--accent)' }}>Manage</Link>} />
        {trackers.length === 0
          ? <Card><p className="text-sm text-center py-2" style={{ color: 'var(--fg-muted)' }}>No trackers yet. <Link href="/tracking" style={{ color: 'var(--accent)' }}>Add one →</Link></p></Card>
          : trackers.map(t => (
            <Card key={t.id} style={{ marginBottom: 8 }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield size={18} style={{ color: t.is_active ? 'var(--accent)' : 'var(--fg-muted)' }} />
                  <span className="font-medium">{t.label}</span>
                </div>
                <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                  {t.last_seen ? new Date(t.last_seen).toLocaleTimeString() : 'Never'}
                </span>
              </div>
            </Card>
          ))}
      </section>

      <section>
        <SectionHeader title="Recent Alerts" action={<Link href="/alerts" className="text-sm" style={{ color: 'var(--accent)' }}>See all</Link>} />
        {alerts.length === 0
          ? <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>No alerts yet.</p>
          : alerts.map(a => (
            <Card key={a.id} style={{ marginBottom: 8, opacity: a.is_read ? 0.6 : 1 }}>
              <div className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: severityColor[a.severity] }} />
                <div>
                  <p className="text-sm">{a.message}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>{new Date(a.created_at).toLocaleString()}</p>
                </div>
              </div>
            </Card>
          ))}
      </section>
    </div>
  )
}
