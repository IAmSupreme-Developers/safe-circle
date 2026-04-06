import { NextRequest } from 'next/server'
import { supabaseAdmin } from './supabase-admin'
import { getAuthUser } from './auth'
import { unauthorized, forbidden, serverError } from './api'
import type { User } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export function withAdmin(
  handler: (req: NextRequest, user: User) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const user = await getAuthUser(req)
    if (!user) return unauthorized()
    const { data, error } = await supabaseAdmin
      .from('profiles').select('role').eq('id', user.id).single()
    if (error) return serverError(error.message)
    if (data?.role !== 'admin') return forbidden()
    return handler(req, user)
  }
}
