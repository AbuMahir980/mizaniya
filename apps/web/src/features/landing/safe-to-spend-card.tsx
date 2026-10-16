import { figures } from './landing-copy'

/**
 * The Home screen's first card, drawn at the size the landing board draws it.
 *
 * It is a **picture of the product**, not the product: no store, no repository,
 * no arithmetic. Every figure is a literal from `docs/seed-data.md` (H3), and
 * the segmented control beneath is a drawing of a control rather than one, so
 * it is hidden from assistive technology — a tab stop that switches nothing is
 * a worse lie than no tab stop at all.
 */
export function SafeToSpendCard() {
  return (
    <div className="rounded-deck border border-line bg-card px-20 py-20 shadow-card desktop:px-24 desktop:py-24">
      <p className="font-structural text-lab uppercase text-soft">Safe to spend today</p>

      <p className="mt-6 font-structural tabular-nums text-land-display text-ink">
        {figures.safeToSpend}
        <span className="text-[0.47em] font-medium opacity-60">{figures.safeToSpendKobo}</span>
      </p>

      <p className="mt-10 font-structural text-land-label text-soft">
        {figures.cashLeft} left · 20 days to 25 Oct
      </p>

      <p className="mt-16 flex flex-wrap items-baseline gap-x-10 gap-y-4 border-t border-hair pt-14">
        <span className="flex-1 font-structural text-land-detail text-soft">Against your plan</span>
        <span className="font-structural tabular-nums text-land-label font-semibold text-ochre">
          {figures.aheadOfPlan}
          <span className="text-land-micro font-medium opacity-60">{figures.aheadOfPlanKobo}</span>
        </span>
        <span className="font-structural text-land-fine font-semibold text-ochre">
          spending fast
        </span>
      </p>

      <span
        aria-hidden="true"
        className="mt-16 inline-flex rounded-md border border-line bg-bg p-4 font-structural text-land-detail font-semibold"
      >
        <span className="rounded-md bg-ink px-16 py-8 text-bg">Today</span>
        <span className="px-16 py-8 text-soft">This cycle</span>
      </span>
    </div>
  )
}
