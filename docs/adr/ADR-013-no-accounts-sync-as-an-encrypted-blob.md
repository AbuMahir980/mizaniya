# 13. No accounts: sync is one encrypted blob the owner holds the only key to

## Status

**Proposed** — 2026-10-07. Raised by Qudus Lawal (stakeholder and owner); written up
for their decision.

**The owner said "proceed" on 2026-10-07, before reading this.** That is recorded as
intent, not as acceptance, and the status stays `Proposed` deliberately: the whole
reason they asked for this to be written was so they could *read the flow rather
than assume it*, and marking it accepted unread would be the exact thing they were
guarding against. **It becomes `Accepted` on their word once they have read it** —
one sentence from them, and this line and the heading change together.

If accepted it **replaces the premise of
[ADR-009](ADR-009-repositioning-v1-hosted-webapp.md)** — which made v1 a hosted
multi-user webapp with accounts, sync, tiers and a server — **rebuilds part 2 of
[ADR-010](ADR-010-sync-model.md)'s decision**, and **reverses the deferral in
[ADR-011](ADR-011-encryption-and-data-protection.md)**. It makes most of
[ADR-012](ADR-012-server-stack.md) unnecessary rather than answering it.

---

## Context

### What the owner asked for, in their words

Three things, 2026-10-07:

1. **Spare people the friction of creating an account.** *"I want to save customers
   the stress of having to create account and so on."*
2. **Still let them sync across devices**, including to a spouse.
3. **Spend nothing on a database.** *"I don't want to spend on database and the
   likes… I just want it to be a thing that people can use anyhow they see fit
   without the friction of oh they need to pay money — I want to take that away
   entirely."*

And a fourth, which is a product decision rather than an architectural one but
which removes the reason the server existed: **monetisation moves to a different,
later product.** Mizaniya stops carrying a paid tier.

### The two facts that decide this

Both read from the repository rather than assumed.

**The entire sync payload already exists, and it is tiny.**
`apps/web/src/data/export-file.ts:18` — `buildExportFile(snapshot, exportedAt)`
returns `{ app, schemaVersion, exportedAt, data: snapshot }`: the whole of a
person's budget as one JSON object. `seed/seed-current.json`, a fully populated
budget with a cycle of transactions, debts, goals and plans, is **11,889 bytes**.

So the unit of sync is about **12 KB**. Ten thousand people is 120 MB. Object
storage with a 10 GB free allowance holds hundreds of thousands of people before
it costs anything. *(Inferred from the code and the seed file.)*

