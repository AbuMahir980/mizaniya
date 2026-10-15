import { useEffect, useRef, useState } from 'react'
import { howItWorks } from './landing-copy'

/**
 * `motion.md` §9.1 — 45ms between cards, so the eighth lands at about 600ms.
 * Static classes rather than a computed style, because F1 bans inline style
 * objects and eight known delays do not need to be computed.
 */
const DELAY = [
  'delay-0',
  'delay-[45ms]',
  'delay-[90ms]',
  'delay-[135ms]',
  'delay-[180ms]',
  'delay-[225ms]',
  'delay-[270ms]',
  'delay-[315ms]',
]

/**
 * The eight questions ADR-013 put on the page, as a horizontal rail.
 *
 * **Triggered, never scroll-linked** (§9.1). Tying the cards to scroll position
 * would make the section something a visitor has to operate before it tells them
 * anything, and these are the product's strongest claim: someone who scrolls past
 * quickly must still have read them.
 *
 * So the resting state is the default. The offset is applied on mount, and only
 * when motion is allowed; with no JavaScript, or with motion off, all eight are in
 * place from first paint and the rail still drags.
 */
export function HowItWorksRail() {
  const band = useRef<HTMLDivElement>(null)

  /**
   * Decided once, during the first render, rather than in an effect that
   * corrects itself afterwards — `set-state-in-effect` is right to refuse that,
   * and the correction would also be a frame where the cards had already
   * settled before sliding aside to arrive.
   *
   * Only two things earn the offset: motion is allowed, and there is an
   * observer to end it with. Without either, the cards are simply where they
   * belong, which is the behaviour §9.1 asks for anyway.
   */
  const [entered, setEntered] = useState<'pending' | 'in'>(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return 'in'
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'in' : 'pending'
  })

  useEffect(() => {
    const element = band.current
    if (entered !== 'pending' || element === null) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setEntered('in')
      },
      { threshold: 0.2 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [entered])

  return (
    <section aria-labelledby="how-it-works" className="flex flex-col gap-16 border-t border-line px-24 py-44 desktop:px-150 desktop:py-96">
      <p className="font-structural text-lab uppercase text-soft">How it works</p>
      <h2 id="how-it-works" className="font-voice text-title text-ink">
        There is nothing to sign up for.
      </h2>

      <div
        ref={band}
        data-rail-enter={entered}
        className="-mx-24 mt-34 flex snap-x snap-mandatory gap-16 overflow-x-auto px-24 pb-8 desktop:-mr-150 desktop:ml-0 desktop:pl-0 desktop:pr-150"
      >
        {howItWorks.map((item, index) => (
          <article
            key={item.n}
            className={`rail-card w-[16rem] shrink-0 snap-start rounded-card border border-hair bg-card p-16 ${DELAY[index]}`}
          >
            <p className="font-data text-lab text-faint">{item.n}</p>
            <h3 className="mt-8 font-structural text-body text-soft">{item.q}</h3>
            <p className="mt-4 font-structural text-body text-ink">{item.a}</p>
            {item.detail === '' ? null : (
              <p className="mt-2 font-structural text-small text-soft">{item.detail}</p>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
