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

### Revised 2026-10-07 after the owner read it: recovery

The owner read this record and pressed on its one real user harm — *"if a user
should misplace the recovery key, there's no way to get it back"* — and asked
whether an authenticator app could help.

**It cannot, for three reasons.** A TOTP code is six digits and rotates every
thirty seconds, so no stable key can be derived from it, and a million
possibilities is brute-forced instantly. Its *seed* could be a key, but then the
authenticator is merely storing the key and carries the same loss problem — lose
the phone without the app's own backup and it is gone. And verification requires
the verifier to hold the same seed: if we hold it, we can derive the key, which is
exactly the option [ADR-011](ADR-011-encryption-and-data-protection.md) already
rejected as **"the one option with no reason to exist"**, since a server that can
decrypt for recovery makes ordinary encryption nearly as good for a fraction of the
work.

**But the question exposed a real flaw in the first draft of this record: it made
the phrase *be* the key.** That is what made loss fatal, and it was avoidable. The
revision below separates the two, so the phrase becomes one way in rather than the
only one.

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

### Option D — One encrypted blob, and the owner chooses how they can get back in *(recommended)*

**Revised 2026-10-08.** The first draft of this option offered a recovery phrase and
nothing else, and the owner was right to push on it: a single secret that is enough
for you is enough for anyone who finds it. That is not a gap in the field, it is
what the word *secret* means — but offering only the weakest arrangement of it was a
failure of this record, not a law of nature.

No account, in all three shapes below. The budget is encrypted under a random data
key; the store holds ciphertext at an opaque address and understands nothing. What
differs is **what can rebuild the data key**, and therefore what happens when
something is lost or found. **The person chooses, at the moment they turn sync on.**

#### D1 — Devices only

The data key lives in each device's own secure storage, wrapped by a passkey.
Passkeys are backed up by the platform's keychain, so a new phone restores it.

- **Getting back in:** a device you still have, or a passkey your Apple or Google
  account restores.
- **If something is found:** *nothing exists to find.* No words on paper anywhere.
- **If you lose everything,** every device and the platform account, the cloud copy
  is gone for good. Local exports remain.

#### D2 — A split key, any two of three *(recommended default)*

The data key is split into three pieces by Shamir's scheme, and **any two rebuild
it; any one is useless.** A natural household split is your device, your partner's
device, and a printed slip in a drawer.

- **Getting back in:** any two holders. You never had to keep one specific thing.
- **If one piece is found:** it reveals **nothing at all** — not the budget, and not
  even the blob's address, because the address is derived from the rebuilt secret
  rather than from any single piece. This is the shape that answers the owner's
  question properly.
- **Costs:** three pieces to place, and *"any two of three"* must be explained at
  the exact moment someone has least patience for it. Shamir's scheme is standard
  and must come from a vetted library, never hand-rolled — ADR-011's warning that
  *errors here are quiet* applies with full force.

#### D3 — A single recovery phrase

Twelve words. The shape the first draft proposed, kept because some people will
want one portable thing and no dependence on a platform or a partner.

- **Getting back in:** the phrase, anywhere, with nobody's help.
- **If it is found:** **full access to the budget.** This is the weakest of the
  three and the record now says so plainly rather than presenting it as the design.

#### What is identical in all three, and worth stating because it caused confusion

**Recovery and access are different things.** A device that already holds the data
key keeps it, in its own secure storage, and reads and writes the blob directly.
Pieces and phrases are touched **only when enrolling a new device or recovering from
loss** — never in day-to-day use.

So in every mode: **your phone and your laptop sync continuously, and a partner's
device behaves exactly like one of yours.** Sharing is unaffected by which recovery
shape is chosen; enrolling a new device is either an approval from a device you
already have, or whatever that mode's recovery path is.

**Gives:** no account, no database, no per-user compute, and a cost near zero at any
scale this product will reach. Rule 7's hardest promise becomes literally true. #113's
expiring-database risk disappears because there is no database. Deployment is static
hosting plus one small request handler. And the person picks which risk they would
rather carry, instead of being handed the one we happened to think of first.

**Costs:** bank movement through an aggregator becomes impossible — see
Consequences. **Revocation stays unsolved in every mode:** anyone who has held the
data key keeps whatever they already read, so rotation protects the future and never
the past. Three modes is more to build and far more to explain than one, and if the
explanation is poor people will choose D3 to get past the screen — shipping the
weakest option while having built the better ones.

---

## Decision

**Recommended: Option D, with D2 — the split key, any two of three — as the
default.** Option D is the only one answering all three of the owner's
requirements, and the one the existing architecture is already shaped for: every
calculation is client-side, the `Repository` seam from
[ADR-001](ADR-001-reactivity-and-the-data-seam.md) already isolates where data comes
from, and the complete payload already serialises in one call.

