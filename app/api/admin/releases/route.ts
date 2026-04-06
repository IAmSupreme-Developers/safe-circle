import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { withAdmin, } from '@/lib/admin'
import { ok, badRequest, serverError } from '@/lib/api'

export const GET = async () => {
  const { data, error } = await supabaseAdmin
    .from('releases').select('*').order('created_at', { ascending: false })
  if (error) return serverError(error.message)
  return ok(data)
}

export const POST = withAdmin(async (req: NextRequest) => {
  const body = await req.json()
  const { version, build_number, platform, channel, title, notes, download_url, is_latest } = body
  if (!version || !build_number || !title) return badRequest('version, build_number and title required')

  // If marking as latest, unset previous latest for same platform+channel
  if (is_latest) {
    await supabaseAdmin.from('releases')
      .update({ is_latest: false })
      .eq('platform', platform ?? 'android')
      .eq('channel', channel ?? 'beta')
  }

  const { data, error } = await supabaseAdmin.from('releases')
    .insert({ version, build_number, platform: platform ?? 'android', channel: channel ?? 'beta', title, notes, download_url, is_latest: is_latest ?? false })
    .select().single()
  if (error) return serverError(error.message)
  return ok(data, 201)
})
