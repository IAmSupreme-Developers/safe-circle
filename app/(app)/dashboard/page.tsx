'use client'
import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Bell, ArrowUpRight } from 'lucide-react'
import { useAuth } from '@/app/components/AuthProvider'
import { createDb } from '@/lib/db'
import { useTrackerRealtime } from '@/lib/realtime'
import { Skeleton } from '@/app/components/ui'
import { Avatar } from '@/app/components/shared'
import FeedCard from '@/app/components/FeedCard'
import { DASHBOARD_ALERT_LIMIT } from '@/lib/config'
import { QUICK_ACCESS_CARDS, STATIC_STATS } from '@/lib/data'
import type { Post, Tracker } from '@/lib/types'

const MapView = dynamic(() => import('@/app/components/MapView'), { ssr: false })

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl p-4"
      style={{ background: 'var(--bg-card)', boxShadow: 'var(--bg-card-shadow)' }}>
      <span className="text-xl font-black">{value}</span>
      <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>{label}</span>
    </div>
  )
}

function QuickCard({ img, tag, title, body, href }: typeof QUICK_ACCESS_CARDS[number]) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-2xl p-4 gap-4"
      style={{ background: 'var(--bg-card)', boxShadow: 'var(--bg-card-shadow)' }}>
      <div className="space-y-1 flex-1">
        <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{tag}</p>
        <p className="font-bold text-sm">{title}</p>
        <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{body}</p>
        <div className="mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ background: 'var(--primary)', color: '#fff' }}>
          <ArrowUpRight size={12} /> Get Started
        </div>
      </div>
      <img src={img} alt={title} className="w-24 h-24 object-contain flex-shrink-0" />
    </Link>
  )
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="font-bold">{title}</p>
      <Link href={href} className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>see all</Link>
    </div>
  )
}

export default function DashboardPage() {
  const { user, token } = useAuth()
  const db = useMemo(() => token ? createDb(token) : null, [token])
  const [profile, setProfile] = useState<any>(null)
  const [trackers, setTrackers] = useState<Tracker[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loadingTrackers, setLoadingTrackers] = useState(true)
  const [loadingPosts, setLoadingPosts] = useState(true)

  useEffect(() => {
    if (!user || !db) return
    db.profile.get().then((d: any) => setProfile(d))
    db.trackers.list().then((d: any) => { setTrackers(d ?? []); setLoadingTrackers(false) })
    db.posts.list(DASHBOARD_ALERT_LIMIT, true).then((d: any) => { setPosts(d ?? []); setLoadingPosts(false) })
  }, [db])

  useTrackerRealtime(user?.id, (updated) =>
    setTrackers(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t))
  )

  const mapPoints = useMemo(() =>
    trackers.filter(t => t.last_lat && t.last_lng)
      .map(t => ({ id: t.id, lat: t.last_lat!, lng: t.last_lng!, label: t.label ?? '', type: 'tracker' as const }))
  , [trackers])

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar src={profile?.avatar_url} name={profile?.full_name} size={48} />
          <div>
            <p className="font-bold">{profile?.full_name ? `Hey ${profile.full_name}` : 'Hey there'}</p>
            <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>Welcome back</p>
          </div>
        </div>
        <Link href="/alerts" className="h-10 w-10 rounded-full flex items-center justify-center relative"
          style={{ background: 'var(--bg-card)', boxShadow: 'var(--bg-card-shadow)' }}>
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full" style={{ background: '#f59e0b' }} />
        </Link>
      </div>

      {/* Hero */}
      <h1 className="text-3xl font-black leading-tight">
        <span style={{ color: 'var(--primary)' }}>Take charge</span> of the situation with just{' '}
        <span style={{ color: 'var(--primary)' }}>one click</span>
      </h1>

      {/* Stats */}
      <div>
        <p className="font-bold mb-1">Over View Statistics</p>
        <p className="text-xs mb-3" style={{ color: 'var(--fg-muted)' }}>
          statistics for the last past activities carried out and their resulting outcomes
        </p>
        <div className="grid grid-cols-3 gap-3">
          <StatCard value={`${trackers.length}`} label="Trackers" />
          {STATIC_STATS.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      </div>

      {/* Quick Access */}
      <div>
        <p className="font-bold mb-1">Quick Access</p>
        <p className="text-xs mb-3" style={{ color: 'var(--fg-muted)' }}>
          Prioritise and set deadlines so you don't miss anything
        </p>
        <div className="space-y-3">
          {QUICK_ACCESS_CARDS.map(c => <QuickCard key={c.title} {...c} />)}
        </div>
      </div>

      {/* Map widget */}
      {!loadingTrackers && mapPoints.length > 0 && (
        <div>
          <SectionHeader title="Live Map" href="/map" />
          <div className="rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--bg-card-shadow)' }}>
            <MapView points={mapPoints} height={180} />
          </div>
        </div>
      )}

      {/* Recent feeds */}
      <div>
        <SectionHeader title="Recent Activity Feeds" href="/feeds" />
        {loadingPosts
          ? <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} style={{ height: 120 }} />)}</div>
          : posts.length === 0
            ? <p className="text-sm text-center py-4" style={{ color: 'var(--fg-muted)' }}>No community posts yet.</p>
            : posts.map(p => <div key={p.id} className="mb-3"><FeedCard post={p} compact /></div>)}
      </div>
    </div>
  )
}
