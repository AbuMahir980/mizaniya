import { useCallback, useEffect, useState } from 'react'

/**
 * A rail that advances on its own, and stops the moment somebody takes over.
 *
 * `motion.md` §9 lets the landing page perform, and binds it to two things:
 * money is never animated into existence, and **the page must read completely
 * with motion off**. So this moves a real scroller rather than replacing it —
 * every card stays in the markup, in order, reachable by swipe, drag, keyboard
 * and the arrows whether or not a single frame ever runs.
 *
 * It stops for the four reasons an auto-advancing rail is usually hostile:
 *
 * - **Reduced motion** — it never starts. A rail that rearranges itself
 *   unprompted is exactly what that setting is for.
 * - **A pointer over it, or focus inside it** — somebody is reading or tabbing.
 * - **A hidden tab** — nothing should animate to an empty room.
 * - **Any deliberate move** — an arrow, a drag, a key. Taking control is
 *   permanent, because having the page snatch it back is worse than it never
 *   moving at all.
 */
export interface Carousel {
  /** Step by one card. Also ends the automatic advance, as any deliberate move does. */
  step: (direction: 1 | -1) => void
  /** Stops the advance for good — bind to whatever counts as taking control. */
  surrender: () => void
  /** Whether the rail is currently moving by itself, for the pause affordance. */
  running: boolean
}

export function useCarousel(
  ref: React.RefObject<HTMLDivElement | null>,
  /** Held until the cards have finished arriving — §9.1's stagger lands at ~600ms. */
  armed: boolean,
  hold = 4500,
): Carousel {
  const [taken, setTaken] = useState(false)
  const [resting, setResting] = useState(false)

  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  const surrender = useCallback(() => setTaken(true), [])

  const step = useCallback(
    (direction: 1 | -1) => {
      const el = ref.current
      if (el === null) return
      const card = el.firstElementChild?.firstElementChild as HTMLElement | undefined
      // One card plus its gap, measured rather than assumed, so a change to the
      // card width in the design cannot silently desynchronise the step.
      const by = card === undefined ? el.clientWidth : card.getBoundingClientRect().width + 16
      const end = el.scrollWidth - el.clientWidth
      const next = el.scrollLeft + by * direction
      el.scrollTo({ left: next > end - 1 ? 0 : Math.max(0, next), behavior: 'smooth' })
    },
    [ref],
  )

  const running = armed && !reduced && !taken && !resting

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => step(1), hold)
    return () => window.clearInterval(timer)
  }, [running, hold, step])

  useEffect(() => {
    const onHidden = () => setResting(document.visibilityState === 'hidden')
    document.addEventListener('visibilitychange', onHidden)
    return () => document.removeEventListener('visibilitychange', onHidden)
  }, [])

  useEffect(() => {
      const el = ref.current
      if (el === null) return
    const rest = () => setResting(true)
    const wake = () => setResting(false)
    el.addEventListener('pointerenter', rest)
    el.addEventListener('pointerleave', wake)
    el.addEventListener('focusin', rest)
    el.addEventListener('focusout', wake)
    return () => {
      el.removeEventListener('pointerenter', rest)
      el.removeEventListener('pointerleave', wake)
      el.removeEventListener('focusin', rest)
      el.removeEventListener('focusout', wake)
    }
  }, [ref])

  return { step, surrender, running }
}
