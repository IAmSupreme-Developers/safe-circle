<div align="center">

# ✅ SafeCircle — TODO

**Planned features, improvements, and post-hackathon roadmap.**

</div>

---

## 🔐 Auth & Onboarding

- [ ] Extended signup: date of birth, address, profile photo
- [ ] KYC verification (government ID upload + liveness check) — e.g. Smile Identity or Youverify for Nigerian market
- [ ] Phone number verification (OTP via SMS) during signup
- [ ] Guardian role vs child/dependent role distinction at signup

---

## 🛡️ Security

- [ ] Biometric app lock — fingerprint / Face ID on app open (`@capacitor-community/fingerprint-auth`)
- [ ] PIN fallback if biometrics unavailable
- [ ] Auto-lock after X minutes of inactivity (configurable in settings)
- [ ] Session timeout + re-auth for sensitive actions (delete tracker, change account)

---

## 📍 Tracking

- [ ] Safe zones UI — create/edit/delete zones on a map (Leaflet + radius picker)
- [ ] Per-zone notification rules (exit message, severity, enter alert toggle)
- [ ] Live location map view per tracker (Leaflet)
- [ ] Location history / breadcrumb trail per tracker

---

## 🔔 Notifications

- [ ] Push notifications via Capacitor (`@capacitor/push-notifications`)
- [ ] Supabase Realtime subscription for live alert delivery
- [ ] Proximity buffer logic — suppress alerts when guardian is within X meters of tracker

---

## 👥 Search Party

- [ ] Real map with participant locations (Leaflet + Supabase Realtime)
- [ ] Coverage zone assignment per participant
- [ ] Accountability log (who checked in where, timestamps)
- [ ] Community alert broadcast (report a missing child to nearby users)

---

## 🤖 AI / MCP

- [ ] Anomaly detection on tracker movement (unusual speed, route, time of day)
- [ ] Smart alert summarization — *"Emma has been outside school zone for 15 mins"*
- [ ] Natural language safe zone setup — *"Set a zone around St. Mary's School"*
- [ ] Community alert triage — flag duplicate/spam reports
- [ ] Risk scoring for incoming community alerts
- [ ] MCP server integration for AI tooling

---

## 👤 Account & Profile

- [ ] Account page — view/edit full profile
- [ ] Guardian linking — invite another guardian to co-monitor a tracker
- [ ] Consent management — what data is shared and with whom
- [ ] Account deletion + data wipe (GDPR/NDPR compliance)

---

## ⚙️ Backend / Infra

- [ ] Supabase Edge Function — validate device registration code on tracker register
- [ ] Supabase Edge Function — geofence check on location update (trigger alert insert)
- [ ] Row-level security audit
- [ ] Capacitor integration (`npx cap init`, iOS + Android targets)

---

## 🔭 Post-Hackathon / Sponsored

- [ ] Custom hardware tracker (earring, backpack clip, wristband form factors)
- [ ] Tracker firmware — sends GPS pings over LTE/NB-IoT directly to Supabase
- [ ] Device binding server — one-time code validation registry

---

## 📶 Cell Tower Triangulation *(Offline Location Fallback)*

> Fallback when GPS is unavailable **or** internet is down.
> Device stores pings locally and syncs when back online.

### Implementation Steps

**1 · Native Capacitor plugin — read cell tower data**
- Android: `TelephonyManager.getAllCellInfo()` → `Cell ID`, `LAC`, `MCC`, `MNC`, `RSSI`
- iOS: `CTTelephonyNetworkInfo` *(limited — serving cell only, no neighbours)*
- Wrap as a custom Capacitor plugin: `packages/capacitor-cell-info`

**2 · Tower coordinate database**
- Download [OpenCelliD](https://opencellid.org) CSV for target region (e.g. Nigeria)
- Filter to relevant MCC/MNC, convert to SQLite
- Bundle as read-only asset: `assets/towers.db`
- Query on-device via `@capacitor-community/sqlite`

**3 · Weighted centroid triangulation**

```
For each visible tower with known coords (lat_i, lng_i) and signal RSSI_i:

  weight_i = 1 / abs(RSSI_i)        ← stronger signal = higher weight
  lat      = Σ(lat_i × weight_i) / Σ(weight_i)
  lng      = Σ(lng_i × weight_i) / Σ(weight_i)
```

- Minimum 1 tower required (degrades gracefully to single-tower estimate)
- Accuracy: ~300m urban · ~2km rural

**4 · Offline queue + sync**
- No internet → store `{ lat, lng, timestamp, source: 'cell' }` in SQLite queue
- On reconnect → flush queue to Supabase in order
- Guardian app shows accuracy indicator based on `source` field

**5 · Location source priority**

```
Capacitor GPS available?   →  use GPS          (most accurate, ~5m)
        ↓ fail
Cell towers in local DB?   →  triangulate      (~300m – 2km)
        ↓ fail
Last known location        →  stale coords     (show age warning)
```

**6 · Schema addition**

```sql
alter table public.trackers
  add column location_source text default 'gps'; -- gps | cell | stale
```
