import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { withAuth, ok, err, notFound, conflict, badRequest, serverError } from '@/lib/api'
import type { User } from '@supabase/supabase-js'

export const GET = withAuth(async (_req, user) => {
  const { data, error } = await supabaseAdmin.from('trackers').select('*').eq('owner_id', user.id)
  if (error) return serverError(error.message)
  return ok(data)
})

export const POST = withAuth(async (req: NextRequest, user: User) => {
  const { label, device_id, code } = await req.json()
  if (!label || !device_id || !code) return badRequest()

  const { data: tracker } = await supabaseAdmin
    .from('trackers').select('id, code, owner_id').eq('device_id', device_id).single()

  if (!tracker) return notFound('Device not found.')
  if (tracker.code !== code) return err('Invalid pairing code.', 401)
  if (tracker.owner_id && tracker.owner_id !== user.id) return conflict('Device already registered to another account.')

  const { data, error } = await supabaseAdmin
    .from('trackers')
    .update({ owner_id: user.id, label, registered_at: new Date().toISOString() })
    .eq('device_id', device_id).select().single()

  if (error) return serverError(error.message)
  return ok(data, 201)
})
