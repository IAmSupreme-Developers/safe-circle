import type { Content } from './types'

const en: Content = {
  navLinks: [
    { label: 'Features', section: 'features' },
    { label: 'Story', section: 'story' },
    { label: 'How it works', section: 'how-it-works' },
    { label: 'Community', section: 'community' },
  ],
  chapters: [
    { emoji: '😰', time: '6:47 PM', title: 'The call that changes everything.', body: 'She was supposed to be home by 5. Sarah\'s hands trembled as she dialled her daughter\'s number for the eighth time. No answer. The school said she left two hours ago. The streets were getting dark.', color: '#ef4444', img: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&q=80' },
    { emoji: '📍', time: '6:52 PM', title: 'One tap. Her last location.', body: 'Sarah opened SafeCircle. The map lit up — Emma\'s tracker had pinged 3 blocks from school at 5:12 PM, then went silent. She shared the location with the community instantly.', color: '#4F6EF7', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80' },
    { emoji: '🤝', time: '7:04 PM', title: 'The community responds.', body: 'Within minutes, 23 neighbours had seen the alert. A local shopkeeper replied: "I saw a girl matching that description near the park on Elm Street." The AI flagged it as a high-confidence sighting.', color: '#22c55e', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80' },
    { emoji: '🏃', time: '7:19 PM', title: 'Search party, coordinated.', body: 'Six volunteers launched a search party from the app. Each assigned a zone on the live map. Real-time check-ins. No overlap. No wasted time. Every street covered.', color: '#f59e0b', img: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&q=80' },
    { emoji: '💙', time: '7:31 PM', title: 'Emma was found safe.', body: 'She had twisted her ankle and sheltered in a doorway. A volunteer found her 800 metres from the last ping. Sarah marked the post resolved. The community celebrated. 44 minutes, start to finish.', color: '#a855f7', img: 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=600&q=80' },
  ],
  features: [
    { icon: '📍', title: 'Live GPS Tracking', desc: 'Real-time location updates every 30 seconds. See exactly where your loved ones are on a live map.', color: '#4F6EF7', img: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80' },
    { icon: '🔔', title: 'Smart Zone Alerts', desc: 'Draw safe zones on a map. Get instant alerts the moment someone enters or leaves — with configurable severity.', color: '#22c55e', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80' },
    { icon: '🤖', title: 'AI Assistant', desc: 'Ask in plain language: "Is Ana safe?" or "Any sightings near me?" — AI answers from your live data instantly.', color: '#a855f7', img: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&q=80' },
    { icon: '🤝', title: 'Community Feeds', desc: 'Post missing person alerts, sightings, and updates. AI auto-categorises every post for fast discovery.', color: '#f59e0b', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80' },
    { icon: '🗺️', title: 'Search Party', desc: 'Coordinate volunteers with live maps, zone assignments, and real-time check-ins. No overlap, no wasted effort.', color: '#ef4444', img: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&q=80' },
    { icon: '🔒', title: 'Privacy by Design', desc: 'Your tracker data is yours alone. Row-level security means no other user can ever see your device locations.', color: '#06b6d4', img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&q=80' },
  ],
  steps: [
    { n: '01', icon: '📲', title: 'Download & Sign Up', desc: 'Create your account in 60 seconds with email or Google. Your profile is ready instantly.', color: '#4F6EF7' },
    { n: '02', icon: '📡', title: 'Register a Tracker', desc: 'Enter your device ID and pairing code. The GPS tracker is linked to your account immediately.', color: '#a855f7' },
    { n: '03', icon: '🗺️', title: 'Draw Safe Zones', desc: 'Tap the map to place zones around home, school, work. Set alert severity per zone.', color: '#22c55e' },
    { n: '04', icon: '👥', title: 'Join the Community', desc: 'Connect with neighbours. Post alerts, respond to sightings, coordinate search parties.', color: '#f59e0b' },
    { n: '05', icon: '🤖', title: 'Let AI Help', desc: 'Ask your AI assistant anything about your data. Get smart summaries and action suggestions.', color: '#ef4444' },
  ],
  footerColumns: [
    { title: 'Product', links: [{ label: 'Features', href: '#features' }, { label: 'How it works', href: '#how-it-works' }, { label: 'Pricing', href: '#' }, { label: 'Changelog', href: '#' }] },
    { title: 'Community', links: [{ label: 'Blog', href: '#' }, { label: 'Forum', href: '#' }, { label: 'Partners', href: '#' }, { label: 'Open Source', href: 'https://github.com' }] },
    { title: 'Legal', links: [{ label: 'Privacy Policy', href: '#' }, { label: 'Terms of Service', href: '#' }, { label: 'Cookie Policy', href: '#' }, { label: 'GDPR', href: '#' }] },
  ],
}

export default en
