# System Spec — Mizaniya v1

| Field | Value |
|---|---|
| **Date** | 2026-09-10 |
| **Phase** | 3 · System Spec |
| **Inputs** | [01-requirements-summary.md](01-requirements-summary.md) (D1–D14) · [02-architecture.md](02-architecture.md) (ADR-001–007) · [seed-data.md](seed-data.md) |
| **Status** | Drafted. One new decision, **D15**, settles the amber threshold. |

Every figure in this document comes from [docs/seed-data.md](seed-data.md) and is
invented (repo rule 2). Money is always `{ amount, type }` with a **positive**
amount in **kobo**; direction comes from the type, never from a minus sign
(**H1**, **H5**).

---

## 1 · Product overview

Mizaniya is a budgeting app for one salaried person, and it runs on **salary
cycles rather than calendar months** — the period from one payday to the next,
because that is the period your money actually has to survive. At the start of a
cycle you decide what every naira is for. Then you record what you actually
spend, save, borrow, lend and repay. From those records alone it works out the
one number you open it for: **how much you can safely spend today**.

It also holds the two things a bank app cannot. **Debts in both directions** —
money you owe and money owed to you — each with a written record, dates and
optional witnesses. And a **sinking fund for rent**, which arrives once a year as
a lump sum, that answers early rather than late whether you will have the money
by the day it is due. Everything lives on your own device, works with no
network, and is never sent anywhere.

---

## 2 · Goals

| # | Goal | How we would know |
|:-:|---|---|
| G1 | The owner can answer *"can I spend this?"* in under five seconds, without arithmetic | Safe-to-spend is the largest element on Home and needs no interaction to read |
| G2 | Recording a movement is fast enough to do at the point of spending | Quick Add reaches saved in **three taps** from Home |
| G3 | The rent shortfall is discovered months early, not in February | The projected gap is on Home and on Debts & Goals from the first cycle |
| G4 | Every figure on screen can be traced to the records that produced it | Nothing derived is stored; export → import into a clean browser → identical state |
| G5 | The owner's data survives ordinary phone use | Persistence requested, status shown honestly, export nudged by unexported changes |

## 3 · Non-goals

| Not doing | Why |
|---|---|
| **Advising.** No "you should move ₦X", no suggested budgets | The app reports; the owner decides. A wrong suggestion about someone's money is worse than no suggestion (assumption A1). Restating a target as a rate — *"needs ₦85,000 a payday"* — is arithmetic, not advice, and is allowed |
| **Bank connections, accounts, sync, sharing** | v3, and they need a server and a private repo. Manual entry is the whole trust model in v1 |
| **Multi-currency** | ₦ only. Rate handling is a v3 problem and the addendum defers it |
| **Notifications or reminders** | No server to send them and no background process to schedule them. The export nudge is in-app only |
| **Zakat rulings** | The panel estimates and says so. It is not a fatwa and must never read as one |
| **Analytics of any kind** | Nothing leaves the device (**M2**) |

---

## 4 · Roles and permissions

| Role | Description | Can see and do | Cannot |
|---|---|---|---|
| **Owner** | The one person using the app on their own device | Everything: onboard, plan, record, edit, delete, export, import, change settings | Nothing is withheld — there is no second party, no server and no privileged action |

There is **no authentication**, because there is no account and no remote data.
Anyone holding the unlocked device can open the app; that is stated plainly in
the README rather than papered over with a lock that protects nothing
(**D12**). Standard **A6** (session scope on every request) stays dormant until
household sharing in v3.

---

## 5 · D15 · The amber threshold

The last open question from UNDERSTAND.

**Decision: amber when safe-to-spend per day falls below a proportion of the
planned daily allowance. Default 60%, editable in Settings.**

```
plannedDailyAllowance = (total planned across spendable categories) ÷ (days in cycle)
amber   when  safeToSpendPerDay < amberRatio × plannedDailyAllowance     (default 0.6)
red     when  safeToSpendPerDay < 0
```

