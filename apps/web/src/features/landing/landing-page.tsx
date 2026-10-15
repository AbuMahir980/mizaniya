import { HowItWorksRail } from './how-it-works-rail'
import { ImageSlot } from './image-slot'
import { LandingArgument } from './landing-argument'
import { LandingComparisons } from './landing-comparisons'
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
    <main className="mx-auto flex max-w-[64rem] flex-col gap-32 px-16 pb-32 desktop:px-44">
      <LandingHero onStart={onStart} onRestore={onRestore} />

      <ImageSlot
        name="landing-recognition"
        title="A household, mid-month"
        description="The moment before the product: the salary has gone further than it should have, and nobody is sure where."
      />

      <HowItWorksRail />
      <LandingComparisons />
      <LandingArgument />
      <LandingTimeline />
      <LandingClose onStart={onStart} onRestore={onRestore} />
    </main>
  )
}
