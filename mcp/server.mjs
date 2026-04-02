#!/usr/bin/env node
/**
 * SafeCircle MCP Server
 * Exposes app actions as tools for AI assistants (Claude, Kiro, etc.)
 * Run: node mcp/server.mjs
 * Requires: SAFECIRCLE_API_URL and SAFECIRCLE_TOKEN env vars
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const BASE = process.env.SAFECIRCLE_API_URL ?? 'http://localhost:3000'
const TOKEN = process.env.SAFECIRCLE_TOKEN ?? ''

async function call(path, method = 'GET', body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  return res.json()
}

const server = new McpServer({ name: 'safecircle', version: '1.0.0' })

server.tool('list_trackers', 'List all registered trackers for the authenticated user', {}, async () => {
  const data = await call('/api/trackers')
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
})

server.tool('register_tracker', 'Register a new tracking device', {
  label: z.string().describe('Human-readable label e.g. "Emma\'s Backpack"'),
  device_id: z.string().describe('Device ID printed on the tracker'),
  code: z.string().describe('One-time registration code on the tracker'),
}, async ({ label, device_id, code }) => {
  const data = await call('/api/trackers', 'POST', { label, device_id, code })
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
})

server.tool('toggle_tracker', 'Enable or disable a tracker', {
  id: z.string().describe('Tracker UUID'),
  is_active: z.boolean().describe('true to enable, false to disable'),
}, async ({ id, is_active }) => {
  const data = await call(`/api/trackers/${id}`, 'PATCH', { is_active })
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
})

server.tool('list_alerts', 'List alerts, optionally limited', {
  limit: z.number().optional().describe('Max number of alerts to return'),
}, async ({ limit }) => {
  const data = await call(`/api/alerts${limit ? `?limit=${limit}` : ''}`)
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
})

server.tool('mark_all_alerts_read', 'Mark all unread alerts as read', {}, async () => {
  const data = await call('/api/alerts', 'PATCH')
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
})

server.tool('get_profile', 'Get the current user profile', {}, async () => {
  const data = await call('/api/profile')
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
})

server.tool('update_profile', 'Update profile fields', {
  full_name: z.string().optional(),
  phone: z.string().optional(),
  proximity_buffer_meters: z.number().optional().describe('Global proximity buffer in meters'),
}, async (body) => {
  const data = await call('/api/profile', 'PATCH', body)
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
})

const transport = new StdioServerTransport()
await server.connect(transport)
