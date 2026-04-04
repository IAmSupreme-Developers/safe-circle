'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const steps = [
  { n: '01', icon: '📲', title: 'Download & Sign Up', desc: 'Create your account in 60 seconds with email or Google. Your profile is ready instantly.', color: '#4F6EF7' },
  { n: '02', icon: '📡', title: 'Register a Tracker', desc: 'Enter your device ID and pairing code. The GPS tracker is linked to your account immediately.', color: '#a855f7' },
  { n: '03', icon: '🗺️', title: 'Draw Safe Zones', desc: 'Tap the map to place zones around home, school, work. Set alert severity per zone.', color: '#22c55e' },
  { n: '04', icon: '👥', title: 'Join the Community', desc: 'Connect with neighbours. Post alerts, respond to sightings, coordinate search parties.', color: '#f59e0b' },
  { n: '05', icon: '🤖', title: 'Let AI Help', desc: 'Ask your AI assistant anything about your data. Get smart summaries and action suggestions.', color: '#ef4444' },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: '120px 6vw' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 80 }}>
        <p style={{ color: '#4F6EF7', fontWeight: 700, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14 }}>Simple by design</p>
        <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-1px' }}>Up and running in minutes</h2>
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
