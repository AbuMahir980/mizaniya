# Page Specs — Mizaniya v1

| Field | Value |
|---|---|
| **Date** | 2026-09-10 |
| **Phase** | 6 · Page Specs (frontend) |
| **Inputs** | [03-system-spec.md](03-system-spec.md) · [04-api-contract.md](04-api-contract.md) · [02-architecture.md](02-architecture.md) · [seed-data.md](seed-data.md) |
| **Status** | Complete. **This is the design stop** — `docs/design/` is produced from this document. |

---

## How to read this

**The designs do not exist yet. They are made from this file.** So every screen
below states its regions, every number it shows and where that number comes
from, all five states, its primary action, and what the danger colour means on
it. If something here is ambiguous, the design will guess — and a guess about
someone's money is the thing this whole project is arranged to avoid.

**Every figure shown is from [docs/seed-data.md](seed-data.md)** and is invented
(repo rule 2). The worked day throughout is **5 October, day 11 of a 30-day
cycle**, so the designer has one consistent screenful of real content.

**Sections 2 to 6, §3a included, apply to every page and are not repeated per
page.** Nine copies
of the accessibility rules would drift within a week — see
[[one-source-of-truth]].

---

## 1 · Page inventory

One role — the **owner** — sees everything. There is no other role, no
permission logic, and no hidden state (system spec §4), so the per-page
"role-based visibility" section that this phase's template asks for would say
the same thing nine times. It is stated once here instead.

| # | Page | Route | Priority | Reached from |
|:-:|---|---|:-:|---|
| 1 | **Onboarding** | `/welcome` | P0 | First run only; redirected here until settings exist |
| 2 | **Home** | `/` | P0 | Nav, app launch, after any save |
| 3 | **Plan** | `/plan` | P0 | Nav, unallocated banner |
| 4 | **Transactions** | `/transactions` | P0 | Nav, any Home tile |
| 4a | **Quick Add** *(sheet)* | overlay, no route | P0 | The persistent action button, from anywhere |
| 5 | **Debts & Goals** | `/debts` | P0 | Nav, Home goals table |
| 5a | **Debt record** | `/debts/:id/record` | P1 | A debt card |
| 6 | **Months** | `/months` | P1 | Nav (under More on mobile) |
| 7 | **Settings** | `/settings` | P0 | Nav (under More on mobile) |
| 7a | **Zakat** | `/zakat` | P1 | Settings; **may slip past v1** (D13) |

---

## 2 · Navigation

**Mobile (360px) — a bottom bar, five items, always visible.**

`Home · Plan · ⊕ · Debts · More`

- The centre **⊕** is the Quick Add trigger, not a route. It is the largest
  target on the screen and sits under the thumb, because story **G2** wants a
  spend recorded while standing at a counter.
- **More** opens a sheet: Transactions, Months, Settings, Zakat.
- Transactions is not a bottom-bar item. Quick Add covers the common case;
  browsing the list is the rarer one.

**Desktop (1440px)** — a left sidebar with every destination listed flat, no
More. Quick Add becomes a button in the header.

---

## 3 · Accessibility — binding on every page

Standards **J1–J5**, WCAG 2.1 AA. This is the checklist the design must satisfy
and the code must keep.

| Requirement | Rule |
|---|---|
| **Touch targets** | ≥ 44 × 44 CSS px, including table-row actions and the amount stepper. Spacing between adjacent targets ≥ 8px (2.5.5) |
| **Labels** | Every interactive element has an accessible name. Icon-only buttons — the ⊕, row menus, close — carry a visible-on-focus label or `aria-label` (3.3.2, 4.1.2) |
| **Contrast** | ≥ 4.5:1 body text, ≥ 3:1 large text and UI borders, **in light and dark**, verified by a token-level test (1.4.3, 1.4.11, J4) |
| **Colour is never alone** | Amber and red always carry **text as well** — "Low", "Overspent". A colourblind owner must lose nothing (1.4.1) |
| **Keyboard** | Every action reachable and operable by keyboard, logical order, visible focus ring on every focusable element (2.1.1, 2.4.3, 2.4.7). Proven by a Playwright test, not by inspection |
| **Motion** | `prefers-reduced-motion` removes the sheet slide, tile counters and progress-bar fills. Nothing conveys meaning through motion alone (J3) |
| **Zoom** | Usable at 200% zoom at 360px with no horizontal page scroll. Wide tables scroll inside their own container |

### Two rules specific to a money app

**How a figure is read aloud.** `₦7,500.00` must not be announced as "N seven
thousand five hundred point zero zero" or as a symbol name. Every money figure carries an
accessible label in words:

| Displayed | Announced |
|---|---|
| `₦7,500.00` | "7,500 naira" |
| `₦7,500.50` | "7,500 naira 50 kobo" |
| `₦8,400.00` amber | "8,400 naira. Low." |
| `−₦2,300.00` red | "2,300 naira over. Overspent." |
| `₦0.00` | "Zero naira" |

Zero kobo is never spoken. Only a **non-zero** kobo is announced — the same
principle as §3a: silence when there is nothing to notice, a clear signal when
there is.

