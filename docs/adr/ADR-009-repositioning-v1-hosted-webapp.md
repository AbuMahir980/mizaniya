# ADR-009: Repositioning — v1 is a hosted webapp with a server; mobile becomes v2

| Field | Value |
|-------|-------|
| **Status** | **Accepted** — 2026-09-24 |
| **Date** | 2026-09-24 |
| **Deciders** | Qudus Lawal (stakeholder and owner) |

---

## Context

Until today the roadmap was: **v1** local-first web, **v2** Expo mobile, **v3** a
server for sync, sharing and payments. That order was chosen when the only
audience was the owner and a portfolio reader.

Three facts arrived that the order was not built for.

**1. There is outside interest.** People the owner spoke to may want to use
Mizaniya. Nothing about that is proven — interest in conversation is the weakest
signal in product — but it is a reason to stop building deeper into a
single-owner assumption before testing it.

**2. Reading bank movement requires a server, and that is not negotiable.** The
intended feature is *read-only*: see that ₦12,000 left the account and ask which
envelope it belongs to. Mizaniya never holds, moves or stores money, so none of
the deposit-taking or payment-licensing weight applies. But reading a Nigerian
account means an aggregator (Mono, Okra, Stitch), and an aggregator cannot be
called from a browser: the credentials, the token exchange, the refresh and the
webhooks all need somewhere private to run. **The server stops being a v3 luxury
and becomes the thing the headline feature is made of.**

**3. The monetisation is now concrete.** Manual entry free; automatic movement
detection paid. This is the honest shape for a subscription because it is the one
feature with a real marginal cost — aggregators bill per linked account.

### What this decision is *not* re-deciding

**The architecture already anticipated this.** [ADR-008](ADR-008-repository-layout.md)
reserved `services/api` in the layout, made `apps/admin` a separate app from the
first line, and deferred the server's *visibility* to v3 **against written
criteria** rather than to mood. [ADR-001](ADR-001-reactivity-and-the-data-seam.md)
put every read and write behind the `Repository` interface precisely so a server
could slot in behind the same seam. Nothing below overturns either. This ADR
**pulls the v3 slot forward into v1** and applies ADR-008's criteria now that
there are facts.

### The correction this ADR records

An earlier reading of this plan treated the bank feature as carrying
money-transmission risk. **It does not** — there is no custody, no transfer and
no settlement. What survives is narrower and unrelated to licensing: NDPR applies
to processing the data, and the aggregator's own commercial onboarding is the
practical gate. Recorded because the wrong version was briefly the working
assumption.

---

## Decision

**v1 is a hosted, multi-user webapp with a server. Mobile becomes v2. The work
the documents call "v3" is v1.**

| Version | Was | Is now |
|---|---|---|
| **v1** | Local-first web, single owner, no network | **Hosted webapp**: accounts, sync, a server, a landing page, free and paid tiers |
| **v1.1** | — | **Bank movement sync** — *designed* in v1, built immediately after launch |
| **v2** | Expo mobile | **Expo mobile**, unchanged otherwise |
| **v3** | Server, sync, payments, admin | **Dissolved into v1.** `apps/admin` stays a separate deployment, still not a route in the web app |

**Bank sync is designed now and built second.** The artboards and the endpoint
spec are produced during v1 so nothing is re-cut later, but launch does not wait
on an aggregator contract, webhook infrastructure or a reconciliation UI — and
the aggregator needs a registered business before it will onboard anyone, which
is calendar time the build should not sit inside.

### Repo rule 1 is amended, in writing, here

Rule 1 said: *"A future server for sync, sharing or payments lives in a separate
private repository."* Rule 1 itself, and ADR-008's action item 3, both require
that any change to this be **written down before the work starts**. This is that
writing.

**The server lives in this repository, at `services/api`, public under the same
licence.** Applying ADR-008's criteria as written:

| Criterion | Reading today |
|---|---|
| Entitlement enforced server-side and auditable | **Yes** — that is the design, and it is the only place it can be enforced |
| The full-stack story is worth more than the secrecy | **Yes** — the repository exists to be seen by employers and investors; a hidden server removes the half that proves the hard part |
| Nothing in the code is a secret rather than a key | **Yes today** — aggregator keys, session secrets and webhook secrets are environment variables, which rule 1 already required |
| *Against:* pricing or fraud logic would teach someone to avoid paying | **Not yet.** Nothing of the sort exists |
| *Against:* there are paying users whose trust is the asset | **Not yet — but this becomes true at the first paying user** |

**Infrastructure, secrets and any future fraud heuristics stay private.** The
last criterion is the one that will move: it is the documented trigger to revisit
visibility, and revisiting it means another written amendment, not a quiet change
of practice.

### A rule about user data is needed, and the owner must write it

