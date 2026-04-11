require('dotenv').config({ path: '.env' })
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

// Shared in-memory state
global.onlineTrackers = global.onlineTrackers || new Set()
global.trackerLocations = global.trackerLocations || new Map() // trackerId → last location

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    // Handle CORS preflight
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    console.log(`[${req.method}] ${req.url} | Origin: ${req.headers.origin ?? 'none'}`)
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }
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
    console.log(`[tracker:connect] id=${trackerId} socket=${socket.id}`)

    // Request immediate location on connect
    socket.emit('command', { cmd: 'ping' })

    socket.on('device:location', (data) => {
      const { lat, lng, accuracy, altitude, altitudeAccuracy, speed, heading, simulated, timestamp, signature } = data
      // Verify HMAC
      const payload = JSON.stringify({ trackerId, lat, lng, accuracy, timestamp })
      const expected = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex')
      if (expected !== signature) return
      // Reject stale (30s window)
      if (Date.now() - new Date(timestamp).getTime() > 30_000) return
      // Store in both socket and global map
      const location = { lat, lng, accuracy, altitude, altitudeAccuracy, speed, heading, simulated, timestamp }
      socket.data.lastLocation = location
      global.trackerLocations.set(trackerId, location)
      // Relay to guardian
      guardianNS.to(`guardian:${trackerId}`).emit('tracker:location', { trackerId, ...location })
      socket.emit('ack')
    })

    socket.on('device:battery', (data) => {
      guardianNS.to(`guardian:${trackerId}`).emit('tracker:battery', { trackerId, ...data })
    })

    socket.on('device:network', (data) => {
      guardianNS.to(`guardian:${trackerId}`).emit('tracker:network', { trackerId, ...data })
    })

    socket.on('disconnect', async () => {
      console.log(`[tracker:disconnect] id=${trackerId} socket=${socket.id}`)
      const last = global.trackerLocations.get(trackerId)
      if (last) {
        await supabase.from('trackers').update({
          last_lat: last.lat, last_lng: last.lng,
          last_altitude: last.altitude, last_altitude_accuracy: last.altitudeAccuracy,
          last_speed: last.speed, last_heading: last.heading,
          last_simulated: last.simulated, accuracy: last.accuracy,
          last_seen: last.timestamp,
        }).eq('id', trackerId)
      }
      global.onlineTrackers.delete(trackerId)
      guardianNS.to(`guardian:${trackerId}`).emit('tracker:offline', { trackerId })
    })
  })

  // ── Guardian connection ───────────────────────────────────────────────────
  guardianNS.on('connection', (socket) => {
    const { userId } = socket.data
    console.log(`[guardian:connect] userId=${userId} socket=${socket.id}`)
    socket.on('disconnect', () => console.log(`[guardian:disconnect] userId=${userId} socket=${socket.id}`))

    socket.on('guardian:subscribe', async ({ trackerId }) => {
      const { data } = await supabase.from('trackers')
        .select('id, last_lat, last_lng, last_altitude, last_altitude_accuracy, last_speed, last_heading, last_simulated, accuracy, last_seen')
        .eq('id', trackerId).eq('owner_id', userId).single()
      if (!data) return
      socket.join(`guardian:${trackerId}`)

      // Send current online status
      const isOnline = global.onlineTrackers.has(trackerId)
      if (isOnline) socket.emit('tracker:online', { trackerId })

      // Send location: prefer in-memory (live), fall back to DB (last known)
      const memLocation = global.trackerLocations.get(trackerId)
      if (memLocation) {
        socket.emit('tracker:location', { trackerId, ...memLocation })
      } else if (data.last_lat && data.last_lng) {
        socket.emit('tracker:location', {
          trackerId,
          lat: data.last_lat, lng: data.last_lng,
          altitude: data.last_altitude, altitudeAccuracy: data.last_altitude_accuracy,
          speed: data.last_speed, heading: data.last_heading,
          simulated: data.last_simulated, accuracy: data.accuracy,
          timestamp: data.last_seen,
        })
      }
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
