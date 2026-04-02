import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { withAuth, ok, serverError } from '@/lib/api'

export const GET = withAuth(async (req: NextRequest, user) => {
  const limit = req.nextUrl.searchParams.get('limit')
  let q = supabaseAdmin.from('alerts').select('*').eq('owner_id', user.id).order('created_at', { ascending: false })
  if (limit) q = q.limit(Number(limit))
  const { data, error } = await q
  if (error) return serverError(error.message)
  return ok(data)
})

export const PATCH = withAuth(async (_req, user) => {
  const { error } = await supabaseAdmin.from('alerts').update({ is_read: true }).eq('owner_id', user.id).eq('is_read', false)
  if (error) return serverError(error.message)
  return ok({ success: true })
})
