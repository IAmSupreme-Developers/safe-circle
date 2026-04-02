<div align="center">

# 🗒️ SafeCircle Tracker — Notes & Gotchas

**Important implementation details, Android quirks, and setup requirements.**

</div>

---

## 🤖 Android Manifest Permissions

Add all five to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
```

| Permission | Why it's needed |
|---|---|
| `ACCESS_FINE_LOCATION` | GPS-level precision (~5m). Required for `enableHighAccuracy: true` |
| `ACCESS_COARSE_LOCATION` | Network/cell-tower location baseline. Android requires it declared even when Fine is present |
| `ACCESS_BACKGROUND_LOCATION` | Allows location when app is **not in foreground** (screen locked, minimised). Without this, tracking stops the moment the user leaves the app *(Android 10+)* |
| `FOREGROUND_SERVICE` | Allows a persistent foreground service with a visible notification — what the background geolocation plugin runs on |
| `FOREGROUND_SERVICE_LOCATION` | Explicitly declares the foreground service does location work. Without it, Android 14+ devices kill the service *(Android 14+)* |

> ⚠️ All five are required. Removing any one will break background tracking on some or all Android versions.

---

## ⚡ Capacitor Setup

Required before any native features (background location, GPS plugin) work:

```bash
npx cap init "SafeCircle Tracker" "com.safecircle.tracker"
npx cap add android
npm run build
npx cap sync android
npx cap open android        # opens Android Studio → run on real device
```

> 🚫 Background location does **not** work in the browser or Android emulator.
> Always test on a **physical Android device**.

---

## 📡 Background Tracking Fallback

If `startBackgroundTracking()` fails (web, emulator, or missing permissions), the app automatically falls back to a **foreground interval ping** every `FOREGROUND_PING_INTERVAL_MS` *(default: 5000ms)*.

| Mode | Survives screen lock? | Use case |
|---|---|---|
| Native background watcher | ✅ Yes | Production (Capacitor on Android/iOS) |
| Foreground interval fallback | ❌ No | Development / browser testing |

> Always ship the native Capacitor build for production use.

---

## 🔋 Battery Optimisation

- `distanceFilter` in `lib/config.ts` controls minimum movement before a ping fires
- Set to `10m` by default — prevents constant pings when device is stationary
- Increase to `50m`+ for even better battery life at the cost of location granularity
- Android may also apply **Doze mode** restrictions — consider requesting battery optimisation exemption for the app in production
