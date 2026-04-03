import type { Post } from './types'

// --- Onboarding slides ---
export const ONBOARDING_SLIDES = [
  {
    img: '/img/onboarding1.png',
    title: 'Mutual Support',
    body: 'millions of trusted users world wide. our solutions are the possible nearest thing you ever want or wish for.',
  },
  {
    img: '/img/onboarding2.png',
    title: 'Community Based',
    body: 'we are reachable by both the community and any other party who seeks our help and guidance.',
  },
  {
    img: '/img/onboarding3.png',
    title: 'Quick Analysis',
    body: 'instant quick analysis are made on spot as soon as you start our services.',
  },
] as const

// --- Dashboard quick access cards ---
export const QUICK_ACCESS_CARDS = [
  {
    img: '/img/illustration_of_woman_character_with_phone.png',
    tag: 'Report a missing person',
    title: 'Report a missing person',
    body: 'reporting a missing person helps other find solutions quicker',
    href: '/feeds',
  },
  {
    img: '/img/home2.png',
    tag: 'Find a missing person',
    title: 'Find a missing person',
    body: 'Let us dive deep into all the different possibilities',
    href: '/feeds',
  },
] as const

// --- Dashboard static stats (non-dynamic) ---
export const STATIC_STATS = [
  { value: '99%', label: 'Success Rate' },
  { value: '24/7', label: 'Monitoring'  },
] as const
