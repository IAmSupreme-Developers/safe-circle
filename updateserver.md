# Server Updates Required for Socket.IO Integration

## 1. Install Dependencies

```bash
npm install socket.io
```

## 2. Custom Next.js Server

Next.js serverless API routes do not support persistent WebSocket connections.
Replace `next start` with a custom Node server that mounts both Next.js and Socket.IO on the same port.

Create `server.js` at the project root:

```js
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const HMAC_SECRET = process.env.DEVICE_HMAC_SECRET

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res, parse(req.url, true))
  })

  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  })

  // ── Tracker auth middleware ───────────────────────────────────────────────
  // Separate namespaces for trackers and guardians
  const trackerNS = io.of('/tracker')
  const guardianNS = io.of('/guardian')

  trackerNS.use((socket, next) => {
    try {
      const { trackerId, timestamp, signature } = JSON.parse(socket.handshake.auth.token)
      if (!trackerId || !timestamp || !signature) return next(new Error('Missing auth fields'))

      // Reject tokens older than 60 seconds (replay protection)
      if (Date.now() - new Date(timestamp).getTime() > 60_000) return next(new Error('Token expired'))

      const payload = JSON.stringify({ trackerId, timestamp })
      const expected = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex')
      if (expected !== signature) return next(new Error('Invalid signature'))

      socket.data.trackerId = trackerId
      next()
    } catch {
      next(new Error('Auth failed'))
    }
  })

  // ── Guardian auth middleware ──────────────────────────────────────────────
  guardianNS.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      const { data: { user }, error } = await supabase.auth.getUser(token)
      if (error || !user) return next(new Error('Unauthorized'))
      socket.data.userId = user.id
      next()
    } catch {
      next(new Error('Auth failed'))
    }
  })

  // ── Tracker connection handler ────────────────────────────────────────────
  trackerNS.on('connection', (socket) => {
    const { trackerId } = socket.data

    // Join tracker room
    socket.join(`tracker:${trackerId}`)

    // Notify guardian app
    guardianNS.to(`guardian:${trackerId}`).emit('tracker:online', { trackerId })

    // ── Location ────────────────────────────────────────────────────────────
    socket.on('device:location', (data) => {
      const { lat, lng, accuracy, altitude, altitudeAccuracy, speed, heading, simulated, timestamp, signature } = data

      // Verify HMAC (covers core fields only)
      const payload = JSON.stringify({ trackerId, lat, lng, accuracy, timestamp })
      const expected = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex')
      if (expected !== signature) return

      // Reject stale timestamps (30s window)
      if (Date.now() - new Date(timestamp).getTime() > 30_000) return

      // Hold in memory
      socket.data.lastLocation = { lat, lng, accuracy, altitude, altitudeAccuracy, speed, heading, simulated, timestamp }

      // Relay to guardian
      guardianNS.to(`guardian:${trackerId}`).emit('tracker:location', { trackerId, ...socket.data.lastLocation })

      socket.emit('ack')
    })

    // ── Battery (relay only, no DB write) ───────────────────────────────────
    socket.on('device:battery', (data) => {
      guardianNS.to(`guardian:${trackerId}`).emit('tracker:battery', { trackerId, ...data })
    })

    // ── Network (relay only, no DB write) ───────────────────────────────────
    socket.on('device:network', (data) => {
      guardianNS.to(`guardian:${trackerId}`).emit('tracker:network', { trackerId, ...data })
    })

    // ── Disconnect — persist last known location to DB ───────────────────────
    socket.on('disconnect', async () => {
      const last = socket.data.lastLocation
      if (last) {
        await supabase.from('trackers').update({
          last_lat: last.lat,
          last_lng: last.lng,
          last_altitude: last.altitude,
          last_altitude_accuracy: last.altitudeAccuracy,
          last_speed: last.speed,
          last_heading: last.heading,
          last_simulated: last.simulated,
          accuracy: last.accuracy,
          last_seen: last.timestamp,
        }).eq('id', trackerId)
      }
      guardianNS.to(`guardian:${trackerId}`).emit('tracker:offline', { trackerId })
    })
  })

  // ── Guardian connection handler ───────────────────────────────────────────
  guardianNS.on('connection', (socket) => {
    const { userId } = socket.data

    // Subscribe to a tracker's room (server verifies ownership)
    socket.on('guardian:subscribe', async ({ trackerId }) => {
      const { data } = await supabase.from('trackers').select('id').eq('id', trackerId).eq('owner_id', userId).single()
      if (!data) return // not their tracker
      socket.join(`guardian:${trackerId}`)
    })

    socket.on('guardian:unsubscribe', ({ trackerId }) => {
      socket.leave(`guardian:${trackerId}`)
    })

    // Forward command to tracker
    socket.on('guardian:command', async ({ trackerId, cmd, payload }) => {
      const { data } = await supabase.from('trackers').select('id').eq('id', trackerId).eq('owner_id', userId).single()
      if (!data) return // not their tracker
      trackerNS.to(`tracker:${trackerId}`).emit('command', { cmd, payload })
    })
  })

  httpServer.listen(3000, () => console.log('SafeCircle server running on :3000'))
})
```

Update `package.json` start script:
```json
"start": "node server.js"
```

---

## 3. Data Persistence Strategy

**While connected** — all data held in server memory, broadcast live via socket. No DB writes.

**On disconnect** — server writes last known full location to `trackers` table once:
`last_lat`, `last_lng`, `last_altitude`, `last_altitude_accuracy`, `last_speed`, `last_heading`, `last_simulated`, `accuracy`, `last_seen`.

Battery and network are never saved to DB — ephemeral relay only.

**Guardian app offline** — reads last known location from Supabase directly (no socket needed).

---

## 4. Guardian App — Subscribe to Tracker Events

```ts
import { io } from 'socket.io-client'

const socket = io(`${SERVER_URL}/guardian`, { auth: { token: supabaseAccessToken } })

socket.emit('guardian:subscribe', { trackerId })

socket.on('tracker:online',   ({ trackerId }) => { /* green dot */ })
socket.on('tracker:offline',  ({ trackerId }) => { /* grey dot, load from DB */ })
socket.on('tracker:location', ({ lat, lng, accuracy, altitude, speed, heading, timestamp }) => { /* update map */ })
socket.on('tracker:battery',  ({ level, charging }) => { /* show battery */ })
socket.on('tracker:network',  ({ connected, type }) => { /* show signal */ })
```

---

## 5. Commands (Guardian → Server → Tracker)

```js
socket.emit('guardian:command', { trackerId, cmd: 'alarm' })
socket.emit('guardian:command', { trackerId, cmd: 'ping' })
socket.emit('guardian:command', { trackerId, cmd: 'update_interval', payload: { ms: 10000 } })
```

---

## 6. Environment Variables

```env
DEVICE_HMAC_SECRET=your-long-random-secret
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```
