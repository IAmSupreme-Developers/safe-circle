'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, MapPin, Users, Bell, Settings } from 'lucide-react'

const links = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/tracking', icon: MapPin, label: 'Tracking' },
  { href: '/search-party', icon: Users, label: 'Search' },
  { href: '/alerts', icon: Bell, label: 'Alerts' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default function BottomNav() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t"
      style={{ background: 'var(--nav-bg)', borderColor: 'var(--border)' }}>
      {links.map(({ href, icon: Icon, label }) => {
        const active = path.startsWith(href)
        return (
          <Link key={href} href={href}
            className="flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors"
            style={{ color: active ? 'var(--accent)' : 'var(--fg-muted)' }}>
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
