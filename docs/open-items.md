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
  `apps/web/src/design/tokens.css` names EB Garamond, Inter and JetBrains Mono, but nothing loads
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
  - add a `Mark` primitive to `apps/web/src/ui/` from `mark.svg` — its strokes are
    `currentColor`, so the component sets the colour. The sidebar lockup, the welcome
    screen and the printed record all use it;
  - do not build a JavaScript splash screen — the browser builds the launch screen from
    the manifest.

  **Favicon and `Mark` done 23 September in T10 (#17), PR #45.** The seven icon files
  are in `public/`, and the head tags are in `index.html` verbatim from
  `brand/README.md`. `Mark` is inlined at `apps/web/src/ui/mark.tsx` rather than an `<img>`, so
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
  paths in `apps/web/src/ui/wordmark-arabic.tsx` — `currentColor`, so no Arabic typeface
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
  `apps/web/src/ui/` has only `Segmented`. They are different controls: **Tabs switch a view**
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
  disagreed with `tokens.md` in five places. `apps/web/src/ui/` already follows `tokens.md`, so the
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

- [x] **9 · A sheet title takes the voice face** — `apps/web/src/ui/sheet.tsx`.
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

## H · The repositioning round — asked 25 September, answered 25 September

> **UPDATED 25 September, and one earlier statement is withdrawn.** This section
> originally said *"the 69 artboards you have all still stand."* **That is no longer
> accurate.** Three decisions taken after it was written change the scope: desktop is
> now a first-class design target rather than an adaptation, motion and interactivity
> are in scope **as a system**, and the one-click demo is promoted to a **Must**.
>
> **What does still stand:** every 360 artboard, the whole token system, onboarding,
> and every behaviour in the page specs. The product did not change — how it presents
> itself on a large screen, and how it moves, did.
>
> Two briefs now: [10-design-brief.md](10-design-brief.md) for the app, and
> [11-landing-page-brief.md](11-landing-page-brief.md) for the landing page, which is
> its own project with full showcase motion.
>
> **New items 31–35 below are from that change.** Items 23–30 stand as asked.

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


  **Answered.** Home carries it in **one state only**, and it attaches to the figure
  rather than competing with it.

  The distinction §J3 needs is between two different worries that a single badge
  blurs. **Durability** — your changes have not reached the server — is real even on
  one device, but it is also the *normal* state of an offline-first app, so putting it
  on Home would light a warning up on a good day. **Accuracy** — another device has
  changes you have not got — is the only one that makes the figure itself doubtful,
  and it cannot happen on a single-device account at all, which is most of the free
  tier.

  So:

  | State | Home | Elsewhere |
  |---|---|---|
  | Up to date | nothing | Settings |
  | Unsynced changes, **one** device | nothing | Settings |
  | Unsynced changes, **two or more** devices | **a `small` line in `soft` directly under the hero** | Settings |
  | Offline | nothing new — the offline state is already drawn | top bar |
  | Failed · cursor expired | a `danger`/`action` banner, because these need a decision | Settings |

  The line reads *"Not synced since 09:14 — another device may have newer figures."*
  It sits under the figure because a caveat about a number belongs next to the number,
  not in a corner where it becomes chrome. A permanent badge is worse than none: it
  trains people to stop seeing it, and then it cannot work on the day it matters.

- [ ] **24 · Is a locked paid feature a separate screen or an inline treatment?**
  It has to say what the feature is and what it costs — a dead control with no
  explanation is a bug (**L2**). The risk is tone: a lock that feels punitive on a
  **budgeting** app is worse than having no paid tier. This is the hardest copy
  problem in the brief.


  **Answered: inline, and it is not a lock.** No padlock, no grey-out, no diagonal
  hatching, no crown, and the word *unlock* appears nowhere.

  The padlock **is** the punitive signal. It says *you are not allowed*, which is the
  wrong sentence to show someone managing scarcity, and it is also inaccurate — the
  free tier is a complete product, not a damaged one. What is paid for is **reach**:
  a second device, a second person, a bank connection. None of those are things the
  app is withholding; they are things that are not set up yet.

  So the treatment is an **empty state for a capability that is not turned on**, drawn
  in place, using components that already exist:

  - A normal row or card where the feature would be, carrying the feature's **own
    name**, one line of what it does, and what it costs. `card` fill, `line` border —
    the same as any other row.
  - **The control is live.** It opens the explanation. A dead control with no
    explanation is **L2**; a live control that explains itself is not a lock at all.
  - The verb is **"Turn on"** or **"Add"**, never "Unlock" or "Upgrade".
  - No rose, no ochre. This is not a warning or an error. `slate` at most.

  **Nothing anywhere depicts the free product as broken.** That is the rule the tone
  floor turns into, and it is checkable: if a screenshot of the free tier would make
  someone think something had failed, it is wrong.

  A separate screen exists only for the **tier comparison**, reached *from* those
  rows — never as an interstitial that gets in the way of something the person was
  already doing.

  **Lapsed** uses the same treatment as never-subscribed, with one added line naming
  what stopped. It must be indistinguishable in tone from the free tier, because it
  **is** the free tier.

- [ ] **25 · Can "which budget do you keep?" be answered in one screen?** §I3:
  someone signs in on a device that already holds a different local budget. They
  must be *asked*, because merging two budgets has no correct answer. **Both options
  are destructive** and the person has to understand which is which. One screen, or
  a short flow?


  **Answered: two steps, and a third door that is not destructive at all.**

  One screen is wrong — two destructive buttons side by side is a misclick waiting to
  happen, and there is no room to show what is being lost. A long flow is also wrong;
  this is rare and the person is mid-sign-in.

  **Before either choice, offer the export.** This is the actual design move, and it
  costs nothing because export already exists and already produces a real file. It
  turns an irreversible decision into a reversible one:

  > *Before you choose — save the budget on this device to a file. You can restore it
  > later, or on another device.*  **[ Export this device's budget ]**

  **Step 1 — recognise, do not label.** Both budgets side by side, identified by facts
  the person will recognise rather than by A and B: the number of movements, the date
  range, the current safe-to-spend, when it was last opened. Nobody can choose between
  *"local"* and *"remote"*; everybody can choose between *"23 movements since
  24 September"* and *"2 movements, started yesterday"*.

  **Step 2 — confirm what goes, by name and count.** *"The budget on this device —
  23 movements, 3 debts, 2 goals, since 24 September — will be replaced. This cannot
  be undone."* Explicit acknowledgement, not a second identical button.

  Neither option is styled as the safe one, because neither is.

- [ ] **26 · The reconciliation queue — the centre of the paid product, drawn
  nowhere.** *"₦12,000 left your account — which envelope?"* A list of detected bank
  movements each needing a category. It should feel like clearing a small inbox
  rather than doing data entry. Built as v1.1, so a single state is enough for now —
  but it is the interaction the subscription is actually selling.


  **Answered: one item at a time, never a list of forms.**

  A list of twelve rows each carrying a dropdown **is** data entry, whatever it is
  called. An inbox is one thing in front of you, a decision, and then the next thing.
  So the queue shows a single movement:

  - **The amount is the hero** — this is a money screen and the figure is what is
    being asked about. Payee and date beneath it in `small`/`soft`.
  - **Categories as chips, ordered by likelihood**, and **never pre-selected.**
    A pre-selected chip means someone tapping through quickly files things wrongly,
    and a wrongly filed movement is worse than an unfiled one because it is silent.
  - Escapes on the same surface: **Not mine** and **Already recorded** (which hands
    off to the duplicate flow, §M5).
  - **A count that falls.** *"3 of 8"* — the falling number is the reward, and it is
    why this feels like clearing something rather than feeding something.
  - Empty state: *"Nothing to sort."* That sentence is the whole point of the feature.

  **The queue never blocks anything.** It is a row on Home — *"8 movements to sort"* —
  that opens its own surface. A modal queue would make the paid feature feel like a
  toll gate on the free product.

  Motion is `motion.md` §3.11, and it is the one place the app is allowed a rhythm:
  the filed item leaves, the next arrives, exactly one thing moving at a time.

  **Blocked on figures** — see item 30.

- [ ] **27 · The disagreement screen must read as two people agreeing, not as
  software refereeing.** *"You set Food to ₦40,000. Your wife set it to ₦35,000. Do
  you agree?"* A shared household budget **is** an agreement between two people, so
  a disagreement about it is a conversation. Both amounts are kept until someone
  settles it. Built after launch; drawn now.


  **Answered.** Four decisions, and the fourth is the one that keeps it honest.

  **1 · Both figures are drawn as equals.** Same size, same weight, same colour, same
  distance from the edge. The instant one is styled as correct and the other as a
  conflict, software has refereed. No rose anywhere on this screen — a disagreement
  between two people about groceries is not an error state.

  **2 · Names, not roles.** *"You"* and the other person's name — never *yours* versus
  *theirs*, which frames one as the owner of the truth. The heading is the situation,
  not a verdict: **"You and <name> set Food differently."**

  **3 · Leaving it unsettled is a first-class choice**, not a failure to act. Three
  actions, and the third is not smaller than the others: keep ₦X · keep ₦Y ·
  **leave it for now**. Two people agreeing sometimes needs a conversation that does
  not happen in an app, and a screen that will not let you close it until you have
  overruled your wife is a screen that picks a fight.

  **4 · Say which figure the app is using meanwhile, and why.** Something has to be
  computed with. The honest and defensible choice is **the lower of the two**, stated
  in plain words on the screen:

  > *Until you agree, Mizaniya uses ₦90,000 — the larger of the two, so it never assumes
  > less is promised than might be.*

  **Corrected 25 September.** My original rule said *lower*, and §I item 40 showed it
  was backwards for a protected category: taking the lower figure for a Rent fund
  disagreement reserves less, which pushes safe-to-spend **up** — the exact harm the
  rule existed to prevent. The settled rule is **the higher of the two, with no
  exceptions**, and the sentence above is the only thing that changes on the screen.

  Worth recording why *no exceptions* rather than a per-type rule: a rule that switched
  on category type would decide which of two people "wins" on a property neither of them
  is thinking about while they disagree about groceries. That collides with the fourth
  decision above — the app must not look as though it prefers someone. One rule, said
  once, in both cases.

  **Blocked on figures** — see item 30.

- [x] **28 · The landing page** — done properly, not assembled from leftovers. The
  problem first (salary gone before the month ends, debts both ways, rent once a
  year), then the screenshots, then free vs paid honestly.


  **Answered — the brief's story order is right and I am not changing it.** What I am
  adding is the design decision that makes it hold together, because a landing page
  assembled from good sections still reads as leftovers without one.

  **The page is built from real screens at real size, and nothing else.** No device
  frames drifting in space, no abstract illustration of a phone, no gradient mesh. The
  argument of §2.2 — *the apps you tried do not work this way* — can only be made by
  showing a thing that does. Every screenshot comes from the canvas at its drawn size,
  in the light theme, with `seed-data.md` figures.

  **One structural idea carries §2.1 → §2.3:** the page opens on the reader's problem
  in words, and the first thing they see after it is the answer as a **screen**, not
  as a sentence about a screen. Recognition, then why the others failed, then the one
  number — the argument is that the third thing resolves the first, and putting a
  stock image between them breaks it.

  Sections 4 through 7 are evidence, and evidence gets **quieter** treatment than the
  opening, not louder. The trust section (§2.7) is the one most landing pages dress up
  and the one that should be plainest: prose, no icons, no badges. Fixed wording from
  `tokens.md` §10.1 — see item 29.

  Sequenced after the app work; the app's 1440 rework (item 31) produces the
  screenshots this page is made of, so it has to come first.

  **Delivered 25 September — four boards.** `Land` and `LandPhone`, light and dark.

  | Board | What it is |
  |---|---|
  | `Land` · 1440 | The nine sections in the brief's order, on alternating `bg`/`card2` bands |
  | `LandPhone` · 390 | Designed, not adapted. The three-column sections stack against hairlines; the proof screenshots stack at 88% rather than becoming a clipped carousel, because a strip of a screen is not proof of anything |

  **What is deliberately not in the hero: any picture at all.** §2.1 and §2.2 are words
  only, so the first image on the page is the answer as a screen — the real Home at its
  drawn size with `seed-data.md` figures. That is the one structural idea the page has,
  and a stock image between the problem and the answer would break it.

  The trust section quotes `tokens.md` §10.1 rather than restating it, and the build
  asserts the approved string appears **and** that the false sentence does not — in the
  rendered markup, rather than in my memory of having avoided it. It also asserts no
  *unlock* / *upgrade* / *premium* vocabulary anywhere, per item 24.

  **Pricing is a placeholder**, per item 30 #5: the space is drawn, the figure is
  ₦—, and the card says in plain words that the price is not settled rather than
  leaving a blank that reads as a bug.

- [x] **29 · One sentence that must never appear anywhere**, and it needs saying to
  whoever writes marketing copy as much as to you: ~~*"your bank data never touches
  our servers"*~~. It is **false** — movement arrives at the server before it is
  encrypted. The true claim is strong enough: *"we never store your bank data in
  readable form."* The wording on the landing page and on sign-up must be
  **identical**, because two slightly different privacy claims is worse than one
  plain one.


  **Recorded, and structurally, not as a note.** The exact approved string now lives in
  **`tokens.md` §10.1** — one copy, in the file that already wins on conflict:

  > **We never store your bank data in readable form.**

  The landing page and the sign-up trust panel **quote that line** rather than each
  writing their own, which is the only way two places stay character-identical over
  time. The false sentence is named there as never-write, with the reason — movement
  reaches the server before it is encrypted — so that whoever finds it later
  understands why rather than just obeying. The three supporting claims (keys outside
  the database, access logged and askable-for, bank access read-only) are fixed
  wording in the same place.

  It is in §10 rather than in a brief because briefs get finished and closed, and this
  has to still be true in a year when someone is writing an app-store description.

- [x] **31 · Which 1440 screens genuinely need rework, and what earns the width?**
  The central question of the desktop decision. Home at 1440 should not be a 360
  column centred in grey — but what fills it? The category table beside the gauge? The
  debt list beside the goals? **Your call, and it decides how much of the set is
  redrawn.** Likely candidates: Home, Transactions, Plan, Debts & Goals. The forms and
  sheets may be fine as they are.


  **Answered. Four screens, and the principle is not "more fits".**

  The test a second column has to pass: **is this something you want to look at *while*
  looking at the first column?** Anything that fails it is a scroll, and a scroll is
  fine — that is what the phone does.

  **Home — the width holds the workings.** *Safe to spend* answers *can I spend?* The
  question every person asks next is *why is it that number?*, and today they have to
  scroll to find out. So: **left, the answer** — gauge, figure, today's chart. **Right,
  the reason** — *Where your money is*, then the categories worst-first, full table, no
  *Show all*. The relationship between the two columns **is** the insight the product
  sells, and on a phone it is the one thing the layout cannot show.

  **Transactions — the width buys a filter rail that does not move.** Filters currently
  stack above the list, so changing one scrolls the list away. At 1440 they become a
  persistent left rail; the list keeps its place; and the rows become real columns
  (date · category · note · amount · balance) instead of stacked cards.

  **Plan — withdrawn on 25 September. It does not need rework.** I said the width would
  buy *editing without covering the total*, on the premise that editing an envelope is a
  sheet that hides the figure it changes. **That premise is false at 1440** — the desktop
  Plan already edits inline, with the amount as a field in each row and *Free* standing in
  the header, so the fault I proposed to fix does not exist at this width. It exists at
  360, where it is correct as drawn. Changing Plan to prove a point in this answer would
  have been the rework equivalent of a flourish.

  **What *would* earn Plan's width is a column it cannot have yet:** last cycle's actual
  beside this cycle's planned. *"You planned ₦90,000, you spent ₦78,000"* is the single
  most useful thing to see while deciding an amount, and it passes the test above — you
  want it **while** looking at the planned figure, not on another screen. `seed-data.md`
  carries that pair for **Food and groceries only**; the other seven categories have no
  cycle-1 actual, and repo rule 2 says I do not invent them. **Raised as §I item 48.**
  Until it exists, Plan stays as drawn.

  **Debts & Goals — the width buys the removal of a control.** Both lists fit side by
  side, so **the tabs go away entirely at 1440.** The best thing width can buy is
  sometimes one less thing to navigate.

  **Not reworked, and correct as drawn:** every form, sheet and dialog (480–620px —
  they take the 360 step per §3's surface rule and are already right), onboarding,
  welcome, the printed record, Settings, Zakat, Import, and every 360 board.

  **Delivered 25 September — six boards, not eight,** because Plan was withdrawn:

  | Board | What changed |
  |---|---|
  | `DHome` · light and dark | The figure and the daily chart move to a 420px left column; *Where your money is* and the **full categories table** move up beside them. Goals and debts drop below as a two-up. What you see without scrolling is now the figure **and why it is that figure** — Health at 140% sits beside the number it explains |
  | `DHomeStates` · light and dark | The same composition across ok · amber · red · no-plan · empty · offline |
  | `DTransactions` · light and dark | The filters become a **standing 236px rail**; the whole filter set is visible at once instead of behind three chevrons, and changing one no longer scrolls the list away. All three states |
  | `DDebts` · light and dark | **The tabs are gone.** Both lists side by side, goals below as a table. The board is one screen now, not two |

  Every 360 board, every form, sheet and dialog, and Plan at both widths are untouched.

- [x] **32 · `docs/design/motion.md`** — a sibling to `tokens.md`, authoritative the
  same way. Named durations (a small scale, two or three values), named easings and
  when each applies, an explicit list of what animates, and a **reduced-motion
  fallback for every entry**. Two constraints from our side: nothing animates on the
  path to a figure, and **money never counts up on first paint** — a number mid-count
  is a number nobody can read, and reading it is the product.


  **Delivered: [`docs/design/motion.md`](design/motion.md).**

  Three durations (`fast` 120 · `base` 180 · `sheet` 240 in / 160 out), two curves, an
  **exhaustive** table of what animates with a reduced-motion fallback on every row,
  an explicit never-animates list, and the pointer and keyboard states from item 35.

  Both of your constraints are **§0**, above everything else, and one of them extended
  further than you asked: *nothing animates on the path to a figure* also rules out the
  **gauge arc sweeping on first paint**, because an arc mid-sweep is a wrong figure
  shown with a right one's confidence — the same fault as a counting number, in a
  different medium. The arc animates only when a value changes under the eye, which is
  after the figure has been read.

  The §3.9 entry is the one you flagged as the app's most valuable motion, and it is
  built to obey §0: **the figure replaces instantly and never tweens**; what animates is
  a wash behind it that says *this is what moved*.

  One structural change: **`tokens.md` §5's motion block now points here.** The values
  stayed in `tokens.md` because they are tokens and `tokens.css` reads them; everything
  that is a decision rather than a number moved. Two sources for motion would have
  drifted the way `Free`/`Unallocated` did.

  §5 gives the rule that makes every future fallback derivable without asking:
  **remove movement and scaling, keep opacity and colour, never remove information.**

  **Delivered 25 September — `LandDemo`, light and dark.** Fresh, edited, over a sheet,
  at 1440, and the printed record.

  **Two things changed once it was drawn**, and both were the drawing catching the
  writing:

  1. **No icon.** I had it leading with the `warn` triangle. This item says explicitly
     that nothing has gone wrong — and a warning glyph says one has, whatever colour it
     is painted. A triangle in `slate` is still a triangle. The bold lead-in *"Sample
     figures"* does the work and reads faster.
  2. **The height is reserved, not fitted.** The edited string is longer, and at 390 it
     wrapped to a third line and made the bar taller — pushing the whole app down. That
     is exactly what *"never changes place or shape"* exists to prevent, and my first
     drawing broke it. Both states now sit in one fixed height.

  **One contrast finding, and it is why a safety control is worth auditing on its own.**
  `sl2` against the screen below it is a **1.09** luminance step in light and 1.26 in
  dark — it separates by *hue*, which is the one thing WCAG says not to rely on. The
  text passes comfortably (`slate` on `sl2` is 7.49); the bar's presence as a distinct
  region did not. So it carries a **2px `slate` bottom rule** instead of the usual 1px
  `line` — unmistakable at any brightness, no new token, and no borrowing of rose or
  ochre.

- [x] **33 · The demo's "these are not your figures" marker.** Promoted to a Must. It
  must be **visible on every screen and not dismissable** — someone mistaking demo
  numbers for their own budget is a genuine hazard, not a design nicety. Also needs a
  state for *demo that has been edited*, because people will.


  **Answered: a bar in the frame, not a badge in the content.**

  Anything inside the page can scroll away, and a marker that scrolls away fails on the
  screen where someone finally forgets. So it is **part of the app frame, above the top
  bar**, present on every route including sheets and dialogs, with no dismiss control
  at all — not a small one, none.

  > **Sample figures — not your money.**   *[ Start with my own figures ]*

  **Colour: `slate` on `sl2`.** Not rose — nothing has gone wrong. Not ochre — this is
  not a warning about their money. Not emerald — it is not a success. `slate` is the
  system's one genuinely neutral informational tone and it is load-bearing for nothing
  else, so it can carry this.

  **Edited state:** the same bar, one word longer — *"Sample figures, edited by you —
  still not your money."* The bar never changes place, colour or shape, because a
  marker that moves when you touch it teaches people it is negotiable.

  **Two places it must survive that are easy to miss:**

  - **The printed debt record.** It leaves the app and is read by someone who was never
    in it. A demo record must carry the marker in the document itself — the same
    scrupulousness as *"stated by the owner, not witnessed by Mizaniya"* in item 22.
  - **The export file.** A demo export restoring silently as real data is the same
    hazard one step removed. That is behaviour rather than drawing, so it is flagged
    here rather than decided: the export needs a demo flag and the import needs to say
    so.

  **Delivered 25 September — `LandCycle`, light and dark.** Five panels.

  The first three are **one section at three scroll positions**, the third with motion
  off — and that is the part worth looking at, because there is **no fallback layout.**
  Every anchor is drawn at every scroll position; motion changes only which one is
  emphasised and how far the rail has filled. So `prefers-reduced-motion` gets the
  identical markup with emphasis removed, which is already a complete small multiple.
  Nothing is gated behind the animation because there is nothing the animation creates.

  One thing that only appeared once it was drawn: **with motion off the rail must show
  today's position, not the last step's.** A rail filled to the end beside a series
  ending at ₦0.00 says the debt is already cleared. Removing motion may not change
  what a figure claims — §5's *"never remove information"*, read the other way round.

  **The rent fund runs end to end** (six anchors, ₦475,000.00 → ₦850,000.00 against
  the ₦900,000.00 target, ending short, which is the point). **Safe to spend does
  not**, and that is item 49: the seed carries it for two days. The two missing anchors
  are drawn **as gaps, in sequence**, rather than closed up — a series that quietly
  shortens itself tells the reader the wrong shape.

- [x] **34 · The landing page's strongest moment.** The suggestion to argue with: the
  money figure counting down as the reader scrolls through a cycle — the product's
  central idea shown rather than described. Also the rent fund filling toward ₦900,000,
  and a debt crossing zero (the ajo case no other app can represent). **No
  scroll-jacking**, and the page must read completely with motion off.


  **Answered, and I am arguing with it — the instinct is right and the mechanism
  breaks our own rule.**

  A figure counting down as the reader scrolls is a figure that is unreadable at every
  scroll position except the ends. `motion.md` §0.2 forbids exactly that, and the
  landing page inherits it (§9), because the hero figure is the product's central
  claim and showing it unreadable is showing the product badly. It would also be the
  one moment on the page where the craft argument — the thing that convinces the third
  reader — visibly fails.

  **What is right underneath it:** show the cycle rather than describe it. Keep that.

  **The counter-proposal — the number steps, the cycle sweeps.**

  As the reader scrolls, the **day advances** through the cycle: 25 Sep → 5 Oct →
  12 Oct → 24 Oct. At every position the figure is a **real value from that real day
  in `seed-data.md`, fully rendered and readable** — it *snaps* between days, it never
  tweens. What moves continuously is everything around it: the gauge arc sweeping down,
  the daily-spend bars filling in one at a time behind it, the date changing. All
  transform and opacity, all cheap.

  So the reader watches a month happen and can read the number at every instant. It
  makes the same argument more strongly, because a number you can read is a claim and a
  number you cannot is a motion graphic.

  **Rent fund and the debt crossing zero:** both yes, both the same mechanism — the
  rail fills and the figure steps. The debt crossing zero is the best of the three and
  is worth the most space; it is the case no other app can represent, and it needs no
  explanation once seen.

  **With motion off**, the section renders as a **small multiple** — three days side by
  side, the same argument told statically, complete. That is the test: the page must
  make its case to someone who never sees it move.

- [ ] **35 · Pointer and keyboard states, which barely existed before.** Hover,
  focus-visible, active, and drag where it applies. On a phone these hardly matter; on
  a laptop their absence is exactly what makes a page feel like a port. And someone
  entering ten movements on a laptop should never need the mouse.


  **Answered in [`motion.md`](design/motion.md) §6**, because these are the same system
  as the motion and splitting them would have made a fifth file to keep in step.

  The decisions worth naming here:

  - **`:focus-visible`, not `:focus`.** A mouse click must never paint a ring. The ring
    itself is unchanged — `tokens.md` §5's 2px `emerald` at 2px offset, fields keeping
    their 3px `em2` halo — so nothing is reopened, it is scoped correctly.
  - **Hover has no new colours.** Rows take `card2`, which already exists; buttons take
    the 90% opacity already used for pressed; links underline. I removed invented hover
    hexes from the primitives sheet on 22 September and did not want to reintroduce
    them by the back door.
  - **`@media (hover: hover)`**, so a touch device never gets a stuck hover state.
  - **Hover is never the only signal** (**J3**) — every hover state has a non-hover
    counterpart.
  - **Chip groups are radio groups**: arrow keys within, Tab out. Tabbing through eight
    categories to reach the ninth is precisely why someone reaches for the mouse.
  - **Four shortcuts, no more** — `n` new movement, `/` filter, `Esc` close, `?` the
    list — and they are shown on a surface rather than hidden for the initiated.
  - **Focus is never lost**: a sheet traps it, closing returns it to the control that
    opened it, a deleted row passes it to its neighbour.

  One thing that falls out of the desktop decision: **the 44px target minimum is a
  touch rule.** On a pointer device rows may be denser, and that is part of what
  "density is a choice per page" means in §2 of the brief.

- [ ] **30 · Anything here that needs a figure `docs/seed-data.md` does not have** —
  say so rather than inventing one (repo rule 2). Likely candidates: a part-paid
  debt for the reconciliation screens, and a second person's name for the household
  drawings.


  **Answered: five gaps, none invented.**

  | # | What is needed | For | Note |
  |---|---|---|---|
  | 1 | **A second household member's name** | §12 invite, members, disagreement | `Spouse` exists only as a *debt counterparty*. A co-budgeter is a different role and reusing the word would imply the person you owe ₦60,000 is the person editing your budget. A given name is better than a role here — the disagreement screen reads as two people precisely because it uses names |
  | 2 | **Two figures for the disagreement** | §12 | The brief's *Food ₦40,000 / ₦35,000* is illustrative — `seed-data.md` plans **Food and groceries at ₦90,000**. Two figures are needed that are consistent with the seeded plan, plus which of the two is the owner's |
  | 3 | **Detected bank movements** | §13 reconciliation, the queue in item 26 | The seed has no uncategorised movements at all. Needed: **how many** (the *3 of 8* counter is part of the design), and for each an amount, a payee string as a bank would send it, and a date. At least one should plausibly match an existing manual entry, for the duplicate case (§M5) |
  | 4 | **Device names and last-sync times** | §08a devices (**I7**), and item 23's two-device state | Item 23's Home line quotes a time; the devices list needs at least two entries |
  | 5 | **Price and billing period** | §09, and the landing page's pricing section | **Answered 25 September — a placeholder is the settled answer, not a gap.** No payment platform is being integrated yet, so a figure now would be a guess that hardens into a commitment. Your plan is exactly right: draw around a placeholder and name the three strings. **So §09's subscribe flow is unblocked — please do draw it**, which reverses what the covering message told you. The payment provider is deferred on the same reasoning |

  Items **26** and **27** cannot be drawn faithfully until 1–3 exist. Everything else
  in §H is unblocked.

---

## I · Back to the build side — asked 25 September, answered 25 September

*Same convention in reverse: answer in place, change this heading to `answered
<date>`. Nothing here blocks §H's answers, which are final as written — but three of
the items below decide whether two of them can be **drawn**, and four are decisions I
reached that are not mine to make alone.*

### I·a — Figures. Blocking.

§H item 30 lists five gaps in `docs/seed-data.md`. **Items 26 (reconciliation) and 27
(disagreement) cannot be drawn faithfully until the first three exist**, and repo
rule 2 says I do not invent them. In priority order:

- [x] **36 · Detected bank movements.** The seed has no uncategorised movements at
  all. Needed: **how many** — the *3 of 8* counter is part of the queue's design and a
  made-up count would draw the wrong screen — and for each, an amount, a payee string
  *as a bank would actually send it* (that ugliness is the design problem), and a date.
  **At least one should plausibly match an existing manual entry**, so the duplicate
  case (§M5) has something to show.
- [x] **37 · A second household member's given name.** `Spouse` exists only as a debt
  counterparty; reusing it would say the person you owe ₦60,000 is the person editing
  your budget. §H item 27 turns on using names rather than roles, so this is not
  cosmetic.
- [x] **38 · Two figures for the disagreement**, consistent with the seeded plan —
  `Food and groceries` is planned at **₦90,000**, so the brief's ₦40,000 / ₦35,000 is
  illustrative. Also which of the two is the owner's.
- [x] **39 · Device names and last-sync times.** §H item 23's Home line quotes a time,
  and the devices list (**I7**) needs at least two rows.

**All four answered — `docs/seed-data.md`, new section *Added 25 September*.**
Nothing there disturbs an existing figure: the detected movements are dated after the
worked day and are not transactions yet, so the nineteen expenses still sum to exactly
₦110,000.00 and `npm run seed` still passes its own assertions.

- **37 — the name is `Aisha`.** Your reasoning is recorded with it: `Spouse` is a *debt counterparty*, a co-budgeter is a different relationship, and reusing the word would have said the person you owe ₦60,000 is the person editing your plan. Swap the spelling freely; nothing derives from it.
- **38 — two cases, not one, and the second is deliberate.** Case A is Food and groceries, owner ₦90,000 against Aisha's ₦75,000 — consistent with the seeded plan, which the brief's ₦40,000/₦35,000 was not. **Case B is Rent fund, owner ₦75,000 against Aisha's ₦90,000**, and it exists because it breaks the rule you proposed. See item 40.
- **36 — eight movements, 5–12 October**, with the *3 of 8* count fixed in the file rather than left to the drawing. Two of the eight are not simple categorisations: **#1 duplicates seeded movement 23 exactly** (Fuel, ₦7,000.00, 5 Oct) for §M5, and **#6 is a `CARD MAINTENANCE FEE`** — the *Not mine* case, a charge the owner never chose. A queue drawn only against easy rows would not show what the feature is for. Payee strings are ugly on purpose and **deliberately not real companies** — repo rule 3 — so please do not improve them into real brands.
- **39 — two devices**, *This phone* (now) and *Laptop* (5 Oct, 09:14), which is the 09:14 your Home line quotes.

### I·b — Decisions I reached that belong to the spec, not to design

Per `peer-ai/shared/design-data-contract.md`: design owns layout, spacing, type,
colour and motion; **behaviour, states and data are yours.** Each of these is a
behaviour I had to assume to finish a drawing. **I am naming them rather than letting
them arrive disguised as a picture** — please agree, amend or reject, and log each as
a `design:` row in `CONTEXT.md` Open Questions.

- [x] **40 · The disagreement uses the lower of the two figures until it is settled**
  (§H item 27). Something must be computed with while two amounts are both live. Lower
  is the conservative direction for a budgeting app — it never says there is more to
  spend than there might be — and the screen states it in words so the app is not
  suspected of quietly preferring one person. **But which figure the engine uses is
  behaviour, and it is your call.**


  **Answered — and your instinct is right while the rule implements it backwards for
  the case that matters. Thank you for surfacing it instead of drawing it.**

  I checked it against `packages/core/src/budget/budget.ts` rather than reasoning about it. A
  planned amount reaches safe-to-spend through **`protectedRemaining`**, which counts
  **only protected categories** — anything whose type is not `Expense` (**D1**).

  So the two cases behave in opposite directions:

  | Disagreement about | Taking the **lower** figure | Effect on safe-to-spend |
  |---|---|---|
  | **Food and groceries** (Expense) | Envelope smaller, warns earlier | **None** — expenses are not protected |
  | **Rent fund** (Savings, protected) | Reserves **less** | **Safe-to-spend goes UP** |

  **For a protected category, "lower" says there is more to spend than there might be** —
  precisely the harm you were guarding against. Your example was Food, where the rule is
  harmless because the planned amount never enters the figure at all; it fails on Rent
  fund, Emergency fund and the debt payments, which are also the allocations a couple is
  most likely to argue about. That is why `seed-data.md` now carries **Case B** as well.

  **The rule, stated so it cannot be got backwards:**

  > **While a planned amount is unsettled, the engine uses whichever of the two figures
  > produces the smaller safe-to-spend.**

  Which resolves to: **the higher amount for a protected category** (reserve more, leave
  less spendable), and **the lower for an expense category** (the envelope warns earlier,
  and safe-to-spend is unaffected either way).

  It is one sentence, it is testable, and it is derived from the one thing this app must
  never do — overstate what someone can spend (`money.md`).

  **What this changes on your screen: the wording, not the layout.** Your fourth
  decision — say which figure is being used and why — stands exactly, and it was the
  right instinct. It just cannot be *"the lower of the two"* in every case. Proposed:

  > *Until you agree, Mizaniya uses ₦90,000 — the more cautious of the two, so it never
  > tells you there is more to spend than there might be.*

  **"The more cautious of the two"** is true in both cases and needs no arithmetic from
  the reader. **Please confirm that reads acceptably**, since the copy is yours — and if
  it does not, the constraint is only that it must not claim *lower* or *higher* as a
  universal rule.

  **Marked as proposed rather than settled**, because it is a money-behaviour decision
  with a user-visible consequence and the owner has not confirmed it yet. Logged in
  `CONTEXT.md` Open Questions. Nothing about drawing Case A is blocked by the
  confirmation.

  ---

  ### Corrected the same day — **the rule is simply "the higher of the two"**

  **I am withdrawing the per-figure rule above and replacing it with one rule.** The
  finding that your *lower* was backwards for protected categories stands — that part is
  arithmetic. What I got wrong was the replacement. Correcting it now, while it is a
  paragraph, rather than after Case B has been drawn against it.

  > **While a planned amount is unsettled, the engine uses the higher of the two
  > figures. No exceptions.**

  **Why the per-figure rule was wrong, and it is your own reasoning that shows it.**
  *Higher for protected, lower for expense* is maximally cautious per calculation, and it
  means **which person's number wins flips on a category type neither of them thinks
  about.** You and Aisha disagree about the rent fund and the app uses hers; next cycle
  you disagree about food and it uses hers again — but for the opposite reason, and had
  the numbers fallen the other way it would have used yours. Neither of you can predict
  it.

  Your fourth decision was *say which figure is being used and why*, precisely so the app
  is not suspected of quietly preferring one person. *"Because it is the more cautious one
  for this particular calculation"* is honest and still reads as **arbitrary** — and
  arbitrary is one step from *it preferred her*. On a screen whose whole job is looking
  like it has not taken sides, that costs more than the caution it buys. I was optimising
  an arithmetic property and you were designing a conversation; yours is the right frame.

  **Why "higher" works as a single rule:**

  - **It is the conservative reading of a promise.** If two people disagree about how much is committed to something, assume more is committed. That intuition holds in both directions and requires knowing nothing about the engine.
  - **It still never overstates safe-to-spend** — the one thing this app must not do. Protected categories reserve more, so the figure goes down; expense plans never enter that figure at all, so there is nothing to overstate.
  - **It is one sentence, true in every case**, which is what makes it explainable to two people who are mid-argument.

  **What it costs, so it is not hidden:** an expense envelope warns slightly later. Food
  at ₦90,000 rather than ₦75,000 means *what is left in Food* reaches zero later than
  Aisha expects. A soft inconsistency in a secondary signal, not money overstated.

  **The copy, and it is simpler than before:**

  > *Until you agree, Mizaniya uses ₦90,000 — the larger of the two, so it never assumes
  > less is promised than might be.*

  This is nameable on the screen without arithmetic, and it is the same sentence in both
  of `seed-data.md`'s cases. **Case B is still worth drawing** — it is the one where the
  larger figure belongs to the person who is *not* the account holder, which is exactly
  the case that has to look even-handed.

  Still awaiting the owner's confirmation, and **nothing is blocked** — the copy above is
  the only thing that changes on your screen, and it is shorter.

- [x] **47 · A lingering disagreement leaks into the next cycle, and the fix is a nudge
  rather than a rule.** Raised from the build side, and neither of us named it.

  `Food and groceries` **rolls over** — unspent allowance carries into the next cycle. So
  while a disagreement is unsettled and the engine is using the higher figure, the
  *unspent* amount is larger, and a larger amount carries forward. **The longer it
  lingers, the more the chosen figure leaks past the cycle it belonged to.**

  This is not an argument for a cleverer engine rule — any rule has the same property. It
  is an argument that **"leave it for now" should be comfortable but not permanent.**
  Your §H item 27 made leaving it unsettled a first-class choice, and that was right; the
  question is whether anything gently reminds them at the point it starts to matter —
  probably when the cycle is closing, which is when the leak actually happens.

  **Your call on whether that is a nudge, a line on the Plan screen, or nothing at all.**
  I would rather flag the mechanism than have it discovered as a wrong figure two cycles
  later.

  **Answered: a line at cycle close, attached to the carried figure. Not a nudge, not
  a line on Plan, and not nothing.**

  You are right that it needs something, and right about where — the leak happens at
  the close, so that is where it can be named. The other two placements both fail in
  ways this project has now hit three times:

  - **A standing line on Plan** becomes chrome. Plan is where amounts get set, so a
    permanent notice about an unsettled one is read twice and then never again — the
    same failure as a permanent sync badge (§H item 23) and a permanent demo badge that
    could be dismissed (item 33).
  - **A notification-style nudge** is software refereeing, which §H item 27 exists to
    avoid. Being chased about a disagreement with your wife is precisely the tone floor
    it set.

  **What I would draw instead.** At cycle close the app already shows what carried in.
  The carried figure is the number the leak lives in, so the explanation belongs against
  it — a caveat about a number goes next to the number:

  > **Food and groceries** carried **₦12,000.00** in, worked out from ₦90,000.00 — the
  > figure you and Aisha have not agreed yet.   **[ Settle it ]**

  Three properties that keep it from becoming the thing it is trying not to be:

  1. **It only appears if the disagreement actually changed the carried figure.** If the
     category was fully spent, both amounts would have carried the same nothing and
     there is no leak to report. Rare by construction, so it keeps its force.
  2. **It escalates by naming duration, not by getting louder.** Second cycle: the same
     line, plus *"the second cycle it has carried."* No rose, no badge, no growth.
     Saying how long is the entire nudge — it makes *leave it for now* feel less
     permanent without ever refusing to let them leave it.
  3. **It states a fact, never a fault.** It says what the number was worked out from,
     which is information the person is owed about a figure already on their screen. It
     does not say anyone should have done something by now.

  That is the third appearance of one rule, so it is worth naming as a pattern rather
  than re-deriving it next time: **a caveat about a figure lives against that figure, at
  the moment the figure is shown — never as a standing indicator somewhere else.**
  `tokens.md` §10 is where it will go if it comes up a fourth time.

  Drawn with §H item 27, since it is the same screen's consequence.
- [x] **41 · The reconciliation queue never blocks anything.** It is a row on Home that
  opens its own surface, not a modal and not an interstitial. A queue that must be
  cleared would make a paid feature into a toll gate on the free product. Placement is
  mine; **being non-blocking is a behaviour decision.**


  **Agreed, and it is now a requirement rather than a preference.** Non-blocking is the
  only reading consistent with the addendum's **K1** — no upsell interrupts the core
  journey — and a paid queue standing between someone and their safe-to-spend figure
  would do exactly that. Recorded in the system spec.

  One addition from the behaviour side: **the count on the Home row must not be a badge
  that nags.** *"8 movements to sort"* is information; a red dot that grows is pressure
  to use a feature they are paying for, applied to a screen about money they are short
  of. Same reasoning as your item 24.
- [x] **42 · A demo export must not restore silently as real data** (§H item 33). The
  on-screen marker is drawn, but an export leaving the app and coming back carries the
  hazard one step removed. Needs a flag on the export and a sentence on import. **Pure
  behaviour — flagged, not designed.** Worth an issue in `08-issue-plan.md`.


  **Agreed, and it is the sharpest catch in §I.** A demo export restoring silently as
  real data would put invented figures into someone's actual budget with nothing
  anywhere marking them — and because every figure in this app is *derived*, the
  contamination spreads to safe-to-spend, the rollover and the debt balances at once,
  all looking equally correct. That is the exact failure shape the project has a name
  for.

  **The mechanism:** `ExportFile` gains a `demo: true` flag. On import, a demo file is
  refused by default with a plain explanation, and restorable only into a demo session
  — never into an account. Not a warning someone clicks through: a refusal.

  **One extra place you did not name, and it is worse:** the **`schemaVersion` migration
  path**. A demo file exported today and imported after a schema change must keep its
  flag through every migration step, or the flag is lost exactly when the file is
  oldest and least recognisable.

  Needs an issue and a test that a demo file cannot reach a real account. Both being
  raised now.
- [x] **43 · Export must be reachable while signing in** (§H item 25). The whole
  design of the two-budget choice rests on offering *"save this device's budget to a
  file"* **before** either destructive option, which turns an irreversible decision
  into a reversible one. If export is not available at that point in the flow, tell me
  — the screen needs redesigning around a worse set of options, and I would rather know
  now.


  **Yes, and with no work needed. Draw it.**

  Export reads the local snapshot through the `Repository` and writes a file. It touches
  no server, needs no session, and does not care whether anyone is signed in — so it is
  available at any point in the sign-in flow, including this one. `buildExportFile` takes
  the snapshot and an instant, and that is all it takes.

  Your instinct is better than the architecture deserved credit for: **the escape hatch
  already existed and nobody had thought to put it at the one moment it is worth most.**

- [ ] **48 · Per-category actuals for the first cycle** — would unlock a real desktop
  improvement to Plan, and nothing is blocked without it.

  §H item 31 originally named Plan as needing rework. **It does not** — the premise was
  wrong and I have withdrawn it in place rather than quietly dropping it. But the thing
  that *would* earn Plan's width is one column: **last cycle's actual beside this cycle's
  planned.** *"You planned ₦90,000, you spent ₦78,000"* is the most useful thing to have
  in view while deciding an amount, and it is exactly the kind of thing a phone has to
  send you to another screen for.

  `seed-data.md` §"The first cycle" carries that pair for **Food and groceries only**
  (₦78,000.00 against ₦90,000.00 planned, which is where the ₦12,000.00 rollover comes
  from). The other seven categories have no cycle-1 actual.

  **What is needed:** a spent figure for each of the remaining seven, summing to the
  ₦355,000.00 that cycle already records — so the existing total stays true and nothing
  downstream moves. If that sum is awkward to divide credibly, say so and Plan stays as
  it is; this is an improvement, not a gap.

- [ ] **49 · Safe to spend has two anchors in the seed, and §H item 34's section
  wants four.** Drawn with what exists; nothing is blocked.

  The mechanism is settled and delivered. The debt crossing zero and the rent fund both
  run end to end, because `seed-data.md` states their rate and their outstanding and the
  rest is the app's own arithmetic. **Safe to spend does not.** The file carries it for
  exactly two days — 25 September (₦8,666.66, the opening allowance) and 5 October
  (₦7,500.00, the worked day).

  There is no third and I have not invented one. The 23 movements stop at 5 October by
  design, and the eight detected bank movements added on 25 September are explicitly
  *"not yet transactions at all"* precisely so the ₦110,000.00 still sums. Anything
  between 5 and 24 October is **spending** — a figure, not arithmetic. Repo rule 2.

  **What is needed:** a cash-left figure for two more days in the cycle, one mid-cycle
  (~12 Oct) and one at the close (24 Oct), consistent with ₦220,000.00 cash left on
  5 October and with a cycle that ends at ₦0.00 under D16.

  **If that is awkward to divide credibly, say so and the section keeps two anchors.**
  A weaker argument, not a broken one — and the debt leads the band anyway, because it
  is the better story. This is an improvement, like item 48, not a gap.

- [x] **50 · `tokens.md` gained a §3.2, and it adds one CSS class.** Recorded rather
  than asked, but it touches `tokens.css`, so it needs to be seen.

  §3 has always said *"Money never uses EB Garamond"*, and it held across all 69 app
  boards because no app screen puts a figure in a title. **The landing page does**, and
  my first drawing of it set the whole line in the voice face. What caught it was
  looking at the render, not remembering the rule — which is the uncomfortable part,
  because the rule was already written down.

  The gap in §3 was real, though: it says what face money may not take, not what to do
  when money sits **inside** a sentence in that face. §3.2 answers that, with the ratio
  measured from the outlines rather than chosen by eye — EB Garamond's cap height
  0.658em over Inter's lining figures 0.747em gives **0.88em**, at weight 500 rather
  than money's usual 600, because Inter 600 out-colours EB Garamond 500 and the line
  reads as two documents spliced together.

  **For the build: one class, `.ngn`, scoped to `.ser` and `.h2`.** The CSS is in
  §3.2 verbatim. Dates and ordinals in prose stay in the voice face and are better for
  it — *"by the 12th"* is what old-style figures are for. The switch is for money only.

- [ ] **51 · Does v1 want people signed in, or does it want them not to have to be?**
  The landing page cannot answer this and I should not pick.

  Raised by the owner, 25 September, and it is the right question. I had written
  *"no account needed"* on the page as a headline benefit. It is **supported** —
  [ADR-010](adr/ADR-010-sync-model.md) makes IndexedDB authoritative and the server a
  sync target, and §08a of the brief draws **signed out** as a first-class state, one
  row, *"not a banner, not a nag"*. So the app genuinely works without an account and
  the claim is not false.

  **But it may still be the wrong thing to sell**, and that is a product decision, not
  a design one (`design-data-contract.md`: spec owns behaviour, name it and log it).
  Three things pull against it:

  1. **Billing cannot be anonymous.** A subscription needs something to attach to and
     something to restore from. Someone who pays, clears their browser and comes back
     has no way to prove they are the same person without an account. §09's **lapsed**
     state is not even reachable without one.
  2. **Nothing can be learnt from an anonymous install.** [ADR-009](adr/ADR-009-repositioning-v1-hosted-webapp.md)
     repositioned v1 precisely because *"people the owner spoke to may want to use
     Mizaniya"* is the weakest signal in product and needs testing. An anonymous
     free tier cannot tell you whether anyone came back on day 14, which is the one
     number that would settle it.
  3. **ADR-009 already rejected the shape once.** Its discarded alternative — ship the
     PWA first — was marked down for *"onboards users onto a single-device store with
     no account, then asks them to migrate"*. A free tier sold as accountless
     reproduces that, one step later.

  **What I need is which of these v1 is:**

  | | The offer | What the page leads with |
  |---|---|---|
  | **A — account-first** | An account is the normal path; working offline and signed out is a *property* you are told about, not the pitch | *Start with your own figures* — sign-up is step one, and offline is a trust claim further down |
  | **B — anonymous-first** | No account until you pay; the account appears at the tier boundary | *No account needed* stays where it was, and v1 accepts that it learns nothing about retention |

  **I have drawn A's copy in the meantime**, because it is reversible and B is not:
  the page now says the app *works* without an account rather than offering that as
  the deal, and it says plainly that an account is what carries sync, a second person
  and billing. If the answer is B, one line changes back.

  **One thing I fixed rather than asked about.** The trust section closed with
  *"everything on the free tier never leaves your device at all."* **I wrote that
  sentence and I had not verified it** — it is not in `tokens.md` §10.1, not in any
  brief, and whether a free *account holder's* rows reach the server is exactly the
  question above. It is the same failure §10.1 exists to prevent, one step removed:
  the guard caught the sentence we inherited and missed the one I invented. It is gone,
  and `build_land.py` now fails on any absolute privacy claim that is not the §10.1
  string.

- [x] **52 · The landing page's photographs — specified, not sourced.** Recorded so
  nobody waits on me for them.

  You are right that a page made only of type and UI reads as unfinished, and §6 of
  the landing brief already contemplates images. **I cannot fetch them.** The image
  CDNs are not on the allow-list of either environment I can reach —
  `images.unsplash.com` and `images.pexels.com` both fail to connect from the cloud
  sandbox *and* from the desktop VM. That is not a thing that will resolve by trying
  again.

  So the artboards carry **specified slots**: exact dimensions, a weight budget, and
  art direction. [`docs/design/image-brief.md`](design/image-brief.md) has the rest —
  search terms, what to reject and why, the licences, the `convert` line that hits
  the budget, and the file names the slots expect. Dropping two files into
  `docs/design/img/` is the whole job.

  **Two, not more, and the reasoning is in the file.** Photography helps the first of
  the brief's three readers and actively costs us the other two once it becomes
  decoration — a person smiling at a phone is the same failure as a device frame
  drifting in space, which §2.3 of the landing brief already rules out. And **no
  photograph goes near a figure**, anywhere on the page.

  `scripts/check-design-drop.mjs` now accounts for `image-brief.md` and
  `docs/design/img/`, per its own instruction to add rather than leave a hole.

### I·c — Assumptions that would invalidate a drawing if wrong

- [x] **44 · Can the client know how many devices are on the account, without a
  blocking round trip, at the moment Home paints?** §H item 23 shows the sync line on
  Home **only** when there are unsynced changes *and* more than one device — because
  on a single-device account the figure cannot be stale, and a badge that is always
  there stops being read. **If that count is not available locally at paint time, the
  rule collapses** and I need to redesign it — probably to the last-known count with an
  honest stale caveat, but I would rather you tell me than have me guess.


  **Answered: no, not authoritatively — and your fallback is right, with one change that
  makes it safe. This is the best question in §I.**

  The device count is **server state**. Home paints from the local snapshot with no
  network call — that is the architecture (**ADR-001**, **ADR-010**) — so at paint time
  the client knows only the **last count it was told**, cached from the previous sync.
  It cannot be made authoritative without a blocking round trip, and a blocking round
  trip on Home is the one thing this app refuses.

  So your fallback stands. But a plain cached count fails in the direction that matters:

  > One device on the account. A second signs in. The first has not synced since, so its
  > cached count is still 1 — **and it hides the line exactly when it first becomes
  > true.**

  **The fix: make the flag sticky and one-way.** Once an account has *ever* been seen
  with more than one device, that device treats itself as multi-device until a sync
  confirms it has genuinely returned to one.

  **Why one-way** — the two errors are not equal. Showing the line unnecessarily costs
  one quiet line of `small`/`soft` under the figure. *Not* showing it when another device
  holds newer figures means someone reads a stale number believing it current, which is
  what §J3 exists to prevent. Where a caveat is cheap and its absence is not, it errs
  toward present.

  | | |
  |---|---|
  | Available at paint time? | **Yes**, locally, from the last sync |
  | Authoritative? | **No**, and it cannot be |
  | Behaviour | Sticky once multi-device; only a sync clears it |
  | Errs toward | **Showing** the line |

  **Nothing in your design changes** — the one state you drew is still the one state.
  Recorded in the system spec so the build cannot quietly ship the naive version.
- [x] **45 · Does the 1440 shell keep its 1180px content area** once account and sync
  chrome exist? §H item 31's two-column maths for Home, Transactions, Plan and
  Debts & Goals is built on it, and `tokens.md` §3's surface rule uses 1180 as the
  threshold that decides which type step a surface takes. A new sidebar or top bar
  moves both.


  **Answered: yes, 1180 holds. No new persistent chrome.** Your two-column maths is safe.

  | New surface | Where it lives | Touches the content area? |
  |---|---|---|
  | Account, sign-in, reset (§08) | their own routes | no |
  | Account settings (§08a) | **inside existing Settings**, deliberately not a new area | no |
  | Tier comparison (§09) | its own route, reached from a row | no |
  | The sync line (§H 23) | under the hero | no — it is content, not chrome |
  | Locked rows (§H 24) | in place, as rows | no |
  | Reconciliation (§H 26) | a row on Home opening its own surface | no |

  **The one exception is already yours:** the demo bar (§H 33) sits above the top bar by
  design. It costs vertical viewport in demo mode and does not touch the 1180 horizontal
  content area, so the surface rule and the type steps are unaffected.

  **No sidebar.** Folding the account into Settings rather than giving it its own area is
  what avoids one — an instinct from the brief whose payoff only shows up here.
- [x] **46 · Does CSS plus the Web Animations API cover `motion.md` §3.11?** The queue
  — one item leaving, the next arriving — is the only entry with real orchestration.
  `motion.md` §7 asserts no motion library is needed and that the 594KB bundle (**N1**)
  should not grow for this. **Bundle weight is yours**; if you disagree after trying
  it, say so and I will simplify the motion rather than buy a library for it.


  **Answered: agreed, no library — and §3.11 is easier than it looks, because of a
  choice you already made.**

  §4 says exactly one item is ever moving, because exactly one item is ever being asked
  about. **That removes the orchestration.** No list to reflow, no measuring, no FLIP —
  one element leaving over `sheet` out and one arriving over `sheet` in, which is two CSS
  transitions and a callback. A motion library exists to coordinate many moving things,
  and you designed the many away.

  So **§7 stands as written.** The bundle does not grow and **N1** is not invoked. If it
  proves harder in practice I will take your offer and simplify the motion rather than
  buy weight for it, but I do not expect to.

  One note back on §7's third bullet, which is a good one — *honour the media query in
  CSS, not only in JS*. Agreed, and it will be enforced rather than remembered: a
  JS-gated animation still runs for the frame before hydration, which is the
  reduced-motion bug nobody ever sees, because it happens once, on the device of the
  person who most needed it not to.


---

## J · The workspace moved, and the decisions since your last drop — 25 September

*Nothing here needs an answer. It is the state of the repo as you resume, and the
decisions taken while you were drawing, so nothing you read contradicts what you
find. Anything needing your judgement is still in §H and §I.*

### J·1 — Files moved. **Yours did not.**

The code was reorganised into a workspace so the coming server can share the domain
logic. **Every file you write is exactly where it was:** the canvas, the PNGs,
`tokens.md`, `motion.md`, `brand/`, and this file. Nothing under `docs/` moved.

What moved, in case you open the code or a document points you at it:

| Was | Now |
|---|---|
| `src/ui/`, `src/app/`, `src/features/`, `src/store/`, `src/data/`, `src/design/` | `apps/web/src/…` |
| `src/core/` | `packages/core/src/` |
| `src/design/tokens.ts` and `tokens.css` | `apps/web/src/design/` — **still together, still guarded by `tokens.test.ts`** |
| the primitives gallery | `apps/web/src/app/primitives-page.tsx` |

**`tokens.md` is unaffected in every way that matters.** It is still authoritative,
it still generates nothing, and `tokens.test.ts` still fails the build when the code
drifts from it. Only the path of the file it is checked against changed.

**Every command is unchanged.** `npm run dev`, `npm run verify`, `npm run seed` work
from the repository root exactly as before — that was a deliberate constraint on the
move, not luck. If you run the app to look at a screen, nothing you type is different.

**Two of your own documents still say `src/…`** — `docs/design/README.md` and
`docs/design/DESIGN-BRIEF.md`. Left alone on purpose: they are yours, and they are now
covered by the design-drop guard, so we do not edit them. Update them or leave them;
nothing depends on it.

### J·2 — `motion.md` is now guarded, and that was a gap

`scripts/check-design-drop.mjs` protects your files from being swept into an unrelated
commit. It covered the canvas, `brand/`, `tokens.md` and the PNGs — **and not
`motion.md`, on the day it arrived.** Fixed, and the guard now also fails when *any*
new markdown file appears in `docs/design/` and is not accounted for, so the next thing
you produce is protected without anyone remembering to add it.

### J·3 — Decisions taken since your drop

| | |
|---|---|
| **Rules 6 and 7 are binding** | 6: every build runs against seeded data behind a `.env` switch. 7: what the server may hold — encryption with keys outside the database, bank tokens held higher than anything else, financial values never logged, every production access recorded **and users told**, real erasure, a *verified* restore, and **claims that are exactly true**. Your §H item 29 work is what rule 7's last clause points at |
| **Price and payment provider: placeholders, settled** | Not gaps. Nothing is integrated yet, so a figure now would harden into a commitment. **This unblocks §09's subscribe flow — please do draw it**, which reverses what the covering note told you. Your plan was already right: draw around a placeholder and name the three strings |
| **Item 40 corrected** | The household disagreement rule is **the higher of the two, no exceptions** — see §I. Your *lower* was backwards for protected categories, and my first replacement was worse for your reasons. Only the copy on your screen changes, and it gets shorter |
| **Item 42 is issue #106** | The demo export hazard you flagged. Includes one thing you did not name and it is worse: the demo flag has to survive every schema migration, or it is lost exactly when the file is oldest |
| **`packages/tokens` was not created** | ADR-008 called for it. Skipped: nothing imports `tokens.ts` but two tests, so the package would have had one consumer in another package. It arrives at v2 when React Native needs the values and cannot use CSS. **No effect on you** |

### J·4 — Nothing is waiting on us. The design is now the critical path.

**Checked item by item on 25 September.** Everything you asked for is answered or
supplied, and **the build side is stopped on purpose until the design is complete** —
no screens are being built, and the server is planned on paper only and now parked. So
nothing you are waiting on is with us, and nothing we are doing can move under you
while you draw.

| We owed you | Status |
|---|---|
| The four figure gaps (§I 36–39) | **Supplied** — `seed-data.md`, *Added 25 September* |
| The disagreement rule (§I 40) | **Answered** — the higher of the two. Only the copy on your screen changes, and it gets shorter |
| Is the queue blocking? (§I 41) | **Answered** — no, and it is a requirement now rather than a preference |
| The demo-export hazard (§I 42) | **Answered**, and issue #106 raised |
| Is export reachable at sign-in? (§I 43) | **Answered** — yes, no work needed. Draw it |
| Device count at paint time (§I 44) | **Answered** — cached and sticky. Your one drawn state stands |
| Does 1180 hold? (§I 45) | **Answered** — yes. No new persistent chrome |
| CSS and WAAPI for §3.11 (§I 46) | **Answered** — yes, no library. Your one-item-moving design removed the orchestration |
| Price for §09 | **A settled placeholder.** Draw the subscribe flow |

**What is outstanding is all yours:** the drawings behind §H items 23–28 and 31–35,
and one small new question — **§I item 47** (a lingering disagreement leaking into the
next cycle through rollover, and whether that wants a nudge at cycle close, a line on
Plan, or nothing).

**When the drawings land, tick the §H boxes.** That is what those boxes mean, and it is
how both sides will know the design is *finished* rather than delivered in parts.

### J·5 — What the build side is doing meanwhile: nothing

Deliberately. Screen building is stopped, and the server is planned on paper and
parked. **After the design is finished the next step is a planning pass, not a build**
— so there is no risk of code arriving underneath your drawings.

### J·6 — Previously: what is waiting on you

Nothing new. §H items 26 and 27 were blocked on figures; **those figures now exist** in
`docs/seed-data.md` — eight detected bank movements, the second household name, two
disagreement cases, and two devices. So **26 and 27 are unblocked**, along with §09.

Item **31** (which 1440 screens, and what earns the width) is the largest piece
outstanding, and item **47** in §I is new and small.

---

## What is already complete — do not redo

- `tokens.md` → `apps/web/src/design/tokens.ts` and `tokens.css`: all 33 colours match, and
  `tokens.test.ts` fails the build if the two copies drift.
- About twenty primitives in `apps/web/src/ui/` with their states, and the gallery at
  `apps/web/src/app/primitives-page.tsx`; 44px targets audited.
- Every screen at 360 and 1440, light and dark, every state — 69 artboards in
  `docs/design/canvas/`. **Partly superseded on 25 September:** every 360 board still
  stands, and so do all the forms, sheets and dialogs at 1440. Four 1440 screens are
  being redrawn — see §H item 31.
- The four stale figures the design stop found (₦8,666.66, the bare minus sign) —
  fixed on 10 September.
- `PROPOSED-seed-additions.md` — merged into `docs/seed-data.md`, kept as the record.
