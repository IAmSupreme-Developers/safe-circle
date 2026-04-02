'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/app/components/AuthProvider'
import { createDb } from '@/lib/db'
import { severityColor, type Alert } from '@/lib/types'
import { CheckCheck } from 'lucide-react'

const FILTERS = ['all', 'unread', 'danger', 'warning', 'info'] as const
type Filter = typeof FILTERS[number]

function AlertItem({ alert, onRead }: { alert: Alert; onRead: () => void }) {
  return (
    <button onClick={onRead} className="w-full text-left mb-2">
      <div className="rounded-2xl border px-4 py-3"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', opacity: alert.is_read ? 0.55 : 1 }}>
        <div className="flex items-start gap-3">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: severityColor[alert.severity] }} />
          <div className="flex-1">
            <p className="text-sm">{alert.message}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs capitalize" style={{ color: severityColor[alert.severity] }}>{alert.severity}</span>
              <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>· {new Date(alert.created_at).toLocaleString()}</span>
            </div>
          </div>
          {!alert.is_read && <span className="h-2 w-2 rounded-full shrink-0 mt-1.5" style={{ background: 'var(--accent)' }} />}
        </div>
      </div>
    </button>
  )
}

export default function AlertsPage() {
  const { user, token } = useAuth()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const db = token ? createDb(token) : null

  async function load() {
    if (!db) return
    const data: any = await db.alerts.list().catch(() => [])
    setAlerts(data ?? [])
  }

  useEffect(() => { load() }, [token])

  async function markAllRead() {
    await db?.alerts.markAllRead()
    load()
  }

  async function markRead(id: string) {
    await db?.alerts.markRead(id)
    setAlerts(a => a.map(x => x.id === id ? { ...x, is_read: true } : x))
  }

  const visible = alerts.filter(a =>
    filter === 'all' ? true :
    filter === 'unread' ? !a.is_read :
    a.severity === filter
  )

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Alerts</h1>
        <button onClick={markAllRead} className="flex items-center gap-1 text-sm" style={{ color: 'var(--accent)' }}>
          <CheckCheck size={16} /> Mark all read
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize"
            style={{
              background: filter === f ? 'var(--accent)' : 'var(--bg-card)',
              color: filter === f ? 'var(--accent-fg)' : 'var(--fg-muted)',
              border: '1px solid var(--border)'
            }}>{f}</button>
        ))}
      </div>

      {visible.length === 0
        ? <p className="py-8 text-center text-sm" style={{ color: 'var(--fg-muted)' }}>No alerts.</p>
        : visible.map(a => <AlertItem key={a.id} alert={a} onRead={() => markRead(a.id)} />)}
    </div>
  )
}
