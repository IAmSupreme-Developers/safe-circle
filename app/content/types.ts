export type FooterColumn = { title: string; links: { label: string; href: string }[] }
export type Feature = { icon: string; title: string; desc: string; color: string; img: string }
export type Step = { n: string; icon: string; title: string; desc: string; color: string }
export type NavLink = { label: string; section: string }

export type Content = {
  navLinks: NavLink[]
  chapters: Chapter[]
  features: Feature[]
  steps: Step[]
  footerColumns: FooterColumn[]
}
