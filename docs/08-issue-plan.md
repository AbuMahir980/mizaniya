# Issue plan — Mizaniya v1

| Field | Value |
|---|---|
| **Date** | 2026-09-11 |
| **Phase** | 7 · Issues |
| **Inputs** | [03-system-spec.md](03-system-spec.md) · [06-page-specs.md](06-page-specs.md) · [02-architecture.md](02-architecture.md) · [05-coding-standards.md](05-coding-standards.md) · [seed-data.md](seed-data.md) |
| **Tracker** | GitHub Issues on `AbuMahir980/mizaniya` — no prefix, issues are `#N` |
| **Status** | 22 tickets across 3 cycles, **filed as [#8–#29](https://github.com/AbuMahir980/mizaniya/issues)** on 11 September. |

---

## 1 · What is already built

SHARED RULES and FRONTEND RULES did more than configure. Recording it here so no
ticket re-does it:

| Built | Where |
|---|---|
| Tooling, and `npm run verify` — naming, lint, typecheck, test, build | `package.json`, `eslint.config.js`, `tsconfig.json` |
| Design tokens, both themes, guarded by a test | `src/design/` |
| Money — the only formatter, and the rounding rules | `src/core/money/` |
| Domain types, runtime schema, the `Repository` interface | `src/core/types.ts`, `schema.ts`, `repository.ts` |
| Twenty UI primitives with every state, and the gallery | `src/ui/`, `src/app/primitives-page.tsx` |

**Nothing derived is stored anywhere.** Every ticket below inherits that.

---

## 2 · Sizing, and what "done" means

**Size** is rough effort, not time: **S** a sitting · **M** a day · **L** more
than a day, and a candidate for splitting.

**Done** is the same for every ticket, and it is not negotiable:

1. `npm run verify` green — naming, lint, typecheck, tests, build.
2. Tests written **alongside** the code, not after (**K2**, and **H4** for money).
3. The acceptance criteria below all tick.
4. A pull request, because nothing reaches `main` directly.
5. `.peer-ai-state.json` updated and committed on the same branch.

**No ticket is "done" because it renders.** If it shows a figure, there is a test
that pins the figure.

---

## 3 · The tickets

**All 22 are on the board.** `T1`–`T22` map to issues **#8–#29** in order; the
tables below link each one. The issue is the queue BUILD works from — this
document is the reasoning behind it, and the two are kept in step by the ticket
number appearing in both.

### The list

### Cycle 1 — `core/`, and the seam beneath it

Pure functions first, with their tests. Nothing here imports React, touches
storage, or reads the clock. This is the cycle that decides whether the app's
numbers are right; everything after it is presentation.

| # | Ticket | Size | Depends on |
|---|---|:-:|---|
| **[T1](https://github.com/AbuMahir980/mizaniya/issues/8)** · #8 | `core/cycle` — boundaries, days left, paydays | M | — |
| **[T2](https://github.com/AbuMahir980/mizaniya/issues/9)** · #9 | `core/budget` — cash left, protected, safe-to-spend | M | T1 |
| **[T3](https://github.com/AbuMahir980/mizaniya/issues/10)** · #10 | `core/budget` — rollover and the carried line | S | T2 |
| **[T4](https://github.com/AbuMahir980/mizaniya/issues/11)** · #11 | `core/debt` — balances that cross zero | S | T1 |
| **[T5](https://github.com/AbuMahir980/mizaniya/issues/12)** · #12 | `core/goal` — projected gap and status | S | T1 |
| **[T6](https://github.com/AbuMahir980/mizaniya/issues/13)** · #13 | `core/zakat` — hawl, nisab, the estimate | M | T1 |
| **[T7](https://github.com/AbuMahir980/mizaniya/issues/14)** · #14 | The Dexie `Repository` implementation | M | — |
| **[T8](https://github.com/AbuMahir980/mizaniya/issues/15)** · #15 | The snapshot store and its single write path | M | T7 |
| **[T9](https://github.com/AbuMahir980/mizaniya/issues/16)** · #16 | Export and import | M | T7, T8 |

---

**T1 · `core/cycle` — boundaries, days left, paydays**

The cycle is the unit everything else is measured in, so it goes first.

- [ ] `cycleFor(settings, date)` returns the cycle containing a date — start, end, length
- [ ] A salary day of 29–31 **clamps to the last day** of a short month; February never lacks a salary day and March never has two (**D4**)
- [ ] `daysLeft(settings, now)` **counts today**, so its minimum is 1 and never 0
- [ ] Income dated up to `earlyIncomeWindowDays` (default 3) **before** a cycle starts is attributed to that cycle (**D4**)
- [ ] `paydaysBetween(settings, from, to)` counts salary days **on or before** the end date — the basis of every projection (**D5**)
- [ ] A cycle is identified and labelled by its **start date**, never a bare month name (**D4**)
- [ ] Takes `now` as a parameter. Never reads the clock (**ADR-003**, lint-enforced)
- [ ] Tests: the seeded 25 Sep–24 Oct cycle, salary day 31 in February and in a leap year, payday on a weekend, the 3-day window boundary at 2, 3 and 4 days

**T2 · `core/budget` — cash left, protected, safe-to-spend** *(the headline)*

- [ ] `cashLeft` = this cycle's income − this cycle's movements. **Not a running balance** (**D16**)
- [ ] `protectedRemaining` = Σ `max(planned − actual, 0)` over protected categories — planned *minus actual*, so money already moved is not subtracted twice (**D1**)
- [ ] Protection derives from category type; `protectedOverride` beats it (**D1**)
- [ ] `safeToSpendPerDay` = `(cashLeft − protectedRemaining) ÷ daysLeft`, **floored** (money you may spend rounds down)
- [ ] Amber when below `amberRatio × plannedDailyAllowance`, computed in **integer kobo, dividing last** — ₦5,200.00, not ₦5,199.99 (**D15**, §3a)
- [ ] No plan ⇒ **no amber state**, and never a division by zero
- [ ] Red means **negative**. Exactly zero is amber
- [ ] `unallocated` = take-home + carried − allocated (**D16**)
- [ ] Tests: every figure in `docs/seed-data.md` — ₦220,000.00 cash left, ₦7,500.00 a day, the ₦5,000.00 amber variant, and the three ways of computing the threshold

**T3 · `core/budget` — rollover and the carried line**

- [ ] `carriedIn(category, previousCycle)` returns unspent allowance for a rolling category
- [ ] **Cash left is not touched by rollover.** The money was never spent and is already counted — nothing is added twice (**D2**)
- [ ] Category allowance = planned + carried; variance measured against the allowance
- [ ] `leftoverFrom(previousCycle)` surfaces as unallocated on the next plan, not as spendable (**D16**)
- [ ] Tests: food at ₦78,000.00 of ₦90,000.00 carries ₦12,000.00 into an allowance of ₦102,000.00 — and cash left is identical with rollover on and off

**T4 · `core/debt` — balances that cross zero**

- [ ] `balance = Σ borrowed − Σ repaid − Σ lent + Σ repaymentReceived`; positive means the owner owes
- [ ] A single record **crosses zero** — an ajo counterparty moves from owed-to-you to owed-by-you and is never split (**D9**)
- [ ] `paydaysToClear(debt, settings, now)` where a schedule exists
- [ ] Money owed to the owner counts toward **nothing** — not safe-to-spend, not any gap (**D3**)
- [ ] Tests: A. Friend ₦120,000.00 → ₦90,000.00 after one repayment; B. Colleague at −₦40,000.00; a full ajo round trip through zero

**T5 · `core/goal` — projected gap and status**

- [ ] `saved` from transactions only. **No stored `savedSoFar`**
- [ ] `projected = saved + (paydays remaining on or before the due date × planned contribution)` — paydays, not pro-rated cycles (**D5**)
- [ ] `rateToClose` rounds **up** — money you must find (§3a)
- [ ] No due date ⇒ progress only, no gap, no status badge
- [ ] A passed due date ⇒ `Overdue`, and the projection stops
- [ ] Tests: rent at ₦475,000.00 of ₦900,000.00 projects ₦850,000.00, **₦50,000.00 short**, needing **₦85,000.00 a payday**

**T6 · `core/zakat` — hawl, nisab, the estimate**

- [ ] Savings balance tracked across the hawl from transactions
- [ ] Hawl start is **asked for**; absent, it falls back to the first record and the panel says so (**D6**)
- [ ] Nisab is owner-entered. Absent ⇒ explain what is missing, **never show ₦0.00**
- [ ] Receivables included only if the owner answered; undefined means *not yet asked* (**D3**)
- [ ] 2.5% of the zakatable amount, and it is an **estimate, never a ruling**
- [ ] Tests: the seeded below-nisab case; the above-nisab variant at ₦62,250.00, and ₦63,250.00 with receivables

**T7 · The Dexie `Repository` implementation**

- [ ] Implements `Repository` from `core/` exactly. **No Dexie type crosses the boundary** (**A4**, lint-enforced)
- [ ] Schema version 1, with the migration chain in place from the start
- [ ] `import` runs in **one transaction** — all of it lands or none (**ADR-005**)
- [ ] Tests against fake-indexeddb, including a rejected write

**T8 · The snapshot store and its single write path**

- [ ] One store holds the whole snapshot (**B4**, **ADR-001**)
- [ ] Every write: **storage first, memory only if it resolved** — so a failed save leaves the screen and the database agreeing
- [ ] Derived figures come from memoised selectors over `core/`. **Nothing derived is stored** (**B3**)
- [ ] `BroadcastChannel` tells other tabs to reload after a successful write
- [ ] Tests: a rejected repository write leaves the snapshot **unchanged**; two-tab drift closes

**T9 · Export and import**

- [ ] Export carries `schemaVersion`, and records `lastExportedAt`
- [ ] Import: older migrates, equal loads, **newer is refused** with a plain reason and **nothing changes**
- [ ] Refusals distinguish not-Mizaniya, too-new and malformed (§7)
- [ ] Before an import replaces data, the current data is **exported first** and the owner is told
- [ ] Tests: **M3 round-trip** — export, import into an empty database, every figure identical; a corrupt file leaves the database untouched

---

### Cycle 2 — the shell, and the screens the core journey needs

| # | Ticket | Size | Depends on |
|---|---|:-:|---|
| **[T10](https://github.com/AbuMahir980/mizaniya/issues/17)** · #17 | App shell, routing and navigation | M | T8 |
| **[T11](https://github.com/AbuMahir980/mizaniya/issues/18)** · #18 | PWA — manifest, service worker, persistence | M | T10 |
| **[T12](https://github.com/AbuMahir980/mizaniya/issues/19)** · #19 | Onboarding | L | T10, T7 |
| **[T13](https://github.com/AbuMahir980/mizaniya/issues/20)** · #20 | Home | L | T12, T2–T5 |
| **[T14](https://github.com/AbuMahir980/mizaniya/issues/21)** · #21 | Quick Add | M | T13 |
| **[T15](https://github.com/AbuMahir980/mizaniya/issues/22)** · #22 | Plan | M | T13, T3 |

**T10 · App shell, routing and navigation**
- [ ] Routes per page specs §1; bottom bar at 360px, sidebar at 1440 (§2)
- [ ] `AnnounceProvider` mounted once — **one live region per screen** (§3)
- [ ] Error boundary; the offline note, **neutral, never danger** (§4)
- [ ] Redirects to `/welcome` until settings exist
- [ ] Test: keyboard reaches every nav item, focus visible

**T11 · PWA — manifest, service worker, persistence**
- [ ] Installable; the shell precached — **no runtime data caching**, there is no network data
- [ ] `navigator.storage.persist()` requested **after** the first real write, never on first load (**D12**)
- [ ] Settings reports the true status, and says *Checking…* until it resolves — never a guess
- [ ] Test: the status surface handles granted, refused and pending

**T12 · Onboarding** *(L — six steps; split if it runs long)*
- [ ] Six steps per §7.1; only step 2 required
- [ ] Salary day 29–31 shows the clamping note, not a warning
- [ ] Opening balances become **dated opening transactions**, dated the **day before the cycle starts** — dated today they would inflate this cycle's Saved figure by everything ever saved
- [ ] A failed save keeps every entered value
- [ ] Lands on a Home with correct figures — never an empty Home
- [ ] Test: the seeded owner onboards and Home reads ₦7,500.00

**T13 · Home** *(L — hero, three diagrams, two tables)*
- [ ] Hero, four figures, the three diagrams from `tokens.md` §6 (gauge, daily-spend, breakdown)
- [ ] Unallocated as a **banner that disappears at ₦0.00**, never a tile reading zero
- [ ] Category table worst-first; goals table with the gap and the closing rate
- [ ] Hijri date via `Intl` pinned to **`islamic-umalqura`** — the bare `islamic` alias differs across engines
- [ ] Every figure opens its records. **No figure is a dead end**
- [ ] Amber, red, no-plan, empty and offline states all present
- [ ] Test: the worked day renders every seeded figure; the amber variant flips the state

**T14 · Quick Add**
- [ ] **Three taps plus the amount**, from anywhere — the app's most-used interaction
- [ ] All eight movement types; category or counterparty per type
- [ ] Saves confirm **twice**: toast and live region (§6)
- [ ] A failed save keeps the sheet open with values intact
- [ ] Test: three taps reach a saved transaction; RTL on the whole flow

**T15 · Plan**
- [ ] Per-category amounts, autosave on blur, no Save button
- [ ] Sticky unallocated figure; `aria-live` on it, per blur not per keystroke
- [ ] Carried-in shown as its own line (**D2**); leftover as unallocated (**D16**)
- [ ] Copy last cycle; disabled **with a reason** when there is none
- [ ] Danger colour only when allocated exceeds take-home
- [ ] Test: a failed row save keeps the typed figure and does **not** move unallocated

---

### Cycle 3 — the rest, and the proof

| # | Ticket | Size | Depends on |
|---|---|:-:|---|
| **[T16](https://github.com/AbuMahir980/mizaniya/issues/23)** · #23 | Transactions, and editing | M | T14 |
| **[T17](https://github.com/AbuMahir980/mizaniya/issues/24)** · #24 | Debts & Goals, and the two forms | L | T4, T5 |
| **[T18](https://github.com/AbuMahir980/mizaniya/issues/25)** · #25 | The printable debt record | S | T17 |
| **[T19](https://github.com/AbuMahir980/mizaniya/issues/26)** · #26 | Months | S | T1, T2 |
| **[T20](https://github.com/AbuMahir980/mizaniya/issues/27)** · #27 | Settings, and the import flow | M | T9, T11 |
| **[T21](https://github.com/AbuMahir980/mizaniya/issues/28)** · #28 | The seed script | S | T7 |
| **[T22](https://github.com/AbuMahir980/mizaniya/issues/29)** · #29 | Zakat | M | T6 |

**T16 · Transactions, and editing** — grouped by day; **two distinct empty states**, because the next action differs; editing reuses the Quick Add sheet pre-filled, never a second form (**E2**); savings subtotalled per destination.

**T17 · Debts & Goals, and the two forms** — both directions, grouped by the **sign of the derived balance**; an ajo card moves between groups and is never split; *Record a payment* pre-sets the type from the balance; Add-a-debt and Add-a-goal per §7.6, with direction writing an **opening movement, not a stored field**.

**T18 · The printable debt record** — one page, print stylesheet, no dependency; legible in black and white; prints with an empty history rather than failing.

**T19 · Months** — completed cycles only, labelled by **start date**; recomputed from transactions, so correcting an old entry corrects the history.

**T20 · Settings, and the import flow** — data first; the three-stage import with the automatic pre-export; the amber-threshold slider showing its resulting figure; savings destinations listed read-only with the v1 limitation stated on screen.

**T21 · The seed script** — loads `docs/seed-data.md` exactly, and **asserts the sums**: the 19 expenses total ₦110,000.00 and match every per-category figure. One edited row would otherwise falsify the documentation and 67 artboards.

**T22 · Zakat** — **may slip past v1** (**D13**). If it ships, it ships correct: the caveat is attached to the figure, not a footnote.

---

## 4 · Critical path

```
T1 cycle ─┬─ T2 safe-to-spend ─ T3 rollover ─┐
          ├─ T4 debt                          │
          ├─ T5 goal                          ├─ T13 Home ─ T14 Quick Add ─ T16 Transactions
          └─ T6 zakat ──────────── T22        │
T7 repository ─ T8 store ─ T10 shell ─ T12 Onboarding ┘
                              └─ T11 PWA
```

**T1 → T2 → T13 is the critical path.** Everything the app is judged on runs
through safe-to-spend, and safe-to-spend needs the cycle.

**T7 and T8 can run in parallel with T1–T6** — different people, or different
sittings. The `Repository` interface already exists, so neither waits.

---

## 5 · The debt this build takes on deliberately

Recorded here as well as in [backlog.md](backlog.md), because a shortcut nobody
writes down becomes a mystery rather than a decision.

| Taken on | Why it is acceptable now | What would make it urgent |
|---|---|---|
| **Schemas not tied to types** — `types.ts` and `schema.ts` can drift | One annotation pass fixes it; needs a compiler, which now exists | The first time a schema rejects valid data |
| **The contract document is hand-checked** | The source files are authoritative and the doc says it is hand-checked | A field rename that the document misses |
| **D1, F1, G4 lint rules off** | Each needs an allowlist decision; switching them on without one is how rules get disabled wholesale | A second inline style, or a second `as` across a boundary |
| **`core/` is a folder, not a package** | The A3 lint rule holds the boundary and it is machine-checked | v2 starting — it is the first task there (**ADR-002**) |
| **No encryption at rest** | The threat is someone holding an unlocked phone; they could open the app anyway | Household sharing, or a second person on the device |
| **Coverage gate not wired** | 33 tests pass and money is covered; the *gate* lands at PR AUTOMATION | A money path merging untested |

**Two of these are gates that do not yet exist**, and that is the honest summary
of where this build stands: the rules are written, most are enforced, and the
rest are named with the phase that enforces them.

---

## 6 · What is explicitly not in these tickets

Anything not in `docs/product-brief.md` goes to [backlog.md](backlog.md), not
into an issue. That includes every item in its "Deferred features" table, and
everything in the requirements summary's out-of-scope column — bank sync,
household sharing, multi-currency, a zakat PDF, ajo group management, CSV
export, notifications, telemetry, and any server.

---

## 7 · Next

**BUILD**, `peer-ai/frontend/03-build.md`, starting at **T1**.

Note for whoever runs it: step 2 now has **option F — the design already
exists** (upstream item 30), and step 4 is **conditional** — this project's
contract records no API, so there is nothing to mock and the local `Repository`
implementation is the real one (upstream item 29). Both were fixed upstream on
11 September and pulled in; do not invent a `services/` layer.
