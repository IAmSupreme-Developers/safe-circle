const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const HMAC_SECRET = process.env.DEVICE_HMAC_SECRET

// Shared in-memory Set — accessible by API routes via global
global.onlineTrackers = global.onlineTrackers || new Set()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res, parse(req.url, true))
  })

  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  })

  const trackerNS = io.of('/tracker')
  const guardianNS = io.of('/guardian')

  // ── Tracker auth ─────────────────────────────────────────────────────────
  trackerNS.use((socket, next) => {
    try {
      const { trackerId, timestamp, signature } = JSON.parse(socket.handshake.auth.token)
      if (!trackerId || !timestamp || !signature) return next(new Error('Missing auth fields'))
      if (Date.now() - new Date(timestamp).getTime() > 60_000) return next(new Error('Token expired'))
      const payload = JSON.stringify({ trackerId, timestamp })
      const expected = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex')
      if (expected !== signature) return next(new Error('Invalid signature'))
      socket.data.trackerId = trackerId
      next()
    } catch { next(new Error('Auth failed')) }
  })

  // ── Guardian auth ─────────────────────────────────────────────────────────
  guardianNS.use(async (socket, next) => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(socket.handshake.auth.token)
      if (error || !user) return next(new Error('Unauthorized'))
      socket.data.userId = user.id
      next()
    } catch { next(new Error('Auth failed')) }
  })

  // ── Tracker connection ────────────────────────────────────────────────────
  trackerNS.on('connection', (socket) => {
    const { trackerId } = socket.data
    socket.join(`tracker:${trackerId}`)
    global.onlineTrackers.add(trackerId)
    guardianNS.to(`guardian:${trackerId}`).emit('tracker:online', { trackerId })
    console.log(`[tracker] connected: ${trackerId}`)

    socket.on('device:location', (data) => {
      const { lat, lng, accuracy, altitude, altitudeAccuracy, speed, heading, simulated, timestamp, signature } = data
      // Verify HMAC
      const payload = JSON.stringify({ trackerId, lat, lng, accuracy, timestamp })
      const expected = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex')
      if (expected !== signature) return
      // Reject stale (30s window)
      if (Date.now() - new Date(timestamp).getTime() > 30_000) return
      // Hold in memory
      socket.data.lastLocation = { lat, lng, accuracy, altitude, altitudeAccuracy, speed, heading, simulated, timestamp }
      // Relay to guardian
      guardianNS.to(`guardian:${trackerId}`).emit('tracker:location', { trackerId, ...socket.data.lastLocation })
      socket.emit('ack')
    })

    socket.on('device:battery', (data) => {
      guardianNS.to(`guardian:${trackerId}`).emit('tracker:battery', { trackerId, ...data })
    })

    socket.on('device:network', (data) => {
      guardianNS.to(`guardian:${trackerId}`).emit('tracker:network', { trackerId, ...data })
    })

    socket.on('disconnect', async () => {
      console.log(`[tracker] disconnected: ${trackerId}`)
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
      global.onlineTrackers.delete(trackerId)
    })
  })

  // ── Guardian connection ───────────────────────────────────────────────────
  guardianNS.on('connection', (socket) => {
    const { userId } = socket.data
    console.log(`[guardian] connected: ${userId}`)

    socket.on('guardian:subscribe', async ({ trackerId }) => {
      const { data } = await supabase.from('trackers').select('id').eq('id', trackerId).eq('owner_id', userId).single()
      if (!data) return
      socket.join(`guardian:${trackerId}`)
    })

    socket.on('guardian:unsubscribe', ({ trackerId }) => {
      socket.leave(`guardian:${trackerId}`)
    })

    socket.on('guardian:command', async ({ trackerId, cmd, payload }) => {
      const { data } = await supabase.from('trackers').select('id').eq('id', trackerId).eq('owner_id', userId).single()
      if (!data) return
      trackerNS.to(`tracker:${trackerId}`).emit('command', { cmd, payload })
    })
  })

  const PORT = process.env.PORT || 3000
  httpServer.listen(PORT, () => console.log(`SafeCircle server running on :${PORT}`))
})
