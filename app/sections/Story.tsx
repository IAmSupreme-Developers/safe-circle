'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useThemeLang } from '../ThemeLangProvider'

const chapters = [
  {
    emoji: '😰',
    time: '6:47 PM',
    title: 'The call that changes everything.',
    body: `"She was supposed to be home by 5." Sarah's hands trembled as she dialled her daughter's number for the eighth time. No answer. The school said she left two hours ago. The streets were getting dark.`,
    color: '#ef4444',
    img: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&q=80',
  },
  {
    emoji: '📍',
    time: '6:52 PM',
    title: 'One tap. Her last location.',
    body: `Sarah opened SafeCircle. The map lit up — Emma's tracker had pinged 3 blocks from school at 5:12 PM, then went silent. She shared the location with the community instantly.`,
    color: '#4F6EF7',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
  },
  {
    emoji: '🤝',
    time: '7:04 PM',
    title: 'The community responds.',
    body: `Within minutes, 23 neighbours had seen the alert. A local shopkeeper replied: "I saw a girl matching that description near the park on Elm Street." The AI flagged it as a high-confidence sighting.`,
    color: '#22c55e',
    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
  },
  {
    emoji: '🏃',
    time: '7:19 PM',
    title: 'Search party, coordinated.',
    body: `Six volunteers launched a search party from the app. Each assigned a zone on the live map. Real-time check-ins. No overlap. No wasted time. Every street covered.`,
    color: '#f59e0b',
    img: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&q=80',
  },
  {
    emoji: '💙',
    time: '7:31 PM',
    title: 'Emma was found safe.',
    body: `She had twisted her ankle and sheltered in a doorway. A volunteer found her 800 metres from the last ping. Sarah marked the post resolved. The community celebrated. 44 minutes, start to finish.`,
    color: '#a855f7',
    img: 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=600&q=80',
  },
]

function Chapter({ chapter, index }: { chapter: typeof chapters[0]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: false, margin: '-30% 0px -30% 0px' })
  const isEven = index % 2 === 0

  return (
    <div ref={ref} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '80px 6vw', position: 'relative' }}>
      {/* Chapter number */}
      <div style={{ position: 'absolute', top: 60, left: '6vw', fontSize: 120, fontWeight: 900, color: 'rgba(255,255,255,0.02)', lineHeight: 1, userSelect: 'none', overflow: 'hidden', maxWidth: '100%' }}>
        {String(index + 1).padStart(2, '0')}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6vw', flexDirection: isEven ? 'row' : 'row-reverse', width: '100%', flexWrap: 'wrap' }}>
        {/* Image */}
        <motion.div style={{ flex: 1, minWidth: 280 }}
          initial={{ opacity: 0, x: isEven ? -60 : 60 }}
          animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: isEven ? -60 : 60 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}>
          <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', boxShadow: `0 24px 64px ${chapter.color}33` }}>
            <img src={chapter.img} alt="" style={{ width: '100%', height: 360, objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg,${chapter.color}22,transparent)` }} />
            {/* Time badge */}
            <div style={{ position: 'absolute', top: 20, left: 20, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', borderRadius: 999, padding: '6px 14px', fontSize: 13, fontWeight: 700, color: chapter.color, border: `1px solid ${chapter.color}44` }}>
              🕐 {chapter.time}
            </div>
          </div>
        </motion.div>

        {/* Text */}
        <motion.div style={{ flex: 1, minWidth: 280 }}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{chapter.emoji}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: chapter.color, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
            Chapter {index + 1}
          </div>
          <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 20, lineHeight: 1.2 }}>
            {chapter.title}
          </h2>
          <p style={{ fontSize: 17, color: '#94a3b8', lineHeight: 1.85, fontStyle: 'italic' }}>
            "{chapter.body}"
          </p>
          <div style={{ marginTop: 28, width: 48, height: 3, borderRadius: 2, background: `linear-gradient(90deg,${chapter.color},transparent)` }} />
        </motion.div>
      </div>
    </div>
  )
}

export default function Story() {
  const ref = useRef(null)
  const { t } = useThemeLang()
  const { scrollYProgress } = useScroll({ target: ref })
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <section id="story" ref={ref} style={{ position: 'relative', background: 'var(--bg)' }}>
      {/* Intro */}
      <div style={{ textAlign: 'center', padding: '100px 6vw 60px' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p style={{ color: '#4F6EF7', fontWeight: 700, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>{t('story_intro')}</p>
          <h2 style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 20 }}>
            44 minutes that changed<br />
            <span style={{ background: 'linear-gradient(135deg,#4F6EF7,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>everything for one family.</span>
          </h2>
          <p style={{ color: '#64748b', fontSize: 16, maxWidth: 520, margin: '0 auto' }}>
            This is Emma's story. Scroll to follow what happened — and how SafeCircle made the difference.
          </p>
        </motion.div>
      </div>

      {/* Timeline line */}
      <div style={{ position: 'absolute', left: '50%', top: 280, bottom: 0, width: 2, background: 'rgba(79,110,247,0.08)', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
        <motion.div style={{ width: '100%', background: 'linear-gradient(180deg,#4F6EF7,#a855f7)', height: lineHeight, transformOrigin: 'top' }} />
      </div>

      {chapters.map((c, i) => <Chapter key={i} chapter={c} index={i} />)}
    </section>
  )
}