On the seeded cycle: spendable plan ₦260,000.00 over 30 days = **₦8,666.66** a day (floored);
amber below **₦5,200**. On the worked day the figure is ₦7,500 — green. In the
amber variant it is ₦5,000 — amber.

*Why a proportion:* it stays meaningful after a pay rise or a changed plan,
where a fixed naira figure quietly becomes wrong and nobody re-tunes it.

*Rejected:* a fixed naira threshold (needs manual re-tuning, and the day it
stops being right nothing says so); and "days of cover", which is close to what
the figure already means and would make the state nearly redundant.

**Edge cases, because this is a money figure:**

| Case | Rule |
|---|---|
| No plan yet — `plannedDailyAllowance` is 0 | No amber state. Show the figure and the *finish your plan* banner. Never divide by zero |
| Today is the last day of the cycle | `daysLeft` counts today, so its minimum is **1**, never 0 |
| Safe-to-spend is exactly 0 | Green boundary is `<`, so 0 is amber, not red. Red means **negative** — you have already overspent |
| Cycle has no spendable categories at all | Same as no plan: no amber state |

---

## 5a · D16 · Cash left is per cycle

**Cash left is this cycle's income minus this cycle's movements**, never a
running bank balance. A leftover does not raise the next cycle's safe-to-spend;
it appears on the next Plan as **unallocated**, labelled *"carried from last
cycle"*, and counts towards the amount to allocate.

*Rejected:* a running balance — last cycle's leftover would quietly raise what
the hero says is safe, and the owner would spend it without deciding to.
*Also rejected:* dropping it — the money is real, and an invisible leftover is
the failure mode this project is built against.

Full reasoning and the Plan line: page specs §7.3.

---

## 6 · User stories and priorities

MoSCoW. **Must** = v1 cannot ship without it.

### A · Onboarding

| # | Story | Priority |
|:-:|---|:-:|
| A1 | As the owner, I want to enter my salary day and take-home pay so the app knows when my cycles start and how much to plan | **Must** |
| A2 | As the owner, I want to start from a sensible list of categories so I am not staring at an empty screen | **Must** |
| A3 | As the owner, I want to record what I already have saved and already owe, so the figures are right from day one | **Must** |
| A4 | As the owner, I want to set my rent target and its due date so the projected gap works from the first cycle | **Must** |
| A5 | As the owner, I want to skip optional steps and add them later so I can start using it in two minutes | Should |
| A6 | As the owner, I want to load the seeded demo data so I can see what a filled-in app looks like | Could |

### B · Home

| # | Story | Priority |
|:-:|---|:-:|
| B1 | As the owner, I want one clear figure telling me what I can safely spend today | **Must** |
| B2 | As the owner, I want to see cash left, income, saved and debt paid against plan at a glance | **Must** |
| B3 | As the owner, I want to be told when my plan is unfinished, and not nagged when it is done | **Must** |
| B4 | As the owner, I want to see each category's variance so I know where I am overspending | **Must** |
| B5 | As the owner, I want to see whether rent and each debt are on track by their dates | **Must** |
| B6 | As the owner, I want to tap any figure to see the records behind it | Should |
| B7 | As the owner, I want the Hijri date beside the Gregorian one | Could |

### C · Plan

| # | Story | Priority |
|:-:|---|:-:|
| C1 | As the owner, I want to set a planned amount per category for the cycle | **Must** |
| C2 | As the owner, I want to see unallocated income so I can give every naira a job | **Must** |
| C3 | As the owner, I want to copy last cycle's plan so I am not retyping twelve numbers monthly | **Must** |
| C4 | As the owner, I want to mark a category as rolling over so unspent money stays available | **Must** |
| C5 | As the owner, I want to see the amount carried in from last cycle as its own line | **Must** |
| C6 | As the owner, I want to override whether a category is protected from safe-to-spend | Should |
| C7 | As the owner, I want to add, rename and archive categories | Should |

