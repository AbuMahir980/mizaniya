# Mizaniya — design brief (the design stop)

**Who this is for.** A fresh Claude session (Cowork / Claude Design, Opus, ultracode on) that has *no memory of this project*. Everything it needs is in this file and the files it names. Read all of them before drawing anything.

**What it produces.** Two things into this folder, `docs/design/`:

1. `tokens.md` — the complete design-token set, light **and** dark, in the schema in §5. SHARED RULES implements it *exactly*; nothing in it is advisory.
2. Every screen at **360 and 1440**, in **light and dark**, plus a primitives sheet showing every `src/ui/` component in every state, a mark-and-wordmark sheet, and the printed debt record. Delivered as editable canvas source, standalone HTML and rendered PNGs. File names in §6.

**What it must not do.** Invent product behaviour, numbers, copy or screens. All of that is decided in `docs/06-page-specs.md`; the design's job is how it looks, not what it does. Where the spec is silent, §4 of this brief decides; where both are silent, ask — do not guess about money.

---

## 1 · Read these, in this order

| File | Why |
|---|---|
| `docs/06-page-specs.md` | The source of truth: every screen, region, number, state, copy line and the danger-colour table (§4 there). Read it twice. |
| `docs/standards/frontend-engineering-standards.md` — sections **F** (styling and design system), **J** (accessibility), **O** (naming) | The rules the tokens and primitives are held to. F3/F4 name the token shape; F5/F6 list the primitives and require every state; J4 requires AA contrast in both themes; O4 requires user vocabulary. |
| `docs/standards/standards-addendum-mizaniya.md` | Kobo; **danger means money going wrong and nothing else**; single audience. |
| `docs/seed-data.md` | The only figures that may appear in any design. The worked day is **Monday 5 October, day 11 of 30**. |
| `docs/product-brief.md` §1–2 | Who the owner is and why the app exists. Read for tone, not for requirements. |
| `docs/04-api-contract.md` §3 | The eight movement types and their labels, for Quick Add and Transactions. |

All six review corrections are **present** in `docs/06-page-specs.md` as of
commit `6bd2291` — money display (§3a), savings destinations (§7.9), the
add-debt / add-goal / onboarding forms (§7.6, §7.1), the edit and
record-a-payment flows (§7.4, §7.6), the protection override (§7.3) and the
corrected Hijri date (§7.2). Verify they are there before drawing; if any is
missing, the checkout is stale — stop and say so.

---

## 2 · The look — one paragraph, then the rules

> **Rewritten 10 September 2026, after the design stop.** The original §2 asked for
> one accent on a neutral ground and a single typeface. The owner reviewed that and
> rejected it as flat — "regular AI slop" were the words — and chose a combination of
> two explored directions instead: an editorial private-bank treatment for type, money
> and controls, and a dark-terminal treatment for the gauge, the charts and the "where
> your money is" block. What follows is the direction as built and as recorded in
> `tokens.md` §0. It supersedes the original text; where this brief and `tokens.md`
> disagree, `tokens.md` wins.

Calm, dense, honest. The app tells someone how much of their own money they can spend
today; the design's only job is to make that number trustworthy. It should look like a
well-made private bank statement or a good spreadsheet, not like a startup landing page.
If a screen could be mistaken for an AI-generated mockup, it is wrong.

**Rules, binding:**

- **Two grounds, one language.** Light is warm paper (`#F7F3EA`), dark is near-black
  (`#0A0D10`). Dark is not an inversion of light: surfaces step by lightness, the hues
  are re-tuned, and every pair is re-measured.
- **Four meaning-bearing hues, and nothing else carries meaning.** Emerald — the primary
  action, and money going right. Ochre — near a limit. Slate — people and neutral data.
  Rose — money going wrong, and only that. Everything else is the neutral ramp. There is
  no decorative colour anywhere.
- **Selection is ink, not accent.** Chosen chips, checked boxes and the segmented thumb
  fill with `color.text`, never with the accent. Emerald appears on the primary button,
  the focus ring, the active tab underline and progress fill — nowhere else.
