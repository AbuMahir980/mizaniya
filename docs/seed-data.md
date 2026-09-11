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

## Working figures for the seeded scenario

At ₦30,000 a month, A. Friend's ₦120,000 clears in four cycles. The rent fund
needs ₦900,000 by 1 March; whether the current rate reaches it is exactly the
projected-gap calculation the dashboard exists to show, so the *rate* is
deliberately not fixed here — the seed script sets it and the Home screen
reports whether it is enough.

Everything above is given by repo rule 2 and does not change.

---

## Adding to this file

Later phases will need figures this file does not yet carry — envelope
allocations per category, a transaction history long enough to make the
Transactions screen and its empty state meaningful, a second salary cycle to
demonstrate rollover.

Three rules for adding them:

1. **Invent them.** Never transcribe a real budget, statement or balance.
2. **Add them here, and only here.** No figure is invented at the point of use —
   not in a test file, not in a story, not in a screenshot script. Code imports
   the seed; it does not restate it.
3. **Keep them consistent with the figures above**, which are fixed. Allocations
   should sum to something a ₦450,000 take-home can actually cover, or the
   dashboard demonstrates arithmetic nobody can follow.
