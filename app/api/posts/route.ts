import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { withAuth, ok, badRequest, serverError, preflight } from '@/lib/api'
import { classifyPost } from '@/lib/gemini'


export const GET = async (req: NextRequest) => {
  const limit = req.nextUrl.searchParams.get('limit')
  const mine = req.nextUrl.searchParams.get('mine')
  const category = req.nextUrl.searchParams.get('category')
  let q = supabaseAdmin
    .from('posts')
    .select('*, author:profiles(full_name, avatar_url), comments(count)')
    .order('created_at', { ascending: false })
  if (limit) q = q.limit(Number(limit))
  if (category) q = q.eq('category', category)
  if (mine) {
    const user = await (await import('@/lib/auth')).getAuthUser(req)
    if (user) q = q.eq('author_id', user.id)
  }
  const { data, error } = await q
  if (error) return serverError(error.message)
  return ok(data)
}

export const POST = withAuth(async (req: NextRequest, user) => {
  const { content, attachments, location_lat, location_lng } = await req.json()
  if (!content?.trim()) return badRequest('Content required')

  const ai = await classifyPost(content, location_lat, location_lng)

  const { data, error } = await supabaseAdmin
    .from('posts')
    .insert({
      author_id: user.id, content,
      attachments: attachments ?? [],
      location_lat: location_lat ?? null,
      location_lng: location_lng ?? null,
      category: ai.category,
      subject: ai.subject,
      city: ai.city,
      country: ai.country,
      tags: ai.tags,
    })
    .select('*, author:profiles(full_name, avatar_url)')
    .single()
  if (error) return serverError(error.message)
  return ok(data, 201)
})
