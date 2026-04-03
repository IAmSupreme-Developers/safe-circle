import { supabaseAdmin } from '@/lib/supabase-admin'
import { withAuth, ok, serverError } from '@/lib/api'

export const DELETE = withAuth(async (_req, user, { commentId }) => {
  const { error } = await supabaseAdmin
    .from('comments').delete().eq('id', commentId).eq('author_id', user.id)
  if (error) return serverError(error.message)
  return ok({ success: true })
})
