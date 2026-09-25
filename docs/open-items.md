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

## E · The three questions from the Welcome rebuild — answered 23 September

*All three were right to raise. One of them found that a token this file has leaned on
since the design stop never described the design at all. `tokens.md` §3 and §5 and
`brand/README.md` are updated; the canvas is re-cut and republished.*

- [ ] **12 · The space scale was a fiction — §5 is now a 2px grid** —
  `tailwind.config.ts`.
  You were right that matching the artboards meant writing arbitrary values, and right
  that the replaced theme exists to stop exactly that. But the fault was not the four
  values Welcome uses. An audit of all 59 product artboards found **55% of spacing
  values off the nine-step scale**, and **10px — the single most-used spacing value in
  the design, on every board — was not on it at all.** The scale was written
  aspirationally after the drawings and never matched them, so the guard could only
  ever be satisfied by fighting the design.
  - §5 is now **a 2px grid**: every spacing value is even. Common steps are named
    (8 · 10 · 12 · 14 · 16 · 20 · 22 · 24 · 26 · 30 · 36) for ergonomics, but the rule
    is the grid, not the list.
  - **1–4px is optical, not spacing** — a hairline offset, a glyph nudge. It belongs
    to the component and never becomes a token. Do not snap those to 4.
  - The drawings were snapped onto the grid at the single point every artboard is
    written, so this cannot drift again. **Nothing moved by more than 1px**, but every
    board changed, so re-pull the canvas before comparing anything.
  - Rebuild the theme as the grid: keep named tokens for the common steps, and admit
    any even value. The guard survives — 11px and 23px are still impossible — and it
    stops contradicting the drawings.

- [ ] **13 · `promise` is a real step; `lockup` is not** — `tailwind.config.ts`,
  `tokens.md` §3.
  - **`promise` collapses into a new `statement` step**, now in §3's table:
    **23 / 30 · 29 / 37 on a 1440 surface**, voice face. It is not a one-off — every
    empty-state sentence in the app does the same job at the same rung, and they had
    drifted across 20, 21, 22, 23, 24 and 27px. All of them are re-cut onto it. Use
    `text-statement` for the Welcome promise *and* every empty state.
  - **`lockup` stays out of the type table.** It is the wordmark — brand, not type,
    existing for one string. Its sizes now live in `brand/README.md` beside the mark
    (31/36 launch · 42/48 Welcome 360 · 52/58 Welcome 1440 · 24 sidebar). Keep the
    config token and the custom properties; just don't call it a type step.
  - New rule in §3, because it settles the next question of this shape:
    **a step follows its surface's width, not the viewport.** A 480px dialog on a 1440
    screen takes the 360 step. Only a surface that is itself 1440 wide takes the wider
    one.
  - **The app-icon radius is not a radius token.** Its corner is 22/84 of the tile's
    own size — the iOS superellipse ratio — so it scales with the icon (24px as drawn,
    134px at 512). `brand/README.md` owns it. Leave §5's radius scale alone.

- [ ] **14 · The movement labels are past tense in the artboards now** — **T14 / T16**.
  You were right and the artboards were wrong. `Income · Expense · Move to savings ·
  Take from savings` → **`Received · Spent · Moved to savings · Took from savings`**,
  everywhere they appear: the Transactions type filter, the movement rows, the Quick
  Add type chip, and the category-detail sub-line. Ordering is unchanged.
  - One the review did not catch: the cycle-summary table header read
    `Cycle | Income | Spent | Saved | Debt paid | Ended with` — three past-tense words
    and one noun. It is `Received` now.
  - The code already ships the plain wording, so no code change beyond keeping the four
    strings in step with core.

---

## F · The nine from the onboarding rebuild — answered 24 September

*The copy question was right and was bigger than the six labels it named. The
canvas is re-cut, `tokens.md` gains §10, and there is a new board:
`canvas/OnbPickLight` / `OnbPickDark`.*

