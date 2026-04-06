import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { withAdmin } from '@/lib/admin'
import { ok, serverError } from '@/lib/api'

export const PATCH = withAdmin(async (req: NextRequest, _user, { id }: any) => {
  const body = await req.json()
  if (body.is_latest) {
    const { data: rel } = await supabaseAdmin.from('releases').select('platform,channel').eq('id', id).single()
    if (rel) await supabaseAdmin.from('releases').update({ is_latest: false }).eq('platform', rel.platform).eq('channel', rel.channel)
  }
  const { data, error } = await supabaseAdmin.from('releases').update(body).eq('id', id).select().single()
  if (error) return serverError(error.message)
  return ok(data)
})

export const DELETE = withAdmin(async (_req, _user, { id }: any) => {
  const { error } = await supabaseAdmin.from('releases').delete().eq('id', id)
  if (error) return serverError(error.message)
  return ok({ success: true })
})
