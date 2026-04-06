# Running SafeCircle Server with PM2

## Install PM2

```bash
npm install -g pm2
```

## Build & Start

```bash
# Build Next.js
npm run build

# Start with PM2
pm2 start server.js --name safecircle

# Save process list so it survives reboots
pm2 save
pm2 startup
```

## Useful Commands

```bash
pm2 logs safecircle       # stream logs
pm2 restart safecircle    # restart process
pm2 stop safecircle       # stop process
pm2 delete safecircle     # remove from PM2
pm2 status                # list all processes
pm2 monit                 # live dashboard
```

## Ecosystem File (Recommended for Production)

Create `ecosystem.config.js` at the project root:

```js
module.exports = {
  apps: [{
    name: 'safecircle',
    script: 'server.js',
    instances: 1,           // keep at 1 — socket.io in-memory state is not shared across instances
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    }
  }]
}
```

Then run:

```bash
pm2 start ecosystem.config.js
pm2 save
```

## Notes

- Keep `instances: 1` — the in-memory `onlineTrackers` Set is not shared across multiple processes. If you need to scale horizontally, replace the Set with a Redis store.
- Env vars from `.env.local` are **not** automatically loaded by PM2 in production. Set them in `ecosystem.config.js` under `env` or use a `.env` file loaded via `dotenv`.
