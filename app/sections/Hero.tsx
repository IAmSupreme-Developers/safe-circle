'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <section ref={ref} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '0 6vw' }}>
      {/* Animated background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(79,110,247,0.15),transparent 65%)', animation: 'float1 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(168,85,247,0.12),transparent 65%)', animation: 'float2 10s ease-in-out infinite' }} />
        {/* Grid lines */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(79,110,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,110,247,0.04) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <motion.div style={{ y, opacity, textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: 860 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(79,110,247,0.1)', border: '1px solid rgba(79,110,247,0.25)', borderRadius: 999, padding: '7px 18px', fontSize: 13, color: '#818cf8', marginBottom: 32 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4F6EF7', display: 'inline-block', animation: 'ping 1.5s ease-in-out infinite' }} />
          Trusted by 10,000+ families worldwide
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8 }}
          style={{ fontSize: 'clamp(2.8rem,6vw,5rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-2px', marginBottom: 28 }}>
          When every second<br />
          <span style={{ background: 'linear-gradient(135deg,#4F6EF7 30%,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>matters most.</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ fontSize: 'clamp(1rem,2vw,1.25rem)', color: '#94a3b8', lineHeight: 1.75, marginBottom: 48, maxWidth: 580, margin: '0 auto 48px' }}>
          SafeCircle combines real-time GPS tracking, community-powered alerts, and AI assistance — so you're never alone when someone you love needs help.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
          style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 80 }}>
          <a href="#download" style={{ background: 'linear-gradient(135deg,#4F6EF7,#7c3aed)', color: '#fff', padding: '18px 44px', borderRadius: 999, fontSize: 16, fontWeight: 700, boxShadow: '0 8px 40px rgba(79,110,247,0.45)', display: 'inline-block' }}>
            Download Free →
          </a>
          <a href="#story" style={{ color: '#94a3b8', padding: '18px 32px', borderRadius: 999, fontSize: 15, fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)', display: 'inline-block' }}>
            ▶ Watch the story
          </a>
        </motion.div>

        {/* Phone mockup */}
        <motion.div initial={{ opacity: 0, y: 60, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.8, duration: 1, type: 'spring' }}
          style={{ position: 'relative', display: 'inline-block' }}>
          <div style={{ position: 'absolute', inset: -40, borderRadius: '50%', background: 'radial-gradient(circle,rgba(79,110,247,0.2),transparent 65%)' }} />
          <img src="/img/onboarding1.png" alt="App" style={{ width: 'min(340px,70vw)', filter: 'drop-shadow(0 32px 64px rgba(79,110,247,0.4))', position: 'relative', animation: 'float1 6s ease-in-out infinite' }} />
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#334155', fontSize: 12 }}>
        <span>Scroll to explore</span>
        <div style={{ width: 1, height: 48, background: 'linear-gradient(#4F6EF7,transparent)', animation: 'scrollLine 2s ease-in-out infinite' }} />
      </motion.div>

      <style>{`
        @keyframes float1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(14px)} }
        @keyframes ping { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.5)} }
        @keyframes scrollLine { 0%{opacity:0;transform:scaleY(0);transform-origin:top} 50%{opacity:1;transform:scaleY(1)} 100%{opacity:0;transform:scaleY(1);transform-origin:bottom} }
      `}</style>
    </section>
  )
}