- **Three typefaces, three jobs.** EB Garamond for titles and voice; Inter for structure,
  UI and every figure; JetBrains Mono for labels, dates and column headers. Money is
  always Inter, always tabular and lining, never the serif. The hero figure is large
  because it matters, not because it is decorative.
- **Numbers align.** Money right-aligned in every table and tile; thousands separators
  always; the naira sign part of the figure; kobo at 0.60 of the naira size and one weight
  lighter. A bare minus sign is never shown — direction is always a word. Spendable
  figures round down, obligations round up.
- **Diagrams do the work stat tiles used to.** Three, and only three: an arc gauge for the
  headline figure, a daily-spend column chart against the planned allowance, and a
  segmented bar for where the cycle's money is. No pie charts, no sparkline decoration.
- **No gradients, no glassmorphism, no blurred blobs, no purple, no neon, no drop-shadow
  cards floating on a white void.** Elevation is one subtle level, for sheets and dialogs
  only. Radius comes off a fixed scale — 8 · 10 · 12 · 13 · 16 · 22 · 30 — and nothing
  else is used.
- **Colour is never alone (spec §3).** Amber and rose always carry a word — "Low",
  "Overspent", "Short", "Overdue". Design the badge first, the colour second.
- **Danger colour is reserved (addendum, spec §4).** Rose appears only where the spec's
  table puts it, plus the single destructive button fill. Delete confirmations,
  validation on neutral fields, offline notices and import refusals are neutral.
- **Type-only empty states.** No illustrations. One icon from the set is permitted; a
  sentence and a button do the work.
- **Icons: one hand-drawn set on a 24 grid, 1.85 stroke, one weight** — 20px in bars,
  16–18px inline, 44px targets around them. (The original brief named Lucide; the drawn
  set replaces it so the stroke weight matches EB Garamond's. If Lucide is preferred at
  build time, match the stroke and the grid.)
- **Dark theme is a first-class deliverable.** Every screen exists in both themes; every
  gated pair is measured in both.
- **360px is the design.** 1440px adds space and a sidebar, never features (spec §5).
  Onboarding is the exception in reverse: at 1440 it is the same 620px card centred in an
  empty frame, so it is one component and one breakpoint, not a second design.
- **The mark is the mizan beam** — a set of scales, tipped, one colour, never filled,
  never levelled. The Arabic wordmark (ميزانية, Amiri) is always secondary to the Latin
  and never carries a figure.

---

## 3 · Worked content — the one screenful everyone designs from

All from `docs/seed-data.md` and the spec's tables. Do not change these figures; do not add others.

| Where | Figures |
|---|---|
| Date row | **Mon 5 Oct · 24 Rabiʻ II 1448** — computed with `Intl` pinned to `islamic-umalqura`. Do not hand-type it, and do not use the bare `islamic` alias: engines resolve it differently and disagree by a day on 24 October |
| Home hero | **Safe to spend today ₦7,500** · "₦220,000 left · 20 days to 25 Oct" |
| Unallocated banner | "₦50,000 unallocated — finish your plan →" (also design the state where it is absent) |
| Tiles | Cash left ₦220,000 (of ₦450,000) · Income ₦450,000 / ₦450,000 · Saved ₦90,000 of ₦160,000 · Debt paid ₦30,000 of ₦30,000 |
| Categories (worst first) | Food & groceries +₦12,000 carried, spent over allowance → **Overspent**; Transport/data/airtime at 85% → **Low**; then the rest under 80% |
| Goals & debts | Rent fund ₦475,000 of ₦900,000 · "₦50,000 short · needs ₦85,000 a payday" → **Short**; Emergency fund ₦0 of ₦150,000, no due date |
| Debts | You owe: A. Friend ₦90,000 (₦30,000 a month, clears in 3 paydays); Spouse ₦60,000. Owed to you: B. Colleague ₦40,000 with the note "Not counted in safe to spend until it arrives." |
| Quick Add | Amount field focused, ₦ prefix, Expense ▾ · Today ▾, chips Food · Transport · Family · ⋯, "+ note" collapsed, Save |
| Transactions | Day headers, eight labels: Income · Expense · Move to savings · Take from savings · I borrowed · I repaid · I lent · They repaid me |
| Plan | Sticky header "Unallocated ₦0" (and the ₦50,000 state), rows grouped Savings · Debt payment · Expense, footnote "Planned daily allowance ₦8,666.66" |
| Months | One row: "25 Sep – 24 Oct" style label — but the worked owner has no completed cycle yet, so design the **empty state** ("Your first cycle is still running. It ends on 24 October.") and one populated row for the primitives sheet |
| Settings | "Protected." storage line, "47 changes since your last export." nudge, amber-threshold slider "Amber below ₦5,200 a day" |
| Hero states | Normal **₦7,500.00** · Amber **₦4,800.00 Low** (the threshold is ₦5,200.00) · Red **"₦2,300.00 over" Overspent** with the sentence from spec §8 · No-plan **₦8,666.66** with its sentence |

