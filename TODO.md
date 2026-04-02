# SafeCircle — TODO

## Auth & Onboarding
- [ ] Extended signup: date of birth, address, profile photo
- [ ] KYC verification (government ID upload + liveness check) — e.g. Smile Identity or Youverify for Nigerian market
- [ ] Phone number verification (OTP via SMS) during signup
- [ ] Guardian role vs child/dependent role distinction at signup

## Security
- [ ] Biometric app lock — fingerprint / Face ID on app open (Capacitor `@capacitor-community/fingerprint-auth`)
- [ ] PIN fallback if biometrics unavailable
- [ ] Auto-lock after X minutes of inactivity (configurable in settings)
- [ ] Session timeout + re-auth for sensitive actions (delete tracker, change account)

## Tracking
- [ ] Safe zones UI — create/edit/delete zones on a map (Leaflet + radius picker)
- [ ] Per-zone notification rules (exit message, severity, enter alert toggle)
- [ ] Live location map view per tracker (Leaflet)
- [ ] Location history / breadcrumb trail per tracker
- [ ] Tracker simulation branch (`tracker-sim`) — separate Capacitor app that sends fake GPS pings to Supabase

## Notifications
- [ ] Push notifications via Capacitor (`@capacitor/push-notifications`)
- [ ] Supabase Realtime subscription for live alert delivery
- [ ] Proximity buffer logic — suppress alerts when guardian is within X meters of tracker

## Search Party
- [ ] Real map with participant locations (Leaflet + Supabase Realtime)
- [ ] Coverage zone assignment per participant
- [ ] Accountability log (who checked in where, timestamps)
- [ ] Community alert broadcast (report a missing child to nearby users)

## AI / MCP
- [ ] Anomaly detection on tracker movement (unusual speed, route, time of day)
- [ ] Smart alert summarization ("Emma has been outside school zone for 15 mins")
- [ ] Natural language safe zone setup ("Set a zone around St. Mary's School")
- [ ] Community alert triage — flag duplicate/spam reports
- [ ] Risk scoring for incoming community alerts
- [ ] MCP server integration for AI tooling

## Account & Profile
- [ ] Account page — view/edit full profile
- [ ] Guardian linking — invite another guardian to co-monitor a tracker
- [ ] Consent management — what data is shared and with whom
- [ ] Account deletion + data wipe (GDPR/NDPR compliance)

## Backend / Infra
- [ ] Supabase Edge Function — validate device registration code on tracker register
- [ ] Supabase Edge Function — geofence check on location update (trigger alert insert)
- [ ] Row-level security audit
- [ ] Capacitor integration (`npx cap init`, iOS + Android targets)

## Post-Hackathon / Sponsored
- [ ] Custom hardware tracker (earring, backpack clip, wristband form factors)
- [ ] Tracker firmware — sends GPS pings over LTE/NB-IoT to Supabase
- [ ] Device binding server — one-time code validation registry