**The cost of a hosted app is not storage, it is a database and compute that run
whether anyone uses them or not.** [ADR-012](ADR-012-server-stack.md) chose
Postgres, and issue #113 already records the trap: free Postgres tiers expire, and
*"a budgeting app that loses a user's data to an expired free database does not get
their trust back."* Removing the database removes that whole class of risk, not
just its cost. *(Stated in #113 and ADR-012.)*

### What ADR-011 already concluded, which matters more than it looks

[ADR-011](ADR-011-encryption-and-data-protection.md) weighed full end-to-end
encryption on 2026-09-24 and deferred it. Its own Pros column for that option read
**"fits the architecture because all computation is client-side"**. It was rejected
for four reasons, and three have since dissolved:

| Reason it was rejected | Where it stands now |
|---|---|
| *"paying customers cannot be supported properly"* | **There are no paying customers**, and none is planned |
| *"the bank-feed caveat weakens the headline claim anyway"* | **The bank feed is going**, so the claim gets stronger |
| *"cannot be withdrawn once promised"* | Still true — an argument for deciding **now** rather than later |
| *"forgotten password means permanent loss"* | **Still real, and the one genuine cost.** Export and import already exist as the backstop |

The owner's original instinct — recorded in ADR-011 as wanting data *"we could not
read at all"* — becomes available again. This record does not claim that as new
thinking; it notes that the grounds for refusing it have changed.

### The guarantee this breaks, and must replace

[ADR-010](ADR-010-sync-model.md)'s decision has three parts. Part 2 is the problem:

> **The client proposes, the server orders.** Client clocks lie, so `updatedAt`
> records *intent* while a server-assigned monotonic sequence decides *order*.
> Last-write-wins that trusts a phone's clock is a bug waiting for one traveller
> crossing a timezone.

**A server that cannot read the data cannot order rows inside it.** Any design here
owes a replacement for that ordering, or it reintroduces the bug ADR-010 named.

ADR-010 also identified precisely where collisions hurt. Of all the entity types it
surveyed, `PlanEntry[]` keyed `(cycleStart, categoryId) → planned` is marked
**"This is the one."** Two devices setting this cycle's Food budget is a real
collision, and last-write-wins means one edit silently disappears. And on sharing:
**"Household sharing changes the stakes, and the answer is to ask, not to merge."**
One owner losing their own earlier edit is tolerable; a spouse's edit vanishing
silently is not.

### What the repo rules require of any answer

Repo rule 7 (binding, `CONTEXT.md`) governs what a server may hold. Its hardest
clauses — *keys kept outside the database*, *deleting means the data is actually
gone*, *what is claimed publicly is exactly what is true* — are written for a
server that can read. They do not disappear here; several become trivially true,
and that difference has to be stated rather than assumed.

---

## Options

### Option A — Carry on with ADR-009: accounts, Postgres, tiers

**Gives:** bank movement sync, which was ADR-009's headline and the only feature
with a plausible willingness to pay. Household sharing with real identities. A
conventional shape every tutorial teaches, and a full-stack story.

**Costs:** exactly the three things the owner asked to remove. An account before
anyone can sync. A database that costs money whether or not anyone uses it, and
whose free tiers expire. The whole backend standards surface wakes up — rule 7,
NDPR duties, per-record permissions, a tested restore — before there is a single
user. And it builds toward a paid tier the owner has decided not to pursue.

### Option B — No sync: export and import only

**Gives:** it already exists and works, costs nothing, and holds no data anywhere.
Zero new surface of any kind.

**Costs:** it does not answer the owner's second requirement. Moving to a new phone
means remembering to export first, and a spouse cannot share a budget at all.
Friction lands on exactly the person who cared enough to have two devices.

### Option C — Sync through the owner's own cloud storage

The app writes an encrypted file into the person's own Google Drive or iCloud.

**Gives:** no storage cost to the project, and the file is visibly theirs.

**Costs:** it reintroduces an account — someone else's. Google's OAuth consent for
Drive scopes needs app verification, which is real calendar time and a review the
project does not control, and it is per-provider work repeated for each one. The
friction the owner wanted removed comes back wearing a different logo.

### Option D — A recovery phrase, and one encrypted blob in object storage *(recommended)*

No account. The first time someone turns sync on, the app generates a recovery
phrase, derives keys from it on the device, and stores their snapshot as one
opaque encrypted blob. A second device types the phrase and pulls it. The store
holds ciphertext addressed by an opaque id and understands nothing.

**Gives:** no account, no database, no per-user compute, and a cost that stays
near zero at any scale this product will reach. Rule 7's hardest promise becomes
literally true rather than aspirational. #113's expiring-database risk disappears
because there is no database. Deployment is static hosting plus one small request
handler.

**Costs:** bank sync through an aggregator becomes impossible — see
Consequences. A lost phrase means the cloud copy is unreadable by anyone,
including us. Household sharing is *share your phrase*, which is coarse. And
getting the cryptography wrong here fails quietly, which is the risk ADR-011
named about this whole area.

---

## Decision

**Recommended: Option D.** It is the only one that answers all three of the
owner's requirements, and the one the existing architecture is already shaped for
— every calculation is client-side, the `Repository` seam from
[ADR-001](ADR-001-reactivity-and-the-data-seam.md) already isolates where data
comes from, and the complete payload already serialises in one call.

### How it works, end to end

1. **Turning sync on.** The app generates a 12-word phrase from a published
   wordlist, from `crypto.getRandomValues`, giving 128 bits of entropy. It is
   never derived from anything the person chose themselves: a chosen passphrase is
   guessable offline against a blob anyone can fetch.
2. **Two keys, from one phrase, kept apart.** A memory-hard derivation turns the
   phrase into one secret, and **HKDF splits that into two independent values**: an
   **address** that names the blob, and a **key** that encrypts it. The store sees
   only the address. It must not be possible to work back from the address to the
   key, which is why they are separated rather than one being a hash of the other.
3. **Writing.** The device serialises its snapshot with the existing
   `buildExportFile`, encrypts it with AEAD — so tampering is *detected*, not
   merely unreadable — under a fresh nonce, and stores it at the address.
4. **A second device.** The person types the phrase. The device derives the same
   address and key, fetches, decrypts, and merges with whatever it already has.
5. **A spouse.** They are a second device. The phrase is the sharing mechanism.

**One phrase, one mechanism — there is no separate device-sync and sharing
feature.** Added 2026-10-07 because the owner asked whether the phrase could serve
device sync as well: it already does, and that is the point rather than a
convenience. Your phone and your laptop reach the same blob by deriving the same
address from the same phrase; a spouse's phone does the identical thing. Nothing in
the design distinguishes *your* second device from *someone else's* device, because
nothing can: possession of the phrase is the whole of the authorisation.

**That unification is also the limitation, and the two cannot be separated later
without changing the design.** Because one phrase grants everything:

- sharing with a spouse necessarily shares the entire budget — there is no partial
  view, and no read-only;
- removing one device means changing the phrase and re-syncing every other device,
  because there is nothing else to revoke;
- a phrase that leaks grants a stranger exactly what it grants a spouse.

For two people who already share a bank account this is likely the right trade, and
it is why the Options above treat household sharing as *coarse* rather than solved.
If separating them is ever wanted — your devices distinct from a partner's, or
revoking one phone — that is per-device key management rather than a phrase, and it
reopens this record. It is listed under *What would make this worth revisiting*.

### What orders writes, now that no server can

**Compare-and-swap on the whole blob.** Every write is: fetch the blob with its
version tag, merge locally, then store it **only if the version is still the one
merged against**. If it is not, someone else wrote first; fetch again, merge again,
retry.

This gives a **total order of blob versions without the store understanding a byte
of them**, which is what ADR-010 wanted from a server sequence. It is stronger in
one respect: a device always knows exactly which version it merged against, so a
genuine conflict can be *detected* rather than guessed at.

**Within a merge, order comes from counters, not clocks.** Each device keeps an id
and a counter that increments on every write, carried inside the blob. Ordering is
causal, so ADR-010's traveller crossing a timezone is no longer a bug — their
phone's wall clock never decides anything. `updatedAt` stays what
[ADR-010](ADR-010-sync-model.md) and schema v2 made it: a record of intent, shown
to people, never the arbiter.

#### What this ordering does not solve

Four things, named here rather than discovered later.

1. **The merge becomes the most dangerous code in the product.** With a server that
   understands rows, a bad merge damages a row. Here the whole budget is one blob,
   so **a merge bug can corrupt every device's copy**, and there is no server-side
   copy to fall back on because the server cannot read one. This is the single
   largest risk the design takes on. It demands two things: the object store keeps
   the previous version so a bad write can be rolled back, and the merge is tested
   exhaustively with plain values the way `core` already is (standards K2).
2. **A device offline for a long time has more to reconcile**, so the chance of a
   genuine conflict rises with time away. Compare-and-swap detects it; it does not
   make the reconciliation smaller.
3. **The retry loop can spin.** Two devices writing continuously can each keep
   losing the race. Retries must be bounded and the failure visible to the person,
   not silent — a sync that quietly stops is the failure mode this project keeps
   relearning.
4. **Device identity has to survive.** Causality depends on a device id that is
   stable and never reused. A cleared browser store means a new id, which is safe
   but loses that device's history; a *duplicated* id, for instance by cloning a
   profile, would break ordering. The id must be generated per installation and
   never derived from the phrase.

### What happens to the collision ADR-010 singled out

For `PlanEntry` — *"this is the one"* — compare-and-swap makes the conflict
**visible**: both sides changed the same `(cycleStart, categoryId)` since the
version they share. So the app can do what ADR-010 said sharing demands: **ask,
not merge.** Both figures are shown with who set them and when, and the person
chooses. This is the one place the design is better than the server-ordered
last-write-wins it replaces, which would have silently discarded one edit.

For everything else — transactions, debts, goals, categories — ADR-010's survey
already found the shape friendly: a log that merges by construction, with
tombstones for deletes. Per-row last-write-wins by counter is enough.

### What replaces bank movement sync: nothing, deliberately, and here is the question to ask instead

An aggregator cannot work under this design: its credentials would have to live in
a browser bundle, which repo rule 1 and standards SEC-11 both forbid, and refresh
tokens and webhooks need somewhere private to run.

**Statement import was considered as a substitute and rejected — the owner's call,
2026-10-07, and it is the right one.** The owner downloads a file from their bank
and the device parses it: no credentials, no fees, nothing leaving the device. But
it asks for a monthly ritual, and that **fights the premise the whole app rests
on.** [ADR-010](ADR-010-sync-model.md) justified offline-first on the grounds that
budgeting only works if spending is recorded *at the moment it happens* — "in a
queue, at a fuel station, immediately after paying". Downloading a statement, finding
the file and importing it is more friction than typing the amount when the money
leaves. It would also mean a parser per Nigerian bank, written before anyone has
asked for the feature.

**So the bank feature is deferred entirely, and the deferral is the decision.** This
is `CLAUDE.md` §4's own rule applied to architecture: *"Writing down a deliberate
deferral is worth more than building the thing early — it shows the limit was
understood and chosen, which is precisely what premature machinery fails to show."*

It also corrects something [ADR-009](ADR-009-repositioning-v1-hosted-webapp.md)
half-admitted. It justified bringing the server forward partly because *"there is
outside interest"*, while calling that **"the weakest signal in product"** in the
same paragraph. The replacement is evidence rather than a guess.

**The question to ask, written down now so it can be asked later rather than
reinvented:** once people are actually using Mizaniya, ask them whether they want
their bank movements read automatically, and whether they would pay a token for it.
Two things make that answer worth more than today's guess — it comes from people who
already use the product, and it comes with a price attached, which is the only form
of interest that predicts anything. **If the answer is yes, this record is
reopened**, because automatic reading needs a server holding credentials and that
trade has to be made honestly rather than smuggled in.

### The abuse problem this creates, named because it is the one that costs money

An opaque store addressed by an unguessable id is **a free file host for anyone who
finds it**. This needs a size cap per blob, a rate limit per address and per
source, and an address space too large to enumerate. It is the only place in this
design where someone else's behaviour can cost the owner money, and it is a
requirement rather than a hardening task.

---

## Consequences

### What becomes easier

- **No database, so no database bill, no instance to keep alive, and #113's
  expiring-free-tier trap is gone** rather than mitigated.
- **Repo rule 7's hardest clause becomes true rather than aspirational.** *"Nobody
  can read your data"* is a statement of fact when the key never leaves the device.
  Its clause *what is claimed publicly is exactly what is true* is satisfied by
  construction.
- **Erasure becomes real.** Rule 7 and ADR-009's NDPR note both demand that
  deleting means gone, and ADR-010 flagged that a tombstone does not satisfy a
  person asking to be erased. Deleting the blob leaves ciphertext nobody can read,
  then nothing.
- **Most of the backend standards surface never opens.** Per-record permission
  checks (SEC-01, SEC-02, SEC-03) have nothing to check: there are no records the
  store can see. `docs/standards/backend-engineering-standards.md` stays dormant.
- **[ADR-012](ADR-012-server-stack.md) is mostly moot.** No Postgres, no Kysely, no
  migrations on a server. What survives is a much smaller question: which object
  store, and what runs the request handler.

### What becomes harder, or is lost

- **Bank movement is out for now, and that is a deferral with a condition, not a
  deletion.** With it go the paid tier and stories **K** (tiers and billing) in
  `docs/03-system-spec.md`. Story **M** (bank movement) stays on the record as
  designed-not-built, with the question above as its trigger.
- **What this buys back is worth stating:** no parser per bank, no aggregator
  onboarding, no business registration, and no monthly ritual asked of someone whose
  app exists to be used at the moment they spend. The cheapest feature is the one
  not built before anyone wants it.
- **A lost phrase cannot be recovered by anyone.** This is the real user harm and
  the honest cost of the guarantee. It must be mitigated in the product, not in
  prose: the phrase is shown once with a deliberate confirmation, and local export
  stays the primary backup.
- **Household sharing is coarse.** Sharing a phrase shares everything, with no way
  to revoke one device without re-keying and re-syncing every other. For two people
  who already share a bank account this may be acceptable; it is a real limitation
  and is recorded as an open question rather than settled.
- **Getting the cryptography wrong fails silently.** ADR-011 warned about exactly
  this: *"significant work in a domain where errors are quiet."* That warning
  survives this record unchanged.
- **Some drawn design is for a product that will not exist** — see below.

### What the design must change — for the designer, before building

**No longer needed**, because accounts and tiers are gone:

| Artboards | Why |
|---|---|
| `16-what-an-account-adds` (1440, light and dark) | There is no account to add anything |
| `16a-what-an-account-adds-lapsed` | Nothing can lapse |
| Pricing in the landing navigation (§M·10, §M·11) | There is no price |
| The ₦1,000 tier reasoning (§M·50) | No tier |

**Changed**, and the change is the interesting part:

| Surface | What changes |
|---|---|
| The sign-up, sign-in, forgot-password and reset screens (`01`, `01a`, `02`, `03`, `03a`, `04`) | **All of it goes.** In its place: one screen that shows a recovery phrase, and one that accepts it. There is no password to forget, so there is nothing to reset |
| `18`, `18a`, `18b`, `18c` household | Joining becomes *enter the phrase* rather than *accept an invitation*. `18b` and `18c`, the two-amounts boards, become **more** important: they are where the app asks instead of merging |
| `20`, `21` security and privacy | The claim gets stronger and must be reworded to match exactly what is true |
| Settings → *your account* (`15d`) | Becomes *your sync*: show the phrase, turn it off, delete the stored copy |

**Parked, not wasted, and not to be built:** `17`, `17a`, `17b`, `17c` — the
reconciliation queue. They are the interface for reading bank movements, and that
feature is deferred until someone asks for it and says they would pay. **The boards
stay on the record as the design for it**, which is what makes the deferral a
decision rather than an omission: if the answer comes back yes, the interface is
already drawn. Nothing about them should be built now.

`17d-cash-in-hand` is **a question for the designer rather than a conclusion.** It
came out of §M·49 alongside bank movements, but a cash withdrawal is something the
owner can record by hand, so it may stand on its own. Whether it survives
independently of bank linking is theirs to say, and this record does not decide it.

**Unaffected:** every budgeting screen, every onboarding screen, and the whole
design system.

*A note on my own reversals here, since the record should carry them: this was
written first claiming the reconciliation boards were wasted, then claiming
statement import saved them, and now parking them. Only the last is correct, and
the first two are left visible rather than tidied away.*

### What must now be done

1. **The owner decides this record.** Everything below waits on that.
2. **Hold the spec rewrite.** N1–N4 and O2 in `docs/open-items.md` have been
   queued since 28 September and point at accounts, tiers and a server. Rewriting
   them before this is decided means rewriting them twice.
3. **A threat model**, which the project map already reports missing for mvp. It
   was blocked on knowing what the server is; this record answers that, and the
   attack surface it must cover is now small and specific: the blob store, the
   phrase, and an imported file.
4. **Amend ADR-009, ADR-010 part 2, ADR-011 and ADR-012** rather than editing them,
   each pointing here.
5. **Choose the object store and the request handler** — the small remainder of
   #113. A free allowance measured in gigabytes against a 12 KB payload makes this
   a question about conditional writes and rate limits, not about capacity.

### What would make this worth revisiting

- **People using the app say they want automatic bank movement and would pay for
  it.** This is the first trigger and the one with a method attached: ask adopters,
  with a price in the question. Automatic reading needs a server holding
  credentials, so a yes reopens this whole record rather than being added quietly at
  the edge.
- **A second person in a household needs revoking without re-keying.** That is a
  real key-management problem and a phrase cannot carry it.
- **Someone abuses the blob store** past what caps and rate limits hold.
- **A lost phrase destroys a real person's budget.** The mitigation is a product
  decision, and if it proves insufficient the guarantee itself is what has to move.
