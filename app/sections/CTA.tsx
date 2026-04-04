'use client'
import { motion } from 'framer-motion'

export default function CTA() {
  return (
    <section id="download" style={{ padding: '140px 6vw', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 50%,rgba(79,110,247,0.12),transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(79,110,247,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(79,110,247,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 72, marginBottom: 24, filter: 'drop-shadow(0 0 40px rgba(79,110,247,0.6))' }}>🛡️</div>
        <h2 style={{ fontSize: 'clamp(2.2rem,5vw,4rem)', fontWeight: 900, letterSpacing: '-2px', marginBottom: 20, lineHeight: 1.1 }}>
          Your family deserves<br />
          <span style={{ background: 'linear-gradient(135deg,#4F6EF7,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>to feel safe.</span>
        </h2>
        <p style={{ fontSize: 18, color: '#64748b', marginBottom: 56, maxWidth: 480, margin: '0 auto 56px', lineHeight: 1.7 }}>
          Join 10,000+ families already using SafeCircle. Free to download. No subscription to get started.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
          {[
            { icon: '🤖', store: 'Get it on', name: 'Google Play' },
            { icon: '🍎', store: 'Download on the', name: 'App Store' },
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
          {['Free to download', 'No credit card required', 'Works offline', 'iOS & Android'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#64748b' }}>
              <span style={{ color: '#22c55e' }}>✓</span> {f}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
