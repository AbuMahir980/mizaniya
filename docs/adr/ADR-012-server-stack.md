# ADR-012: The server stack — TypeScript, Hono, Postgres, Kysely

| Field | Value |
|-------|-------|
| **Status** | **Parked 2026-09-25 — not being decided yet.** Written while planning ahead, then deferred: the design is the critical path, and the server is not started until it is finished and a proper planning pass has happened. **Nothing is waiting on this.** It is on the record so the reasoning is not re-derived later |
| **Date** | 2026-09-25 |
| **Deciders** | Qudus Lawal (stakeholder and owner) |

---

## Context

[ADR-009](ADR-009-repositioning-v1-hosted-webapp.md) put a server in v1 at
`services/api`. [ADR-010](ADR-010-sync-model.md) decided what it does.
[09-endpoint-specs.md](../09-endpoint-specs.md) decided the routes. **Nothing has
decided what it is built with** — the architecture document says `TBD` and the
endpoint spec deliberately stayed provider-agnostic.

Accounts and sync cannot start until this is answered, so it is answered here
rather than by whichever file gets written first.

### One part of this is not a preference

**The server must import `packages/core`.** That is the entire reason the workspace
extraction happened (ADR-008 item 2, pulled forward). It needs:

- `types.ts` — the six entities and the sync metadata,
- `schema.ts` — the Zod validation that decides whether an incoming row is a valid transaction,
- `money`, `cycle` — for anything it must recompute.

A server in Go, Python or Rust would have to **reimplement that validation**, which
means two definitions of what a valid movement is, in two languages, drifting. This
project has been bitten four times in one day by two records of the same fact
disagreeing. Doing it deliberately, across a language boundary, with money, would be
the worst instance yet.

**So the runtime is Node and the language is TypeScript.** That is a consequence of
decisions already made, not a new choice.

---

## Decision (proposed)

| Concern | Choice | In one line |
|---|---|---|
| **Runtime** | **Node 20+** | Forced — the server shares `packages/core` |
| **HTTP** | **Hono** | Tiny, Web-standard, and portable while hosting is undecided |
| **Database** | **Postgres** | The boring correct answer for relational money data |
| **Access** | **Kysely** | Typed SQL you can read, with no hidden query engine |
| **Migrations** | **Kysely's migrator, numbered and forward-only** | Matches the discipline ADR-005 already established |
| **Tests** | **Against a real Postgres**, never a mock | The house rule: test the behaviour, not your agreement with yourself |

### Why Hono

