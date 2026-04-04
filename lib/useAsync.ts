import { useCallback, useEffect, useState } from 'react'

type State<T> = { data: T | null; loading: boolean; error: string | null }

/** Runs an async function, tracks loading/error state, re-runs when deps change */
export function useAsync<T>(
  fn: () => Promise<T>,
  deps: unknown[] = []
): State<T> & { reload: () => void } {
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: null })

  const run = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const data = await fn()
      setState({ data, loading: false, error: null })
    } catch (e: any) {
      setState({ data: null, loading: false, error: e?.message ?? 'Something went wrong' })
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { run() }, [run])

  return { ...state, reload: run }
}
