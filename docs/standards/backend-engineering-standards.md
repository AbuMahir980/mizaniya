# Backend Engineering Standards

The counterpart to `frontend-engineering-standards.md`. Reusable across
projects and languages; examples are given for a Python/FastAPI service and a
Node/TypeScript service where the mechanism differs.

**Who this is for.** Anyone reviewing or extending the backend, including a
session that has never seen it. Everything needed is stated here rather than
assumed.

Each rule is marked **`auto`** (a linter, the type checker or CI fails the
build) or **`review`** (a human must look). A rule marked `review` is a promise
that somebody checks — this document is where that promise is kept.

> Read the project's `security-and-compliance.md` as well where one exists.
> That covers what will *hurt someone* — money, safety-critical data,
> authorisation, law. This covers whether the code is any good. Neither
> replaces the other.

Each project adds a short **addendum** naming its currency minor unit, its
safety-critical data, its audiences/realms, its queue and cache technology,
and any project-only rule. This document does not change per project.

---

## The shape to judge against — read before reviewing

A generic review looks for **route → controller → service → model** and
reports its absence as a defect. Judge the code against the structure the
project's architecture document declares, not against a diagram from
somewhere else. The default shape these rules assume is a **modular monolith**:

```
domains/*        one module per business area: its router + request handlers
services/*       logic used by more than one domain, or too important for a handler
models/*         persistence models
migrations/*     the schema's only source of truth
tests/*
```

A **domain module** owns one area (`orders`, `payments`, `payouts`) and holds
its router together with the handlers for it. Dependency injection replaces a
controller layer. A **service module** holds logic that more than one domain
needs, or that is too important to sit inside a request handler: ledger,
money, security, reconciliation.

---

## A · Architecture

**A1 · One domain module owns one area.** `review`
A handler belongs in the module named for its area. If `orders` needs to know
how a payout is calculated, it calls a service — it does not reimplement it.

**A2 · Domain modules do not import each other's private helpers.** `review`
A leading underscore (or unexported symbol) says private; an import from
another module says otherwise. Both cannot be true. A helper used by several
domains is a service wearing a disguise: move it to `services/` and name it
honestly. Check function-local imports too — a scan of a module's top imports
will not find them.

**A3 · A module over ~600 lines is doing too much.** `review`
Not a hard limit — a threshold that triggers a question: what could move to a
service, or is this really two domains?

**A4 · Business rules live in services, not in handlers.** `review`
A handler reads as: validate input → call a service → shape a response. Money
maths, state transitions and eligibility rules belong in a service that can be
tested without HTTP.

> The example to copy is a pure engine module: given inputs, it returns a
> result and a human-readable reason for every refusal. No database, no HTTP,
> no imports from a domain. It can be tested exhaustively with plain values.
> When a service is hard to test, compare it to that shape.

**A5 · No HTTP concepts in a service.** `auto` (lint) / `review`
A service never raises an HTTP exception, reads a request object, or returns
a status code. It raises a domain error; the handler translates. A service
that knows about HTTP cannot be reused by a worker or a script.

**A6 · The database is reached through the session/connection dependency.** `review`
A module that builds its own engine or connection escapes transaction handling
and pooling.

---

## B · Money — non-negotiable

These extract on the **first** repeat, not the third.

**B1 · Money is an integer in minor units.** `auto`
`amount_minor`, never `amount`. The addendum names the unit. **A float touching
a monetary value is a Critical finding on sight** — no exceptions, no "it is
only a display value".

**B2 · One authoritative money column per value.** `auto`
If a legacy or display column exists (`*_gbp`, `*_naira`), it is a deprecated
mirror; reading it to make a decision is a defect even when it gives the right
answer.

**B3 · Money arithmetic goes through one module.** `review`
Rounding, splitting and commission have one implementation. A second one will
disagree eventually, pennies at a time.

**B4 · Every ledger posting has its counterpart.** `review`
The books balance or they do not. A change that touches posting logic needs a
test that proves balance, not just that the endpoint returns 200. A
financial-regression job in CI defends this.

**B5 · Anything that moves money is idempotent.** `review`
A retried webhook, a double-tapped button or a redelivered job must not pay
twice. Idempotency is keyed on something the caller supplies, never on timing.

**B6 · Provider webhooks verify their signature before any effect.** `auto`
And reject replays: an event id seen before is a no-op, not a reprocess.

---

## C · Authorisation

**C1 · Authorisation is per-resource, not per-role.** `review`
Being authenticated, or even holding a role, is not permission to read *this*
row. Every handler that takes an id proves the caller is entitled to that
specific resource.

**C2 · Role checks happen server-side on every request.** `auto`
Never derived from a claim the client could shape, never cached across
requests.

**C3 · Changing an id in a URL must never return someone else's data.** `review`
Enumerate every id-taking endpoint during review; do not sample.

**C4 · Distinct roles have distinct powers.** `review`
Operations, compliance, support and admin are not synonyms. Releasing money
requires the specific role, not "staff".

