/** Circular avatar with initials fallback */
export function Avatar({ src, name, size = 40 }: { src?: string | null; name?: string; size?: number }) {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'
  return src
    ? <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />
    : <div className="rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ width: size, height: size, background: 'var(--primary)' }}>{initials}</div>
}

/** Blue verified checkmark badge */
export function VerifiedBadge({ size = 6 }: { size?: number }) {
  return (
    <div className={`h-${size} w-${size} rounded-full flex items-center justify-center flex-shrink-0`}
      style={{ background: 'var(--verified-bg)' }}>
      <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>✓</span>
    </div>
  )
}

/** Back button circle */
export function BackButton({ href }: { href: string }) {
  const Link = require('next/link').default
  return (
    <Link href={href} className="h-9 w-9 rounded-full flex items-center justify-center"
      style={{ background: 'var(--bg-card)', boxShadow: 'var(--bg-card-shadow)' }}>
      ←
    </Link>
  )
}
