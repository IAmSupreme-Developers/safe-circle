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
  FOREGROUND_PING_INTERVAL_MS,
} from './config'
import { io, Socket } from 'socket.io-client'

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation')

export type DeviceInfo = { trackerId: string; label: string }
export type BroadcastStatus = 'idle' | 'connecting' | 'broadcasting' | 'error' | 'no_gps' | 'disconnected' | 'permission_denied' | 'timeout'

// ─── Credentials ────────────────────────────────────────────────────────────

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

// ─── Paired device ───────────────────────────────────────────────────────────

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

// ─── Registration ────────────────────────────────────────────────────────────

export async function checkRegistration(device_id: string): Promise<DeviceInfo | null> {
  try {
    const res = await fetch(`${SERVER_URL}/api/device/check?device_id=${encodeURIComponent(device_id)}`)
    const data = await res.json()
    if (!data.registered) return null
    return { trackerId: data.trackerId, label: data.label ?? device_id }
  } catch { return null }
}

// ─── Socket connection ───────────────────────────────────────────────────────

let socket: Socket | null = null
let bgWatcherId: string | null = null
let fgIntervalId: ReturnType<typeof setInterval> | null = null
let networkListenerHandle: any = null

export type SocketCallbacks = {
  onStatus: (s: BroadcastStatus) => void
  onLastPing: (time: string) => void
  onCommand: (cmd: string, payload?: any) => void
}

let lastBatteryLevel = -1

async function emitBattery(trackerId: string) {
  if (!socket?.connected) return
  try {
    const { Device } = await import('@capacitor/device')
    const info = await Device.getBatteryInfo()
    const level = Math.round((info.batteryLevel ?? 0) * 100)
    // Emit on connect (lastBatteryLevel = -1) or when level drops by 5%+
    if (lastBatteryLevel === -1 || Math.abs(lastBatteryLevel - level) >= 5) {
      lastBatteryLevel = level
      socket.emit('device:battery', { trackerId, level, charging: info.isCharging ?? false })
    }
  } catch {}
}
async function buildAuthHeader(trackerId: string): Promise<string> {
  const timestamp = new Date().toISOString()
  const payload = JSON.stringify({ trackerId, timestamp })
  const signature = await signPayload(payload, DEVICE_HMAC_SECRET)
  return JSON.stringify({ trackerId, timestamp, signature })
}

async function handleCommand(cmd: string, payload: any, trackerId: string, cb: SocketCallbacks) {
  if (cmd === 'alarm') {
    try {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
      // Vibrate 3 times
      for (let i = 0; i < 3; i++) {
        await Haptics.impact({ style: ImpactStyle.Heavy })
        await new Promise(r => setTimeout(r, 300))
      }
    } catch {}
  }

  if (cmd === 'ping') {
    try {
      const { coords } = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: GPS_TIMEOUT_MS })
      await emitLocation(trackerId, coords, cb)
    } catch {}
  }

  if (cmd === 'update_interval' && payload?.ms) {
    if (fgIntervalId) {
      clearInterval(fgIntervalId)
      const ping = async () => {
        try {
          const { coords } = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: GPS_TIMEOUT_MS })
          await emitLocation(trackerId, coords, cb)
          cb.onStatus('broadcasting')
        } catch { cb.onStatus('no_gps') }
      }
      fgIntervalId = setInterval(ping, payload.ms)
    }
  }
}

export async function connectSocket(trackerId: string, cb: SocketCallbacks): Promise<void> {
  if (socket?.connected) return

  cb.onStatus('connecting')

  const auth = await buildAuthHeader(trackerId)

  socket = io(`${SERVER_URL}`, {
    path: "/tracker",
    transports: ['websocket'],
    auth: { token: auth },
    reconnection: true,
    reconnectionDelay: 2000,
  })

  socket.on('connect', () => {
    console.log('[tracker socket] connected:', socket?.id)
    cb.onStatus('broadcasting')
    lastBatteryLevel = -1
    emitBattery(trackerId)
    startDeviceListeners(trackerId)
  })

  socket.on('disconnect', () => {
    cb.onStatus('disconnected')
    stopDeviceListeners()
  })

  socket.on('connect_error', (e) => {
    console.error('[tracker socket] connect_error:', e.message)
    cb.onStatus('error')
  })

  socket.on('command', (data: { cmd: string; payload?: any }) => {
    cb.onCommand(data.cmd, data.payload)
    handleCommand(data.cmd, data.payload, trackerId, cb)
  })

  socket.on('ack', () => {
    cb.onLastPing(new Date().toLocaleTimeString())
  })
}

