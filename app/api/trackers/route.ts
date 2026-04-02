import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabaseAdmin.from('trackers').select('*').eq('owner_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { label, device_id, code } = await req.json()
  if (!label || !device_id || !code) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // Check device not already registered
  const { data: existing } = await supabaseAdmin.from('trackers').select('id').eq('device_id', device_id).single()
  if (existing) return NextResponse.json({ error: 'Device already registered' }, { status: 409 })

  // TODO: validate code against device registry (post-hackathon)

  const { data, error } = await supabaseAdmin.from('trackers').insert({ owner_id: user.id, label, device_id }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
