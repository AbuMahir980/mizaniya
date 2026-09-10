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

Planned daily allowance = ₦260,000 ÷ 30 = **₦8,666.67**.

### Opening balances entered at onboarding

Progress only ever comes from transactions, so an opening balance is recorded as
a dated opening transaction rather than typed into a goal.

| Item | Opening balance |
|---|---|
| Rent fund | ₦400,000 |
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
| Amber threshold | 60% × 8,666.67 | ₦5,200 |
| State | 7,500 > 5,200 | **green** |

**An amber variant, for the screenshot that shows the warning:** identical except
₦160,000 spent instead of ₦110,000. Cash left ₦170,000, safe to spend ₦100,000,
per day ₦5,000 — below ₦5,200, so amber.

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

---

## Adding to this file

Later phases will need figures this file does not yet carry — the individual
transactions that make up the ₦110,000 spent, spread across categories and dates
so the Transactions screen and its filters have something real to show; a second
salary cycle so rollover can be demonstrated rather than described; and a zakat
scenario with a hawl start date.

Three rules for adding them:

1. **Invent them.** Never transcribe a real budget, statement or balance.
2. **Add them here, and only here.** No figure is invented at the point of use —
   not in a test file, not in a story, not in a screenshot script. Code imports
   the seed; it does not restate it.
3. **Keep them consistent with the figures above**, which are fixed. Allocations
   should sum to something a ₦450,000 take-home can actually cover, or the
   dashboard demonstrates arithmetic nobody can follow.
