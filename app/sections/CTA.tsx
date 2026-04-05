'use client'
import { motion } from 'framer-motion'
import { useThemeLang } from '../ThemeLangProvider'

export default function CTA() {
  const { t } = useThemeLang()
  return (
    <section id="download" style={{ padding: '140px 6vw', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 50%,rgba(79,110,247,0.12),transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(79,110,247,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(79,110,247,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 72, marginBottom: 24, filter: 'drop-shadow(0 0 40px rgba(79,110,247,0.6))' }}>🛡️</div>
        <h2 style={{ fontSize: 'clamp(2.2rem,5vw,4rem)', fontWeight: 900, letterSpacing: '-2px', marginBottom: 20, lineHeight: 1.1 }}>
          {t('cta_headline1')}<br />
          <span style={{ background: 'linear-gradient(135deg,#4F6EF7,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('cta_title')}</span>
        </h2>
        <p style={{ fontSize: 18, color: '#64748b', marginBottom: 56, maxWidth: 480, margin: '0 auto 56px', lineHeight: 1.7 }}>
          {t('cta_sub')}
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
          {[
            { icon: '🤖', store: t('cta_google'), name: 'Google Play' },
            { icon: '🍎', store: t('cta_apple'), name: 'App Store' },
          ].map(b => (
            <motion.a key={b.name} href="#" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#f1f5f9', padding: '16px 32px', borderRadius: 16, fontWeight: 700, backdropFilter: 'blur(8px)' }}>
              <span style={{ fontSize: 28 }}>{b.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 10, opacity: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>{b.store}</div>
                <div style={{ fontSize: 18 }}>{b.name}</div>
              </div>
            </motion.a>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
          {[t('cta_free'), t('cta_nocard'), t('cta_offline'), t('cta_platforms')].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#64748b' }}>
              <span style={{ color: '#22c55e' }}>✓</span> {f}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
