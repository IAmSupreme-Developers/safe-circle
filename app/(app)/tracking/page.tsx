'use client'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/app/components/AuthProvider'
import { createDb } from '@/lib/db'
import type { Tracker, TrackerLiveState } from '@/lib/types'
import { Card, Input, Button, Skeleton } from '@/app/components/ui'
import { Plus, Trash2, MapPin, ToggleLeft, ToggleRight, Map, Shield, Battery, Wifi, WifiOff, X, Navigation, Gauge, Mountain } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/app/components/Toast'
import { useTrackerSocket, sendCommand } from '@/lib/trackerSocket'

const EMPTY_FORM = { label: '', device_id: '', code: '' }
type Db = ReturnType<typeof createDb>

// ── Device Carousel ───────────────────────────────────────────────────────────
function DeviceCarousel() {
  const [idx, setIdx] = useState(0)
  const devices = [
    { id: 1, name: 'GPS Tracker Pro', image: '/devices/tracker-1.png' },
    { id: 2, name: 'Mini Tracker', image: '/devices/tracker-2.png' },
    { id: 3, name: 'Smart Tag', image: '/devices/tracker-3.png' },
    { id: 4, name: 'Advanced Tracker', image: '/devices/tracker-4.png' },
  ]

  const ref = (node: HTMLDivElement | null) => {
    if (!node) return
    const onScroll = () => setIdx(Math.round(node.scrollLeft / node.offsetWidth))
    node.addEventListener('scroll', onScroll, { passive: true })
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--fg)' }}>Design Prototype</h2>
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div ref={ref} className="flex overflow-x-auto snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
          {devices.map((device) => (
            <div key={device.id} className="snap-center flex-shrink-0 w-full">
              <div className="relative" style={{ height: 200 }}>
                <div className="absolute inset-0 flex items-center justify-center p-0">
                  <img src={device.image} alt={device.name} className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
          ))}
        </div>
        {devices.length > 1 && (
          <div className="flex justify-center gap-1.5 py-3">
            {devices.map((_, i) => (
              <span key={i} className="h-2 w-2 rounded-full transition-all"
                style={{ background: i === idx ? 'var(--primary)' : 'var(--border)' }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Signal bars based on GPS accuracy ────────────────────────────────────────
function SignalBars({ accuracy, online }: { accuracy?: number; online: boolean }) {
  const bars = !online ? 0 : !accuracy ? 1 : accuracy < 10 ? 4 : accuracy < 30 ? 3 : accuracy < 60 ? 2 : 1
  const color = online ? (bars >= 3 ? '#22c55e' : bars === 2 ? '#f59e0b' : '#ef4444') : '#64748b'
  return (
    <div className="flex items-end gap-0.5" title={accuracy ? `±${accuracy.toFixed(0)}m` : online ? 'Acquiring…' : 'Offline'}>
      {[1, 2, 3, 4].map(b => (
        <div key={b} style={{ width: 4, height: 4 + b * 3, borderRadius: 1, background: b <= bars ? color : 'rgba(100,116,139,0.3)', transition: 'background 0.4s' }} />
      ))}
      {online && bars >= 3 && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full animate-ping" style={{ background: color, opacity: 0.6 }} />}
    </div>
  )
}

// ── Tracker detail sheet ──────────────────────────────────────────────────────
function TrackerSheet({ tracker, live, token, onClose }: { tracker: Tracker; live: TrackerLiveState; token: string; onClose: () => void }) {
  const lat = live.live_lat ?? tracker.last_lat
  const lng = live.live_lng ?? tracker.last_lng
  const lastSeen = live.live_timestamp ?? tracker.last_seen

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full rounded-t-3xl p-6 space-y-5" style={{ background: 'var(--bg-card)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <SignalBars accuracy={live.live_accuracy} online={live.is_online} />
            </div>
            <div>
              <p className="font-bold text-lg">{tracker.label}</p>
              <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                {live.is_online ? '🟢 Online' : '⚫ Offline'}{lastSeen ? ` · ${new Date(lastSeen).toLocaleTimeString()}` : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose}><X size={20} style={{ color: 'var(--fg-muted)' }} /></button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-3 space-y-1" style={{ background: 'var(--bg)' }}>
            <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>Location</p>
            <p className="text-sm font-semibold">
              {lat && lng ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : 'Unknown'}
            </p>
            {live.live_accuracy && <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>±{live.live_accuracy.toFixed(0)}m accuracy</p>}
          </div>

          <div className="rounded-2xl p-3 space-y-1" style={{ background: 'var(--bg)' }}>
            <p className="text-xs flex items-center gap-1" style={{ color: 'var(--fg-muted)' }}><Battery size={11} /> Battery</p>
            {live.battery ? (
              <>
                <p className="text-sm font-semibold" style={{ color: live.battery.level < 20 ? 'var(--danger)' : 'var(--fg)' }}>
                  {live.battery.level}% {live.battery.charging ? '⚡' : ''}
                </p>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div style={{ width: `${live.battery.level}%`, height: '100%', background: live.battery.level < 20 ? 'var(--danger)' : '#22c55e', transition: 'width 0.5s' }} />
                </div>
              </>
            ) : <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>—</p>}
          </div>

          <div className="rounded-2xl p-3 space-y-1" style={{ background: 'var(--bg)' }}>
            <p className="text-xs flex items-center gap-1" style={{ color: 'var(--fg-muted)' }}><Gauge size={11} /> Speed</p>
            <p className="text-sm font-semibold">
              {live.live_speed != null ? `${(live.live_speed * 3.6).toFixed(1)} km/h` : '—'}
            </p>
          </div>

          <div className="rounded-2xl p-3 space-y-1" style={{ background: 'var(--bg)' }}>
            <p className="text-xs flex items-center gap-1" style={{ color: 'var(--fg-muted)' }}><Mountain size={11} /> Altitude</p>
            <p className="text-sm font-semibold">
              {tracker.last_altitude != null ? `${tracker.last_altitude.toFixed(0)}m` : '—'}
            </p>
          </div>

          <div className="rounded-2xl p-3 space-y-1 col-span-2" style={{ background: 'var(--bg)' }}>
            <p className="text-xs flex items-center gap-1" style={{ color: 'var(--fg-muted)' }}>
              {live.network?.connected ? <Wifi size={11} /> : <WifiOff size={11} />} Network
            </p>
            <p className="text-sm font-semibold">
              {live.network ? `${live.network.connected ? 'Connected' : 'Disconnected'} · ${live.network.type}` : '—'}
            </p>
          </div>
        </div>

        {/* Commands */}
        {live.is_online && (
          <div className="flex gap-3">
            <button onClick={() => sendCommand(token, tracker.id, 'ping')}
              className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold"
              style={{ background: 'var(--primary)', color: '#fff' }}>
              <Navigation size={15} /> Request Location
            </button>
            <button onClick={() => sendCommand(token, tracker.id, 'alarm')}
              className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold"
              style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
              🚨 Trigger Alarm
            </button>
          </div>
        )}

        <div className="flex gap-3">
          <Link href={`/tracking/zones?id=${tracker.id}`} className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold border"
            style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}>
            <Shield size={15} /> Safe Zones
          </Link>
          <Link href="/map" className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold border"
            style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}>
            <MapPin size={15} /> View on Map
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Tracker card ──────────────────────────────────────────────────────────────
function TrackerCard({ tracker, live, onToggle, onDelete, onTap }: {
  tracker: Tracker; live: TrackerLiveState
  onToggle: () => void; onDelete: () => void; onTap: () => void
}) {
  const lat = live.live_lat ?? tracker.last_lat
  const lng = live.live_lng ?? tracker.last_lng
  const lastSeen = live.live_timestamp ?? tracker.last_seen

  return (
    <Card style={{ marginBottom: 8, cursor: 'pointer' }} onClick={onTap}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <SignalBars accuracy={live.live_accuracy} online={live.is_online} />
          </div>
          <div>
            <p className="font-semibold">{tracker.label}</p>
            <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
              {live.is_online ? 'Live' : lastSeen ? `Last seen ${new Date(lastSeen).toLocaleTimeString()}` : 'Never seen'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
          {live.battery && (
            <span className="text-xs font-semibold" style={{ color: live.battery.level < 20 ? 'var(--danger)' : 'var(--fg-muted)' }}>
              {live.battery.level}%{live.battery.charging ? '⚡' : ''}
            </span>
          )}
          <button onClick={onToggle}>
            {tracker.is_active
              ? <ToggleRight size={24} style={{ color: 'var(--accent)' }} />
              : <ToggleLeft size={24} style={{ color: 'var(--fg-muted)' }} />}
          </button>
          <button onClick={onDelete}><Trash2 size={18} style={{ color: 'var(--danger)' }} /></button>
        </div>
      </div>
      {lat && lng && (
        <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: 'var(--fg-muted)' }}>
          <MapPin size={12} />
          {lat.toFixed(5)}, {lng.toFixed(5)}
          {live.live_speed != null && live.live_speed > 0.5 && <span className="ml-2">· {(live.live_speed * 3.6).toFixed(1)} km/h</span>}
        </div>
      )}
    </Card>
  )
}

function RegisterForm({ db, onDone }: { db: Db; onDone: () => void }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    try { await db.trackers.register(form); setForm(EMPTY_FORM); onDone() }
    catch (err: any) { setError(err.message) }
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
  const { token } = useAuth()
  const { toast } = useToast()
  const [trackers, setTrackers] = useState<Tracker[]>([])
  const [liveState, setLiveState] = useState<Record<string, TrackerLiveState>>({})
  const [selected, setSelected] = useState<Tracker | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const db = useMemo(() => token ? createDb(token) : null, [token])
  const trackerIds = useMemo(() => trackers.map(t => t.id), [trackers])

  async function load() {
    if (!db) return
    try { const data: any = await db.trackers.list(); setTrackers(data ?? []) }
    catch (e: any) { toast(e?.message ?? 'Failed to load trackers', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [db])

  function setLive(id: string, patch: Partial<TrackerLiveState>) {
    setLiveState(s => ({ ...s, [id]: { ...s[id], is_online: s[id]?.is_online ?? false, ...patch } }))
  }

  useTrackerSocket(token, trackerIds, {
    onOnline:   id => setLive(id, { is_online: true }),
    onOffline:  id => setLive(id, { is_online: false }),
    onLocation: d  => setLive(d.trackerId, { live_lat: d.lat, live_lng: d.lng, live_accuracy: d.accuracy, live_speed: d.speed ?? undefined, live_heading: d.heading ?? undefined, live_timestamp: d.timestamp }),
    onBattery:  d  => setLive(d.trackerId, { battery: { level: d.level, charging: d.charging } }),
    onNetwork:  d  => setLive(d.trackerId, { network: { connected: d.connected, type: d.type } }),
  })

  async function toggle(t: Tracker) {
    try { await db?.trackers.update(t.id, { is_active: !t.is_active }); load() }
    catch (e: any) { toast(e?.message ?? 'Failed', 'error') }
  }

  async function remove(id: string) {
    if (!confirm('Remove this tracker?')) return
    try { await db?.trackers.delete(id); load() }
    catch (e: any) { toast(e?.message ?? 'Failed', 'error') }
  }

  return (
    <div className="px-4 py-6 space-y-4 pb-24">
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
          : trackers.length === 0
            ? <p className="text-sm text-center py-8" style={{ color: 'var(--fg-muted)' }}>No trackers registered yet.</p>
            : trackers.map(t => (
              <TrackerCard key={t.id} tracker={t}
                live={liveState[t.id] ?? { is_online: false }}
                onToggle={() => toggle(t)}
                onDelete={() => remove(t.id)}
                onTap={() => setSelected(t)} />
            ))}

      {/* Device Carousel */}
      <DeviceCarousel />

      {selected && (
        <TrackerSheet
          tracker={selected}
          live={liveState[selected.id] ?? { is_online: false }}
          token={token!}
          onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
