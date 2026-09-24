# ADR-010: The sync model — local-first with the server as sync target

| Field | Value |
|-------|-------|
| **Status** | **Accepted** — 2026-09-24 |
| **Date** | 2026-09-24 |
| **Deciders** | Qudus Lawal (stakeholder and owner) |

---

## Context

[ADR-009](ADR-009-repositioning-v1-hosted-webapp.md) puts a server in v1. The
question it leaves open is the one the architecture document already called *"the
first genuinely hard problem this project will have"*: **is the server the source
of truth with the local database as a cache, or does the local database stay
authoritative and sync to the server?**

This is not only an engineering choice. It is design-visible — it decides whether
every screen needs an offline state and a sync indicator drawn — so it comes
before the design brief.

### The fact that makes this easier than it looks: derived state is never synced

Every money figure in Mizaniya is **derived, not stored**. Safe-to-spend,
rollover, projected gap, the debt balance and zakat are all computed from rows.
Two existing decisions make that derivation deterministic:

- **[ADR-003](../02-architecture.md) — time is a parameter.** `core/` never reads
  the clock; `now` is passed in. The same inputs give the same answer anywhere.
- **[ADR-004](../02-architecture.md) — money is integer kobo.** No floating-point
  drift, so client and server cannot disagree by a fraction.

`Debt` makes the point sharpest: it deliberately has **no direction field**,
because the balance is derived from transactions and may legitimately cross zero
(D9, a rotating ajo). There is no stored figure to merge.

**So sync moves facts and never derivations.** Nothing has to reconcile two
different values of safe-to-spend; both sides recompute it from the same rows and
necessarily agree.

### The conflict surface, entity by entity

| What | Shape | Can two devices really conflict? |
|---|---|---|
| `Transaction[]` | Append-mostly log, UUID keyed, has `createdAt` | **Almost never.** Two devices adding movements *union* — different ids, no overlap. This is the bulk of the data and it merges for free |
| `Debt[]` · `Goal[]` | One long-lived row per counterparty / goal; balances derived | Rarely, and only on metadata — `terms`, `witnesses`, `closedAt` |
| `Category[]` | Id'd rows: add, rename, archive | Rarely; per-row last-write-wins matches expectation |
| `Settings` | Singleton — `takeHome`, `salaryDay` | Rarely; single owner, and the last answer is the one they meant |
| `PlanEntry[]` | `(cycleStart, categoryId) → planned` | **This is the one.** Two devices setting this cycle's Food budget is a real collision, and last-write-wins means one edit silently disappears |

One contentious row type and one singleton, against a log that merges by
construction. That is an unusually friendly shape for local-first sync.

### The blocker nobody has noticed yet

**No entity carries `updatedAt`, `deletedAt`, or any revision counter.** Only
`Transaction` has `createdAt`; a grep across `src/` for the others returns
nothing. Two consequences:

1. **Last-write-wins cannot be implemented at all** — there is nothing to compare.
2. **A delete can never propagate.** Device A deletes a category, device B still
   has it, and the next sync *resurrects it*. Deletion currently leaves no trace
   for anything to observe.

This is a schema change to every entity and therefore a migration:
`SCHEMA_VERSION` 1 → 2 with a step in the [ADR-005](../02-architecture.md) chain.
It is cheap now, while the only database in existence is the owner's, and it is
expensive after real users have data.

Adding `updatedAt` does **not** violate ADR-003. `types.ts` already reserves
`Instant` for *"bookkeeping — never for anything a cycle calculation reads"*,
which is exactly what a sync timestamp is.

---

## Decision

**Local-first. IndexedDB stays authoritative for the device; the server is a sync
target, not the source of truth.** Per-row last-write-wins, with tombstones for
deletes and the server providing the ordering.

**Chosen on a product argument, not a technical one.** The stakeholder's reason,
2026-09-24: *offline is the selling point of the app.* And it holds up — budgeting
only works if spending is recorded **at the moment it happens**, in a queue, at a
fuel station, immediately after paying, which is exactly when the connection is
worst. An app that refuses the entry teaches people to stop entering, and **a
budget nobody updates is worse than no budget**: it reports a comfortable figure
for what is left, and that figure is wrong. The offline guarantee is not a
technical nicety here, it is the thing that makes the numbers true.

Three parts:

1. **Every entity gains `updatedAt: Instant` and soft deletion** (`deletedAt`, or
   a deletions table — decided in the endpoint spec, not here). Migration to
   `SCHEMA_VERSION` 2.
2. **The client proposes, the server orders.** Client clocks lie, so `updatedAt`
   records *intent* while a server-assigned monotonic sequence decides *order*.
   Last-write-wins that trusts a phone's clock is a bug waiting for one traveller
   crossing a timezone.
3. **The HTTP `Repository` implementation wraps the local one** rather than
   replacing it. Writes land locally first and the UI never waits on the network —
   which is what ADR-001's in-memory snapshot already assumes.

