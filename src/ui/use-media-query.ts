/**
 * WHAT: Subscribes to a CSS media query, so a component can render one thing or
 *       another rather than rendering both and hiding one.
 * WHY:  `desktop:hidden` is right when the two variants say the same thing — the
 *       nav and the rail. It is wrong when they differ: Home's categories are a
 *       ranked subset at 360 and a full table at 1440, and rendering both puts
 *       **two identical headings and eight duplicated rows** in one document,
 *       which `display: none` hides from the eye but not from the markup.
 * INTERVIEW: I reached for a media-query hook only where the two layouts carry
 *       different content, because CSS-hiding a duplicate is cheaper right up
 *       until the duplicate is a second copy of the page's own headings.
 */

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
