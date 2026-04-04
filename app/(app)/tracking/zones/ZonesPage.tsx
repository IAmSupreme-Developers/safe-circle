'use client'
import { useEffect, useRef, useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/app/components/AuthProvider'
import { createDb } from '@/lib/db'
import { BackButton } from '@/app/components/shared'
import { Trash2, ToggleLeft, ToggleRight, Plus, X } from 'lucide-react'
import { MAP_DEFAULT_ZOOM } from '@/lib/config'

type Zone = {
  id: string; label: string; lat: number; lng: number
  radius_meters: number; exit_message: string | null
  exit_severity: string; is_enabled: boolean
}

const SEVERITIES = ['info', 'warning', 'danger'] as const
const SEV_COLOR: Record<string, string> = { info: '#3b82f6', warning: '#f59e0b', danger: '#ef4444' }

function ZonePicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  useEffect(() => {
    if (!ref.current) return
    import('leaflet').then(L => {
      if ((ref.current as any)._leaflet_id) return
      const map = L.map(ref.current!, { zoomControl: true }).setView([0, 0], 2)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map)

      // Try to center on user
      navigator.geolocation?.getCurrentPosition(p => {
        map.setView([p.coords.latitude, p.coords.longitude], 14)
      })

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng
        if (markerRef.current) markerRef.current.setLatLng([lat, lng])
        else markerRef.current = L.marker([lat, lng]).addTo(map)
        onPick(lat, lng)
      })

      mapRef.current = map
    })
    return () => { mapRef.current?.remove(); mapRef.current = null }
  }, [])

  return <div ref={ref} style={{ height: 240, width: '100%', borderRadius: 16, overflow: 'hidden', zIndex: 0 }} />
}

