import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyPayload } from '@/lib/hmac'
import { ok, err, badRequest, serverError } from '@/lib/api'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { trackerId, lat, lng, accuracy, timestamp, signature } = body

  if (!trackerId || !lat || !lng || !timestamp || !signature)
    return badRequest('Missing fields')

  // Verify HMAC signature — prevents location spoofing
  const payload = JSON.stringify({ trackerId, lat, lng, accuracy, timestamp })
  const valid = await verifyPayload(payload, signature, process.env.DEVICE_HMAC_SECRET ?? '')
  if (!valid) return err('Invalid signature', 403)

  // Reject stale requests (older than 30 seconds) — prevents replay attacks
  if (Date.now() - new Date(timestamp).getTime() > 30_000)
    return err('Request expired', 410)

  const { error } = await supabaseAdmin
    .from('trackers')
    .update({ last_lat: lat, last_lng: lng, last_seen: timestamp, accuracy })
    .eq('id', trackerId)

  if (error) return serverError(error.message)
  return ok({ success: true })
}
