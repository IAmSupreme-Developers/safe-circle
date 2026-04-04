'use client'
import { Component, type ReactNode } from 'react'

export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null }

  static getDerivedStateFromError(error: Error) { return { error } }

  render() {
    if (this.state.error) return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] px-6 text-center gap-3">
        <p className="text-2xl">⚠️</p>
        <p className="font-semibold">Something went wrong</p>
        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
          {(this.state.error as Error).message}
        </p>
        <button onClick={() => this.setState({ error: null })}
          className="rounded-full px-4 py-2 text-sm font-semibold"
          style={{ background: 'var(--primary)', color: '#fff' }}>
          Try again
        </button>
      </div>
    )
    return this.props.children
  }
}
