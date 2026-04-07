import { supabaseAdmin } from '@/lib/supabase-admin'
import { withAuth, ok, serverError } from '@/lib/api'


export const GET = withAuth(async (_req, user) => {
  // Get all tracker IDs owned by this user
  const { data, error } = await supabaseAdmin
    .from('trackers').select('id').eq('owner_id', user.id)
  if (error) return serverError(error.message)

  const owned = new Set((data ?? []).map((t: any) => t.id))
  const online = (global as any).onlineTrackers as Set<string>

  // Return only the user's trackers that are currently online
  const result = [...owned].filter(id => online?.has(id))
  return ok({ online: result })
})
