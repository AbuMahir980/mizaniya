# ADR-011: End-to-end encryption — the server stores what it cannot read

| Field | Value |
|-------|-------|
| **Status** | **Proposed — one decision blocks it, see *The cost that decides this*** |
| **Date** | 2026-09-24 |
| **Deciders** | Qudus Lawal (stakeholder and owner) |

---

## Context

The stakeholder's position, 2026-09-24: *"we shouldn't hold any data… the app
builders cannot have access to user data… whatever data that is even being stored
must be encrypted. Users can decide to delete their data, and restore — we can't
see the data."*

This is **end-to-end encryption**: the data is encrypted on the person's device
with a key only they hold, and the server stores blobs it cannot open. It is what
Signal does with messages and what password managers do with vaults. For an app
holding salary figures, debts to named people, and eventually bank transaction
histories, it is a strong and defensible position — and it is the sort of choice
that answers *"does this person know what they are doing?"* on its own.

**And it fits this codebase unusually well.** [ADR-010](ADR-010-sync-model.md)
already establishes that every money figure is **derived on the client**, never
stored and never computed by the server. So the server was never going to need to
read the data. It is a sync target passing rows between devices. Encrypting those
rows takes nothing away from it, because it had no use for their contents.

That is rare. Most apps cannot do this — their server computes the thing the
product sells. Mizaniya's does not.

---

## The cost that decides this

**If a person forgets their password, their data is gone. Permanently. Nobody can
recover it, because nobody else has the key.** That is not a bug to be engineered
around; it is the direct consequence of the guarantee. The moment a "forgot
password" link can restore readable data, the server can read the data, and the
guarantee is gone.

This is the whole decision. Everything else is implementation.

Password managers live with it by making the user store a recovery kit, and their
users still lose vaults. Mizaniya's audience is ordinary households, not people
who have thought about key custody. **"I lost a year of my budget because I forgot
my password and they could not help me"** is, in reputation terms, worse than a
breach — a breach is something that happened *to* the product, this is something
the product did by design.

So the guarantee cannot be shipped without answering: **what happens on the day
someone forgets?** Three honest options:

| Recovery approach | What it costs |
|---|---|
| **Recovery code shown at sign-up**, which the person must save | Keeps the guarantee whole. But it puts a scary step in onboarding, and a meaningful share of people will not save it, and will lose everything later |
| **A second device stays logged in** and can re-authorise a new one | Pleasant when it works, useless for the person with one phone — which is most of this audience |
| **The server holds an escrowed copy of the key**, used only on recovery | Recovery works and nobody loses data. **But the guarantee becomes a promise instead of a fact** — the server *can* read the data, and the claim must change accordingly |

**These are not equal, and the third is not a cheat** — plenty of serious products
choose it. What is not acceptable is choosing the third while advertising the
first.

---

## Decision (proposed)

**Encrypt end-to-end, in two tiers, and state the guarantee precisely.**

### Tier 1 — everything the person enters: fully end-to-end

Settings, categories, plans, debts, goals and manually entered transactions are
encrypted on the device before they ever reach the server. The server stores
ciphertext, syncs it between devices, and cannot read any of it. This is the clean
case and it costs the product nothing, because the client already does all the
computation.

### Tier 2 — bank-fed transactions: encrypted on arrival, never stored readable

**This is where the simple story breaks, and it must be said plainly rather than
glossed.** Bank movement arrives from an aggregator (Mono, Okra, Stitch) by webhook
**to the server**, because that is the only place the credentials can live — a
browser cannot hold them. So the server *necessarily* sees those transactions in
plaintext at the moment they arrive. There is no design that avoids this while
still having the feature.

The honest design, and it is a good one: the server holds each person's **public
key**, encrypts the incoming payload to it immediately, stores only the ciphertext,
and keeps no plaintext copy and no log of it. The server can encrypt *to* the
person and cannot decrypt. The plaintext exists in memory for the duration of one
request.

**What may therefore be claimed, and what may not:**

- ✅ *"We cannot read your data. Everything is stored encrypted with a key only you
  hold."*
- ✅ *"Bank transactions pass through our server and are encrypted to you the moment
  they arrive. We never store them in readable form."*
- ❌ *"Your bank data never touches our servers."* **False.** It must.

The third sentence is the tempting one, and writing it would be the single most
damaging thing this project could do to its own credibility. The aggregator's
access token also lives server-side, and that is a real piece of custody worth
naming rather than hiding.

### What follows from it

