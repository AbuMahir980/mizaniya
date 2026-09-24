# Storage — where the money lives

## The words first

| Word | What it means | Where |
|---|---|---|
| **IndexedDB** | A database built into every browser. Lives on the user's own device, not a server. | — |
| **Dexie** | A small library that makes IndexedDB pleasant to use. A convenience, not a decision. | `src/data/database.ts` |
| **`Repository`** | Our list of allowed operations: list, save, delete. Says *what*, never *where*. | `src/core/repository.ts` |
| **Interface** | A promise about shape. Code trusts the promise and never asks who keeps it. | — |

### Two files, easy to mix up

| File | What it is |
|---|---|
| `src/core/repository.ts` | **The interface.** The list of operations. No storage code in it at all. |
| `src/data/dexie-repository.ts` | **One implementation of it**, using IndexedDB. |

Screens import the **first**. They never name the second. That's the whole point: the
phone app will have `sqlite-repository.ts` next to it, and no screen will notice.

## The problem

Someone types in that they earn ₦450,000 on the 25th and starts recording spending.
That has to survive closing the tab, and still be there in six months.

There is no server in v1, so it lives on their device.

## What we do

1. Store everything in **IndexedDB**.
2. Screens never touch it. They call **`Repository`**.
3. Only `src/data/` knows IndexedDB exists.

```
Screens          →  Repository              →  IndexedDB   (web, today)
src/features/       src/core/repository.ts     src/data/dexie-repository.ts
src/app/            (the interface)
                                            →  SQLite      (phone, v2)
                                            →  HTTP        (server)
```

Swap the right-hand column, write one file. No screen changes.

## Why this way

- **The phone app and the server don't have IndexedDB.** If screens knew about it, all of them would need rewriting.
- **It's enforced, not agreed.** ESLint fails the build if anything outside `src/data/` imports Dexie. In `eslint.config.js`: `no-restricted-imports` bans `dexie` across `src/`, and one override re-enables it for `src/data/**/*.ts`.
- **The interface is boring on purpose.** No query language, no live subscriptions. Three different backends must honour it honestly. Rule: *could a server do this over HTTP?* If no, it doesn't go in.

## Why not the alternatives

| Option | Why not |
|---|---|
| **`localStorage`** | Text only, ~5MB cap, and **no transactions** — a write can fail halfway and nothing looks broken. |
| **A server** | v1 has none by design. The app works offline, no account needed. |
| **IndexedDB straight from screens** | Less code today. Rewrite every screen at v2. |

The `localStorage` row is the one that matters. Size and speed you can work around.
Silent half-written money data you cannot.

## When there's a lot of data

**Today:** read everything into memory at startup, calculate every figure from it.

That works because one budget is small — a few thousand transactions, under a
megabyte. Smaller than one photo.

**Breaks at:** ~100,000 transactions. For one household that's ~270 years, so it
won't happen by itself. A full imported bank history could do it.

**Fix, in this order:**

1. Load less — current cycle plus a total per past cycle.
2. Cache the calculated figures per cycle. A closed cycle can't change.
3. Only then, move work off the main thread.

**Caching is step 2, not step 1.** Caching a calculation that takes under a
millisecond gains nothing and adds a new way to be wrong: a stale number that looks
correct.

**Not built.** On purpose — see above.

## What we store, and what we never store

**Stored:** settings, categories, planned amounts, transactions, debts, goals.

**Never stored:** anything calculable. Safe-to-spend, the rent fund total, what you
owe A. Friend, zakat. All worked out fresh.

Why: see `derived-state.md`.

## Say it out loud

> Storage sits behind one interface, so screens never learn where data lives. That's
> what lets the same code run on IndexedDB in a browser and SQLite on a phone. ESLint
> fails the build if the storage library leaks out of its folder.

If they push on scale:

> Under a megabyte, so I load it once and calculate from memory. It breaks around
> 100,000 transactions, and the fix is to load less before it's to cache more. I
> didn't build caching — it would only add a way for a correct number to go stale.

## Where this lives

| File | What's in it |
|---|---|
| `src/core/repository.ts` | The interface. Read this first — it is the whole contract. |
| `src/core/types.ts` | The six entities, and `Snapshot` (everything the app holds). |
| `src/data/dexie-repository.ts` | The IndexedDB implementation of the interface. |
| `src/data/database.ts` | Dexie tables, indexes, and the version 1 → 2 migration. |
| `src/data/export-file.ts` | Reading and writing export files, and the migration chain. |
| `src/store/snapshot-store.ts` | Holds the snapshot in memory. Every write goes through here. |
| `src/data/dexie-repository.test.ts` | 30 tests, including the upgrade of a database that already exists. |
| `eslint.config.js` | The rule that keeps Dexie inside `src/data/`. |

## Related

- `derived-state.md` — why calculated figures are never stored
- `import-and-export.md` — getting data out and back in
- `sync.md` — what changes now the device isn't the only copy
- [ADR-001](../adr/ADR-001-reactivity-and-the-data-seam.md) · [ADR-002](../adr/ADR-002-where-core-lives.md)
