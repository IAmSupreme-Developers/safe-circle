'use client'
import { useEffect, useRef, useState } from 'react'
import { Radio, RadioTower, Unlink, Wifi, WifiOff } from 'lucide-react'
import { startBackgroundTracking, stopBackgroundTracking } from '@/lib/device'
import type { DeviceInfo, BroadcastStatus } from '@/lib/device'
import { Btn } from './ui'

const STATUS_CONFIG: Record<BroadcastStatus, { label: string; color: string }> = {
  idle:             { label: 'Stopped',              color: 'var(--fg-muted)' },
  connecting:       { label: 'Connecting…',          color: 'var(--warning)'  },
  broadcasting:     { label: 'Live',                 color: 'var(--accent)'   },
  error:            { label: 'Connection error',     color: 'var(--danger)'   },
  no_gps:           { label: 'GPS unavailable',      color: 'var(--warning)'  },
  disconnected:     { label: 'Disconnected',         color: 'var(--danger)'   },
  permission_denied:{ label: 'Location permission denied', color: 'var(--danger)' },
  timeout:          { label: 'GPS timeout',          color: 'var(--warning)'  },
}

export default function BroadcastScreen({ device, onUnpair }: { device: DeviceInfo; onUnpair: () => void }) {
  const [status, setStatus] = useState<BroadcastStatus>('idle')
  const [lastPing, setLastPing] = useState<string | null>(null)
  const [lastCmd, setLastCmd] = useState<string | null>(null)

  async function start() {
    await startBackgroundTracking(device.trackerId, {
      onStatus: setStatus,
      onLastPing: setLastPing,
      onCommand: (cmd) => {
        const messages: Record<string, string> = {
          alarm: '🚨 Alarm triggered remotely',
          ping: '📍 Location requested',
          update_interval: '⏱ Ping interval updated',
        }
        setLastCmd(messages[cmd] ?? `Command: ${cmd}`)
        setTimeout(() => setLastCmd(null), 5000)
      },
    })
  }

  async function stop() {
    await stopBackgroundTracking()
    setStatus('idle')
  }

  useEffect(() => { start(); return () => { stopBackgroundTracking() } }, [])

  const isActive = status === 'broadcasting'
  const isConnected = status === 'broadcasting' || status === 'connecting'
  const { label, color } = STATUS_CONFIG[status]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 gap-8">
      {/* Pulse ring */}
      <div className="relative flex items-center justify-center">
        {isActive && <span className="absolute h-32 w-32 rounded-full animate-ping opacity-20" style={{ background: 'var(--accent)' }} />}
        <div className="flex h-24 w-24 items-center justify-center rounded-full"
          style={{ background: 'color-mix(in srgb, var(--accent) 20%, transparent)' }}>
          {isActive
            ? <RadioTower size={44} style={{ color: 'var(--accent)' }} />
            : <Radio size={44} style={{ color: 'var(--fg-muted)' }} />}
        </div>
      </div>

      {/* Info */}
      <div className="text-center space-y-1">
        <p className="text-lg font-bold">{device.label}</p>
        <div className="flex items-center justify-center gap-2">
          {isConnected ? <Wifi size={14} style={{ color }} /> : <WifiOff size={14} style={{ color }} />}
          <p className="text-sm font-semibold" style={{ color }}>{label}</p>
        </div>
        {lastPing && <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>Last ping: {lastPing}</p>}
        {lastCmd && <p className="text-xs mt-1 px-3 py-1 rounded-full" style={{ background: 'var(--warning)', color: '#000' }}>{lastCmd}</p>}
      </div>

      {/* Actions */}
      <div className="w-full max-w-xs space-y-3">
        {isActive
          ? <Btn variant="danger" onClick={stop}>Stop Broadcasting</Btn>
          : <Btn onClick={start}>Start Broadcasting</Btn>}
        <Btn variant="ghost" onClick={() => { stop(); onUnpair() }}><Unlink size={15} /> Unpair Device</Btn>
      </div>
    </div>
  )
}
