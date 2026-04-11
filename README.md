# SafeCircle — Server

The SafeCircle server is a **Next.js + Socket.IO** hybrid application. It serves the public landing page, handles all REST API routes for the guardian mobile app, and maintains persistent WebSocket connections for real-time tracker communication.

> 🛡️ Guardian app → `main-app` branch  
> 📡 Tracker device app → `track-device-2` branch  
> 📋 Socket events reference → `events.md`  
> 🔧 PM2 deployment guide → `pm2.md`

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     server.ts                           │
│  ┌─────────────────┐    ┌──────────────────────────┐   │
│  │   Next.js App   │    │       Socket.IO           │   │
│  │  (HTTP routes,  │    │  /tracker  /guardian      │   │
│  │  landing page,  │    │  namespaces               │   │
│  │  API routes)    │    │                           │   │
│  └────────┬────────┘    └──────────┬───────────────┘   │
│           │                        │                    │
│           └──────────┬─────────────┘                    │
│                      │                                  │
│              HTTP Server (port 3000)                    │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
   ┌──────▼──────┐          ┌───────▼──────┐
   │  Supabase   │          │  In-Memory   │
   │  (Postgres) │          │  State       │
   │  Auth + DB  │          │  (globals)   │
   └─────────────┘          └──────────────┘
```

---

## Quick Start

### 1. Clone & Install

```bash
git checkout server
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Server
NEXT_PUBLIC_SERVER_URL=https://your-domain.com
PORT=3000

# Security
DEVICE_HMAC_SECRET=a-long-random-secret-min-32-chars

# AI providers (at least one required for AI features)
GEMINI_API_KEYS=key1,key2,key3
GEMINI_MODEL=gemini-1.5-flash
ANTHROPIC_API_KEYS=key1,key2
GROQ_API_KEYS=key1,key2
DEEPSEEK_API_KEYS=key1,key2

# Media uploads
NEXT_MEDIA_UPLOAD_ENDPOINT=http://localhost:8000/upload
NEXT_PUBLIC_USE_PHP_UPLOAD=false
```

### 3. Set Up Database

Run the schema in your Supabase SQL editor:

```bash
# Copy contents of supabase/schema.sql and run in Supabase dashboard
```

### 4. Run

```bash
# Development (hot reload)
npm run dev

# Production
npm run build && npm start
```

---

## Project Structure

```
server.ts                         → Entry point — HTTP + Socket.IO server
lib/
  global.ts                       → Global in-memory state declarations
  socket/
    server.ts                     → Socket.IO instance factory (getSocketIO)
    tracker.ts                    → /tracker namespace — device auth + handlers
    guardian.ts                   → /guardian namespace — app auth + handlers
  api.ts                          → Response helpers (ok, err, withAuth, etc.)
  auth.ts                         → Supabase JWT verification
  admin.ts                        → Admin role middleware (withAdmin)
  gemini.ts                       → Multi-provider AI (Gemini, Claude, Groq, DeepSeek)
  hmac.ts                         → HMAC-SHA256 sign + verify
  supabase.ts                     → Supabase anon client
  supabase-admin.ts               → Supabase service role client
  types.ts                        → Shared TypeScript types
app/
  page.tsx                        → Landing page (root export)
  Landing.tsx                     → Landing page component
  sections/                       → Landing page sections (Hero, Story, Features, etc.)
  content/                        → Multi-language content (EN, FR, YO, HA, IG)
  ThemeLangProvider.tsx           → Theme (light/dark/system) + language context
  auth/callback/page.tsx          → OAuth callback handler
  admin/page.tsx                  → Admin panel (role-gated)
  releases/page.tsx               → Public releases page
  api/
    posts/                        → Community feed CRUD
    trackers/                     → Tracker management + online status
    alerts/                       → Alert read/unread management
    profile/                      → User profile get/update
    ai/chat/                      → AI assistant endpoint
    device/
      check/                      → Tracker registration check (used by device app)
      location/                   → HTTP location endpoint (legacy tracker v1)
    admin/releases/               → Admin release management
supabase/
  schema.sql                      → Full database schema (idempotent, re-runnable)
