'use client'
import { useEffect, useState } from 'react'
import { getPairedDevice, savePairedDevice, clearPairedDevice } from '@/lib/device'
import type { DeviceInfo } from '@/lib/device'
import PairScreen from './components/PairScreen'
import BroadcastScreen from './components/BroadcastScreen'

export default function TrackerApp() {
  const [device, setDevice] = useState<DeviceInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { setDevice(getPairedDevice()); setLoading(false) }, [])

  function onPaired(info: DeviceInfo) { savePairedDevice(info); setDevice(info) }
  function onUnpair() { clearPairedDevice(); setDevice(null) }

  if (loading) return null
  return device
    ? <BroadcastScreen device={device} onUnpair={onUnpair} />
    : <PairScreen onPaired={onPaired} />
}
