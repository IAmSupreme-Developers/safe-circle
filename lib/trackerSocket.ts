import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { SERVER_URL } from './config'

export type TrackerLiveData = {
  trackerId: string
  lat?: number; lng?: number; accuracy?: number
  altitude?: number | null; speed?: number | null; heading?: number | null
  timestamp?: string
}

export type TrackerBattery = { trackerId: string; level: number; charging: boolean }
export type TrackerNetwork = { trackerId: string; connected: boolean; type: string }

type Callbacks = {
  onOnline?: (trackerId: string) => void
  onOffline?: (trackerId: string) => void
  onLocation?: (data: TrackerLiveData) => void
  onBattery?: (data: TrackerBattery) => void
  onNetwork?: (data: TrackerNetwork) => void
}

let socket: Socket | null = null
let refCount = 0

function getSocket(token: string): Socket {
  if (!socket || !socket.connected) {
    socket = io(`${SERVER_URL}/guardian`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
    })
    socket.on('connect', () => console.log('[guardian socket] connected'))
    socket.on('connect_error', (e) => console.error('[guardian socket] connect_error:', e.message))
    socket.on('disconnect', (reason) => console.log('[guardian socket] disconnected:', reason))
  }
  return socket
}

export function useTrackerSocket(
  token: string | null,
  trackerIds: string[],
  callbacks: Callbacks
) {
  const cbRef = useRef(callbacks)
  cbRef.current = callbacks

  useEffect(() => {
    if (!token || trackerIds.length === 0) return

    const s = getSocket(token)
    refCount++

    const onOnline   = (d: any) => cbRef.current.onOnline?.(d.trackerId)
    const onOffline  = (d: any) => cbRef.current.onOffline?.(d.trackerId)
    const onLocation = (d: any) => cbRef.current.onLocation?.(d)
    const onBattery  = (d: any) => cbRef.current.onBattery?.(d)
    const onNetwork  = (d: any) => cbRef.current.onNetwork?.(d)

    s.on('tracker:online',   onOnline)
    s.on('tracker:offline',  onOffline)
    s.on('tracker:location', onLocation)
    s.on('tracker:battery',  onBattery)
    s.on('tracker:network',  onNetwork)

    // Subscribe to each tracker room
    trackerIds.forEach(id => s.emit('guardian:subscribe', { trackerId: id }))

    return () => {
      trackerIds.forEach(id => s.emit('guardian:unsubscribe', { trackerId: id }))
      s.off('tracker:online',   onOnline)
      s.off('tracker:offline',  onOffline)
      s.off('tracker:location', onLocation)
      s.off('tracker:battery',  onBattery)
      s.off('tracker:network',  onNetwork)
      refCount--
      if (refCount === 0) { socket?.disconnect(); socket = null }
    }
  }, [token, trackerIds.join(',')])
}

export function sendCommand(token: string, trackerId: string, cmd: string, payload?: any) {
  const s = getSocket(token)
  s.emit('guardian:command', { trackerId, cmd, payload })
}
