# Sync

*Decided, not built. What happens when the data exists in more than one place.*

> **Status: not built.** The model is decided ([ADR-010](../adr/ADR-010-sync-model.md)) and
> the groundwork is in — every record now carries `updatedAt`, and deletions leave
> tombstones. No sync code exists yet.

## The problem

Everything else in these notes assumes one copy of the data, on one device. That
assumption ends when someone uses their phone and their laptop.

Two copies have to agree. And the hard part is not sending data back and forth — it's
deciding what to do when the two copies **disagree**.

## The short version

The device stays the source of truth and the server is something it syncs to, because
working offline is the point of the app rather than a limitation. Records carry a
"last changed" time, so the later edit wins. Deletions leave a marker behind, because
otherwise they can't travel. And when two *people* disagree about a shared budget, the
app asks them instead of picking silently.

## The words first

| Word | What it means | Where |
|---|---|---|
| **Source of truth** | Which copy wins if two disagree. Here: the device. | — |
| **Sync target** | A place a device sends changes to and reads changes from. Not the boss. | — |
| **Last-write-wins** | The simplest rule: the most recently changed version wins. | — |
| **Tombstone** | A record that something used to exist. What's left behind by a delete. | `packages/core/src/types.ts` |
| **Conflict** | Two copies changed the same thing, independently. | — |

---

## The reasoning, in the order the questions come

### "Is the server in charge, or the device?"

The device. The server is somewhere it syncs to.

The alternative — server in charge, device as a cache — is genuinely simpler. One copy of
the truth, no merging, no conflicts. It's how most apps work.

We didn't, for a product reason rather than a technical one: **budgeting only works if
spending is recorded at the moment it happens.** In a queue, at a fuel station,
immediately after paying. That is precisely when the signal is worst. An app that refuses
the entry teaches people to stop entering, and **a budget nobody updates is worse than no
budget** — it reports a comfortable figure for what's left, and that figure is wrong.

### "Doesn't that make it much harder?"

Less than you'd expect, because of two decisions made long before sync was on the table.

**Nothing derived is stored** (`derived-state.md`). Every money figure — safe-to-spend,
the rent fund total, what you owe A. Friend — is calculated, not saved. So two devices can
never disagree about a *total*. They both do the same arithmetic over the same records and
get the same answer.

**Sync moves facts, never results.** That removes the entire category of "whose total is
right?"

And the records themselves are mostly harmless to merge:

| What | Can two devices really clash? |
|---|---|
| Transactions | **Almost never.** Each has its own id. Two devices adding movements just end up with both. This is the bulk of the data and it merges for free. |
| Debts, goals | Rarely, and only on details like terms or witnesses. Balances are derived. |
| Categories | Rarely. Later edit wins, which matches what anyone would expect. |
| Settings | Rarely. One owner, and the last answer is the one they meant. |
| **Planned amounts** | **This is the one.** Both devices setting this cycle's Food budget is a real clash. |

One row type and one singleton, against a log that merges by construction.

### "Why did records need `updatedAt` added?"

Because without it, last-write-wins has nothing to compare. There was no record of when
anything last changed — so "which of these two versions is newer?" was unanswerable.

### "And why do deletions need a marker?"

This is the part that surprises people, and it's worth being able to explain.

With one database, deleting means removing the row. Done.

With two, consider: your phone has Food, Rent. Your laptop has Food, Transport, Rent.

Did the phone **delete** Transport, or has the phone simply **not heard about it yet**?

Those two situations look absolutely identical. There is no information anywhere that
distinguishes them. So a sync does the safe thing and adds the row back — and the deleted
category reappears. Delete it again and it comes back again.

The fix is that deleting leaves a marker: *category `c-transport`, deleted at 15:42*. Now
the phone can say "I didn't miss it, I deleted it, here's when" — and the laptop removes it
too.

**Those markers live in their own table, not as a column on each record.** A column would
put deleted rows into the snapshot, and then every calculation would have to remember to
skip them — and the one that forgot would count deleted money. See `data-storage.md`.

### "What happens when two people disagree?"

For one person on two devices, **later edit wins**. They made both edits; the last one is
what they meant. Asking them to arbitrate with themselves would be noise.

For two people sharing a household budget, later-wins is **not acceptable**. Your wife sets
Food to ₦35,000, you set it to ₦40,000, and hers silently vanishes. Nobody is told.

So for shared budgets the app **keeps both and asks**:

> You set Food to ₦40,000. Your wife set it to ₦35,000. Do you agree to this?

That isn't a softer version of conflict resolution, it's a sounder one. A shared household
budget **is an agreement between two people** — so a disagreement about it is a conversation,
not a data problem for a timestamp to settle behind their backs.

It does change what sync has to do: **keep both values** rather than resolve on arrival. A
conflict stops being something to fix instantly and becomes state the app holds — both
amounts, who set each, and when — until a person settles it.

### "What's still undecided?"

Two things, honestly:

1. **How long markers are kept.** Keep them forever and the table grows without limit. Expire them after 90 days and a device offline longer than that resurrects everything it deleted. A number has to be picked, and what happens to a long-absent device written down.
2. **Clock skew.** Phones lie about the time. Last-write-wins that trusts a phone's clock is a bug waiting for one traveller crossing a timezone. The plan is that the client's timestamp records *intent* while a server-assigned sequence decides *order*.

### "What has to be true before any of this is written?"

- ~~Rule 7~~ — **binding from 25 September.** One clause lands on sync directly: *deleting means the data is actually gone, not hidden.* A tombstone satisfies sync and does **not** satisfy someone asking to be erased, so both have to be built and the rule says which wins.
- The endpoint spec, which is where the two open questions above get settled.
- The design for the sync indicator and the conflict screen — this is user-visible, not just plumbing.

---

## What's already in place

| Done | Where |
|---|---|
| `updatedAt` on every record | `packages/core/src/types.ts` |
| Tombstones, in their own table | `packages/core/src/types.ts`, `apps/web/src/data/database.ts` |
| Writes stamp the time; imports preserve it | `packages/core/src/repository.ts` |
| Schema migration 1 → 2, and an old file still imports | `apps/web/src/data/export-file.ts` |
| A test that upgrading an existing database keeps the records | `apps/web/src/data/dexie-repository.test.ts` |

**Why this was built before sync:** adding a column is easy while the only data in
existence is the owner's own. Once real people have budgets, the same change is a migration
that has to be right for all of them, and getting it wrong corrupts records.

## Related

- `derived-state.md` — why totals can't disagree
- `data-storage.md` — the interface a sync implementation slots behind
- `import-and-export.md` — replacing everything, which is the problem sync *doesn't* solve
- [ADR-010](../adr/ADR-010-sync-model.md) — the decision · [ADR-009](../adr/ADR-009-repositioning-v1-hosted-webapp.md) — why there's a server at all