- **Search and filtering happen on the device.** The server cannot index what it
  cannot read. Fine here — the whole snapshot is already in memory (ADR-001).
- **No server-side features that read content.** No emailed monthly summary, no
  server-rendered report, no content analytics. Counts and timings only.
- **Support changes shape.** *"My numbers look wrong"* cannot be answered by
  looking. It needs good on-device diagnostics the person can choose to send, and
  that is a design item, not an afterthought.
- **Never invent the cryptography.** A vetted library and a standard scheme — key
  derivation from the password, a random data key, public-key encryption for tier
  2. Hand-rolled crypto is the classic way a good intention becomes a
  vulnerability.
- **Rule 7 gets stronger and simpler.** *"Production data is opened only to fix a
  reported problem"* becomes *"it cannot be opened"*, which is a better rule
  because it does not depend on anyone's restraint.

### The interaction with deletion and restore

The stakeholder asked for both *delete my data* and *restore my data*, and those
pull against each other, so the line is drawn here:

- **Export and restore work perfectly** under encryption. The person's device
  decrypts, writes a file, and reads it back. This already exists (ADR-005) and is
  unaffected.
- **Undelete is a separate question.** If deletion is immediate and total, there is
  nothing to restore — which is what rule 7 promises. The usual resolution is a
  **grace period**: the account is deactivated, the ciphertext is retained for a
  stated number of days, then destroyed. It must be stated in the product, not
  quietly implemented.
- **Encryption does most of the work of erasure.** Destroying the key makes the
  remaining ciphertext unreadable by anyone, including us — which is a stronger and
  more verifiable erasure than deleting rows and hoping the backups roll over.

---

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Two-tier end-to-end encryption** *(proposed)* | The guarantee the owner wants, and it fits a client-side-computation architecture at almost no product cost; erasure becomes provable; a genuine differentiator for a money app | Forgotten password means permanent loss unless recovery is solved first; no server-side features that read content; support is harder; more work, and work that must not be improvised |
| **Encrypted at rest with keys the server holds** (the ordinary approach) | Simple, standard, every provider offers it; recovery and support are easy; nothing is lost when a password is forgotten | Protects against a stolen disk, **not** against the operator. The builders can read everything. It is what most apps do, and it is not what was asked for |
| **Encrypt user-entered data only; leave bank data readable** | Simpler tier 2; server could offer reconciliation help | The most sensitive data is the least protected, which is precisely backwards |
| **Hold no server data at all — sync device to device** | Nothing to protect | No multi-device sync worth having, no bank feed, no recovery, and no product |

---

## Consequences

### Positive

- The strongest available answer to *why should I trust a budgeting app with this?*
- Erasure becomes something that can be demonstrated rather than promised.
- A breach of the database exposes ciphertext, which changes the worst day this project could have from a catastrophe into an incident.
- It is an honest technical differentiator, which is rarer than a feature.

### Negative / trade-offs

- **Recovery must be designed before the first real user**, and whichever option is chosen has a visible cost — in onboarding, in support, or in the strength of the claim.
- No server-side feature may ever read content. Some obvious future ideas are closed off by this, permanently.
- More engineering, in an area where mistakes are severe and quiet.
- The tier-2 caveat must be stated publicly and accurately, including in marketing copy that nobody usually reviews for technical truth.

---

## Action Items

1. [ ] **Decide the recovery story.** Blocks everything else here. See the table above.
2. [ ] Choose the scheme and the library, and write it down; never improvise it.
3. [ ] Key derivation and the encryption boundary go in the endpoint spec, since sync now moves ciphertext.
4. [ ] Design: the recovery-code step in sign-up, and its warning copy. This is not a small screen — it is the moment the guarantee is explained or lost.
5. [ ] Design: on-device diagnostics a person can send, since support can no longer look.
6. [ ] Write the public claim precisely, including the bank-data caveat, and keep it consistent on the landing page.
7. [ ] Decide the deletion grace period, and state it in the product.
8. [ ] Amend rule 7: *cannot be opened*, rather than *is not opened*.

---

## Related ADRs

- [ADR-010 — The sync model](ADR-010-sync-model.md) — client-side derivation is what makes this affordable; sync now carries ciphertext
- [ADR-009 — Repositioning](ADR-009-repositioning-v1-hosted-webapp.md) — the server and the bank feature this applies to
- **ADR-005** — export and import, which keep working unchanged
- **ADR-001** — the in-memory snapshot, which is why on-device search is not a regression
