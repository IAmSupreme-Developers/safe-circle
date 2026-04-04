'use client'
import { createContext, useCallback, useContext, useState } from 'react'

type Toast = { id: number; message: string; type: 'error' | 'success' | 'info' }
type ToastCtx = { toast: (message: string, type?: Toast['type']) => void }

const ToastContext = createContext<ToastCtx>({ toast: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }, [])

  const colors = { error: 'var(--danger)', success: '#22c55e', info: 'var(--primary)' }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 left-4 right-4 z-[100] space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id}
            className="rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-lg animate-in slide-in-from-top-2"
            style={{ background: colors[t.type] }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
