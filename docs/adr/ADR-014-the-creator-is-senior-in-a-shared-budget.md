# ADR-014. The creator is senior in a shared budget, and writes are signed

## Status

**Accepted** — 2026-10-14. Deciders: Qudus Lawal (stakeholder and owner).

**Amends [ADR-013](ADR-013-no-accounts-sync-as-an-encrypted-blob.md)**, which stands
in every other respect. It does not supersede it: no accounts, no database, no tiers,
and a store that cannot read anything are all unchanged.

**Raised by the owner against this record's own first recommendation.** The build
side proposed that either partner may remove the other, on the grounds that it falls
out of the design. The owner rejected it in the plainest terms: *"if I create a
budget and I add my partner I should be the senior of it … they can even take me off
and kick me out."* That is a defect, not a property, and the argument that it fell
out of the design was an explanation standing in for a justification.

## Context

**ADR-013 already assumes a senior person, and nothing enforces it.** Its own
*Removing someone* section says a removed partner gets back in *"only if the owner
gives them the new secret"*, and that the flow is *"rotate, re-share with whoever
stays"*. Both sentences presuppose an owner. But under ADR-013 as built, **anybody
holding enough keys can rotate**, because rotation is simply writing a new blob at a
new address and distributing new secrets. Two people with equal keys are equal in
every way that matters.

The designer found the same hole from the other side: `18`/`18a` are drawn saying
either person may remove the other (**§Q·9·8**), because the drawings had nothing to
distinguish one from the other.

**The failure this allows is not theoretical.** A household budget is exactly the
place where a relationship can end badly. The person who set the budget up, whose
salary and debts it mostly describes, can be locked out of it by the person they
invited. The data on their device survives — ADR-013 guarantees that — but the living
budget, the one both phones were writing to, becomes the other person's.

**What makes this hard is the thing that makes the product good.** There is no
account, so there is no identity to attach a role to, and the store understands
nothing, so it cannot be asked who is in charge.

## Options

### A. Leave it equal, and say so on the screen

What ADR-013 implies today. Costs nothing, needs no change to the store, and the
drawings already say it.

**Rejected by the owner**, and the reason is sufficient: it hands a partner power
over money data they did not create, with no way back for the person who did.

### B. A role recorded in the data, enforced by the app

The snapshot records which key created the budget; only that device offers *remove*.

**Rejected.** It is a convention wearing the costume of a rule. Every device holds
the data key, so a partner who runs anything other than this app — or an older build
of it — can write whatever they like, including a new address that excludes the
creator. **A control that the honest party obeys and the dishonest party ignores
protects nobody.** This project has a name for that shape: a check that has only ever
passed.

### C. The store verifies a signature on every write *(chosen)*

The sync address carries a **public key**. Every write to it is signed, and the store
rejects a write whose signature does not verify against a key it holds for that
address. The creator holds the private key that authorises writers; a partner holds a
writer key the creator granted, and the creator can revoke it.

**The store still cannot read anything.** Verifying a signature over a blob of
ciphertext tells it that the writer was authorised, and nothing whatever about what
the blob contains. It gains one job — *check this signature* — beside the two it
already had, the compare-and-swap and the size cap.

**Cost, stated plainly:** one more keypair to generate, carry and recover, and a
store that is no longer a dumb object bucket. ADR-013's claim that the store needs
*"conditional writes, a rate limit and a size cap, not a service"* is amended by this
record: it now needs signature verification too. That is still not a service, and
still nothing that reads a budget.

### D. Removal requires both parties

Considered and rejected in the same breath by the owner's argument: it is useless in
precisely the case the feature exists for. A partner who is being removed because the
relationship has broken down will not co-operate in their own removal.

## Decision

**The person who creates a budget is senior to anyone they share it with, and that
seniority is enforced by the store rather than by the app.**

| | The creator | A partner they added |
|---|---|---|
| Read the budget | Yes | Yes |
| Add and change transactions, plans, debts | Yes | Yes |
| Authorise another device or person | Yes | **No** |
| Revoke someone | Yes | **No** |
| Rotate the keys and move the budget to a new address | Yes | **No** |
| Keep what is already on their device if removed | — | **Yes, permanently** (unchanged from ADR-013) |
| Start their own budget from what they hold | — | **Yes.** Nothing prevents it, and nothing should |

**What a removed partner loses is the shared budget, not their own copy.** That is
ADR-013's guarantee and it is deliberately untouched: nothing reaches into anyone's
phone.

**Seniority is of the budget, not of the household.** There is no *admin* language on
any screen and no hierarchy of people. The screen says what is true — *you created
this budget, so you decide who can reach it* — and the partner's screen says the
matching thing, which is that they can read and write everything and cannot change
who else can.

### The worst case, named rather than left out

**If the creator loses every one of their keys, nobody can authorise, revoke or
rotate.** The budget keeps working for everyone who still has access, and nobody can
be added or removed, ever.

This is not a new failure: it is ADR-013's recovery story, which is exactly what
2-of-3 exists to prevent, now carrying one more consequence. **The authorising key
is therefore part of what the creator's recovery restores**, not a separate thing to
lose — recovering the budget recovers seniority with it.

**A partner is never stranded by it.** They keep full read and write access to the
budget, and they always have their own copy. What they cannot do is take it over,
which is the entire point.

## Consequences

### Easier

- **The removal flow becomes honest.** `18d` and `18e` can say *you are removing
  Aisha* rather than describing a mutual rotation that either party could start.
- **ADR-013's own wording stops presupposing something nothing enforced.** *"Only if
  the owner gives them the new secret"* is now true because there is an owner.

### Harder

- **The store grows a second job**, and choosing it (**#113**) now has one more
  requirement: conditional writes, a size cap, a rate limit, **and signature
  verification**. Object storage alone no longer answers it.
- **A keypair joins the key material**, so `22a`–`22c` and the recovery flow carry
  one more thing, and §Q·9·2's format question now covers it.
- **Writes get slower by a signature**, which is microseconds, and the blob is 12 KB.

### What must now be done

1. **The designer**: `18`, `18a`, `18d`, `18e` and the chooser lose *either person
   can remove the other*. A partner's view of Household shows what they can and
   cannot do, without the word *admin*.
2. **The spec**: stories **L1–L5** were already void with household roles (§Q·9·8);
   they are rewritten against this record rather than restored.
3. **`docs/02-architecture.md`**: the blob store's row gains signature verification.
4. **The threat model (ITEM-8)**: a new surface — a write signed by a revoked key —
   and the question of what the store does with a signature it cannot verify.

### What would reopen this

- **If sharing is never used by anyone**, the whole mechanism is machinery for a case
  that does not arise, and the simpler equal model returns.
- **If a store that verifies signatures cannot be had on the free tier**, the choice
  becomes seniority or no cost, and that is the owner's again.
