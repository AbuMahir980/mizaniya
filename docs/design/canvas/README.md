# `docs/design/canvas/` — the editable source

This is the design itself, not a picture of it. One `.dc.html` file per artboard,
plus `canvas.json` describing the pages, positions and notes.

**Re-cut 25 September: one screen, one artboard.** A board used to be able to hold
six onboarding steps, or sign-up beside sign-in, or five states of Home in a row.
Every file here is now one screen, named for the screen. 183 artboards across
11 pages — landing page first, then the web app at 1440 in four pages, the same app
at 360 in four more, then the mark and the foundations.

Two surfaces, and they stay apart. `Web*` is the web app on a laptop; `Mw*` is the
**same web app in a phone browser**. Deliberately not `Mobile*`: the Expo mobile app
is v2, nothing here is it, and that one word would undo the distinction the first
time someone skimmed the canvas.

## What each file is

- **`<Name>.dc.html`** — one artboard. Plain HTML: the whole design system is in a
  `<style>` block at the top of each file, and the screen is the markup under it.
  No build step, no framework, no assets — the only external reference is the Google
  Fonts link (Inter, EB Garamond, JetBrains Mono).
- **`canvas.json`** — the layout: eleven pages, each artboard's `x`/`y`/`w`/`h`, its
  title, and the note that sits above each page.

`.dc.html` files open with an `<x-dc>` wrapper and a `./support.js` reference for the
Claude Design canvas runtime. **A browser ignores both**, so double-clicking one shows
the screen exactly as its PNG does. There is no separate standalone copy, for that
reason.

## Re-opening these in the canvas editor

The published canvas is a single self-contained page: everything here is embedded in
it, so opening the artifact is enough to view, edit and export. To rebuild that page
from these files, the Claude Design skill's helper does it in one command:

```
node seed-canvas.mjs \
  --template payload.template.html \
  --out mizaniya-design-stop.html \
  --title "Mizaniya Design Stop" \
  --canvas canvas.json \
  --artboard LandLight.dc.html --artboard LandDark.dc.html ...   # every file, in canvas.json order
```

`LandLight.dc.html` is first, and the canvas opens on the landing page — because that
is where a visitor to the product arrives, and a reader of this canvas should arrive
in the same place rather than in the middle of the app.

## Reading them as a developer

Each artboard is real HTML and CSS, so the fastest way to answer "what exactly is
that border / spacing / weight" is to open the file and look, rather than measuring a
PNG. The class names are the primitives: `.btn`, `.btn-p`, `.btn-s`, `.btn-q`, `.fld`,
`.chip`, `.row`, `.tabs`, `.sw`, `.pill`, `.rail`, `.seg`, `.card`, `.tile`, `.sk`,
`.lab`, `.mlab`, `.ser`, `.disp`, `.mono`, `.num`. The tokens they consume are the
CSS custom properties set on `.mz`, and `../tokens.md` is the authority on those.

**These files are the reference, not the implementation.** `src/ui/` is built from
`tokens.md` and the primitives sheet — not by copying this markup, which is written
for a static canvas and has no state, no accessibility attributes and no components.
