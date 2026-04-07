import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from './auth'
import type { User } from '@supabase/supabase-js'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export const ok = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: CORS })
export const err = (message: string, status: number) => NextResponse.json({ error: message }, { status, headers: CORS })
export const preflight = () => new NextResponse(null, { status: 204, headers: CORS })

export const unauthorized = () => err('Unauthorized', 401)
export const forbidden = () => err('Forbidden', 403)
export const notFound = (msg = 'Not found.') => err(msg, 404)
export const conflict = (msg: string) => err(msg, 409)
export const badRequest = (msg = 'Missing fields') => err(msg, 400)
export const serverError = (msg: string) => err(msg, 500)

/** Wraps a route handler with auth — passes the authenticated user in */
export function withAuth(
  handler: (req: NextRequest, user: User, params?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: { params: Promise<any> }) => {
    try {
      const user = await getAuthUser(req)
      if (!user) return unauthorized()
      const params = context?.params ? await context.params : undefined
      return await handler(req, user, params)
    } catch (e: any) {
      console.error('[API Error]', e)
      return serverError(e?.message ?? 'Unexpected server error')
    }
  }
}