### D · Transactions and Quick Add

| # | Story | Priority |
|:-:|---|:-:|
| D1 | As the owner, I want to record a spend in three taps while standing at a counter | **Must** |
| D2 | As the owner, I want to record all eight movement types | **Must** |
| D3 | As the owner, I want to edit or delete a transaction I got wrong | **Must** |
| D4 | As the owner, I want to record a movement dated earlier, because I forgot | **Must** |
| D5 | As the owner, I want to see this cycle's transactions, newest first | **Must** |
| D6 | As the owner, I want to filter by category, type and date range | Should |
| D7 | As the owner, I want to say where a savings transfer went — bank vault, Cowrywise, PiggyVest, cash at home | Should |
| D8 | As the owner, I want to attach a note and a payment method | Should |

### E · Debts and Goals

| # | Story | Priority |
|:-:|---|:-:|
| E1 | As the owner, I want to record money I owe and money owed to me, in one place | **Must** |
| E2 | As the owner, I want each debt's payment history and current balance | **Must** |
| E3 | As the owner, I want a goal to show whether it will be met by its due date at the current rate | **Must** |
| E4 | As the owner, I want a debt balance to cross zero for an ajo group, without splitting it in two | **Must** |
| E5 | As the owner, I want a one-page written record of a debt that I can print or share | Should |
| E6 | As the owner, I want to add witnesses to that record | Should |
| E7 | As the owner, I want to see the rate that *would* close a gap | Should |

### F · Months

| # | Story | Priority |
|:-:|---|:-:|
| F1 | As the owner, I want one row per past cycle so I can see whether I am improving | Should |
| F2 | As the owner, I want to open a past cycle and see it as it was | Should |

### G · Settings and data

| # | Story | Priority |
|:-:|---|:-:|
| G1 | As the owner, I want to export everything to a file I keep | **Must** |
| G2 | As the owner, I want to import that file into a clean browser and get my app back | **Must** |
| G3 | As the owner, I want to be told plainly whether my data is protected from being cleared | **Must** |
| G4 | As the owner, I want to be nudged to export when I have unexported changes | **Must** |
| G5 | As the owner, I want to install the app to my home screen | **Must** |
| G6 | As the owner, I want to change my salary day, take-home and amber threshold | Should |

### H · Zakat

| # | Story | Priority |
|:-:|---|:-:|
| H1 | As the owner, I want an estimate of zakat due on my savings, clearly marked as an estimate | Should |
| H2 | As the owner, I want to set the nisab myself, with a note on where to check it | Should |
| H3 | As the owner, I want to say when my lunar year started rather than have it guessed | Should |
| H4 | As the owner, I want to choose whether money owed to me counts | Should |

### Won't have — this phase

Bank sync · household sharing · multi-currency · zakat PDF · ajo group
management · CSV export · notifications · any server, account or login ·
telemetry · **any interest-bearing suggestion, ever**.

---

## 7 · Screen states

Rather than repeat five states on forty stories, each screen declares them once.
Every story in that area inherits them, and **L1** is satisfied per surface.

