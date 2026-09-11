# ADR-008: Repository layout — monorepo for the clients, server visibility deferred

| Field | Value |
|-------|-------|
| **Status** | **Accepted** — 2026-09-11 |
| **Date** | 2026-09-11 |
| **Deciders** | Qudus Lawal (stakeholder and owner) |

---

## Context

Three things are coming that v1 does not have, and they arrived in the
conversation rather than in the brief:

1. **v2** — an Expo mobile app sharing `core/`. Already planned (ADR-002).
2. **v3** — a server: sync, email authentication, and the monetised features.
3. **An admin page** — not previously recorded anywhere.

Repo rule 1 already decides part of this, verbatim and binding:

> *"A future server for sync, sharing or payments lives in a separate private
> repository."*

The stakeholder proposed a monorepo instead — one folder holding everything.
That is not a small change of shape; it collides with repo rule 1, because
**a repository has one visibility setting.** So the question has to be split
before it can be answered.

### The two questions people merge into one

| Question | Answer available |
|---|---|
| Should the clients live in one repository? | Yes, independently of anything else |
| Should the **server** be public? | Depends on facts we do not have yet |

The project has two stated purposes that pull against each other here. It exists
**to be seen** — portfolio, the React Native case study — and it is meant to be
**monetisable**. A public monorepo containing the server publishes the sync
internals and the entitlement rules. PolyForm Noncommercial makes commercial
reuse unlawful; it does not make it difficult.

### What comparable projects do

Not "big tech" — Google does not publish Search. The relevant precedent is
companies with this exact tension: public code, paid hosted product. The pattern
is consistent across them: **publish the product, keep the control plane
private**, and where paid features share a repository, they sit in a clearly
marked directory under a different licence. Most of them are monorepos.

### The fact that changes the calculation

**Hiding payment code does not protect a payment system, and nobody does it.**
Payment providers publish their entire APIs. What protects the system is:

1. keys in environment variables — already repo rule 1;
2. **the server deciding entitlement**, never the client;
3. webhook signatures verified before anything is trusted.

If billing is only safe while the source is unread, it is already broken. What
genuinely stays private elsewhere is narrower: fraud heuristics, internal
operational tooling, and pricing rules that would show someone how to get free
access.

---

## Decision

**A monorepo for everything the owner runs. The server's visibility is decided
at v3, not now. Repo rule 1 stands until it is deliberately amended.**

```
mizaniya  (public, PolyForm Noncommercial)
  apps/web          v1 — today's src/
  apps/mobile       v2 — Expo
  apps/admin        v3 — separate app, separate deployment
  packages/core     domain, types, Repository interface, money
  packages/tokens   token values only; the CSS stays with the web app
  docs/  peer-ai/

  services/api      v3 — public or a private submodule, decided then
```

**Three consequences that are decided now:**

- **Admin is a separate app, never a route inside the web app.** Bundling it
  ships admin code to every owner's browser and turns a routing bug into
  privilege escalation. It has nothing to administer until a server exists, so
  it is a v3 concern — but the layout must be able to hold it.
- **`ui/` is not shared between web and mobile.** DOM and Tailwind do not cross
  to React Native. Two `ui/` folders, **one token source**. A shared `packages/ui`
  is the classic monorepo mistake: an abstraction that fits neither.
- **The timing does not change.** ADR-002 rejected a workspace in v1 because it
  threads configuration through five tools before a screen exists. The monorepo
  is simply the shape the v2 extraction takes.

### The criteria for deciding the server at v3

Written down now so the decision is made on evidence rather than mood:

| Decide **public** if | Decide **private** if |
|---|---|
| Entitlement is enforced server-side and auditable | Pricing or fraud logic would teach someone how to avoid paying |
| The full-stack story is worth more than the secrecy | There are paying users whose trust is the asset |
| Nothing in the code is a secret rather than a key | Something only works because it is unread |

The expectation on today's evidence is **public API, private infrastructure and
secrets** — but there is no server, no users and no payments, so deciding now
would be deciding without information.

---

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Monorepo for clients, server deferred** *(chosen)* | Repo rule 1 untouched; portfolio intact; one place for web, mobile and admin; `core/` shared atomically; the hard call is made when there are facts | `services/api` is an empty promise in the layout until v3 |
| **One public monorepo including the server** | Simplest possible story; strongest portfolio; matches several open-core companies | Amends repo rule 1 before there is anything to protect; publishes entitlement rules that do not exist yet, so the risk cannot even be assessed |
| **One private monorepo** | Everything hidden | **Destroys the project's primary purpose.** It exists to be seen |
| **Two repositories, no monorepo** *(status quo)* | No change at all | Web and mobile drift; `core/` has to be published or vendored to be shared; every cross-cutting change becomes two pull requests |

---

## Consequences

### Positive

- Web, mobile and admin share one `core/`, one set of tokens, one CI, and change together in one commit.
- Repo rule 1 is not amended by accident, and the server decision is made against written criteria.
- Admin is architecturally separate from the first line of code rather than extracted from a route later.

### Negative / trade-offs

- The layout names `services/api` before it exists, which is a promise to keep.
- Monorepo tooling has a real cost — workspace configuration, and CI that builds only what changed. Paid at v2, not now.
- If the server does end up private, the contract in `packages/core` has to reach it by publishing or vendoring. That seam exists either way; the monorepo does not remove it.

---

## Action Items

1. [x] Cross-package imports use the `@/` alias; intra-`core/` imports stay relative, because `core/` moves as a unit. Done 2026-09-11 — it turns the v2 move into a prefix swap rather than a per-file rewrite.
2. [ ] At v2: create the workspace, move `src/` → `apps/web/`, extract `packages/core` and `packages/tokens`. First task, before any Expo screen (ADR-002).
3. [ ] At v3: decide `services/api` visibility against the criteria above, and amend repo rule 1 **in writing** if the answer is public.
4. [ ] At v3: `apps/admin` as its own deployment with its own authentication. Never a route in `apps/web`.
5. [ ] At v3: **A6 wakes up** — every request carries its session scope. The addendum's single-audience assumption ends and **C5** applies.

---

## Related ADRs

- [ADR-002 — Where `core/` lives](ADR-002-where-core-lives.md) — this is the shape its extraction takes
- [ADR-001 — Reactivity and the data seam](ADR-001-reactivity-and-the-data-seam.md) — the `Repository` interface is what lets v3 slot in behind the same seam
