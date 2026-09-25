import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { Instant, IsoDate } from '@mizaniya/core/types'

export interface Today {
  /** The calendar day, `YYYY-MM-DD`. */
  now: IsoDate
  /** The instant, for stamping records. */
  at: Instant
}

const TodayContext = createContext<Today | undefined>(undefined)

/**
 * Reads the clock once.
 *
 * Deliberately not reactive: a cycle boundary crossing while the app is open is
 * rare, and a date that changes under a screen mid-interaction is worse than a
 * stale one that a reload corrects.
 */
export function TodayProvider({ now, at, children }: Partial<Today> & { children: ReactNode }) {
  const value = useMemo<Today>(() => {
    const stamp = at ?? (new Date().toISOString() as Instant)
    return { now: now ?? (stamp.slice(0, 10) as IsoDate), at: stamp }
  }, [now, at])

  return <TodayContext.Provider value={value}>{children}</TodayContext.Provider>
}

export function useToday(): Today {
  const today = useContext(TodayContext)
  if (!today) throw new Error('TodayProvider is missing above this component.')
  return today
}
