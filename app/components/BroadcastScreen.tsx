'use client'
import { useEffect, useRef, useState } from 'react'
import { Radio, RadioTower, Unlink } from 'lucide-react'
import { pingLocation, PING_INTERVAL_MS } from '@/lib/device'
import type { DeviceInfo, BroadcastStatus } from '@/lib/device'
import { Btn } from './ui'

const STATUS_CONFIG: Record<BroadcastStatus, { label: string; color: string }> = {
  idle:         { label: 'Starting…',       color: 'var(--fg-muted)' },
  broadcasting: { label: 'Broadcasting',    color: 'var(--accent)'   },
  error:        { label: 'Upload failed',   color: 'var(--danger)'   },
  no_gps:       { label: 'GPS unavailable', color: 'var(--warning)'  },
}

export default function BroadcastScreen({ device, onUnpair }: { device: DeviceInfo; onUnpair: () => void }) {
  const [status, setStatus] = useState<BroadcastStatus>('idle')
  const [lastPing, setLastPing] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function ping() {
    const ok = await pingLocation(device.trackerId)
    setStatus(ok ? 'broadcasting' : 'no_gps')
    if (ok) setLastPing(new Date().toLocaleTimeString())
  }

  function start() { ping(); intervalRef.current = setInterval(ping, PING_INTERVAL_MS) }
  function stop() { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null } }

  useEffect(() => { start(); return stop }, [])

  const isActive = status === 'broadcasting'
  const { label, color } = STATUS_CONFIG[status]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 gap-8">
      <div className="relative flex items-center justify-center">
        {isActive && <span className="absolute h-32 w-32 rounded-full animate-ping opacity-20" style={{ background: 'var(--accent)' }} />}
        <div className="flex h-24 w-24 items-center justify-center rounded-full"
          style={{ background: 'color-mix(in srgb, var(--accent) 20%, transparent)' }}>
          {isActive ? <RadioTower size={44} style={{ color: 'var(--accent)' }} /> : <Radio size={44} style={{ color: 'var(--fg-muted)' }} />}
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-lg font-bold">{device.label}</p>
        <p className="text-sm font-semibold" style={{ color }}>{label}</p>
        {lastPing && <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>Last ping: {lastPing}</p>}
      </div>

      <div className="w-full max-w-xs space-y-3">
        {isActive
          ? <Btn variant="danger" onClick={() => { stop(); setStatus('idle') }}>Stop Broadcasting</Btn>
          : <Btn onClick={start}>Start Broadcasting</Btn>}
        <Btn variant="ghost" onClick={() => { stop(); onUnpair() }}><Unlink size={15} /> Unpair Device</Btn>
      </div>
    </div>
  )
}