| Screen | Loading | Empty | Error | Offline | Success |
|---|---|---|---|---|---|
| **Onboarding** | none — nothing to load | is the empty state | Field-level validation; a failed save keeps every entered value and offers retry | Normal. A line explains data stays on this device | Lands on Home with figures already correct |
| **Home** | Skeletons on hero and tiles, ~1 frame from IndexedDB | No cycle yet → *"Set your plan"* with one action. Cycle but no transactions → tiles read ₦0 and the hero shows the full planned allowance | Load failure shows what failed and a Retry; never a blank screen | Normal condition. A dismissible line says data is local and unbacked-up | Hero, four tiles, category table, goals table |
| **Plan** | Skeleton rows | No categories → seeded list offered. No plan → all rows ₦0, unallocated = full take-home | Per-row save failure keeps the typed figure and marks the row | Normal | Unallocated reaches ₦0 and the banner disappears |
| **Transactions** | Skeleton rows | *"Nothing recorded this cycle"* + Quick Add | A failed save keeps the sheet open with values intact | Normal | New row appears at the top; every derived figure updates |
| **Quick Add** | none | n/a | Inline validation; save failure keeps the sheet open | Normal | Sheet closes, toast confirms, Home updates behind it |
| **Debts & Goals** | Skeleton cards | *"No debts or goals yet"* + add | Load or save failure per card | Normal | Balances, projected gaps and status badges |
| **Debt record** | none | n/a | If a debt has no payments, the record prints with an empty history rather than failing | Normal | Printable one page |
| **Months** | Skeleton rows | *"Your first cycle is still running"* | Load failure | Normal | One row per completed cycle |
| **Settings** | Storage status resolves asynchronously; show *Checking…*, never a guess | n/a | Import failure names the reason and changes **nothing** | Normal | Status, export, import, preferences |
| **Zakat** | Skeleton | No hawl date → asks once | Missing nisab → panel explains rather than showing ₦0 | Normal | Estimate with its caveat |

---

## 8 · Acceptance criteria

Given / When / Then. All **Must** stories; **Should** stories abbreviated.

### A1 · Salary day and take-home

- **Given** a first run, **when** the owner enters salary day 25 and take-home ₦450,000, **then** the current cycle is 25 September – 24 October and Home shows 30 days.
- **Given** salary day 31, **when** February arrives, **then** the cycle boundary is 28 February (29 in a leap year) — clamped, never rolled into March (**D4**).
- **Given** an entered take-home of `0` or a non-numeric value, **when** the owner continues, **then** the field is rejected with a message saying what is wrong and what to do next (**L2**); nothing is saved.
- **Given** the owner enters ₦450,000, **when** it is stored, **then** it is stored as `45000000` kobo — the display value is never persisted (**H1**).

### A2 · Seeded categories

- **Given** a first run, **when** onboarding completes, **then** the seeded list exists with correct types, and rent fund, debt payments, emergency fund and personal savings are **protected** because they are not `Expense` (**D1**).
- **Given** the seeded list, **when** the owner renames or removes one before finishing, **then** the change persists.

### A3 · Opening balances

- **Given** a rent fund with ₦400,000 already saved, **when** the owner enters it, **then** a dated **opening transaction** is created — no goal has an editable "saved so far" field.
- **Given** a debt to A. Friend of ₦120,000, **when** it is entered, **then** the balance is ₦120,000 and the history shows the opening entry and nothing else.

### B1 · Safe to spend

- **Given** the seeded worked day (5 October), **when** Home opens, **then** the hero reads **₦7,500** with *"₦220,000 left · 20 days to 25 October"* beneath it, in green.
- **Given** the amber variant, **then** the hero reads **₦5,000** in amber — below the ₦5,200 threshold (**D15**).
- **Given** spending that exceeds cash left, **then** the figure is negative and red.
- **Given** no plan, **then** the figure shows with **no** amber or red state and the *finish your plan* banner is visible.
- **Given** it is the last day of the cycle, **then** `daysLeft` is 1 and the app never divides by zero.
- **Given** ₦75,000 already moved to the rent fund, **when** protection is calculated, **then** rent contributes **₦0**, not ₦75,000 — protection counts *planned minus actual*, so money already moved is not subtracted twice (**D1**).

### B2 · The four tiles

- **Given** the worked day, **then** Cash left ₦220,000 · Income ₦450,000 of ₦450,000 · Saved ₦90,000 of ₦160,000 · Debt paid ₦30,000 of ₦30,000, each with a bar against plan.
- **Given** any tile, **when** tapped, **then** it opens the records behind it — no tile is a dead end.

### B3 · Unallocated banner

