# Seed data

**Every figure in this file is invented.** None of it describes any real
person's money.

This is the **only** source of financial figures anywhere in this repository.
Fixtures, tests, screenshots, documentation examples, issue descriptions and
demo data all draw from here. Repo rule 2:

> No real financial data ever enters the repository — not in code, seed files,
> fixtures, screenshots, issues, docs or commit messages.

Enforcement: frontend standard **M1** (`review` + secret scanning in CI).

Names are deliberately generic placeholders — "A. Friend", "Spouse",
"B. Colleague" — so no real person is identifiable, and so a screenshot can be
published without a second thought.

---

## The seeded household

### Income

| Item | Value |
|---|---|
| Take-home pay | ₦450,000 |
| Pay date | the **25th** of each month |

### Debts owed by the owner

| Creditor | Outstanding | Agreed repayment |
|---|---|---|
| A. Friend | ₦120,000 | ₦30,000 a month |
| Spouse | ₦60,000 | not scheduled |

### Debts owed to the owner

| Debtor | Outstanding |
|---|---|
| B. Colleague | ₦40,000 |

### Goals and sinking funds

| Goal | Target | Due |
|---|---|---|
| Annual rent | ₦900,000 | **1 March** |
| Emergency fund | ₦150,000 | no date |

---

## The seeded plan — one full cycle

Invented allocations for the cycle **25 September – 24 October** (30 days). They
sum to exactly ₦450,000, so the plan is complete and the unallocated banner is
hidden.

`Type` decides whether an allocation is **protected** from safe-to-spend (D1):
anything that is not an `Expense` is protected.

| Category | Type | Planned | Protected? | Rolls over? |
|---|---|---:|:-:|:-:|
| Rent fund | Savings | ₦75,000 | yes | — |
| Debt payment — A. Friend | Debt payment | ₦30,000 | yes | — |
| Emergency fund | Savings | ₦15,000 | yes | — |
| Personal savings | Savings | ₦70,000 | yes | — |
| Food and groceries | Expense | ₦90,000 | no | **yes** |
| Transport, data and airtime | Expense | ₦45,000 | no | — |
| Family support | Expense | ₦40,000 | no | — |
| Apartment setup | Expense | ₦25,000 | no | — |
| Miscellaneous | Expense | ₦22,000 | no | — |
| Utilities | Expense | ₦18,000 | no | — |
| Health | Expense | ₦10,000 | no | — |
| Sadaqah | Expense | ₦10,000 | no | — |
| **Total** | | **₦450,000** | | |

**Protected total ₦190,000 · spendable total ₦260,000.**

Planned daily allowance = ₦260,000.00 ÷ 30 = **₦8,666.66** — floored, because
it is money that may be spent (page specs §3a).

### Opening balances entered at onboarding

Progress only ever comes from transactions, so an opening balance is recorded as
a dated opening transaction rather than typed into a goal.

| Item | Opening balance |
|---|---|
| Rent fund | ₦305,000 — dated **24 August**, the day before the *first* cycle |
| Emergency fund | ₦0 |
| Personal savings | ₦0 |

### The worked day — 5 October, day 11 of 30

Movements recorded so far this cycle:

| Movement | Amount |
|---|---:|
| Income received, 25 September | ₦450,000 |
| Moved to rent fund | ₦75,000 |
| Moved to emergency fund | ₦15,000 |
| Repaid A. Friend | ₦30,000 |
| Spent across expense categories | ₦110,000 |

Which gives, on 5 October:

| Figure | Working | Result |
|---|---|---:|
| Cash left | 450,000 − 110,000 − 90,000 − 30,000 | **₦220,000** |
| Protected remaining | personal savings 70,000 − 0; every other protected category fully moved | **₦70,000** |
| Safe to spend, total | 220,000 − 70,000 | **₦150,000** |
| Days left (today counts) | 5 Oct → 24 Oct | **20** |
| **Safe to spend per day** | 150,000 ÷ 20 | **₦7,500** |
| Amber threshold | 60% × the **exact** allowance, in kobo: (6 × 26,000,000) ÷ 300 | **₦5,200.00** |
| State | 7,500 > 5,200 | **green** |

**An amber variant, for the screenshot that shows the warning:** identical except
₦160,000 spent instead of ₦110,000. Cash left ₦170,000, safe to spend ₦100,000,
per day ₦5,000 — below ₦5,200, so amber.

### The expense split on that day

The ₦110,000.00 spent, by category. Sorted worst-first, as Home sorts it.

| Category | Spent | Allowance | % | Badge |
|---|---:|---:|---:|---|
| Health | ₦14,000.00 | ₦10,000.00 | 140% | **Overspent** |
| Transport, data and airtime | ₦38,250.00 | ₦45,000.00 | 85% | **Low** |
| Food and groceries *(+₦12,000.00 carried)* | ₦40,000.00 | ₦102,000.00 | 39% | — |
| Utilities | ₦4,750.00 | ₦18,000.00 | 26% | — |
| Miscellaneous | ₦5,000.00 | ₦22,000.00 | 23% | — |
| Family support | ₦8,000.00 | ₦40,000.00 | 20% | — |
| Apartment setup | ₦0.00 | ₦25,000.00 | 0% | — |
| Sadaqah | ₦0.00 | ₦10,000.00 | 0% | — |
| **Total** | **₦110,000.00** | | | |

