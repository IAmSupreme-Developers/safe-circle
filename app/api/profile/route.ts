import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { withAuth, ok, serverError } from '@/lib/api'


export const GET = withAuth(async (_req, user) => {
  const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).single()
  if (error) return serverError(error.message)
  return ok(data)
})

export const PATCH = withAuth(async (req: NextRequest, user) => {
  const body = await req.json()
  const { error } = await supabaseAdmin.from('profiles').update(body).eq('id', user.id)
  if (error) return serverError(error.message)
  return ok({ success: true })
})