- **Given** a plan totalling ₦400,000 against ₦450,000, **then** the banner reads *"₦50,000 unallocated — finish your plan"*.
- **Given** a plan totalling exactly ₦450,000, **then** the banner is **absent** — not showing ₦0 (**D8**).
- **Given** a plan exceeding take-home, **then** the banner says how much **over** and is styled as danger, because that is money going wrong (addendum, **F7**).

### B5 / E3 · Projected gap

- **Given** the rent goal at the worked day — ₦475,000 saved, ₦900,000 due 1 March, ₦75,000 a cycle — **when** the gap is calculated, **then** paydays on or before 1 March number **5**, projected is **₦850,000**, and the card reads **₦50,000 short** (**D5**).
- **Given** the same goal, **then** the card also states the rate that reaches the target — **₦85,000 a payday** — as a fact, not a recommendation.
- **Given** a goal whose projection meets its target, **then** the badge reads *On track*.
- **Given** a due date that has passed, **then** the badge reads *Overdue* and the projection stops.
- **Given** a goal with no due date, such as the emergency fund, **then** no gap is shown — only progress against the target.

### C1–C2 · Plan and unallocated

- **Given** the Plan screen, **when** a planned amount is set, **then** unallocated recalculates immediately and is never stored (**B3**).
- **Given** a save that fails, **then** the typed figure stays on screen, the row is marked, and unallocated does **not** move — memory is only updated after storage confirms (ADR-001).

### C3 · Copy last cycle

- **Given** a previous cycle with a plan, **when** the owner copies it, **then** every planned amount is carried across and the rollover marks come with them.
- **Given** no previous cycle, **then** the action is unavailable with a reason — not silently inert.

### C4–C5 · Rollover

- **Given** food planned ₦90,000 with ₦78,000 spent and rollover on, **when** the next cycle begins, **then** the food allowance is planned + **₦12,000** carried, shown as its own line.
- **Given** that carry, **then** **cash left is unchanged by it** — the ₦12,000 was never spent and is already counted. Nothing is added twice (**D2**).
- **Given** rollover off, **then** the unspent amount does not carry and no line appears.

### D1 · Quick Add in three taps

- **Given** Home, **when** the owner taps Quick Add, taps a category and enters an amount, **then** the movement saves — **three taps** plus the amount, with type defaulting to `expense` and date to today.
- **Given** a save, **then** the sheet closes, a toast confirms, and Home's figures behind it are already correct.

### D2 · Eight types

- **Given** the type list, **then** it reads: **Income · Expense · Move to savings · Take from savings · I borrowed · I repaid · I lent · They repaid me** — plain speech, not jargon (**D7**, **O4**).
- **Given** any movement, **then** the amount stored is **positive** and direction comes from the type (**H5**). A negative amount is rejected by schema validation.
- **Given** *I repaid* against A. Friend at ₦30,000, **then** the balance falls from ₦120,000 to ₦90,000 and Debt paid rises by ₦30,000.

### D3–D4 · Edit, delete, backdate

- **Given** a transaction edited from ₦3,500 to ₦5,300, **then** every derived figure recalculates — because none of them was stored (**B3**).
- **Given** a deletion, **then** confirmation is required and the same recalculation follows.
- **Given** a movement dated in a **previous** cycle, **then** it is attributed to that cycle, that cycle's figures change, and the current cycle's do not.
- **Given** income dated up to **3 days before** a cycle starts, **then** it is attributed to the cycle it precedes (**D4**).

### E1–E2 · Debts both ways

- **Given** debts to A. Friend and Spouse and money owed by B. Colleague, **then** all three appear, grouped by direction, with ₦90,000, ₦60,000 and ₦40,000.
- **Given** B. Colleague's ₦40,000, **then** it counts toward **nothing** — not safe-to-spend, not any projected gap (**D3**).

### E4 · An ajo balance crossing zero

