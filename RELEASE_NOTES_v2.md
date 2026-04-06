# SafeCircle v2.0.0 — Release Notes

**Release date:** April 2026  
**Platform:** Android (APK) · iOS (coming soon)  
**Channel:** Beta

---

## What's New

### 🔴 Live Tracker Monitoring
- Real-time GPS location updates via persistent socket connection — no more waiting for periodic pings
- Online/offline status shown instantly with animated signal bars based on GPS accuracy
- Live speed, altitude, and heading displayed per tracker
- Battery level with visual progress bar and charging indicator
- Network status (WiFi / cellular / offline) shown per device

### 📋 Tracker Detail Sheet
- Tap any tracker to open a full detail view
- Shows live coordinates, accuracy, speed, altitude, battery, and network
- Request an immediate location ping from the device
- Trigger a remote alarm (haptic vibration on the tracker device)

### 🗺️ Smarter Map
- Online trackers show a pulsing animated marker
- Offline trackers shown in grey with last known position
- Guardian's own live position shown on map

### 🤖 AI Assistant
- Ask questions in plain language: "Is Ana safe?", "How many posts do I have?", "Any sightings near me?"
- Draggable floating button — position it anywhere on screen
- Returns action buttons to navigate directly to relevant sections
- Powered by Gemini with multi-provider fallback (Claude, Groq, DeepSeek)

### 📢 Community Feeds
- Posts auto-categorised by AI: missing, found, sighting, alert, update
- Image attachments with swipeable carousel
- Location tagging on posts
- Filter feed by category
- Mark posts as resolved
- Comment deletion for post authors and comment authors

### 🔐 Google Sign-In (Native)
- Google OAuth now works natively on Android via in-app browser
- No more "close this tab" — deep link returns you directly to the app

### 🌍 Multi-language Support
- English, French, Yoruba, Hausa, Igbo
- Full translation across all screens including story, features, and footer
- Language preference saved locally

### 🎨 Theme Support
- Light, dark, and system (auto) themes
- Persisted across sessions

---

## Bug Fixes
- Fixed duplicate comment submission on fast taps
- Fixed comment input bar moving while scrolling
- Fixed image attachments not rendering in feed
- Fixed AI assistant returning 0 posts when user had posts

---

## Known Issues
- iOS build not yet available
- App Store / Google Play listing pending review
- Direct APK download available at `/releases`
