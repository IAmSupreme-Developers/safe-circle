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

// --- Navigation ---
export const NAV_LINKS = [
  { href: '/dashboard',    label: 'Home',     icon: 'LayoutDashboard' },
  { href: '/tracking',     label: 'Tracking', icon: 'MapPin'          },
  { href: '/search-party', label: 'Search',   icon: 'Users'           },
  { href: '/alerts',       label: 'Alerts',   icon: 'Bell'            },
  { href: '/settings',     label: 'Settings', icon: 'Settings'        },
] as const