**C5 · Audience (realm) is a second axis, independent of role.** `review`
Where a backend serves several apps or tenants, a session is minted for
exactly one audience per sign-in. A valid subject is not enough to accept a
token — it must have been issued for the audience that owns the endpoint.
Refresh re-issues only for its own audience; MFA completion is not an audience
switch. Clients send their audience explicitly; the server never infers it,
because inference prefers the most privileged option and fails silently later.

---

## D · Database and models

**D1 · Migrations are the only source of truth for schema.** `auto`
`create_all`-style helpers are a development convenience that cannot produce
anything a migration writes as raw SQL (sequences, triggers, partial indexes).
Never rely on them for a schema that matters.

**D2 · A model change ships with its migration, in the same pull request.** `auto`
A migration-check job fails the build otherwise.

**D3 · The model declares what the database actually has.** `review`
Including server defaults. When they disagree, autogenerate proposes dropping
defaults the database legitimately has.

**D4 · Know your session's flush behaviour.** `review`
With `autoflush=False`, a row you just added is invisible to the next query
until you flush. Add, then flush, before anything reads it back.

**D5 · Queries are parameterised.** `auto`
No string-built SQL. Every suppression marker must still describe what the
code does — re-check them when surrounding code changes.

**D6 · No N+1 queries on a list endpoint.** `review`
Load relationships explicitly. One query per row passes every test and falls
over on real data.

---

## E · Safety-critical data

