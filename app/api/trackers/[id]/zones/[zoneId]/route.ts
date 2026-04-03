import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { withAuth, ok, serverError } from '@/lib/api'

export const PATCH = withAuth(async (req: NextRequest, user, { zoneId }) => {
  const body = await req.json()
  const { error } = await supabaseAdmin
    .from('safe_zones').update(body).eq('id', zoneId).eq('owner_id', user.id)
  if (error) return serverError(error.message)
  return ok({ success: true })
})

export const DELETE = withAuth(async (_req, user, { zoneId }) => {
  const { error } = await supabaseAdmin
    .from('safe_zones').delete().eq('id', zoneId).eq('owner_id', user.id)
  if (error) return serverError(error.message)
  return ok({ success: true })
})
