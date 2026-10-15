import { useEffect, useState } from 'react'
import homeDark from '@/assets/shots/home-dark.jpg'
import homeLight from '@/assets/shots/home-light.jpg'
import { figures } from './landing-copy'

/**
 * The cascade: five components, the hero whole in front and four behind it,
 * each showing its own label and figure at rest.
 *
 * **"Hover reveals nothing."** That is the constraint from the pointer-states
 * study, and it is §5 inherited by §9 — the page must read completely with
 * motion off, and a touch device has no pointer at all. So a card behind is
 * never a mystery: it already says what it is and what it holds. Hovering gives
 * you the rest of a card you could already identify.
 *
 * The owner asked for it to cycle rather than wait to be pointed at, which §9
 * permits — the landing page is allowed to perform. The cycle obeys the same
 * four stops as the rail, and under reduced motion it does not run at all.
 */
const BEHIND = [
  { label: 'Daily spend', figure: figures.safeToSpend, note: 'a day, 20 days left' },
  { label: 'Rent fund', figure: figures.rentSaved, note: `of ${figures.rentTarget}` },
  { label: 'Where your money is', figure: figures.cashLeft, note: 'cash left' },
  { label: 'Needs attention', figure: '2 of 8', note: 'worst first' },
]

/** The board's insets, at each width: 390 steps by 9, 1440 by 16. */
const INSET = [
  'bottom-36 left-36 right-36 desktop:bottom-56 desktop:left-64 desktop:right-64',
  'bottom-26 left-26 right-26 desktop:bottom-42 desktop:left-48 desktop:right-48',
  'bottom-18 left-18 right-18 desktop:bottom-28 desktop:left-32 desktop:right-32',
  'bottom-8 left-8 right-8 desktop:bottom-14 desktop:left-16 desktop:right-16',
]

export function LandingDeck() {
  const order = useCascade(BEHIND.length + 1)

  return (
    <div className="mt-30 flex justify-center desktop:mt-0">
      <div className="stack relative h-[250px] w-[326px] shrink-0 desktop:h-[432px] desktop:w-[600px]">
        {BEHIND.map((card, index) => (
          <article
            key={card.label}
            tabIndex={0}
            style={{ zIndex: order[index + 1] }}
            className={`absolute h-[214px] rounded-deck border border-line bg-card px-18 py-16 shadow-card desktop:h-[376px] ${INSET[index]}`}
          >
            <p className="font-data text-mlab uppercase text-soft">{card.label}</p>
            <p className="mt-8 font-data text-land-h3 font-semibold text-ink">{card.figure}</p>
            <p className="mt-2 font-structural text-land-fine text-soft">{card.note}</p>
          </article>
        ))}

        <div
          style={{ zIndex: order[0] }}
          className="absolute bottom-0 left-0 w-[326px] desktop:w-[600px]"
        >
          <div className="h-[214px] w-[326px] overflow-hidden rounded-deck border border-line bg-bg shadow-card desktop:h-[376px] desktop:w-[600px]">
            <picture>
              <source srcSet={homeDark} media="(prefers-color-scheme: dark)" />
              <img
                src={homeLight}
                alt="Mizaniya's Home screen: safe to spend today, ₦7,500.00, with the cycle's categories beneath it."
                className="block h-full w-full object-cover object-top"
              />
            </picture>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Which card sits in front, rotating. Returns a z-index per card so the stack
 * reorders without any card moving in the markup — a screen reader reads them
 * in the same order throughout, whatever is on top.
 */
function useCascade(count: number): number[] {
  const [front, setFront] = useState(0)
  const [still] = useState(
    () =>
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    if (still) return
    const timer = window.setInterval(() => setFront((n) => (n + 1) % count), 3600)
    return () => window.clearInterval(timer)
  }, [still, count])

  // The card in front gets the top index; the rest keep their drawn order
  // beneath it, so the stack never reads as shuffled.
  return Array.from({ length: count }, (_, i) => count - ((i - front + count) % count))
}
