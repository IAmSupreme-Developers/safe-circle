'use client'
import { useRef } from 'react'
import Nav from './sections/Nav'
import Hero from './sections/Hero'
import Story from './sections/Story'
import Features from './sections/Features'
import HowItWorks from './sections/HowItWorks'
import Testimonials from './sections/Testimonials'
import CTA from './sections/CTA'
import Footer from './sections/Footer'

export default function Landing() {
  return (
    <main style={{ background: '#060b18' }}>
      <Nav />
      <Hero />
      <Story />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  )
}
