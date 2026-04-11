import 'dotenv/config'
import '@/lib/global'
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { getSocketIO } from '@/lib/socket/server';
import { initializeTrackerHandlers } from '@/lib/socket/tracker';
import { initializeGuardianHandlers } from '@/lib/socket/guardian';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(async (req, res) => {
        
        try {
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            console.log(`[${req.method}] ${req.url} | Origin: ${req.headers.origin ?? 'none'}`)
            if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }
            const parsedUrl = parse(req.url!, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    // Initialize Socket.IO
    const io = getSocketIO(httpServer);

    initializeTrackerHandlers(io);
    initializeGuardianHandlers(io);


    httpServer
    .once('error', (err) => {
        console.error(err);
        process.exit(1);
    })
    .listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log(`> Socket.IO ready on path: /`);
    });

})