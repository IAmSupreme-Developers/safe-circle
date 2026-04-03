import { supabaseAdmin } from '@/lib/supabase-admin'
import { withAuth, ok, notFound, serverError } from '@/lib/api'

export const GET = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('posts')
    .select('*, author:profiles(full_name, avatar_url), comments(count)')
    .eq('id', id)
    .single()
  if (error || !data) return notFound('Post not found')
  // increment view count
  await supabaseAdmin.from('posts').update({ view_count: (data.view_count ?? 0) + 1 }).eq('id', id)
  return ok(data)
}

export const DELETE = withAuth(async (_req, user, { id }) => {
  const { error } = await supabaseAdmin.from('posts').delete().eq('id', id).eq('author_id', user.id)
  if (error) return serverError(error.message)
  return ok({ success: true })
})
