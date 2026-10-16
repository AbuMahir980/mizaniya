import { Card } from '@/ui/card'
import { figures } from './landing-copy'
import { LandingBand } from './landing-band'

/** The three debts, as the board lists them: the sign of the balance sets the dot. */
const DEBTS = [
  {
    who: 'A. Friend',
    under: 'You owe · ₦30,000 each payday',
    amount: figures.friendBalance,
    owed: false,
  },
  { who: 'Spouse', under: 'You owe · nothing agreed', amount: '₦60,000', owed: false },
  {
    who: 'B. Colleague',
    under: 'Owes you · since 24 Sep',
    amount: figures.colleagueBalance,
    owed: true,
  },
]

/**
 * *Three things, and they are the whole product.*
 *
 * A band on `card2`, bleeding the full width, with three columns that scroll
 * horizontally at 390 — the board's own `width: 940px` row rather than a grid
 * that squeezes. **A screenshot too small to read is not proof of anything**,
 * which is the note the designer left on this page about why it scrolls.
 */
export function LandingThreeThings() {
  return (
    <LandingBand tone="raised" labelledBy="three">
      <h2
        id="three"
        className="mt-12 max-w-[700px] font-voice text-land-h2-phone text-ink desktop:mt-16 desktop:text-land-h2"
      >
        Three things, and they are the whole product.
      </h2>

      <div className="rail-scroller mt-20 overflow-x-auto -mx-24 px-24 desktop:-mx-150 desktop:px-150">
        <div className="flex w-[940px] items-start gap-14">
          <Thing title="Salary cycles, not months">
            <Card className="mt-20 p-18">
              <p className="flex items-center gap-10 font-data text-mlab uppercase text-soft">
                <span className="flex-1">This cycle</span>
                <span>Day 11 of 30</span>
              </p>
              <CycleStrip />
            </Card>
          </Thing>

          <Thing title="Debts in both directions, with a written record">
            <BothDirections />
          </Thing>

          <Thing title="A sinking fund for annual rent">
            <RentFund />
          </Thing>
        </div>
      </div>
    </LandingBand>
  )
}

function BothDirections() {
  return (
    <Card className="mt-20 p-18">
      <p className="font-data text-mlab uppercase text-soft">Both directions</p>
      <ul className="mt-8">
        {DEBTS.map((debt) => (
          <li
            key={debt.who}
            className="flex items-center gap-12 border-b border-hair py-12 last:border-b-0"
          >
            <span
              aria-hidden="true"
              className={`h-8 w-8 shrink-0 rounded-full ${debt.owed ? 'bg-emerald' : 'bg-rose'}`}
            />
            <span className="min-w-0 flex-1">
              <span className="block font-structural text-land-label font-semibold text-ink">
                {debt.who}
              </span>
              <span className="mt-2 block font-structural text-land-fine text-soft">
                {debt.under}
              </span>
            </span>
            <span className="font-data text-land-label font-semibold tracking-[-0.012em] text-ink">
              {debt.amount}
              <span className="text-land-micro font-medium opacity-60">.00</span>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function RentFund() {
  return (
    <Card className="mt-20 p-18">
      <p className="flex items-center gap-10 font-data text-mlab uppercase text-soft">
        <span className="flex-1">Annual rent</span>
        <span className="text-ochre">Short</span>
      </p>
      <p className="mt-12 flex items-baseline gap-8">
        <span className="font-data text-land-lead font-semibold text-ink">
          {figures.rentSaved}
          <span className="text-land-kicker font-medium opacity-60">.00</span>
        </span>
        <span className="font-structural text-land-fine text-soft">of {figures.rentTarget}</span>
      </p>
      <p className="mt-10 font-structural text-land-fine text-soft">
        Due 1 March. At {figures.rentPerPayday} a payday you reach ₦850,000.00 —{' '}
        {figures.rentShortfall} short. {figures.rentPerPaydayThatCloses} a payday closes it.
      </p>
    </Card>
  )
}

function Thing({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-[286px] shrink-0 snap-start">
      <h3 className="min-h-[46px] font-structural text-land-h3 font-semibold text-ink">{title}</h3>
      {children}
    </div>
  )
}

/**
 * Thirty bars for thirty days. Ten behind in emerald, **today at eleven and
 * taller in ink**, nineteen ahead in track — the cycle seen at a glance, which
 * is the one thing a calendar month cannot show.
 */
function CycleStrip() {
  return (
    <div aria-hidden="true" className="mt-16 flex h-30 items-end gap-2">
      {Array.from({ length: 30 }, (_, i) => (
        <span
          key={i}
          className={
            i === 10
              ? 'h-30 flex-1 rounded-sm bg-ink'
              : i < 10
                ? 'h-18 flex-1 rounded-sm bg-emerald opacity-[.45]'
                : 'h-18 flex-1 rounded-sm bg-track'
          }
        />
      ))}
    </div>
  )
}
