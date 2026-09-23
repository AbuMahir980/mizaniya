# Open items

*Written 22 September 2026 by the designer against `main` at `a7dde67`; section D added
23 September against `376a7de`. For the build agent. Work through it on its own branch,
tick each box as it lands, and when every box is ticked fold anything worth keeping into
`CONTEXT.md` and delete this file in the same PR.*

**Nothing in `docs/design/` needs regenerating.** Every file an item below needs is
already there — this list is about wiring it up, not making it. Section D came out of
the two questions #56 correctly logged instead of deciding; the artboards, `tokens.md`
§3 and the previews were all re-cut on 23 September, so the design side is done and
what is left is code.

---

## A · Housekeeping — do these first

- [x] **1 · Advance `.peer-ai-state.json`.** It still names #10 (T3, rollover) as the next
  ticket, but T3 merged in PR #35 on 11 September, followed by PR #36 (a naming
  refactor). Confirm #10 is closed on GitHub, move it to `ticketsCompleted`, set `ticket`
  to **#11 — T4 · `core/debt`**, run `npm run verify` and record the result in
  `lastVerifyResult`, and set `lastUpdated`. If this is not done, the next session starts
  T3 again.
  **Done 22 September.** #10 confirmed closed; `ticket` is now #11. Verify needed an
  `npm ci` first — `node_modules` was missing on this machine, so the first run failed
  with `eslint: command not found` rather than anything to do with the code. Green after
  that: naming, lint, typecheck, **102 tests**, build.
