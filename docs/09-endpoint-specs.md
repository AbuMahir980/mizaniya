# Endpoint Specs — `services/api`

| Field | Value |
|---|---|
| **Date** | 2026-09-25 |
| **Phase** | 6 · Endpoint Specs (backend) |
| **Inputs** | [03-system-spec.md](03-system-spec.md) §I–§M · [04-api-contract.md](04-api-contract.md) · [ADR-009](adr/ADR-009-repositioning-v1-hosted-webapp.md) · [ADR-010](adr/ADR-010-sync-model.md) · [ADR-011](adr/ADR-011-encryption-and-data-protection.md) |
| **Status** | **Draft.** The two questions ADR-010 parked here are settled in §3; everything else awaits review |
| **Governs** | `docs/standards/backend-engineering-standards.md`, no longer dormant. Standard **§A6** applies to every route |

---

## 1 · What this document is for

`04-api-contract.md` defines the **data** contract — the entities, the
`Repository` interface, the export format. It stays authoritative on all of that.

This document defines the **server**: which routes exist, what they accept, what
decides an answer, and what happens when things go wrong.

**The one rule inherited from the contract, restated because it is the easiest to
break:** the HTTP implementation must not add methods to `Repository` that only it
can serve. If the server needs something new, it goes on the interface and every
implementation answers it honestly, or it does not go on the interface at all.

---

## 2 · The shape of the thing

**The device is the source of truth. The server is a sync target** (ADR-010). That
decides the whole API: it is not a set of resource endpoints the app reads through,
it is a place to **exchange changes**.

So there is no `GET /transactions`. The app never asks the server for its budget in
the course of normal use — it asks its own database, which is why it works with no
signal. The server is consulted to *reconcile*, not to *read*.

| Domain | Routes | When |
|---|---|---|
| **auth** | sign up, sign in, refresh, sign out, reset, delete | v1 |
| **sync** | pull, push, full resync | v1 |
| **account** | me, devices | v1 |
| **billing** | checkout, webhook, cancel | v1 |
| **household** | invite, accept, members, remove | designed, built after launch |
| **bank** | link, unlink, webhook | designed, built v1.1 |
| **admin** | account state only — never financial records | v1.1, separate deployment |

---

## 3 · The two questions ADR-010 parked here

### 3a · Tombstone retention — **180 days**, and the fallback is what makes that safe

The problem: a deletion must leave a marker so it can travel (`sync.md`). Markers
cannot be kept forever — the table grows without bound. But expire them too
eagerly and a device that has been away longer **resurrects everything it deleted**,
silently.

**Decision:**

- The server retains tombstones for **180 days**.
- A client pulls with a cursor. If that cursor is older than the oldest retained tombstone, the server answers **`409 cursor_expired`** and the client performs a **full resync**.
- A full resync is: **push pending local changes first**, then receive complete server state and replace local state with it.

**The important property, and it is not the number.** Correctness rests entirely on
the expired-cursor path being correct. As long as an expired cursor produces a full
resync rather than a partial one, the retention figure is a **storage and
performance choice** — not a correctness one. 180 days could become 90 or 365
without anything becoming wrong.

That is deliberate. A design whose correctness depends on a tuning constant is a
design that will eventually be broken by someone tuning it.

**Why 180 and not 30 or forever.** A tombstone is roughly 60 bytes — entity, id,
timestamp. Six months of one household's deletions is negligible, so storage is not
the constraint. The constraint is how long a device can plausibly be away and still
be expected to work: a phone in a drawer, a laptop taken on a long trip, a device
restored from an old backup. Six months covers those generously. Beyond that, a full
resync is the honest answer anyway.

**The order in a full resync matters and is easy to get wrong.** Pushing local
changes *before* replacing local state is what stops a resync destroying work done
while the device was away. A resync that pulls first is data loss with a progress
bar.

### 3b · Clock skew — server sequence orders, client timestamp only breaks ties, and future timestamps are clamped

The problem: clients lie about the time. Last-write-wins that trusts a phone's clock
is a bug waiting for one traveller crossing a timezone — or worse, one device whose
clock is set to 2027, which would then **win every conflict forever** and could not
be corrected from any other device.

**Decision, in three parts:**

1. **Order comes from the server.** Every accepted change is assigned a monotonically increasing `serverSeq`. Clients pull by cursor = last `serverSeq` they saw. This gives a total order that does not depend on any client's clock.
2. **`updatedAt` records intent, and is used only to break ties** — that is, to compare two versions of the *same row* that were edited independently. It never determines pull order.
3. **A future `updatedAt` is clamped to server receipt time.** If a client sends a timestamp more than **5 minutes** ahead of the server's clock, the server replaces it. The row is still accepted; only the timestamp is corrected, and the correction is logged.

