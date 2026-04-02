'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type AuthCtx = { user: User | null; token: string | null; loading: boolean }
const AuthContext = createContext<AuthCtx>({ user: null, token: null, loading: true })

async function ensureProfile(user: User) {
  const { data } = await supabase.from('profiles').select('id').eq('id', user.id).single()
  if (!data) {
    await supabase.from('profiles').insert({
      id: user.id,
      full_name: user.user_metadata?.full_name ?? user.email ?? '',
    })
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ctx, setCtx] = useState<AuthCtx>({ user: null, token: null, loading: true })

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null
      const t = data.session?.access_token ?? null
      setCtx({ user: u, token: t, loading: false })
      if (u) ensureProfile(u)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const u = session?.user ?? null
      const t = session?.access_token ?? null
      setCtx({ user: u, token: t, loading: false })
      if (u) ensureProfile(u)
    })

    return () => subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={ctx}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
