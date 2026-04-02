'use client'
import { useState, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'
import { getCredentials, saveCredentials, checkRegistration } from '@/lib/device'
import type { DeviceInfo } from '@/lib/device'
import { Screen, DeviceIcon, Btn } from './ui'

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <button onClick={copy} className="opacity-60 hover:opacity-100">
      {copied ? <Check size={14} style={{ color: 'var(--accent)' }} /> : <Copy size={14} />}
    </button>
  )
}

function CredentialRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs mb-1" style={{ color: 'var(--fg-muted)' }}>{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-xl font-mono font-bold tracking-widest">{value}</span>
        <CopyBtn text={value} />
      </div>
    </div>
  )
}

export default function PairScreen({ onPaired }: { onPaired: (info: DeviceInfo) => void }) {
  const [creds, setCreds] = useState<{ device_id: string; code: string } | null>(null)
  const [form, setForm] = useState({ device_id: '', code: '' })
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { setCreds(getCredentials()) }, [])

  function saveCreds(e: React.FormEvent) {
    e.preventDefault()
    const { device_id, code } = form
    if (!device_id.trim() || !code.trim()) return
    saveCredentials(device_id.trim(), code.trim())
    setCreds({ device_id: device_id.trim(), code: code.trim() })
  }

  async function checkStatus() {
    if (!creds) return
    setChecking(true); setError('')
    const info = await checkRegistration(creds.device_id)
    if (info) onPaired(info)
    else setError('Not registered yet. Ask your guardian to add this device in the SafeCircle app.')
    setChecking(false)
  }

  if (!creds) return (
    <Screen>
      <DeviceIcon />
      <div className="text-center">
        <h1 className="text-2xl font-bold">Setup Device</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>Enter the Device ID and Code printed on this device.</p>
      </div>
      <form onSubmit={saveCreds} className="space-y-4">
        {(['device_id', 'code'] as const).map(k => (
          <div key={k}>
            <label className="text-xs mb-1 block" style={{ color: 'var(--fg-muted)' }}>
              {k === 'device_id' ? 'Device ID' : 'Pairing Code'}
            </label>
            <input required value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
              className="w-full rounded-xl border px-4 py-3 text-sm font-mono outline-none"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--fg)' }} />
          </div>
        ))}
        <Btn type="submit">Confirm</Btn>
      </form>
    </Screen>
  )

  return (
    <Screen>
      <DeviceIcon />
      <div className="text-center">
        <h1 className="text-2xl font-bold">SafeCircle Device</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>Share these with your guardian to register this device.</p>
      </div>
      <div className="rounded-2xl border p-5 space-y-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <CredentialRow label="Device ID" value={creds.device_id} />
        <CredentialRow label="Pairing Code" value={creds.code} />
      </div>
      {error && <p className="text-sm text-center" style={{ color: 'var(--warning)' }}>{error}</p>}
      <p className="text-xs text-center" style={{ color: 'var(--fg-muted)' }}>
        Once your guardian has added this device in the SafeCircle app, tap below.
      </p>
      <Btn onClick={checkStatus} disabled={checking}>{checking ? 'Checking…' : 'Check Registration Status'}</Btn>
    </Screen>
  )
}
