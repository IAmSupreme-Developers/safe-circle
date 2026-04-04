'use client'
import { motion } from 'framer-motion'

const features = [
  { icon: '📍', title: 'Live GPS Tracking', desc: 'Real-time location updates every 30 seconds. See exactly where your loved ones are on a live map.', color: '#4F6EF7', img: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80' },
  { icon: '🔔', title: 'Smart Zone Alerts', desc: 'Draw safe zones on a map. Get instant alerts the moment someone enters or leaves — with configurable severity.', color: '#22c55e', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80' },
  { icon: '🤖', title: 'AI Assistant', desc: 'Ask in plain language: "Is Ana safe?" or "Any sightings near me?" — AI answers from your live data instantly.', color: '#a855f7', img: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&q=80' },
  { icon: '🤝', title: 'Community Feeds', desc: 'Post missing person alerts, sightings, and updates. AI auto-categorises every post for fast discovery.', color: '#f59e0b', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80' },
  { icon: '🗺️', title: 'Search Party', desc: 'Coordinate volunteers with live maps, zone assignments, and real-time check-ins. No overlap, no wasted effort.', color: '#ef4444', img: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&q=80' },
  { icon: '🔒', title: 'Privacy by Design', desc: 'Your tracker data is yours alone. Row-level security means no other user can ever see your device locations.', color: '#06b6d4', img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&q=80' },
]

export default function Features() {
  return (
    <section id="features" style={{ padding: '120px 6vw', background: 'var(--bg-section)' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 72 }}>
        <p style={{ color: '#4F6EF7', fontWeight: 700, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14 }}>Everything you need</p>
        <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-1px' }}>Built for real emergencies</h2>
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