- **Given** an ajo counterparty with ₦60,000 lent across two months, **when** the payout arrives, **then** it records as *They repaid me* ₦60,000 clearing the receivable plus *I borrowed* for the remainder, and the single record continues with a balance now owed **by** the owner (**D9**).
- **Given** that record, **then** it is **one** record throughout — the app never splits it in two at the crossing.

### G1–G2 · Export and import

- **Given** an export, **then** the file carries a `schemaVersion` and every entity, and `lastExportedAt` is recorded.
- **Given** that file imported into a clean browser, **then** every screen shows figures identical to the source — the core journey's final step (**K1**).
- **Given** a file from a **newer** version, **then** the import is refused with a plain explanation and **nothing** is changed.
- **Given** a file from an older version, **then** migrations run in order and the result loads.
- **Given** a corrupt file, **then** the import fails atomically — no half-loaded state (**ADR-005**).
- **Given** an import over existing data, **then** the current data is exported to a file **first**, and the owner is told that happened.

### G3–G4 · Storage honesty

- **Given** Settings, **then** it states whether persistence was granted, in plain words — and while the answer is pending it says *Checking…*, never a guess.
- **Given** persistence **refused**, **then** the warning is more prominent and the export nudge more insistent.
- **Given** 47 transactions since the last export, **then** the nudge names that number. It is never a timer (**D12**).

### G5 · Install

- **Given** a supported browser, **then** the app is installable, and Settings explains that installing makes the data far less likely to be cleared.
- **Given** iOS, **then** the wording does not promise safety it cannot deliver (**D14**).

### Should stories, in brief

**B6** every tile and table row opens its records · **B7** Hijri date from
`Intl`, no library · **C6** a per-category protection override, default off ·
**C7** categories archive rather than delete, so history survives · **D6**
filters combine and are reflected in the URL · **D7** savings destination
optional, from a fixed list · **D8** note and payment method optional · **E5**
the record prints on one page with parties, amounts, dates, terms and history ·
**E6** witnesses are an optional list of names (**D10**) · **E7** the closing
rate is stated as arithmetic, not advice · **F1–F2** one row per completed
cycle, opening a past cycle as it was · **G6** changing salary day affects
**future** cycles only and says so · **H1–H4** the zakat panel estimates, asks
for the hawl date once, takes an editable nisab, and asks once whether
receivables count (**D3**, **D6**).

---

## 9 · Data requirements by feature

Source is the same everywhere — the in-memory snapshot, hydrated once from
IndexedDB through the `Repository` (ADR-001). Freshness is therefore always
*live from the last write*; there is nothing to poll and no cache to go stale.

| Feature | Entities read | Derived by `core/` | Fallback |
|---|---|---|---|
| Onboarding | settings, categories | cycle boundaries from salary day | Fields are the empty state; nothing to load |
| Home | settings, categories, plans, transactions, debts, goals | safe-to-spend, cash left, income/saved/paid vs plan, unallocated, per-category variance, projected gaps | Skeleton, then figures. Load failure shows a reason and Retry |
| Plan | categories, plans, transactions | unallocated, carried-in amounts, protected totals | Zeroes with the *finish your plan* banner |
| Transactions | transactions, categories | cycle attribution, per-category totals | Empty-state copy plus Quick Add |
| Quick Add | categories | none at entry; everything downstream recalculates | Inline validation only |
| Debts & Goals | debts, goals, transactions | balances (including crossing zero), projected gap, paydays remaining, status | Per-card empty and error states |
| Debt record | one debt, its transactions, settings | balance, ordered history | Prints with an empty history rather than failing |
| Months | settings, plans, transactions | one summary per completed cycle | *"Your first cycle is still running"* |
| Settings | settings; browser storage APIs | unexported-change count | Storage status is async — *Checking…* until resolved |
| Zakat | settings, transactions, debts | savings balance over the hawl, nisab comparison, 2.5% estimate | Asks for the hawl date; explains a missing nisab rather than showing ₦0 |