```

---

## REST API Reference

All authenticated endpoints require `Authorization: Bearer <supabase_access_token>`.  
All responses include CORS headers (`Access-Control-Allow-Origin: *`).

### Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/profile` | ✅ | Get current user's profile |
| PATCH | `/api/profile` | ✅ | Update profile fields |

### Trackers

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/trackers` | ✅ | List all trackers owned by user |
| POST | `/api/trackers` | ✅ | Register a new tracker (device_id + code) |
| PATCH | `/api/trackers/:id` | ✅ | Update tracker (label, is_active) |
| DELETE | `/api/trackers/:id` | ✅ | Remove tracker |
| GET | `/api/trackers/online` | ✅ | Returns which of user's trackers are currently connected via socket |
| GET | `/api/trackers/:id/zones` | ✅ | List safe zones for a tracker |
| POST | `/api/trackers/:id/zones` | ✅ | Create a safe zone |
| PATCH | `/api/trackers/:id/zones/:zoneId` | ✅ | Update a safe zone |
| DELETE | `/api/trackers/:id/zones/:zoneId` | ✅ | Delete a safe zone |

### Posts (Community Feed)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/posts` | ❌ | List posts. Query: `?limit=N&mine=1&category=missing` |
| POST | `/api/posts` | ✅ | Create post. AI auto-classifies category, subject, city, country, tags |
| GET | `/api/posts/:id` | ❌ | Get post + increment view count |
| PATCH | `/api/posts/:id` | ✅ | Toggle `is_resolved` (author only) |
| DELETE | `/api/posts/:id` | ✅ | Delete post (author only) |
| GET | `/api/posts/:id/comments` | ❌ | List comments on a post |
| POST | `/api/posts/:id/comments` | ✅ | Add a comment |
| DELETE | `/api/posts/:id/comments/:commentId` | ✅ | Delete comment (comment author or post author) |

### Alerts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/alerts` | ✅ | List alerts. Query: `?limit=N` |
| PATCH | `/api/alerts` | ✅ | Mark all alerts as read |
| PATCH | `/api/alerts/:id` | ✅ | Mark single alert as read |

### AI Assistant

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/chat` | ✅ | Ask a question. Body: `{ question: string }`. Returns `{ answer, action? }` |

The AI has access to the user's posts, trackers, and public community feed. It never reveals other users' private data.

### Device (Tracker Hardware)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/device/check` | ❌ | Check if device is registered. Query: `?device_id=SC-ABC123` |
| POST | `/api/device/location` | HMAC | Legacy HTTP location update (tracker v1 only) |

### Admin (role = 'admin' required)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/releases` | ✅ Admin | List all releases |
| POST | `/api/admin/releases` | ✅ Admin | Create a release |
| PATCH | `/api/admin/releases/:id` | ✅ Admin | Update release (toggle is_latest, etc.) |
| DELETE | `/api/admin/releases/:id` | ✅ Admin | Delete release |

To grant admin access:
```sql
update public.profiles set role = 'admin' where id = 'your-user-id';
```

---

## Socket.IO

The server runs two Socket.IO namespaces on the same HTTP port.

### `/tracker` — Tracker Device

**Auth:** HMAC-signed token  
```json
{ "token": "{\"trackerId\":\"...\",\"timestamp\":\"...\",\"signature\":\"...\"}" }
```
Signature = HMAC-SHA256 of `JSON.stringify({ trackerId, timestamp })` using `DEVICE_HMAC_SECRET`.  
Token expires after 60 seconds (replay protection).

**On connect:** server sends `command: ping` to request immediate location.

**Events received from tracker:**

| Event | Payload | Behaviour |
|-------|---------|-----------|
| `device:location` | `{ lat, lng, accuracy, altitude, altitudeAccuracy, speed, heading, simulated, timestamp, signature }` | Verified, stored in memory, relayed to guardian. Saved to DB every 5 pings and on disconnect. |
| `device:battery` | `{ level, charging }` | Relayed to guardian. Not saved to DB. |
| `device:network` | `{ connected, type }` | Relayed to guardian. Not saved to DB. |

**Events sent to tracker:**

| Event | Payload | Description |
|-------|---------|-------------|
| `ack` | — | Location received and relayed |
| `command` | `{ cmd, payload? }` | `alarm` / `ping` / `update_interval` |

---

### `/guardian` — Guardian App

