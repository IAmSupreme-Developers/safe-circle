import { supabaseAdmin } from '@/lib/supabase-admin'
import { withAuth, ok, forbidden, serverError } from '@/lib/api'

export const DELETE = withAuth(async (_req, user, { id: postId, commentId }) => {
  // Allow comment author OR post author to delete
  const { data: comment, error: fetchErr } = await supabaseAdmin
    .from('comments').select('author_id, post:posts(author_id)').eq('id', commentId).single()
  if (fetchErr || !comment) return serverError('Comment not found')

  const postAuthorId = (comment.post as any)?.author_id
  if (comment.author_id !== user.id && postAuthorId !== user.id) return forbidden()

  const { error } = await supabaseAdmin.from('comments').delete().eq('id', commentId)
  if (error) return serverError(error.message)
  return ok({ success: true })
})
