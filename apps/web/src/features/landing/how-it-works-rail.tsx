import { useEffect, useRef, useState } from 'react'
import { IconButton } from '@/ui/button'
import { Icon } from '@/ui/icon'
import { howItWorks } from './landing-copy'
import { useCarousel } from './use-carousel'

/**
 * The eight questions ADR-013 put on the page, as a rail that moves by itself.
 *
 * **Every card is in the markup, in order, from first paint** — `motion.md` §9's
 * second non-negotiable: the page must read completely with motion off, and
 * nothing may be gated behind an animation. The movement decides when a card
 * arrives, never whether it exists.
 *
 * The owner asked for it to advance rather than wait to be scrolled, which §9
 * allows: *the landing page is allowed to perform.* It stops for a pointer, for
 * focus, for a hidden tab, for reduced motion, and permanently for anyone who
 * reaches for an arrow — `use-carousel.ts` says why each.
 *
 * The scrollbar is hidden rather than the scroller replaced, so swipe, drag,
 * trackpad and keyboard all still work.
 */
export function HowItWorksRail() {
  const scroller = useRef<HTMLDivElement>(null)

  /**
   * §9.1's arrival: 40px from the right, 280ms each, 45ms apart, triggered once
   * when the band is reached — and never scroll-linked, because a section you
   * have to *operate* before it tells you anything is the opposite of what
   * these eight lines are for.
   *
   * The resting state is the default, so with no JavaScript, no observer or
   * motion off every card is already in place. The advance waits until the
   * eighth has landed; the two would otherwise fight over the same scroller.
   */
  const [entered, setEntered] = useState<'pending' | 'in'>(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return 'in'
    if (typeof window.matchMedia !== 'function') return 'in'
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'in' : 'pending'
  })
  const [armed, setArmed] = useState(false)
  const rail = useCarousel(scroller, armed)

  useEffect(() => {
    const el = scroller.current
    if (entered !== 'pending' || el === null) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setEntered('in')
      },
      { threshold: 0.2 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [entered])

  useEffect(() => {
    if (entered !== 'in') return
    const timer = window.setTimeout(() => setArmed(true), 700)
    return () => window.clearTimeout(timer)
  }, [entered])

  return (
    <section
      aria-labelledby="how-it-works"
      className="border-t border-line bg-bg px-24 py-44 desktop:px-150 desktop:py-96"
    >
      <div className="flex items-end justify-between gap-24">
        <div>
          <p className="mb-14 font-structural text-land-kicker uppercase text-soft">
            How it works
          </p>
          <h2
            id="how-it-works"
            className="max-w-[620px] font-voice text-land-h2-phone text-ink desktop:text-land-h2"
          >
            There is nothing to sign up for.
          </h2>
        </div>

        <div className="hidden shrink-0 gap-10 desktop:flex">
          <Arrow label="Previous" onClick={() => rail.step(-1)} surrender={rail.surrender} />
          <Arrow label="Next" onClick={() => rail.step(1)} surrender={rail.surrender} />
        </div>
      </div>

      <div
        ref={scroller}
        data-rail-enter={entered}
        className="rail-scroller -mx-24 mt-34 flex snap-x snap-mandatory gap-16 overflow-x-auto px-24 pb-8 desktop:-mr-150 desktop:ml-0 desktop:pl-0 desktop:pr-150"
      >
        <div className="flex gap-16">
          {howItWorks.map((item) => (
            <article
              key={item.n}
              className="rail-card flex w-[258px] shrink-0 snap-start flex-col rounded-lg border border-line bg-card p-18"
            >
              <p className="font-data text-[10px] uppercase tracking-[0.14em] text-faint">
                {item.n}
              </p>
              <h3 className="mt-14 font-structural text-[14px] leading-[21px] text-soft">
                {item.q}
              </h3>
              <p className="mt-8 font-structural text-[17.5px] leading-[27px] text-ink">
                <b className="font-semibold">{item.a}</b>
                {item.detail === '' ? null : ` ${item.detail}`}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Arrow({
  label,
  onClick,
  surrender,
}: {
  label: string
  onClick: () => void
  surrender: () => void
}) {
  return (
    <IconButton
      label={label}
      className="h-40 w-40 rounded-full"
      onClick={() => {
        // Reaching for an arrow is taking control, and it is permanent: a page
        // that snatches it back is worse than one that never moved.
        surrender()
        onClick()
      }}
    >
      {/* One chevron, mirrored — the icon set has a single direction, and a
          second asset for the same shape is how two of them drift apart. */}
      <Icon name="chevron" className={label === 'Previous' ? 'rotate-180' : undefined} />
    </IconButton>
  )
}
