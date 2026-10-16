import { LandingBand } from './landing-band'
import { howToUseIt } from './landing-copy'

/**
 * *How to use it* — three steps, each under its own rule.
 *
 * The heading is a step smaller than every other band heading (34px against
 * 40px), which the canvas sets deliberately: this is instructions, not an
 * argument, and it comes after the page has finished arguing.
 */
export function LandingHowTo() {
  return (
    <LandingBand labelledBy="how-to">
      <h2 id="how-to" className="font-voice text-land-h2-phone text-ink desktop:text-land-section">
        How to use it
      </h2>

      <ol className="mt-22 desktop:mt-30 desktop:flex desktop:gap-40">
        {howToUseIt.map((step, index) => (
          <li key={step.title} className="mt-22 flex-1 border-t-2 border-ink pt-18 first:mt-0">
            <span className="font-data text-land-detail text-soft">{index + 1}</span>
            <h3 className="mt-10 font-structural text-land-lead font-semibold leading-[25px] text-ink">
              {step.title}
            </h3>
            <p className="mt-8 font-structural text-land-note text-soft">{step.body}</p>
          </li>
        ))}
      </ol>
    </LandingBand>
  )
}
