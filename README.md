<div align="center">

# 📡 SafeCircle — Tracker Device

**The device-side app of SafeCircle.**  
Worn or carried by the person being monitored — maintains a persistent socket connection to the server and streams live GPS, battery, and network status to the guardian app in real time.

> 🛡️ The guardian app lives on the `main` branch.  
> 🖥️ The server (Socket.IO + API routes) lives on the `server` branch.  
> 📋 Socket events reference → `events.md`  
> 🔧 Server setup guide → `updateserver.md`

</div>

---

## 🔄 How It Works

```
Admin inserts tracker row (device_id + code) in Supabase
        ↓
Device app launches → reads credentials from env vars (or manual entry)
        ↓
PairScreen shows device ID + code for guardian to scan/enter
        ↓
Guardian registers device in the SafeCircle app → owner_id set in DB
        ↓
Device taps "Check Registration Status" → HTTP check confirms owner_id set
        ↓
🟢 Socket connection established to server (/tracker namespace)
        ↓
Background GPS watcher fires on movement (DISTANCE_FILTER_METERS)
        ↓
Each location ping is HMAC-signed → emitted via socket → relayed live to guardian app
        ↓
Battery + network status emitted on connect and on change
        ↓
On disconnect → server saves last known location to Supabase
```

---

## ⚡ Quick Start

### 1 · Clone & Install

```bash
git checkout track-device-2
npm install
```

### 2 · Configure Environment

```env
# .env.local

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Device identity — must exist in the trackers table (inserted by admin)
NEXT_PUBLIC_DEVICE_ID=SC-ABC123
NEXT_PUBLIC_DEVICE_CODE=XY99ZZ

# Server URL — Socket.IO server (server branch)
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# HMAC secret — must match DEVICE_HMAC_SECRET on the server
NEXT_PUBLIC_DEVICE_HMAC_SECRET=your-long-random-secret
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
  page.tsx                    → Orchestrator (PairScreen vs BroadcastScreen)
  layout.tsx                  → Root layout
  globals.css                 → Theme variables
  components/
    PairScreen.tsx            → Setup + waiting for guardian registration
    BroadcastScreen.tsx       → Live broadcasting UI (status, last ping, commands)
    ui.tsx                    → Shared UI primitives (Screen, Btn, DeviceIcon)
lib/
  config.ts                   → ⚙️  All tuneable constants
  device.ts                   → All device logic (socket, location, battery, network, commands)
  hmac.ts                     → HMAC-SHA256 sign + verify utilities
  supabase.ts                 → Supabase anon client (registration check only)
events.md                     → Full Socket.IO events reference
updateserver.md               → Server setup guide
```

---

## ⚙️ Configuration

All tuneable constants live in **`lib/config.ts`**.

| Constant | Default | Description |
|---|---|---|
| `DISTANCE_FILTER_METERS` | `10` | Min movement (m) before a location ping fires |
| `GPS_TIMEOUT_MS` | `10000` | GPS acquisition timeout (ms) |
| `FOREGROUND_PING_INTERVAL_MS` | `5000` | Fallback ping interval when background tracking unavailable (ms) |
| `BG_NOTIFICATION_TITLE` | `SafeCircle Active` | Android notification title |
| `BG_NOTIFICATION_MESSAGE` | `SafeCircle is tracking...` | Android notification body |
| `SERVER_URL` | `http://localhost:3000` | Socket.IO server URL |
| `DEVICE_HMAC_SECRET` | *(env var)* | Shared secret for signing location payloads |

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

Location is only emitted when the device moves by at least `DISTANCE_FILTER_METERS`. No polling when stationary.

---

## 📊 Live Data Streamed to Guardian

| Data | Trigger | Saved to DB |
|---|---|---|
| Location (lat, lng, accuracy, altitude, speed, heading) | On movement | On disconnect only |
| Battery level + charging state | On connect + every 60s if changed ≥5% | No |
| Network status (connected, type) | On connect + on change | No |

---

## 🔒 Security

| Concern | How it's handled |
|---|---|
| Location spoofing | HMAC-SHA256 signature on every ping — tampered payloads rejected |
| Replay attacks | 30-second timestamp expiry window on location events |
| Socket auth | HMAC-signed token verified on every connection attempt |
| Unauthorised claiming | Device can only be claimed once — `owner_id` locked to first guardian |
| Data in transit | HTTPS/WSS (TLS) encrypts all traffic |

---

## 🎮 Remote Commands

The guardian app can send commands to the tracker via the server:

| Command | Effect on device |
|---|---|
| `alarm` | Vibrates 3× with heavy haptic impact |
| `ping` | Immediately grabs GPS and emits location |
| `update_interval` | Updates foreground fallback ping interval |

---

## 🤖 Native Setup (Capacitor)

```bash
npx cap add android
npm run build && npx cap sync android
npx cap open android
```

See **`TO-NOTE.md`** for required Android permissions.

---

## 🔭 Post-Hackathon (Hardware)

| Feature | Details |
|---|---|
| Custom form factors | Earring, backpack clip, wristband, shoe insert |
| Connectivity | LTE / NB-IoT — no phone needed |
| Provisioning | Device ID + code + HMAC secret flashed at factory |
| Per-device secrets | Unique HMAC secret per device → see `TODO.md` |
| Offline fallback | Cell tower triangulation → see `TODO.md` |
