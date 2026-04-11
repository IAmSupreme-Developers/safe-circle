const crypto = require('crypto')
import { Server as SocketIOServer, Socket } from 'socket.io';
const HMAC_SECRET = process.env.DEVICE_HMAC_SECRET

export const initializeTrackerHandlers = (io: SocketIOServer) => {
    const namespace = io.of('/tracker');

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

    namespace.on('connection', (socket: Socket) => {
        console.log(`[tracker] connect   ${socket.id}`);
        socket.onAny((event, ...args) => {
            console.log(`[tracker] ${socket.id} >> ${event}`, args.length ? args : '');
        });
    });


};