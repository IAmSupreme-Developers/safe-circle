<div align="center">

# 📡 SafeCircle — Tracker Device

**The device-side app of SafeCircle.**
Worn or carried by the person being monitored — continuously broadcasts GPS location to Supabase so guardians can track in real time.

> 🛡️ The guardian app lives on the `main` branch.

</div>

---

## 🔄 How It Works

```
Admin inserts tracker row (device_id + code) in Supabase
        ↓
Device app launches → reads credentials from env vars
        ↓
Shows device ID + code on screen
        ↓
Guardian registers device in the SafeCircle app
        ↓
Device taps "Check Registration Status" → owner_id confirmed
        ↓
🟢 Background GPS broadcasting starts
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

# Device identity — must exist in the trackers table (inserted by admin)
NEXT_PUBLIC_DEVICE_ID=SC-ABC123
NEXT_PUBLIC_DEVICE_CODE=XY99ZZ
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
  page.tsx                  → Orchestrator (pair vs broadcast)
  layout.tsx                → Root layout
  globals.css               → Theme variables
  components/
    PairScreen.tsx          → Setup + waiting for registration
    BroadcastScreen.tsx     → Live GPS broadcasting UI
    ui.tsx                  → Shared UI primitives (Screen, Btn, DeviceIcon)
lib/
  config.ts                 → ⚙️  All tuneable constants (edit here to control behaviour)
  device.ts                 → All device logic (credentials, pairing, location)
  supabase.ts               → Supabase client
```

---

## ⚙️ Configuration

All process variables are centralised in **`lib/config.ts`** — edit there to change behaviour without touching logic files.

| Constant | Default | Description |
|---|---|---|
| `DISTANCE_FILTER_METERS` | `10` | Min movement (m) to trigger a location ping |
| `GPS_TIMEOUT_MS` | `10000` | GPS acquisition timeout |
| `FOREGROUND_PING_INTERVAL_MS` | `5000` | Fallback ping interval on web (ms) |
| `BG_NOTIFICATION_TITLE` | `SafeCircle Active` | Android notification title |
| `BG_NOTIFICATION_MESSAGE` | `SafeCircle is tracking...` | Android notification body |
| `STORAGE_KEY_PAIRED_DEVICE` | `sc_device` | localStorage key for paired device state |

---

## 🔐 Credential Resolution

Credentials are resolved in this priority order:

```
1. Env vars  →  NEXT_PUBLIC_DEVICE_ID + NEXT_PUBLIC_DEVICE_CODE  (pre-configured builds)
2. localStorage  →  manually entered on first launch  (dev / testing fallback)
```

> For real hardware, credentials are flashed onto firmware at the factory.

---

## 📡 Broadcasting

| Mode | How | When |
|---|---|---|
| **Native background** | `@capacitor-community/background-geolocation` | On Android/iOS — survives screen lock |
| **Foreground fallback** | Interval ping every `FOREGROUND_PING_INTERVAL_MS` | On web/dev — stops when screen locks |

Location updates write `last_lat`, `last_lng`, `last_seen`, `accuracy` directly to the tracker's Supabase row via HTTP (anon key).

---

## 🔒 Security

- Device only holds the Supabase **anon key** — RLS restricts it to updating its own row only
- Ownership is claimed exclusively through the guardian app's authenticated API
- A device can only be claimed **once** — `owner_id` is permanent until released by the owner
- No auth required on the device itself — the device ID + code is the identity

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
| Provisioning | Device ID + code flashed at factory |
| Offline fallback | Cell tower triangulation → see `TODO.md` |
