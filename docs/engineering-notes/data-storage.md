# Data storage

*How the app keeps your records on your own device, and why it's IndexedDB.*

## The problem

The app had to work **offline, on a phone, used every day**. So it cannot make a
network call just to show you your own budget — which means the records live on the
device, and something on the device has to store them properly.

## The short version

The app had to work **offline, on a phone, every day**. That means no server call to
read your own budget, which means the data lives on the device. In a browser, the
only storage that holds structured data at size with transactions is **IndexedDB**.
So: IndexedDB — but hidden behind one interface, because the phone app and the server
will each need different storage.

## The words first

| Word | What it means | Where |
|---|---|---|
| **IndexedDB** | A database built into every browser. Lives on the user's own device. | — |
| **Dexie** | A small library that makes IndexedDB pleasant to use. A convenience, not a decision. | `apps/web/src/data/database.ts` |
| **`Repository`** | Our list of allowed operations: list, save, delete. Says *what*, never *where*. | `packages/core/src/repository.ts` |
| **Transaction** (database sense) | A group of writes that all land or none do. Not a money transaction. | — |

### Two files, easy to mix up

| File | What it is |
|---|---|
| `packages/core/src/repository.ts` | **The interface.** The list of operations. No storage code in it. |
| `apps/web/src/data/dexie-repository.ts` | **One implementation of it**, using IndexedDB. |

Screens import the first. They never name the second. The phone app will have
`sqlite-repository.ts` beside it and no screen will notice.

---

## The reasoning, in the order the questions come

### "Where do you store the data?"

IndexedDB, in the browser, on the user's own device.

### "Why? Why not a server?"

Because of what the app was asked to be. From the brief, in the owner's words: *a web
app I can use every day on my phone's browser, **offline***. Single user, manual entry.

Follow that through:

- Used **every day on a phone** → it has to open fast and work on a bad connection.
- **Offline** → it cannot need a network call to show you your own budget.
- **Single user, their own money** → nobody to share with, so no account is needed.

Put together, a server in v1 would have been something to build, pay for and trust, in
exchange for nothing the user had asked for. So: no server, and the data lives on the
device.

**That is the decision everything else follows from.** IndexedDB isn't a preference.
It is what's left once you've decided the data stays on the device.

### "Then why IndexedDB and not something simpler?"

Because once storage is on the device, a browser only offers a few options, and most
are the wrong shape:

| Option | Why not |
|---|---|
| **Cookies** | Sent with every request, a few KB. Built for servers, which we don't have. |
| **`sessionStorage`** | Cleared when the tab closes. The opposite of what's needed. |
| **`localStorage`** | Text only, ~5MB cap, and **no transactions**. |
| **IndexedDB** | Structured records, room to grow, real transactions. ✓ |

`localStorage` is the one worth explaining, because it's the tempting answer:

1. It stores **text only**, so the whole dataset is re-parsed to read one number.
2. It caps around **5MB** — a wall, not a warning.
3. It has **no transactions**, so a write can fail halfway and leave half your records.

The third decided it. Size and speed you can work around. Half-written money data you
cannot, because nothing looks broken: the records and the totals simply disagree, and
both look equally correct.

### "How do you stop that choice spreading through the whole app?"

One interface in the middle, and nothing above it knows what's underneath:

```
Screens          →  Repository              →  IndexedDB   (web, today)
apps/web/src/features/       packages/core/src/repository.ts     apps/web/src/data/dexie-repository.ts
apps/web/src/app/            (the interface)
                                            →  SQLite      (phone, v2)
                                            →  HTTP        (server)
```

**Why bother, when talking to IndexedDB directly would be less code today?** Because a
phone app is planned (v2) and a server is now coming, and neither has IndexedDB. If
every screen knew about it, every screen would need rewriting. This way it is one new
file, and the screens don't change.

**And it's enforced, not agreed.** In `eslint.config.js`, `no-restricted-imports` bans
`dexie` across `src/`, with one override re-enabling it for `apps/web/src/data/`. A boundary
that is only a good intention drifts; this one fails the build.

**The interface is deliberately boring** — get, list, save, delete. No query language,
no live subscriptions. Three different backends have to honour it *honestly*, so the
test for anything new is: could a server do this over HTTP without heroics? If not, it
doesn't go in. Otherwise the interface becomes a promise one backend has to fake, and
everything above it is written against something untrue.

### "What happens when there's a lot of data?"

Today the app reads everything into memory at startup and calculates every figure from
it.