- [x] **2 · Bring `CONTEXT.md` up to date.** It stops at 11 September:
  - *Current State* still says SHARED RULES is next and "the repo is still documents
    only". Replace it with where the build actually is.
  - *What Was Done — By Day* has no entry for SHARED RULES (PR #30) or for T1–T3 and the
    PR #36 refactor.
  - *What's Next* still lists producing the design.
  - *Package / Asset Locations* says `docs/design/` is "empty until the design stop";
    *Diagrams / Design files* says "none yet". Both are stale.
  - Add `docs/design/brand/` to the asset table.

  **Done 22 September.** All five points, plus three things worth naming: the day log is
  now newest-first and the three broken headings in it are repaired; the *Environment*
  section was also stale, and now records that this client offers none of the ten skills
  and which three phases still need them; and thirteen decisions from 11-12 September were
  added to *Key Decisions*, which had stopped at the design stop.

## B · Design → code — what the design has that the code does not

- [x] **3 · Load the three typefaces** — **T10**.
  `src/design/tokens.css` names EB Garamond, Inter and JetBrains Mono, but nothing loads
  them: no `@fontsource` package, no `@font-face`, no link in `index.html`. None of the
  three ships with macOS, Windows or Android, so today the app renders in Georgia, SF and
  Menlo. The design's whole voice depends on these faces.
  - Self-host them — this is a local-first app and must look right offline. Add
    `@fontsource/eb-garamond`, `@fontsource/inter` and `@fontsource/jetbrains-mono`, and
    import only the weights `tokens.md` §3 uses: **EB Garamond 500 and 600 · Inter 400,
    500, 600, 700 · JetBrains Mono 400 and 600**, Latin subset.
  - **Do not add Amiri.** The only Arabic in the app is the wordmark, and it ships as an
    outlined SVG in `docs/design/brand/`.
  - Done when the primitives page renders its titles in EB Garamond with the network off.

  **Done 23 September in T10 (#17), PR #45.** Self-hosted, Latin subset, only the
  weights `tokens.md` §3 names. Written as explicit `@font-face` blocks rather than
  Fontsource's own stylesheets, because those list a legacy `woff` beside every
  `woff2` and the bundler emitted **both** — every face shipped twice, about 261 kB
  of duplicate payload for browsers that no longer exist. Bundle excluding fonts is
  155 kB gzipped against the 250 kB budget (spec §401).

- [x] **4 · Wire in the brand files** — favicon and the `Mark` component in **T10**,
  manifest icons in **T11**.
  Everything is in `docs/design/brand/`, and its `README.md` gives the exact file
  destinations, the `index.html` head tags and the manifest `icons` block. In short:
  - copy the favicons, the Apple touch icon and the four PWA icons into `public/`;
  - add a `Mark` primitive to `src/ui/` from `mark.svg` — its strokes are
    `currentColor`, so the component sets the colour. The sidebar lockup, the welcome
    screen and the printed record all use it;
  - do not build a JavaScript splash screen — the browser builds the launch screen from
    the manifest.

  **Favicon and `Mark` done 23 September in T10 (#17), PR #45.** The seven icon files
  are in `public/`, and the head tags are in `index.html` verbatim from
  `brand/README.md`. `Mark` is inlined at `src/ui/mark.tsx` rather than an `<img>`, so
  its `currentColor` strokes take the colour of whatever it sits in — one file for the
  sidebar, the welcome screen and the printed record. **Manifest icons done 23 September in
  T11 (#18), PR #47** — the `icons`, `background_color` and `theme_color` block
  verbatim, both purposes, and no JavaScript splash screen. **Item 4 is complete.**

- [x] **5 · Build the welcome screen** — add it to **T12**'s acceptance criteria.
  It was designed after PAGE SPECS, so no ticket mentions it. Artboards:
  `canvas/WelcomeLight.dc.html`, `WelcomeDark`, `WelcomeDLight`, `WelcomeDDark`.
  Behaviour, since the spec does not cover it:
  - shown on first run only, before onboarding step 1 — under the same "no settings
    yet" condition T12 already uses to redirect to `/welcome`;
  - **Get started** → onboarding step 1;
  - **I have an export to restore** → the import flow from spec §7.9 (T9 / T20), with
    the same confirm, result and refusal states. A successful import lands on Home and
    skips onboarding, because the export already carries the settings. A refused import
    returns here, and ends, as every refusal does, with "Nothing has changed.";
  - the Arabic under "Mizaniya" is `brand/wordmark-arabic.svg` inlined, coloured `soft`.

  **Done 23 September in T12 (#19), PR #48.** The Arabic is inlined as outlined
  paths in `src/ui/wordmark-arabic.tsx` — `currentColor`, so no Arabic typeface
  enters the bundle for one word. The restore path runs the real import flow: a
  successful file lands on Home and skips onboarding; a refused one returns here
  and ends with "Nothing has changed."

  **Its visual detail was not checked, and this item was ticked anyway.** The
  three promises shipped as a plain text list with no icons, and the wordmark at
  `text-title` where the artboard draws 42/48 — found by the owner running the
  app, fixed 24 September in [#62](https://github.com/AbuMahir980/mizaniya/issues/62).
  The item listed behaviour only, so nothing here was wrong; **a list of
  behaviours is not a design-quality pass**, and ticking one as though it were
  is how a screen ships looking unfinished.

- [ ] **6 · Add a `Tabs` primitive** — **T17**.
  Debts & Goals switches between two views with underline tabs, in every artboard, but
  `src/ui/` has only `Segmented`. They are different controls: **Tabs switch a view**
  (Debts | Goals); **Segmented switches a value** (Today | This cycle). `tokens.md` §7
  now has a Tabs row (added 22 September), and the primitives sheet shows it: `line`
  bottom border, `soft` inactive, `ink` active with a 2px `emerald` underline, 46px.
  Radix Tabs is already a dependency.

**Items 3-6 are code, on tickets that have not started.** They were copied into the
acceptance criteria of #17 (T10), #18 (T11), #19 (T12) and #24 (T17) on 22 September, so
the build agent meets them on the board rather than only here. The boxes stay unticked
until those tickets ship, which is also when this file can be deleted.

## C · Corrections to the design itself — no code change, read so nothing regresses

- [x] **7 · The primitives sheet was redrawn on 22 September.** The 10 September version
  disagreed with `tokens.md` in five places. `src/ui/` already follows `tokens.md`, so the
  code is right and **must not be changed toward the old picture**. The corrections:

  | Was drawn | Now matches `tokens.md` and the code |
  |---|---|
  | A rose **Delete** button | **No danger button.** Deleting is a quiet or secondary button that confirms |
  | Field error with a rose border and rose text | Neutral: `line` border, `ink` message |
  | Disabled as 38% opacity | `track` fill, `faint` text |
  | A 3px translucent halo on every control | 2px emerald ring at 2px offset; only fields use the 3px `em2` halo |
  | Invented hover and pressed colours | Pressed as the code does it (primary at 90% opacity) |

  It also gained the Slider and Tabs, lost a Checkbox no screen uses, and its banners now
  use the three tones in `banner.tsx`.

  **Checked against the source, 22 September — all five hold, no code changed.**
  `button.tsx` has no danger variant and its header says why. `field.tsx` styles an error
  with a neutral border and an `ink` message. Disabled is a `track` fill with `faint` text
  in both. The global ring in `index.css` is 2px emerald at 2px offset, and the 3px `em2`
  halo appears only on the field control. Pressed is `active:opacity-90` on the primary.

- [x] **8 · Quick Add's edit sheet: Delete is neutral** — **T14 / T16**. The 10
  September artboard drew "Delete this movement" in rose. It is now a quiet button, per
  the same rule. `canvas/QALight.dc.html` and `QADark` are corrected.

  **Nothing to regress toward, 22 September.** `Button` has no danger variant at all, so a
  red Delete is not merely discouraged — it cannot be built without adding one. The
  corrected artboards are committed.

---

## D · The type questions #56 raised — answered 23 September

*Outside review of the Quick Add artboards asked whether its serif title was a mistake.
It was not, but chasing it down found two real faults and one measurement worth keeping.
`tokens.md` §3 is rewritten; §3.1 is new and holds the reasoning. The artboards and all
67 previews are re-cut.*

> **Housekeeping first — these landed in the worktree while T16 was in flight.** The
> `tokens.md` §3 rewrite and the 67 re-cut previews were swept into **`c400f07`
> "feat(core): the eight movements (T16)"** on `feature/transactions-and-editing`, which
> does not mention them; the 67 `docs/design/canvas/*.dc.html` files were still
> uncommitted at the time. None of it belongs in a `core/movement` commit. Split the
> design changes into their own commit — or their own PR — before T16's is reviewed, so
> the squash onto `main` does not carry a design drop under a feature message.*

- [x] **9 · A sheet title takes the voice face** — `src/ui/sheet.tsx`.
  The settled rule, now in `tokens.md` §3: **the voice face names a surface; the
  structural face names a part of one.** A bottom sheet or dialog *is* the surface while
  it is open — it holds focus, Escape closes it, everything behind it is inert and
  scrimmed — so its title is a `title`, not an `h2`. A heading *inside* a screen stays a
  `lab`, which is what #56 got right on Home.
  - `sheet.tsx:57` — `font-structural text-h2` → **`font-voice text-title`**. That is the
    whole change.
  - The reviewer was seeing something real, but it was the **size**, not the face: the
    artboards set those titles at 24px, and EB Garamond's x-height is 0.407em against
    Inter's 0.546, so 24px serif is optically Inter 18px — *below* the `h2` it was meant
    to lead. An undersized title reads as a misapplied serif. **The artboards are now
    30 / 36**, which is `text-title` exactly as `tailwind.config.ts` already defines it.
  - One addition: `tokens.md` §3 now gives `title` **34 / 40 at 1440**, which the
    artboards have always drawn and the config has no override for. Add the desktop step.

  **Done 24 September in #60.** `sheet.tsx` takes `font-voice text-title`. The
  desktop step is a token rather than a `desktop:` variant on eight call sites —
  `--size-title` / `--leading-title` in `tokens.css`, 30/36 and 34/40 at 1440,
  read by the `title` step in `tailwind.config.ts`. One definition, every call
  site responsive, and none of them able to forget.

- [x] **10 · Home's first section is two sections, not one disputed name** — **T13**.
  Neither label was wrong. Page specs §429 sits inside an ASCII sketch of the
  **superseded** 2×2-tile Home and is not a copy specification — §7.2 (lines 462–463) is,
  and it already says *"sorted by what is left, worst first."* The artboards label two
  different things at two widths, and the code only built one of them:
  - **1440 (`DHomeLight`)** — the full table of all eight, headed **Categories**. This is
    what `home-screen.tsx` has, and it is correct at this width.
  - **360 (`HomeLight`)** — a **ranked subset**: only the categories that are over,
    headed **Needs attention** with a rose `2 of 8` pill, and a **Show all 8 categories**
    link beneath. Eight rows at 360 push *Safe to spend today* off the screen, and that
    figure is the reason Home exists. This is missing from the build.
  - **The heading names what the list is showing.** That is the rule, and it settles the
    state nobody specified: when nothing is over, the mobile section shows the worst three
    and is headed **Categories**, with the same *Show all* link. There is no
    "Needs attention · 0 of 8".

  **Done 24 September in #61.** The two render **one or the other**, not both
  behind `desktop:hidden`: they carry different content, so hiding a duplicate
  would leave two identical `Categories` headings and eight repeated rows in the
  document. `useMediaQuery` is new for this, and answers `true` without
  `matchMedia` so every existing test keeps the fuller layout.

  Found on the way: the table listed **all twelve** categories where the
  artboards draw **eight**. Protected lines are money already moved where the
  plan promised, so `statusOf` gives them `ok` unconditionally — four rows that
  could never need attention, and `2 of 8` reading `2 of 12`. Now filtered, and
  the desktop table carries its count badge as drawn. The columns still differ
  from the artboard — [#65](https://github.com/AbuMahir980/mizaniya/issues/65).

- [x] **11 · The voice face is 500 on light and 600 on dark** — `tokens.css` /
  `tailwind.config.ts`.
  Measured from the outlines: EB Garamond's thinnest stroke is 0.034em — **1.02 device
  pixels at 30px on a 1× screen, and under one pixel at every smaller size.** A stroke
  with no whole pixel to land on is drawn by antialiasing alone, and light-on-dark that
  reads as washed out. Weight 600 takes the hairline to 0.0385em and clears the pixel at
  every title size. On a 2× screen the problem never appears, which is why it surfaces in
  review on a desktop monitor and not on a phone.
  - Add a `--weight-voice` custom property: **500** in the light block, **600** in the
    dark block, and have the `title` step take `fontWeight: 'var(--weight-voice)'`.
  - The canvas does exactly this via `--serw`, so the artboards already show the result.
  - `@fontsource/eb-garamond` 600 is already imported under item 3, so nothing new to
    load.
  - **If 600 still will not hold** on a real 1× dark screen now that the fonts actually
    load, the replacement is **Source Serif 4** — same old-style skeleton, x-height
    0.475em, hairline 0.055em, clears a device pixel from 18px up. Do not make that swap
    without the owner: the bookish register is the design, not a decoration on it.

  **Done 24 September in #60.** `--weight-voice` is 500 in the light block and
  600 in both dark blocks, and the `title` step reads it. A test pins all three,
  because a token that differs between themes is exactly the one that can
  silently stop differing. Not swapped for Source Serif 4 — that needs the owner.

---

## What is already complete — do not redo

- `tokens.md` → `src/design/tokens.ts` and `tokens.css`: all 33 colours match, and
  `tokens.test.ts` fails the build if the two copies drift.
- About twenty primitives in `src/ui/` with their states, and the gallery at
  `src/app/primitives-page.tsx`; 44px targets audited.
- Every screen at 360 and 1440, light and dark, every state — 67 artboards in
  `docs/design/canvas/`.
- The four stale figures the design stop found (₦8,666.66, the bare minus sign) —
  fixed on 10 September.
- `PROPOSED-seed-additions.md` — merged into `docs/seed-data.md`, kept as the record.