**One rule across all of it:** every figure in the *Derived* column is computed on
read and stored nowhere (**B3**).

---

## 10 · Non-functional requirements

**Performance.** First contentful paint under 1.5s on a mid-range Android over
3G, from a precached shell. Interaction to next paint under 200ms — the snapshot
is in memory, so no screen waits on storage. Quick Add saved in under 100ms.
Bundle under 250KB gzipped excluding fonts; every dependency justified in its PR
(**N1**).

**Browsers.** Last two versions of Chrome, Edge and Firefox on desktop and
Android; **Safari on iOS 16.4+**. iOS is the primary device and the strict case,
because every iOS browser is WebKit (**D14**). Needs IndexedDB, ES2022, and
`Intl` with the Islamic calendar — no polyfills.

**Responsiveness.** Mobile-first at **360px**; correct at **1440px**. Tiles 2×2
on mobile, one row on desktop. Tables scroll inside their own container; the page
body never scrolls sideways.

**Accessibility — WCAG 2.1 AA, mandatory.** 44px touch targets (**J1**), a label
on every interactive element (**J2**), `prefers-reduced-motion` honoured
(**J3**), AA contrast in **both** themes verified by a token-level test
(**J4**), and keyboard-only operation end to end, proven by a Playwright test
(**J5**). Colour is never the only signal — amber and red always carry text.

**Security and privacy.** No network calls at all, so nothing can leak in
transit. No secrets, no keys, no `.env` in v1. No encryption at rest, documented
plainly rather than implied (**D12**). No telemetry (**M2**). No real figures in
the repository (**M1**).

**Offline.** The normal condition, not an error (**L4**). Everything works with
the network off, including install and export.

**Durability.** Persistence requested after the first meaningful write; true
status shown; nudge driven by unexported changes; installable. **None of this is
a guarantee** — until v3 sync exists, an exported file the owner has actually
saved is the only real backup, and the README says so.

**Testing.** Vitest over every `core/` module with a **coverage gate on money**
(**H4**); React Testing Library on Quick Add; Playwright for the **K1** core
journey. A bug fix ships with the test that would have caught it (**K4**).

**Language.** British English throughout, copy and docs.

---

## 11 · Success metrics

Honest ones. There is no telemetry and one user, so nothing here is measured by
instrumentation — these are checks the owner makes.

| | Metric | Target |
|---|---|---|
| **Leading** | Days in the first month the app is opened | 20 of 30 |
| | Quick Add taps to saved | exactly 3 |
| | Cycles ending with unallocated at ₦0 | every one after the first |
| **Lagging** | Rent target met on 1 March | yes / no — the single clearest verdict on the product |
| | Cycles ending without borrowing to reach payday | rising |
| | Export performed at least once per cycle | every cycle |

**For the portfolio**, which is the other reason this exists: a complete core
journey working end to end, screenshots in the README, and a commit history that
shows the decisions being made. A small finished app beats a large unfinished
one.

---

## 12 · Open questions

| Question | Who | Blocking? |
|---|---|---|
| Exact copy for the offline and storage-status lines — they must inform without alarming | Stakeholder, at PAGE SPECS with `design:ux-copy` | No |
| Should archiving a category hide it from past cycles, or only from new plans? Leaning: only from new plans, so history stays truthful | Stakeholder | No — needed before C7 is built |
| Does the debt record need the owner's own name on it, and where does that come from — onboarding? | Stakeholder | No — needed before E5 |

---

## 13 · Timeline

No fixed date; *as soon as realistic*. Order follows the kick-off pack: `core/`
with its tests first, then Onboarding, Home, Quick Add, Plan, Transactions,
Debts & Goals, Months, Settings, export/import, seed script.

If time runs short, **Months ships and Zakat waits** (**D13**) — and screenshots
are taken as soon as the design lands, not at the end.
