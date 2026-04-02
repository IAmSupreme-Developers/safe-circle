'use client'
import { useState } from 'react'
import { Users, MapPin, CheckCircle, Circle } from 'lucide-react'

const mockParticipants = [
  { id: '1', name: 'You', area: 'North sector', status: 'active' },
  { id: '2', name: 'James O.', area: 'East sector', status: 'active' },
  { id: '3', name: 'Amaka B.', area: 'South sector', status: 'idle' },
]

export default function SearchPartyPage() {
  const [active, setActive] = useState(false)

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Search Party</h1>
        <button onClick={() => setActive(v => !v)}
          className="rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
          style={{ background: active ? 'var(--danger)' : 'var(--accent)', color: active ? '#fff' : 'var(--accent-fg)' }}>
          {active ? 'End Search' : 'Start Search'}
        </button>
      </div>

      {/* Status banner */}
      <div className="rounded-2xl border p-4 flex items-center gap-3"
        style={{ background: 'var(--bg-card)', borderColor: active ? 'var(--warning)' : 'var(--border)' }}>
        <Users size={20} style={{ color: active ? 'var(--warning)' : 'var(--fg-muted)' }} />
        <div>
          <p className="font-semibold text-sm">{active ? 'Search party active' : 'No active search'}</p>
          <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
            {active ? `${mockParticipants.length} participants covering the area` : 'Start a search to coordinate with your community'}
          </p>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="rounded-2xl border flex items-center justify-center"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', height: 220 }}>
        <div className="flex flex-col items-center gap-2" style={{ color: 'var(--fg-muted)' }}>
          <MapPin size={32} />
          <p className="text-sm">Live map coming soon</p>
          <p className="text-xs">Leaflet map with coverage zones</p>
        </div>
      </div>

      {/* Participants */}
      {active && (
        <section>
          <h2 className="font-semibold mb-3">Participants</h2>
          {mockParticipants.map(p => (
            <div key={p.id} className="mb-2 flex items-center justify-between rounded-2xl border px-4 py-3"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                {p.status === 'active'
                  ? <CheckCircle size={16} style={{ color: 'var(--accent)' }} />
                  : <Circle size={16} style={{ color: 'var(--fg-muted)' }} />}
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{p.area}</p>
                </div>
              </div>
              <span className="text-xs capitalize px-2 py-0.5 rounded-full"
                style={{
                  background: p.status === 'active' ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--bg)',
                  color: p.status === 'active' ? 'var(--accent)' : 'var(--fg-muted)'
                }}>{p.status}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
