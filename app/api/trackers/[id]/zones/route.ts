import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { withAuth, ok, badRequest, serverError } from '@/lib/api'

export const GET = withAuth(async (_req, user, { id: trackerId }) => {
  const { data, error } = await supabaseAdmin
    .from('safe_zones').select('*').eq('tracker_id', trackerId).eq('owner_id', user.id)
  if (error) return serverError(error.message)
  return ok(data)
})

export const POST = withAuth(async (req: NextRequest, user, { id: trackerId }) => {
  const body = await req.json()
  if (!body.label || !body.lat || !body.lng) return badRequest('label, lat, lng required')
  const { data, error } = await supabaseAdmin
    .from('safe_zones')
    .insert({ ...body, tracker_id: trackerId, owner_id: user.id })
    .select().single()
  if (error) return serverError(error.message)
  return ok(data, 201)
})