- [ ] **15 · The copy pass is done — take the words from the canvas, not from
  memory** — **T13 / T14 / T15 / T16**.
  One pass over all 59 boards at the generator level, so label copy cannot drift
  per screen the way the movement labels did. `tokens.md` **§10 · Words** is new
  and holds the rule and the full table. The rule in one line: **a field asks a
  question; a column head names a thing.**

  | Was | Is | Where |
  |---|---|---|
  | Counterparty | Who | debts table |
  | Counterparty name | Their name | debt form |
  | Direction | Who owes who? · Which way | debt form · debts table |
  | Agreed repayment per cycle | How much each payday? | debt form |
  | Schedule · No schedule | Paying back · Nothing agreed | debts table · rows |
  | Projected gap | Short by | goals |
  | Funded by | Money comes from | goal form |
  | Amber threshold | Turn amber below | Settings |
  | **Unallocated** | **Free** | Plan |

  - `Unallocated` is the one that mattered: **Home has always drawn *Free* for the
    same quantity**, so two screens named one number two ways. Home's word wins.
  - **The printed debt record keeps its formal register** — *The parties*,
    *Witnesses*, *Terms*. It is not a screen; it is a record meant to have
    standing between two people, read by someone who was never in the app. Do not
    "fix" it.
  - **Nisab and hawl stay**, for the same reason you gave.
  - **The 12 September call stands** for `Protected`, `allowance` and
    `safe to spend`. They are plain English and they are the words on the
    switches — never the same class as `counterparty`. D1, D15, the page specs
    and the ADRs are untouched.

- [ ] **16 · The onboarding question is a `title`, not a `statement`** — **T12**.
  You read it right. All six were drawn at 29/37 — `statement` at its 1440 rung —
  which was wrong twice: the question titles its surface, and neither surface
  (390px panel, 620px card) fills the desktop frame. **Re-cut to `title`
  30 / 36 at both widths.**
  - §3's surface rule is sharpened so this is no longer a judgement call: **the
    wider step applies only to a surface that fills the desktop frame.** The
    1440 content area is 1180px. A 620px onboarding card, a 520px form dialog and
    Quick Add's 480px dialog all take the 360 step. So: **yes** to your question 3.
  - The same rule caught one more: the **1440 welcome promise** sits in a 520px
    card and was at 29/37. It is 23/30 now.

- [ ] **17 · Three interactions now have drawings** — **T12**.
  New board `canvas/OnbPickLight` / `OnbPickDark`, preview
  `01a-onboarding-pickers-360-{light,dark}.png`. All three are composed from
  primitives that already exist — a sheet, a field, a chip group — so nothing new
  enters the language.
  - **Salary day** is a **six-column grid of 1–31**, not thirty-one chips in a
    row and not a scrolling list. Thirty-one is small enough to read at a glance,
    and six columns keeps every target over 44px where seven lands at 43. Helper:
    *"Short months will use the last day — pick 31 and February pays on the 28th."*
  - **Add a category** is a sheet: Name, Type (Spent · Savings · Debt payment),
    primary **Add**.
  - **Edit a category** is the same sheet with the name filled, a **Save**
    primary and a quiet **Remove this category** — see item 18.

- [ ] **18 · Step 3 was missing its row control — nothing removed a category** —
  **T12**. Not intended: PAGE SPECS §7.1 calls the list editable and the step-3
  helper promises *rename, remove or add*, but no row carried a control. **Each
  category row now has a chevron and opens the edit sheet**, which is where a
  category is renamed, retyped or removed during onboarding. Remove is a **quiet
  button, not a red one** — the same rule as Quick Add's delete. The helper now
  says where the controls are.

