'use client'
import { motion, useInView } from 'framer-motion'
import { useThemeLang } from '../ThemeLangProvider'
import { useContent } from '../content/useContent'
import { useRef } from 'react'

export default function HowItWorks() {
  const { t } = useThemeLang()
  const { steps } = useContent()
  return (
    <section id="how-it-works" style={{ padding: '120px 6vw' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 80 }}>
        <p style={{ color: '#4F6EF7', fontWeight: 700, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14 }}>{t('how_label')}</p>
        <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-1px' }}>{t('how_headline')}</h2>
      </motion.div>

      <div style={{ position: 'relative' }}>
        {/* Connecting line — hidden on mobile */}
        <div className="timeline-line" style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: 'rgba(79,110,247,0.1)', transform: 'translateX(-50%)' }} />

        {steps.map((s, i) => {
          const ref = useRef(null)
          const inView = useInView(ref, { once: true, margin: '-20% 0px' })
          const isLeft = i % 2 === 0
          return (
            <div key={s.n} ref={ref} style={{ display: 'flex', justifyContent: isLeft ? 'flex-start' : 'flex-end', marginBottom: 64, position: 'relative' }}>
              {/* Center dot */}
              <motion.div initial={{ scale: 0 }} animate={inView ? { scale: 1 } : { scale: 0 }}
                style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 16, height: 16, borderRadius: '50%', background: s.color, boxShadow: `0 0 20px ${s.color}88`, zIndex: 2 }} />

              <motion.div initial={{ opacity: 0, x: isLeft ? -50 : 50 }} animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                style={{ width: '44%', background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)', borderRadius: 20, padding: '28px 32px' }}
              className="timeline-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `${s.color}18`, border: `1px solid ${s.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: 11, color: s.color, fontWeight: 700, letterSpacing: 2 }}>STEP {s.n}</div>
                    <div style={{ fontSize: 17, fontWeight: 700 }}>{s.title}</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.75 }}>{s.desc}</p>
              </motion.div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
