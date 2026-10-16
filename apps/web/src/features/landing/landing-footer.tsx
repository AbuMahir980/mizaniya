import { Mark } from '@/ui/mark'
import { WordmarkArabic } from '@/ui/wordmark-arabic'
import { GUTTER } from './landing-band'

const REPO = 'https://github.com/AbuMahir980/mizaniya'

/**
 * The footer, and the sentence that governs the whole page: every figure on it
 * is one worked example from `docs/seed-data.md`. Saying so in public is repo
 * rule 2 kept where a reader can check it, not only in the repository.
 *
 * **Security and privacy is not a link.** The brief calls it a real asset — the
 * §7 claims in full, with the bank-data caveat stated plainly — and that page
 * does not exist yet. A heading that goes nowhere is better than a link that
 * does; `docs/open-items.md` §V carries it.
 */
export function LandingFooter() {
  return (
    <footer className={`border-t-2 border-ink bg-card2 pb-48 pt-56 ${GUTTER}`}>
      <div className="desktop:grid desktop:grid-cols-[1.5fr_1fr_1fr_1fr] desktop:gap-44">
        <div>
          <span className="flex items-center gap-12 text-emerald">
            <Mark size={30} />
            <span className="flex flex-col items-start">
              <WordmarkArabic latin={22} />
              <span className="font-voice text-land-answer leading-[1.1] tracking-[0.005em] text-ink">
                Mīzāniyah
              </span>
            </span>
          </span>

          <p className="mt-14 max-w-[290px] font-structural text-land-label leading-[22px] text-soft">
            Salary cycles, a sinking fund for rent, and debts both ways.
          </p>
          <p className="mt-16 font-structural text-land-detail text-soft">
            Works offline. Free on every device.
          </p>
        </div>

        <div className="mt-34 desktop:mt-0">
          <h2 className="font-structural text-lab uppercase text-soft">Trust</h2>
          <p className="mt-12 font-structural text-land-label text-soft">Security and privacy</p>
        </div>

        <div className="mt-34 desktop:mt-0">
          <h2 className="font-structural text-lab uppercase text-soft">Built in the open</h2>
          <FooterLink href={REPO}>Source</FooterLink>
          <FooterLink href={`${REPO}/blob/main/docs/open-items.md`}>Open items</FooterLink>
          <FooterLink href={`${REPO}/blob/main/LICENSE`}>Licence</FooterLink>
        </div>
      </div>

      <div className="mt-48 flex flex-wrap items-baseline gap-20 border-t border-line pt-22 font-structural text-land-detail text-soft">
        <span>© 2026 Mizaniya</span>
        <span className="flex-1" />
        <span>Every figure on this page comes from one worked example.</span>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      className="mt-12 flex min-h-target items-center font-structural text-land-label text-soft underline desktop:min-h-0"
    >
      {children}
    </a>
  )
}
