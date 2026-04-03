'use client'
import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/app/components/AuthProvider'
import { createDb } from '@/lib/db'
import { useTrackerRealtime } from '@/lib/realtime'
import type { MapPoint, Tracker } from '@/lib/types'
import { PIN_COLORS } from '@/lib/config'

const MapView = dynamic(() => import('@/app/components/MapView'), { ssr: false })

export default function MapPage() {
  const { user, token } = useAuth()
  const db = useMemo(() => token ? createDb(token) : null, [token])
  const [trackers, setTrackers] = useState<Tracker[]>([])
  const [guardianPos, setGuardianPos] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db) return
    db.trackers.list().then((data: any) => { setTrackers(data ?? []); setLoading(false) })
  }, [db])

  // Live guardian position
  useEffect(() => {
    if (!navigator.geolocation) return
    const id = navigator.geolocation.watchPosition(
      ({ coords }) => setGuardianPos({ lat: coords.latitude, lng: coords.longitude }),
      () => {},
      { enableHighAccuracy: true }
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [])

  // Live tracker updates via Supabase Realtime
  useTrackerRealtime(user?.id, (updated) => {
    setTrackers(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t))
  })

  const points = useMemo<MapPoint[]>(() => {
    const pts: MapPoint[] = trackers
      .filter(t => t.last_lat && t.last_lng)
      .map(t => ({ id: t.id, lat: t.last_lat!, lng: t.last_lng!, label: t.label ?? '', type: 'tracker' as const }))
    if (guardianPos) pts.push({ id: 'guardian', ...guardianPos, label: 'You', type: 'guardian' })
    return pts
  }, [trackers, guardianPos])

  if (loading) return <div className="h-screen w-full animate-pulse" style={{ background: 'var(--border)' }} />

  return (
    <div className="relative h-screen w-full">
      <MapView points={points} height="100%" className="h-full" />

      {/* Legend */}
      <div className="absolute bottom-20 left-4 rounded-2xl border px-3 py-2 space-y-1 text-xs z-10"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        {(Object.entries(PIN_COLORS) as [string, string][]).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2 capitalize">
            <span className="h-3 w-3 rounded-full border-2 border-white" style={{ background: color }} />
            {type.replace('-', ' ')}
          </div>
        ))}
      </div>
    </div>
  )
}
