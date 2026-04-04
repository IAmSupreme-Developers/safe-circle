'use client'
import { useState, useEffect } from 'react'
import { useThemeLang } from '../ThemeLangProvider'
import { NAV_LINKS } from '../landing.config'

const LANGS = [
  { code: 'en', label: 'EN' }, { code: 'fr', label: 'FR' },
  { code: 'yo', label: 'YO' }, { code: 'ha', label: 'HA' }, { code: 'ig', label: 'IG' },
] as const

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const { theme, setTheme, lang, setLang } = useThemeLang()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  function cycleTheme() {
    const order: typeof theme[] = ['system', 'dark', 'light']
    setTheme(order[(order.indexOf(theme) + 1) % order.length])
  }

  function handleNav(section: string) {
    scrollTo(section)
    setMenuOpen(false)
  }

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        padding: '0 5vw', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled || menuOpen ? 'var(--nav-bg)' : 'transparent',
        backdropFilter: scrolled || menuOpen ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#4F6EF7,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🛡️</div>
          <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: '-0.5px', color: 'var(--fg)' }}>Safe<span style={{ color: '#4F6EF7' }}>Circle</span></span>
        </div>

        {/* Desktop links */}
        <div className="desktop-nav" style={{ display: 'flex', gap: 28, fontSize: 14, color: 'var(--fg-muted)' }}>
          {NAV_LINKS.map(l => (
            <button key={l.label} onClick={() => handleNav(l.section)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 'inherit', padding: 0 }}>
              {l.label}
            </button>
          ))}
        </div>

        {/* Desktop controls */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={cycleTheme} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {theme === 'system' ? '💻' : theme === 'dark' ? '🌙' : '☀️'}
          </button>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setLangOpen(v => !v)}
              style={{ height: 34, padding: '0 12px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: 4 }}>
              🌐 {lang.toUpperCase()} ▾
            </button>
            {langOpen && (
              <div style={{ position: 'absolute', top: 42, right: 0, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', minWidth: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 300 }}>
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false) }}
                    style={{ display: 'block', width: '100%', padding: '9px 14px', background: lang === l.code ? 'rgba(79,110,247,0.15)' : 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: lang === l.code ? 700 : 400, color: lang === l.code ? '#4F6EF7' : 'var(--fg-muted)', textAlign: 'left' }}>
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => scrollTo('download')}
            style={{ background: 'linear-gradient(135deg,#4F6EF7,#7c3aed)', color: '#fff', padding: '9px 22px', borderRadius: 999, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Get the App
          </button>
        </div>

        {/* Mobile: theme + hamburger */}
        <div className="mobile-nav" style={{ display: 'none', alignItems: 'center', gap: 8 }}>
          <button onClick={cycleTheme} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {theme === 'system' ? '💻' : theme === 'dark' ? '🌙' : '☀️'}
          </button>
          <button onClick={() => setMenuOpen(v => !v)}
            style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg)' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
      <div style={{ position: 'fixed', top: 64, left: 0, right: 0, zIndex: 199, background: 'var(--menu-bg)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', padding: '20px 5vw 28px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_LINKS.map(l => (
            <button key={l.label} onClick={() => handleNav(l.section)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', fontSize: 16, padding: '12px 0', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {l.label}
            </button>
          ))}
          {/* Lang picker in mobile menu */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            {LANGS.map(l => (
              <button key={l.code} onClick={() => { setLang(l.code); setMenuOpen(false) }}
                style={{ padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)', background: lang === l.code ? 'rgba(79,110,247,0.2)' : 'transparent', color: lang === l.code ? '#4F6EF7' : 'var(--fg-muted)', cursor: 'pointer' }}>
                {l.label}
              </button>
            ))}
          </div>
          <button onClick={() => { scrollTo('download'); setMenuOpen(false) }}
            style={{ marginTop: 16, background: 'linear-gradient(135deg,#4F6EF7,#7c3aed)', color: '#fff', padding: '14px', borderRadius: 999, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Get the App
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </>
  )
}
