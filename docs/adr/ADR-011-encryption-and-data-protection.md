# ADR-011: Encryption and data protection — strong at rest now, end-to-end deliberately deferred

| Field | Value |
|-------|-------|
| **Status** | **Accepted** — 2026-09-24 |
| **Date** | 2026-09-24 |
| **Deciders** | Qudus Lawal (stakeholder and owner) |

---

## Context

The stakeholder's opening position, 2026-09-24, was **full end-to-end
encryption**: *"we shouldn't hold any data… the app builders cannot have access to
user data… whatever data that is even being stored must be encrypted."* The data in
question is salary figures, debts owed to named people, and eventually bank
transaction histories. The instinct is sound and the concern is the right concern.

**But the stated goal underneath it is narrower and more useful: if this app is
breached, it must not be a catastrophe for the people using it.** End-to-end
encryption is one way to reach that goal. It is not the only way, and it is the most
expensive one. Naming the goal separately from the method is what made this
decidable.

### What end-to-end encryption would mean here

Data is encrypted on the person's own device with a key only they hold; the server
stores blobs it cannot open. Signal does this with messages, password managers with
vaults.

**It fits this codebase unusually well**, and that is worth recording even though it
is being deferred. [ADR-010](ADR-010-sync-model.md) establishes that every money
figure — safe-to-spend, rollover, projected gap, debt balances, zakat — is
**derived on the client**. The server never needed to read the data, because it was
never going to compute anything. Most products cannot say that; their server
computes the thing they sell. So the usual reason end-to-end encryption cripples a
product does not apply.

### The three facts that changed the decision

**1. Forgotten passwords destroy data, permanently.** If the server cannot read the
data, no "forgot password" link can restore it. The stakeholder arrived at this from
experience: *"it reminds me of when I sign up for the types of like GitHub and they
give you these keys or tokens that you have to store — at times I misplace them and
it becomes difficult when I do account recovery."* If a developer loses recovery
tokens, households running a budget will lose them far more often. And **"I lost a
year of my budget because I forgot my password and they could not help me"** is
worse for trust than a breach: a breach is something that happened *to* the product;
this is something the product did on purpose.

**2. Paying customers need support, and this is the decisive one.** The stakeholder
raised it: *"there's a premium feature and people would want to pay, and sometimes
it may even require support — so how do you want to be of help in such regards?"*
Under end-to-end encryption the honest answer to *"my safe-to-spend looks wrong"* is
*"I cannot see anything, please describe it to me."* Acceptable for a free tool.
Corrosive for something billed monthly.

**3. The door only swings one way.** **End-to-end encryption can be added later; it
cannot be withdrawn.** Launching with *"we cannot read your data"* and then
retreating — because support is impossible, or because users keep losing budgets —
means asking every user to re-key and publicly retracting a privacy promise. That is
a worse day than any breach. The reverse is a natural progression: strong ordinary
encryption now, honestly described, with the stronger guarantee added when the
support model is understood.

**So the intuitively safer choice is the riskier one.** Deferring is the
conservative decision here, not the compromise.

### And the claim that could never have been made anyway

Bank movement arrives from an aggregator (Mono, Okra, Stitch) **by webhook to the
server**, because a browser cannot hold aggregator credentials. So the server
necessarily sees those transactions in plaintext. Even under full end-to-end
encryption the honest claim was only ever *"we never **store** your bank data
readable"* — never *"your bank data never touches our servers."* The most sensitive
data in the product was the least protectable either way.

---

## Decision

**Strong encryption and data protection done properly for v1. End-to-end encryption
is deferred, with the conditions for revisiting it written down.**

Not "encryption switched on". Seven specific measures, in rough order of how much
each one buys:

**1. Application-level encryption of the sensitive financial fields, with the key
held outside the database.** The highest-value single step and not much work. A
stolen database dump — the shape most breaches actually take, along with an exposed
backup — is then useless on its own: the attacker holds ciphertext and no key.

**2. Bank access tokens get their own key and stricter handling than anything
else.** They are the crown jewels, and the asymmetry must be stated: a leaked
transaction list is last month's history, while **a leaked bank token is ongoing
read access to someone's account.** Revocable, encrypted separately, destroyed on
unlink.

**3. Financial values are never logged.** This is how money data actually escapes in
practice — into error trackers, third-party monitoring, a screenshot pasted into a
support conversation. An explicit allowlist of what may be logged, and short
retention. Not a convention; a rule with a check.

**4. Every access to production data is recorded, and users are told that it is.**
This is how support and trust are reconciled honestly. Not *"we promise not to
look"* — *"every look leaves a record, and you may ask for it."* A promise is not
checkable; an audit log is.

**5. Support is built around asking, not looking.** A *send diagnostics* action the
person triggers themselves, packaging state and version rather than figures. Most
support needs to know what the app did, not what the person earns. Designed in, not
retrofitted.

