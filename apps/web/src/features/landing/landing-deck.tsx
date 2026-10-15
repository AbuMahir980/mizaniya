import homeDark from '@/assets/shots/home-dark.jpg'
import homeLight from '@/assets/shots/home-light.jpg'

/**
 * The hero's deck — five cards, four of them empty, the front one holding the
 * app itself.
 *
 * Every number is the board's, from `canvas/LandPhoneLight.dc.html`: a 326×250
 * stage, cards inset 36, 27, 18 and 9 pixels from the left, right and bottom at
 * z-index 1 to 4, and a 326×214 front card at z-index 5 with a 20px radius and
 * the shadow. **It is not an interpretation of the drawing. It is the drawing.**
 *
 * The screenshot is the Home board itself, resized by `scripts/build-shots.mjs`
 * — `CLAUDE.md` §7 rule 4. Redrawing Home by hand would rot the first time Home
 * changed, and importing the live screen would drag a feature into a marketing
 * page. The board is already the screenshot, and the board is already correct.
 */
const BEHIND = [36, 27, 18, 9]

export function LandingDeck() {
  return (
    <div className="mt-30 flex justify-center">
      <div className="relative h-[250px] w-[326px] shrink-0">
        {BEHIND.map((inset, index) => (
          <div
            key={inset}
            aria-hidden="true"
            className={`absolute rounded-deck border border-line bg-card shadow-card ${INSET[index]}`}
          />
        ))}

        <div className="absolute bottom-0 left-0 z-[5] w-[326px]">
          <div className="h-[214px] w-[326px] overflow-hidden rounded-deck border border-line bg-bg shadow-card">
            <picture>
              <source srcSet={homeDark} media="(prefers-color-scheme: dark)" />
              <img
                src={homeLight}
                width={326}
                height={214}
                alt="Mizaniya's Home screen: safe to spend today, ₦7,500.00, with the cycle's categories beneath it."
                className="block h-full w-full object-cover object-top"
              />
            </picture>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Written out rather than computed into a class string: Tailwind only ships a
 * class it can see in the source, so `inset-${n}` would produce markup with no
 * CSS behind it — a rule that silently does nothing, which is the shape this
 * project keeps designing against.
 */
const INSET = [
  'bottom-36 left-36 right-36 z-[1] h-[214px]',
  'bottom-26 left-26 right-26 z-[2] h-[214px]',
  'bottom-18 left-18 right-18 z-[3] h-[214px]',
  'bottom-8 left-8 right-8 z-[4] h-[214px]',
]
