import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SafeCircle — Keep Your Loved Ones Safe',
  description: 'Real-time GPS tracking, community alerts, and AI-powered safety for families.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
