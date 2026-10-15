import { WordmarkArabic } from '@/ui/wordmark-arabic'
import { LandingBand } from './landing-band'

/**
 * The footer, and the sentence that governs the whole page: every figure on it
 * is one worked example from `docs/seed-data.md`. Saying so is repo rule 2 kept
 * in public rather than only in the repository.
 */
export function LandingFooter() {
  return (
    <>
      <LandingBand edge className="flex flex-col gap-12">
        <span className="flex items-center gap-8">
          <WordmarkArabic latin={18} />
          <span className="font-voice text-h2 text-ink">Mīzāniyah</span>
        </span>
        <p className="font-structural text-small text-soft">
          Salary cycles, a sinking fund for rent, and debts both ways.
        </p>
        <p className="font-structural text-small text-faint">
          Works offline. Free on every device.
        </p>
        <p className="font-structural text-small text-faint">© 2026 Mizaniya</p>
        <p className="font-structural text-small text-faint">
          Every figure on this page comes from one worked example.
        </p>
      </LandingBand>
    </>
  )
}
