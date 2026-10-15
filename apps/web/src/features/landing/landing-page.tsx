import { HowItWorksRail } from './how-it-works-rail'
import { LandingArgument } from './landing-argument'
import { LandingComparisons } from './landing-comparisons'
import { LandingThreeThings } from './landing-three-things'
import { LandingTimeline } from './landing-timeline'
import { LandingClose } from './landing-close'
import { LandingHero } from './landing-hero'

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
 * It imports no store, no repository and no other feature. The only thing it
 * takes from the app is where its two buttons go.
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
      <LandingClose onStart={onStart} onRestore={onRestore} />
    </main>
  )
}
