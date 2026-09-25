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
| ~~**Bank connections, accounts, sync, sharing**~~ | **Superseded 2026-09-25 by [ADR-009](adr/ADR-009-repositioning-v1-hosted-webapp.md).** These are v1 now, behind a paid tier; see §11a. Manual entry remains the whole trust model on the **free** tier, and it is never the thing that gets taken away |
| **Multi-currency** | ₦ only. Still deferred — a rate feed is a running cost and a new class of wrongness, and nothing in the product asks for it yet |
| **Notifications or reminders** | Still not doing them. A server now exists, which removes the excuse but not the reason: an app that messages you about your money unprompted has to be right every time, and the export nudge in-app is enough |
| **Zakat rulings** | The panel estimates and says so. It is not a fatwa and must never read as one |
| **Analytics of content** | Counts and timings only, never figures or categories. Rule 7 forbids financial values reaching any monitoring tool, and the free tier still sends nothing at all |
| **Advice dressed as a feature on the paid tier** | Paying does not buy suggestions. The paid tier buys *reach* — sync, sharing, bank movement — never opinions about someone's money |

---

## 4 · Roles and permissions

| Role | Description | Can see and do | Cannot |
|---|---|---|---|
| **Owner, no account** | Someone using the free tier on one device. **The default, and a complete product** | Everything the app does locally: onboard, plan, record, edit, delete, export, import, settings | Sync to another device, share a budget, read bank movement |
| **Account holder** | An owner who signed up. Free to create; needed before anything can be paid for | As above, plus their own data on the server, and a second device | See anyone else's data. There is no cross-account read, ever |
| **Household member** *(designed v1, built later)* | A second person invited into one budget | Read and write the shared budget, and settle a disagreement about a planned amount | Change the account's billing, or remove the account holder |
| **Support / admin** *(v1.1)* | Us, in `apps/admin` | Account state: exists, tier, last sync, storage used | **Read anyone's financial records.** Rule 7, and ADR-011 §audit — every access is logged and users are told it is |

**Authentication now exists, and it is an upgrade rather than a gate.** The free
tier has no account, no login screen and no locked door: someone who never signs
up gets the whole budgeting app, exactly as before. Signing in is what makes data
follow you to a second device.

That has a consequence worth stating for the design brief: **there is no
"signed-out state" to draw for the main screens.** Signed out is not a degraded
app, it is the app. The only new signed-out surface is the handful of screens
about the account itself.

**Standard §A6 wakes up** — every request to `services/api` carries its session
scope, and **§C5** applies the moment a household has two people in it. On the
device, the old statement still holds and is still in the README: anyone holding
the unlocked phone can open the app (**D12**). A passcode on top of the device's
own lock protects nothing and implies a promise we would not be keeping.

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
| A6 | As **anyone**, I want to see a filled-in app in one click without signing up, so I can tell whether this is for me | **Must** — promoted from *Could* 2026-09-25. It is the landing page's primary call to action, and the seed already restores through the ordinary import path |

### B · Home

| # | Story | Priority |
|:-:|---|:-:|
| B1 | As the owner, I want one clear figure telling me what I can safely spend today | **Must** |
| B2 | As the owner, I want to see cash left, income, saved and debt paid against plan at a glance | **Must** |
| B3 | As the owner, I want to be told when my plan is unfinished, and not nagged when it is done | **Must** |
| B4 | As the owner, I want to see each category's what is left so I know where I am overspending | **Must** |
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

### I · Account and sign-in *(new — ADR-009)*

An account is **never required to use the app**. It is what makes data follow you.

| # | Story | Priority |
|:-:|---|:-:|
| I1 | As someone using the app happily on one device, I want to keep using it without an account, so signing up is a choice and not a toll gate | **Must** |
| I2 | As an owner with a second device, I want to create an account with my email and a password, so my budget can follow me | **Must** |
| I3 | As an account holder, I want to sign in on another device and find my budget already there, rather than starting again | **Must** |
| I4 | As someone who forgot their password, I want to reset it by email and not lose a year of records | **Must** |
| I5 | As an account holder, I want to sign out, and to be told plainly what happens to the data on this device when I do | **Must** |
| I6 | As an account holder, I want to delete my account and have it mean deleted, with a stated grace period first | **Must** |
| I7 | As an account holder, I want to see which devices are signed in, and sign one out remotely if I lost it | Should |
| I8 | As someone signing up, I want to be told what you can and cannot see of my data before I hand any over | **Must** |

### J · Sync *(new — ADR-010)*

