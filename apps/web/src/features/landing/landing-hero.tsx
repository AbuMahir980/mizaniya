import { Button } from '@/ui/button'
import { WordmarkArabic } from '@/ui/wordmark-arabic'

export interface LandingHeroProps {
  onStart: () => void
  onRestore: () => void
}

/**
 * The header and the hero.
 *
 * **The recognition comes before the product does.** The brief is explicit that
 * this opens on someone's own month rather than on a value proposition, which is
 * why the first thing said is a date and the second is a feeling.
 */
export function LandingHero({ onStart, onRestore }: LandingHeroProps) {
  return (
    <>
      <header className="flex items-center justify-between gap-12 py-16">
        <span className="flex items-center gap-8">
          <WordmarkArabic latin={20} />
          <span className="font-voice text-h2 text-ink">Mīzāniyah</span>
        </span>
        <Button variant="quiet" onClick={onRestore}>
          I already have a budget
        </Button>
      </header>

      <section className="flex flex-col gap-16">
        <h1 className="font-voice text-title text-ink">
          Your salary lands on the 25th.
          <br />
          By the 12th, you are not sure where it went.
        </h1>
        <p className="font-structural text-body text-soft">
          Salary cycles. Rent held back. Debts both ways.
        </p>

        <div className="flex flex-col gap-8 desktop:flex-row desktop:items-center">
          <Button onClick={onStart}>Start with my own figures</Button>
          <Button variant="secondary" onClick={onRestore}>
            I already have a budget
          </Button>
        </div>

        <p className="font-structural text-small text-faint">
          No account. No email, no password, nothing to verify.
        </p>
      </section>
    </>
  )
}