**6. Hold as little as possible.** Minimal personal detail, no analytics on content,
real deletion on request. The strongest protection for data is not having it, and it
is also free.

**7. Claims are exactly true, everywhere, including the landing page.** *"Encrypted,
keys held separately from the database, every access logged"* is strong, checkable
and honest. Overclaiming is the one thing that would cost more than saying nothing.

### What this explicitly does not protect against

**A live compromise of the running server.** An attacker with active access to the
application — not merely a database dump — can read data, because the application
must be able to. End-to-end encryption would have prevented exactly this.

That is the trade, stated plainly so nobody later believes the stronger guarantee
was bought. It is a narrower and less likely scenario than a leaked dump or a
mishandled backup, and it is the price of being able to help a paying customer and
rescue someone who forgot their password.

### End-to-end encryption — deferred, with conditions

Not rejected. Revisit when **any** of these is true:

- The support model is understood well enough to know what genuinely cannot be
  answered without seeing data — probably after some months of real users.
- A recovery story exists that ordinary households survive: a recovery code people
  actually keep, or multi-device re-authorisation, or both.
- Users ask for it. In a market where people are rightly wary of apps touching bank
  accounts, this may arrive sooner than expected.

**And the likely shape when it returns: an opt-in, possibly a paid tier.** *"Full
encryption — nobody, including us, can read your data, and nobody can recover it for
you"* is a genuinely good premium feature and an honest one, because the person
chooses the trade-off for themselves. Forcing it on everyone at launch makes that
choice for them.

---

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Strong encryption at rest, done properly; end-to-end deferred** *(chosen)* | Kills the common breach shapes — leaked dump, exposed backup; recovery and support both work; far less engineering, in an area where mistakes are severe and silent; keeps the stronger guarantee available, since the door only swings this way | A live server compromise can read data; the marketing claim is weaker than *"we cannot read it"* |
| **Full end-to-end encryption now** | The strongest guarantee, provable erasure, a real differentiator; fits the architecture because all computation is client-side | Forgotten password means permanent loss; paying customers cannot be supported properly; **cannot be withdrawn once promised**; significant work in a domain where errors are quiet; and the bank-feed caveat weakens the headline claim anyway |
| **End-to-end with an escrowed key for recovery** | Nobody loses data, and it sounds like the strong version | Costs nearly as much as full end-to-end while delivering only the weak guarantee, since the server *can* decrypt. **If this is the answer, ordinary encryption is nearly as good for a fraction of the work** — so it is the one option with no reason to exist |
| **Provider encryption at rest only** (tick the box) | Free, immediate | Protects against a stolen disk and almost nothing else. The database credentials and the data live in the same blast radius, so a dump is readable. Not what was asked for, and not enough for money data |

---

## Consequences

### Positive

- The breach shapes that actually happen — a leaked dump, a forgotten backup — stop being catastrophic, which was the real goal.
- Recovery is ordinary, so nobody loses their budget to a mislaid code.
- A paying customer can be helped, which protects the revenue the premium tier depends on.
- Every claim made publicly is true and checkable, which is worth more than a stronger claim that needs footnotes.
- The stronger guarantee stays available as a deliberate, documented future step — and reads better as a considered deferral than as unbuilt ambition.

### Negative / trade-offs

- A live server compromise is not defended against. Named above; not to be forgotten.
- The privacy claim is weaker than the one originally wanted, and competitors may claim more (sometimes untruthfully).
- Audit logging and a diagnostics flow are real work that buys no user-visible feature.
- "Never log financial values" needs enforcement, because it will otherwise be broken by a well-meaning debugging session.

---

## Action Items

1. [ ] Choose the field-level encryption scheme and where the key lives — a secret manager, never the database, never the repository (rule 1). Write it down; do not improvise cryptography.
2. [ ] Bank tokens: separate key, encrypted at rest, destroyed on unlink, revocation path tested.
3. [ ] A logging rule with a **check**, not a convention: financial values never reach a log, an error report or a third-party monitor. Short retention.
4. [ ] Audit log for production data access, and the wording that tells users it exists.
5. [ ] Design: the *send diagnostics* flow, since support does not look at data.
6. [ ] Write the public claim precisely — landing page, privacy policy, sign-up. Include the bank-feed caveat.
7. [ ] Deletion grace period: **30 days proposed**, stated in the product, then destroyed for good.
8. [ ] Amend rule 7 to match this decision rather than the end-to-end version. **Done 2026-09-24.**
9. [ ] An engineering note on this whole question, per the new learning mode — the stronger thing, why it was not built, and when it would be. This is the shape of note that reads better than having built it.

---

## Related ADRs

- [ADR-010 — The sync model](ADR-010-sync-model.md) — client-side derivation is why end-to-end encryption would fit, and remains the reason it stays affordable later
- [ADR-009 — Repositioning](ADR-009-repositioning-v1-hosted-webapp.md) — the server, the paid tier and the bank feature this applies to
- **ADR-005** — export and import, unaffected either way