The addendum names what is safety-critical in this project (allergens, dosage,
legal deadlines, eligibility that affects a person's rights). Where nothing is,
this section is empty. Where something is:

**E1 · Its publish/commit gate blocks, it does not warn.** `review`
Not by a user, not by an administrator, not by a direct API call.

**E2 · Distinct states stay distinct.** `auto`
"Present", "may be present" and "absent" are three states; collapsing them to a
boolean is a Critical finding. The person asking is the one at risk.

**E3 · It is structural, never free text.** `review`

**E4 · Editing a committed record re-triggers the gate.** `review`

---

## F · Errors and failure

**F1 · No bare `except: pass` / empty `catch`.** `auto`
If swallowing is genuinely correct — cleanup that must not fail the operation
it cleans up after — log it with the exception and say why in a comment.

**F2 · Catching broad exceptions needs a reason.** `auto`
A suppression comment must say what is tolerated and why.

**F3 · No internal detail reaches the client.** `review`
No stack traces, file paths or SQL. Detail goes to the log with a request id;
the client gets something actionable.

**F4 · Never log a secret, a token, or personal data.** `auto`
A redaction filter exists in the logging layer and is not bypassable.

**F5 · A failed operation is reported as failed.** `review`
A disbursement that did not happen is never reported as released.

---

## G · Background work and async

**G1 · Jobs are idempotent and safe to retry.** `review`
Queues redeliver. A job that assumes exactly-once corrupts data.

**G2 · Nothing slow blocks a request.** `review`
Email, push, document processing go to the queue. A confirmation never waits
on a mail server.

**G3 · No blocking call inside an async handler.** `auto`
A synchronous database or HTTP call in an async handler stalls the event loop
for every other request.

**G4 · Workers enforce the same boot guards as the API.** `review`
Any process that can move money runs identical production-safety checks.

---

## H · Types and validation

**H1 · Request and response bodies are typed schemas, not dicts.** `review`
The schema is the contract, and it generates the API spec the clients build
from.

**H2 · Validate server-side on every mutating endpoint.** `auto`
Client validation is user experience, never a control.

**H3 · Type hints on everything public.** `review`

**H4 · No `Any` where a real type exists.** `review`

---

## I · Testing

**I1 · Every money path has a test that proves the amounts.** `review`
Not "the endpoint returns 200".

**I2 · A bug fix ships with the test that would have caught it.** `review`

**I3 · Tests state their precondition.** `review`
A test that needs seeded data checks for it and skips with a reason when
absent, rather than failing for want of data. The same for anything the
machine cannot give (a signal, a port, a clock). Say the text encoding on every
file read; the locale is not a given.

**I4 · Test databases are built by migrations.** `auto`

**I5 · No test depends on another test's residue.** `review`
Chaos tests roll back; fixtures are namespaced.

---

## J · Configuration and secrets

**J1 · No secret in code, ever.** `auto`
Secret scanning runs in CI — and confirm it actually scanned; a crashed
scanner reports the same "no findings" as a clean one.

**J2 · Configuration fails closed.** `review`
An unrecognised environment name is treated as production. One function
defines the environment class; never write a second.

**J3 · Demo conveniences cannot activate in production.** `auto`
Demo passwords, seed shortcuts and sandbox providers are refused at boot by a
production-safety assertion.

---

## K · Dependencies

**K1 · A new dependency needs a justification in the pull request.** `review`
What it does, why nothing present does it, what it pulls in.

**K2 · Versions are named, not floated.** `review`
Name the version you tested against — especially for anything touching
payments or auth.

---

## L · Naming

**L1 · Say what it is.** `review` — `amount_minor` not `amt`; `profile_id` not `pid`.
**L2 · A leading underscore means private** — and is therefore not imported
from another module. `review`
**L3 · Booleans read as assertions.** `review` — `is_published`, `can_book`.

---

## M · Duplication — and where it stops

**M1 · Rule of three.** `review` Duplicate twice freely; extract on the third.
**M2 · Money maths, safety-critical logic and authorisation checks extract on
the FIRST repeat.** `review` A second implementation will disagree, and the
disagreement is pennies, a hospital visit, or someone else's data.
**M3 · Copied logic must not drift silently.** `review` If a rule genuinely
lives in two places, each copy names the other in a comment.
**M4 · Shared behaviour lives in a service, not a private helper imported
across domains.** `review` See A2.

---

## N · Size and complexity

**N1 · A function that needs a comment to explain *what* it does is too long.**
`review` Comments explaining *why* are encouraged.
**N2 · One function, one reason to change.** `review`
**N3 · Nesting past three levels wants an early return.** `review`
**N4 · Modules over ~600 lines get the A3 question.** `review` Size alone is
not a defect; it is the trigger for asking.

---

## O · Performance and scale

**O1 · Every list endpoint paginates.** `auto` No exceptions.
**O2 · Pagination limits come from shared constants.** `review` One answer to
"what is the largest page a client can ask for".
**O3 · No N+1 queries.** `review`
**O4 · Know the cost of a query before shipping it.** `review` Unindexed
filters, four-table joins, `ORDER BY` on unindexed columns; watch any path
that does geographic or aggregate maths per request.
**O5 · Cache only what is expensive to compute and cheap to be wrong about.**
`review` Never cache a decision about money, safety or authorisation.
**O6 · Cache failure degrades, never breaks.** `review` If the cache is down the
request is slower, not failed.

---

## P · API design

**P1 · The contract is the generated spec.** `auto` Typed schemas are the
source; clients generate from it.
**P2 · Error responses have one shape.** `review`
**P3 · List responses have one shape.** `review` `{total, limit, offset, items}`
or whatever is chosen — one, everywhere.
**P4 · Anything that creates or moves money accepts an idempotency key.**
`review` Retry is the normal behaviour of every phone on a patchy connection.
**P5 · Breaking a response shape is a breaking change for every client.**
`review` Add, migrate, then remove — never rename in place.

---

## Q · Concurrency and races

**Q1 · Two people will do the thing at the same time.** `review` If
simultaneous execution would corrupt state, the database prevents it — not the
ordering of the code. (`count(*) + 1` is not an id generator.)
**Q2 · Lock the row you are about to change.** `review` Read-modify-write on a
balance, a capacity count or an escrow state without `SELECT … FOR UPDATE` (or
equivalent) is a race waiting for load. One shared lock helper, not private
copies.
**Q3 · Capacity, escrow and payout state need a test that runs them
concurrently.** `review`
**Q4 · Prefer a database guarantee to an application check.** `review` A
unique constraint cannot be raced; `if not exists` then insert can.

---

## R · Rate limiting and abuse

**R1 · Authentication endpoints are rate limited.** `auto` Login, reset, MFA,
one-time codes.
**R2 · Limits are policy objects, not numbers scattered in handlers.** `review`
**R3 · Limiting degrades open, and says so.** `review` A cache outage must not
become a total outage.
**R4 · Expensive endpoints are limited too.** `review` Cheap to request and
expensive to serve is the shape of a denial-of-service.

---

## S · Observability

**S1 · Every request is traceable end to end.** `review` One request id in the
log line, the trace, and the error the client receives.
**S2 · Logs are structured, never f-strings.** `auto`
`log.info("order placed", extra={"order_id": ...})`.
**S3 · The redaction filter is not optional and not bypassable.** `auto`
**S4 · Money movements emit a metric.** `review` "Is money moving normally
right now" must be answerable without a query by hand.
**S5 · An alert fires on a condition someone would act on.** `review`
**S6 · Health and readiness endpoints are cheap and honest.** `review` Ready
means "can serve traffic", not "the process started".

> Confirm the `auto` lint families actually fail the build. A rule that runs
> with `--exit-zero` reports and never fails, which is the same as not running.

---

## T · Real-time and events

**T1 · A subscription is authorised on every event, not once at connect.** `review`
**T2 · Events are scoped to the recipient.** `review`
**T3 · Retention of streamed personal data is bounded and enforced by a job.** `review`
**T4 · A dropped connection loses nothing that mattered.** `review` State that
only existed in a live stream is state that will be lost.

---

## U · File storage

**U1 · Storage keys are server-generated. Always.** `auto` A client-supplied
path is a traversal attempt waiting to happen.
**U2 · Uploads never travel through the API.** `review` Direct-to-storage
against a ticket; the completion step re-checks the declared size.
**U3 · Private documents are served by short-lived signed links, and access is
audited.** `review`
**U4 · Validate content, not just the extension.** `review`
**U5 · Deleting a record deletes its files.** `review`

---

## What this document is not

It is not a style guide — the formatter owns formatting. It is not the security
review. It is not a reason to rewrite working code: several rules describe
things to *notice*, not fix on sight. Improve where improvement is worth the
risk, and record what you choose not to fix in the project's defect register
rather than in a conversation nobody can find later.
