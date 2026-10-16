/**
 * Derives the landing page's screenshots from the design boards.
 *
 * **The board is the screenshot.** `CLAUDE.md` §7 rule 4: a screen shown inside
 * another screen is the board's own PNG, derived mechanically to a web size —
 * not redrawn by hand, which rots the moment the screen changes, and not
 * imported from the live app, which drags a feature into a marketing page.
 *
 * Run it by hand after a design drop changes a board this page shows:
 *
 *     node scripts/build-shots.mjs
 *
 * It uses `sips`, which is macOS only, and that is deliberate rather than
 * careless: the outputs are committed, so no machine but this one needs the
 * tool, exactly as `docs/design/generator/` works. CI never runs it.
 *
 * JPEG rather than webp because this machine has no encoder for webp — sips
 * cannot write it, and neither ImageMagick nor sharp is installed. At 652px
 * the board is a thumbnail of a 1440-wide screen: it reads as *an app screen*
 * rather than as text, so the artefacts JPEG leaves on small type are not in
 * play. The brief's budget is under 90 KB and q60 comes in at 84.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const OUT = 'apps/web/src/assets/shots'
const WIDTH = 652
const QUALITY = 60
/**
 * The app screen inside the board, and the window of it the hero shows.
 *
 * A board is not a screenshot: it is the screen laid on paper, with the
 * generator's margin around it and its name printed above it — *07 · HOME ·
 * 1440 · LIGHT*. Shipping that puts a label and a paper border inside the
 * landing page's hero, which is what the first cut did. So the frame is cut out
 * first: 75px of margin on each side, 135px down to the screen's own top edge,
 * at the board's 2× scale.
 *
 * Then the window: the hero draws 1440 × 900 of the screen, which is what an
 * app screen looks like when it is open, rather than the whole 1987px page.
 */
const FRAME = { left: 75, top: 135, width: 2874 }
const WINDOW_HEIGHT = 1800

/** Each shot the landing page shows, and the board it comes from. */
const SHOTS = [
  { board: 'docs/design/07-home-1440-light.png', name: 'home-light.jpg' },
  { board: 'docs/design/07-home-1440-dark.png', name: 'home-dark.jpg' },
]

mkdirSync(OUT, { recursive: true })

for (const shot of SHOTS) {
  const out = join(OUT, shot.name)
  const cropped = join(tmpdir(), shot.name.replace('.jpg', '-window.png'))
  // Two passes, because sips crops from the centre unless an offset is given,
  // and the offset it accepts is 1-based.
  execFileSync('sips', [
    '-c',
    String(WINDOW_HEIGHT),
    String(FRAME.width),
    '--cropOffset',
    String(FRAME.top),
    String(FRAME.left),
    shot.board,
    '--out',
    cropped,
  ])
  execFileSync('sips', [
    '-s',
    'format',
    'jpeg',
    '-s',
    'formatOptions',
    String(QUALITY),
    '--resampleWidth',
    String(WIDTH),
    cropped,
    '--out',
    out,
  ])
  const { size } = statSync(out)
  const kb = Math.round(size / 1024)
  // The brief budgets these. A regression should be loud, not discovered on a
  // Nigerian mobile connection.
  if (kb > 90) throw new Error(`${shot.name} is ${kb} KB, over the 90 KB budget`)
  console.log(`${shot.name.padEnd(16)} ${String(kb).padStart(3)} KB  from ${shot.board}`)
}
