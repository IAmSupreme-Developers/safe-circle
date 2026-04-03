import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { ok, notFound } from '@/lib/api'

// Public endpoint — no auth required, used by the tracker device app
// Returns only id + label, never exposes code or owner details
export async function GET(req: NextRequest) {
  const device_id = req.nextUrl.searchParams.get('device_id')
  if (!device_id) return notFound('device_id required')

  const { data } = await supabaseAdmin
    .from('trackers')
    .select('id, label, owner_id')
    .eq('device_id', device_id)
    .maybeSingle()

  if (!data?.owner_id) return ok({ registered: false })
  return ok({ registered: true, trackerId: data.id, label: data.label })
}
