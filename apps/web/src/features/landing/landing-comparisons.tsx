import type { ReactNode } from 'react'
import { Rail } from '@/ui/rail'
import { figures } from './landing-copy'
import { LandingBand } from './landing-band'

/**
 * *You have tried a budgeting app before* — three comparisons, drawn.
 *
 * Each column is the same shape and a **different body**, which is why this is
 * not one component with a data array: the first compares two bar strips, the
 * second two figures with a progress rail, the third two lists. Flattening them
 * into one generic card is how the first attempt lost the design.
 *
 * **The rest state is the failure**, because that is the state the reader
 * arrives in. At 1440 the board says so in its own words — *"Hover any one:
 * what Mizaniya does slides over it"* — and only the red card is drawn. A phone
 * has no pointer, so it gets both cards and the line the phone board gives it.
 * Either way the claim above the pair carries the argument, since one that only
 * completes on hover is one a phone never hears.
 */
export function LandingComparisons() {
  return (
    <LandingBand tone="raised" labelledBy="tried">
      <h2
        id="tried"
        className="mt-12 font-voice text-land-h2-phone text-ink desktop:mt-0 desktop:text-land-h2"
      >
        You have tried a budgeting app before.
      </h2>

      <p className="mt-10 hidden font-structural text-land-detail text-soft desktop:block">
        Hover any one: what Mizaniya does slides over it.
      </p>

      {/* A rail on a phone, three columns at 1440 — the boards differ, and the
          1440 one is not a scroller: 3 × 320 with 36 between fits the band. */}
      <div className="rail-scroller -mx-24 mt-20 overflow-x-auto px-24 desktop:mx-0 desktop:mt-28 desktop:overflow-visible desktop:px-0">
        <div className="flex w-[940px] items-start gap-14 desktop:w-[1032px] desktop:gap-36">
          <Column
            claim={
              <>
                They budget by calendar month.
                <br />
                Your money works in salary cycles.
              </>
            }
          >
            <Side tone="theirs">
              <Bars payday={8} />
              <Caption>1st → 30th · pay lands on the 25th</Caption>
            </Side>
            <Side tone="ours">
              <Bars payday={0} ours />
              <Caption>25th → 24th · the cycle starts when you are paid</Caption>
            </Side>
          </Column>

          <Column claim="They cannot hold a rent lump sum.">
            <Side
              tone="theirs"
              note={`Nowhere to put ${figures.rentTarget} that is due once, in March.`}
            >
              <Figure
                amount={figures.rentPerPayday.replace('.00', '')}
                beside="a month, every month"
              />
            </Side>
            <Side
              tone="ours"
              note={`Due 1 March, and it tells you it is ${figures.rentShortfall} short.`}
            >
              <Figure amount={figures.rentSaved} beside={`of ${figures.rentTarget}`} ours />
              <div className="mt-10">
                <Rail value={0.53} label="Rent fund" />
              </div>
            </Side>
          </Column>

          <Column
            claim={
              <>
                They only track what you owe,
                <br />
                not what you are owed.
              </>
            }
          >
            <Side tone="theirs">
              <Entry who="A. Friend" amount={`${figures.friendBalance}.00`} />
              <Entry who="B. Colleague" amount="no way to record it" muted />
            </Side>
            <Side tone="ours">
              <Entry who="A. Friend" under="you owe" amount={`${figures.friendBalance}.00`} />
              <Entry
                who="B. Colleague"
                under="owed to you"
                amount={`${figures.colleagueBalance}.00`}
                ours
              />
            </Side>
          </Column>
        </div>
      </div>

      <p className="mt-16 font-structural text-land-detail text-soft desktop:hidden">
        Red is the app you tried. Green is what Mizaniya does instead.
      </p>
    </LandingBand>
  )
}

function Column({ claim, children }: { claim: ReactNode; children: ReactNode }) {
  return (
    <div className="reveal-host w-[286px] shrink-0 snap-start desktop:w-[320px]">
      <h3 className="min-h-[70px] font-structural text-land-h3 font-semibold text-ink">{claim}</h3>
      {/* `reveal-stack` only becomes one cell where the reveal can run; the
          query that decides is in tokens.css, next to the motion it governs. */}
      <div className="reveal-stack mt-12 flex flex-col gap-10">{children}</div>
    </div>
  )
}

function Side({
  tone,
  note,
  children,
}: {
  tone: 'theirs' | 'ours'
  note?: string
  children: ReactNode
}) {
  const ours = tone === 'ours'
  return (
    <div
      className={`w-[262px] rounded-lg border border-line bg-card p-16 desktop:w-full ${
        ours ? 'reveal-over shadow-lift' : 'shadow-card'
      }`}
    >
      <p
        className={`font-data text-land-micro uppercase tracking-[0.12em] ${ours ? 'text-emerald' : 'text-rose'}`}
      >
        {ours ? 'Mizaniya' : 'The app you tried'}
      </p>
      <div className="mt-12">{children}</div>
      {note === undefined ? null : (
        <p className="mt-10 font-structural text-land-fine text-soft">{note}</p>
      )}
    </div>
  )
}

/**
 * The strip's own caption, which the board sets in the data face, uppercase and
 * widely tracked — a reading of the chart above it, not prose like the notes on
 * the other two cards.
 */
function Caption({ children }: { children: ReactNode }) {
  return (
    <p className="mt-10 font-data text-land-micro uppercase leading-[15px] tracking-[0.1em] text-soft">
      {children}
    </p>
  )
}

/**
 * Twelve bars, 3px apart, in a 20px box — the board's own arithmetic.
 *
 * **The spike is the argument.** On the calendar strip payday lands at bar 9,
 * two-thirds through a month that has already been spent against; on the cycle
 * strip it is bar 1, and everything after it is money that has somewhere to go.
 */
function Bars({ payday, ours }: { payday: number; ours?: boolean }) {
  return (
    <div aria-hidden="true" className="flex h-20 items-end gap-2">
      {Array.from({ length: 12 }, (_, i) =>
        i === payday ? (
          <span key={i} className="h-20 flex-1 rounded-sm bg-ink" />
        ) : (
          <span
            key={i}
            className={`h-12 flex-1 rounded-sm opacity-[.34] ${ours === true ? 'bg-emerald' : 'bg-faint'}`}
          />
        ),
      )}
    </div>
  )
}

/** A figure with its kobo set smaller, and a phrase beside it. */
function Figure({ amount, beside, ours }: { amount: string; beside: string; ours?: boolean }) {
  return (
    <p className="flex items-baseline gap-8">
      <span
        className={`font-data text-land-lead font-semibold ${ours === true ? 'text-emerald' : 'text-rose'}`}
      >
        {amount}
        <span className="text-land-kicker font-medium opacity-60">.00</span>
      </span>
      <span className="font-structural text-land-fine text-soft">{beside}</span>
    </p>
  )
}

/** One name and one balance, on a hairline. */
function Entry({
  who,
  under,
  amount,
  muted,
  ours,
}: {
  who: string
  under?: string
  amount: string
  muted?: boolean
  ours?: boolean
}) {
  return (
    <span className="flex items-center justify-between gap-10 border-b border-hair py-8 last:border-b-0">
      <span className="flex flex-col">
        <span className="font-structural text-land-fine text-ink">{who}</span>
        {under === undefined ? null : (
          <span className="font-structural text-land-kicker text-soft">{under}</span>
        )}
      </span>
      <span
        className={`font-data text-land-fine ${muted === true ? 'text-faint' : ours === true ? 'text-emerald' : 'text-ink'}`}
      >
        {amount}
      </span>
    </span>
  )
}
