import { GoogleGenerativeAI } from '@google/generative-ai'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

function getKeys(env: string | undefined) {
  return (env ?? '').split(',').map(k => k.trim()).filter(Boolean)
}

const geminiCooldowns = new Map<string, number>()
const COOLDOWN = 60_000

function isRateLimit(e: any) {
  const s = (e?.message ?? '').toLowerCase()
  return s.includes('429') || s.includes('quota') || s.includes('rate limit') || s.includes('too many')
}

async function tryGemini(keys: string[], prompt: string): Promise<string | null> {
  const now = Date.now()
  for (const [k, t] of geminiCooldowns) if (now - t > COOLDOWN) geminiCooldowns.delete(k)
  for (const key of keys) {
    if (geminiCooldowns.has(key)) continue
    try {
      const model = new GoogleGenerativeAI(key).getGenerativeModel({ model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash' })
      const result = await model.generateContent(prompt)
      return result.response.text()
    } catch (e: any) {
      if (isRateLimit(e)) geminiCooldowns.set(key, Date.now())
      console.error('Gemini key failed:', e.message?.slice(0, 80))
    }
  }
  return null
}

async function tryClaude(keys: string[], prompt: string): Promise<string | null> {
  for (const key of keys) {
    try {
      const msg = await new Anthropic({ apiKey: key }).messages.create({
        model: 'claude-3-haiku-20240307', max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      })
      return (msg.content[0] as any).text
    } catch (e: any) { console.error('Claude key failed:', e.message?.slice(0, 80)) }
  }
  return null
}

async function tryGroq(keys: string[], prompt: string): Promise<string | null> {
  for (const key of keys) {
    try {
      const res = await new OpenAI({ apiKey: key, baseURL: 'https://api.groq.com/openai/v1' })
        .chat.completions.create({ model: 'llama-3.3-70b-versatile', max_tokens: 300, messages: [{ role: 'user', content: prompt }] })
      return res.choices[0].message.content
    } catch (e: any) { console.error('Groq key failed:', e.message?.slice(0, 80)) }
  }
  return null
}

async function tryDeepSeek(keys: string[], prompt: string): Promise<string | null> {
  for (const key of keys) {
    try {
      const res = await new OpenAI({ apiKey: key, baseURL: 'https://api.deepseek.com' })
        .chat.completions.create({ model: 'deepseek-chat', max_tokens: 300, messages: [{ role: 'user', content: prompt }] })
      return res.choices[0].message.content
    } catch (e: any) { console.error('DeepSeek key failed:', e.message?.slice(0, 80)) }
  }
  return null
}

export async function runAI(prompt: string): Promise<string | null> {
  return (
    (getKeys(process.env.GEMINI_API_KEYS).length && await tryGemini(getKeys(process.env.GEMINI_API_KEYS), prompt)) ||
    (getKeys(process.env.ANTHROPIC_API_KEYS).length && await tryClaude(getKeys(process.env.ANTHROPIC_API_KEYS), prompt)) ||
    (getKeys(process.env.GROQ_API_KEYS).length && await tryGroq(getKeys(process.env.GROQ_API_KEYS), prompt)) ||
    (getKeys(process.env.DEEPSEEK_API_KEYS).length && await tryDeepSeek(getKeys(process.env.DEEPSEEK_API_KEYS), prompt)) ||
    null
  )
}

export async function classifyPost(content: string, location_lat?: number | null, location_lng?: number | null) {
  const locationHint = location_lat && location_lng
    ? `The post was made from coordinates (${location_lat}, ${location_lng}).` : ''

  const prompt = `You are a classifier for a community safety app. Analyze this post and return ONLY a raw JSON object with no markdown or code blocks.

Post: "${content}"
${locationHint}

Return JSON:
- category: one of "missing" | "found" | "sighting" | "alert" | "update"
- subject: short summary under 10 words
- city: city name inferred from content or coordinates, or null
- country: country name inferred from content or coordinates, or null
- tags: array of up to but not limited to 5 relevant lowercase tags`

  try {
    const text = await runAI(prompt)
    if (!text) throw new Error('No response')
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch (e: any) {
    console.error('AI classification failed:', e.message)
    return { category: 'alert', subject: content.slice(0, 60), city: null, country: null, tags: [] }
  }
}
