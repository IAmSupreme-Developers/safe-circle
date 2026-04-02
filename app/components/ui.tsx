import { Shield } from 'lucide-react'

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">{children}</div>
    </div>
  )
}

export function DeviceIcon() {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full mx-auto"
      style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}>
      <Shield size={40} style={{ color: 'var(--accent)' }} />
    </div>
  )
}

export function Btn({ children, variant = 'primary', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'danger' | 'ghost' }) {
  const styles = {
    primary: { background: 'var(--accent)', color: 'var(--accent-fg)' },
    danger:  { background: 'var(--danger)', color: '#fff' },
    ghost:   { borderColor: 'var(--border)', color: 'var(--fg-muted)', border: '1px solid' },
  }
  return (
    <button {...props}
      className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold disabled:opacity-60 ${props.className ?? ''}`}
      style={styles[variant]}>
      {children}
    </button>
  )
}
