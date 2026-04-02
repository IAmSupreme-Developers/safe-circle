import { CSSProperties } from 'react'

export function Card({ children, style }: { children: React.ReactNode; style?: CSSProperties }) {
  return (
    <div className="rounded-2xl border px-4 py-3"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', ...style }}>
      {children}
    </div>
  )
}

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-semibold">{title}</h2>
      {action}
    </div>
  )
}

export function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div>
      {label && <label className="text-xs mb-1 block" style={{ color: 'var(--fg-muted)' }}>{label}</label>}
      <input {...props}
        className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
        style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }} />
    </div>
  )
}

export function Button({ variant = 'primary', children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'danger' | 'ghost' }) {
  const styles: Record<string, CSSProperties> = {
    primary: { background: 'var(--accent)', color: 'var(--accent-fg)' },
    danger: { borderColor: 'var(--danger)', color: 'var(--danger)', border: '1px solid' },
    ghost: { color: 'var(--accent)' },
  }
  return (
    <button {...props}
      className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-opacity disabled:opacity-60 ${props.className ?? ''}`}
      style={styles[variant]}>
      {children}
    </button>
  )
}
