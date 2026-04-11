const crypto = require('crypto')
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createClient } from '@supabase/supabase-js';

const HMAC_SECRET = process.env.DEVICE_HMAC_SECRET

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export const initializeTrackerHandlers = (io: SocketIOServer) => {
    const namespace = io.of('/tracker');
    const guardianNS = io.of('/guardian');

    // ── Tracker auth ─────────────────────────────────────────────────────────
    namespace.use((socket, next) => {
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

    namespace.on('connection', (socket) => {
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


};