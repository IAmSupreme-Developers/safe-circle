'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/app/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { createDb } from '@/lib/db'
import type { Profile } from '@/lib/types'
import { Card, Input, Button } from '@/app/components/ui'
import { LogOut, Save } from 'lucide-react'

const DEFAULT: Omit<Profile, 'id'> = { full_name: '', phone: '', proximity_buffer_meters: 50 }

export default function SettingsPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState(DEFAULT)
  const [saved, setSaved] = useState(false)
  const db = token ? createDb(token) : null
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: k === 'proximity_buffer_meters' ? Number(e.target.value) : e.target.value }))

  useEffect(() => {
    if (!db) return
    db.profile.get().then((data: any) => {
      if (data) setForm({ full_name: data.full_name ?? '', phone: data.phone ?? '', proximity_buffer_meters: data.proximity_buffer_meters ?? 50 })
    })
  }, [token])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    await db?.profile.update(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function signOut() {
    const { supabase } = await import('@/lib/supabase')
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold">Settings</h1>
      <form onSubmit={save} className="space-y-4">
        <Card>
          <p className="font-semibold text-sm mb-3">Profile</p>
          <div className="space-y-3">
            <Input label="Full Name" type="text" value={form.full_name} onChange={set('full_name')} />
            <Input label="Phone" type="tel" value={form.phone} onChange={set('phone')} />
          </div>
        </Card>
        <Card>
          <p className="font-semibold text-sm mb-1">Proximity Buffer</p>
          <p className="text-xs mb-3" style={{ color: 'var(--fg-muted)' }}>Suppress alerts when tracker is within this distance of you.</p>
          <div className="flex items-center gap-3">
            <input type="range" min={0} max={500} step={10} value={form.proximity_buffer_meters} onChange={set('proximity_buffer_meters')} className="flex-1" />
            <span className="text-sm font-semibold w-16 text-right">{form.proximity_buffer_meters}m</span>
          </div>
        </Card>
        <Button type="submit" className="w-full"><Save size={16} />{saved ? 'Saved!' : 'Save Changes'}</Button>
      </form>
      <Button variant="danger" onClick={signOut} className="w-full"><LogOut size={16} />Sign Out</Button>
    </div>
  )
}
