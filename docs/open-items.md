# Open items

*Written 22 September 2026 by the designer, after checking the design stop against the
code on `main` at `a7dde67`. For the build agent. Work through it on its own branch,
tick each box as it lands, and when every box is ticked fold anything worth keeping into
`CONTEXT.md` and delete this file in the same PR.*

**The design is complete.** Nothing in `docs/design/` needs regenerating. Every file an
item below needs is already there — this list is about wiring it up, not making it.

---

## A · Housekeeping — do these first

- [ ] **1 · Advance `.peer-ai-state.json`.** It still names #10 (T3, rollover) as the next
  ticket, but T3 merged in PR #35 on 11 September, followed by PR #36 (a naming
  refactor). Confirm #10 is closed on GitHub, move it to `ticketsCompleted`, set `ticket`
  to **#11 — T4 · `core/debt`**, run `npm run verify` and record the result in
  `lastVerifyResult`, and set `lastUpdated`. If this is not done, the next session starts
  T3 again.
- [ ] **2 · Bring `CONTEXT.md` up to date.** It stops at 11 September:
  - *Current State* still says SHARED RULES is next and "the repo is still documents
    only". Replace it with where the build actually is.
  - *What Was Done — By Day* has no entry for SHARED RULES (PR #30) or for T1–T3 and the
    PR #36 refactor.
  - *What's Next* still lists producing the design.
  - *Package / Asset Locations* says `docs/design/` is "empty until the design stop";
    *Diagrams / Design files* says "none yet". Both are stale.
  - Add `docs/design/brand/` to the asset table.

## B · Design → code — what the design has that the code does not

- [ ] **3 · Load the three typefaces** — **T10**.
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

- [ ] **4 · Wire in the brand files** — favicon and the `Mark` component in **T10**,
  manifest icons in **T11**.
  Everything is in `docs/design/brand/`, and its `README.md` gives the exact file
  destinations, the `index.html` head tags and the manifest `icons` block. In short:
  - copy the favicons, the Apple touch icon and the four PWA icons into `public/`;
  - add a `Mark` primitive to `src/ui/` from `mark.svg` — its strokes are
    `currentColor`, so the component sets the colour. The sidebar lockup, the welcome
    screen and the printed record all use it;
  - do not build a JavaScript splash screen — the browser builds the launch screen from
    the manifest.

- [ ] **5 · Build the welcome screen** — add it to **T12**'s acceptance criteria.
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

- [ ] **6 · Add a `Tabs` primitive** — **T17**.
  Debts & Goals switches between two views with underline tabs, in every artboard, but
  `src/ui/` has only `Segmented`. They are different controls: **Tabs switch a view**
  (Debts | Goals); **Segmented switches a value** (Today | This cycle). `tokens.md` §7
  now has a Tabs row (added 22 September), and the primitives sheet shows it: `line`
  bottom border, `soft` inactive, `ink` active with a 2px `emerald` underline, 46px.
  Radix Tabs is already a dependency.

## C · Corrections to the design itself — no code change, read so nothing regresses

- [ ] **7 · The primitives sheet was redrawn on 22 September.** The 10 September version
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

- [ ] **8 · Quick Add's edit sheet: Delete is neutral** — **T14 / T16**. The 10
  September artboard drew "Delete this movement" in rose. It is now a quiet button, per
  the same rule. `canvas/QALight.dc.html` and `QADark` are corrected.

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