**D2 as the default, and the ordering is the recommendation.** D2 first, because it
is the only shape where a found secret is useless. D1 for someone who would rather
have nothing written down at all and accepts that losing every device ends it. D3
last, offered only because some people will want one portable thing that depends on
no platform and no partner — and it is the weakest, which this record says plainly
rather than leaving to be discovered.

### How it works, end to end

1. **Turning sync on.** The app generates a **random data key**. This, and only
   this, encrypts the budget. It is never shown to anyone and never derived from
   anything a person types.
2. **The person chooses how they can get back in** — D1, D2 or D3 above. This is
   the only question asked, and it is asked once.
3. **The data key is wrapped under whatever that choice provides.** A wrapping is a
   small encrypted copy of the data key, and **any one of them opens it.** Wrappings
   can be added or removed on their own, with the budget never re-encrypted — which
   is what makes both rotation and adding a device cheap.
   - **A passkey** wraps it from Face ID, Touch ID, Windows Hello or a hardware key,
     through WebAuthn's PRF extension. Platforms back passkeys up, so a new phone
     restores it and we never see any of it.
   - **A split key** wraps it in three pieces of which any two rebuild it.
   - **A phrase** wraps it from 12 words out of a published wordlist, from
     `crypto.getRandomValues`, 128 bits, never derived from anything the person
     chose themselves — a chosen passphrase is guessable offline against a blob
     anyone can fetch. A memory-hard derivation turns it into the wrapping secret.
   - **A device already signed in** holds the data key and can wrap it for a new
     factor directly. Two devices means losing one is not a recovery event at all.
4. **The blob's address comes from the recovery secret, never from a single piece
   of it.** A memory-hard derivation produces one secret — the phrase in D3, the
   rebuilt key in D2, the passkey's in D1 — and **HKDF splits it into two
   independent values**: the **address** naming the blob and the **wrapping key**.
   They are split rather than one being a hash of the other so that nothing can be
   worked back from the address. In D2 this matters most: one found piece cannot
   even locate the blob, let alone open it.
5. **Writing.** The device serialises its snapshot with the existing
   `buildExportFile`, encrypts it with AEAD under the data key — so tampering is
   *detected*, not merely unreadable — with a fresh nonce, and stores it at the
   address beside the wrapped copies of the data key.
6. **A second device of your own.** Either approve it from a device you already
   have, or use the recovery path for your mode. It then holds the data key itself.
7. **A partner.** Their device holds the data key exactly as yours does. From then
   on it is indistinguishable from a second device of your own.

### Sharing and device sync are the same thing, and neither depends on the mode

**Recovery and access are different, and conflating them is what made the first
draft confusing.** Added 2026-10-08 after the owner asked, twice, whether these
schemes still allow syncing with a partner. They do, and here is why:

A device that holds the data key **keeps it**, in its own secure storage, and reads
and writes the blob directly. Pieces, phrases and passkeys are touched **only when
enrolling a new device or recovering from loss** — never in ordinary use. So your
phone and your laptop sync continuously, and a partner's device behaves exactly
like one of yours, in **all three modes**.

Possession of the data key is the whole of the authorisation, and nothing in the
design distinguishes *your* device from *someone else's*. That is deliberate, and it
is also the limit:

- **Sharing shares everything.** There is no partial view and no read-only.
- **Revocation is forward-only, in every mode.** Anyone who has held the data key
  keeps whatever they already read. Rotating — new data key, rewrapped for whoever
  remains, new address, old blob deleted — protects the future and can never
  protect the past. A device that reads without asking permission cannot be told to
  stop retroactively.
- **What the modes change is the *recovery* risk, not the sharing model.** D2 is the
  one that answers *"a stranger finds it"*, because no single piece is enough.

If sharing ever needs to be finer — a partner with read-only access, or revoking one
phone without re-keying the rest — that is per-device key management rather than a
recovery secret, and it reopens this record.

### A found secret: why one of them grants everything and another grants nothing

The owner asked, 2026-10-07, whether the design protects against the other half of
losing a secret: not being locked out, but **someone else getting in.** The answer
differs by mode, and working out why is what produced D1 and D2.

**Any *single* secret sufficient for you is sufficient for whoever finds it.** That
is not a gap in the field. *"I can get back in with nothing but this"* and
*"whoever finds this cannot get in"* are one property seen from two sides, for the
same reason a spare key under the mat opens the door for a burglar. The only escape
is a custodian who can let you back in, and that is
[ADR-011](ADR-011-encryption-and-data-protection.md)'s rejected escrow — *"the one
option with no reason to exist"*.

