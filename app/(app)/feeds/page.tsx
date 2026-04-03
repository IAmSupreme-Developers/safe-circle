'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Bell, Plus, Send } from 'lucide-react'
import { useAuth } from '@/app/components/AuthProvider'
import { createDb } from '@/lib/db'
import { Skeleton } from '@/app/components/ui'
import FeedCard from '@/app/components/FeedCard'
import type { Post } from '@/lib/types'

function CreatePostForm({ onDone, db }: { onDone: () => void; db: ReturnType<typeof createDb> }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    await db.posts.create({ content }).catch(() => null)
    setContent(''); setLoading(false); onDone()
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border p-4 space-y-3 mb-4"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <p className="font-semibold text-sm">New Post</p>
      <textarea value={content} onChange={e => setContent(e.target.value)}
        placeholder="Share an alert, sighting, or update with the community…"
        rows={3} className="w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none"
        style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--fg)' }} />
      <button type="submit" disabled={loading || !content.trim()}
        className="w-full flex items-center justify-center gap-2 rounded-full py-3 font-semibold text-sm disabled:opacity-50"
        style={{ background: 'var(--primary)', color: '#fff' }}>
        <Send size={14} /> {loading ? 'Posting…' : 'Post'}
      </button>
    </form>
  )
}

export default function FeedsPage() {
  const { user, token } = useAuth()
  const db = useMemo(() => token ? createDb(token) : null, [token])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  async function load() {
    if (!db) return
    const data: any = await db.posts.list().catch(() => [])
    setPosts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [db])

  async function deletePost(id: string) {
    if (!confirm('Delete this post?')) return
    await db?.posts.delete(id)
    load()
  }

  return (
    <div className="px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard" className="h-9 w-9 rounded-full flex items-center justify-center"
          style={{ background: 'var(--bg-card)', boxShadow: 'var(--bg-card-shadow)' }}>←</Link>
        <h1 className="text-lg font-black">Feeds</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCreate(v => !v)}
            className="h-9 w-9 rounded-full flex items-center justify-center"
            style={{ background: 'var(--primary)', color: '#fff' }}>
            <Plus size={16} />
          </button>
          <Link href="/alerts" className="h-9 w-9 rounded-full flex items-center justify-center relative"
            style={{ background: 'var(--bg-card)', boxShadow: 'var(--bg-card-shadow)' }}>
            <Bell size={16} />
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full" style={{ background: '#f59e0b' }} />
          </Link>
        </div>
      </div>

      {showCreate && db && <CreatePostForm db={db} onDone={() => { setShowCreate(false); load() }} />}

      <p className="font-bold mb-4">Recent activities feeds</p>

      {loading
        ? <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} style={{ height: 140 }} />)}</div>
        : posts.length === 0
          ? <p className="text-center py-12 text-sm" style={{ color: 'var(--fg-muted)' }}>No posts yet. Be the first to post.</p>
          : posts.map(p => (
            <div key={p.id} className="mb-4">
              <FeedCard post={p} userId={user?.id} onDelete={() => deletePost(p.id)} />
            </div>
          ))}
    </div>
  )
}
