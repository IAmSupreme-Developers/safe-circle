'use client'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/app/components/AuthProvider'
import { createDb } from '@/lib/db'
import { Card, Input, Button, Skeleton } from '@/app/components/ui'
import { BackButton } from '@/app/components/shared'
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

type Zone = {
  id: string; label: string; lat: number; lng: number
  radius_meters: number; exit_message: string | null
  exit_severity: string; is_enabled: boolean
}

const EMPTY = { label: '', lat: '', lng: '', radius_meters: '200', exit_message: '', exit_severity: 'warning' }
const SEVERITIES = ['info', 'warning', 'danger'] as const

export default function ZonesPage({ params }: { params: Promise<{ id: string }> }) {
  const { token } = useAuth()
  const db = useMemo(() => token ? createDb(token) : null, [token])
  const [trackerId, setTrackerId] = useState<string | null>(null)
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => { params.then(p => setTrackerId(p.id)) }, [params])

  async function load() {
    if (!db || !trackerId) return
    const data: any = await db.zones.list(trackerId).catch(() => [])
    setZones(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [db, trackerId])

  async function create(e: React.FormEvent) {
    e.preventDefault(); setError('')
    if (!trackerId || !db) return
    try {
      await db.zones.create(trackerId, {
        label: form.label, lat: Number(form.lat), lng: Number(form.lng),
        radius_meters: Number(form.radius_meters),
        exit_message: form.exit_message || null,
        exit_severity: form.exit_severity,
      })
      setForm(EMPTY); setShowForm(false); load()
    } catch (err: any) { setError(err.message) }
  }

  async function toggle(z: Zone) {
    if (!trackerId || !db) return
    await db.zones.update(trackerId, z.id, { is_enabled: !z.is_enabled })
    load()
  }

  async function remove(zoneId: string) {
    if (!trackerId || !db || !confirm('Delete this zone?')) return
    await db.zones.delete(trackerId, zoneId)
    load()
  }

  const severityColor: Record<string, string> = { info: 'var(--info)', warning: 'var(--warning)', danger: 'var(--danger)' }

  return (
    <div className="px-4 py-6 space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton href="/tracking" />
          <h1 className="text-xl font-bold">Safe Zones</h1>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium"
          style={{ background: 'var(--primary)', color: '#fff' }}>
          <Plus size={16} /> Add
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="rounded-2xl border p-4 space-y-3"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <p className="font-semibold">New Safe Zone</p>
          <Input placeholder="Zone label (e.g. School)" required value={form.label} onChange={set('label')} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Latitude" required value={form.lat} onChange={set('lat')} />
            <Input placeholder="Longitude" required value={form.lng} onChange={set('lng')} />
          </div>
          <Input placeholder="Radius (metres)" value={form.radius_meters} onChange={set('radius_meters')} />
          <Input placeholder="Exit alert message (optional)" value={form.exit_message} onChange={set('exit_message')} />
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--fg-muted)' }}>Exit severity</label>
            <select value={form.exit_severity} onChange={set('exit_severity')}
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }}>
              {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {error && <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}
          <Button type="submit" className="w-full">Create Zone</Button>
        </form>
      )}

      {loading
        ? <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} style={{ height: 80 }} />)}</div>
        : zones.length === 0
          ? <p className="text-sm text-center py-8" style={{ color: 'var(--fg-muted)' }}>No safe zones yet.</p>
          : zones.map(z => (
            <Card key={z.id}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: severityColor[z.exit_severity] }} />
                    <p className="font-semibold text-sm">{z.label}</p>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>
                    {z.radius_meters}m radius · {z.lat.toFixed(4)}, {z.lng.toFixed(4)}
                  </p>
                  {z.exit_message && (
                    <p className="text-xs mt-0.5 italic" style={{ color: 'var(--fg-muted)' }}>"{z.exit_message}"</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => toggle(z)}>
                    {z.is_enabled
                      ? <ToggleRight size={24} style={{ color: 'var(--primary)' }} />
                      : <ToggleLeft size={24} style={{ color: 'var(--fg-muted)' }} />}
                  </button>
                  <button onClick={() => remove(z.id)}>
                    <Trash2 size={16} style={{ color: 'var(--danger)' }} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
    </div>
  )
}