**Money format — settled, and it decides the hero's type scale.** Spec §3a is
authoritative; the earlier assumption in this brief (whole naira on summary
figures) was wrong and is withdrawn.

- **Every amount carries its kobo.** `₦7,500.00`, `₦220,000.00`, `₦0.00`. One
  formatter, one output, everywhere. A non-zero kobo is never rounded away.
- **The hero solves its width typographically, not numerically.** `MoneyText`
  emits the naira and kobo as separate spans; the kobo part is set **smaller and
  lighter**. The string is unchanged — only the type sizes differ.
  **Design that pairing first: it fixes the top of the type scale**, and the
  same relationship repeats at every size down to a table row.
- **Rates are the exception.** Per-day figures round — money you may spend rounds
  **down**, money you must find rounds **up**, never to the nearest. The planned
  daily allowance is therefore `₦8,666.66`, not `₦8,666.67`.

Every figure in the table above should be read with its `.00`.

---

## 4 · Decisions already taken (spec §9 answered)

| # | Question | Decision |
|:-:|---|---|
| 1 | Token set | Produced here, in the §5 schema, light and dark |
| 2 | Hero treatment | Figure at the top of the type scale, label above in small caps or muted text, sub-line below in muted text; nothing else competes on the first screenful. No card around it. **The naira/kobo size-and-weight pairing from spec §3a is part of this decision** — settle it here and reuse it everywhere. |
| 3 | Amber/red styling | Badge with text + the figure tinted; never the figure alone |
| 4 | Icons | Lucide, one weight |
| 5 | Debt record name prompt | Prompt once, then save to Settings |
| 6 | Empty states | Type-only |
| — | Zakat | Design last, one artboard; it may slip past v1 |
| — | Print view (debt record) | Black-and-white, A4, real headings, no chrome — design it as a print sheet, not a screen |

---

## 5 · `tokens.md` — the schema SHARED RULES will implement verbatim

Semantic names only (F4). Every value appears for **light** and **dark**. Every colour pair used for text-on-surface carries its measured contrast ratio; anything under 4.5:1 (body) or 3:1 (large text, borders, icons) is a defect, not a note.

```
color.surface            page background
color.surface.raised     cards, tiles, table rows
color.surface.sheet      sheets and dialogs (one elevation step)
color.border             hairlines, input borders
color.text               primary
color.text.muted         labels, sub-lines
color.text.inverse       on accent
color.accent             the one accent
color.accent.text        text on accent
color.focus              focus ring (may equal accent)
color.positive           "on track" / income — used sparingly, never for the hero
color.warning            amber — with its text form
color.warning.text
color.danger             red — money going wrong only
color.danger.text
color.progress.track / color.progress.fill

type.family              one family; note the tabular-figures setting for money
type.scale               hero · h1 · h2 · body · small · micro — size / line-height / weight each
type.money               which scale steps money uses, and the tabular rule

space.1 … space.8        a 4px base scale
radius.sm / radius.md    two radii, nothing else
elevation.sheet          the single shadow, both themes
motion.duration / motion.easing   plus the reduced-motion rule (J3)
target.min               44px (J1)
```

Then, under "Primitives", one line per component naming the tokens it consumes: Button (primary, secondary, quiet, danger), Input, AmountInput, Select, Card, Sheet, StatTile, ProgressBar, Badge (On track · Low · Short · Overdue · Overspent), Tabs, Toast, EmptyState, Table, MoneyText, OfflineNote. Each with its states: default, hover/pressed, focused, disabled, loading, error, empty where relevant (F6).

