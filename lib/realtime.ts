import { useEffect, useRef } from 'react'
import { supabase } from './supabase'
import type { Tracker } from './types'

/** Subscribes to live tracker location updates for the given owner.
 *  Calls onUpdate whenever any tracker row changes. */
export function useTrackerRealtime(ownerId: string | undefined, onUpdate: (t: Tracker) => void) {
  const cbRef = useRef(onUpdate)
  cbRef.current = onUpdate

  useEffect(() => {
    if (!ownerId) return

    const channel = supabase
      .channel(`trackers:${ownerId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'trackers', filter: `owner_id=eq.${ownerId}` },
        (payload) => cbRef.current(payload.new as Tracker)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [ownerId])
}
