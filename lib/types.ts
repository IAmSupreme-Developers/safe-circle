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
  last_seen: string | null
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
