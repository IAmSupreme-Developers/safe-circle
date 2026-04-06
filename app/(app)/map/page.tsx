'use client'
import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/app/components/AuthProvider'
import { createDb } from '@/lib/db'
import { useTrackerSocket } from '@/lib/trackerSocket'
import type { MapPoint, Tracker } from '@/lib/types'
import { PIN_COLORS } from '@/lib/config'

const MapView = dynamic(() => import('@/app/components/MapView'), { ssr: false })

export default function MapPage() {
  const { token } = useAuth()
  const db = useMemo(() => token ? createDb(token) : null, [token])
  const [trackers, setTrackers] = useState<Tracker[]>([])
  const [livePos, setLivePos] = useState<Record<string, { lat: number; lng: number }>>({})
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set())
  const [guardianPos, setGuardianPos] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const trackerIds = useMemo(() => trackers.map(t => t.id), [trackers])

  useEffect(() => {
    if (!db) return
    db.trackers.list().then((data: any) => { setTrackers(data ?? []); setLoading(false) })
  }, [db])

  useEffect(() => {
    let cleanup: (() => void) | undefined
    import('@/lib/geolocation').then(({ watchPosition }) => {
      watchPosition(pos => setGuardianPos(pos)).then(fn => { cleanup = fn })
    })
    return () => cleanup?.()
  }, [])

  useTrackerSocket(token, trackerIds, {
    onOnline:   id => setOnlineIds(s => new Set([...s, id])),
    onOffline:  id => setOnlineIds(s => { const n = new Set(s); n.delete(id); return n }),
    onLocation: d  => setLivePos(p => ({ ...p, [d.trackerId]: { lat: d.lat!, lng: d.lng! } })),
  })

  const points = useMemo<MapPoint[]>(() => {
    const pts: MapPoint[] = trackers.map(t => {
      const live = livePos[t.id]
      const lat = live?.lat ?? t.last_lat
      const lng = live?.lng ?? t.last_lng
      if (!lat || !lng) return null
      const isOnline = onlineIds.has(t.id)
      return {
        id: t.id, lat, lng,
        label: t.label ?? '',
        type: 'tracker' as const,
        // online = amber pulse, offline = grey
        color: isOnline ? PIN_COLORS.tracker : '#94a3b8',
        online: isOnline,
      }
    }).filter(Boolean) as MapPoint[]
    if (guardianPos) pts.push({ id: 'guardian', ...guardianPos, label: 'You', type: 'guardian' })
    return pts
  }, [trackers, livePos, onlineIds, guardianPos])

  if (loading) return <div className="h-screen w-full animate-pulse" style={{ background: 'var(--border)' }} />

  return (
    <div className="relative h-screen w-full">
      <MapView points={points} height="100%" className="h-full" />
      <div className="absolute bottom-20 left-4 rounded-2xl border px-3 py-2 space-y-1.5 text-xs z-10"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border-2 border-white" style={{ background: PIN_COLORS.tracker }} />
          Tracker (online)
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border-2 border-white" style={{ background: '#94a3b8' }} />
          Tracker (offline)
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border-2 border-white" style={{ background: PIN_COLORS.guardian }} />
          You
        </div>
      </div>
    </div>
  )
}
