# SafeCircle — Socket.IO Events Reference

## Namespaces

| Namespace | Used by |
|---|---|
| `/tracker` | Tracker device |
| `/guardian` | Guardian app |

---

## Connection Auth

**Tracker device** — HMAC-signed token:
```json
{ "token": "{\"trackerId\":\"...\",\"timestamp\":\"...\",\"signature\":\"...\"}" }
```
Signature = HMAC-SHA256 of `JSON.stringify({ trackerId, timestamp })` using `DEVICE_HMAC_SECRET`.
Token expires after 60 seconds (replay protection).

**Guardian app** — Supabase access token:
```json
{ "token": "<supabase_access_token>" }
```

---

## Tracker → Server (`/tracker` namespace)

| Event | Payload | When emitted |
|---|---|---|
| `device:location` | `{ trackerId, lat, lng, accuracy, altitude, altitudeAccuracy, speed, heading, simulated, timestamp, signature }` | On movement (distance filter) or on `ping` command |
| `device:battery` | `{ trackerId, level, charging }` | On connect + every 60s (only if level changed ≥5%) |
| `device:network` | `{ trackerId, connected, type }` | On connect + on network change event |

**Notes:**
- HMAC signature covers `{ trackerId, lat, lng, accuracy, timestamp }` only
- Server rejects location events with timestamps older than 30 seconds

---

## Server → Tracker (`/tracker` namespace)

| Event | Payload | Description |
|---|---|---|
| `ack` | — | Confirms location was received and relayed |
| `command` | `{ cmd, payload? }` | Command from guardian. Handled automatically by device. |

### Commands (`cmd` values)

| cmd | payload | Device behaviour |
|---|---|---|
| `alarm` | — | Vibrates device 3× with heavy haptic impact |
| `ping` | — | Immediately grabs GPS and emits `device:location` |
| `update_interval` | `{ ms: number }` | Updates foreground fallback ping interval |

---

## Guardian App → Server (`/guardian` namespace)

| Event | Payload | Description |
|---|---|---|
| `guardian:subscribe` | `{ trackerId }` | Join room for a tracker. Server verifies ownership before allowing. |
| `guardian:unsubscribe` | `{ trackerId }` | Leave the room |
| `guardian:command` | `{ trackerId, cmd, payload? }` | Send a command to a tracker. Server verifies ownership. |

---

## Server → Guardian App (`/guardian` namespace)

| Event | Payload | Description |
|---|---|---|
| `tracker:online` | `{ trackerId }` | Tracker connected |
| `tracker:offline` | `{ trackerId }` | Tracker disconnected — last known data now saved in DB |
| `tracker:location` | `{ trackerId, lat, lng, accuracy, altitude, altitudeAccuracy, speed, heading, simulated, timestamp }` | Live location (relayed from tracker, not from DB) |
| `tracker:battery` | `{ trackerId, level, charging }` | Battery status (relayed, not saved to DB) |
| `tracker:network` | `{ trackerId, connected, type }` | Network status (relayed, not saved to DB) |

---

## Data Persistence

| Data | While connected | On disconnect |
|---|---|---|
| Location | Memory only, broadcast live | Saved to `trackers` table (last known) |
| Battery | Relayed only | Not saved |
| Network | Relayed only | Not saved |

Fields saved to `trackers` on disconnect:
`last_lat`, `last_lng`, `last_altitude`, `last_altitude_accuracy`, `last_speed`, `last_heading`, `last_simulated`, `accuracy`, `last_seen`
