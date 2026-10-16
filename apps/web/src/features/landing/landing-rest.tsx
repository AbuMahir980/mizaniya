import type { ReactNode } from 'react'
import { ImageSlot } from './image-slot'
import { GUTTER, LandingBand } from './landing-band'
import { DebtCard, RecordCard, TransactionsCard, ZakatCard } from './rest-cards'

/**
 * *The rest of it* — the four screens the page has not shown, each inside its
 * own bordered panel.
 *
 * The panel is the point. The pointer-states study is explicit about why the
 * first version failed: *"cards with holes around them read as scattered rather
 * than composed"*, so the gap halved and **each arrangement sits inside its own
 * edge.** The lift on hover is 8px, half the cascade's, because nothing is
 * being uncovered here — a component is only being pointed at.
 */
const PANELS = [
  {
    card: <TransactionsCard />,
    title: 'Every movement, with its kobo',
    body: 'Grouped by day, filterable by type and category, down to the kobo.',
  },
  {
    card: <DebtCard />,
    title: 'Debts that run both ways',
    body: 'What you owe and what you are owed, on one screen.',
  },
  {
    card: <RecordCard />,
    title: 'A record either party can hold',
    body: 'One debt and every payment against it. Black and white, no app chrome.',
  },
  {
    card: <ZakatCard />,
    title: 'Zakat, with its workings shown',
    body: 'The estimate, every figure that produced it, and what it cannot know.',
  },
]

export function LandingRest() {
  return (
    <>
      <LandingBand labelledBy="rest">
        <h2
          id="rest"
          className="max-w-[640px] font-voice text-land-h2-phone text-ink desktop:text-land-h2"
        >
          The rest of it.
        </h2>

        <p className="mt-12 hidden max-w-[560px] font-structural text-land-body text-soft desktop:block">
          Four more, each a screen you can open.
        </p>

        <div className="rail-scroller -mx-24 mt-20 overflow-x-auto px-24 desktop:mx-0 desktop:mt-38 desktop:overflow-visible desktop:px-0">
          <div className="flex items-start gap-14 desktop:gap-22">
            {PANELS.map((panel) => (
              <Panel key={panel.title} title={panel.title} body={panel.body}>
                {panel.card}
              </Panel>
            ))}
          </div>
        </div>
      </LandingBand>

      {/* The slot belongs to the band above it and the canvas gives it no top
          padding of its own, so it sits outside the band but on its measure. */}
      <div className={`${GUTTER} pb-44 desktop:pb-96`}>
        <ImageSlot
          name="landing-paid"
          title="The same household, paid"
          spec="1140 × 300 · webp · under 90 KB"
        />
      </div>
    </>
  )
}

/**
 * One panel: a card drawn at its own size and scaled down inside the panel,
 * which is how the canvas sets it — `zoom` on a 340px card rather than a second
 * set of measurements for a smaller one.
 */
function Panel({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <article className="lift-panel w-[268px] shrink-0 rounded-xl border border-line bg-card2 px-22 pb-24 pt-22 desktop:w-auto desktop:flex-1">
      <div className="overflow-hidden" style={{ zoom: 0.68 }}>
        {children}
      </div>
      <h3 className="mt-20 font-structural text-land-body font-semibold leading-[24px] text-ink">
        {title}
      </h3>
      <p className="mt-8 font-structural text-land-detail leading-[22px] text-soft">{body}</p>
    </article>
  )
}
