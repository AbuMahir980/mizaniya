# State management

*How the app holds what it knows while it's running, and why a failed save can't lie to you.*

## The problem

Several screens show the same numbers. Home shows what's safe to spend today. Plan
shows what's allocated to Food. Debts shows what you still owe A. Friend.

They all come from the same records. So if each screen fetched and kept its own copy,
they would drift apart — and the user would see two different answers to the same
question with no way to tell which was right.

On top of that: saving can fail. The database can reject a write. **What should the
screen show while that's happening, and what should it show if it fails?**

## The short version

One store holds one copy of everything, in memory. No screen keeps its own copy, and
no calculated figure is ever stored — every number is worked out from that one copy
when it's needed. Writes go **to the database first and to memory second**, so if a
save fails the screen still shows what's actually stored.

## The words first

| Word | What it means | Where |
|---|---|---|
| **State** | What the app knows right now, while running. Gone when you close the tab. Different from storage, which survives. | `src/store/` |
| **Store** | The one place state lives. Screens read from it and never hold their own copy. | `src/store/snapshot-store.ts` |
| **Zustand** | A small library (~1KB) for holding state and letting components subscribe to parts of it. | `src/store/snapshot-store.ts` |
| **Snapshot** | Every record the app holds, as one object: settings, categories, plans, transactions, debts, goals. | `src/core/types.ts` |
| **Selector** | A function that works out one figure from the snapshot. Safe-to-spend is a selector. | `src/store/selectors.ts` |
| **Memoise** | Remember the last answer, and skip the work if nothing changed. | `src/store/selectors.ts` |
| **Re-render** | React redrawing a component. Too many is what makes a phone feel slow. | — |

---

## The reasoning, in the order the questions come

### "How do you manage state?"

One Zustand store, holding one snapshot of every record. Screens subscribe to it.
Every figure shown is calculated from it on demand.

### "Why one store and not per-screen state?"

Because the same figures appear on several screens, and separate copies drift. If Home
holds its own transaction list and Quick Add adds one, Home is wrong until something
tells it. That "something" is the bug.

One copy means there is nothing to synchronise, so there is nothing to get wrong.

### "Why does it hold *everything*? Isn't that wasteful?"

It would be for most apps. Here the arithmetic makes it the right call: one person's
budget is a few thousand transactions, under a megabyte. Holding all of it costs less
memory than a single photo.

And it buys something specific — **no loading states in the middle of the app**. The
data is already there, so moving between screens never shows a spinner. You only wait
once, at startup.

### "Why Zustand and not Redux, or just Context?"

| Option | Why not |
|---|---|
| **`useState` in each component** | The drift problem above. |
| **Context + `useReducer`** | No dependency, which is genuinely nice. But one snapshot in one context **re-renders every consumer on every change**. Change the Food budget and every screen reading the context redraws. Noticeable on a phone. |
| **Redux Toolkit** | Works fine. More ceremony — actions, reducers, slices — than one person's budget warrants. |
| **React Query / SWR** | These solve *server* data: caching, revalidating, refetching. There is no server in v1 and the data is local. There is nothing to cache and nothing to revalidate. |
| **Zustand** | ~1KB, no provider needed, components subscribe to the specific slice they use, and it works unchanged in React Native for v2. ✓ |

The deciding factor was the third column of that Context row: **subscriptions, not
broadcasts.** A component that reads safe-to-spend should redraw when safe-to-spend
changes, not when anything anywhere changes.

### "How do you know what's loaded and what isn't?"

The state is one of five things, and never a mix:

```ts
type SnapshotState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'new-owner' }      // nothing stored yet — go to onboarding
  | { status: 'ready'; snapshot: Snapshot }
  | { status: 'error'; message: string }
```

**Why a union rather than a snapshot plus a couple of flags?** Because with flags you
can write `isLoading: false, snapshot: undefined` and have to guess what that means.
Here, `snapshot` only exists on `ready` — so **code that forgets the other four cases
does not compile.** And `new-owner` is a real state the UI has to handle, rather than
an empty value someone skips past with a falsy check.

### "What happens when a save fails?"

This is the decision worth knowing, because the fashionable answer is the wrong one
here.

The fashionable answer is **optimistic UI**: update the screen immediately, save in
the background, roll back if it fails. It feels instant. Most apps do it.

This app does the opposite — **storage first, memory second**:

```ts
try {
  await toStorage(repository)      // database first
} catch (error) {
  return { ok: false, message }    // memory deliberately untouched
}
set({ status: 'ready', snapshot: toMemory(latest.snapshot) })
notifier.announce()                // only after both
```

**Why give up the instant feel?** Because of what the two failures look like.

- Optimistic: the save fails, the screen shows ₦40,000 allocated to Food, the database says ₦35,000. The user believes the first. Nothing in the app can tell they disagree.
- This way: the save fails, the screen still shows ₦35,000, and the user is told it didn't save.

