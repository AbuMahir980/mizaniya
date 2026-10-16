import { LandingButton } from '@/ui/landing-button'
import { LandingBand } from './landing-band'

export interface LandingCloseProps {
  onStart: () => void
  onRestore: () => void
}

/**
 * *You do not need an account.* — the page's last word, and the only place it
 * asks twice.
 *
 * The brief allows the repeat: someone who has read this far has read the
 * argument, and the ask belongs where the reading ends as well as where it
 * starts. The board centres it on a 1440 frame and leaves it ranged left on a
 * phone, where centred body copy is harder to read down a narrow column.
 */
export function LandingClose({ onStart, onRestore }: LandingCloseProps) {
  return (
    <LandingBand labelledBy="closing" className="desktop:text-center">
      <h2
        id="closing"
        className="font-voice text-land-close-phone text-ink desktop:mx-auto desktop:max-w-[760px] desktop:text-land-close"
      >
        You do not need an account.
      </h2>

      <p className="mt-18 font-structural text-land-lead-phone text-soft desktop:mx-auto desktop:max-w-[580px] desktop:text-land-lead">
        Your figures, your devices, free — and not a trial. A second device or a second person is a
        key you hand over, not a sign-up.
      </p>

      <div className="mt-26 flex flex-wrap gap-12 desktop:mt-30 desktop:justify-center">
        <LandingButton onClick={onStart}>Start with my own figures</LandingButton>
        <LandingButton variant="secondary" onClick={onRestore}>
          I already have a budget
        </LandingButton>
      </div>

      <p className="mt-22">
        <a
          className="inline-flex min-h-target items-center font-structural text-land-button text-soft underline"
          href="https://github.com/AbuMahir980/mizaniya"
        >
          Read the source
        </a>
      </p>
    </LandingBand>
  )
}
