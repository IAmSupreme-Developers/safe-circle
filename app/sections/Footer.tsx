'use client'

export default function Footer() {
  return (
    <footer style={{ padding: '60px 6vw 40px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 48, marginBottom: 60 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#4F6EF7,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🛡️</div>
            <span style={{ fontWeight: 900, fontSize: 18 }}>Safe<span style={{ color: '#4F6EF7' }}>Circle</span></span>
          </div>
          <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>Community safety platform for families and neighbourhoods. Built with care.</p>
        </div>
        {[
          { title: 'Product', links: ['Features', 'How it works', 'Pricing', 'Changelog'] },
          { title: 'Community', links: ['Blog', 'Forum', 'Partners', 'Open Source'] },
          { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'] },
        ].map(col => (
          <div key={col.title}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 16, letterSpacing: 0.5 }}>{col.title}</p>
            {col.links.map(l => (
              <a key={l} href="#" style={{ display: 'block', fontSize: 13, color: '#475569', marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>{l}</a>
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <p style={{ color: '#334155', fontSize: 13 }}>© 2026 SafeCircle. Built for communities that care.</p>
        <div style={{ display: 'flex', gap: 16 }}>
          {['𝕏', 'in', 'f', '▶'].map((icon, i) => (
            <a key={i} href="#" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#64748b', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(79,110,247,0.15)'; (e.currentTarget as HTMLElement).style.color = '#4F6EF7' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#64748b' }}>
              {icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