| # | Story | Priority |
|:-:|---|:-:|
| J1 | As an account holder, I want changes on one device to appear on the other, without doing anything | **Must** |
| J2 | As someone with no signal, I want to keep recording spending and have it sync later, because that is when I actually record it | **Must** |
| J3 | As an account holder, I want to see whether I am up to date, so I know whether to trust the figure in front of me | **Must** |
| J4 | As an account holder who deleted a category on my phone, I want it gone from my laptop too, and to stay gone | **Must** |
| J5 | As an account holder, I want a restored backup not to overwrite newer data I had already synced | **Must** |
| J6 | As an account holder, I want to know when a sync last failed and why, rather than quietly being out of date | Should |

### K · Tiers and billing *(new — ADR-009)*

| # | Story | Priority |
|:-:|---|:-:|
| K1 | As a free user, I want to see what paying would add, without being nagged in the middle of budgeting | **Must** |
| K2 | As a free user, I want a locked feature to say what it is and what it costs — never a dead button | **Must** |
| K3 | As someone convinced, I want to subscribe and have the feature work immediately | **Must** |
| K4 | As a subscriber, I want to cancel without contacting anyone, and keep my data | **Must** |
| K5 | As a lapsed subscriber, I want my budget intact and still usable on this device — only the reach stops | **Must** |
| K6 | As a subscriber, I want a receipt and to see when I am next billed | Should |

**K5 is the one that matters.** Lapsing must never make someone's records
unreadable or their history disappear. What stops is sync, sharing and bank
movement. The app they had before paying is the app they have after.

### L · Household sharing *(designed this phase, built after launch)*

| # | Story | Priority |
|:-:|---|:-:|
| L1 | As an account holder, I want to invite my spouse into one budget, so we stop keeping two versions of the same plan | Should |
| L2 | As an invited person, I want to accept and see the shared budget, without creating a second copy of it | Should |
| L3 | As either of us, I want to be asked when we have set the same category to different amounts, rather than one of us silently losing | Should |
| L4 | As either of us, I want to see who recorded a movement | Should |
| L5 | As the account holder, I want to remove someone, and for them to keep nothing | Should |

### M · Bank movement *(designed this phase, built as v1.1)*

| # | Story | Priority |
|:-:|---|:-:|
| M1 | As a subscriber, I want to link my bank so movements appear without typing them | Should |
| M2 | As a subscriber, I want to be asked which envelope a detected movement belongs to, because only I know | Should |
| M3 | As a subscriber, I want to be certain the app can only read, never move money — and to see that said plainly before I link | Should |
| M4 | As a subscriber, I want to unlink at any time and have the access destroyed, not just hidden | Should |
| M5 | As a subscriber, I want a detected movement I have already typed in myself to be matched, not duplicated | Should |

**M2 is the product's centre and is drawn nowhere yet.** *"₦12,000 left your
account — which envelope?"* is the interaction the paid tier is actually selling.
**M5 is the one that will be underestimated:** manual entry does not stop when
bank sync starts, so the same expense arrives twice and something has to notice.

---

### Won't have — this phase

**Amended 2026-09-25.** Accounts, sync and a server moved *into* this phase
(ADR-009). What is still out:

Multi-currency · zakat PDF · ajo group management · CSV export · notifications ·
content analytics · **any interest-bearing suggestion, ever**.

**Designed in this phase, built after launch:** household sharing (§L) and bank
movement (§M). Drawn now so the design set is cut once; not built now so launch
does not wait on an aggregator contract or on conflict-resolution work that a
single person on two devices never touches.

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

### I1–I2 · An account is an upgrade, not a gate

- **Given** a first run, **when** onboarding completes, **then** the owner reaches Home with **no account, no sign-up prompt and no locked feature in their path** — the free tier is the whole budgeting app.
- **Given** a free user on Home, **when** they use the app for a month, **then** they are asked to sign up **at most** where a paid feature is actually being reached for (**K1**) — never on Home, never mid-entry, never as a modal on open.
- **Given** an email already registered, **when** someone signs up with it, **then** the message does not reveal whether that email has an account (it says a link has been sent); an enumeration oracle on a money app is a real harm.
- **Given** a password below the minimum, **when** they submit, **then** it is refused with what is wrong and what to do (**L2**), and the requirement is stated **before** they type rather than after.
- **Given** sign-up succeeds, **when** the account is created, **then** the local data already on the device is what gets uploaded — signing up **never** starts them empty (**J5**).

### I3 · A second device finds the budget

- **Given** an account holder with data synced, **when** they sign in on a second device, **then** the budget arrives and they reach Home without onboarding.
- **Given** a second device that already had its own local budget, **when** they sign in, **then** they are **asked** which to keep, and nothing is merged silently — merging two budgets has no correct answer (see `import-and-export.md`).

### I4 · Password reset does not cost the records

