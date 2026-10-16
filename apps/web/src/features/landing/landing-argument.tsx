import { Icon } from '@/ui/icon'
import { LandingBand } from './landing-band'
import { LandingDeck } from './landing-deck'
import { whatIsUnderneath } from './landing-copy'

/**
 * *Safe to spend, today.* — the one figure the product is about, and the three
 * cards underneath it.
 *
 * The pile and the list are **one argument in two halves**: the list is what
 * lets the pile be read without a pointer, because it names every card
 * underneath. That is why they sit side by side at 1440 and one above the other
 * on a phone, rather than the list being an afterthought in a column of its own.
 *
 * The closing line differs by width, and both are the boards' own: a pointer
 * lifts a card, a thumb taps one.
 */
export function LandingArgument() {
  return (
    <LandingBand labelledBy="safe">
      <h2 id="safe" className="font-voice text-land-h2-phone text-ink desktop:text-land-h2">
        Safe to spend, today.
      </h2>

      <p className="mt-10 max-w-[540px] font-structural text-land-body text-soft desktop:mt-12">
        What you have not already promised, over the days until you are paid again.
      </p>

      <div className="mt-26 desktop:mt-34 desktop:flex desktop:items-start desktop:gap-48">
        <LandingDeck />

        <div className="mt-30 desktop:mt-0 desktop:max-w-[666px] desktop:flex-1">
          <p className="hidden font-structural text-lab uppercase text-soft desktop:block">
            What is underneath it
          </p>

          <ul className="desktop:mt-16">
            {whatIsUnderneath.map((item) => (
              <li
                key={item.title}
                className="flex gap-12 border-b border-hair py-14 first:pt-0 desktop:py-16"
              >
                <Icon name="trend" size={17} className="mt-2 text-emerald" />
                <span className="flex flex-col gap-4">
                  <span className="font-structural text-land-label font-semibold text-ink">
                    {item.title}
                  </span>
                  <span className="font-structural text-land-label text-soft">{item.body}</span>
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-16 font-structural text-land-label text-soft">
            <span className="desktop:hidden">Tap a card to lift it off the pile.</span>
            <span className="hidden desktop:inline">Lift a card off the pile to see it whole.</span>
          </p>
        </div>
      </div>
    </LandingBand>
  )
}
