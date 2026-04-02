import { Geolocation } from '@capacitor/geolocation'
import { supabase } from './supabase'

export type DeviceInfo = { trackerId: string; label: string }
export type BroadcastStatus = 'idle' | 'broadcasting' | 'error' | 'no_gps'

export const PING_INTERVAL_MS = 5000

/** Resolve credentials: env vars first, then localStorage */
export function getCredentials(): { device_id: string; code: string } | null {
  const envId = process.env.NEXT_PUBLIC_DEVICE_ID
  const envCode = process.env.NEXT_PUBLIC_DEVICE_CODE
  if (envId && envCode) return { device_id: envId, code: envCode }
  const stored = localStorage.getItem('sc_device_credentials')
  return stored ? JSON.parse(stored) : null
}

export function saveCredentials(device_id: string, code: string) {
  localStorage.setItem('sc_device_credentials', JSON.stringify({ device_id, code }))
}

export function getPairedDevice(): DeviceInfo | null {
  const stored = localStorage.getItem('sc_device')
  return stored ? JSON.parse(stored) : null
}

export function savePairedDevice(info: DeviceInfo) {
  localStorage.setItem('sc_device', JSON.stringify(info))
}

export function clearPairedDevice() {
  localStorage.removeItem('sc_device')
}

/** Check if this device has been claimed by a guardian */
export async function checkRegistration(device_id: string): Promise<DeviceInfo | null> {
  const { data } = await supabase
    .from('trackers')
    .select('id, label, owner_id')
    .eq('device_id', device_id)
    .single()
  if (!data?.owner_id) return null
  return { trackerId: data.id, label: data.label ?? device_id }
}

/** Push current GPS coords to Supabase */
export async function pingLocation(trackerId: string): Promise<boolean> {
  try {
    const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 })
    const { latitude, longitude, accuracy } = position.coords
    const { error } = await supabase
      .from('trackers')
      .update({ last_lat: latitude, last_lng: longitude, last_seen: new Date().toISOString(), accuracy })
      .eq('id', trackerId)
    return !error
  } catch {
    return false
  }
}
