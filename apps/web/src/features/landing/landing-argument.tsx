import { Card } from '@/ui/card'
import { figures, whatIsUnderneath } from './landing-copy'

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
      <SafeToSpend />
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