- [ ] **19 · Step 6's callout shows the solved rate** — **T12**. You were right
  that ₦75,000 cannot be read at step 6 — it is the rent fund's *planned*
  contribution and there is no plan until Plan. **One correction to your build:
  there are six paydays, not five.** Seed-data's count of five is taken from
  5 October, after the 25 September payday; onboarding is 24 September, so 25 Sep
  is still ahead.
  - The sum, now in **`docs/seed-data.md` → "At onboarding, 24 September — a
    different sum"**: (900,000 − 400,000) ÷ 6, rounded **up** = **₦83,333.34 a
    payday**. Rounded up because a rate rounded down reaches ₦499,999.98 and
    misses.
  - The artboard reads: *"Put aside ₦83,333.34 a payday — that reaches
    ₦900,000.00 by 1 March, over six paydays, from the ₦400,000.00 you have
    already."* No shortfall, because at the required rate there isn't one.

- [ ] **20 · Step 5 gets a Continue, and Add another moves inline** — **T12**.
  Your reading of the intent was right — there was no way off the step — but a
  primary that changes label on form state is one the owner cannot predict.
  **"+ Add another" is now a link inside the form, exactly as step 3 already does
  for categories, and the footer is Back + Continue on all six steps.** Helper:
  *"Add as many as you have, in either direction. Continue when there are no
  more."*

- [ ] **21 · `tokens.md` §7 now specifies the field's label and helper** —
  no code change, you already fixed it. The row described fill, border, radius,
  height and states and said nothing about the label or the helper, which is why
  the primitive could be wrong everywhere and still look compliant. It now reads:
  **label 13 / 600 / `ink`, 8px above the box; helper 12 / 400 / `soft`, 8px
  below it** — which is what you measured off the artboards.

---

## G · Asked 24 September from the build side — answered 24 September

*This section is the question channel. **Answer in place**: write under each item,
change the heading to `answered <date>`, and tick the box if it needs code. Raise
anything new as a fresh lettered section. From now on questions land here rather
than in a message, so they sit next to their answers.*