**Why clamp forward but not backward.** A timestamp in the past is usually *true* —
an edit genuinely made offline three days ago should keep that time, or offline work
would lose to every later sync. A timestamp in the future is never true, and it is
the one that causes permanent damage.

**Stated limitation, so nobody assumes more than this buys.** This is not a causal
ordering. Two devices editing the same planned amount within the tie-break window
still resolve by timestamp, and one edit is discarded. That is acceptable for **one
owner across their own devices** — they made both edits and the later one is what
they meant. It is *not* acceptable for two people, which is exactly why household
sharing keeps both values and asks (§5d), rather than trusting this mechanism with
someone else's decision.

---

## 4 · Cross-cutting rules

### 4a · Every request carries its session scope (**§A6**)

No route infers the account from anything but the authenticated session. There is no
account id in a path or body that the server trusts. **There is no cross-account
read at any privilege level** — including support, which can see that an account
exists and what tier it is on, and cannot see a single figure inside it (rule 7,
ADR-011).

### 4b · Idempotency comes free, and is not an accident

Every entity already carries a client-generated id (`04-api-contract.md` §3). So a
push keyed by `(entity, id)` is naturally idempotent: re-sending a change after a
dropped connection applies the same row again and changes nothing.

This is why the sync API takes **rows, not operations**. An operation log would need
its own de-duplication; rows do not.

### 4c · Errors say what to do, and never leak

One shape:

```json
{ "error": { "code": "cursor_expired", "message": "..." } }
```

The `code` is what the UI maps to copy — the client never parses `message`.

Two absolute rules:

- **No financial value ever appears in an error, a log or a monitoring payload** (rule 7). Not the amount, not the category, not the counterparty.
- **No response reveals whether an email address has an account.** Sign-up and reset both answer *"if that address has an account, a link has been sent."* An enumeration oracle on a money app tells an attacker who to target.

### 4d · Rate limits, where they actually matter

| Route | Limit | Why |
|---|---|---|
| sign in | per address **and** per IP | Credential stuffing is the realistic attack |
| reset request | per address | Otherwise it is a free way to flood someone's inbox |
| sign up | per IP | Account-farming |
| sync | generous, per account | Should never be the thing that blocks a user recording an expense |

### 4e · What is *not* an endpoint

No `GET /transactions`, no `GET /safe-to-spend`, no server-side reports. Every figure
is derived on the device (`derived-state.md`), and the server holds encrypted fields
it largely cannot read (ADR-011). A server-side figure would be a second source of
truth for a number that is supposed to have one.

---

## 5 · The domains

### 5a · `auth`

Email and password (settled 2026-09-25).

| Route | Notes |
|---|---|
| `POST /auth/sign-up` | Creates the account. **The device's existing local data is what gets uploaded** — signing up never starts someone empty (**I2**, **J5**) |
| `POST /auth/sign-in` | Returns a short-lived access token plus a refresh token |
| `POST /auth/refresh` | Rotates the refresh token on every use |
| `POST /auth/sign-out` | Revokes this device's refresh token only |
| `POST /auth/reset/request` | Always the same answer, whether or not the address exists |
| `POST /auth/reset/confirm` | Single-use, short-lived token. **Revokes every other session** |
| `DELETE /auth/account` | 30-day grace, then destroyed (**I6**) |

**Passwords:** hashed with **Argon2id** at parameters from the library's current
recommendation, never a hand-rolled scheme and never a bare hash. A minimum length
stated **before** the field is typed into, not after it is rejected (**I1**).

**Sessions:** access token short-lived and held in memory; refresh token in an
`HttpOnly; Secure; SameSite=Lax` cookie, rotated on use, revocable per device
(**I7**).

**Two things that follow from decisions elsewhere and are easy to miss:**

- **Password reset must not cost the records** (**I4**). This holds *only* because ADR-011 deferred end-to-end encryption. If end-to-end is ever enabled, the password becomes the key and no reset can recover data. **Do not build a reset flow that would quietly become a lie at that point** — the recovery question ADR-011 parked is a prerequisite for that feature, not a follow-up.
- **Account deletion must destroy any bank access token**, not orphan it. A live token outliving the account it belonged to is ongoing access to someone's bank with no owner.

### 5b · `sync`

Two routes, and a third for the recovery path.

```
GET  /sync?cursor=<serverSeq>     → { changes[], nextCursor, hasMore }
POST /sync                        → { changes[] }  →  { results[], nextCursor }
GET  /sync/full                   → complete state, for a cursor that expired
```

A change is a row, not an operation:

```json
{ "entity": "transaction", "id": "t-1", "op": "put", "updatedAt": "...", "data": { } }
{ "entity": "category",    "id": "c-3", "op": "delete", "updatedAt": "..." }
```

**Applying a push:** each row is applied independently and its outcome reported, so
one rejected row does not discard a batch of legitimate movements. The client
advances its cursor only over acknowledged rows. A batch-wide transaction was
considered and rejected: a single bad row would block a user's entire day of
recording, and the rows are genuinely independent.

**Entitlement:** sync requires a paid tier. **With one exception that is not
negotiable** — see §5c.

### 5c · `billing`, and the exception that matters

| Route | Notes |
|---|---|
| `GET /me` | Tier, status, next billing date. **The only place the client learns its entitlement** |
| `POST /billing/checkout` | Starts a session with the provider |
| `POST /billing/webhook` | Signature verified **before anything is trusted**. Idempotent by event id |
| `POST /billing/cancel` | Effective at period end, no correspondence required (**K4**) |

**Entitlement is decided by the server, always.** The client may cache what `/me`
told it, for UI purposes only. A client-side entitlement check is a suggestion.

**The exception, and it is both right and required:** a lapsed account **must still
be able to retrieve its own data**. Sync stops; getting your records out does not.
Anything else is holding someone's financial history hostage to a failed card
payment — and NDPR requires portability regardless of whether an invoice was paid.

So `GET /sync/full` remains available to a lapsed account, read-only, for export.
**This is the clause most likely to be dropped by accident when someone implements
entitlement as a blanket middleware.**

### 5d · `household` — designed, built after launch

| Route | Notes |
|---|---|
| `POST /household/invite` | By email. An invitation is not an account |
| `POST /household/accept` | Joins an existing budget; **never creates a second copy** (**L2**) |
| `GET /household/members` | Who is in, and who invited them |
| `DELETE /household/members/:id` | They keep nothing (**L5**) |

**§C5 applies from the moment a second person joins.** And conflicts change
behaviour: for a shared budget the server **keeps both values** and surfaces the
disagreement, rather than resolving it (ADR-010). A conflict becomes state — both
amounts, who set each, and when — until a person settles it.

That is a different data shape from single-owner sync, which is why it is designed
now: retrofitting "keep both" onto a resolve-on-arrival server is a rewrite of the
sync core.

### 5e · `bank` — designed, built v1.1

| Route | Notes |
|---|---|
| `POST /bank/link` | Starts the aggregator's consent flow |
| `DELETE /bank/link` | **Destroys the token**, does not merely mark it inactive (**M4**) |
| `POST /bank/webhook` | Movements arrive here. Signature verified first |

**Read-only, always.** No route in this API moves money. That is the factual
boundary keeping this outside payment regulation, and it is written here so nobody
adds a "pay a debt" convenience later without noticing what it would change.

**The encryption path is specific** (ADR-011): a movement arrives in plain text,
is encrypted to the account's key immediately, and **no plain-text copy is stored
or logged**. What may be claimed publicly is *"we never store your bank data in
readable form"*. What may **not** be claimed is *"your bank data never touches our
servers"*, because it must.

**Matching, not duplicating** (**M5**): manual entry does not stop when bank sync
starts, so the same expense will arrive twice. Detection needs a rule — amount and
date within a window — and a way for the owner to confirm or split a suggested
match. **This is under-specified on purpose and needs design**, not a silent
heuristic deciding that two of someone's expenses were one.

---

## 6 · What is still open

| Question | Blocking |
|---|---|
| ~~Price and billing period~~ | **Settled 25 September — a deliberate placeholder.** Nothing is integrated yet; a figure now would harden into a commitment. Three strings to change when it lands |
| ~~Payment provider~~ — Paystack or Flutterwave | **Settled 25 September — deferred.** The `billing` routes here stay provider-agnostic, so the choice costs nothing later. Signature verification and idempotency-by-event-id are required of whichever is chosen |
| Hosting, and **the free tier's database retention verified** before committing | Deployment |
| ~~Rule 7~~ | **Binding from 25 September** — see `CONTEXT.md`. Two clauses constrain this document directly: *deleting means actually gone* (so a tombstone is not an erasure — §3a's retention must not become a way to keep data someone asked to be rid of), and *every access to production data leaves a record* |
| The duplicate-matching rule and its UI (**M5**) | **M5** build |
| What the copy says when a device signs in holding a different local budget (**I3**) | **I3** build |

---

## 7 · Changelog

| Date | Change |
|---|---|
| 2026-09-25 | Created. Settles tombstone retention (180 days, with a full-resync fallback) and clock skew (server sequence orders; client timestamps break ties and are clamped forward) — the two questions ADR-010 parked here |
