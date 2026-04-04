'use client'
import { useEffect, useMemo, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Send, Trash2 } from 'lucide-react'
import { useAuth } from '@/app/components/AuthProvider'
import { createDb } from '@/lib/db'
import { Skeleton } from '@/app/components/ui'
import { Avatar, VerifiedBadge, BackButton } from '@/app/components/shared'
import { useToast } from '@/app/components/Toast'
import type { Post, Comment } from '@/lib/types'

function PostCarousel({ post }: { post: Post }) {
  const [idx, setIdx] = useState(0)
  const total = 1 + (post.attachments?.length ?? 0)
  const ref = (node: HTMLDivElement | null) => {
    if (!node) return
    const onScroll = () => setIdx(Math.round(node.scrollLeft / node.offsetWidth))
    node.addEventListener('scroll', onScroll, { passive: true })
  }
  return (
    <div>
      <div ref={ref} className="flex overflow-x-auto snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
        <div className={`snap-center flex-shrink-0 w-full px-2 ${post.content.length < 120 ? 'flex items-center justify-center' : ''}`}>
          <p className={`text-lg font-medium leading-relaxed ${post.content.length < 120 ? 'text-center' : 'text-left'}`}>{post.content}</p>
        </div>
        {post.attachments?.map((url, i) => (
          <div key={i} className="snap-center flex-shrink-0 w-full">
            <img src={url} alt="" className="w-full object-cover rounded-xl" style={{ height: 260 }} />
          </div>
        ))}
      </div>
      {total > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className="h-2 w-2 rounded-full transition-all"
              style={{ background: i === idx ? 'var(--primary)' : 'var(--border)' }} />
          ))}
        </div>
      )}
    </div>
  )
}

function CommentItem({ comment, canDelete, onDelete }: { comment: Comment; canDelete: boolean; onDelete: () => void }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Avatar src={comment.author?.avatar_url} name={comment.author?.full_name} size={36} />
        <div className="flex-1">
          <p className="font-semibold text-sm">{comment.author?.full_name ?? 'Unknown'}</p>
          <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{new Date(comment.created_at).toLocaleString()}</p>
        </div>
        <VerifiedBadge size={6} />
        {canDelete && (
          <button onClick={onDelete}><Trash2 size={14} style={{ color: 'var(--fg-muted)' }} /></button>
        )}
      </div>
      <p className="text-sm leading-relaxed pl-12">{comment.content}</p>
      <hr className="mt-4" style={{ borderColor: 'var(--border)' }} />
    </div>
  )
}

function PostPageInner() {
  const { token, user } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const postId = searchParams.get('id')
  const db = useMemo(() => token ? createDb(token) : null, [token])
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!db || !postId) return
    db.posts.get(postId).then((d: any) => { setPost(d); setLoading(false) })
    db.comments.list(postId).then((d: any) => setComments(d ?? []))
  }, [db, postId])

  async function deleteComment(commentId: string) {
    if (!postId || !db) return
    try {
      await db.comments.delete(postId, commentId)
      setComments(c => c.filter(x => x.id !== commentId))
    } catch (e: any) {
      toast(e?.message ?? 'Failed to delete comment', 'error')
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !postId || !db || submitting) return
    setSubmitting(true)
    try {
      const data: any = await db.comments.create(postId, text)
      if (data) { setComments(c => [...c, data]); setText('') }
    } catch (e: any) {
      toast(e?.message ?? 'Failed to post comment', 'error')
    } finally {
      setSubmitting(false)
    }
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
    <div className="flex flex-col min-h-screen pb-32">
      <div className="px-4 py-6 flex-1 space-y-4">
        <BackButton href="/feeds" />
        <div className="flex items-center gap-3">
          <Avatar src={post.author?.avatar_url} name={post.author?.full_name} size={52} />
          <div className="flex-1">
            <p className="font-semibold">{post.author?.full_name ?? 'Unknown'}</p>
            <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{new Date(post.created_at).toLocaleString()}</p>
          </div>
          <VerifiedBadge size={7} />
        </div>
        <hr style={{ borderColor: 'var(--border)' }} />

        {post.author_id === user?.id && (
          <button onClick={async () => {
            const updated: any = await db?.posts.resolve(post.id)
            if (updated) setPost(p => p ? { ...p, is_resolved: updated.is_resolved } : p)
          }} className="w-full rounded-full py-2.5 text-sm font-semibold border transition-all"
            style={{
              borderColor: post.is_resolved ? 'var(--success, #22c55e)' : 'var(--border)',
              color: post.is_resolved ? '#22c55e' : 'var(--fg-muted)',
              background: post.is_resolved ? 'rgba(34,197,94,0.08)' : 'transparent'
            }}>
            {post.is_resolved ? '✓ Marked as Resolved' : 'Mark as Resolved'}
          </button>
        )}
        {post.is_resolved && post.author_id !== user?.id && (
          <p className="text-center text-sm font-semibold" style={{ color: '#22c55e' }}>✓ Resolved</p>
        )}

        <PostCarousel post={post} />

        <p className="font-bold text-lg">comments</p>
        <div className="space-y-4">
          {comments.map(c => (
            <CommentItem key={c.id} comment={c}
              canDelete={c.author_id === user?.id || post.author_id === user?.id}
              onDelete={() => deleteComment(c.id)} />
          ))}
        </div>
      </div>

      <form onSubmit={submitComment}
        className="fixed bottom-16 left-0 right-0 mx-4 flex items-center gap-2 rounded-full px-4 py-2"
        style={{ background: 'var(--bg-card)', boxShadow: '0 2px 16px rgba(0,0,0,0.10)' }}>
        <input value={text} onChange={e => setText(e.target.value)}
          placeholder="Write a comment…" disabled={submitting}
          className="flex-1 bg-transparent text-sm outline-none py-2"
          style={{ color: 'var(--fg)' }} />
        <button type="submit" disabled={!text.trim() || submitting}
          className="h-9 w-9 rounded-full flex items-center justify-center disabled:opacity-60 flex-shrink-0"
          style={{ background: '#4F6EF7', color: '#fff', minWidth: 36 }}>
          <Send size={15} />
        </button>
      </form>
    </div>
  )
}

export default function PostPage() {
  return <Suspense><PostPageInner /></Suspense>
}
