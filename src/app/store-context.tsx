/**
 * WHAT: The one snapshot store, made available to React, and the hooks that
 *       read it.
 * WHY:  The store is deliberately framework-free vanilla Zustand (T8), so it
 *       can be tested without React and reused by the Expo app at v2. This file
 *       is the only place the two are joined.
 * INTERVIEW: I kept the store outside React and bound it in one file, so the
 *       state logic is testable with plain values and portable to another
 *       renderer.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useStore } from 'zustand'
import type { createSnapshotStore, SnapshotState, SnapshotStore } from '@/store/snapshot-store'

type StoreBundle = ReturnType<typeof createSnapshotStore>

/**
 * Context, not a module-level singleton.
 *
 * B5 says context is for stable, rarely-changing values, and the bundle is
 * created once and never replaced — what changes is the state *inside* it,
 * which components subscribe to individually rather than re-rendering on.
 */
const StoreContext = createContext<StoreBundle | undefined>(undefined)

export function StoreProvider({
  bundle,
  children,
}: {
  bundle: StoreBundle
  children: ReactNode
}) {
  useEffect(() => {
    void bundle.api.initialise()
    return () => bundle.api.dispose()
  }, [bundle])

  return <StoreContext.Provider value={bundle}>{children}</StoreContext.Provider>
}

function useBundle(): StoreBundle {
  const bundle = useContext(StoreContext)
  if (!bundle) throw new Error('StoreProvider is missing above this component.')
  return bundle
}

/** The current state, subscribed. Re-renders only when the state object changes. */
export function useSnapshotState(): SnapshotState {
  const bundle = useBundle()
  return useStore(bundle.store, (s) => s.state)
}

/** The actions, which never change identity, so they are safe in a dependency list. */
export function useSnapshotActions(): SnapshotStore {
  return useBundle().api
}

/**
 * Whether the browser thinks it is online.
 *
 * Kept here rather than in a component because the shell and any screen that
 * cares read the same answer, and two listeners would be two chances to
 * disagree.
 */
export function useIsOnline(): boolean {
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  )

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return online
}