- [x] **22 · A debt records what is owed, but not what has already been paid** —
  **T12 / T17 / T18**, issue
  [#85](https://github.com/AbuMahir980/mizaniya/issues/85).
  A debt is stored as **one** opening movement carrying the outstanding balance,
  so the model cannot tell these apart:

  | | Borrowed | Repaid so far | Outstanding |
  |---|---:|---:|---:|
  | What is recorded | ₦120,000 | — | ₦120,000 |
  | What may be true | ₦200,000 | ₦80,000 | ₦120,000 |

  Going forward it is correct — every repayment after onboarding is a real
  movement. **Historically it is silent.**

  - **Where it bites is the printed record, T18.** §10 calls it *"a record meant
    to have standing between two people, read by someone who was never in the
    app."* If it reads *"₦120,000 owed, began 24 September"* when the debt began
    in March and ₦80,000 is cleared, it misrepresents the relationship **to the
    other party**. That is the one place this is not cosmetic.
  - Smaller, but real: the app is about debts in both directions and shows no
    evidence of what has already been cleared. Someone 60% through a repayment
    sees a flat number.
  - **Step 5 already concedes the point** — it asks *"Date it began"*, so it
    accepts the debt predates the app, then asks nothing about what has happened
    since. Half a history.
  - **No schema change is needed.** `answers.ts` already turns one answer into a
    `Debt` plus a dated opening movement, so this is a **second** opening
    movement — `borrowed` the original, `repaid` what is cleared. The balance
    still derives and "transactions are the only facts" holds.
  - **The cost that needs care:** the amount field's label changes meaning from
    *outstanding* to *originally borrowed*. That changes what an existing answer
    means, so it is not only an addition.

  **Two questions:**
  1. Should **step 5** capture it, or does it belong only in Settings and on the
     debt form after onboarding? Onboarding is already six steps.
  2. If step 5 takes it, **how should the two amounts read** so nobody enters the
     outstanding figure into a field that now means the original?

  **Timing:** `DebtsLight` and `FormsLight` are being re-cut right now, so this
  is worth settling before that lands rather than after.

  ---

  **Answered 24 September.** You are right, and the printed record is the right
  place to have noticed it. It is the only artefact this app produces that
  someone outside the household reads, and the only one where being wrong has
  consequences the owner cannot correct by opening the app. A record that is
  wrong by default is worse than one that asks a further question.

  **1 · Step 5 takes it — as one optional field, not a seventh step.**

  Settings-only loses it. Nobody visits Settings to correct a document they have
  not printed yet, so most records would stay quietly wrong forever and the error
  would surface at exactly the wrong moment — in front of the other party. And
  the information is in the owner's head at that exact moment: an informal debt
  is remembered as *"I borrowed two hundred from him in March and I've paid back
  eighty."* Asking six months later is asking someone to reconstruct it.

  The weight is proportionate because the field is **optional and empty by
  default**. A debt taken out last week — the common case — costs one glance.

  **2 · Do not give it two amount fields. Ask the facts in the order the story
  happened and derive the rest.**

  The ambiguity you are worried about only exists if the app asks for the
  outstanding figure at all. It should not. `transactions are the only facts` is
  already the rule here: **the original amount and the repayment are facts; the
  outstanding is derived.** So step 5 reads, top to bottom:

  **The post-onboarding debt form takes the same shape.** Step 5 and *Add a
  debt* ask for one thing, so they ask it one way — leaving the later form on
  *Amount* would put both meanings of one number in the same app, which is item
  22 reintroduced one screen along. `FormsLight` / `FormsDark` / `FormsDLight` /
  `FormsDDark` are re-cut: mobile shows A. Friend, a debt with **no** history, so
  the two states are drawn side by side with step 5's Spouse; the empty dialog
  shows every placeholder and an em-dash in the read-out.

  | Field | I owe them | They owe me |
  |---|---|---|
  | amount | **How much did you borrow?** | **How much did you lend?** |
  | date | Date it began | Date it began |
  | history | **Paid back so far** *(optional)* | **They've paid back so far** *(optional)* |
  | — | *Outstanding · ₦120,000.00* | *Still owed · ₦120,000.00* |
  | schedule | How much each payday? *(optional)* | How much each payday? *(optional)* |

  The last-but-one row is **not a field**. It is a derived read-out under the two
  inputs, and it is what removes the failure you named: nobody can type the
  outstanding into a field that now means the original, because **there is no
  field for the outstanding**. It also self-corrects — an owner who ignores the
  history field and types the outstanding into the first one sees a read-out
  equal to what they typed, and has simply recorded less history than they could
  have. Nothing is wrong, only thinner.

  The amount label follows the direction chip, which is `tokens.md` §10 working
  as intended: a field asks a question, and the question changes with the answer
  above it.

  **3 · The printed record must separate what Mizaniya witnessed from what it was
  told.** This is the part that actually matters, and it is mine — the artboards
  are re-cut. `THE DEBT` becomes:

  ```
  Borrowed                    ₦200,000.00     12 March 2026
  Repaid before this record    ₦80,000.00
  Outstanding                 ₦120,000.00
  ```

  and `MOVEMENTS` carries one line above the table:

  > *₦80,000.00 was already repaid when this record was opened on 24 September
  > 2026. That figure was stated by the owner, not witnessed by Mizaniya. Every
  > movement below was.*

  A record meant to have standing must not present hearsay as its own
  observation. It can carry the owner's account — it should, or the record is
  incomplete — but it has to say which is which, or the reader cannot weigh it.

  `Amount at the start` is also gone: it was ambiguous the moment history
  existed (*the start of what — the debt, or the record?*). It is **Borrowed** or
  **Lent** now, and the date beside it is `openedOn`, not the movement date.

  **4 · On the cost you flagged — make the meaning change break the build.**
  Your read is right that this is not purely additive. The mitigation is to not
  let `amount` quietly change meaning: **rename it.** `DebtAnswer.amount` →
  `borrowedAmount`, plus `repaidBefore?: Kobo`. A stale call site then fails to
  compile instead of silently recording an outstanding figure as an original. The
  rest is as you described — a second opening movement, both dated `openingDate`,
  `openedOn` untouched as the relationship fact. Your existing comment on
  `openedOn` already had the hard half of this right.

  **5 · Seed data, so the case is visible.** The feature is untestable and
  undrawable while all three seeded debts are fresh. **Spouse** is the safe one to
  give a history: it has no schedule, and D3 keeps owed-to-you out of every
  figure, so nothing in any cycle changes. Added to `docs/seed-data.md`:

  | | |
  |---|---:|
  | Spouse — borrowed | ₦150,000, **8 March 2026** |
  | Repaid before the record | ₦90,000 |
  | Outstanding | **₦60,000** — unchanged |

  The pair of opening movements nets to the same ₦60,000, so cycle 2, the Home
  breakdown, Months and the zakat estimate are all untouched. Verified against
  the workings in §"Goals and debts on that day".


---

## H · The repositioning round — asked 25 September

*Answer in place: write under each item, change the heading to `answered <date>`,
and tick the box when the drawings land. The full context is
[docs/10-design-brief.md](10-design-brief.md) — read that first, it is short.*

**The headline: v1 now has accounts, sync and a paid tier ([ADR-009](adr/ADR-009-repositioning-v1-hosted-webapp.md)).
The 69 artboards you have all still stand, onboarding is untouched, and `tokens.md`
is not reopened.** What follows is additive.

- [ ] **23 · Does the sync indicator belong on Home, or only in Settings?** §J3 says
  a figure the app cannot vouch for must not look like one it can — so *something*
  has to show when there are unsynced changes. But Home's job is one clear money
  figure, and a sync badge competing with it may cost more than it earns. Your call,
  and it is the only one of these that touches a screen you have already drawn.

- [ ] **24 · Is a locked paid feature a separate screen or an inline treatment?**
  It has to say what the feature is and what it costs — a dead control with no
  explanation is a bug (**L2**). The risk is tone: a lock that feels punitive on a
  **budgeting** app is worse than having no paid tier. This is the hardest copy
  problem in the brief.

- [ ] **25 · Can "which budget do you keep?" be answered in one screen?** §I3:
  someone signs in on a device that already holds a different local budget. They
  must be *asked*, because merging two budgets has no correct answer. **Both options
  are destructive** and the person has to understand which is which. One screen, or
  a short flow?

- [ ] **26 · The reconciliation queue — the centre of the paid product, drawn
  nowhere.** *"₦12,000 left your account — which envelope?"* A list of detected bank
  movements each needing a category. It should feel like clearing a small inbox
  rather than doing data entry. Built as v1.1, so a single state is enough for now —
  but it is the interaction the subscription is actually selling.

- [ ] **27 · The disagreement screen must read as two people agreeing, not as
  software refereeing.** *"You set Food to ₦40,000. Your wife set it to ₦35,000. Do
  you agree?"* A shared household budget **is** an agreement between two people, so
  a disagreement about it is a conversation. Both amounts are kept until someone
  settles it. Built after launch; drawn now.

- [ ] **28 · The landing page** — done properly, not assembled from leftovers. The
  problem first (salary gone before the month ends, debts both ways, rent once a
  year), then the screenshots, then free vs paid honestly.

- [ ] **29 · One sentence that must never appear anywhere**, and it needs saying to
  whoever writes marketing copy as much as to you: ~~*"your bank data never touches
  our servers"*~~. It is **false** — movement arrives at the server before it is
  encrypted. The true claim is strong enough: *"we never store your bank data in
  readable form."* The wording on the landing page and on sign-up must be
  **identical**, because two slightly different privacy claims is worse than one
  plain one.

- [ ] **30 · Anything here that needs a figure `docs/seed-data.md` does not have** —
  say so rather than inventing one (repo rule 2). Likely candidates: a part-paid
  debt for the reconciliation screens, and a second person's name for the household
  drawings.

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
