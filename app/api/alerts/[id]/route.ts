import { supabaseAdmin } from '@/lib/supabase-admin'
import { withAuth, ok, serverError } from '@/lib/api'

export const PATCH = withAuth(async (_req, user, { id }) => {
  const { error } = await supabaseAdmin.from('alerts').update({ is_read: true }).eq('id', id).eq('owner_id', user.id)
  if (error) return serverError(error.message)
  return ok({ success: true })
})
