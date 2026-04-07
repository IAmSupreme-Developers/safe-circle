import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { withAuth, ok, badRequest, serverError } from '@/lib/api'


export const GET = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('comments')
    .select('*, author:profiles(full_name, avatar_url)')
    .eq('post_id', id)
    .order('created_at', { ascending: true })
  if (error) return serverError(error.message)
  return ok(data)
}

export const POST = withAuth(async (req: NextRequest, user, { id }) => {
  const { content } = await req.json()
  if (!content?.trim()) return badRequest('Content required')
  const { data, error } = await supabaseAdmin
    .from('comments')
    .insert({ post_id: id, author_id: user.id, content })
    .select('*, author:profiles(full_name, avatar_url)')
    .single()
  if (error) return serverError(error.message)
  return ok(data, 201)
})
