import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { withAuth, ok, serverError } from '@/lib/api'

export const PATCH = withAuth(async (req: NextRequest, user, { id }) => {
  const body = await req.json()
  const { error } = await supabaseAdmin.from('trackers').update(body).eq('id', id).eq('owner_id', user.id)
  if (error) return serverError(error.message)
  return ok({ success: true })
})

export const DELETE = withAuth(async (_req, user, { id }) => {
  const { error } = await supabaseAdmin.from('trackers').delete().eq('id', id).eq('owner_id', user.id)
  if (error) return serverError(error.message)
  return ok({ success: true })
})
