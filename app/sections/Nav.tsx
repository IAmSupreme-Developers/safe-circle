'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      padding: '0 6vw', height: 68,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled ? 'rgba(6,11,24,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.4s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#4F6EF7,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 0 20px rgba(79,110,247,0.5)' }}>🛡️</div>
        <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-0.5px' }}>Safe<span style={{ color: '#4F6EF7' }}>Circle</span></span>
      </div>
      <div style={{ display: 'flex', gap: 36, fontSize: 14, color: '#94a3b8' }}>
        {['Features', 'Story', 'How it works', 'Community'].map(l => (
          <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`}
            style={{ color: 'inherit', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f1f5f9')}
            onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}>{l}</a>
        ))}
      </div>
      <a href="#download" style={{
        background: 'linear-gradient(135deg,#4F6EF7,#7c3aed)', color: '#fff',
        padding: '10px 26px', borderRadius: 999, fontSize: 14, fontWeight: 700,
        boxShadow: '0 4px 20px rgba(79,110,247,0.35)', transition: 'transform 0.2s, box-shadow 0.2s',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(79,110,247,0.5)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(79,110,247,0.35)' }}>
        Get the App
      </a>
    </nav>
  )
}
