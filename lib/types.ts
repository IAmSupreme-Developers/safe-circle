export type Alert = {
  id: string
  message: string
  severity: 'info' | 'warning' | 'danger'
  type: string
  created_at: string
  is_read: boolean
}

export type Tracker = {
  id: string
  label: string | null
  device_id: string
  is_active: boolean
  last_lat: number | null
  last_lng: number | null
  last_altitude: number | null
  last_speed: number | null
  last_heading: number | null
  last_seen: string | null
}

// Live socket state — not persisted, held in component memory
export type TrackerLiveState = {
  is_online: boolean
  battery?: { level: number; charging: boolean }
  network?: { connected: boolean; type: string }
  // live location overrides DB values while connected
  live_lat?: number
  live_lng?: number
  live_accuracy?: number
  live_speed?: number | null
  live_heading?: number | null
  live_timestamp?: string
}

export type Profile = {
  id: string
  full_name: string
  avatar_url: string | null
  phone: string
  proximity_buffer_meters: number
}

export type Post = {
  id: string
  author_id: string
  content: string
  attachments: string[]
  location_lat: number | null
  location_lng: number | null
  category: string
  subject: string | null
  city: string | null
  country: string | null
  tags: string[]
  is_resolved: boolean
  view_count: number
  created_at: string
  author?: { full_name: string; avatar_url: string | null }
  comment_count?: number
}

export type Comment = {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
  author?: { full_name: string; avatar_url: string | null }
}

export type MapPoint = {
  id: string
  lat: number
  lng: number
  label: string
  type: 'tracker' | 'guardian' | 'search-party'
  color?: string
  online?: boolean
}

export type SafeZone = {
  id: string
  lat: number
  lng: number
  radius_meters: number
  label: string
  color?: string
  is_enabled: boolean
}

export const severityColor: Record<string, string> = {
  danger: 'var(--danger)',
  warning: 'var(--warning)',
  info: 'var(--info)',
}