---

## 6 · Deliverable file names

Delivered 10 September 2026. Every screen exists at **360 and 1440**, in **light and
dark** — 65 artboards over eleven pages.

```
docs/design/README.md                    what is here, which spec commit, the date
docs/design/tokens.md                    the complete token set, both themes
docs/design/PROPOSED-seed-additions.md   figures the design needed; NOT yet in seed-data
docs/design/canvas/                      the editable source: one .dc.html per artboard
                                         plus canvas.json — re-seed a Claude Design canvas
docs/design/html/                        the same artboards as standalone pages; open any
                                         one in a browser at full fidelity
docs/design/*.png                        rendered previews, for reading in a PR

00-cover-{light,dark}                    contents, settled figures, the rules
00-primitives-{light,dark}               every component in every state
00-logo-{light,dark}                     the mark, its grid, sizes, icon, favicon, misuse
00-style-{light,dark}                    palette, type, status pills
01-welcome-{360,1440}-{light,dark}       launch and welcome, before onboarding step 1
01-onboarding-{360,1440}-{light,dark}    all six steps
02-home-{360,1440}-{light,dark}          plus -cycle (mid-cycle) and -states
02a-more-sheet-360-{light,dark}
03-plan-{360,1440}-{light,dark}
04-transactions-{360,1440}-{light,dark}
04a-quick-add-{360,1440}-{light,dark}
05-debts-goals-{360,1440}-{light,dark}
05a-debt-record-{360,1440}-{light,dark} and 05a-debt-record-print (A4, black and white)
05b-forms-{360,1440}-{light,dark}        add a debt, add a goal
06-months-{360,1440}-{light,dark}
07-settings-{360,1440}-{light,dark}
07a-zakat-{360,1440}-{light,dark}
07b-import-360-{light,dark}
```

---

## 7 · Acceptance — check before handing over

- Every figure on every screen is in §3 or the spec; nothing invented.
- Every hero state designed (normal, amber, red, no plan, empty, offline) and each
  amber/red carries its word.
- Contrast ratios written into `tokens.md` for both themes; none failing. *(54 gated
  pairs, 0 failures.)*
- Rose appears only where spec §4's table allows, plus the destructive button fill.
- No gradient, glass, blob, purple, illustration, or decorative colour anywhere.
- The accent is confined to the primary button, focus ring, active tab underline and
  progress fill; selection is carried by ink.
- Touch targets ≥ 44px at 360px, including table-row actions and the ⊕.
- Focus ring visible on the primitives sheet for every focusable component.
- Bottom bar: Home · Plan · ⊕ · Debts · More, labels present.
- Money right-aligned and tabular in every table and tile; kobo always shown; no bare
  minus sign anywhere.
- Every navigation destination has a screen, at both widths and in both themes.
- A reviewer who reads only `tokens.md` and `00-primitives-*.png` could build `src/ui/`
  without opening a screen PNG.

---

## 8 · How to run it in a fresh chat (paste this as the first message)

> I'm at the design stop of a Peer AI build. The repo is at `Miqan/mizaniya` (the folder is connected). Read `docs/design/DESIGN-BRIEF.md` first and follow it exactly — it names every other file to read, the decisions already taken, the token schema and the deliverables. Confirm the six spec corrections are present in `docs/06-page-specs.md` before drawing. Use a judge panel for the token palette (three independent proposals scored against §2 and §7, synthesise the winner), build the Claude Design canvas from the winner, then run an adversarial acceptance pass against §7 before you tell me it's done. Commit nothing — export to `docs/design/` and stop; I'll review and commit.

A suggested orchestration shape for the ultracode session, so it spends effort where it matters: (1) three palette/type proposals in parallel → scored → one synthesis; (2) the primitives sheet from the synthesis, both themes; (3) screens in parallel from the primitives, each screen agent given only its section of the spec plus §3 of this brief; (4) a completeness critic that reads §7 and lists what is missing or wrong; (5) fix and export.