- **Given** a forgotten password, **when** they reset by email, **then** they sign in and **all data is intact**.
- **Given** a reset link, **when** it is used twice or after expiry, **then** it is refused.
- **Note, and it is load-bearing:** this works because ADR-011 deferred end-to-end encryption. **If end-to-end is ever turned on, this criterion cannot hold** — the password becomes the key and no reset can recover the data. That is the recovery question ADR-011 parked, and it must be answered before that feature, not after.

### I5 · Signing out says what it does

- **Given** an account holder signing out, **when** they confirm, **then** they are told plainly whether the data stays on this device or is removed, and the wording matches what actually happens.
- **Given** they sign out, **when** unsynced changes exist, **then** they are warned before, not after.

### I6 · Deletion means deleted

- **Given** an account holder deleting their account, **when** they confirm, **then** the account is deactivated and the data retained for **30 days**, stated in the confirmation, then destroyed.
- **Given** the grace period has passed, **when** they try to return, **then** the data is genuinely gone — and a sync tombstone is **not** a deletion (rule 7).
- **Given** deletion, **when** it completes, **then** any bank access token is destroyed rather than orphaned.

### I8 · Say what you can see, before they hand it over

- **Given** the sign-up screen, **when** it is shown, **then** it states what is encrypted, that keys are held separately from the database, and that every access to production data is logged.
- **Given** bank linking, **when** it is offered, **then** it says the movement passes through the server before being encrypted — it must **not** claim the data never touches our servers, because it does (ADR-011).

### J1–J3 · Sync, and knowing whether to trust the number

- **Given** two signed-in devices, **when** a movement is recorded on one, **then** it appears on the other without user action.
- **Given** no network, **when** a movement is recorded, **then** it saves locally and the screen updates — **offline writes are never blocked** (ADR-010, and it is the selling point).
- **Given** unsynced changes, **when** the owner looks at Home, **then the sync state is visible**, because a figure the app cannot vouch for must not be presented as if it can.
- **Given** one owner editing the same planned amount on two devices, **when** both sync, **then** the later edit wins and **no prompt is shown** — being asked to arbitrate with yourself is noise.

### J4 · A delete stays deleted

- **Given** a category deleted on device A, **when** device B syncs, **then** it is removed there too and **does not reappear** — the tombstone is what makes this possible.
- **Given** a device offline longer than the tombstone retention period, **when** it syncs, **then** the behaviour is whatever the endpoint spec decides — **this is an open question, not an assumption** (ADR-010).

### J5 · A restore must not beat newer data

- **Given** a restored backup, **when** it syncs, **then** the file's own timestamps are used and rows that are genuinely newer on the server are **not** overwritten. Re-stamping on import would make a restore look like the newest edit in the account.

### K1–K2 · A lock explains itself

- **Given** a free user reaching a paid feature, **when** they reach it, **then** it says what the feature does and what it costs. **A disabled control with no explanation is a bug** (**L2**).
- **Given** a free user, **when** they are anywhere in the core journey (**K1** in the addendum), **then** no upsell interrupts them.

### K3–K5 · Paying, and stopping

- **Given** a completed subscription, **when** payment confirms, **then** the feature is available without a restart or a re-sign-in.
- **Given** entitlement, **when** it is checked, **then** it is **decided by the server**, never by the client (ADR-008: hiding payment code protects nothing; the server deciding is what protects it).
- **Given** a cancelled or lapsed subscription, **when** the period ends, **then** sync, sharing and bank movement stop — **and every record stays readable and editable on the device**. Nothing is hidden, nothing is truncated, export still works in full.

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
| Home | settings, categories, plans, transactions, debts, goals | safe-to-spend, cash left, income/saved/paid vs plan, unallocated, per-what is left in each category, projected gaps | Skeleton, then figures. Load failure shows a reason and Retry |
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

## 10a · Motion, and what a webapp owes a big screen *(added 2026-09-25)*

Three decisions taken with the repositioning, recorded here because they are
requirements rather than taste:

**Desktop is a design target, not an adaptation.** The set was mobile-first at 360 and
merely *correct* at 1440. For a webapp that is met on a laptop by people deciding
whether to trust it, correct is not enough. Several 1440 artboards are reworked rather
than conformed — **which changes the shape of #72's conformance pass**, since it can no
longer be measured against artboards that are themselves being redrawn.

**Motion becomes a system, with `docs/design/motion.md` authoritative** the way
`tokens.md` is: named durations, named easings, an explicit list of what animates, and
a reduced-motion fallback for every entry.

Two hard rules:

- **`prefers-reduced-motion` gets a complete experience**, not a broken one. Standard **J3** already forbids motion carrying meaning alone; this extends it to the landing page, which may perform but must still read with animation off.
- **Nothing animates on the path to a figure.** No entrance animation between opening the app and reading safe-to-spend, and **no counting up on first paint** — a number mid-animation is a number you cannot read, and reading the number is the product.

