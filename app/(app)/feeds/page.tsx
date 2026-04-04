'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Bell, Plus, Send, MapPin, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '@/app/components/AuthProvider'
import { createDb } from '@/lib/db'
import { Skeleton, ErrorMessage } from '@/app/components/ui'
import FeedCard from '@/app/components/FeedCard'
import { useToast } from '@/app/components/Toast'
import { uploadPostImage } from '@/lib/mediaUpload'
import { getCurrentPosition } from '@/lib/geolocation'
import type { Post } from '@/lib/types'

function CreatePostForm({ onDone, db }: { onDone: () => void; db: ReturnType<typeof createDb> }) {
  const [content, setContent] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locLoading, setLocLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()

  function pickImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  function removeImage(i: number) {
    setImages(imgs => imgs.filter((_, idx) => idx !== i))
    setPreviews(ps => ps.filter((_, idx) => idx !== i))
  }

  async function getLocation() {
    setLocLoading(true)
    try {
      const pos = await getCurrentPosition()
      setLocation(pos)
    } catch { toast('Could not get location', 'error') }
    finally { setLocLoading(false) }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true); setError('')
    try {
      let attachments: string[] = []
      if (images.length) {
        const results = await Promise.all(
          images.map((f, i) => uploadPostImage(f, p => setUploadProgress(Math.round((i * 100 + p) / images.length))))
        )
        attachments = results
        setUploadProgress(null)
      }
      await db.posts.create({ content, attachments, location_lat: location?.lat, location_lng: location?.lng })
      setContent(''); setImages([]); setPreviews([]); setLocation(null)
      onDone()
      toast('Post published', 'success')
    } catch (e: any) {
      setError(e?.message ?? 'Failed to post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border p-4 space-y-3 mb-4"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <p className="font-semibold text-sm">New Post</p>
      <textarea value={content} onChange={e => setContent(e.target.value)}
        placeholder="Share an alert, sighting, or update with the community…"
        rows={3} className="w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none"
        style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--fg)' }} />

      {previews.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {previews.map((src, i) => (
            <div key={i} className="relative">
              <img src={src} className="h-16 w-16 rounded-lg object-cover" />
              <button type="button" onClick={() => removeImage(i)}
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-white text-xs flex items-center justify-center"
                style={{ background: 'var(--danger)' }}>×</button>
            </div>
          ))}
        </div>
      )}

      {location && (
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--primary)' }}>
          <MapPin size={12} /> {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          <button type="button" onClick={() => setLocation(null)} className="ml-1" style={{ color: 'var(--fg-muted)' }}>×</button>
        </div>
      )}

      {uploadProgress !== null && (
        <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: 'var(--border)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${uploadProgress}%`, background: 'var(--primary)' }} />
        </div>
      )}

      {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}

      <div className="flex items-center gap-2">
        <label className="h-9 w-9 rounded-full flex items-center justify-center cursor-pointer"
          style={{ background: 'var(--bg-input)' }}>
          <ImageIcon size={15} />
          <input type="file" accept="image/*" multiple className="hidden" onChange={pickImages} />
        </label>
        <button type="button" onClick={getLocation} disabled={locLoading}
          className="h-9 w-9 rounded-full flex items-center justify-center"
          style={{ background: location ? 'var(--primary)' : 'var(--bg-input)', color: location ? '#fff' : 'inherit' }}>
          <MapPin size={15} />
        </button>
        <button type="submit" disabled={loading || !content.trim()}
          className="flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 font-semibold text-sm disabled:opacity-50"
          style={{ background: 'var(--primary)', color: '#fff' }}>
          <Send size={14} /> {loading ? 'Posting…' : 'Post'}
        </button>
      </div>
    </form>
  )
}

export default function FeedsPage() {
  const { user, token } = useAuth()
  const db = useMemo(() => token ? createDb(token) : null, [token])
  const { toast } = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [category, setCategory] = useState('')

  async function load(cat = category) {
    if (!db) return
    setLoadError(null)
    try {
      const data: any = await db.posts.list(undefined, false, cat || undefined)
      setPosts(data ?? [])
    } catch (e: any) {
      setLoadError(e?.message ?? 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [db])

  function selectCategory(cat: string) {
    const next = cat === category ? '' : cat
    setCategory(next)
    setLoading(true)
    load(next)
  }

  async function deletePost(id: string) {
    if (!confirm('Delete this post?')) return
    try {
      await db?.posts.delete(id)
      load()
    } catch (e: any) {
      toast(e?.message ?? 'Failed to delete post', 'error')
    }
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

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
        {['missing', 'found', 'sighting', 'alert', 'update'].map(cat => (
          <button key={cat} onClick={() => selectCategory(cat)}
            className="flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-all"
            style={{
              background: category === cat ? 'var(--primary)' : 'var(--bg-card)',
              color: category === cat ? '#fff' : 'var(--fg-muted)',
              boxShadow: 'var(--bg-card-shadow)'
            }}>
            {cat}
          </button>
        ))}
      </div>

      <p className="font-bold mb-4">Recent activities feeds</p>

      {loading
        ? <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} style={{ height: 140 }} />)}</div>
        : loadError
          ? <ErrorMessage message={loadError} onRetry={load} />
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
