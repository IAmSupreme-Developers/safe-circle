<div align="center">

# 📡 SafeCircle — Tracker Device

**The device-side app of SafeCircle.**
Worn or carried by the person being monitored — continuously broadcasts GPS location so guardians can track in real time via the SafeCircle app.

> 🛡️ The guardian app lives on the `main` branch.
> 🖥️ The server (API routes) lives on the `server` branch.

</div>

---

## 🔄 How It Works

```
Admin inserts tracker row (device_id + code) in Supabase
        ↓
Device app launches → reads credentials from env vars (or manual entry)
        ↓
Shows device ID + code on screen
        ↓
Guardian registers device in the SafeCircle app
        ↓
Device taps "Check Registration Status" → server confirms owner_id set
        ↓
🟢 Background GPS broadcasting starts
        ↓
Every location ping is HMAC-signed → sent to server → written to Supabase
```

---

## ⚡ Quick Start

### 1 · Clone & Install

```bash
git checkout track-device
npm install
```

### 2 · Configure Environment

```env
# .env.local

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Device identity — must exist in the trackers table (inserted by admin)
NEXT_PUBLIC_DEVICE_ID=SC-ABC123
NEXT_PUBLIC_DEVICE_CODE=XY99ZZ

# Server URL — leave empty for local dev, set to deployed URL in production
NEXT_PUBLIC_SERVER_URL=

# HMAC secret — must match DEVICE_HMAC_SECRET on the server
NEXT_PUBLIC_DEVICE_HMAC_SECRET=your-long-random-secret
DEVICE_HMAC_SECRET=your-long-random-secret
```

### 3 · Insert Tracker Row in Supabase

```sql
insert into public.trackers (device_id, code)
values ('SC-ABC123', 'XY99ZZ');
```

> `owner_id` stays `null` until a guardian registers it from the main app.

### 4 · Run

```bash
npm run dev
# Open at http://localhost:3000
```

---

## 📂 Project Structure

```
app/
  page.tsx                    → Orchestrator (pair vs broadcast)
  layout.tsx                  → Root layout
  globals.css                 → Theme variables
  components/
    PairScreen.tsx            → Setup + waiting for registration
    BroadcastScreen.tsx       → Live GPS broadcasting UI
    ui.tsx                    → Shared UI primitives (Screen, Btn, DeviceIcon)
  api/
    device/
      check/route.ts          → Registration status check (public, no auth)
      location/route.ts       → Receives signed location pings, writes to DB
lib/
  config.ts                   → ⚙️  All tuneable constants
  device.ts                   → All device logic (credentials, pairing, location)
  hmac.ts                     → HMAC-SHA256 sign + verify utilities
  api.ts                      → API response helpers
  supabase.ts                 → Supabase anon client
  supabase-admin.ts           → Supabase service role client (server-side only)
```

---

## ⚙️ Configuration

All tuneable constants live in **`lib/config.ts`**.

| Constant | Default | Description |
|---|---|---|
| `DISTANCE_FILTER_METERS` | `10` | Min movement (m) before a location ping fires |
| `GPS_TIMEOUT_MS` | `10000` | GPS acquisition timeout (ms) |
| `FOREGROUND_PING_INTERVAL_MS` | `5000` | Fallback ping interval on web (ms) |
| `BG_NOTIFICATION_TITLE` | `SafeCircle Active` | Android notification title |
| `BG_NOTIFICATION_MESSAGE` | `SafeCircle is tracking...` | Android notification body |
| `STORAGE_KEY_PAIRED_DEVICE` | `sc_device` | localStorage key for paired device state |
| `SERVER_URL` | `http://localhost:3000` | Base URL for API calls |
| `DEVICE_HMAC_SECRET` | *(env var)* | Shared secret for request signing |

---

## 🔐 Credential Resolution

```
1. Env vars  →  NEXT_PUBLIC_DEVICE_ID + NEXT_PUBLIC_DEVICE_CODE  (pre-configured builds)
2. localStorage  →  manually entered on first launch  (dev / testing fallback)
```

> For real hardware, credentials are flashed onto firmware at the factory.

---

## 📡 Broadcasting

| Mode | How | When |
|---|---|---|
| **Native background** | `@capacitor-community/background-geolocation` | Android/iOS — survives screen lock |
| **Foreground fallback** | Interval ping every `FOREGROUND_PING_INTERVAL_MS` | Web/dev — stops when screen locks |

Location pings are **HMAC-SHA256 signed** and sent to `/api/device/location`. The server verifies the signature and timestamp before writing to Supabase. Direct Supabase access from the device is not used.

---

## 🔒 Security

| Concern | How it's handled |
|---|---|
| Location spoofing | HMAC-SHA256 signature on every ping — tampered payloads rejected |
| Replay attacks | 30-second timestamp expiry window |
| Code exposure | `code` column never returned to device — registration check via server API only |
| Unauthorised claiming | Device can only be claimed once — `owner_id` locked to first guardian |
| Data in transit | HTTPS (TLS) encrypts all traffic |

---

## 🤖 Native Setup (Capacitor)

Required to enable background location on a real device:

```bash
npx cap init "SafeCircle Tracker" "com.safecircle.tracker"
npx cap add android
npm run build && npx cap sync android
npx cap open android
```

See **`TO-NOTE.md`** for required Android permissions and gotchas.

---

## 🔭 Post-Hackathon (Hardware)

| Feature | Details |
|---|---|
| Custom form factors | Earring, backpack clip, wristband, shoe insert |
| Connectivity | LTE / NB-IoT — no phone needed |
| Provisioning | Device ID + code + HMAC secret flashed at factory |
| Per-device secrets | Unique HMAC secret per device → see `TODO.md` |
| Offline fallback | Cell tower triangulation → see `TODO.md` |