export function disconnectSocket(): void {
  /* stopStationaryPing() */
  socket?.disconnect()
  socket = null
}

// ─── Device event listeners ──────────────────────────────────────────────────

let batteryPollTimer: ReturnType<typeof setInterval> | null = null

async function startDeviceListeners(trackerId: string) {
  try {
    const { Network } = await import('@capacitor/network')

    // Network — emit on connectivity change
    networkListenerHandle = await Network.addListener('networkStatusChange', (status) => {
      if (!socket?.connected) return
      socket.emit('device:network', { trackerId, connected: status.connected, type: status.connectionType })
    })

    // Emit current network state immediately
    const netStatus = await Network.getStatus()
    socket?.emit('device:network', { trackerId, connected: netStatus.connected, type: netStatus.connectionType })
  } catch {}

  // Battery — poll every 60s (no native change event in Capacitor Device plugin)
  await emitBattery(trackerId)
  // batteryPollTimer = setInterval(() => emitBattery(trackerId), 60_000)
}

async function stopDeviceListeners() {
  try { await networkListenerHandle?.remove() } catch {}
  networkListenerHandle = null
  if (batteryPollTimer) { clearInterval(batteryPollTimer); batteryPollTimer = null }
}

// ─── Location emit ───────────────────────────────────────────────────────────

async function emitLocation(trackerId: string, coords: { latitude: number; longitude: number; accuracy: number; altitude?: number | null; altitudeAccuracy?: number | null; speed?: number | null; heading?: number | null; simulated?: boolean }, cb: SocketCallbacks) {
  if (!socket?.connected) return
  const timestamp = new Date().toISOString()
  const payload = JSON.stringify({ trackerId, lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy, timestamp })
  const signature = await signPayload(payload, DEVICE_HMAC_SECRET)
  socket.emit('device:location', {
    trackerId,
    lat: coords.latitude,
    lng: coords.longitude,
    accuracy: coords.accuracy,
    altitude: coords.altitude ?? null,
    altitudeAccuracy: coords.altitudeAccuracy ?? null,
    speed: coords.speed ?? null,
    heading: coords.heading ?? null,
    simulated: coords.simulated ?? false,
    timestamp,
    signature,
  })
  cb.onLastPing(new Date().toLocaleTimeString())
}

// ─── Background tracking ─────────────────────────────────────────────────────

export async function startBackgroundTracking(trackerId: string, cb: SocketCallbacks): Promise<boolean> {
  await connectSocket(trackerId, cb)

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
        if (error) {
          if (error.code === 'NOT_AUTHORIZED') cb.onStatus('permission_denied')
          else if (error.code === 'POSITION_UNAVAILABLE') cb.onStatus('no_gps')
          else cb.onStatus('error')
          return
        }
        if (!location) return
        emitLocation(trackerId, location, cb)
      }
    )
    return true
  } catch (e: any) {
    // Background geolocation unavailable (web/dev) — fall back to foreground
    const ping = async () => {
      try {
        const { coords } = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: GPS_TIMEOUT_MS })
        emitLocation(trackerId, coords, cb)
        cb.onStatus('broadcasting')
      } catch (err: any) {
        const msg = err?.message?.toLowerCase() ?? ''
        if (msg.includes('denied') || msg.includes('not authorized')) cb.onStatus('permission_denied')
        else if (msg.includes('unavailable') || msg.includes('disabled')) cb.onStatus('no_gps')
        else if (msg.includes('timeout')) cb.onStatus('timeout')
        else cb.onStatus('error')
      }
    }
    await ping()
    fgIntervalId = setInterval(ping, FOREGROUND_PING_INTERVAL_MS)
    return false
  }
}

export async function stopBackgroundTracking(): Promise<void> {
  if (bgWatcherId) {
    try { await BackgroundGeolocation.removeWatcher({ id: bgWatcherId }) } catch {}
    bgWatcherId = null
  }
  if (fgIntervalId) { clearInterval(fgIntervalId); fgIntervalId = null }
  disconnectSocket()
}
