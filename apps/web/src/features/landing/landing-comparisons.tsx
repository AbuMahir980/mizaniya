import type { ReactNode } from 'react'
import { Rail } from '@/ui/rail'
import { figures } from './landing-copy'

/**
 * *You have tried a budgeting app before* — three comparisons, drawn.
 *
 * Each column is the same shape and a **different body**, which is why this is
 * not one component with a data array: the first compares two bar strips, the
 * second two figures with a progress rail, the third two lists. Flattening them
 * into one generic card is how the first attempt lost the design.
 *
 * Both sides show at once. The board's own note: *a phone has no pointer to
 * reveal one with.*
 */
export function LandingComparisons() {
  return (
    <section aria-labelledby="tried" className="bg-card2 px-24 py-44 desktop:px-150 desktop:py-96">
      <h2 id="tried" className="mt-12 font-voice text-land-h2-phone text-ink">
        You have tried a budgeting app before.
      </h2>

      <div className="-mx-24 mt-20 overflow-x-auto px-24">
        <div className="flex w-[940px] items-start gap-14">
          <Column claim={<>They budget by calendar month.<br />Your money works in salary cycles.</>}>
            <Side tone="theirs" note="1st → 30th · pay lands on the 25th">
              <Bars payday={8} />
            </Side>
            <Side tone="ours" note="25th → 24th · the cycle starts when you are paid">
              <Bars payday={0} ours />
            </Side>
          </Column>

          <Column claim="They cannot hold a rent lump sum.">
            <Side tone="theirs" note={`Nowhere to put ${figures.rentTarget} that is due once, in March.`}>
              <Figure amount={figures.rentPerPayday.replace('.00', '')} beside="a month, every month" />
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

          <Column claim={<>They only track what you owe,<br />not what you are owed.</>}>
            <Side tone="theirs">
              <Entry who="A. Friend" amount={`${figures.friendBalance}.00`} />
              <Entry who="B. Colleague" amount="no way to record it" muted />
            </Side>
            <Side tone="ours">
              <Entry who="A. Friend" under="you owe" amount={`${figures.friendBalance}.00`} />
              <Entry who="B. Colleague" under="owed to you" amount={`${figures.colleagueBalance}.00`} ours />
            </Side>
          </Column>
        </div>
      </div>

      <p className="mt-16 font-structural text-small text-soft">
        Both sides are shown at once, because a phone has no pointer to reveal one with.
      </p>
    </section>
  )
}

function Column({ claim, children }: { claim: ReactNode; children: ReactNode }) {
  return (
    <div className="w-[286px] shrink-0 snap-start">
      <h3 className="min-h-[70px] font-structural text-[17px] font-semibold leading-[23px] text-ink">
        {claim}
      </h3>
      <div className="mt-12 flex flex-col gap-10">{children}</div>
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
    <div className={`w-[262px] rounded-lg border border-line bg-card p-16 ${ours ? 'shadow-lift' : 'shadow-card'}`}>
      <p
        className={`font-data text-[9px] uppercase tracking-[0.12em] ${ours ? 'text-emerald' : 'text-rose'}`}
      >
        {ours ? 'Mizaniya' : 'The app you tried'}
      </p>
      <div className="mt-12">{children}</div>
      {note === undefined ? null : (
        <p className="mt-10 font-structural text-[12px] leading-[18px] text-soft">{note}</p>
      )}
    </div>
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
        className={`font-data text-[19px] font-semibold ${ours === true ? 'text-emerald' : 'text-rose'}`}
      >
        {amount}
        <span className="text-[11px] font-medium opacity-60">.00</span>
      </span>
      <span className="font-structural text-[12px] text-soft">{beside}</span>
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
        <span className="font-structural text-[13px] text-ink">{who}</span>
        {under === undefined ? null : (
          <span className="font-structural text-[11px] text-soft">{under}</span>
        )}
      </span>
      <span
        className={`font-data text-[13px] ${muted === true ? 'text-faint' : ours === true ? 'text-emerald' : 'text-ink'}`}
      >
        {amount}
      </span>
    </span>
  )
}