**Hosting is still undecided** (#113), and that is the deciding argument. Hono speaks
the Web-standard `Request`/`Response`, so the same code runs on Node today and on a
platform we have not chosen yet without a rewrite. **It decouples the stack decision
from the hosting decision**, which means #113 cannot invalidate this.

It is also about 14kB and has first-class TypeScript inference, which matters for a
codebase whose whole safety story is the compiler.

**Fastify** is the strongest alternative — more mature, better plugin ecosystem, and
genuinely fast. It is Node-only, which is the one thing we cannot yet promise.
**Express** is ubiquitous and its API predates async/await; its type definitions are
a community effort rather than a design.

### Why Kysely rather than Prisma

This is the choice most likely to be questioned, so the reasoning is explicit.

**Prisma** has the best migration tooling of the three and the worst fit for this
project. It ships its own query engine as a native binary, generates a client you
import, and puts a DSL between you and the SQL. For a money database where the
interesting operations are a sync cursor and a conditional last-write-wins upsert,
**not being able to read the query as SQL is a real cost.**

**Kysely** is a typed query builder and nothing else. The code reads as the SQL it
becomes, the types come from a schema you declare, and there is no engine to reason
about when a query behaves oddly at 2am.

That also matches the instinct in [ADR-001](ADR-001-reactivity-and-the-data-seam.md):
*plain async CRUD, deliberately boring, because three implementations have to honour
it.* The same reasoning applied to the database.

**Drizzle** is a reasonable third answer and closer to Kysely than to Prisma. Kysely
is chosen over it for being thinner still — it declines to own the schema.

### Why a real Postgres in tests

The repository is tested against `fake-indexeddb` rather than a mock, and the
architecture boundaries are tested by **running ESLint on a real probe file**. The
house rule is consistent: *test the behaviour, not your agreement with yourself.*

So the server's tests run against a real Postgres — Docker locally, a service
container in CI. The sync tests are meaningless otherwise: the whole question is what
the database does with a conditional upsert under a concurrent write, and no mock
knows that.

### What is deliberately not decided here

- **The hosting platform** (#113) — Hono exists to keep that separable.
- **The payment provider** — already settled as deferred; the `billing` routes stay provider-agnostic.
- **The aggregator** for bank movement — v1.1.
- **Whether `services/api` is a workspace package.** It is, for the same reason `apps/web` is, but the details belong to the first build ticket rather than an ADR.

---

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Node · Hono · Postgres · Kysely** *(proposed)* | Shares `core/` with no reimplementation; portable while hosting is open; SQL stays readable; one language across the whole repo | Hono is younger than Fastify; Kysely gives you less than Prisma and expects you to know SQL |
| **Node · Fastify · Postgres · Prisma** | The most conventional answer, best-documented, strongest migrations | Node-only, so it couples to a hosting decision not yet made; Prisma hides the SQL and ships a query engine |
| **A non-JS server** (Go, Python) | Better runtime characteristics; some prefer the ecosystem | **Would reimplement `schema.ts` in a second language.** Two definitions of a valid movement, drifting, with money. Rejected on that alone |
| **Serverless functions rather than a server** | Cheap at zero traffic; scales without thought | Sync is a stateful conversation with a cursor, and connection pooling against Postgres from functions is its own problem. Revisitable; not the starting shape |
| **A managed backend** (Supabase, Firebase) | Fastest to accounts and sync by a wide margin | Entitlement and the sync rules are the product's logic, and putting them in someone's dashboard makes them unreviewable and unportable. Also contradicts ADR-008's reason for a public server: the full-stack story is the point |

---

## Consequences

### Positive

- **One language, one validation.** `schema.ts` decides what a valid movement is on both sides of the wire, and there is exactly one copy of it.
- **Hosting stays open.** The stack cannot be invalidated by #113.
- **The SQL is legible**, which matters most for the two queries that carry real risk: the sync cursor and the last-write-wins upsert.
- **Tests exercise a real database**, so the concurrency questions ADR-010 raised are answerable rather than assumed.

### Negative / trade-offs

- **Hono is younger than Fastify**, with a smaller plugin ecosystem. Middleware we would have got for free may need writing.
- **Kysely expects you to know SQL.** That is a feature here and a cost elsewhere.
- **A real Postgres in tests means Docker locally and a service container in CI.** Slower than a mock, and the slowness is the point.
- **Node's runtime characteristics are worse than Go's.** Irrelevant at this scale and worth restating when it stops being irrelevant.

---

## Action Items

0. [ ] **Revisit this at all.** Parked until the design is finished. When it is picked up, it is reviewed rather than assumed — the reasoning below was written before any server existed, and some of it may not survive contact.
1. [ ] **Stakeholder confirms**, or names a different stack.
2. [ ] `services/api` as a workspace package importing `@mizaniya/core`.
3. [ ] Postgres schema, and the migration chain — numbered and forward-only, per ADR-005's discipline.
4. [ ] The test harness: real Postgres, Docker locally, service container in CI.
5. [ ] Only then: auth (§5a), then sync (§5b).

---

## Related ADRs

- [ADR-008](ADR-008-repository-layout.md) — why `core/` is a package the server can import
- [ADR-009](ADR-009-repositioning-v1-hosted-webapp.md) — why there is a server
- [ADR-010](ADR-010-sync-model.md) — what it does, and the two questions the endpoint spec settled
- [ADR-011](ADR-011-encryption-and-data-protection.md) — what it may hold, and rule 7
- [ADR-001](ADR-001-reactivity-and-the-data-seam.md) — the *deliberately boring* instinct applied to the database
