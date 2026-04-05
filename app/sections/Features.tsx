'use client'
import { motion } from 'framer-motion'
import { useThemeLang } from '../ThemeLangProvider'
import { useContent } from '../content/useContent'

export default function Features() {
  const { t } = useThemeLang()
  const { features } = useContent()
  return (
    <section id="features" style={{ padding: '120px 6vw', background: 'var(--bg-section)' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 72 }}>
        <p style={{ color: '#4F6EF7', fontWeight: 700, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14 }}>{t('features_label')}</p>
        <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-1px' }}>{t('features_headline')}</h2>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24 }}>
        {features.map((f, i) => (
          <motion.div key={f.title}
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)', borderRadius: 24, overflow: 'hidden', cursor: 'default' }}>
            <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
              <img src={f.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} />
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg,transparent 40%,#060b18)` }} />
              <div style={{ position: 'absolute', bottom: 16, left: 20, fontSize: 32 }}>{f.icon}</div>
            </div>
            <div style={{ padding: '20px 24px 28px' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#f1f5f9' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.75 }}>{f.desc}</p>
              <div style={{ marginTop: 20, height: 2, width: 40, borderRadius: 2, background: f.color }} />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
