import { Geolocation } from '@capacitor/geolocation'
import { registerPlugin } from '@capacitor/core'
import { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation'
import { signPayload } from './hmac'
import {
  DISTANCE_FILTER_METERS,
  GPS_TIMEOUT_MS,
  BG_NOTIFICATION_TITLE,
  BG_NOTIFICATION_MESSAGE,
  STORAGE_KEY_CREDENTIALS,
  STORAGE_KEY_PAIRED_DEVICE,
  SERVER_URL,
  DEVICE_HMAC_SECRET,
} from './config'

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation')

export type DeviceInfo = { trackerId: string; label: string }
export type BroadcastStatus = 'idle' | 'broadcasting' | 'error' | 'no_gps'

// --- Credentials ---

export function getCredentials(): { device_id: string; code: string } | null {
  const envId = process.env.NEXT_PUBLIC_DEVICE_ID
  const envCode = process.env.NEXT_PUBLIC_DEVICE_CODE
  if (envId && envCode) return { device_id: envId, code: envCode }
  const stored = localStorage.getItem(STORAGE_KEY_CREDENTIALS)
  return stored ? JSON.parse(stored) : null
}

export function saveCredentials(device_id: string, code: string) {
  localStorage.setItem(STORAGE_KEY_CREDENTIALS, JSON.stringify({ device_id, code }))
}

// --- Paired device ---

export function getPairedDevice(): DeviceInfo | null {
  const stored = localStorage.getItem(STORAGE_KEY_PAIRED_DEVICE)
  return stored ? JSON.parse(stored) : null
}

export function savePairedDevice(info: DeviceInfo) {
  localStorage.setItem(STORAGE_KEY_PAIRED_DEVICE, JSON.stringify(info))
}

export function clearPairedDevice() {
  localStorage.removeItem(STORAGE_KEY_PAIRED_DEVICE)
}

// --- Registration ---

export async function checkRegistration(device_id: string): Promise<DeviceInfo | null> {
  try {
    const res = await fetch(`${SERVER_URL}/api/device/check?device_id=${encodeURIComponent(device_id)}`)
    const data = await res.json()
    if (!data.registered) return null
    return { trackerId: data.trackerId, label: data.label ?? device_id }
  } catch { return null }
}

// --- Location ---

async function writeLocation(trackerId: string, lat: number, lng: number, accuracy: number): Promise<boolean> {
  try {
    const timestamp = new Date().toISOString()
    const payload = JSON.stringify({ trackerId, lat, lng, accuracy, timestamp })
    const signature = await signPayload(payload, DEVICE_HMAC_SECRET)

    const res = await fetch(`${SERVER_URL}/api/device/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackerId, lat, lng, accuracy, timestamp, signature }),
    })
    return res.ok
  } catch { return false }
}

/** One-shot foreground ping — fallback for web */
export async function pingLocation(trackerId: string): Promise<boolean> {
  try {
    const { coords } = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: GPS_TIMEOUT_MS })
    return writeLocation(trackerId, coords.latitude, coords.longitude, coords.accuracy)
  } catch { return false }
}

let bgWatcherId: string | null = null

/** Start native background watcher — survives app backgrounding and screen lock */
export async function startBackgroundTracking(trackerId: string): Promise<boolean> {
  try {
    bgWatcherId = await BackgroundGeolocation.addWatcher(
      {
        backgroundTitle: BG_NOTIFICATION_TITLE,
        backgroundMessage: BG_NOTIFICATION_MESSAGE,
        requestPermissions: true,
        stale: false,
        distanceFilter: DISTANCE_FILTER_METERS,
      },
      async (location, error) => {
        if (error || !location) return
        await writeLocation(trackerId, location.latitude, location.longitude, location.accuracy)
      }
    )
    return true
  } catch { return false }
}

/** Stop background watcher */
export async function stopBackgroundTracking(): Promise<void> {
  if (!bgWatcherId) return
  try { await BackgroundGeolocation.removeWatcher({ id: bgWatcherId }) } catch {}
  bgWatcherId = null
}
