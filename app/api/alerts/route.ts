import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const limit = req.nextUrl.searchParams.get('limit')
  let q = supabaseAdmin.from('alerts').select('*').eq('owner_id', user.id).order('created_at', { ascending: false })
  if (limit) q = q.limit(Number(limit))
  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // mark all read
  const { error } = await supabaseAdmin.from('alerts').update({ is_read: true }).eq('owner_id', user.id).eq('is_read', false)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
