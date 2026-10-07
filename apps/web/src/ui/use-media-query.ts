import { useCallback, useSyncExternalStore } from 'react'

export function useMediaQuery(query: string): boolean {
  // `useSyncExternalStore` re-reads the snapshot straight after subscribing, which
  // is what the previous `setMatches` in an effect was hand-rolling: the width can
  // change between the first read and the subscription, and a stale `false` there
  // is a whole layout out of date.
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {}

      const list = window.matchMedia(query)
      list.addEventListener('change', onStoreChange)
      return () => list.removeEventListener('change', onStoreChange)
    },
    [query],
  )

  const getSnapshot = useCallback(() => read(query), [query])

  return useSyncExternalStore(subscribe, getSnapshot)
}

/**
 * Read synchronously, so the first paint is already right — a hook that starts
 * `false` and corrects itself shows the wrong layout for one frame.
 *
 * **Without `matchMedia` this answers `true`.** That is jsdom, not a browser:
 * every browser this app supports has it. Defaulting to the wide layout there
 * keeps a test that renders a component getting the fuller of the two, which is
 * the one with more to assert against.
 */
function read(query: string): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return true
  return window.matchMedia(query).matches
}

/** The one breakpoint the design defines (`tailwind.config.ts`). */
export const DESKTOP = '(min-width: 1440px)'