Never announce a bare minus sign. "Minus 2,300" is ambiguous read aloud; "2,300
over" is not.

**Announcing what changed after a save.** Saving a transaction changes a dozen
figures at once. Putting `aria-live` on each one would announce a paragraph of
numbers and tell the owner nothing.

> **One polite live region per screen.** It announces the outcome and **only
> the figure the owner came for**:
> *"Saved. Safe to spend today, 7,500 naira."*

Everything else updates silently and can be read on demand. Failures are
announced through the same region with `role="alert"`.

---

## 3a · Money on screen

The addendum fixes the formatter: `₦1,250,000.00`. Figures in this document are
written in whole naira for readability, but **on screen every amount carries its
kobo.** This section is the rule the design lays out to, and it settles the
hero's type scale.

### Amounts always show kobo

`MoneyText` renders one format everywhere — the addendum's formatter, and the
only place money is formatted (**H2**):

`₦7,500.00` · `₦220,000.00` · `₦0.00`

**A non-zero kobo is never hidden or rounded away.** In a naira-only,
hand-entered app a stray `.50` is almost always a typo or an arithmetic slip.
Showing it is what makes it findable; rounding it away is exactly the silent
wrongness this project keeps designing against.

### The hero, and the `.00` problem

`₦7,500.00` in the largest type on a 360px screen spends about a quarter of its
width on two digits that are nearly always zero.

**The answer is typographic, not numeric.** The string does not change — there
is one formatter with one output. The **kobo part is set smaller and lighter**,
so the naira reads at full size and the decimals sit quietly beside it. So
`MoneyText` emits the two parts as separate spans and lets the design size them:

```html
<span class="money">
  <span class="money-naira">₦7,500</span><span class="money-kobo">.00</span>
</span>
```

The accessible label is unaffected — "7,500 naira", per §3. A screen reader never
says "point zero zero".

**Designer: settle this pairing first.** It fixes the hero's type scale, and the
same relationship is reused at every size down to a table row.

### Rates, and which way to round

Some figures come from division — safe-to-spend **per day**, the planned daily
allowance, the rate that closes a gap. Division does not land on a whole kobo,
so rounding is a decision, and the direction is the decision.

> **Money you may spend → round DOWN.**
> **Money you must find → round UP.**
> **Never round to the nearest.**

Nearest is wrong in both directions, and half the time it is wrong towards
spending money that is not there.

| Figure | Working | Shown | Why that direction |
|---|---|---|---|
| Safe to spend per day | ₦150,000.00 ÷ 20 | **₦7,500.00** | exact here; floors when it is not |
| Planned daily allowance | ₦260,000.00 ÷ 30 | **₦8,666.66** | floor — overstating it licenses overspending |
| Rate to close the rent gap | ₦425,000.00 ÷ 5 | **₦85,000.00** | ceiling — understating it misses the target |

Flooring the per-day figure also keeps a promise worth keeping: twenty days at
the floored rate can never exceed the money actually there.

`MoneyText` takes an already-rounded value. **It never rounds** — rounding is a
`core/` decision, tested, and never made in a component (**H3**).

---

## 4 · What the danger colour means

The addendum is explicit: danger means **money going wrong** — negative
safe-to-spend, a missed debt schedule, an overspent envelope. Nothing else.

**Danger is never used for:** destructive-but-normal actions (delete a
transaction — that is a neutral confirm), validation of an empty field, the
offline notice, or a refused import. Those are ordinary states, and spending
red on them makes red mean nothing by the time it matters (**F7**).

| Screen | Amber | Red |
|---|---|---|
| Home | Safe-to-spend below 60% of the planned daily allowance | Safe-to-spend negative |
| Plan | — | Planned total exceeds take-home |
| Transactions | — | — |
| Debts & Goals | Goal projected short of target | A due date has passed unmet |
| Category rows | Spent 80–100% of allowance | Spent over allowance |

---

## 5 · Responsive rules

| | 360px (primary) | 768px | 1440px |
|---|---|---|---|
| Stat tiles | 2 × 2 | 4 across | 4 across |
| Tables | Card-per-row, key figure right-aligned | Table | Table, more columns |
| Nav | Bottom bar | Bottom bar | Left sidebar |
| Quick Add | Bottom sheet, full width | Bottom sheet | Centred dialog, 480px |
| Page width | Full bleed, 16px gutters | 720px centred | 1200px centred |

**Mobile-first is literal.** The 360px layout is the design; wider screens add
space, not features. Nothing is available only on desktop.

---

## 6 · Shared components

Drawn from `src/ui/` (built in SHARED RULES from `docs/design/tokens.md`).
Screens may use **only** these primitives.

