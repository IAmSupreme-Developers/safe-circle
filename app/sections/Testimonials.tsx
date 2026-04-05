'use client'
import { motion } from 'framer-motion'
import { useThemeLang } from '../ThemeLangProvider'

const testimonials = [
  { name: 'Amara O.', role: 'Mother of 3, Lagos', avatar: 'https://i.pravatar.cc/80?img=47', text: 'My son wandered off at a market. Within 8 minutes of posting, three people had spotted him. SafeCircle is not just an app — it\'s a lifeline.', stars: 5 },
  { name: 'David K.', role: 'Community Leader, Accra', avatar: 'https://i.pravatar.cc/80?img=12', text: 'We used the search party feature to find a missing elderly man in our neighbourhood. The zone coordination was incredible. Found him in 20 minutes.', stars: 5 },
  { name: 'Fatima B.', role: 'Parent, Abuja', avatar: 'https://i.pravatar.cc/80?img=32', text: 'The safe zone alerts give me peace of mind every school day. I know the moment my daughter arrives and leaves. No more anxious waiting.', stars: 5 },
  { name: 'James T.', role: 'School Principal, Nairobi', avatar: 'https://i.pravatar.cc/80?img=15', text: 'We set up SafeCircle for our entire school community. Parents feel connected and informed. The AI assistant answers questions I didn\'t even think to ask.', stars: 5 },
  { name: 'Ngozi A.', role: 'Nurse & Mother, Port Harcourt', avatar: 'https://i.pravatar.cc/80?img=44', text: 'Working night shifts, I used to worry constantly. Now I check the app and see my kids are home safe. It\'s changed my relationship with work stress entirely.', stars: 5 },
  { name: 'Emmanuel C.', role: 'Tech Dad, Kigali', avatar: 'https://i.pravatar.cc/80?img=8', text: 'The AI assistant is genuinely impressive. I asked "has anyone seen my daughter near school today?" and it pulled relevant community posts instantly.', stars: 5 },
]

export default function Testimonials() {
  const { t } = useThemeLang()
  return (
    <section id="community" style={{ padding: '120px 6vw', background: 'var(--bg-section)', overflow: 'hidden' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 72 }}>
        <p style={{ color: '#4F6EF7', fontWeight: 700, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14 }}>{t('test_label')}</p>
        <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-1px' }}>{t('test_headline')}</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 40 }}>
          {[['10,000+', 'Families'], ['50,000+', 'Alerts sent'], ['98%', 'Cases resolved'], ['< 30s', 'Alert speed']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, background: 'linear-gradient(135deg,#4F6EF7,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{v}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Scrolling testimonials */}
      <div style={{ display: 'flex', gap: 20, overflow: 'hidden', width: '100%' }}>
        <motion.div animate={{ x: [0, -1800] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
          {[...testimonials, ...testimonials].map((t, i) => (
            <div key={i} style={{ width: 320, flexShrink: 0, background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)', borderRadius: 20, padding: '24px 24px 28px' }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                {'★★★★★'.split('').map((s, j) => <span key={j} style={{ color: '#f59e0b', fontSize: 14 }}>{s}</span>)}
              </div>
              <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.75, marginBottom: 20, fontStyle: 'italic' }}>"{t.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={t.avatar} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
