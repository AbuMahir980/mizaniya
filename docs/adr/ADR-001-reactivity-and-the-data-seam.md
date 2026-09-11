# ADR-001: Reactivity and the data seam

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-10 |
| **Deciders** | Qudus Lawal (stakeholder and owner) |

---

## Context

Nothing derived is stored. Cash left, safe-to-spend, category variance, the
projected gap and the zakat estimate are all recalculated from the transaction
list, the plan and today's date — standard **B3**, and the reason the app can be
trusted at all.

That turns the whole architecture into one question: **when a transaction is
saved, how do the screens showing those calculations find out?**

Three constraints bear on the answer:

- **A4** — screens call a repository, never a storage engine. Swapping local
  storage for an API must touch one folder.
- **v2 and v3 are stated goals.** The same `core/` runs on Expo with SQLite, and
  later against an HTTP API. Anything welded to Dexie is rewritten twice.
- **The dataset is tiny.** One person's budget is a few thousand transactions
  across several years — comfortably under a megabyte.

That last fact is what makes the simplest option viable rather than naive.

---

## Decision

**Hold the entire dataset in memory as one snapshot. Derive every figure from it
with pure `core/` functions through memoised selectors. Keep `Repository` as
plain async CRUD.**

Every write follows one path, in this order:

1. `Repository.put(...)` — **IndexedDB is written first**
2. the snapshot is updated — **only if the write resolved**
3. selectors recompute
4. subscribed screens render

Storage before memory, always. If the write fails, the snapshot is untouched and
the UI reports the failure. The screen and the database cannot end up
disagreeing.

A `BroadcastChannel` message after each successful write tells other open tabs
to reload their snapshot.

---

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **A · In-memory snapshot + plain CRUD repository** *(chosen)* | `core/` stays pure and trivially testable; `Repository` is portable to SQLite and HTTP unchanged; recomputation is instant at this data size; one obvious path for every write | The whole dataset is loaded at startup; the snapshot could drift from storage if writes were ordered carelessly — which the write order above prevents |
| **B · Dexie `liveQuery` in components** | Almost no code; reactivity handled by the library; no manual invalidation | **Breaks A4** — the storage engine reaches into every component. Neither SQLite nor an HTTP API has an equivalent, so every screen is rewritten at v2. Couples the UI to the one thing the repository exists to hide |
| **C · Repository exposes observables, Dexie `liveQuery` underneath** | Keeps A4 intact; reactivity is real; the UI depends only on the interface | The interface now promises push updates. v3's HTTP implementation cannot deliver that without polling or a socket, so the contract would be honoured in name only. A larger surface to port for a benefit option A already provides |
| **D · Refetch everything from the repository after each write** | No snapshot to keep in step; storage is the single source of truth | A database round trip on every keystroke-scale interaction; the async gap makes the UI feel slower than the data is; still needs somewhere to hold the result, which is option A with extra steps |

---

## Trade-off Analysis

Option B is what most tutorials would reach for, and it is genuinely the least
code today. It is rejected on cost of ownership rather than on style: the
project has already committed to two more implementations of the same data seam,
and `liveQuery` is the one construct that does not survive either of them. A
choice that saves a day now and costs a full screen-by-screen rewrite at v2 is
not a saving.

Option C looks like the principled compromise and is the more dangerous choice,
because the leak is hidden. An interface that promises push updates is honest
only while something can push. When v3 arrives, the HTTP implementation either
polls — quietly, wastefully — or returns a subscription that never fires. Both
failures are silent.

Option A is chosen because the small data size makes the simple thing correct.
Recomputing every figure from scratch on every change would be indefensible over
a large dataset; over one person's budget it is imperceptible, and it buys a
system where a displayed figure *cannot* be stale.

---

## Consequences

### Positive

- Every derived figure is a pure function of `(snapshot, now)` — testable with
  plain values, no mocks, no database, no React.
- `Repository` stays boring enough to reimplement over SQLite or HTTP without
  redesign.
- A stale figure on screen becomes structurally impossible rather than a bug
  class to watch for.
- The write ordering makes a failed save visible instead of leaving the screen
  and the database disagreeing.
- Multi-tab drift is closed by one `BroadcastChannel` message.

### Negative / trade-offs

- The whole dataset loads at startup. Fine now; revisit if a decade of daily
  records ever makes it noticeable.
- Selectors must be memoised deliberately, or a large recompute runs on every
  keystroke. This is a real discipline, not a free win.
- Some `liveQuery` convenience is given up in exchange for portability.
- The store becomes the one place that must be got right — every write goes
  through it, so its ordering rule is load-bearing and belongs in a test.

---

## Action Items

1. [ ] Define `Repository` as plain async CRUD in API CONTRACT — no observables, no Dexie types across the line.
2. [ ] Enforce **A4** with `import/no-restricted-paths`: nothing outside `data/` may import Dexie.
3. [ ] Implement the store's single write path, and test the ordering — a rejected repository write must leave the snapshot unchanged.
4. [ ] Add the `BroadcastChannel` reload and a test for two-tab drift.
5. [ ] Memoise selectors from the start; add a test that a Quick Add does not recompute unrelated screens.

---

## Related ADRs

- [ADR-002 — Where `core/` lives](ADR-002-where-core-lives.md)
- ADR-003 — Time is a parameter (inline in [docs/02-architecture.md](../02-architecture.md))
- ADR-006 — Zustand as the single client store (inline)
