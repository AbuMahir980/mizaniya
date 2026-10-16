import { HowItWorksRail } from './how-it-works-rail'
import { LandingArgument } from './landing-argument'
import { LandingClose } from './landing-close'
import { LandingComparisons } from './landing-comparisons'
import { LandingFooter } from './landing-footer'
import { LandingFree } from './landing-free'
import { LandingHero } from './landing-hero'
import { LandingHowTo } from './landing-how-to'
import { LandingRest } from './landing-rest'
import { LandingThreeThings } from './landing-three-things'
import { LandingTimeline } from './landing-timeline'

export interface LandingPageProps {
  /** Start a budget — the page's primary action. Goes to onboarding. */
  onStart: () => void
  /** Arriving on a new device, with an export or a key. */
  onRestore: () => void
}

/**
 * The only page a stranger sees — `docs/06-page-specs.md` §7.0.
 *
 * **It has no states.** Nothing is fetched, nothing can fail, and there is no
 * empty case, because the page holds no data of its own: every figure is a
 * literal from `docs/seed-data.md`. Offline is identical to online, which a page
 * selling an offline-first app had better manage.
 *
 * The order is the board's, and the board's order **is** the argument: the
 * month they recognise, then what it costs them, then the one figure, then the
 * three things, then the proof, then the ask. It imports no store, no
 * repository and no other feature — the only thing it takes from the app is
 * where its two buttons go.
 */
export function LandingPage({ onStart, onRestore }: LandingPageProps) {
  return (
    <main className="mx-auto w-full max-w-[1440px]">
      <LandingHero onStart={onStart} onRestore={onRestore} />
      <HowItWorksRail />
      <LandingComparisons />
      <LandingArgument />
      <LandingThreeThings />
      <LandingTimeline />
      <LandingFree />
      <LandingRest />
      <LandingHowTo />
      <LandingClose onStart={onStart} onRestore={onRestore} />
      <LandingFooter />
    </main>
  )
}