| Component | Used by | Notes |
|---|---|---|
| `StatTile` | Home | Figure, label, progress bar against plan, tappable |
| `MoneyText` | everywhere | Formats kobo → `₦1,250,000.00` and attaches the spoken label. **The only place money is formatted** (**H2**) |
| `ProgressBar` | StatTile, goals, category rows | Carries a text percentage as well as a bar |
| `Badge` | goals, debts, category rows | On track · Low · Short · Overdue · Overspent |
| `Sheet` | Quick Add, More, confirmations | Traps focus while open, restores it on close, closes on Escape |
| `EmptyState` | every list | Icon, one line of what this is, one line of why it is empty, one action |
| `Table` | categories, transactions, months | Scrolls inside its own container |
| `Toast` | after every save | Announced through the page's live region |
| `Button`, `Input`, `Select`, `Card`, `Tabs` | everywhere | Every state per **F6** |
| `AmountInput` | Plan, Quick Add | Numeric keypad on mobile, thousands separators as you type, stores kobo |
| `OfflineNote` | app shell | Dismissible, informational, **never danger-coloured** |

---

## 7 · The pages

### 7.1 · Onboarding — `/welcome`

**Purpose.** Get to a correct Home screen in about two minutes. Every step
except the first is skippable (story A5).

**Layout.** Single column, one question per screen, progress dots at the top,
`Back` and `Continue` pinned to the bottom above the keyboard.

| Step | Asks | Required |
|:-:|---|:-:|
| 1 | Your name *(for the printed debt record)* | no |
| 2 | Salary day, and take-home pay | **yes** |
| 3 | Categories — the seeded list, editable | pre-filled |
| 4 | What you already have saved — opening balances | no |
| 5 | Who you owe, and who owes you | no |
| 6 | Rent target and its due date | no |

#### Step 4 — opening balances, per savings category

One row per category of type `Savings`, each with an optional amount. The
question on screen: *"What have you already put aside for this?"*

| Field | Rule | Message when wrong |
|---|---|---|
| Amount, per savings category | optional, ≥ 0 | "Amounts are numbers only." |

**Each non-zero amount becomes a dated opening transaction** of type
`savings-in`, never a stored total (D3, story A3).

**Dated the day before the current cycle begins** — 24 September in the seeded
scenario. This matters. Dated *today* they would fall inside the running cycle,
and Home's "Saved" tile would read ₦490,000.00 instead of ₦90,000.00 —
overstating this cycle's saving by everything the owner has ever saved. The
figure would look entirely plausible and nothing would flag it.

#### Step 5 — debts, in both directions

Uses the **Add a debt** form (§7.6), repeated: "Add another" after each, "Done"
to move on. Both directions sit in the same step, because the app is about both
and splitting them would imply one matters more.

**Numbers shown.** Only what the owner types, echoed back formatted:
`450000` → **₦450,000.00** as they type.

**Where they go.** `Settings` (steps 1–2), `Category[]` (3), opening
`Transaction[]` (4), `Debt[]` (5), `Goal[]` (6) — via `Repository`, then the
snapshot. **Opening balances become dated transactions, never a stored total**
(D3, story A3).

**States.**

| | |
|---|---|
| Loading | None. Nothing to load on a first run |
| Empty | This screen *is* the empty state for the whole app |
| Error | Field-level, inline, below the field. A failed save **keeps every entered value** and offers Retry — the owner never re-types |
| Offline | Normal. Step 1 carries the line: *"Everything you enter stays on this device."* |
| Success | Land on Home with correct figures already showing — never an empty Home |

**Validation.**

| Field | Rule | Message |
|---|---|---|
| Salary day | 1–31 | "Pick a day between 1 and 31." |
| Take-home | > 0 | "Enter how much you take home each month." |
| Rent due date | a real future date | "Pick the date the rent is due." |
| Rent target | > 0 if a due date is set | "Enter the amount you need by then." |

**Salary day 29, 30 or 31** shows a note, not a warning: *"Short months will use
the last day."* (D4)

**Primary action.** `Continue`. **Danger colour:** none — no money is going
wrong yet.

**Accessibility.** One `<h1>` per step; the step change moves focus to it.
Progress announced as "Step 2 of 6".

---

### 7.2 · Home — `/`

The screen the app exists for. It answers one question before it answers any
other (D8).

**Layout, top to bottom.**

```
┌──────────────────────────────────────┐
│  Mon 5 Oct  ·  24 Rabiʻ II 1448      │  date row (Hijri, story B7)
├──────────────────────────────────────┤
│                                      │
│        Safe to spend today           │
│           ₦7,500.00                  │  ← hero, largest thing on screen
│  ₦220,000.00 left · 20 days to 25 Oct│
│                                      │
├──────────────────────────────────────┤
│  [ ₦50,000 unallocated →         ]   │  banner; ABSENT when ₦0
├──────────────────────────────────────┤
│ ┌────────────┐ ┌────────────┐        │
│ │ Cash left  │ │ Income     │        │
│ │ ₦220,000   │ │ ₦450,000   │        │  2×2 mobile, 4-across desktop
│ │ ▓▓▓▓▓░░░   │ │ ▓▓▓▓▓▓▓▓   │        │
│ └────────────┘ └────────────┘        │
│ ┌────────────┐ ┌────────────┐        │
│ │ Saved      │ │ Debt paid  │        │
│ │ ₦90,000    │ │ ₦30,000    │        │
│ │ of ₦160,000│ │ of ₦30,000 │        │
│ └────────────┘ └────────────┘        │
├──────────────────────────────────────┤
│  Categories            variance      │
├──────────────────────────────────────┤
│  Goals & debts         status        │
└──────────────────────────────────────┘
```