Repo rule 2 forbids real financial figures **in the repository**. It is silent
about a database, because there was no database. A hosted app holding other
people's salary figures and transaction histories needs the equivalent rule, and
the stakes are higher than rule 2's: a leaked file of invented seed figures is
nothing, a leaked table of real transaction histories is a different category of
event.

The repo rules are recorded verbatim as the stakeholder wrote them and **must not
be paraphrased**, so this ADR does not invent one. It records that **rule 6 is
owed**, and what it has to cover: production data never becomes a fixture, a
screenshot or a seed file; `docs/seed-data.md` stays the only source of figures;
NDPR duties — lawful basis, export, deletion on request, breach notification;
encryption at rest; and a restore from backup that has actually been tested
rather than assumed. Tracked as an action item below, blocking the first real
user rather than the first line of server code.

---

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Reposition now; design bank sync, build it second** *(chosen)* | The `Repository` seam is cheapest to honour before six more screens assume a single owner; the design set is re-cut once instead of twice; launch is not hostage to an aggregator contract | The workspace extraction and the multi-user standards work both come forward; ADR-007's offline claim needs revisiting |
| **Ship the current PWA first, add the server on evidence** | Nearly free — it already builds to static files and the PWA is wired; converts "people seem interested" into evidence in two weeks; fully reversible | Onboards users onto a single-device store with no account, then asks them to migrate; and the bank feature they would actually pay for is exactly the part it cannot show |
| **Build the whole thing, launch complete with bank sync** | Strongest single demo for an investor | Months before any user touches it, the entire feature set designed against guesses, and a per-linked-account cost starting before there is any revenue |
| **Keep the old order — local v1, mobile v2, server v3** | No churn; the plan on the page stays true | Builds T16–T22 against assumptions now known to be wrong, and rebuilds them later. The reason to move is precisely that little has been built yet |

---

## Consequences

### Positive

- The `Repository` interface finally earns what it was built for; the local implementation stays the offline path rather than becoming dead code.
- The design set is re-cut **once**, against the repositioned product, instead of Home being rebuilt twice.
- The full-stack story the repository is meant to demonstrate becomes real rather than promised.

### Negative / trade-offs

- **ADR-008's action item 2 comes forward.** `src/` → `apps/web/` plus `packages/core` extraction was scheduled for v2; `services/api` sharing `core/` means it happens now — workspace configuration across five tools, and CI that builds only what changed.
- **ADR-007 is now partly false.** It says the service worker precaches the app shell because *"there is no network data to cache"*. There will be. Its update path and caching story need an amendment when sync lands.
- **Standards §A6 wakes up and §C5 applies**, exactly as ADR-008 item 5 predicted: every request carries its session scope, and the addendum's single-audience assumption ends. `docs/standards/backend-engineering-standards.md` stops being dormant.
- **A per-user running cost appears** with bank sync, and free hosting tiers with expiring databases become a real risk to user trust rather than a cost saving.
- **#72's design-conformance pass is parked half-done** — Home stays incomplete until the repositioned artboards land. Deliberate: rebuilding it twice is worse.
- **Household sharing makes the sync problem harder than one owner on two devices.** Named, not solved, in [ADR-010](ADR-010-sync-model.md).

---

## Action Items

1. [ ] **Rule 6 — real user data.** The stakeholder writes it verbatim; it is added to `CONTEXT.md` under the repo rules. **Blocks the first real user**, not the first commit.
2. [ ] **[ADR-010](ADR-010-sync-model.md) — the sync model.** Written alongside this; it gates every endpoint and is design-visible.
3. [ ] Re-spec: the system spec's new stories (accounts, sign-in, sync state, tiers, household) and `peer-ai/backend/01-spec-endpoints.md`.
4. [ ] **One design brief** for the new and changed surface, naming what is reusable: landing page, sign-up / sign-in / reset, account and billing, what a locked paid feature looks like, household invite, the signed-out state of every screen, and the reconciliation flow for bank sync. Goes to the designer **after** items 2 and 3.
5. [ ] The workspace extraction (ADR-008 item 2), before `services/api` has a line in it.
6. [ ] Amend ADR-007 for a service worker that now has network data behind it.
7. [ ] Choose hosting, and **verify the free tier's database retention** before committing. A budgeting app that loses a user's data to an expired free database does not get their trust back.
8. [ ] Stop describing the project as open source. It is **source-available** under PolyForm Noncommercial — which is already what the owner wants: readable as proof of work, not commercially reusable by others, all commercial rights retained. No CLA is needed while no outside code is accepted.

---

## Related ADRs

- [ADR-008 — Repository layout](ADR-008-repository-layout.md) — reserved `services/api` and wrote the visibility criteria this ADR applies
- [ADR-001 — Reactivity and the data seam](ADR-001-reactivity-and-the-data-seam.md) — the `Repository` interface the server slots behind
- [ADR-010 — The sync model](ADR-010-sync-model.md) — how the server relates to the local database
- [ADR-007 — PWA and persistence](../02-architecture.md) — partly invalidated; see Consequences
