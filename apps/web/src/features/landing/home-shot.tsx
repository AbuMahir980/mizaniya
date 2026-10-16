import homeDark from '@/assets/shots/home-dark.jpg'
import homeLight from '@/assets/shots/home-light.jpg'

/**
 * The hero's picture: the Home screen itself, with four card edges stacked
 * above it.
 *
 * **It is the board's own PNG**, derived by `scripts/build-shots.mjs` —
 * `CLAUDE.md` §7 rule 4. Not redrawn by hand, which rots the moment the screen
 * changes, and not rendered from the live app, which would drag a feature into
 * a marketing page.
 *
 * The edges are blank, and that is the design: nothing uncovers them and
 * nothing claims they are anything, so there is no information behind a
 * pointer. The cascade that *does* carry information is further down the page,
 * beside the list that names every card in it.
 */
const EDGES = [
  '-top-[10px] left-[14px] right-[14px]',
  '-top-[20px] left-[28px] right-[28px]',
  '-top-[30px] left-[42px] right-[42px]',
  '-top-[40px] left-[56px] right-[56px]',
]

export function HomeShot() {
  return (
    <div className="relative mt-40 w-[327px] shrink-0 desktop:w-[592px]">
      {EDGES.map((edge) => (
        <span
          key={edge}
          aria-hidden="true"
          className={`absolute h-[60px] rounded-shot border border-line bg-card ${edge}`}
        />
      ))}

      <picture className="relative block overflow-hidden rounded-shot border border-line bg-bg shadow-card">
        <source srcSet={homeDark} media="(prefers-color-scheme: dark)" />
        <img
          src={homeLight}
          alt="Mizaniya's Home screen: safe to spend today, ₦7,500.00, with the cycle's categories beside it."
          className="block w-full"
        />
      </picture>
    </div>
  )
}