**About the figures in this sketch.** The hero carries its kobo, because that
pairing sets the type scale (§3a). The rest are written short to keep the sketch
legible — **on screen every amount carries `.00`**, and the tiles must be laid
out with room for it.

**Every number, and where it comes from.**

Values below are written in whole naira for readability; every one renders with
its kobo (§3a).

| Shown | Worked value | Source |
|---|---|---|
| Safe to spend today | **₦7,500.00** | `core/budget.safeToSpendPerDay(snapshot, now)` |
| Cash left | ₦220,000 | `core/budget.cashLeft(snapshot)` |
| Days left | 20 | `core/cycle.daysLeft(settings, now)` — counts today, minimum 1 |
| Next payday | 25 Oct | `core/cycle.nextSalaryDay(settings, now)` |
| Unallocated | ₦50,000 | `core/budget.unallocated(snapshot, cycle)` |
| Income actual / planned | ₦450,000 / ₦450,000 | `core/budget.actualByType` / plan total |
| Saved actual / planned | ₦90,000 / ₦160,000 | same |
| Debt paid actual / planned | ₦30,000 / ₦30,000 | same |
| Category variance | per row | `core/budget.categoryVariance(snapshot, cycle)` |
| Goal status | ₦50,000 short | `core/goal.projectedGap(goal, snapshot, now)` |
| Hijri date | 24 Rabiʻ II 1448 | `Intl.DateTimeFormat` with **`islamic-umalqura`** — no library. See the pinning note below |

**None of these is stored.** Every one is computed on read (**B3**).

**Category table** — one row per non-archived category: name, spent, allowance,
bar, badge. Rolling categories show *"+ ₦12,000 carried"* beneath the name.
Sorted by variance, worst first — the row that needs attention is at the top.

**Goals & debts table** — name, current, target, badge, and for a goal with a
due date the gap: *"₦50,000 short · needs ₦85,000 a payday"*. That second half
is arithmetic, not advice (system spec §3).

**States.**

| | |
|---|---|
| Loading | Skeletons in the hero and tile shapes. Roughly one frame — the snapshot is in memory (ADR-001) |
| Empty — no plan | Hero shows the full planned allowance with **no amber or red**; unallocated banner reads the full take-home |
| Empty — plan, no transactions | Tiles read ₦0 of their planned figures. Category rows show full allowances. This is a correct screen, not an empty one |
| Error | *"Couldn't open your data."* + Retry. Never a blank screen |
| Offline | Normal. `OfflineNote` under the date row, dismissible, neutral-coloured |
| Success | The layout above |

**Primary action.** The ⊕ Quick Add. **Everything is tappable** — every tile and
every row opens the records behind it (story B6). No figure is a dead end.

**Where each tile leads.**

| Tile | Opens |
|---|---|
| Cash left | Transactions, this cycle, unfiltered |
| Income | Transactions filtered to `income` |
| Saved | Transactions filtered to the two savings types, **subtotalled per destination** in the filter bar |
| Debt paid | Debts & Goals, Debts tab |

No new screen is needed for savings-by-destination — it is the Transactions list
with a filter and subtotals (§7.4).

**Pin the Hijri calendar.** Use `islamic-umalqura` explicitly, never the bare
`islamic`, which is an alias each engine resolves for itself. On 5 October 2026
they agree; on 24 October 2026 `islamic` gives 14 Jumada I and `islamic-umalqura`
gives 13. **A religious date that differs by device is worse than no date**, and
nobody would ever notice — it is the same silent-wrongness failure as everywhere
else. The formatter also appends " AH" and uses U+02BB (ʻ) in "Rabiʻ"; strip the
suffix, keep the character.

**Accessibility.** The hero is an `<h1>`-level landmark with the spoken label
from §3. The live region sits directly beneath it. Tiles are buttons, not cards
with click handlers. The Hijri date is supplementary, so it is announced after
the Gregorian one, not instead of it.

---

### 7.3 · Plan — `/plan`

**Purpose.** Give every naira a job. Zero-based: the target is unallocated = ₦0.

**Layout.** Sticky header carrying the cycle and the running unallocated figure
— it must stay visible while typing, because it is the only feedback that the
plan is finished. Then one row per category, grouped by type in this order:
Savings · Debt payment · Expense.

**Row:** name · type badge · rolls-over mark · carried-in line if any ·
`AmountInput` right-aligned.

**Numbers.**

| Shown | Worked value | Source |
|---|---|---|
| Take-home | ₦450,000 | `settings.takeHome` |
| Allocated | ₦450,000 | Σ `PlanEntry.planned` for the cycle |
| **Unallocated** | ₦0 → banner hidden | `core/budget.unallocated` |
| Carried in | + ₦12,000 on food | `core/budget.carriedIn(category, previousCycle)` |
| Planned daily allowance | ₦8,666.67 | Σ spendable ÷ days in cycle — shown as a footnote so D15 is legible |

