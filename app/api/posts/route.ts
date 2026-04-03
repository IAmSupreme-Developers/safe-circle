import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { withAuth, ok, badRequest, serverError } from '@/lib/api'

export const GET = async (req: NextRequest) => {
  const limit = req.nextUrl.searchParams.get('limit')
  let q = supabaseAdmin
    .from('posts')
    .select('*, author:profiles(full_name, avatar_url), comments(count)')
    .order('created_at', { ascending: false })
  if (limit) q = q.limit(Number(limit))
  const { data, error } = await q
  if (error) return serverError(error.message)
  return ok(data)
}

export const POST = withAuth(async (req: NextRequest, user) => {
  const { content, attachments } = await req.json()
  if (!content?.trim()) return badRequest('Content required')
  const { data, error } = await supabaseAdmin
    .from('posts')
    .insert({ author_id: user.id, content, attachments: attachments ?? [] })
    .select('*, author:profiles(full_name, avatar_url)')
    .single()
  if (error) return serverError(error.message)
  return ok(data, 201)
})
