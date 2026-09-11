# `docs/design/canvas/` — the editable source

This is the design itself, not a picture of it. One `.dc.html` file per artboard,
plus `canvas.json` describing the pages, positions and notes.

## What each file is

- **`<Name>.dc.html`** — one artboard. Plain HTML: the whole design system is in a
  `<style>` block at the top of each file, and the screen is the markup under it.
  No build step, no framework, no assets — the only external reference is the Google
  Fonts link (Inter, EB Garamond, JetBrains Mono).
- **`canvas.json`** — the layout: eleven pages, each artboard's `x`/`y`/`w`/`h`, its
  title, and the note that sits above each page.

**Double-click any of them and they open in a browser.** They carry an `<x-dc>`
wrapper and a `./support.js` reference for the canvas editor; a plain browser ignores
both and renders the artboard exactly as the PNG shows it. (The console logs one 404
for `support.js`. That is the only effect.)

## Which file is which

| Name | Screen |
|---|---|
| `Main`, `CoverDark` | the cover — contents, settled figures, the rules |
| `Welcome*`, `WelcomeD*`, `Logo*` | launch, welcome, the mark and wordmark |
| `Onb*`, `OnbD*` | onboarding, all six steps |
| `Home*`, `HomeCycle*`, `HomeStates*`, `More*`, `DHome*` | Home and every state |
| `Plan*`, `DPlan*` | the plan |
| `Transactions*`, `DTransactions*` | the ledger |
| `QA*`, `QAD*` | quick add |
| `Debts*`, `Record*`, `RecordD*`, `Forms*`, `FormsD*`, `DDebts*` | debts, goals, forms, the record |
| `Months*`, `DMonths*` | closed cycles |
| `Settings*`, `Import*`, `DSettings*` | settings and import |
| `Zakat*`, `DZakat*` | zakat |
| `Prim*`, `Style*`, `Print` | primitives, palette and type, the printed A4 record |

A leading or trailing `D` means the 1440 desktop version; `Light` / `Dark` is the theme.
Each name is also the artboard's title on the canvas.

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
  --artboard Main.dc.html --artboard CoverDark.dc.html ...   # every file, in canvas.json order
```

`Main.dc.html` is the entry artboard — it is the cover, and the canvas opens on it.

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
