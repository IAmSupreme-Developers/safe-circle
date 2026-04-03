/**
 * SafeCircle — Central Config
 * All tuneable constants live here. Edit this file to control app behaviour.
 */

// --- Dashboard ---
/** Number of recent alerts shown on the dashboard */
export const DASHBOARD_ALERT_LIMIT = 5

// --- Proximity buffer (settings page) ---
/** Default proximity buffer in metres */
export const DEFAULT_PROXIMITY_BUFFER = 50
/** Maximum proximity buffer in metres */
export const MAX_PROXIMITY_BUFFER = 500
/** Slider step size in metres */
export const PROXIMITY_BUFFER_STEP = 10

// --- Alerts ---
/** How long (ms) the "Saved!" confirmation shows after saving settings */
export const SAVE_CONFIRM_DURATION_MS = 2000

// --- Map ---
/** Default map zoom level */
export const MAP_DEFAULT_ZOOM = 15
/** Default pin colours per point type */
export const PIN_COLORS = {
  tracker:      '#f59e0b',   // amber
  guardian:     '#3b82f6',   // blue
  'search-party': '#10b981', // green
} as const
/** Default safe zone border colour */
export const ZONE_DEFAULT_COLOR = '#f59e0b'
export const NAV_LINKS = [
  { href: '/dashboard', label: 'Home',    icon: 'Home'          },
  { href: '/map',       label: 'Map',     icon: 'Map'           },
  { href: '/feeds',     label: 'Feeds',   icon: 'MessageCircle' },
  { href: '/tracking',  label: 'Devices', icon: 'Cpu'           },
  { href: '/settings',  label: 'Profile', icon: 'UserCircle'    },
] as const