**Health carries the overspend, not food.** Food's allowance is ₦102,000.00 once
the ₦12,000.00 rollover is added, so overspending it would need more than that —
which, with transport at its 85%, exceeds the whole cycle's expense spend and
moves cash left off ₦220,000.00 and the hero off ₦7,500.00. Health at
₦14,000.00 against a ₦10,000.00 allowance gives the same badge and leaves every
load-bearing figure untouched. It is also the honest example: a clinic visit is
exactly the non-discretionary expense the protection override exists for.

### The 23 movements, 25 September to 5 October

| # | Date | Type | Category / counterparty | Note | Amount |
|:-:|---|---|---|---|---:|
| 1 | Fri 25 Sep | Income | — | Salary | ₦450,000.00 |
| 2 | Fri 25 Sep | Move to savings | Rent fund → Bank vault | | ₦75,000.00 |
| 3 | Fri 25 Sep | Move to savings | Emergency fund → PiggyVest | | ₦15,000.00 |
| 4 | Fri 25 Sep | I repaid | A. Friend | Monthly repayment | ₦30,000.00 |
| 5 | Fri 25 Sep | Expense | Food and groceries | Month's foodstuff | ₦12,500.00 |
| 6 | Fri 25 Sep | Expense | Transport, data and airtime | Data bundle and airtime | ₦8,000.00 |
| 7 | Sat 26 Sep | Expense | Food and groceries | Market | ₦3,200.00 |
| 8 | Sat 26 Sep | Expense | Transport, data and airtime | Fuel | ₦2,500.00 |
| 9 | Mon 28 Sep | Expense | Utilities | Electricity units | ₦4,750.00 |
| 10 | Mon 28 Sep | Expense | Transport, data and airtime | Fuel | ₦3,000.00 |
| 11 | Tue 29 Sep | Expense | Food and groceries | Market | ₦5,400.00 |
| 12 | Tue 29 Sep | Expense | Family support | Monthly support | ₦8,000.00 |
| 13 | Wed 30 Sep | Expense | Transport, data and airtime | Fuel | ₦4,250.00 |
| 14 | Wed 30 Sep | Expense | Miscellaneous | Barber | ₦2,000.00 |
| 15 | Thu 1 Oct | Expense | Health | Clinic visit and prescription | ₦14,000.00 |
| 16 | Thu 1 Oct | Expense | Food and groceries | Market | ₦4,800.00 |
| 17 | Fri 2 Oct | Expense | Transport, data and airtime | Fuel and transport | ₦6,500.00 |
| 18 | Fri 2 Oct | Expense | Food and groceries | Groceries | ₦6,100.00 |
| 19 | Sat 3 Oct | Expense | Food and groceries | Market | ₦5,000.00 |
| 20 | Sat 3 Oct | Expense | Miscellaneous | Household items | ₦3,000.00 |
| 21 | Sun 4 Oct | Expense | Transport, data and airtime | Fuel | ₦7,000.00 |
| 22 | Sun 4 Oct | Expense | Food and groceries | Bread and provisions | ₦3,000.00 |
| 23 | Mon 5 Oct | Expense | Transport, data and airtime | Fuel | ₦7,000.00 |

The nineteen expenses sum to exactly ₦110,000.00 and to the per-category totals
above. **The seed script must assert both**, so a future edit to one row cannot
quietly break every figure in the documentation and the designs.

Only four of the eight movement types occur here — Income, Expense, Move to
savings, I repaid. Adding the others would move money that is already settled: a
*They repaid me* is cash in, and cash left would no longer be ₦220,000.00. The
remaining four labels appear in the type filter and on the primitives sheet,
where no figure is needed to show them.

### Opening movements, dated 24 September

The day **before** the cycle begins, so they do not appear in this cycle's
figures (page specs §7.1 step 4).

| Date | Type | Counterparty / category | Amount |
|---|---|---|---:|
| Thu 24 Sep | Move to savings | Rent fund → Bank vault | ₦400,000.00 |
| Thu 24 Sep | I borrowed | A. Friend | ₦120,000.00 |
| Thu 24 Sep | I borrowed | Spouse | ₦60,000.00 |
| Thu 24 Sep | I lent | B. Colleague | ₦40,000.00 |

### Goals and debts on that day