**So D3 cannot be fixed, and D2 does not need to be.** In D3 twelve words derive
the address and unwrap the key, so a found phrase is full access, permanently and
by construction. In D2 **no single thing is sufficient**: one of three pieces
rebuilds nothing, and because the address comes from the rebuilt secret it does not
even reveal where to look. The tension is real, and the way past it is not a cleverer
secret but **refusing to have a single one** — which is why D2 is the recommended
default and D3 is offered with a warning rather than as the design.

The owner pressed on exactly this, and was right to: the first draft offered only
D3 and presented its weakness as inevitable. It is inevitable *for a single
secret*, and that is a much smaller claim.

**What a leak does and does not give, because the difference is the whole of the
blast radius.** The blob holds a budget: figures, categories, debts, goals. It holds
no card, no bank credential and no way to move money — the project has no payment
path at all. So compromise is **disclosure, not theft.** That is still serious, and
repo rule 7 calls a leaked record of someone's real finances *"a different category
of event"*; it is not minimised here. But it is bounded in a way a stolen banking
password is not.

**Three mitigations, requirements rather than hardening, and they apply to D3 most
of all since it is the mode with a single sufficient secret:**

1. **Rotation.** A phrase believed leaked can be replaced: generate a new one,
   rewrap the data key, move to the new address, delete the old blob. Because the
   budget is encrypted under a data key rather than under the phrase, this costs one
   small rewrap rather than re-encrypting everything — which is a second reason the
   wrapping design is right. **Honest limit: anyone who already copied the old blob
   keeps that snapshot for ever.** Rotation protects the future, never the past.
2. **Notification.** The store sees only an opaque address and cannot tell a thief
   from the owner. The app can still say *"a new device opened your budget on 3
   November"*. That is detection rather than prevention, and it is nearly free.
3. **Copy that says what the phrase is.** The screen showing it must state plainly
   that anyone holding those words can see the owner's money. Buried in a tooltip is
   how a phrase ends up photographed into a chat.

**The stronger option, named rather than adopted — and largely superseded by D2.**
Require a second factor to enrol a *new* device: the recovery secret **plus**
approval from a device already enrolled, the way a messaging app links a new phone.
A found secret then achieves nothing while the owner still holds any device. Worth
noting that **D2 reaches most of this result more simply**, by never having a single
sufficient secret in the first place, which is why it became the default rather than
this. It has to fall back to phrase-alone when no
device remains, or recovery is impossible again — so the real shape is a waiting
period with a notification, which is how platform account recovery works.

Not adopted now for three reasons, each of which should be revisited rather than
treated as settled: it needs the store to hold a little readable state, namely how
many devices exist, which is a small disclosure though not a financial one; it adds
a flow in an area [ADR-011](ADR-011-encryption-and-data-protection.md) warned
*"errors are quiet"*; and the realistic threat for a household budgeting app is a
phrase on paper at home, where the person most likely to find it is the spouse it
was meant for. **If a real person is ever harmed by a found phrase, this is the
thing to build**, and it is listed under *What would make this worth revisiting*.

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
- **Losing every factor cannot be recovered by anyone**, and a *found* phrase
  grants a stranger everything. Both are addressed above rather than in prose — four
  independent ways back in, rotation, notification, and copy that says what the
  phrase is — but neither is eliminated, and the second one cannot be.
- **Recovery now leans on Apple or Google**, for the passkey factor. The owner never
  creates an account with us, and we still cannot read anything, but it is a
  third-party dependency on the recovery path and should be named as one: it is a
  weaker version of the objection that ruled out Option C. The difference that makes
  it acceptable is that a passkey is a browser API with no consent screen, no app
  verification and no quota, so the friction is Face ID rather than an OAuth flow —
  and the phrase remains the portable factor that needs nobody.
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
- **A lost phrase destroys a real person's budget**, despite four ways back in. The
  mitigation is a product decision, and if it proves insufficient the guarantee
  itself is what has to move.
- **A found phrase harms a real person.** Then build the second factor for enrolling
  a new device, described above: phrase plus approval from an existing device, with
  a waiting period and a notification when no device remains.
- **WebAuthn's PRF extension turns out to be unavailable** on the browsers people
  actually use here. Support must be verified in the browsers' own documentation
  before this is committed to, the way #113 requires a free tier's retention to be
  verified in the provider's own documentation rather than assumed. If PRF is not
  usable, the passkey factor cannot be built and the phrase is again the only one —
  which changes the recovery story materially and brings this record back.