**Actions.** `Copy last cycle's plan` (top right; disabled with a reason when
there is no previous cycle — never silently inert). Per-row menu: rolls over,
protect from safe to spend, archive.

#### What "protected" means — defined once, used here and in Settings

> A category is **protected** when the money planned into it is **not counted as
> spendable**. Safe-to-spend subtracts it, because it is already promised to
> something — rent, savings, a debt payment.

Protection is derived from the category's type: anything that is not an
`Expense` is protected (D1). The **override** flips that decision for one
category, and does nothing else.

It exists for one case: an `Expense` category that is not really discretionary —
₦40,000.00 set aside for a hospital visit, or family support that is not
optional. Left unprotected, safe-to-spend counts that money as available and
reads **too high**, which is the direction that hurts.

**The control** — a switch, identical on the Plan row menu and in Settings →
Categories, editing the same field:

> **Protect from safe to spend**
> *Money planned here will not count as spendable.*
> Default: on for Savings and Debt payment, off for Expense.

**On the Plan row**, a protected category carries a small lock mark beside its
name, so protection is visible without opening a menu. Otherwise it is invisible
state that changes the app's headline figure.

**Autosave per row on blur.** No Save button — a plan half-typed and abandoned
should still be there tomorrow.

**States.**

| | |
|---|---|
| Loading | Skeleton rows |
| Empty | No categories → the seeded list offered as one action. No plan → every row ₦0, unallocated = full take-home |
| Error | The row keeps the typed figure, is marked, and shows Retry. **Unallocated does not move** — memory updates only after storage confirms (ADR-001) |
| Offline | Normal |
| Success | Unallocated reaches ₦0; the banner disappears; a toast says *"Plan complete."* |

**Danger colour.** Only when allocated exceeds take-home: *"₦20,000 over your
take-home"*. That is money going wrong.

**Accessibility.** Each `AmountInput` is labelled by its category name. The
unallocated figure is `aria-live="polite"` — this is the one screen where a
number changing *is* the feedback, so it is announced on each blur, not each
keystroke.

---

### 7.4 · Transactions — `/transactions`

**Layout.** Filter bar (cycle selector, category, type, date range) → grouped
list, newest first, day headers. Infinite list; no pagination controls.

**Row:** category or counterparty · note · type label · date · amount, with the
sign of the movement carried by wording, never a bare minus.

**Numbers.** Amount per row from `Transaction.amount` via `MoneyText`; a per-day
subtotal on each header; the filtered total in the filter bar.

**The eight type labels** — plain speech (D7, **O4**):

`Income` · `Expense` · `Move to savings` · `Take from savings` · `I borrowed` ·
`I repaid` · `I lent` · `They repaid me`