**Auth:** Supabase access token  
```json
{ "token": "<supabase_access_token>" }
```

**Events sent by guardian:**

| Event | Payload | Description |
|-------|---------|-------------|
| `guardian:subscribe` | `{ trackerId }` | Join tracker room. Server verifies ownership, sends current online status + last known location immediately. |
| `guardian:unsubscribe` | `{ trackerId }` | Leave tracker room |
| `guardian:command` | `{ trackerId, cmd, payload? }` | Forward command to tracker. Ownership verified. |

**Events received by guardian:**

| Event | Payload | Description |
|-------|---------|-------------|
| `tracker:online` | `{ trackerId }` | Tracker connected |
| `tracker:offline` | `{ trackerId }` | Tracker disconnected — last data saved to DB |
| `tracker:location` | `{ trackerId, lat, lng, accuracy, altitude, speed, heading, ... }` | Live location |
| `tracker:battery` | `{ trackerId, level, charging }` | Battery status |
| `tracker:network` | `{ trackerId, connected, type }` | Network status |

---

## In-Memory State

Two global Maps maintained in `lib/global.ts`:

| Variable | Type | Contents |
|----------|------|----------|
| `global.onlineTrackers` | `Set<string>` | Tracker IDs currently connected via socket |
| `global.trackerLocations` | `Map<string, Location>` | Last known location per tracker (survives reconnects) |

> ⚠️ These are process-local. If you run multiple server instances, use Redis instead.

---

## AI Classification

When a post is created via `POST /api/posts`, the server calls the AI to auto-fill:

| Field | Example |
|-------|---------|
| `category` | `missing` / `found` / `sighting` / `alert` / `update` |
| `subject` | `"Missing girl, 14, last seen Ikeja"` |
| `city` | `"Lagos"` |
| `country` | `"Nigeria"` |
| `tags` | `["female", "teenager", "school"]` |

**Provider priority:** Gemini → Claude → Groq → DeepSeek  
Keys are rotated automatically on rate limit. If all fail, post is saved with `category: 'alert'` and no subject.

---

## Data Persistence Strategy

| Data | While tracker connected | On disconnect |
|------|------------------------|---------------|
| Location | Memory only + every 5th ping to DB | Final state saved to DB |
| Battery | Relayed only | Not saved |
| Network | Relayed only | Not saved |

Fields saved to `trackers` table:  
`last_lat`, `last_lng`, `last_altitude`, `last_altitude_accuracy`, `last_speed`, `last_heading`, `last_simulated`, `accuracy`, `last_seen`

---

## Security

| Concern | Mitigation |
|---------|-----------|
| Tracker location spoofing | HMAC-SHA256 signature on every location event |
| Replay attacks | 30-second timestamp window on location events, 60-second window on socket auth |
| Unauthorised socket access | JWT verified against Supabase on every guardian connection |
| Unauthorised tracker commands | Ownership verified in DB before forwarding command |
| Admin API access | `profiles.role = 'admin'` checked server-side via `withAdmin` middleware |
| CORS | `Access-Control-Allow-Origin: *` set on all HTTP responses |

---

## Deployment (VPS with PM2)

See `pm2.md` for full PM2 setup. Quick start:

```bash
npm install -g pm2
npm run build
pm2 start ecosystem.config.js
pm2 save && pm2 startup
```

`ecosystem.config.js` sets `NODE_ENV=production` and `instances: 1` (required — in-memory state is not shared across processes).

---

## Database Schema

Full schema in `supabase/schema.sql`. Re-runnable (all drops at top).

**Tables:** `profiles`, `trackers`, `safe_zones`, `alerts`, `posts`, `comments`, `releases`

**Key policies:**
- Users can only read/write their own data
- Posts and comments are publicly readable
- Releases are publicly readable
- Storage bucket `media` is public read, authenticated write

---

## Landing Page

The root `/` serves a multi-language marketing landing page with:
- Scroll-driven story (Emma's story — 5 chapters)
- Features, how-it-works, testimonials, CTA sections
- Language support: EN, FR, YO, HA, IG
- Theme support: light, dark, system
- Direct APK download link + App Store / Google Play buttons
- `/releases` — public release history page
- `/admin` — role-gated admin panel for managing releases
- `/auth/callback` — OAuth redirect handler
