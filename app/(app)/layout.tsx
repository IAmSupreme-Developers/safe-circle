'use client'
import { useAuth } from '../components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import BottomNav from '../components/BottomNav'
import AIAssistant from '../components/AIAssistant'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  if (loading || !user) return null

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <main className="flex-1">{children}</main>
      <BottomNav />
      <AIAssistant />
    </div>
  )
}
