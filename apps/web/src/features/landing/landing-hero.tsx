import { LandingButton } from '@/ui/landing-button'
import { WordmarkArabic } from '@/ui/wordmark-arabic'
import { LandingDeck } from './landing-deck'

export interface LandingHeroProps {
  onStart: () => void
  onRestore: () => void
}

/**
 * The header and the hero, built from `canvas/LandPhoneLight.dc.html`.
 *
 * Its numbers are the board's: a 64px nav, the headline at 25px over 33px with
 * the break where the board breaks it, `.lead` beneath, the two buttons 12px
 * apart 22px down, and the fine print at 13.5px — then the deck, centred, 30px
 * below.
 *
 * **The recognition comes before the product.** The brief opens on someone's own
 * month rather than a value proposition, which is why the first thing said is a
 * date and the second is a feeling.
 */
export function LandingHero({ onStart, onRestore }: LandingHeroProps) {
  return (
    <>
      <header className="flex h-[64px] items-center gap-14 px-24 desktop:h-[76px] desktop:px-150">
        <Lockup />
        <span className="flex-1" />
        <LandingButton variant="secondary" small onClick={onRestore}>
          I already have a budget
        </LandingButton>
      </header>

      <section className="border-b border-line px-24 pb-34 pt-26 desktop:flex desktop:items-center desktop:gap-24 desktop:px-150 desktop:py-96">
        <div className="desktop:min-h-[570px] desktop:max-w-[620px] desktop:flex desktop:flex-col desktop:justify-center">
          <h1 className="mt-16 font-voice text-land-h2-phone text-ink desktop:mt-22 desktop:text-[44px] desktop:leading-[56px]">
            Your salary lands on the 25th.
            <br />
            By the 12th, you are not sure where it went.
          </h1>

          <p className="mt-14 font-structural text-land-lead text-soft desktop:mt-22 desktop:max-w-[520px]">
            Salary cycles. Rent held back. Debts both ways.
          </p>

          <div className="mt-22 flex flex-wrap gap-12 desktop:mt-30">
            <LandingButton onClick={onStart}>Start with my own figures</LandingButton>
            <LandingButton variant="secondary" onClick={onRestore}>
              I already have a budget
            </LandingButton>
          </div>

          <p className="mt-14 font-structural text-[13.5px] leading-[20px] text-soft">
            No account. No email, no password, nothing to verify.
          </p>
        </div>

        <LandingDeck />
      </section>
    </>
  )
}

/**
 * The Arabic sits **above** the Latin, right-aligned and pulled down into it —
 * `tokens.md` §9: *"it sits on top of it, like a child on the head of a parent,
 * in its tiny form."* The component owns the ratio; this only names the size the
 * board gives it.
 */
function Lockup() {
  return (
    <span className="flex items-center gap-10 text-emerald">
      <span className="flex flex-col items-end">
        <WordmarkArabic latin={17} />
        <span className="font-voice text-[17px] leading-[1.1] tracking-[0.005em] text-ink">
          Mīzāniyah
        </span>
      </span>
    </span>
  )
}
