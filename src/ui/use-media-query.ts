import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => read(query))

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const list = window.matchMedia(query)
    // Read again on mount: the width may have changed between the initialiser
    // and the effect, and a stale `false` here is a whole layout out of date.
    setMatches(list.matches)

    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
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
