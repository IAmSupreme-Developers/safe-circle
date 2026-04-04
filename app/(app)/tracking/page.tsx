'use client'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/app/components/AuthProvider'
import { createDb } from '@/lib/db'
import type { Tracker } from '@/lib/types'
import { Card, Input, Button } from '@/app/components/ui'
import { Plus, Trash2, MapPin, ToggleLeft, ToggleRight, Map, Shield } from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@/app/components/ui'
import { useToast } from '@/app/components/Toast'

const EMPTY_FORM = { label: '', device_id: '', code: '' }
type Db = ReturnType<typeof createDb>

function TrackerCard({ tracker, onToggle, onDelete }: { tracker: Tracker; onToggle: () => void; onDelete: () => void }) {
  return (
    <Card style={{ marginBottom: 8 }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{tracker.label}</p>
          <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>ID: {tracker.device_id}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onToggle}>
            {tracker.is_active
              ? <ToggleRight size={24} style={{ color: 'var(--accent)' }} />
              : <ToggleLeft size={24} style={{ color: 'var(--fg-muted)' }} />}
          </button>
          <button onClick={onDelete}><Trash2 size={18} style={{ color: 'var(--danger)' }} /></button>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: 'var(--fg-muted)' }}>
        <MapPin size={12} />
        {tracker.last_lat && tracker.last_lng
          ? <>{tracker.last_lat.toFixed(5)}, {tracker.last_lng.toFixed(5)}{tracker.last_seen && ` · ${new Date(tracker.last_seen).toLocaleTimeString()}`}</>
          : 'No location data yet'}
      </div>
    </Card>
  )
}

function RegisterForm({ db, onDone }: { db: Db; onDone: () => void }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await db.trackers.register(form)
      setForm(EMPTY_FORM)
      onDone()
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border p-4 space-y-3"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <h2 className="font-semibold">Register Device</h2>
      <Input placeholder="Label (e.g. Emma's Backpack)" required value={form.label} onChange={set('label')} />
      <Input placeholder="Device ID (on device label)" required value={form.device_id} onChange={set('device_id')} />
      <Input placeholder="One-time registration code" required value={form.code} onChange={set('code')} />
      {error && <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">{loading ? 'Registering…' : 'Register'}</Button>
    </form>
  )
}

export default function TrackingPage() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [trackers, setTrackers] = useState<Tracker[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const db = useMemo(() => token ? createDb(token) : null, [token])

  async function load() {
    if (!db) return
    try {
      const data: any = await db.trackers.list()
      setTrackers(data ?? [])
    } catch (e: any) {
      toast(e?.message ?? 'Failed to load trackers', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [db])

  async function toggle(t: Tracker) {
    try {
      await db?.trackers.update(t.id, { is_active: !t.is_active })
      load()
    } catch (e: any) { toast(e?.message ?? 'Failed to update tracker', 'error') }
  }

  async function remove(id: string) {
    if (!confirm('Remove this tracker?')) return
    try {
      await db?.trackers.delete(id)
      load()
    } catch (e: any) { toast(e?.message ?? 'Failed to remove tracker', 'error') }
  }

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Trackers</h1>
        <div className="flex items-center gap-2">
          <Link href="/map" className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium border"
            style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}>
            <Map size={15} /> Map
          </Link>
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {loading
        ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} style={{ height: 80 }} />)}</div>
        : showForm && db
          ? <RegisterForm db={db} onDone={() => { setShowForm(false); load() }} />
          : trackers.length === 0 && !showForm
            ? <p className="text-sm text-center py-8" style={{ color: 'var(--fg-muted)' }}>No trackers registered yet.</p>
            : trackers.map(t => <TrackerCard key={t.id} tracker={t} onToggle={() => toggle(t)} onDelete={() => remove(t.id)} />)}
    </div>
  )
}