function ZonePreviewMap({ lat, lng, radius, color }: { lat: number; lng: number; radius: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const circleRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  useEffect(() => {
    if (!ref.current) return
    import('leaflet').then(L => {
      if (!(ref.current as any)._leaflet_id) {
        const map = L.map(ref.current!, { zoomControl: false, dragging: false, scrollWheelZoom: false })
          .setView([lat, lng], MAP_DEFAULT_ZOOM)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
        markerRef.current = L.marker([lat, lng]).addTo(map)
        circleRef.current = L.circle([lat, lng], { radius, color, fillColor: color, fillOpacity: 0.15, weight: 2 }).addTo(map)
        mapRef.current = map
      } else {
        markerRef.current?.setLatLng([lat, lng])
        circleRef.current?.setLatLng([lat, lng])
        circleRef.current?.setRadius(radius)
        circleRef.current?.setStyle({ color, fillColor: color })
        mapRef.current?.setView([lat, lng], MAP_DEFAULT_ZOOM)
      }
    })
    return () => { if (mapRef.current && !(ref.current as any)?._leaflet_id) { mapRef.current.remove(); mapRef.current = null } }
  }, [lat, lng, radius, color])

  return <div ref={ref} style={{ height: 180, width: '100%', borderRadius: 12, overflow: 'hidden', zIndex: 0 }} />
}

function ZonesInner() {
  const { token } = useAuth()
  const db = useMemo(() => token ? createDb(token) : null, [token])
  const trackerId = useSearchParams().get('id')
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [pickedLat, setPickedLat] = useState<number | null>(null)
  const [pickedLng, setPickedLng] = useState<number | null>(null)
  const [label, setLabel] = useState('')
  const [radius, setRadius] = useState(200)
  const [severity, setSeverity] = useState<'info' | 'warning' | 'danger'>('warning')
  const [exitMsg, setExitMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    if (!db || !trackerId) return
    const data: any = await db.zones.list(trackerId).catch(() => [])
    setZones(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [db, trackerId])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    if (!pickedLat || !pickedLng) { setError('Tap the map to pick a location'); return }
    if (!label.trim()) { setError('Enter a zone name'); return }
    setSaving(true); setError('')
    try {
      await db!.zones.create(trackerId!, {
        label, lat: pickedLat, lng: pickedLng,
        radius_meters: radius, exit_message: exitMsg || null, exit_severity: severity,
      })
      setShowForm(false); setLabel(''); setPickedLat(null); setPickedLng(null)
      setRadius(200); setSeverity('warning'); setExitMsg('')
      load()
    } catch (err: any) { setError(err.message) }
    finally { setSaving(false) }
  }

  async function toggle(z: Zone) {
    if (!trackerId || !db) return
    await db.zones.update(trackerId, z.id, { is_enabled: !z.is_enabled })
    load()
  }

  async function remove(zoneId: string) {
    if (!trackerId || !db || !confirm('Delete this zone?')) return
    await db.zones.delete(trackerId, zoneId); load()
  }

  return (
    <div className="px-4 py-6 pb-24 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton href="/tracking" />
          <h1 className="text-xl font-bold">Safe Zones</h1>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
          style={{ background: showForm ? 'var(--bg-input)' : 'var(--primary)', color: showForm ? 'var(--fg)' : '#fff' }}>
          {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add Zone</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="rounded-2xl border p-4 space-y-4"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <p className="font-semibold text-sm">New Safe Zone</p>

          {/* Map picker */}
          <div>
            <p className="text-xs mb-1.5 font-medium" style={{ color: 'var(--fg-muted)' }}>
              Tap the map to set the zone centre
            </p>
            <ZonePicker onPick={(lat, lng) => { setPickedLat(lat); setPickedLng(lng) }} />
            {pickedLat && (
              <p className="text-xs mt-1" style={{ color: 'var(--primary)' }}>
                📍 {pickedLat.toFixed(5)}, {pickedLng?.toFixed(5)}
              </p>
            )}
          </div>

          {/* Radius slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium" style={{ color: 'var(--fg-muted)' }}>Radius</p>
              <p className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{radius}m</p>
            </div>
            <input type="range" min={25} max={2000} step={1} value={radius}
              onChange={e => setRadius(Number(e.target.value))}
              className="w-full accent-primary" style={{ accentColor: 'var(--primary)' }} />
            <div className="flex justify-between text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>
              <span>50m</span><span>2km</span>
            </div>
          </div>

          {/* Live preview */}
          {pickedLat && pickedLng && (
            <div>
              <p className="text-xs mb-1.5 font-medium" style={{ color: 'var(--fg-muted)' }}>Preview</p>
              <ZonePreviewMap lat={pickedLat} lng={pickedLng} radius={radius} color={SEV_COLOR[severity]} />
            </div>
          )}

          {/* Zone name */}
          <input placeholder="Zone name (e.g. Home, School)" value={label}
            onChange={e => setLabel(e.target.value)} required
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }} />

          {/* Severity */}
          <div>
            <p className="text-xs mb-2 font-medium" style={{ color: 'var(--fg-muted)' }}>Alert severity on exit</p>
            <div className="flex gap-2">
              {SEVERITIES.map(s => (
                <button key={s} type="button" onClick={() => setSeverity(s)}
                  className="flex-1 rounded-full py-2 text-xs font-semibold capitalize transition-all"
                  style={{
                    background: severity === s ? SEV_COLOR[s] : 'var(--bg-input)',
                    color: severity === s ? '#fff' : 'var(--fg-muted)',
                  }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Exit message */}
          <input placeholder="Exit alert message (optional)" value={exitMsg}
            onChange={e => setExitMsg(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }} />

          {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}

          <button type="submit" disabled={saving}
            className="w-full rounded-full py-3.5 font-semibold text-sm disabled:opacity-50"
            style={{ background: 'var(--primary)', color: '#fff' }}>
            {saving ? 'Saving…' : 'Create Zone'}
          </button>
        </form>
      )}

      {/* Zone list */}
      {loading
        ? <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'var(--bg-card)' }} />)}</div>
        : zones.length === 0
          ? <p className="text-sm text-center py-12" style={{ color: 'var(--fg-muted)' }}>No safe zones yet. Tap "Add Zone" to create one.</p>
          : zones.map(z => (
            <div key={z.id} className="rounded-2xl p-4 space-y-2"
              style={{ background: 'var(--bg-card)', boxShadow: 'var(--bg-card-shadow)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: SEV_COLOR[z.exit_severity] }} />
                  <p className="font-semibold text-sm">{z.label}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => toggle(z)}>
                    {z.is_enabled
                      ? <ToggleRight size={22} style={{ color: 'var(--primary)' }} />
                      : <ToggleLeft size={22} style={{ color: 'var(--fg-muted)' }} />}
                  </button>
                  <button onClick={() => remove(z.id)}>
                    <Trash2 size={16} style={{ color: 'var(--danger)' }} />
                  </button>
                </div>
              </div>
              <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{z.radius_meters}m radius</p>
              <ZonePreviewMap lat={z.lat} lng={z.lng} radius={z.radius_meters} color={SEV_COLOR[z.exit_severity]} />
              {z.exit_message && (
                <p className="text-xs italic" style={{ color: 'var(--fg-muted)' }}>"{z.exit_message}"</p>
              )}
            </div>
          ))}
    </div>
  )
}

export default function ZonesPage() {
  return <Suspense><ZonesInner /></Suspense>
}
