# Mizaniya — design brief (the design stop)

**Who this is for.** A fresh Claude session (Cowork / Claude Design, Opus, ultracode on) that has *no memory of this project*. Everything it needs is in this file and the files it names. Read all of them before drawing anything.

**What it produces.** Two things into this folder, `docs/design/`:

1. `tokens.md` — the complete design-token set, light **and** dark, in the schema in §5. SHARED RULES implements it *exactly*; nothing in it is advisory.
2. Screen designs as PNGs (one per screen at 360px; Home additionally at 1440px), plus one primitives sheet showing every `src/ui/` component in every state. File names in §6.

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

Calm, dense, honest. The app tells someone how much of their own money they can spend today; the design's only job is to make that number trustworthy. It should look like a well-made banking app or a good spreadsheet, not like a startup landing page. If a screen could be mistaken for an AI-generated mockup, it is wrong.

**Rules, binding:**

- **One accent colour.** Used for the primary action, focus rings, links and the progress-bar fill. Nowhere else. A deep, slightly warm green or a deep teal — pick one, justify it in one sentence in `tokens.md`, and never introduce a second brand colour.
- **No gradients, no glassmorphism, no blurred blobs, no purple, no neon, no drop-shadow cards floating on a white void, no rounded-corner-everything.** Radius is small (4–8px) and consistent. Elevation is one subtle level for sheets and dialogs only.
- **Typography carries the hierarchy.** One typeface family with a tabular-figure variant for money (Inter with `font-variant-numeric: tabular-nums` is acceptable; a system stack is acceptable). Money never uses a display face. The hero figure is large because it matters, not decorative.
- **Numbers align.** Money right-aligned in every table and tile; thousands separators always; the naira sign is part of the figure, not a separate icon.
- **Colour is never alone (spec §3).** Amber and red always carry a word — "Low", "Overspent", "Short", "Overdue". Design the badge first, the colour second.
- **Danger colour is reserved (addendum, spec §4).** Red appears only where the spec's table puts it. Delete confirmations, validation, offline notices and import refusals are neutral.
- **Type-only empty states.** No illustrations. One icon from the set is permitted; a paragraph and a button do the work.
- **Icons: Lucide, one weight, 20px in bars and 16px inline.** Bottom-bar items keep their text labels at 360px.
- **Dark theme is a first-class deliverable**, not an inversion. Surfaces step by lightness, not by adding shadows; the accent is re-tuned for contrast; amber and red are re-tuned and re-checked.
- **360px is the design.** 1440px adds space, not features (spec §5).

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
| Plan | Sticky header "Unallocated ₦0" (and the ₦50,000 state), rows grouped Savings · Debt payment · Expense, footnote "Planned daily allowance ₦8,666.67" |
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

```
docs/design/tokens.md
docs/design/00-primitives-light.png
docs/design/00-primitives-dark.png
docs/design/01-onboarding-360.png        (steps 2 and 5 at least)
docs/design/02-home-360.png              (normal state)
docs/design/02-home-360-states.png       (amber, red, no-plan, empty, offline)
docs/design/02-home-1440.png
docs/design/03-plan-360.png
docs/design/04-transactions-360.png      (populated + both empty states)
docs/design/04a-quick-add-360.png
docs/design/05-debts-goals-360.png       (both tabs)
docs/design/05a-debt-record-print.png    (A4, black and white)
docs/design/06-months-360.png            (empty + populated)
docs/design/07-settings-360.png
docs/design/07a-zakat-360.png            (last)
docs/design/README.md                    (one paragraph: what is here, which spec version it was made from, the date)
```

Dark theme: Home and Quick Add at minimum; the primitives sheet in both.

---

## 7 · Acceptance — check before handing over

- Every figure on every screen is in §3 or the spec; nothing invented.
- Every hero state designed (normal, amber, red, no plan) and each amber/red carries its word.
- Contrast ratios written into `tokens.md` for both themes; none failing.
- Red appears only where spec §4's table allows.
- No gradient, glass, blob, purple, illustration, or second accent anywhere.
- Touch targets ≥ 44px at 360px, including table-row actions and the ⊕.
- Focus ring visible on the primitives sheet for every focusable component.
- Bottom bar: Home · Plan · ⊕ · Debts · More, labels present.
- Money right-aligned and tabular in every table and tile.
- A reviewer who reads only `tokens.md` and `00-primitives-*.png` could build `src/ui/` without opening a screen PNG.

---

## 8 · How to run it in a fresh chat (paste this as the first message)

> I'm at the design stop of a Peer AI build. The repo is at `Miqan/mizaniya` (the folder is connected). Read `docs/design/DESIGN-BRIEF.md` first and follow it exactly — it names every other file to read, the decisions already taken, the token schema and the deliverables. Confirm the six spec corrections are present in `docs/06-page-specs.md` before drawing. Use a judge panel for the token palette (three independent proposals scored against §2 and §7, synthesise the winner), build the Claude Design canvas from the winner, then run an adversarial acceptance pass against §7 before you tell me it's done. Commit nothing — export to `docs/design/` and stop; I'll review and commit.

A suggested orchestration shape for the ultracode session, so it spends effort where it matters: (1) three palette/type proposals in parallel → scored → one synthesis; (2) the primitives sheet from the synthesis, both themes; (3) screens in parallel from the primitives, each screen agent given only its section of the spec plus §3 of this brief; (4) a completeness critic that reads §7 and lists what is missing or wrong; (5) fix and export.
