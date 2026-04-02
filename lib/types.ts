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
  label: string
  device_id: string
  is_active: boolean
  last_lat: number | null
  last_lng: number | null
  last_seen: string | null
}

export type Profile = {
  id: string
  full_name: string
  phone: string
  proximity_buffer_meters: number
}

export const severityColor: Record<string, string> = {
  danger: 'var(--danger)',
  warning: 'var(--warning)',
  info: 'var(--info)',
}
