'use client'
import { useEffect, useMemo, useState } from 'react'
import { Send } from 'lucide-react'
import { useAuth } from '@/app/components/AuthProvider'
import { createDb } from '@/lib/db'
import { Skeleton } from '@/app/components/ui'
import { Avatar, VerifiedBadge, BackButton } from '@/app/components/shared'
import type { Post, Comment } from '@/lib/types'

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Avatar src={comment.author?.avatar_url} name={comment.author?.full_name} size={36} />
        <div className="flex-1">
          <p className="font-semibold text-sm">{comment.author?.full_name ?? 'Unknown'}</p>
          <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{new Date(comment.created_at).toLocaleString()}</p>
        </div>
        <VerifiedBadge size={6} />
      </div>
      <p className="text-sm leading-relaxed pl-12">{comment.content}</p>
      <hr className="mt-4" style={{ borderColor: 'var(--border)' }} />
    </div>
  )
}

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { token } = useAuth()
  const db = useMemo(() => token ? createDb(token) : null, [token])
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [postId, setPostId] = useState<string | null>(null)

  useEffect(() => { params.then(p => setPostId(p.id)) }, [params])

  useEffect(() => {
    if (!db || !postId) return
    db.posts.get(postId).then((d: any) => { setPost(d); setLoading(false) })
    db.comments.list(postId).then((d: any) => setComments(d ?? []))
  }, [db, postId])

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !postId || !db) return
    const data: any = await db.comments.create(postId, text).catch(() => null)
    if (data) { setComments(c => [...c, data]); setText('') }
  }

  if (loading) return (
    <div className="px-4 py-6 space-y-4">
      <Skeleton style={{ height: 24, width: 40 }} />
      <Skeleton style={{ height: 80 }} />
      <Skeleton style={{ height: 200 }} />
    </div>
  )

  if (!post) return <p className="p-8 text-center" style={{ color: 'var(--fg-muted)' }}>Post not found.</p>

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <div className="px-4 py-6 flex-1 space-y-4">
        <BackButton href="/feeds" />

        {/* Post header */}
        <div className="flex items-center gap-3">
          <Avatar src={post.author?.avatar_url} name={post.author?.full_name} size={52} />
          <div className="flex-1">
            <p className="font-semibold">{post.author?.full_name ?? 'Unknown'}</p>
            <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{new Date(post.created_at).toLocaleString()}</p>
          </div>
          <VerifiedBadge size={7} />
        </div>
        <hr style={{ borderColor: 'var(--border)' }} />

        <p className="text-lg font-medium text-center leading-relaxed px-2">{post.content}</p>

        {post.attachments?.length > 0 && (
          <div className="flex justify-center gap-2">
            {post.attachments.map((_, i) => (
              <span key={i} className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--border)' }} />
            ))}
          </div>
        )}

        <p className="font-bold text-lg">comments</p>
        <div className="space-y-4">
          {comments.map(c => <CommentItem key={c.id} comment={c} />)}
        </div>
      </div>

      {/* Reply box */}
      <div className="sticky bottom-16 px-4 pb-4">
        <div className="rounded-2xl p-4 space-y-3"
          style={{ background: 'var(--bg-card)', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
          <p className="text-sm font-semibold text-center">Message Dialogue box</p>
          <form onSubmit={submitComment} className="space-y-3">
            <textarea value={text} onChange={e => setText(e.target.value)}
              placeholder="text here" rows={3}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none"
              style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--fg)' }} />
            <button type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-full py-3.5 font-semibold text-sm"
              style={{ background: 'var(--primary)', color: '#fff' }}>
              <Send size={15} /> Submit message
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