For a chat app, optimistic is right — a message that fails to send is obvious and
cheap. For money, a screen showing a figure the database doesn't have is the worst
kind of bug: **silent, and trusted.**

The waiting cost is a few milliseconds against a local database. It is not felt.

### "Anything subtle in that write path?"

One thing, and it took a real bug to see. The snapshot is **re-read after the await**,
not reused from before it:

```ts
const latest = store.getState().state   // not the snapshot captured earlier
if (latest.status === 'ready') {
  set({ status: 'ready', snapshot: toMemory(latest.snapshot) })
}
```

An awaited write leaves a gap. Another write can land inside it. Applying the change
to the snapshot captured *before* the await would silently throw away whatever
happened during it.

### "How do you avoid recalculating everything constantly?"

Selectors memoise on **snapshot identity**:

```ts
if (snapshot === lastSnapshot && key === lastKey) return lastResult
```

The store replaces the snapshot object on every write, so a different object means
something genuinely changed. Recording one expense does not recompute the screens it
didn't touch.

**Identity, not deep equality** — comparing the whole dataset field by field would cost
more than the recalculation it was trying to avoid.

### "Two tabs open?"

Each tab has its own memory, so a write in one would leave the other stale. After a
successful write the store broadcasts, and the other tab re-reads from storage.

Note the order in the code above: **announce last.** A tab told to reload before the
write committed would read the old data and believe it was current.

---

## If you had to do it again

### 1. Put the state in one store, shaped as a union

`src/store/snapshot-store.ts`

```ts
const store = createStore<{ state: SnapshotState }>(() => ({ state: { status: 'idle' } }))
```

Make the impossible combinations impossible to write, rather than documenting them.

### 2. Route every change through one function

```ts
write(
  toStorage: (repository: Repository) => Promise<void>,   // how it is saved
  toMemory:  (snapshot: Snapshot) => Snapshot,            // the same change, in memory
): Promise<WriteResult>
```

Two descriptions of one change, and **the ordering is enforced in one place** rather
than remembered at every call site. There is no second path that writes, so there is
no path that gets the order wrong.

It returns a result instead of throwing, so a caller cannot forget to handle failure.

### 3. Derive figures, never store them

`src/store/selectors.ts` — seven selectors, each memoised on snapshot identity. None of
them writes anything.

```ts
export const selectSafeToSpend = counted((snapshot, now: IsoDate) => safeToSpend(snapshot, now))
```

If a figure can be calculated, calculate it. A stored total and the records behind it
can drift, and when they do both look equally correct. See `derived-state.md`.

### 5. Make the memoisation provable, not assumed

That `counted` wrapper is not decoration. It increments a counter every time a selector
*actually recomputes*:

```ts
export const recomputes = { count: 0 }
```

So a test can assert that reading the same figure twice recomputed **zero** times
(`snapshot-store.test.ts`, *"recomputes only when the snapshot changes"*). Without it,
memoisation is invisible: it either works or silently doesn't, every number is still
correct either way, and the only symptom is a phone getting warm.

This is the same rule this project keeps relearning — **a check that has only ever
passed is indistinguishable from one that is switched off.** Here the fix was to make
the behaviour observable so a test could look at it.

### 4. Subscribe narrowly in React

`src/app/store-context.tsx`

```ts
return useStore(bundle.store, (s) => s.state)
```

Components read the slice they need. Actions are handed out separately from state, so
a component that only *writes* doesn't re-render when state changes.

---

## What changed since this was decided

Nothing yet, but sync will touch this. The server is a sync target and the device stays
the source of truth (ADR-010), so the store keeps its shape — but there will be a new
status to show ("last synced"), and conflicts on a shared household budget become state
the app holds rather than something resolved silently. See `sync.md`.

## Where this lives

| File | What's in it |
|---|---|
| `src/store/snapshot-store.ts` | The store, the union, and the one `write` path. Read this first. |
| `src/store/selectors.ts` | The seven derived figures, the memoising, and the recompute counter. |
| `src/app/store-context.tsx` | The React binding — `useSnapshotState`, `useSnapshotActions`. |
| `src/store/create-app-store.ts` | Wires store, repository and cross-tab notifier together. |
| `src/store/import-export.ts` | The one flow that replaces everything at once. |
| `src/store/snapshot-store.test.ts` | The failed-save case (storage rejects, memory must not change) and the recompute assertion. |

## Related

- `data-storage.md` — where the records live when the app isn't running
- `derived-state.md` — why no calculated figure is ever stored
- `sync.md` — what a second copy changes
- [ADR-001](../adr/ADR-001-reactivity-and-the-data-seam.md) — one snapshot in memory · [ADR-006](../02-architecture.md) — why Zustand
