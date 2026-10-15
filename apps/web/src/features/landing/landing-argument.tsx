import { Card } from '@/ui/card'
import { comparisons, debtTimeline, figures, whatIsUnderneath } from './landing-copy'

/**
 * The middle of the page: why the apps they have already tried did not work,
 * what the one figure is, and the three things the product actually is.
 *
 * Every amount here is a literal from `docs/seed-data.md`, carried through
 * `landing-copy.ts`. Nothing on this page computes money (H3) — a marketing
 * surface has no business holding arithmetic, and there is no owner's budget
 * behind any of it.
 */
export function LandingArgument() {
  return (
    <>
      <WhatYouTried />
      <SafeToSpend />
      <DebtTimeline />
    </>
  )
}

function WhatYouTried() {
  return (
    <>
      <section aria-labelledby="tried" className="flex flex-col gap-16">
        <h2 id="tried" className="font-voice text-title text-ink">
          You have tried a budgeting app before.
        </h2>

        {comparisons.map((item) => (
          <Card key={item.claim} as="article" className="flex flex-col gap-12">
            <h3 className="font-structural text-body text-ink">{item.claim}</h3>
            <div className="flex flex-col gap-8 desktop:flex-row desktop:gap-16">
              <ComparisonSide label={item.theirs.label} line={item.theirs.line} />
              <ComparisonSide label={item.ours.label} line={item.ours.line} ours />
            </div>
          </Card>
        ))}

        <p className="font-structural text-small text-faint">
          Both sides are shown at once, because a phone has no pointer to reveal one with.
        </p>
      </section>
    </>
  )
}

function SafeToSpend() {
  return (
    <>
      <section aria-labelledby="safe" className="flex flex-col gap-16">
        <h2 id="safe" className="font-voice text-title text-ink">
          Safe to spend, today.
        </h2>
        <p className="font-structural text-body text-soft">
          What you have not already promised, over the days until you are paid again.
        </p>

        <Card className="flex flex-col gap-8">
          <p className="font-structural text-lab uppercase text-soft">Safe to spend today</p>
          <p className="font-data text-h1 text-ink">
            {figures.safeToSpend}
            <span className="text-h2 text-soft">{figures.safeToSpendKobo}</span>
          </p>
          <p className="font-structural text-small text-faint">
            {figures.cashLeft} left · 20 days to 25 Oct
          </p>
        </Card>

        <ul className="flex flex-col gap-12">
          {whatIsUnderneath.map((item) => (
            <li key={item.title} className="flex flex-col gap-2 border-b border-hair pb-12">
              <span className="font-structural text-body text-ink">{item.title}</span>
              <span className="font-structural text-small text-soft">{item.body}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

function DebtTimeline() {
  return (
    <>
      <section aria-labelledby="timeline" className="flex flex-col gap-16">
        <h2 id="timeline" className="font-voice text-title text-ink">
          You owe A. Friend {figures.friendBalance}.00. Three paydays from now you do not.
        </h2>
        <p className="font-structural text-small text-soft">{figures.friendPerMonth}</p>

        <ol className="flex flex-col gap-8">
          {debtTimeline.map((step) => (
            <li
              key={step.date}
              className="flex items-baseline justify-between gap-12 border-b border-hair pb-8"
            >
              <span className="font-structural text-small text-soft">
                {step.when} · {step.date}
              </span>
              <span className="font-data text-body text-ink">
                {step.amount}
                <span className="text-small text-soft">.00</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="font-structural text-small text-faint">Cleared 25 Dec.</p>
      </section>
    </>
  )
}

function ComparisonSide({ label, line, ours }: { label: string; line: string; ours?: boolean }) {
  return (
    <div className="flex flex-1 flex-col gap-4 border-t border-hair pt-8 desktop:border-l desktop:border-t-0 desktop:pl-16 desktop:pt-0">
      <span className="font-structural text-lab uppercase text-faint">{label}</span>
      <span
        className={`font-structural text-small ${ours === true ? 'text-emerald' : 'text-soft'}`}
      >
        {line}
      </span>
    </div>
  )
}
