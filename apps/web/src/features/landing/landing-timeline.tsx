import { Card } from '@/ui/card'
import { Ngn } from '@/ui/ngn'
import { debtTimeline, figures } from './landing-copy'

/**
 * *You owe A. Friend ₦90,000.00. Three paydays from now you do not.*
 *
 * The board's claim under it is **"No other app can draw this"**, and it is the
 * section that earns the page: a debt with a date on it, counted down payday by
 * payday from the seed's own figures.
 *
 * Built as the board draws it — an 11px dot per row, a 1px connector running
 * between them, the label on a fixed 52px column so the dates line up, and the
 * amounts dropping to `soft` once they are in the future.
 */
export function LandingTimeline() {
  return (
    <section aria-labelledby="timeline" className="py-44">
      <h2 id="timeline" className="font-voice text-land-h2-phone text-ink">
        You owe A. Friend <Ngn amount={figures.friendBalance} />. Three paydays from now you do
        not.
      </h2>
      <p className="mt-10 font-structural text-[13.5px] text-soft">
        No other app can draw this.
      </p>

      <Card className="mt-22 px-18 py-20">
        <ol>
          {debtTimeline.map((step, index) => (
            <Step
              key={step.date}
              step={step}
              first={index === 0}
              last={index === debtTimeline.length - 1}
            />
          ))}
        </ol>

        <p className="flex items-center justify-between gap-12 border-t border-hair pt-14 font-data text-mlab uppercase text-soft">
          <span>{figures.friendPerMonth.replace('a month', 'every payday')}</span>
          <span className="text-emerald">Cleared 25 Dec</span>
        </p>
      </Card>
    </section>
  )
}

function Step({
  step,
  first,
  last,
}: {
  step: (typeof debtTimeline)[number]
  first: boolean
  last: boolean
}) {
  const cleared = step.amount === '₦0'
  return (
    <li className="relative flex gap-14 pb-18 last:pb-14">
      {last ? null : (
        <span
          aria-hidden="true"
          className="absolute bottom-[-14px] left-[6px] top-20 w-[1px] bg-hair"
        />
      )}
      <span
        aria-hidden="true"
        className={`mt-6 block h-12 w-12 shrink-0 rounded-full ${
          first ? 'bg-ink' : cleared ? 'bg-emerald' : 'bg-line'
        }`}
      />
      <span className="flex min-w-0 flex-1 items-baseline gap-10">
        <span className="w-[52px] shrink-0 font-structural text-[9.5px] font-semibold uppercase tracking-[0.115em] text-soft">
          {step.when}
        </span>
        <span className="flex-1 font-structural text-[12px] text-soft">{step.date}</span>
        <span
          className={`font-data text-[20px] font-semibold tracking-[-0.012em] ${
            cleared ? 'text-emerald' : first ? 'text-ink' : 'text-soft'
          }`}
        >
          {step.amount}
          <span className="text-[12px] font-medium opacity-60">.00</span>
        </span>
      </span>
    </li>
  )
}
