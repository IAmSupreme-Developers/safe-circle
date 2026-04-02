'use client'
import { useEffect, useRef, useState } from 'react'
import { Radio, RadioTower, Unlink } from 'lucide-react'
import { startBackgroundTracking, stopBackgroundTracking, pingLocation } from '@/lib/device'
import type { DeviceInfo, BroadcastStatus } from '@/lib/device'
import { FOREGROUND_PING_INTERVAL_MS } from '@/lib/config'
import { Btn } from './ui'

const STATUS_CONFIG: Record<BroadcastStatus, { label: string; color: string }> = {
  idle:         { label: 'Stopped',         color: 'var(--fg-muted)' },
  broadcasting: { label: 'Broadcasting',    color: 'var(--accent)'   },
  error:        { label: 'Upload failed',   color: 'var(--danger)'   },
  no_gps:       { label: 'GPS unavailable', color: 'var(--warning)'  },
}

export default function BroadcastScreen({ device, onUnpair }: { device: DeviceInfo; onUnpair: () => void }) {
  const [status, setStatus] = useState<BroadcastStatus>('idle')
  const [lastPing, setLastPing] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function start() {
    setStatus('idle')
    const ok = await startBackgroundTracking(device.trackerId)
    if (ok) {
      setStatus('broadcasting')
      setLastPing(new Date().toLocaleTimeString())
    } else {
      // Fallback: interval-based foreground ping (web/dev)
      const ping = async () => {
        const pinged = await pingLocation(device.trackerId)
        setStatus(pinged ? 'broadcasting' : 'no_gps')
        if (pinged) setLastPing(new Date().toLocaleTimeString())
      }
      await ping()
      intervalRef.current = setInterval(ping, FOREGROUND_PING_INTERVAL_MS)
    }
  }

  async function stop() {
    await stopBackgroundTracking()
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    setStatus('idle')
  }

  // Auto-start on mount
  useEffect(() => { start(); return () => { stopBackgroundTracking() } }, [])

  const isActive = status === 'broadcasting'
  const { label, color } = STATUS_CONFIG[status]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 gap-8">
      <div className="relative flex items-center justify-center">
        {isActive && <span className="absolute h-32 w-32 rounded-full animate-ping opacity-20" style={{ background: 'var(--accent)' }} />}
        <div className="flex h-24 w-24 items-center justify-center rounded-full"
          style={{ background: 'color-mix(in srgb, var(--accent) 20%, transparent)' }}>
          {isActive
            ? <RadioTower size={44} style={{ color: 'var(--accent)' }} />
            : <Radio size={44} style={{ color: 'var(--fg-muted)' }} />}
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-lg font-bold">{device.label}</p>
        <p className="text-sm font-semibold" style={{ color }}>{label}</p>
        {lastPing && <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>Last ping: {lastPing}</p>}
      </div>

      <div className="w-full max-w-xs space-y-3">
        {isActive
          ? <Btn variant="danger" onClick={stop}>Stop Broadcasting</Btn>
          : <Btn onClick={start}>Start Broadcasting</Btn>}
        <Btn variant="ghost" onClick={() => { stop(); onUnpair() }}><Unlink size={15} /> Unpair Device</Btn>
      </div>
    </div>
  )
}
