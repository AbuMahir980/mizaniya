import { LandingBand } from './landing-band'
import { freeBecause } from './landing-copy'

/**
 * *What is free is free because it costs us nothing to run* — the five reasons,
 * and the verse the product's debt record answers to.
 *
 * The two sit in **one band, side by side**, which is the board's arrangement
 * and not an accident of flow: the claim on the left is commercial and the line
 * on the right is the reason the commercial claim is safe to make. Splitting
 * them into two bands, as the first build did, turned an argument into two
 * announcements.
 */
export function LandingFree() {
  return (
    <LandingBand tone="raised" labelledBy="free">
      <h2
        id="free"
        className="mt-14 max-w-[700px] font-voice text-land-h2-phone text-ink desktop:text-land-h2"
      >
        What is free is free because it costs us nothing to run.
      </h2>

      <div className="mt-26 desktop:mt-36 desktop:flex desktop:items-start desktop:gap-64">
        <ul className="min-w-0 flex-1">
          {freeBecause.map((line) => (
            <li
              key={line}
              className="flex items-baseline gap-14 border-b border-hair py-14 font-structural text-land-body leading-[27px] text-ink"
            >
              <span aria-hidden="true" className="shrink-0 text-land-fine text-emerald">
                •
              </span>
              <span className="flex-1">{line}</span>
            </li>
          ))}
        </ul>

        <figure className="mt-30 shrink-0 border-t-2 border-ink pt-26 desktop:mt-34 desktop:w-[400px]">
          <blockquote className="font-voice text-land-quote text-ink">
            Debts written down, both ways, with a record either party can hold.
          </blockquote>
          <figcaption className="mt-12 font-data text-mlab uppercase text-soft">
            Qur&rsquo;an 2:282
          </figcaption>
        </figure>
      </div>
    </LandingBand>
  )
}
