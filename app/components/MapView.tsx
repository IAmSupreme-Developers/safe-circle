'use client'
import { useEffect, useRef } from 'react'
import type { MapPoint, SafeZone } from '@/lib/types'
import { MAP_DEFAULT_ZOOM, PIN_COLORS, ZONE_DEFAULT_COLOR } from '@/lib/config'

type Props = {
  points: MapPoint[]
  zones?: SafeZone[]
  height?: string | number
  className?: string
}

function makeIcon(color: string, L: any, online?: boolean) {
  const pulse = online ? `
    <div style="
      position:absolute;top:-4px;left:-4px;
      width:22px;height:22px;border-radius:50%;
      background:${color};opacity:0.3;
      animation:map-ping 1.5s ease-in-out infinite;
    "></div>` : ''
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:14px;height:14px">
      ${pulse}
      <div style="
        position:relative;width:14px;height:14px;border-radius:50%;
        background:${color};border:2px solid #fff;
        box-shadow:0 0 0 2px ${color};
      "></div>
    </div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

export default function MapView({ points, zones = [], height = 300, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())
  const zonesRef = useRef<Map<string, any>>(new Map())

  // Init map once
  useEffect(() => {
    if (!containerRef.current) return
    import('leaflet').then(L => {
      // Already initialised (StrictMode double-invoke guard)
      if ((containerRef.current as any)._leaflet_id) return

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const center: [number, number] = points[0]
        ? [points[0].lat, points[0].lng]
        : [0, 0]

      mapRef.current = L.map(containerRef.current!, { zoomControl: true }).setView(center, MAP_DEFAULT_ZOOM)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current)
    })

    return () => { mapRef.current?.remove(); mapRef.current = null }
  }, [])

  // Sync points
  useEffect(() => {
    if (!mapRef.current) return
    import('leaflet').then(L => {
      const map = mapRef.current
      const existing = markersRef.current

      points.forEach(p => {
        const color = p.color ?? PIN_COLORS[p.type] ?? PIN_COLORS.tracker
        const icon = makeIcon(color, L, p.online)
        if (existing.has(p.id)) {
          existing.get(p.id).setLatLng([p.lat, p.lng])
          existing.get(p.id).setIcon(icon)
        } else {
          const m = L.marker([p.lat, p.lng], { icon })
            .addTo(map)
            .bindPopup(`<b>${p.label}</b><br/><small>${p.type}</small>`)
          existing.set(p.id, m)
        }
      })

      // Remove stale markers
      const ids = new Set(points.map(p => p.id))
      existing.forEach((m, id) => { if (!ids.has(id)) { m.remove(); existing.delete(id) } })

      // Fit bounds if multiple points
      if (points.length > 1) {
        map.fitBounds(points.map(p => [p.lat, p.lng] as [number, number]), { padding: [40, 40] })
      } else if (points.length === 1) {
        map.setView([points[0].lat, points[0].lng], MAP_DEFAULT_ZOOM)
      }
    })
  }, [points])

  // Sync safe zones
  useEffect(() => {
    if (!mapRef.current) return
    import('leaflet').then(L => {
      const map = mapRef.current
      const existing = zonesRef.current

      zones.forEach(z => {
        if (!z.is_enabled) { existing.get(z.id)?.remove(); existing.delete(z.id); return }
        const color = z.color ?? ZONE_DEFAULT_COLOR
        if (existing.has(z.id)) {
          existing.get(z.id).setLatLng([z.lat, z.lng])
        } else {
          const circle = L.circle([z.lat, z.lng], {
            radius: z.radius_meters,
            color,
            weight: 2,
            fillColor: color,
            fillOpacity: 0.08,
            className: 'sc-zone-pulse',
          }).addTo(map).bindPopup(`<b>${z.label}</b>`)
          existing.set(z.id, circle)
        }
      })

      const ids = new Set(zones.map(z => z.id))
      existing.forEach((c, id) => { if (!ids.has(id)) { c.remove(); existing.delete(id) } })
    })
  }, [zones])

  return (
    <>
      <style>{`
        .sc-zone-pulse {
          animation: zone-pulse 2.5s ease-in-out infinite;
        }
        @keyframes zone-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes map-ping {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50%       { transform: scale(2); opacity: 0; }
        }
      `}</style>
      <div ref={containerRef} className={className}
        style={{ height, width: '100%', borderRadius: 16, overflow: 'hidden', zIndex: 0 }} />
    </>
  )
}
