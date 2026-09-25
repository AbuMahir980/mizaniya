# Security and encryption

*Decided, mostly not built. What protects someone's money data, and what deliberately doesn't.*

> **Status: decided, not built** ([ADR-011](../adr/ADR-011-encryption-and-data-protection.md)).
> There is no server yet, so there is nothing yet to protect. The decisions are made and
> the claims are written down.

## The problem

Today the data sits in one person's browser. If their laptop is stolen, that's their
problem and their device password.

Once there's a server, it isn't. We would be holding other people's salary figures, who
they owe money to and how much, and eventually their bank transaction history. **A
database of that is a serious thing to hold**, and the question is what actually protects
it.

## The short version

Encrypt the sensitive fields with keys kept **outside** the database, so a stolen copy of
the database is not a copy of anyone's finances. Treat bank access tokens as the most
dangerous thing in the system. Never log money values. Record every time anyone looks at
production data. Full end-to-end encryption — where even we can't read it — was examined
and **deliberately deferred**, for reasons below.

## The words first

| Word | What it means |
|---|---|
| **At rest** | Data sitting in storage, not moving. "Encrypted at rest" = the stored copy is scrambled. |
| **In transit** | Data moving over a network. HTTPS handles this. |
| **End-to-end (E2EE)** | Encrypted with a key only the user holds. The server stores something it cannot read. |
| **Key** | The secret that turns scrambled data back into readable data. Where it lives is the whole game. |
| **Aggregator** | A service (Mono, Okra, Stitch) that reads bank data on your behalf. |
| **Access token** | A credential letting us read someone's bank feed. Ongoing access, not a one-off. |

---

## The reasoning, in the order the questions come

### "Is the data encrypted?"

It will be, in three layers, and the middle one is the one that does the real work:

1. **In transit** — HTTPS. Table stakes, nothing interesting.
2. **Encrypted fields, with the key held outside the database.** This is the important one.
3. **Provider encryption at rest** — the disk is encrypted. Useful against a stolen drive, and close to useless against anything else, because whoever can read the database can usually read the disk.

### "Why does 'key outside the database' matter so much?"

Because of the shape real breaches take.

Most breaches are not a film-style live intrusion. They are a **leaked copy**: a database
dump in a misconfigured bucket, a backup file on someone's laptop, an old snapshot nobody
deleted, credentials in a public repo.

If the key lives in the database, the copy contains both the lock and the key. If the key
lives in a secret manager, the attacker has scrambled rows and nothing to open them with.

**That one decision removes the most likely catastrophe.** Not all of them — see below.

### "Why are bank tokens treated differently?"

Because of what they are. The asymmetry is worth stating plainly:

- A leaked **transaction list** is last month's history. Bad, embarrassing, finite.
- A leaked **bank access token** is *ongoing read access to someone's bank account.* It keeps working until revoked.

So tokens get their own key, stricter handling, and are destroyed when someone unlinks
their bank. And the person can cut the connection at any time.

Worth being clear about the boundary: **Mizaniya reads; it never moves money.** No custody,
no transfers, no settlement. That's why none of the payment-licensing weight applies. What
does apply is data protection.

### "What about logs?"

Logs are how this data actually escapes in practice, and it rarely looks like a breach.

Someone debugging adds `console.log(transaction)`. It goes to an error tracker. The error
tracker is a third-party service with its own staff and its own retention. Now someone's
salary is in a system nobody on this project has ever looked at.

So: **financial values never reach a log, an error report, or a monitoring tool.** An
explicit list of what may be logged, short retention, and a check — not a convention,
because a convention survives until the first difficult bug at 1am.

### "How do you support paying customers without reading their data?"

Two halves.

**Every access to production data leaves a record, and users are told that.** Not "we
promise not to look" — a promise is worth what the busiest day is worth. An audit log is
checkable, and the user can ask for it.

**And support is built to ask rather than look.** A "send diagnostics" button the person
presses themselves, which packages state and version — not figures. Most support questions
need to know *what the app did*, not what someone earns.

### "Why not full end-to-end encryption? Isn't that strictly better?"

It's stronger, and it was the owner's first instinct. It was examined properly and
deferred. Three reasons, and the third is the one that decided it.

**1. A forgotten password destroys the data. Permanently.** If the server can't read it,
no reset link can recover it. That isn't a bug to engineer around, it's the direct
consequence of the guarantee. And *"I lost a year of my budget because I forgot my password
and they couldn't help me"* is worse for trust than a breach — a breach is something that
happened *to* the product; this is something the product did on purpose.

**2. Paying customers need support.** "My safe-to-spend looks wrong" can't be answered by
someone who cannot see anything. Fine for a free tool. Corrosive for something billed
monthly.

**3. It can be added later. It cannot be withdrawn.** Launch with *"we cannot read your
data"* and then retreat — because support is impossible, or because people keep losing
budgets — and you have to ask every user to re-key while publicly retracting a privacy
promise. That is a worse day than a breach. The reverse is a natural progression.

**So deferring is the conservative choice here, not the compromise.** It comes back later
as an opt-in, probably paid: *"nobody, including us, can read your data — and nobody can
recover it for you."* That's honest, and the person chooses the trade-off themselves
instead of having it chosen for them.

### "What does this NOT protect against?"

**A live compromise of the running server.** Someone with active access to the application
can read data, because the application must be able to. End-to-end encryption would have
stopped exactly this.

That is the trade, stated plainly so nobody later believes a stronger guarantee was bought.
It's narrower and less likely than a leaked dump, and it's the price of being able to help
a paying customer and rescue someone who forgot their password.

### "And the thing that can't be claimed?"

This matters more than it looks, because it's the tempting sentence.

Bank movement arrives from an aggregator **by webhook, to the server** — a browser can't
hold aggregator credentials. So the server necessarily sees those transactions in plain
text for the length of one request before encrypting them.

- ✅ *"We never store your bank data in readable form."* True.
- ❌ *"Your bank data never touches our servers."* **False.** It has to.

Writing the second would be the most damaging thing this project could do to its own
credibility — and it would be discovered by exactly the kind of person whose opinion
matters.

---

## What's decided, and what's outstanding

| Decided | Outstanding |
|---|---|
| Field-level encryption, key in a secret manager | Choosing the scheme and the library — never improvised |
| Bank tokens: own key, destroyed on unlink | The revocation path, tested |
| Financial values never logged | A check that enforces it |
| Every production access audited | The audit log, and the wording that tells users |
| Support asks, doesn't look | The diagnostics flow (design work) |
| 30-day deletion grace period | Stating it in the product |
| Full E2EE deferred, returns as opt-in | The recovery story, before it ever ships |

**Rule 7** — what the server may hold — is drafted and waiting on the owner's own wording.
It's not binding yet.

## Related

- `sync.md` — what the server is for in the first place
- `data-storage.md` — the device-side data, which is a different threat model
- [ADR-011](../adr/ADR-011-encryption-and-data-protection.md) — the full decision, with the alternatives