| | Working | Result |
|---|---|---:|
| Rent fund saved | 400,000 opening + 75,000 this cycle | ₦475,000 |
| Paydays on or before 1 March | 25 Oct, 25 Nov, 25 Dec, 25 Jan, 25 Feb | 5 |
| Projected at the current rate | 475,000 + (5 × 75,000) | ₦850,000 |
| **Projected gap** | 900,000 − 850,000 | **₦50,000 short** |
| Rate needed to close it | (900,000 − 475,000) ÷ 5 | ₦85,000 a payday |
| A. Friend, outstanding | 120,000 − 30,000 | ₦90,000 |
| Paydays to clear at ₦30,000 | | 3 |
| Spouse, outstanding | no schedule | ₦60,000 |
| B. Colleague owes | counts toward nothing (D3) | ₦40,000 |

The rent fund is deliberately seeded **behind schedule**. A demo where
everything is fine demonstrates nothing; the projected gap exists to say so
early, and this is the figure that proves it works.

### The first cycle — 25 August to 24 September, completed

The owner's first cycle, and the one that gives Months a row and the food
rollover its provenance.

| Figure | Value |
|---|---:|
| Income | ₦450,000.00 |
| Spent | ₦355,000.00 |
| Saved | ₦95,000.00 — all to the rent fund |
| Debt paid | ₦0.00 |
| **Ended with** | **₦0.00** |

Three facts from it carry forward, and every other figure in this file depends
on them:

- **Food: ₦78,000.00 spent against ₦90,000.00 planned**, and food rolls over —
  which is where the **₦12,000.00 carried** on the current cycle comes from. It
  was asserted before; now it has a source.
- **The rent fund went from ₦305,000.00 to ₦400,000.00** — the ₦75,000.00
  planned plus the ₦20,000.00 remaining at cycle end, moved rather than left
  sitting. So on 5 October it is 400,000 + 75,000 = **₦475,000.00**, unchanged.
- **The debts are not in this cycle.** They were recorded on 24 September, at the
  cycle boundary, so A. Friend's balance on 5 October is 120,000 − 30,000 =
  **₦90,000.00**, unchanged.

**It ends at ₦0.00 deliberately.** Under D16 a leftover would arrive on the next
cycle's Plan as unallocated, which would change the current plan's totals — and
with them the daily allowance, the amber threshold and every delivered design.
Ending at zero keeps the whole worked scenario intact, and it is what a
zero-based budgeter does anyway: the remainder was given a job.

**A carried-leftover variant, for testing D16:** the same cycle ending with
₦20,000.00 left instead of moving it. The next Plan then opens with
*"₦20,000.00 carried from last cycle"*, ₦470,000.00 to allocate, and unallocated
at ₦20,000.00 until it is given a job.

**Its individual movements are deliberately not enumerated.** Nothing in v1 needs
them — Months shows the summary above, and the rollover needs only the food
figure. If story **F2** (open a past cycle and see it as it was) is built, they
will be, and they belong here when that happens.

### The zakat scenario

**The nisab figure below is invented, like every other figure here.** It is not a
reference value and must never be used as one — the app requires the owner to
enter their own and says where to check it.

| Item | Value |
|---|---|
| Hawl start | **16 June 2026** — 1 Muharram 1448 |
| Nisab, as entered by the owner | **₦2,450,000.00** *(invented)* |
| Zakatable savings on 5 October | rent fund ₦475,000.00 + emergency fund ₦15,000.00 + personal savings ₦0.00 = **₦490,000.00** |
| Money owed to the owner | ₦40,000.00 — **excluded**, because `includeReceivables` has not been answered (D3) |
| Result | **Below the nisab. No zakat estimated.** |

This is deliberately the *below-nisab* case, because it is the state the owner
will actually be in and the one most likely to be got wrong — an app that always
shows a figure will happily show one when none is due.

**An above-nisab variant, for the calculation's tests:** identical except
personal savings has reached ₦2,000,000.00, so zakatable savings are
₦2,490,000.00. Above the nisab, and 2.5% of that is **₦62,250.00**.

**With receivables included**, the same variant is ₦2,530,000.00 and 2.5% is
**₦63,250.00** — the two figures the switch in D3 moves between.

---

## Adding to this file

The individual movements arrived on 10 September, worked out for the design stop
and merged here from `docs/design/PROPOSED-seed-additions.md`, which is kept as
the record of *why* those figures are what they are.

The zakat scenario arrived on 10 September and is above.

The first cycle arrived on 11 September, once **D16** settled the question that
was blocking it — whether cash left carries between cycles. It does not; the
leftover arrives on the next Plan as unallocated instead.

Still missing: the **individual movements of the first cycle**, needed only if
story F2 is built.

Three rules for adding them:

1. **Invent them.** Never transcribe a real budget, statement or balance.
2. **Add them here, and only here.** No figure is invented at the point of use —
   not in a test file, not in a story, not in a screenshot script. Code imports
   the seed; it does not restate it.
3. **Keep them consistent with the figures above**, which are fixed. Allocations
   should sum to something a ₦450,000 take-home can actually cover, or the
   dashboard demonstrates arithmetic nobody can follow.
