'use client'
import { SOCIAL_LINKS, FOOTER_LINKS } from '../landing.config'
import { useThemeLang } from '../ThemeLangProvider'

const SOCIAL_ICONS: Record<keyof typeof SOCIAL_LINKS, string> = {
  twitter: '𝕏', linkedin: 'in', facebook: 'f', youtube: '▶'
}

function scrollTo(id: string) {
  const el = document.getElementById(id.replace('#', ''))
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  else window.location.href = id
}

export default function Footer() {
  const { t } = useThemeLang()
  return (
    <footer style={{ padding: '60px 6vw 40px', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 48, marginBottom: 60 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#4F6EF7,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🛡️</div>
            <span style={{ fontWeight: 900, fontSize: 18, color: 'var(--fg)' }}>Safe<span style={{ color: '#4F6EF7' }}>Circle</span></span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--fg-subtle)', lineHeight: 1.7 }}>{t('footer_tagline')}</p>
        </div>

        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
          <div key={title}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', marginBottom: 16, letterSpacing: 0.5 }}>{title}</p>
            {links.map(l => (
              <button key={l.label} onClick={() => scrollTo(l.href)}
                style={{ display: 'block', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--fg-subtle)', marginBottom: 10, padding: 0, textAlign: 'left', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg-muted)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-subtle)')}>
                {l.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
        <p style={{ color: 'var(--fg-subtle)', fontSize: 13 }}>{t('footer_copy')}</p>
        <div style={{ display: 'flex', gap: 12 }}>
          {(Object.entries(SOCIAL_LINKS) as [keyof typeof SOCIAL_LINKS, string][]).map(([key, href]) => (
            <a key={key} href={href} target="_blank" rel="noopener noreferrer"
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--fg-subtle)', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(79,110,247,0.15)'; (e.currentTarget as HTMLElement).style.color = '#4F6EF7' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'; (e.currentTarget as HTMLElement).style.color = 'var(--fg-subtle)' }}>
              {SOCIAL_ICONS[key]}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
