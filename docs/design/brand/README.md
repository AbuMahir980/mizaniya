# `docs/design/brand/` — the mark, as files

The mizan beam — a set of scales, drawn a notch off level — exported as the files the
app actually needs. Generated on 22 September 2026 from the same path data as
`../canvas/LogoLight.dc.html`, so these files and the design cannot disagree.

**Nothing here needs regenerating.** Copy, wire up, done.

## Where each file goes

| File | Copy to | Used by | Ticket |
|---|---|---|---|
| `favicon.svg` | `public/favicon.svg` | Browser tab. Switches to the dark emerald on its own under `prefers-color-scheme: dark` | T10 |
| `favicon.ico` | `public/favicon.ico` | Browsers that ignore SVG favicons (16, 32, 48 inside) | T10 |
| `apple-touch-icon.png` | `public/apple-touch-icon.png` | iOS home screen. 180px, square and opaque — iOS rounds the corners itself | T11 |
| `icon-192.png`, `icon-512.png` | `public/` | Web app manifest, `purpose: "any"` — the rounded tile | T11 |
| `icon-maskable-192.png`, `icon-maskable-512.png` | `public/` | Web app manifest, `purpose: "maskable"` — full bleed, mark inside the 80% safe circle | T11 |
| `mark.svg` | inline, as a `Mark` component in `src/ui/` | Sidebar lockup, welcome screen, printed debt record. Strokes are `currentColor`, so the component sets the colour | T10 |
| `wordmark-arabic.svg` | inline, beside `Mark` | ميزانية on the welcome screen. **Letters are outlined** — the app never loads Amiri for one word. `currentColor`; set it to `soft` | T12 |
| `mark-light.svg`, `mark-dark.svg` | — | The mark in fixed emerald, for anywhere `currentColor` is not available (an `<img>`, a README) | — |
| `wordmark-stacked-{light,dark}.svg` | — | Mark + Mizaniya + ميزانية. For the repo README and anywhere outside the app | — |
| `wordmark-inline-{light,dark}.svg` | — | Mark + Mizaniya on one line | — |
| `wordmark-inline-print.svg` | — | Black, for the printed debt record if it is rendered as an image rather than live text | T18 |
| `app-icon.svg`, `app-icon-maskable.svg` | — | The sources the PNG icons were rasterised from | — |

## `index.html` head (T10)

```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="icon" href="/favicon.ico" sizes="48x48" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<meta name="theme-color" content="#F7F3EA" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#0A0D10" media="(prefers-color-scheme: dark)" />
```

## Manifest icons (T11)

```json
"background_color": "#F7F3EA",
"theme_color": "#0F5C3C",
"icons": [
  { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
  { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
  { "src": "/icon-maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
  { "src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
]
```

The launch screen is the browser's own, built from `name`, `background_color` and the
icon. Do not build a JavaScript splash screen — it would only delay the first frame.

## Sizes the wordmark is set at

The Latin is EB Garamond 600 — live text in the app, outlined in the SVG lockups.
`tokens.md` §3 does not carry these: a step is a rung other screens reuse, and this
exists for one string.

| Where | Wordmark | Mark |
|---|---|---|
| Launch panel, 360 | 31 / 36 | 74px, bare |
| Welcome, 360 surface | 42 / 48 | 51px, inside the app-icon tile |
| Welcome, 1440 surface | 52 / 58 | 49px, inside the tile |
| Desktop sidebar lockup | 24 | 25px, bare |

The Arabic under it is `wordmark-arabic.svg`, set at 0.62 of the Latin's size,
coloured `soft`, aligned to the Latin's right edge.

## Rules that travel with the mark

- **One colour.** Emerald on paper, the lighter emerald on dark, white on an emerald tile,
  black in print. Never two colours, never a gradient, never filled.
- **Never level the beam.** The tilt is the idea — the app says whether today is in
  balance, and most days it is not quite.
- **The Arabic sits under the Latin, never above it, and never carries a figure.**
- **Below 16px the pans close up.** Use the app icon instead of the bare mark there.
- **The tile's corner is 22/84 of its own size** — the iOS superellipse ratio, so it
  scales with the icon: 24px at the size the brand sheet draws it, 134px at 512. It is
  brand geometry and is deliberately *not* on `tokens.md` §5's radius scale, which
  governs UI surfaces. Do not round it to 22 or 30 to make it fit.

## Colours used

From `../tokens.md`: emerald `#0F5C3C` / `#4ECB8B`, on-emerald `#FFFFFF` / `#052214`,
ink `#171A17` / `#E9EFF3`, soft `#5A615B` / `#93A3AF`. Latin is EB Garamond 600, Arabic
is Amiri 400 — both outlined in the wordmark files.
