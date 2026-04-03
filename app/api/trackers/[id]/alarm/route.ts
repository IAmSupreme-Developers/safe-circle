import { supabaseAdmin } from '@/lib/supabase-admin'
import { withAuth, ok, notFound, serverError } from '@/lib/api'

// Guardian triggers alarm on a specific tracker device
export const POST = withAuth(async (_req, user, { id: trackerId }) => {
  // Verify ownership
  const { data: tracker } = await supabaseAdmin
    .from('trackers').select('id, owner_id').eq('id', trackerId).single()
  if (!tracker || tracker.owner_id !== user.id) return notFound('Tracker not found')

  // Set alarm flag — device polls this and triggers sound
  const { error } = await supabaseAdmin
    .from('trackers').update({ alarm_active: true }).eq('id', trackerId)
  if (error) return serverError(error.message)
  return ok({ success: true })
})

export const DELETE = withAuth(async (_req, user, { id: trackerId }) => {
  const { error } = await supabaseAdmin
    .from('trackers').update({ alarm_active: false }).eq('id', trackerId).eq('owner_id', user.id)
  if (error) return serverError(error.message)
  return ok({ success: true })
})
