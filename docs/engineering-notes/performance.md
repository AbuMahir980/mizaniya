# Performance

*Deliberately not built. Where it would break, what we'd do, and why doing it now would be a mistake.*

> **Status: nothing built, on purpose.** No caching layer, no pagination, no virtualised
> lists, no web workers. This note exists so that's a decision rather than an oversight.

## The problem

The app holds every record in memory and recalculates every figure from scratch whenever a
screen needs one. No caching of results to storage, no incremental totals, no pagination.

Stated like that it sounds careless. It's the correct choice at this size, and the useful
skill is being able to say **why**, and **exactly when it stops being true.**

## The short version

One person's budget is under a megabyte, so loading it takes milliseconds and recalculating
from it is cheaper than the screen redraw that follows. It stays true to roughly 100,000
transactions. Past that the fix is to **load less** before it is to **cache more** — and
caching a calculation that takes under a millisecond only adds a way for a correct number
to go stale.

## The words first

| Word | What it means |
|---|---|
| **Memoise** | Remember the last answer in memory; skip the work if nothing changed. Thrown away freely. |
| **Cache** | Same idea, kept longer — often written to storage. Can go stale, which is the risk. |
| **Paginate** | Load a page at a time instead of everything. |
| **Virtualise** | Render only the rows currently on screen, however long the list. |
| **Main thread** | Where the browser runs your code *and* draws the screen. Block it and the app freezes. |

---

## The reasoning, in the order the questions come

### "How much data is there, really?"

Worth doing the arithmetic out loud, because it's the whole argument.

One household, spending maybe 30 times a month. Each transaction is an id, a date, a type,
an amount and a category — a few dozen bytes. Over three years that's about a thousand
records; over ten, three and a half thousand.

**Comfortably under a megabyte. Smaller than a single photo.**

Reading it from IndexedDB is a few milliseconds. Adding up a list that size is well under
one. The screen redraw that follows is slower than the calculation that fed it.

### "So what makes the app feel fast today?"

Two things, and neither is a performance feature:

**Everything is already in memory.** The data is read once at startup, so moving between
screens never fetches anything. There are no loading spinners inside the app — not because
they're optimised away, but because there's nothing to wait for.

**Figures are memoised on the snapshot object.** Recording one expense produces a new
snapshot, so anything that depends on it recalculates and everything else returns its last
answer. One line:

```ts
if (snapshot === lastSnapshot && key === lastKey) return lastResult
```

Identity, not deep equality — comparing the whole dataset field by field would cost more
than the recalculation it was avoiding.

And there's a counter proving it works: `recomputes.count`, asserted in
`snapshot-store.test.ts`. Without it, memoisation either works or silently doesn't, every
figure is correct either way, and the only symptom is a warm phone. See
`state-management.md`.

### "When does this stop working?"

**Around 100,000 transactions.** For one household at 30 a month that's roughly 270 years,
so it will not arrive on its own.

It could arrive two ways:

1. **Bank imports.** Reading a full history across several accounts, going back years, is plausible once bank sync exists — and it's the realistic route.
2. **Household sharing.** Several people's movements in one budget multiplies the count.

Neither is a gradual creep. Both arrive in a lump, which is a mild argument for having the
plan written down before they do.

### "What would you do, in what order?"

**1. Load less.** Keep the current cycle in memory, plus one total per past cycle, instead
of every row since 2026. The `Repository` interface already allows a ranged read
(`transactions.list(range)`), so this is a change inside `src/data/` and the store — no
screen touches it.

**2. Cache the calculated figures, per cycle.** A closed cycle can never change, so its
totals only ever need working out once. This is where caching earns its place, because the
input is genuinely immutable.

**3. Virtualise the long lists.** A transaction list with 100,000 rows shouldn't put 100,000
elements in the DOM regardless of how fast the arithmetic is.

**4. Only then, move work off the main thread.** A web worker is the heaviest option and the
last one: it means the calculations can no longer be called synchronously, which changes
every selector's shape.

### "Why is caching second and not first?"

Because caching is the answer people reach for first and it's usually the wrong one.

**A cache only helps if the thing it replaces is expensive.** Safe-to-spend takes under a
millisecond. Caching it saves nothing measurable — and adds a new failure mode: a stored
figure that no longer matches the records it came from. Every number still looks correct.
Nothing errors.

That is precisely the bug `derived-state.md` exists to prevent, reintroduced in the name of
speed nobody could perceive.

**Loading less is different in kind.** It reduces the work rather than remembering its
result, so there is no stale copy to be wrong. Fix the input before you memorise the output.

### "Isn't it risky to not have built any of this?"

Less risky than having built it. Three reasons:

**The seam is already there.** `Repository` allows ranged reads, and the screens know
nothing about storage. Steps 1 and 2 are changes behind an interface that already exists —
not a rewrite. The architecture left room without paying for the room.

**Premature machinery is a real cost, not a hypothetical one.** A caching layer for a
megabyte of data would be code to maintain, a new class of staleness bug, and harder
debugging — in exchange for nothing a user could feel.

**And it's a signal, honestly read.** Someone technical looking at a caching layer serving
40 users concludes the author can't tell what matters. A written note saying *"here's where
it breaks, here's the order I'd fix it, here's why I haven't"* concludes the opposite.

### "What have you actually measured?"

Being straight about this: **not much, and that's a gap.** What exists is the recompute
counter, which proves memoisation works but says nothing about wall-clock time. There is no
benchmark, no profile, no measurement at 10,000 or 100,000 records.

The figures in this note are arithmetic — record count times record size — not measurements.
That's sound reasoning for the order of magnitude and it is **not** the same as having
looked.

**The honest first step, before any of the four above:** generate 100,000 transactions and
time it. The plan might be wrong. It would be better to find out from a profile than from a
user.

---

## Where this lives

| File | What's in it |
|---|---|
| `src/store/selectors.ts` | The memoising, and the recompute counter. |
| `src/store/snapshot-store.test.ts` | The test asserting memoisation actually happens. |
| `src/core/repository.ts` | `transactions.list(range)` — the ranged read step 1 would use. |
| `src/core/budget/budget.ts` | The calculations in question. |

## Related

- `derived-state.md` — why the figures are calculated rather than stored
- `state-management.md` — the memoising, in context
- `data-storage.md` — the megabyte argument, and where it came from
