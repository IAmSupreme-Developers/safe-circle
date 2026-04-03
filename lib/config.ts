/**
 * SafeCircle Tracker — Central Config
 * All tuneable process variables live here for easy control.
 */

// --- Location tracking ---
/** Minimum distance (metres) device must move before a new location ping fires */
export const DISTANCE_FILTER_METERS = 10

/** GPS timeout for one-shot foreground ping (milliseconds) */
export const GPS_TIMEOUT_MS = 10000

/** Fallback interval for foreground ping when background tracking unavailable (milliseconds) */
export const FOREGROUND_PING_INTERVAL_MS = 5000

// --- Background service notifications (shown in Android notification tray) ---
export const BG_NOTIFICATION_TITLE = 'SafeCircle Active'
export const BG_NOTIFICATION_MESSAGE = 'SafeCircle is tracking your location.'

// --- localStorage keys ---
export const STORAGE_KEY_CREDENTIALS = 'sc_device_credentials'
export const STORAGE_KEY_PAIRED_DEVICE = 'sc_device'

// --- Registration check ---
/** Base URL of the server — empty string falls back to relative URLs (local dev) */
export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
