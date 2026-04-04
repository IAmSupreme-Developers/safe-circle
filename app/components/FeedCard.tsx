'use client'
import { useRouter } from 'next/navigation'
import { Reply, Trash2 } from 'lucide-react'
import { Avatar, VerifiedBadge } from './shared'
import type { Post } from '@/lib/types'

type Props = {
  post: Post
  userId?: string
  onDelete?: () => void
  compact?: boolean  // true = dashboard preview (no actions)
}

export default function FeedCard({ post, userId, onDelete, compact = false }: Props) {
  const router = useRouter()

  return (
    <div className="rounded-2xl p-4 space-y-3"
      style={{ background: 'var(--bg-card)', boxShadow: 'var(--bg-card-shadow)' }}>

      {/* Author row */}
      <div className="flex items-center gap-3">
        <Avatar src={post.author?.avatar_url} name={post.author?.full_name} size={44} />
        <div className="flex-1">
          <p className="font-semibold text-sm">{post.author?.full_name ?? 'Unknown'}</p>
          <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
            {new Date(post.created_at).toLocaleString()}
          </p>
        </div>
        {!compact && (
          <div className="flex items-center gap-3">
            <VerifiedBadge size={7} />
            <button onClick={() => router.push(`/feeds/post?id=${post.id}`)}>
              <Reply size={16} style={{ color: 'var(--fg-muted)' }} />
            </button>
            {post.author_id === userId && onDelete && (
              <button onClick={onDelete}>
                <Trash2 size={16} style={{ color: 'var(--fg-muted)' }} />
              </button>
            )}
          </div>
        )}
        {compact && <VerifiedBadge size={6} />}
      </div>

      <hr style={{ borderColor: 'var(--border)' }} />

      {/* Content */}
      <button onClick={() => !compact && router.push(`/feeds/post?id=${post.id}`)}
        className="w-full text-left">
        <p className="text-sm leading-relaxed">{post.content}</p>
      </button>

      {post.is_resolved && (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>✓ Resolved</span>
      )}

      {/* Attachments */}
      {post.attachments?.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {post.attachments.map((url, i) => (
            <img key={i} src={url} alt="" className="h-32 w-32 rounded-xl object-cover flex-shrink-0" />
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--fg-muted)' }}>
        <span>📎 {post.attachments?.length ?? 0}</span>
        <span>💬 {post.comment_count ?? 0}</span>
        <span className="ml-auto">👁 {post.view_count}</span>
      </div>
    </div>
  )
}