**Actions.** Tap a row to edit; swipe or row menu to delete (confirm: *"Delete
this ₦3,500.00 expense? This can't be undone."* — neutral, not danger).

**Editing opens the Quick Add sheet, pre-filled** — not a separate page. Same
component, same fields, same validation, titled **"Edit"**, with a Delete action
added and Save reading "Save changes". One form, not two: a second edit form
would be the same rules written out again, and the two would drift (**E2**).

Changing an amount or a date recalculates everything, including a past cycle if
the date moves into one. Nothing was stored, so nothing needs correcting
separately.

**Savings subtotals.** When the filter is set to the two savings types — which
is where Home's "Saved" tile lands — the filter bar carries a subtotal **per
destination**: *"Bank vault ₦75,000.00 · Cowrywise ₦15,000.00"*. That is the
whole of "savings by destination". It needs no screen of its own.

**States.**

| | |
|---|---|
| Loading | Skeleton rows |
| Empty — none this cycle | *"Nothing recorded this cycle yet."* + Quick Add |
| Empty — filters match nothing | *"No movements match these filters."* + Clear filters. **Distinct from the above** — the fix is different |
| Error | *"Couldn't load your movements."* + Retry |
| Offline | Normal |
| Success | The grouped list |

**Danger colour.** None. A large expense is not an error.

**Accessibility.** The list is a `<ul>` of rows, day headers are real headings.
Filter changes announce the result count: *"14 movements."*

---

### 7.5 · Quick Add — bottom sheet, no route

**The most important interaction in the app.** Three taps plus the amount
(story D1, goal G2).

**Layout.** Sheet from the bottom, 60% height, keyboard-aware. Amount field
**focused on open**, numeric keypad up immediately.

```
┌──────────────────────────────────┐
│  Add                          ✕  │
│                                  │
│         ₦ [        ]             │  ← focused, numeric keypad
│                                  │
│  Expense ▾   Today ▾             │  ← type and date, pre-set
│                                  │
│  Food  Transport  Family  ⋯      │  ← recent categories, one tap
│                                  │
│  + note                          │  ← collapsed
│  [           Save            ]   │
└──────────────────────────────────┘
```

**The three taps:** ⊕ → a category chip → Save. Type defaults to `Expense`, date
to today. Anything else is an extra tap, deliberately.

**Fields.** Amount (required, > 0) · type (default Expense) · category *or*
counterparty depending on type (§`04-api-contract` §3) · date (default today) ·
savings destination (savings types only) · payment method (optional) · note
(optional, collapsed).

**Conditional behaviour.** Choosing a debt type swaps the category chips for
counterparty chips. Choosing a savings type reveals the destination select.

**States.**

| | |
|---|---|
| Loading | None — it opens instantly from the snapshot |
| Empty | No categories yet → *"Add a category first"* with a link to Plan |
| Error | Inline on the field. A failed save **keeps the sheet open with every value intact** |
| Offline | Normal. No indicator — showing one here would imply the save might not work |
| Success | Sheet closes; toast *"Saved."*; the live region announces the new safe-to-spend |

**Validation.** Amount > 0: *"Enter an amount."* Amount not a number:
*"Amounts are numbers only."* Future date beyond the current cycle: allowed,
with a note *"This is in your next cycle."*

**Accessibility.** Focus moves into the sheet on open and returns to ⊕ on close.
Escape closes. Focus is trapped while open. Category chips are a labelled radio
group, not buttons — the owner is choosing one of a set.

---

### 7.6 · Debts & Goals — `/debts`

**Layout.** Two tabs: **Debts** · **Goals**. Debts split into *You owe* and
*Owed to you* by the **sign of the derived balance**, not by a stored field
(D9).

**Debt card:** counterparty · balance · schedule if any · last movement ·
progress bar · actions (Record a payment, Open record).

**"Record a payment" opens the Quick Add sheet, pre-set** — counterparty fixed
and not editable in that context, amount pre-filled with the schedule amount
where there is one, date today. One tap confirms the usual case.

**The type follows the balance**, because an ajo card sits on both sides of the
relationship at different times (D9):

| Balance | Action reads | Type pre-set |
|---|---|---|
| Positive — you owe | "Record a payment" | `I repaid` |
| Negative — owed to you | "Record a repayment" | `They repaid me` |

The card's overflow menu always offers the other three debt types too, so a
counterparty can move either way without the card fighting the owner.

**Goal card:** name · saved of target · bar · due date · status badge · the gap.

**Numbers, worked.**

| Shown | Value | Source |
|---|---|---|
| A. Friend | ₦90,000 | `core/debt.balance(debt, transactions)` |
| Spouse | ₦60,000 | same |
| B. Colleague | ₦40,000 *owed to you* | same — negative balance |
| A. Friend clears in | 3 paydays | `core/debt.paydaysToClear` |
| Rent fund | ₦475,000 of ₦900,000 | `core/goal.saved` |
| Rent status | **₦50,000 short** | `core/goal.projectedGap` |
| Rent rate needed | ₦85,000 a payday | `core/goal.rateToClose` |
| Emergency fund | ₦0 of ₦150,000 | `core/goal.saved` — no due date, so no gap |

**An ajo counterparty is one card throughout**, and its balance crosses from
*owed to you* to *you owe* at the payout. The card moves between groups; it is
never split (D9, story E4).

**Money owed to you counts toward nothing** — it appears here and nowhere else
(D3). A one-line note on the *Owed to you* group says so: *"Not counted in safe
to spend until it arrives."*

**States.**

| | |
|---|---|
| Loading | Skeleton cards |
| Empty — debts | *"No debts recorded."* + Add |
| Empty — goals | *"No goals yet."* + Add |
| Error | Per-card, so one bad record does not blank the screen |
| Offline | Normal |
| Success | Grouped cards |

**Danger colour.** Amber: a goal projected short. Red: a due date passed unmet,
or a debt schedule missed. Nothing else.

#### Form — Add a debt

Reached from the Debts empty state, the Debts tab, and Onboarding step 5.

| Field | Required | Rule | Message when wrong |
|---|:-:|---|---|
| Direction — *I owe them* / *They owe me* | yes | one of two, **no default**, so it is a decision rather than an accident | "Which way does this go?" |
| Counterparty name | yes | 1–120 characters | "Who is this with?" |
| Amount | yes | > 0 | "How much?" |
| Date it began | yes | a real date, **not in the future** | "Pick a date that has already happened." |
| Agreed repayment per cycle | no | > 0 if given | "Amounts are numbers only." |
| Terms | no | up to 500 characters | — |
| Witnesses | no | a list of names, added one at a time (D10) | — |

**Direction sets the opening movement, not a stored field.** *I owe them* writes
an opening `borrowed`; *They owe me* writes an opening `lent`. The `Debt` record
has no direction of its own — its balance is derived and may later cross zero
(D9).

**On save:** the card appears in the correct group with the opening movement as
its only history entry.

#### Form — Add a goal

Reached from the Goals empty state, the Goals tab, and Onboarding step 6 (where
it arrives pre-titled "Rent").

| Field | Required | Rule | Message when wrong |
|---|:-:|---|---|
| Name | yes | 1–60 characters | "What are you saving for?" |
| Target | yes | > 0 | "How much do you need?" |
| Due date | no | a real date, **in the future** | "Pick a date that has not passed yet." |
| Funded by | yes | a category of type `Savings` | "Pick where this money is saved." |
| Already saved | no | ≥ 0 | "Amounts are numbers only." |

**If no savings category exists yet**, *Funded by* offers to create one inline
rather than sending the owner to Plan and losing everything they have typed.

**Already saved** becomes an opening `savings-in` transaction dated the day
before the current cycle — same rule, same reason, as Onboarding step 4.

**No due date means no projected gap.** The card shows progress towards the
target and carries no status badge, because there is nothing to be on track
*for*.

---

### 7.7 · Debt record — `/debts/:id/record`

**Purpose.** The written record of 2:282 — printable, shareable, plain.

**Layout.** A single page, print-first. On screen it is that page with a Print
button; there is no separate design (D11).

**Contents.** Both parties (the owner's name from Settings, the counterparty) ·
the amount and date it began · terms · full movement history in date order ·
the current balance in words and figures · witnesses if any · the date printed.

**Print.** A dedicated stylesheet. One page of A4 where possible. No app
chrome, no nav, no colour dependence — it must be legible photocopied or on a
phone screenshot.

**States.** Loading: none. Empty: a debt with no movements prints with an empty
history and the opening entry, rather than failing. Error: *"Couldn't open this
record."* Offline: normal — print works with no network. Success: the page.

**Accessibility.** The print view is a single `<article>` with real headings. It
must be readable in black and white at 100% zoom.

**Open question for the designer:** the owner's name comes from onboarding step
1, which is optional. If it is absent, does the record print with a blank or
prompt for it? *(Leaning: prompt once, then save it.)*

---

### 7.8 · Months — `/months`

**Purpose.** *Am I getting better at this?* (Story F1.)

**Layout.** One row per **completed** cycle, most recent first. The running
cycle is not listed — it is on Home.

**Row:** cycle label **by start date** — *"25 Sep – 24 Oct"*, never a bare month
name, because an early salary day makes a cycle span two calendar months (D4) ·
income · spent · saved · debt paid · ended-with figure.

**Numbers.** All from `core/cycle.summarise(cycle, snapshot)`. Nothing here is
stored; a past cycle is recomputed from its transactions, so correcting an old
entry corrects the history.

**States.** Loading: skeleton rows. Empty: *"Your first cycle is still
running. It ends on 24 October."* Error: Retry. Offline: normal. Success: the
table.

**Danger colour.** None. A bad past month is a fact, not an error.

---

### 7.9 · Settings — `/settings`

**Sections, in this order** — data safety first, because it is the thing the
owner most needs to act on.

**1 · Your data**

| Shown | Source |
|---|---|
| Storage protection: granted or not | `navigator.storage.persisted()` |
| Space used | `navigator.storage.estimate()` |
| Unexported changes | count since `settings.lastExportedAt` |
| Last export | `settings.lastExportedAt` |

Actions: `Export`, `Import`, `Install app` (hidden once installed).

**The status line is honest, and says *Checking…* until it resolves** — never a
guess (story G3).

**2 · Your cycle** — salary day, take-home, amber threshold (a slider showing
the resulting figure live: *"Amber below ₦5,200 a day"*). Changing salary day
warns: *"This affects future cycles. Past cycles keep their dates."*

**3 · Categories** — add, rename, archive, reorder, rolls-over, protection
override.

**4 · Savings destinations** — a **read-only list** in v1: Bank vault ·
Cowrywise · PiggyVest · Cash at home · Ajo.

They are a fixed set (`04-api-contract` §3), attached to a savings movement in
Quick Add, shown on the Transactions row, and subtotalled in the Transactions
filter bar. Settings lists them so the owner can see what is available without
opening Quick Add to find out.

They are **not editable in v1.** Adding one means a new entity, a management
screen and a migration, and the named five cover the brief. User-defined
destinations are in `docs/backlog.md`; until then the note field carries
anywhere else. **That limitation is stated on this screen** rather than left to
be discovered by someone hunting for a button that does not exist.

**5 · Zakat** — link to `/zakat`.

**6 · About** — version, licence (PolyForm Noncommercial, linked), and a plain
statement that data is unencrypted on this device.

**Import flow — the most dangerous action in the app.**

1. Choose file → validate → **refuse or proceed** (§`04-api-contract` §7).
2. On proceed: *"This will replace everything currently in the app. We'll save a copy of your current data first."*
3. Current data exports automatically. The owner is told where it went.
4. Import runs in one transaction. All or none.
5. *"Imported. 1,907 movements, 12 categories, 3 debts."*

**States.** Loading: storage status async. Error: import refusals are
informational, **not danger-coloured** — nothing was lost. Offline: normal —
export and import both work. Success: as above.

---

### 7.10 · Zakat — `/zakat`

**May slip past v1** (D13). If it ships, it ships correct.

**Layout.** Estimate at the top with its caveat *attached to it*, not in a
footnote. Then the workings, openly: savings counted, nisab used, hawl start,
whether receivables are included.

**Numbers.** Savings balance over the hawl · nisab (owner-entered) · 2.5% of the
zakatable amount · the hawl start date and its source.

**Three things this screen must do.**

1. **Ask for the hawl start once**, and if unknown, say what it fell back to: *"Tracking from 25 September 2026, your first record."* (D6)
2. **Ask once whether money owed to you counts**, defaulting to neither position, with a note to check with someone qualified (D3).
3. **Never read as a ruling.** The caveat is part of the figure, not decoration.

**States.** Empty — no nisab: the panel explains what is missing and where to
look it up, rather than showing ₦0. Empty — no hawl: asks. Others as standard.

**Danger colour.** Never. Zakat is an obligation, not an error.

---

## 8 · Copy

British English. Plain, calm, never preachy, and never telling the owner what to
do with their money.

### The hero

| State | Copy |
|---|---|
| Normal | **Safe to spend today** · `₦7,500.00` · "₦220,000.00 left · 20 days to 25 Oct" |
| Amber | same, plus badge **"Low"** |
| Red | **"₦2,300.00 over"** plus badge **"Overspent"** · "You've spent more than you have left for this cycle." |
| No plan | **Safe to spend today** · `₦8,666.66` · "Based on your take-home. Set a plan to make this exact." |

Every amount above is rendered by `MoneyText` per §3a — naira at full size, kobo
smaller and lighter. The word "over" carries the direction; a bare minus sign is
never shown and never spoken.

### Banners and notes

| Where | Copy |
|---|---|
| Unallocated | "₦50,000.00 unallocated — finish your plan →" *(absent at ₦0.00)* |
| Over-allocated | "₦20,000.00 over your take-home." |
| Offline | "You're offline. Mizaniya works the same — your data is on this device." |
| Owed to you | "Not counted in safe to spend until it arrives." |

### Empty states

| Screen | Copy |
|---|---|
| Home, no plan | "Nothing planned yet. Decide what each naira is for, and this screen starts working." → **Set your plan** |
| Transactions | "Nothing recorded this cycle yet. Add your first movement and everything updates." → **Add** |
| Transactions, filtered | "No movements match these filters." → **Clear filters** |
| Debts | "No debts recorded. Add money you owe or money owed to you." → **Add a debt** |
| Goals | "No goals yet. A goal is an amount you're working towards, like rent." → **Add a goal** |
| Months | "Your first cycle is still running. It ends on 24 October." |

### Failures — what happened, then what to do (L2)

| Case | Copy |
|---|---|
| Save failed | "Couldn't save that. Your entry is still here — try again." → **Try again** |
| Load failed | "Couldn't open your data. This is usually temporary." → **Try again** |
| Import, newer file | "This file was made by a newer version of Mizaniya. Update the app, then import it again. Nothing has changed." |
| Import, foreign file | "This doesn't look like a Mizaniya export. Look for a file named mizaniya-export-…json. Nothing has changed." |
| Import, malformed | "This file is damaged and can't be read. Nothing has changed. If you have an older export, try that one." |

Every refusal ends with **"Nothing has changed."** That sentence is the whole
point of [[all-or-nothing]], said to the person it protects.

### Storage

| Case | Copy |
|---|---|
| Checking | "Checking…" |
| Granted | "Protected. Your browser has been asked not to clear this app's data without telling you." |
| Refused | "Not protected. Your browser may clear this data to free up space. **Install the app** and export regularly." |
| Nudge | "47 changes since your last export." → **Export now** |
| About | "Your data is stored on this device and isn't encrypted. Anyone who can unlock this phone can open Mizaniya." |

### Zakat caveat — attached to the figure, never a footnote

> "An estimate, worked out from what you've recorded. It isn't a ruling. Check
> the nisab and your own situation with someone qualified."

### Movement labels

`Income` · `Expense` · `Move to savings` · `Take from savings` · `I borrowed` ·
`I repaid` · `I lent` · `They repaid me`

**Words this app never uses:** *budget blown, overspending habit, you should,
we recommend, congratulations, oops, uh-oh, on track to fail.* It reports. It
does not judge, and it does not advise.

---

## 9 · What the designer needs to decide

Everything else here is settled. These are genuinely open.

| # | Question | Note |
|:-:|---|---|
| 1 | The full token set — palette, type scale, spacing, radius, elevation, light **and** dark | The whole point of the design stop. §4 fixes what danger *means*; the design fixes what it looks like |
| 2 | Hero treatment — how a single number carries a whole screen at 360px without shouting, **and the naira/kobo type pairing from §3a** | The one thing that decides whether the app feels trustworthy. §3a fixes the markup and the rule; the sizes and weights are yours |
| 3 | Amber and red styling that survives §3's "colour is never alone" | Both need a text form as well |
| 4 | Icon set, or none | Five bottom-bar items need distinguishing without labels being lost |
| 5 | Whether the printed debt record prompts for the owner's name when absent | See §7.7 |
| 6 | Empty-state illustration or type-only | Type-only is faster and ages better; the designer's call |

---

## 10 · Handoff

**This is the design stop.** `docs/design/` — `tokens.md` plus screen PNGs — is
produced from this document, outside the session.

After it arrives, **SHARED RULES** implements the tokens exactly as `tokens.md`
specifies and builds the `src/ui/` primitives from them, then configures ESLint,
tsconfig and CI for every `auto` rule in `docs/standards/`. Nothing before that
invents a palette or a layout.
