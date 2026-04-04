import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { withAuth, ok, badRequest, serverError } from '@/lib/api'
import { runAI } from '@/lib/gemini'

export const POST = withAuth(async (req: NextRequest, user) => {
  const { question } = await req.json()
  if (!question?.trim()) return badRequest('Question required')

  const [{ data: profile }, { data: myPosts }, { data: communityPosts }, { data: trackers }] = await Promise.all([
    supabaseAdmin.from('profiles').select('full_name').eq('id', user.id).single(),
    supabaseAdmin.from('posts')
      .select('content, category, subject, city, country, created_at, comments(content)')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false }),
    supabaseAdmin.from('posts')
      .select('content, category, subject, city, country, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
    supabaseAdmin.from('trackers').select('label, is_active, last_seen').eq('owner_id', user.id),
  ])

  const mine = myPosts ?? []
  const community = (communityPosts ?? []).filter(p => !mine.some(m => m.content === p.content))
  const totalPlatform = communityPosts?.length ?? 0

  const context = `You are a helpful assistant for the SafeCircle community safety app. Answer using ONLY the data below. Be direct and concise.

USER: ${profile?.full_name ?? 'Unknown'}
TOTAL USER POSTS: ${mine.length}
TOTAL PLATFORM POSTS: ${totalPlatform}

USER POSTS:
${mine.map(p => `- [${p.category ?? 'unknown'}] "${p.subject ?? p.content.slice(0, 60)}" date:${new Date(p.created_at).toLocaleDateString()} comments:${(p.comments as any[])?.length ?? 0}`).join('\n') || 'None'}

TRACKERS (${trackers?.length ?? 0}):
${trackers?.map(t => `- ${t.label ?? 'Unnamed'} active:${t.is_active} last_seen:${t.last_seen ? new Date(t.last_seen).toLocaleString() : 'never'}`).join('\n') || 'None'}

OTHER COMMUNITY POSTS (excluding user's own, ${community.length} others):
${community.map(p => `- [${p.category ?? 'unknown'}] "${p.subject ?? p.content.slice(0, 80)}" city:${p.city ?? 'unknown'} date:${new Date(p.created_at).toLocaleDateString()}`).join('\n') || 'None'}

RULES: Never reveal other users tracker locations, device IDs, or personal details.

APP GUIDE:
SafeCircle is a community safety app. Here is what each section does:
- /dashboard — overview of your activity, trackers, and recent posts
- /feeds — community feed; create posts to report missing persons, sightings, found people, alerts, or updates. Posts are auto-categorised by AI.
- /feeds/[id] — view a post in detail, read and write comments, mark as resolved (post author only)
- /alerts — your personal safety alerts triggered by tracker zone exits/entries
- /map — live map showing your tracker locations
- /tracking — manage your GPS trackers; register new ones with a device ID and code
- /search-party — coordinate a search party with other community members
- /settings — update your profile, phone number, notification preferences

ACTIONS AVAILABLE TO USER: create a post, view feeds, check tracker location, view alerts, join search party, update profile.

If the user seems lost, distressed, or asks how to do something, suggest the relevant section and return an action button.`

  const answer = await runAI(`${context}\n\nQuestion: ${question}\n\nRespond with a JSON object: { "answer": "your response", "action": { "label": "button text", "href": "/path" } | null }. Return ONLY raw JSON, no markdown.`)
  if (!answer) return serverError('AI unavailable')
  try {
    const parsed = JSON.parse(answer.replace(/```json|```/g, '').trim())
    return ok(parsed)
  } catch {
    return ok({ answer, action: null })
  }
})
