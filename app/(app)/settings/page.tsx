'use client'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/app/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { createDb } from '@/lib/db'
import type { Profile } from '@/lib/types'
import { Card, Input, Button, Skeleton } from '@/app/components/ui'
import { Avatar } from '@/app/components/shared'
import { LogOut, Save, MapPin, Bell, Shield, FileText, Lock } from 'lucide-react'
import { DEFAULT_PROXIMITY_BUFFER, MAX_PROXIMITY_BUFFER, PROXIMITY_BUFFER_STEP, SAVE_CONFIRM_DURATION_MS } from '@/lib/config'
import { useToast } from '@/app/components/Toast'

const DEFAULT: Omit<Profile, 'id'> = { full_name: '', avatar_url: null, phone: '', proximity_buffer_meters: DEFAULT_PROXIMITY_BUFFER }

function SettingRow({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-3">
        <Icon size={18} style={{ color: 'var(--primary)' }} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {children}
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="w-12 h-6 rounded-full transition-colors relative"
      style={{ background: value ? 'var(--primary)' : 'var(--border)' }}>
      <span className="absolute top-1 h-4 w-4 rounded-full bg-white transition-all"
        style={{ left: value ? 28 : 4 }} />
    </button>
  )
}

export default function SettingsPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const db = useMemo(() => token ? createDb(token) : null, [token])
  const { toast } = useToast()
  const [form, setForm] = useState(DEFAULT)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: k === 'proximity_buffer_meters' ? Number(e.target.value) : e.target.value }))

  useEffect(() => {
    if (!db) return
    db.profile.get().then((data: any) => {
      if (data) setForm({ full_name: data.full_name ?? '', avatar_url: data.avatar_url ?? null, phone: data.phone ?? '', proximity_buffer_meters: data.proximity_buffer_meters ?? DEFAULT_PROXIMITY_BUFFER })
      setLoading(false)
    })
    navigator.permissions?.query({ name: 'geolocation' }).then(r => setLocationEnabled(r.state === 'granted'))
  }, [db])

  function requestLocation() {
    navigator.geolocation.getCurrentPosition(() => setLocationEnabled(true), () => setLocationEnabled(false))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    try {
      await db?.profile.update(form)
      toast('Settings saved', 'success')
      setSaved(true)
      setTimeout(() => setSaved(false), SAVE_CONFIRM_DURATION_MS)
    } catch (e: any) {
      toast(e?.message ?? 'Failed to save settings', 'error')
    }
  }

  async function signOut() {
    const { supabase } = await import('@/lib/supabase')
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) return (
    <div className="px-4 py-6 space-y-4">
      <Skeleton style={{ height: 80 }} />
      <Skeleton style={{ height: 160 }} />
      <Skeleton style={{ height: 120 }} />
    </div>
  )

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      <h1 className="text-xl font-bold">Profile & Settings</h1>

      <form onSubmit={save} className="space-y-4">
        <Card>
          <div className="flex items-center gap-4 mb-4">
            <Avatar src={form.avatar_url} name={form.full_name} size={56} />
            <div>
              <p className="font-semibold">{form.full_name || 'Your Name'}</p>
              <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{user?.email}</p>
            </div>
          </div>
          <div className="space-y-3">
            <Input label="Full Name" type="text" value={form.full_name} onChange={set('full_name')} />
            <Input label="Phone" type="tel" value={form.phone} onChange={set('phone')} />
          </div>
        </Card>

        <Card>
          <p className="font-semibold text-sm mb-1">Proximity Buffer</p>
          <p className="text-xs mb-3" style={{ color: 'var(--fg-muted)' }}>Suppress alerts when tracker is within this distance of you.</p>
          <div className="flex items-center gap-3">
            <input type="range" min={0} max={MAX_PROXIMITY_BUFFER} step={PROXIMITY_BUFFER_STEP}
              value={form.proximity_buffer_meters} onChange={set('proximity_buffer_meters')} className="flex-1" />
            <span className="text-sm font-semibold w-16 text-right">{form.proximity_buffer_meters}m</span>
          </div>
        </Card>

        <Button type="submit" className="w-full"><Save size={16} />{saved ? 'Saved!' : 'Save Changes'}</Button>
      </form>

      <Card>
        <p className="font-semibold text-sm mb-2">Permissions & Preferences</p>
        <SettingRow icon={MapPin} label="Location Access">
          {locationEnabled
            ? <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Enabled</span>
            : <button onClick={requestLocation} className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: 'var(--primary)', color: '#fff' }}>Enable</button>}
        </SettingRow>
        <SettingRow icon={Bell} label="Push Notifications">
          <Toggle value={notificationsEnabled} onChange={setNotificationsEnabled} />
        </SettingRow>
      </Card>

      <Card>
        <p className="font-semibold text-sm mb-2">Legal</p>
        <SettingRow icon={FileText} label="Terms of Service">
          <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>→</span>
        </SettingRow>
        <SettingRow icon={Lock} label="Privacy Policy">
          <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>→</span>
        </SettingRow>
        <SettingRow icon={Shield} label="Data & Security">
          <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>→</span>
        </SettingRow>
      </Card>

      <Button variant="danger" onClick={signOut} className="w-full"><LogOut size={16} />Sign Out</Button>
    </div>
  )
}
