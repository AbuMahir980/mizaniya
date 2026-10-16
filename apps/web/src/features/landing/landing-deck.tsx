import { useEffect, useState } from 'react'
import { StackCard } from '@/ui/stack-card'
import { SafeToSpendCard } from './safe-to-spend-card'
import { figures } from './landing-copy'

/**
 * The cascade: the safe-to-spend card whole in front, and the three cards the
 * board counts underneath it — *"What is safe today · 3 more underneath"*.
 *
 * **"Hover reveals nothing."** That is the constraint from the pointer-states
 * study, and it is `motion.md` §5 inherited by §9: the page must read
 * completely with motion off, and a touch device has no pointer at all. Here
 * the promise is kept by the list beside the pile, which names all three cards
 * underneath in the reader's own words. Nothing is identified only by pointing
 * at it.
 *
 * The owner asked for it to cycle rather than wait to be pointed at, which §9
 * permits — the landing page is allowed to perform. The cycle stops for good
 * the moment someone lifts a card themselves, and never runs under reduced
 * motion.
 */
const BEHIND = [
  { label: 'Where each category stands', figure: '8 categories', note: 'worst first' },
  { label: 'Needs attention', figure: '2 of 8', note: 'the two that need you' },
  { label: 'Rent fund', figure: figures.rentSaved, note: `of ${figures.rentTarget}` },
] as const

/** Each card behind sits 10px lower and 10px narrower than the one in front of
 *  it — the step both boards draw, rounded to the 2px grid (`tokens.md` §5). */
const INSET = [
  'inset-x-[10px] top-[10px]',
  'inset-x-[20px] top-[20px]',
  'inset-x-[30px] top-[30px]',
]

export function LandingDeck() {
  const { zOf, bringForward } = useCascade(BEHIND.length + 1)

  return (
    <div>
      {/* The front card is in flow and sets the height; the three behind are
          `h-full` from a top offset, so each one's own bottom edge is what
          shows at rest. Nothing here is measured by hand. */}
      <div className="stack relative w-[327px] desktop:w-[360px]">
        {BEHIND.map((card, index) => (
          <StackCard
            key={card.label}
            label={card.label}
            zIndex={zOf(index + 1)}
            onBringForward={() => bringForward(index + 1)}
            className={`absolute h-full rounded-deck border border-line bg-card px-20 py-20 shadow-card ${INSET[index]}`}
          >
            <span className="block font-structural text-lab uppercase text-soft">{card.label}</span>
            <span className="mt-8 block font-data text-land-h3 font-semibold text-ink">
              {card.figure}
            </span>
            <span className="mt-2 block font-structural text-land-fine text-soft">{card.note}</span>
          </StackCard>
        ))}

        <StackCard
          label="Safe to spend today"
          zIndex={zOf(0)}
          onBringForward={() => bringForward(0)}
          className="relative w-full"
        >
          <SafeToSpendCard />
        </StackCard>
      </div>

      <p className="mt-12 font-structural text-land-detail font-semibold text-ink">
        What is safe today · {BEHIND.length} more underneath
      </p>
    </div>
  )
}

/**
 * Which card sits in front, rotating. Returns a z-index per card so the stack
 * reorders without any card moving in the markup — a screen reader reads them
 * in the same order throughout, whatever is on top.
 */
function useCascade(count: number) {
  const [front, setFront] = useState(0)
  const [chosen, setChosen] = useState(false)
  const [still] = useState(
    () =>
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    if (still || chosen) return
    const timer = window.setInterval(() => setFront((n) => (n + 1) % count), 3600)
    return () => window.clearInterval(timer)
  }, [still, chosen, count])

  return {
    // The card in front gets the top index; the rest keep their drawn order
    // beneath it, so the stack never reads as shuffled.
    zOf: (index: number) => count - ((index - front + count) % count),
    bringForward: (index: number) => {
      setChosen(true)
      setFront(index)
    },
  }
}