That works because one person's budget is small: a few thousand transactions, under a
megabyte — less than one photo. Reading it takes milliseconds.

**It breaks around 100,000 transactions.** For one household spending 30 times a month
that is roughly 270 years, so it won't happen on its own. Importing a full bank history
could do it.

**The fix, in order:**

1. **Load less** — current cycle, plus one total per past cycle.
2. **Cache the calculated figures** per cycle. A closed cycle can never change.
3. Only then, move work off the main thread.

**Caching is second, not first.** Caching a calculation that takes under a millisecond
gains nothing and adds a new way to be wrong: a stale number that looks correct.

**None of it is built**, deliberately — see above.

---

## If you had to do it again

Three steps. The snippets are cut down to the shape — the files named beside them are
the real thing.

### 1. Declare the tables, and version them from the start

`apps/web/src/data/database.ts`

```ts
this.version(1).stores({
  settings: '',              // a singleton: one row, key kept outside the record
  categories: 'id, sortOrder',
  transactions: 'id, date',  // indexed by date, because that is what we query by
})
```

Two things that are easy to get wrong here:

- **Index only what you query.** An index nothing reads is a write cost with no reader.
- **Declare `version(1)` even when it is the only version.** Dexie replays versions in
  order to bring an old database forward. Without a declared 1, a later `version(2)`
  has no chain to join — you get a fresh schema and no route from the old one. We
  needed this for real when schema 2 added `updatedAt`.

### 2. Write the implementation, and let nothing leak

`apps/web/src/data/dexie-repository.ts`

```ts
categories: {
  async list(): Promise<Category[]> {
    return db.categories.toArray()     // a plain array, not a Dexie Collection
  },
  async put(category: Unstamped<Category>, at: Instant): Promise<void> {
    await db.categories.put(stamp<Category>(category, at))
  },
},
```

The rule: **only domain types cross this line.** No Dexie `Table`, `Collection` or
`PromiseExtended` goes out. If a Dexie type escaped, callers would start depending on
it, and the seam would exist in name only.

### 3. Group writes that must not half-happen

```ts
await db.transaction('rw', [db.categories, db.deletions], async () => {
  await db.categories.delete(id)
  await db.deletions.put({ entity: 'category', id, deletedAt: at })
})
```

Both land or neither does. Here it matters because a row deleted with no tombstone is
a deletion that can never reach another device, and a tombstone with the row still
present is a record contradicting itself. **Either half alone is worse than neither.**

### Then test it against a real database

`fake-indexeddb` gives you a working IndexedDB in tests, so the tests run against
actual database behaviour rather than a mock that agrees with you. That is how the
version 1 → 2 upgrade is tested: build an old database, open it with the new code, and
check the rows survived — see `apps/web/src/data/dexie-repository.test.ts`.

---

## What changed since this was decided

v1 now has a server (ADR-009), so "no server" is no longer true. **The answer here
still is**: the device stays the source of truth and the server is something it syncs
to, because offline turned out to be the selling point rather than a constraint. See
`sync.md`.

## What we store, and what we never store

**Stored:** settings, categories, planned amounts, transactions, debts, goals.

**Never stored:** anything calculable — safe-to-spend, the rent fund total, what you
owe A. Friend, zakat. Worked out fresh every time. Why: `derived-state.md`.

## Where this lives

| File | What's in it |
|---|---|
| `packages/core/src/repository.ts` | The interface. Read this first — it is the whole contract. |
| `packages/core/src/types.ts` | The six entities, and `Snapshot` (everything the app holds). |
| `apps/web/src/data/dexie-repository.ts` | The IndexedDB implementation. |
| `apps/web/src/data/database.ts` | Dexie tables, indexes, and the version 1 → 2 migration. |
| `apps/web/src/data/export-file.ts` | Export files and the migration chain. |
| `apps/web/src/store/snapshot-store.ts` | Holds the snapshot in memory. Every write goes through here. |
| `apps/web/src/data/dexie-repository.test.ts` | 30 tests, including upgrading a database that already exists. |
| `eslint.config.js` | The rule keeping Dexie inside `apps/web/src/data/`. |

## Related

- `derived-state.md` — why calculated figures are never stored
- `import-and-export.md` — getting data out and back in
- `sync.md` — what changes now the device isn't the only copy
- [ADR-001](../adr/ADR-001-reactivity-and-the-data-seam.md) · [ADR-002](../adr/ADR-002-where-core-lives.md) · [ADR-009](../adr/ADR-009-repositioning-v1-hosted-webapp.md)
