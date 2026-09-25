# Derived state

*Why no figure the app shows you is actually stored anywhere.*

## The problem

Home shows "cash left: ₦312,000". Where does that number come from?

The obvious answer is: keep a running total. Start at ₦450,000, subtract each expense
as it's recorded, store the result. Read it back when the screen opens. Fast and
simple.

That is the design this app deliberately does not use, and the reason is worth
understanding, because it applies far beyond budgeting.

## The short version

**Transactions are the only facts. Everything else is a calculation.** Cash left, safe
to spend, what's in the rent fund, what you owe A. Friend, the zakat estimate — none of
these are stored. Each is worked out from the transaction list every time it's needed.

## The words first

| Word | What it means | Where |
|---|---|---|
| **Derived** | Calculated from something else, not stored. Cash left is derived. | `packages/core/src/` |
| **Fact** | Something recorded because it happened. A transaction is a fact. | `packages/core/src/types.ts` |
| **Source of truth** | The one thing you'd trust if two records disagreed. Here: the transactions. | — |
| **Pure function** | Same inputs, same answer, every time. No clock, no database, no surprises. | `packages/core/src/` |

---

## The reasoning, in the order the questions come

### "Why not store the running total?"

Because a stored total and the records behind it can drift apart — and when they do,
**both look equally correct.**

Say the total says ₦312,000 and the transactions add up to ₦308,000. Which is wrong?
You cannot tell by looking. There is no marker, no error, nothing logged. The screen
shows a confident number, the records show a different one, and nothing in the system
knows they disagree.

### "But how would they drift? The code subtracts every time."

The ways are boring and they all happen:

- An expense is deleted. Did the delete path remember to add the money back?
- An amount is corrected from ₦12,000 to ₦1,200. Did it subtract the difference, or subtract ₦1,200 again?
- A write half-fails. The transaction saved, the total didn't.
- Someone restores a backup. The transactions come from the file; does the total?
- A new feature is added — say, a category that rolls over — and now one more place has to remember to update the total.

Each is one forgotten line. And the failure is not a crash, it is a **wrong number
that looks fine**.

### "So what's the alternative?"

Store only what happened, and calculate the rest.

```
Stored (facts)                       Derived (calculated)
───────────────                      ─────────────────────
transactions                   →     cash left
plans (what you allocated)     →     safe to spend today
categories                     →     what's left in Food
debts (who, when, terms)       →     what you still owe A. Friend
goals (target, due date)        →     whether you'll hit the rent target
```

Nothing on the right exists in the database. Recording an expense changes **one**
thing: the transaction list. Every figure on the right follows automatically, because
they are all just arithmetic over that list.

**A stale number becomes structurally impossible**, rather than a class of bug you
watch for.

### "Isn't recalculating everything slow?"

It would be if the data were big. One person's budget is a few thousand transactions,
under a megabyte. Adding up a list that size takes well under a millisecond — less than
the screen redraw that follows it.

And figures are memoised on the snapshot, so recording one expense doesn't recompute
the screens it didn't touch. That's in `state-management.md`.

### "Is there a case where this really shows its value?"

`Debt` is the clearest one, and it's the design detail worth quoting in an interview.

A debt record has **no direction field**. Nowhere does it say "I owe them" or "they owe
me".

Why not? Because the balance is derived from the movements, and **it can legitimately
cross zero**. In a rotating ajo you lend before your turn and borrow after it. The same
relationship goes both ways over time.

A stored direction would have to be corrected at the crossing point — and if nothing
corrected it, nothing would notice. Deriving it means the question "which way does this
debt go?" is answered by the movements, every time, and cannot be stale.

### "Where does the rounding go, then?"

One place, and it always rounds in the safe direction.

Safe-to-spend divides what's left by the days remaining. That division almost never
comes out even, so it **rounds down** — `perUnitFloor` in `packages/core/src/money/money.ts`.

Rounding up by even one kobo per day tells someone they can spend money that isn't
there. Rounding down understates by a few kobo, which nobody is harmed by. See
`money.md`.

### "What did you give up?"

Three real costs, worth saying out loud rather than pretending there were none:

1. **History has to be complete.** If a transaction is missing, every figure derived from it is quietly wrong. The app's answer is that there is no other way to record money — you cannot adjust a total directly, because there is no total to adjust.
2. **It doesn't scale forever.** At around 100,000 transactions this stops being free. The plan for that is in `data-storage.md`, and the first step is loading less rather than storing totals.
3. **Some questions get slower to ask.** "What did I spend in March 2027?" means walking the list. Fine at this size; a real cost at ten times it.

---

## If you had to do it again

### 1. Decide what a fact is, and store only that

`packages/core/src/types.ts` — six entities. Every one of them is something the user did or
decided. None of them is a result.

The test: **could this be worked out from something else I already store?** If yes, it
is not a fact, and storing it creates a second version of a truth.

### 2. Put the calculations somewhere they cannot cheat

`packages/core/src/` is plain TypeScript. No React, no database, no `Date.now()`. It cannot read
the clock or the storage even by accident — ESLint fails the build if it tries.

```ts
export function safeToSpend(snapshot: Snapshot, now: string): SafeToSpend {
  const cycle = cycleAt(snapshot, now)
  const total = subtractMoney(cashLeft(snapshot, cycle), protectedRemaining(snapshot, cycle))
  const days = daysLeft(snapshot.settings, now)
  const perDay = perUnitFloor(total, days)
  ...
}
```

Everything it needs is an argument. That is what makes it testable: you can ask it
about 29 February without waiting for one.

### 3. Make the derived figures cheap to read, not cheap to store

Memoise on the snapshot, as in `state-management.md`. **Caching a calculation is fine.
Storing it is not** — the difference is that a cache is thrown away when the data
changes, and a stored total isn't.

### 4. Then test the property, not just the examples

`packages/core/src/budget/budget.test.ts` — 24 tests. They check the worked day from
`docs/seed-data.md`, and they check the awkward cases: overspending, no plan at all, a
category that rolls over, a cycle one day long.

---

## Where this lives

| File | What's in it |
|---|---|
| `packages/core/src/budget/budget.ts` | Cash left, safe to spend, spending per category. Start here. |
| `packages/core/src/budget/rollover.ts` | What unspent allowance carries into the next cycle. |
| `packages/core/src/debt/debt.ts` | Balances derived from movements — the no-direction-field decision. |
| `packages/core/src/goal/goal.ts` | Progress, and whether you'll hit a target by its due date. |
| `packages/core/src/zakat/zakat.ts` | The zakat estimate. |
| `apps/web/src/store/selectors.ts` | Where those calculations get memoised for the screens. |
| `packages/core/src/types.ts` | The six things that *are* stored. |

## Related

- `state-management.md` — how the derived figures get to the screen without recomputing constantly
- `money.md` — the rounding rule, and why direction is never a minus sign
- `data-storage.md` — what is actually written to the database
- [ADR-001](../adr/ADR-001-reactivity-and-the-data-seam.md) · standard **B3** in `docs/standards/`
