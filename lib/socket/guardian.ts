const crypto = require('crypto')
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)
const HMAC_SECRET = process.env.DEVICE_HMAC_SECRET

export const initializeGuardianHandlers = (io: SocketIOServer) => {
    const namespace = io.of('/guardian');


    namespace.use(async (socket, next) => {
        try {
        const { data: { user }, error } = await supabase.auth.getUser(socket.handshake.auth.token)
        if (error || !user) return next(new Error('Unauthorized'))
        socket.data.userId = user.id
        next()
        } catch { next(new Error('Auth failed')) }
    })

    namespace.on('connection', (socket) => {
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
            namespace.to(`tracker:${trackerId}`).emit('command', { cmd, payload })
        })
    })
}