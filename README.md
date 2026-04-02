# SafeCircle — Tracker Device App

This is the **tracker device branch** of SafeCircle. It runs on the device worn or carried by the person being monitored (child, elderly person, etc.) and continuously broadcasts GPS location to Supabase so guardians can track it in real time via the main SafeCircle app.

> The main guardian app lives on the `main` branch.

---

## How It Works

1. Admin pre-inserts a tracker row in Supabase with a `device_id` and `code`
2. This app is configured with those credentials via env vars
3. On first launch, the app shows the device ID and code for the guardian to register
4. Once the guardian registers the device in the main app, this app starts broadcasting GPS location every 5 seconds

---

## Setup

### 1. Clone and install

```bash
git checkout track-device
npm install
```

### 2. Configure environment

Copy `.env.local` and fill in your values:

```bash
cp .env.local .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# The device identity — must exist in the trackers table (inserted by admin)
NEXT_PUBLIC_DEVICE_ID=SC-ABC123
NEXT_PUBLIC_DEVICE_CODE=XY99ZZ
```

### 3. Insert the tracker row in Supabase

Run this in the Supabase SQL editor (or via the admin panel):

```sql
insert into public.trackers (device_id, code)
values ('SC-ABC123', 'XY99ZZ');
```

The `owner_id` stays `null` until a guardian registers it.

### 4. Run

```bash
npm run dev
```

Open on the device at `http://localhost:3000`.

---

## Device Credentials

Credentials are resolved in this order:

1. **Env vars** (`NEXT_PUBLIC_DEVICE_ID` + `NEXT_PUBLIC_DEVICE_CODE`) — used for pre-configured builds
2. **localStorage** — used if the user manually entered credentials on first launch (fallback for dev/testing)

For real hardware, credentials would be flashed onto the firmware at the factory.

---

## Pairing Flow

```
Device launches
    │
    ├─ Credentials found (env or localStorage)?
    │       │
    │       └─ Yes → Show device ID + code on screen
    │                    │
    │                    └─ Guardian registers device in main app
    │                             │
    │                             └─ Tap "I've been registered" → check owner_id set
    │                                          │
    │                                          └─ ✓ Start broadcasting
    │
    └─ No → Manual entry screen (enter ID + code printed on device)
```

---

## Broadcasting

- Uses the browser `navigator.geolocation` API (GPS on mobile, IP-based on desktop)
- Pings every **5 seconds** — updates `last_lat`, `last_lng`, `last_seen` on the tracker row
- Auto-starts on launch after pairing
- Can be manually stopped/started from the UI
- Tap **Unpair Device** to reset and re-pair with a different account

---

## Security Notes

- The device only has the Supabase **anon key** — it can only update its own tracker row
- Device registration (claiming ownership) is done exclusively through the main app's authenticated API
- A device can only be claimed once — once `owner_id` is set, no other guardian can register it
- To transfer ownership, the current owner must release the device from the main app (post-hackathon feature)

---

## Post-Hackathon (Hardware)

When real tracker hardware is available:
- Device ID and code are flashed at the factory
- Location is sent over LTE/NB-IoT directly to Supabase (no phone needed)
- Form factors: earring, backpack clip, wristband, shoe insert