**The daily user wins any conflict.** If a flourish costs the person recording an
expense in a queue half a second, it goes. Selling the product must not cost the
product.

**Engineering consequence:** the bundle already warns at 594KB. A motion library must
justify its weight under **N1**; CSS transitions and the Web Animations API are
preferred. Animate `transform` and `opacity` — animating layout properties drops frames
on the mid-range Android the daily user actually holds.

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

## 11a · Tiers — what each one buys

Settled 2026-09-25. The principle: **you pay for reach, never for the budgeting
itself.**

| | Free — no account | Paid |
|---|---|---|
| The whole budgeting app, one device | ✓ | ✓ |
| Cycles, plan, safe-to-spend, rollover | ✓ | ✓ |
| Debts both ways, the printed record | ✓ | ✓ |
| Rent sinking fund, goals, projected gap | ✓ | ✓ |
| Zakat estimate | ✓ | ✓ |
| Full history, no cycle limit | ✓ | ✓ |
| Export and import | ✓ | ✓ |
| **Sync to another device** | — | ✓ |
| **Household sharing** *(built after launch)* | — | ✓ |
| **Bank movement** *(built as v1.1)* | — | ✓ |

**Why this line and not a more generous or a meaner one.**

- **The differentiators stay free.** Debts in both directions and the annual-rent sinking fund are why this is not a bank's budget tab. Charging for them would paywall the reason to use it.
- **The paid features are the ones that cost money to run.** Bank movement bills per linked account through the aggregator. Sync costs storage and bandwidth. That makes the price honest rather than arbitrary.
- **No history limit, deliberately.** It is the conventional SaaS lever and it is wrong here: cutting off past cycles breaks the rent fund and the debt history, which are exactly the long-lived records this app exists to keep.
- **Nothing is taken away when someone lapses** (**K5**). Sync stops; the app does not.

**Entitlement is decided by the server, never the client.** A client-side check is
a suggestion. This is not about hiding code — ADR-008 is explicit that hiding
payment logic protects nothing — it is that the server is the only place the answer
can be trusted.

---

## 12 · Open questions

| Question | Who | Blocking? |
|---|---|---|
| Exact copy for the offline and storage-status lines — they must inform without alarming | Stakeholder, at PAGE SPECS with `design:ux-copy` | No |
| Should archiving a category hide it from past cycles, or only from new plans? Leaning: only from new plans, so history stays truthful | Stakeholder | No — needed before C7 is built |
| Does the debt record need the owner's own name on it, and where does that come from — onboarding? | Stakeholder | No — needed before E5 |
| **Price, and billing period.** Needed before the billing screens can be designed, not before the endpoint spec | Stakeholder | No — blocks design of **K3** |
| **Payment provider.** Nigerian cards and transfers point at Paystack or Flutterwave; the webhook signature and idempotency rules follow from the choice | Stakeholder | No — blocks **K3** build |
| **Tombstone retention**, and what a device absent longer than that does on its next sync | Endpoint spec (**deliberately parked there** by ADR-010) | **Yes — blocks J4** |
| **Clock skew.** Plan: the client's `updatedAt` records intent, a server sequence decides order. Needs settling rather than assuming | Endpoint spec (ADR-010) | **Yes — blocks J1** |
| **Rules 6 and 7** are drafted in `CONTEXT.md` awaiting the stakeholder's own wording | Stakeholder | **Rule 7 blocks the first real user** |
| What a device does when it signs in and already holds a *different* local budget — **I3** says ask, but the wording of that question is real design work | Design brief | No — blocks **I3** build |

---

## 13 · Timeline

No fixed date; *as soon as realistic*. Order follows the kick-off pack: `core/`
with its tests first, then Onboarding, Home, Quick Add, Plan, Transactions,
Debts & Goals, Months, Settings, export/import, seed script.

If time runs short, **Months ships and Zakat waits** (**D13**) — and screenshots
are taken as soon as the design lands, not at the end.

**Amended 2026-09-25 by ADR-009.** The order above is the free tier, and it is
mostly built. What follows it:

1. **The endpoint spec**, which settles the two parked questions above.
2. **One design brief** — the new and changed screens, and the landing page, which is done properly rather than assembled from leftovers.
3. **The workspace extraction** (ADR-008 item 2), before `services/api` has a line in it.
4. **Accounts and sync** (§I, §J), then **tiers and billing** (§K).
5. **Bank movement** as v1.1 (§M), then **household sharing** (§L).

Bank movement is designed now and built after launch, so the calendar time an
aggregator takes to onboard a registered business is not time the build sits
inside.