### What this does not solve, and must not pretend to

**Household sharing changes the stakes, and the answer is to ask, not to merge.**
One owner on two devices losing a plan edit to last-write-wins is tolerable — they
made both edits, and the later one is what they meant. A spouse's edit vanishing
silently is a different thing entirely.

The stakeholder's resolution, 2026-09-24, and it is better than the technical
default: **surface the disagreement to the two people and let them settle it.**
*"You set Food to ₦40,000; your wife set it to ₦35,000. Do you agree to this?"* —
and on agreement it updates.

This is not a softer version of conflict resolution; it is a different and
sounder one. A shared household budget is **an agreement between two people**, so
a disagreement about it is a conversation, not a data-integrity problem to be
resolved behind their backs by a timestamp. It also happens to be easier to
reason about than any silent merge rule.

What it requires, and the requirement is the interesting part: **the sync must
keep both values.** A conflict stops being something to resolve on arrival and
becomes a piece of state the app stores and shows — both amounts, who set each,
and when — until a person settles it. Nothing is overwritten in the meantime.

So there are deliberately **two rules, because these are two different
situations**:

| Situation | Rule |
|---|---|
| One person, two devices | **Last write wins.** They made both edits; the later one is what they meant. No prompt — being asked to arbitrate with yourself is noise |
| Two people, one shared budget | **Keep both and ask.** Neither value is discarded until someone agrees |

Design consequence, into ADR-009's brief: this needs a notification and a
resolution screen, and copy that reads as two people agreeing rather than the
software refereeing.

**Tombstones need a retention policy.** Keep them forever and the table grows
without bound; expire them at 90 days and a device offline longer than that
resurrects everything it deleted. The endpoint spec picks a number and says what
happens to a device that has been away longer.

---

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Local-first, server as sync target** *(chosen)* | Keeps the offline story, which matters on a Nigerian mobile connection and is currently a selling point; ADR-007 and D14 stay true; writes never wait on the network; the local implementation stays live code rather than becoming a dead seam; the conflict surface is genuinely small | Merge logic to build and test; needs the schema migration above; last-write-wins is honest for one owner but not for a household |
| **Server authoritative, local as cache** | Much simpler — one source of truth, no merge logic, no tombstones, no clock problem; the conventional shape every backend tutorial teaches | Gives up offline writes and therefore the local-first identity; the app stops working in a lift; the existing Dexie implementation becomes a cache layer rather than the real thing; and it contradicts the brief's first sentence |
| **Event log / CRDT** | Correct by construction; merges without losing an edit; would make household sharing fall out for free | Heavy for a budget app: every screen reads a projection, debugging gets much harder, and it is a large amount of machinery for one contentious row type |
| **No sync — accounts for billing only, data stays per-device** | Almost no work; still enables a paid tier | The thing people would pay for is their data following them; and bank sync writes to the server anyway, so the seam is needed regardless |

---

## Consequences

### Positive

- The brief's local-first promise survives the repositioning instead of being quietly dropped.
- Derived money figures are never merged — both sides recompute from the same facts and agree by construction.
- The migration lands while the owner's device holds the only data, which is the cheapest moment it will ever have.

### Negative / trade-offs

- `SCHEMA_VERSION` 1 → 2 touches every entity, the Dexie schema, the export format and the migration chain.
- Tombstones mean deletion stops being deletion, which interacts with the NDPR deletion duty in ADR-009's rule 6: *erasure on request* must be a real purge, not a tombstone.
- Sync state becomes user-visible — every screen needs a "last synced" or offline treatment, which is design work in the ADR-009 brief.
- Last-write-wins is a stated, documented limitation until household sharing revisits it.

---

## Action Items

1. [ ] Migration: `updatedAt` plus soft deletion on every entity, `SCHEMA_VERSION` 2, and a step in the ADR-005 chain. **Before any endpoint.**
2. [ ] Decide `deletedAt` versus a deletions table, and the tombstone retention number, in `peer-ai/backend/01-spec-endpoints.md`.
3. [ ] Specify the sync endpoint: server sequence, the client cursor, and what a client does when it has been away longer than retention.
4. [ ] Design: the sync indicator, the offline state, and the conflict case if one is ever shown — into ADR-009's design brief.
5. [ ] Confirm NDPR erasure purges rather than tombstones, when rule 6 is written.

---

## Related ADRs

- [ADR-009 — Repositioning](ADR-009-repositioning-v1-hosted-webapp.md) — puts the server in v1 and requires this decision
- [ADR-001 — Reactivity and the data seam](ADR-001-reactivity-and-the-data-seam.md) — the snapshot and `Repository` this builds on
- **ADR-005** — the export schema version and migration chain this extends
- **ADR-003 / ADR-004** — why derived figures cannot disagree across devices
