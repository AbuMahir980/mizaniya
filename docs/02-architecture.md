# Architecture: Mizaniya

> **Reshaped 2026-10-08 (ITEM-7)** from the thirteen numbered sections this document
> carried under Peer AI v0, into the twelve Peer AI 1.0 requires. **Every rule,
> number, dependency direction and decision it stated is still stated**, and where the
> template asks for something the project has never recorded, the section says so
> rather than inventing it. Statements the
> [ADR-013](adr/ADR-013-no-accounts-sync-as-an-encrypted-blob.md) decision made false
> — accounts, tiers, Postgres, a server that reads data — are corrected rather than
> preserved, because a document kept in sync is the point. The previous version is in
> git.

## Summary

Mizaniya is a **local-first** web app with no server that holds anyone's data. Every
figure is computed on the device from the records the owner entered, and the device is
the source of truth rather than a cache.

The whole of one person's budget is held in memory as a single snapshot — a few
thousand transactions across several years, comfortably under a megabyte — and every
derived figure is a pure function of it. Writes go to IndexedDB first and only then
update the snapshot, through a `Repository` interface that is the one seam between the
app and where data lives. Domain calculations sit in a framework-free `packages/core`
that imports nothing, so a React Native client can share them unchanged.

**The one idea the architecture is built around: transactions are the only facts, and
everything else is a calculation.** Cash left, safe-to-spend, what is left in each
category, savings moved, debt paid, the projected gap, the zakat estimate — none is
stored. That is standard **B3**, and it is what makes the figures trustworthy: a number
that is recalculated cannot silently disagree with the records that produced it. It
also decides the architecture, because if nothing derived is stored then the only
question left is how a change to the facts reaches the screens showing the
calculations.

Syncing between devices, **designed and not built**, adds no server that understands
anything: the snapshot is encrypted on the device and stored as one opaque blob
([ADR-013](adr/ADR-013-no-accounts-sync-as-an-encrypted-blob.md)).

## Needs it answers

From [docs/01-requirements-summary.md](01-requirements-summary.md) (**D1–D14**),
`docs/product-brief.md` and `docs/standards/`.

| The need | What it drives in the design |
|---|---|
| **One salaried household**, the owner and possibly a partner — not a multi-tenant service | No accounts, no server-side identity, no per-record permission model. Standard **A6**, session scope on every request, stays dormant |
| **Little data per person** — a few thousand transactions over years, under a megabyte | The whole snapshot is held in memory, which makes the simplest design also the correct one (**ADR-001**). It is also why sync can be one 12 KB blob rather than a database |
| **Spending is recorded at the moment it happens** — in a queue, at a fuel station, immediately after paying | Offline is the normal condition, not an error state (**L4**). Writes never wait on a network. This is the need that rules out a server-authoritative design |
| **Money must be exact** | Integer kobo with a branded type, all arithmetic in `core/money` (**ADR-004**, **MONEY-01**, **MONEY-05**) |
| **Every cycle figure depends on today** | Time is a parameter; `core` never reads the clock (**ADR-003**) |
| **Nigerian salary-cycle reality** — paid monthly, rent annually, debts in both directions | The cycle, not the calendar month, is the unit everything is computed against |
| **The owner's financial history is private**, and NDPR applies to processing it | Nothing leaves the device unencrypted; no telemetry at all (**M2**); and repo rule 7 governs anything a server may hold |
| **Durability on a browser that may evict data** (**D12**, **D14** — iOS Safari is the strict case) | Persistence requested after real data exists, true status reported in Settings, nudges on unexported changes, installable (**ADR-007**) |
| **Mobile-first at 360px, correct at 1440px** | Two drawn widths, one component set, no separate mobile build |
| **A React Native client in v2** | `packages/core` is framework-free and shares the `Repository` interface (**ADR-002**) |

**Not recorded, and not invented here:** no availability target, no concurrency figure
and no growth projection has ever been written down for this project. With no server
there is nothing to make available, so an SLO would be about the static host rather
than about Mizaniya. See *Open questions*.

## Parts

| Part | What it owns | Where | Runs on |
|---|---|---|---|
| **App shell** | Routing, layout, providers, error boundary, offline and install prompts | `apps/web/src/app/` | Static bundle |
| **Feature modules** | One folder per screen area. Built: onboarding, home, plan, quick-add, storage status. Specified and not built: transactions, debts, goals, months, settings | `apps/web/src/features/` | Same bundle |
| **UI primitives** | 26 shared components — button, field, sheet, table, gauge, rail, pill, nav, money-text, announce and the rest — every state included (**F6**) | `apps/web/src/ui/` — Radix primitives with Tailwind bound to the tokens | Same bundle |
| **Design tokens** | Colour, type scale, spacing, radius, elevation; light and dark | `apps/web/src/design/` — `tokens.css` holds both palettes, `tokens.ts` exposes them, from `docs/design/tokens.md` | Same bundle |
| **Session store** | The single in-memory snapshot and the actions that change it | `apps/web/src/store/` — Zustand (**B4**, **ADR-006**) | Runtime |
| **`core`** | Every domain calculation and type. No React, no storage, no platform API, no `Date.now()` | `packages/core/src/` — money, cycle, budget, debt, goal, zakat, sync | Shared with v2 |
| **Data layer** | The Dexie implementation of `Repository`, schema migrations, export and import | `apps/web/src/data/` — Dexie 4 | Runtime |
| **Storage** | The database itself | IndexedDB | The owner's browser |
| **PWA layer** | Manifest, icons, service worker precaching the app shell, persistence request | vite-plugin-pwa / Workbox (**ADR-007**) | Static bundle |
| **The blob store** *(designed, not built)* | Holds one opaque encrypted blob per sync address. Understands nothing, validates nothing, reads nothing | Object storage plus a small request handler | Not yet chosen — see *Open questions* |

**`services/api` is gone from this table.** It was listed here as *not built — v1*,
with Node, Hono, Postgres and Kysely from **ADR-012**. ADR-013 removed the database and
the server's knowledge of the data, so what remains is the blob store above:
conditional writes, a rate limit and a size cap, not a service.

**`apps/mobile/`** is v2 (**ADR-002**) and does not exist yet.

## How the parts depend on each other

**Feature-first folders, dependencies pointing inward** (**A1**, **A2**, **A5**), and
`eslint.config.js` fails the build on a violation via `eslint-plugin-boundaries`. These are the directions as the linter actually
declares them:

```
app     →  app, feature, ui, design, store, core
feature →        feature, ui, design, store, core
ui      →                     ui, design,     core
store   →                            store, data, core
data    →                                   data, core
design  →                                   design
core    →  nothing at all
```

So, concretely, and each of these is checkable:

- **`core` imports nothing outside itself** — not React, not Dexie, not the clock
  (**A3**, **ADR-003**).
- **Only `data/` may name Dexie.** No file outside it imports Dexie (**A4**).
- **`ui` may not reach the store or the database.** A primitive takes props.
- **A feature may not reach the database directly** — it goes through the store.
- **Never feature → another feature's internals.** Each exposes its surface through
  `index.ts` (**A5**).

**Nine tests assert these by breaking them on purpose**
(`apps/web/src/architecture.test.ts`), because a rule that has only ever passed is
indistinguishable from one that is switched off.

### Folder layout

```
apps/web/                      the web app
  index.html  vite.config.ts  tailwind.config.ts  postcss.config.js
  public/
  src/
    app/                 routes, providers, layout, error boundary
    features/            onboarding/ home/ plan/ quick-add/ storage/
    ui/                  design-system primitives
    design/              tokens.ts, tokens.css
    store/               the snapshot store and its actions
    data/                database.ts, dexie-repository.ts, export-file.ts

packages/core/                 framework-free domain logic
  src/                 money/ cycle/ budget/ debt/ goal/ zakat/ sync/
                       types.ts       (domain types)
                       schema.ts      (runtime validation)
                       repository.ts  (the interface — see below)

apps/mobile/                   v2, does not exist yet (ADR-002)

tsconfig.json  eslint.config.js  vitest.config.ts  scripts/   at the root
```

**The workspace extraction landed 2026-09-25** (ADR-008 action item 2, pulled forward
because the server was then expected to share `core`).

**One deviation from ADR-008 item 2, deliberate:** it also called for
`packages/tokens`. **Not extracted.** Nothing in the app imports `tokens.ts` — only two
tests do; the app reads the CSS custom properties. A package now would have one
consumer, a test living in another package. The reason it exists is **v2**, where React
Native needs the values and cannot use CSS, so it is extracted then, when it has a real
consumer. Extracting now would be machinery ahead of need, which `performance.md`
argues against.

**`@/` means `apps/web/src`. `core` is imported as `@mizaniya/core/<module>`** —
subpath only, no barrel file, because a barrel over a domain package invites circular
imports and hides which module a dependency came from.

**Every root command is unchanged**: `npm run dev`, `verify`, `seed`, `test`, `lint`
all work from the repository root and mean what they meant before the extraction. Root
scripts delegate into the workspace deliberately, so nobody has to learn a new command
because of an internal move.

**The `Repository` interface lives in `core`, its implementations in `data/`.** This
corrects the first draft of this document, which placed the interface in `data/`
alongside the Dexie implementation. The interface is part of the domain contract every
client shares — the Expo app in v2 must implement it — whereas the implementation is a
platform detail. `core` still imports nothing, so **A3** holds, and `data/` depends on
`core`, which is the direction **A2** requires.

### Rules every part keeps

Each of these is a rule a reviewer checks, not a note, so each names the standard it
comes from.

- **Money.** Every amount is an **integer number of kobo**, carried as a branded type
  so it cannot be confused with an ordinary number:

  ```ts
  type Kobo = number & { readonly __brand: 'Kobo' }
  ```

  No floating point anywhere; `0.1 + 0.2` is the reason. All arithmetic lives in
  `core/money` — **never in a component** (**H3**) — and was extracted on the first
  repeat rather than the third (**E2**), because duplicated money logic drifts and the
  cost of that is not a refactor. Formatting (`₦1,250,000.00`) is one function in the
  same module.
- **Error handling.** Every async surface models its state as a **discriminated union,
  never boolean soup** (**G3**), and handles loading, empty and error explicitly
  (**L1**). Messages say what happened *and what to do next* (**L2**). A failed save
  keeps the entered values and offers a retry — it never silently discards what the
  owner typed.
- **Offline.** Not an error state (**L4**). Spending is recorded when it happens, so
  offline is a normal condition; the banner says where the data is, it does not report
  a fault.
- **Accessibility.** Standards **J1–J5**: 44px targets, labels on every interactive
  element, `prefers-reduced-motion` honoured, WCAG AA contrast in **both** themes, and
  keyboard-only operation proven by an end-to-end test.
- **Authentication and authorisation.** None, and after
  [ADR-013](adr/ADR-013-no-accounts-sync-as-an-encrypted-blob.md) none is planned.
  There is no account and no server that can read anything, so **A6** — session scope
  on every request — has nothing to apply to. It was previously described as dormant
  until household sharing; household sharing now works by holding the key, so there is
  no session to scope.
- **Configuration and secrets.** None. Nothing to authenticate to, so there is no key
  to leak. `.env` stays git-ignored and CI runs secret scanning anyway, so the habit is
  in place before there is anything to protect.
- **Monitoring.** None, deliberately (**M2**, and the addendum). Nothing leaves the
  device. Any later analytics is opt-in and documented.
- **Audiences.** One household, and a second person who uses the same device —
  everything **C5** implies about audiences follows from that. `apps/admin` stays its
  own deployment, never a route in the web app (**ADR-008**).

### The core journey, traced end to end

The addendum's **K1**, which is also the acceptance test.

| # | Step | Path |
|:-:|---|---|
| 1 | **Onboard** | Form → `store.completeOnboarding()` → `Repository.settings.put` + `categories.bulkPut` (seeded list) → snapshot set → redirect to Home |
| 2 | **Set the plan** | Plan screen → `store.setPlannedAmount(categoryId, kobo)` → `Repository.plans.put` → snapshot → `core/budget.unallocated()` recomputes → the unallocated banner updates or disappears at ₦0 |
| 3 | **Quick-add an expense** | Sheet (3 taps) → `store.addTransaction()` → `Repository.transactions.put` → snapshot → selectors recompute |
| 4 | **Safe-to-spend updates** | `core/budget.safeToSpend(snapshot, now)` → `(cashLeft − protectedRemaining) ÷ daysLeft` per **D1** → hero figure re-renders, amber or red as the threshold dictates |
| 5 | **Record a debt payment** | Debts → *I repaid* → `Repository.transactions.put` → snapshot → `core/debt.balance()` recomputes; the balance may cross zero for an ajo counterparty (**D9**) |
| 6 | **Projected gap updates** | `core/goal.projectedGap(goal, snapshot, now)` → `saved + (paydays remaining on or before the due date × planned contribution)` per **D5** → status badge re-renders |
| 7 | **Export** | Settings → `Repository.export()` → snapshot + `schemaVersion` → JSON download → `lastExportedAt` recorded, so the nudge in **D12** resets |
| 8 | **Import into a clean browser** | File → parse → version check → **one Dexie transaction, all or nothing** → snapshot replaced → every screen recomputes |
| 9 | **Identical state** | Every figure on every screen is derived, so the same facts produce the same figures. Nothing stored can have drifted, because nothing derived was stored |

**Step 9 is not a hope. It is a *consequence* of the rule in the Summary** — which is
the return on that decision.

## Data

| Store | Owned by | The one way code reaches it |
|---|---|---|
| **IndexedDB** — the authoritative copy of the owner's budget | `apps/web/src/data/` | The `Repository` interface. Nothing else may touch Dexie (**A4**) |
| **The in-memory snapshot** — the whole dataset, read by every screen | `apps/web/src/store/` | Memoised selectors over pure `core` functions. Never written to directly by a screen |
| **An export file** — a complete snapshot as JSON the owner holds | `apps/web/src/data/export-file.ts` | `buildExportFile`, and an atomic version-checked import (**ADR-005**) |
| **The sync blob** *(designed, not built)* | The device encrypts it; the store holds it | One opaque ciphertext per address. The store cannot read it (**ADR-013**) |

**Where the structure comes from.** The schema is defined in code —
`apps/web/src/data/database.ts` for the Dexie stores, and `packages/core/src/types.ts`
with `schema.ts` for the shapes and their runtime validation. There is no separate
schema file, and no migration tool: migrations are a chain of pure functions keyed on
`schemaVersion` (**ADR-005**), currently at **v2**, which added `updatedAt` to every
entity and deletions as tombstones (**ADR-010**).

**What is especially sensitive, and where it is kept.** All of it — a complete record
of one household's income, spending, debts and savings. Repo rule 7 calls a leak of
real financial history *"a different category of event"*. It is kept **only** on the
owner's device, and the encrypted blob is the only copy that ever leaves it. No
figure is ever logged; `docs/seed-data.md` is the only source of figures anywhere in
the repository, fixtures, tests and screenshots included (repo rule 2).

## Contracts

| Contract | Its one source of truth |
|---|---|
| **`Repository`** — the seam between the app and where data lives | `packages/core/src/repository.ts`. The generated document in [docs/04-api-contract.md](04-api-contract.md) is derived from it and says it is hand-checked |
| **The export and import file** — `schemaVersion`, and what a valid snapshot is | `packages/core/src/types.ts` and `schema.ts`, as types plus Zod validation written once |
| **Design tokens** | [docs/design/tokens.md](design/tokens.md) is authoritative for values; `apps/web/src/design/tokens.css` implements them |
| **The blob format** *(designed, not built)* | ADR-013. Not yet written as a contract — see *Open questions* |

`Repository` is **plain async CRUD**, deliberately boring, because it has to survive
three implementations: Dexie today, a blob sync next, and SQLite in v2.

```
Repository
  settings      get / put
  categories    list / put / delete
  plans         listByCycle / put
  transactions  list(range) / put / delete / bulkPut
  debts         list / put / delete
  goals         list / put / delete
  export()      → snapshot
  import(s)     → void   (atomic; all or nothing)
```

**No query language, no observables, no Dexie types cross this line.** A method that
could not be implemented over a network without heroics does not belong in the
interface.

### How a write reaches the screen

The central decision, recorded in full as
**[ADR-001](adr/ADR-001-reactivity-and-the-data-seam.md)**. One order, always:

```
  UI event  →  store action
                 │
                 ├─▶ 1. Repository.put(...)   ← the device is written FIRST
                 ├─▶ 2. update the snapshot    ← only if the write resolved
                 └─▶ 3. selectors recompute    ← pure core functions
```

A write that fails never reaches the snapshot, so the screen cannot show a figure the
database does not support. A failed save keeps what the owner typed and offers a retry
(**L2**).

## Outside services

**None in the built app.** Nothing is called, nothing is sent, and there is no key to
hold. That is why repo rule 1's prohibition on secrets costs nothing today.

| Designed, not built | What is sent | When it is down |
|---|---|---|
| **The blob store** (ADR-013) | One opaque ciphertext, and nothing else. No identity, no metadata beyond an address | **The app keeps working.** The device is authoritative, so a store that cannot be reached means sync waits, not that the budget stops. The owner is told sync is behind, not shown an error |
| **A metal price source**, for the zakat nisab | Nothing. It is a read | The nisab is **stale, not empty**: the last known value is used and the screen says how old it is (**ADR-013** keeps this, and `docs/06-page-specs.md` §7.10 specifies it) |

**Bank movement reading is deferred entirely**, not designed as an outside service.
An aggregator cannot work under this architecture, since its credentials would have to
live in a browser bundle (**SEC-11**, repo rule 1), and the feature waits on evidence
that anyone wants it (ADR-013).

## Where it runs

**One environment: production.** No staging, no per-environment build, and no
environment variable the app reads at runtime.

| Part | Where it runs | How a change reaches it |
|---|---|---|
| **The app** | A static bundle on a CDN. Vercel is the intent; Netlify and Cloudflare Pages are equivalent for a static PWA | Merge to `main`, then a static deploy. Nothing is built per environment |
| **The blob store** *(not built)* | Object storage plus a small request handler | Not yet chosen — issue **#113**, and ADR-013 reduced it to a question about conditional writes, rate limits and a size cap rather than a database |

**Nothing merges red.** `.github/workflows/pr-checks.yml` runs verify — naming,
spacing, lint, typecheck, tests, build — plus a repo-rules guard and secret scanning;
`.github/workflows/peer-ai.yml` runs the Peer AI gate. `npm run ci:premerge <pr>` must
say `ALLOWED` before any merge, whatever the base branch, because branch protection
only ever guards `main` and is **still off** (**#112**).

## Decisions

Every decision now has its own file in [`docs/adr/`](adr/), one per decision.
ADR-003 to ADR-007 were extracted from a table in this document on 2026-10-08
(ITEM-7); their wording is unchanged, and where the original row recorded no context
or no alternative, the file says so.

| Decision | Status |
|---|---|
| **[ADR-001](adr/ADR-001-reactivity-and-the-data-seam.md)** — in-memory snapshot with a plain async `Repository`; the UI never touches Dexie | Accepted |
| **[ADR-002](adr/ADR-002-where-core-lives.md)** — where `core` lives: a folder, or a workspace package | Accepted; the package was chosen and extracted 2026-09-25 |
| **[ADR-003](adr/ADR-003-time-is-a-parameter.md)** — time is a parameter; `core` never reads the clock | Accepted |
| **[ADR-004](adr/ADR-004-money-is-integer-kobo.md)** — money is integer kobo with a branded type | Accepted |
| **[ADR-005](adr/ADR-005-export-carries-a-schema-version.md)** — export carries a `schemaVersion`; import is atomic and version-checked | Accepted |
| **[ADR-006](adr/ADR-006-zustand-as-the-single-client-store.md)** — Zustand as the single client store (**B4**), its one dependency justified per **N1** | Accepted |
| **[ADR-007](adr/ADR-007-pwa-and-persistence.md)** — PWA, and persistence requested after the first meaningful write | Accepted, amended twice |
| **[ADR-008](adr/ADR-008-repository-layout.md)** — repository layout | Accepted |
| **[ADR-009](adr/ADR-009-repositioning-v1-hosted-webapp.md)** — v1 as a hosted webapp with a server | Accepted as history; **its premise is superseded by ADR-013** |
| **[ADR-010](adr/ADR-010-sync-model.md)** — the sync model, local-first with the server as sync target | Accepted; **part 2 rebuilt by ADR-013**, parts 1 and 3 stand |
| **[ADR-011](adr/ADR-011-encryption-and-data-protection.md)** — encryption at rest, end-to-end deferred | Accepted; **its deferral is reversed by ADR-013**, on the conditions it wrote down |
| **[ADR-012](adr/ADR-012-server-stack.md)** — the server stack | **Superseded, unbuilt**, by ADR-013 |
| **[ADR-013](adr/ADR-013-no-accounts-sync-as-an-encrypted-blob.md)** — no accounts; sync as one encrypted blob | **Accepted** 2026-10-08 |

## Risks

Most serious first. Each is a thing to do, not a worry.

1. **The sync merge will be the most dangerous code in the product.** One blob means a
   merge bug can corrupt every device's copy, and there is no server-side copy to fall
   back on because the store cannot read one. ADR-013 requires the store to keep the
   previous version and the merge to be tested exhaustively with plain values. **Not
   built, so not yet a live risk — but it is the one to design for.**
2. **No threat model exists**, and the project map reports it missing for the mvp
   stage. It was blocked on *what is the server*; ADR-013 answers that, so the surface
   is now small and specific: the blob store, the recovery secret, and an imported
   file.
3. **An imported file is untrusted input and its abuse cases are untested.** Validation
   is schema-based rather than hand-rolled, so **SEC-06** holds, but there is no test
   for a future `schemaVersion`, a money value as a string, or a demo-flagged file
   restored into a real session — which issue **#106** records as a real risk.
4. **Nothing watches the dependencies.** No audit runs on change or on a schedule, and
   `npm audit` currently reports 18 vulnerabilities, 2 critical, all in the build and
   test toolchain rather than the shipped bundle. Recorded as an open finding against
   ITEM-1 and ITEM-3.
5. **Two length rules are deferred rather than met.** TS-07 (function length) and
   REACT-03 (component file length) report instead of blocking, with the owner's name
   on the deferral and **ITEM-2** as the item that ends it: sixteen functions and eight
   files are over, all in the five built screens, which are due to be rebuilt against
   the artboards.
6. **Branch protection is off** (**#112**), so nothing but the pre-merge gate stops a
   red merge. gitleaks is also pinned to a mutable tag rather than a commit.

**Where the code breaks this architecture today: nowhere that is known.** The nine
architecture tests pass, `core` imports nothing, and no file outside `data/` names
Dexie. That is asserted by tests rather than by reading.

## Open questions

Each needs the owner, or an outside fact nobody has checked yet.

| Question | Who answers it |
|---|---|
| **Which object store and request handler**, and does its free tier survive? **#113.** ADR-013 reduced this to conditional writes, rate limits and a size cap — but the retention must be verified in the provider's own documentation, not assumed | The owner |
| **Is WebAuthn's PRF extension usable** on the browsers people here actually use? If not, the passkey recovery factor cannot be built and the phrase becomes the only one, which changes ADR-013's recovery story materially | An outside fact; must be read in the browsers' own documentation |
| **Branch protection** on `main`, and pinning gitleaks to a commit. **#112** | The owner, it is a repository setting |
| **Should savings destinations carry a riba marker?** A religious position about named third parties. **O4** | The owner |
| **Irregular income** — the float model. **O5**, v2 scope at minimum | The owner |
| **Does `17d-cash-in-hand` survive** independently of bank linking? | The designer |
| **No availability target, concurrency figure or growth projection** has been recorded. With no server there is little to make available, so this may be correctly absent rather than missing | The owner |

**Both of the open choices this document used to carry are closed.** Where `core`
lives was settled by ADR-002 and the extraction; the amber threshold for safe-to-spend
was settled as **D15** in the system spec.

## Sources

- **Written from** [docs/01-requirements-summary.md](01-requirements-summary.md)
  (**D1–D14**), `docs/product-brief.md`, `docs/standards/`, and the decision records in
  [`docs/adr/`](adr/).
- **And from the code**, read at commit `d9eab03` on 2026-10-08: `eslint.config.js` for
  the dependency directions as the linter declares them rather than as prose describes
  them, `apps/web/src/architecture.test.ts` for what is asserted, `packages/core/src`
  for the module layout, and `apps/web/src/data/database.ts` for where the schema lives.
- **People asked:** Qudus Lawal (stakeholder and owner), through 2026-09-10 to
  2026-10-08.
- **What changed in this version, and why.** Reshaped from thirteen numbered sections
  into the twelve of Peer AI 1.0's architecture template (ITEM-7), because the project
  moved to Peer AI 1.0 and a document in the old shape could not be checked. Nothing it
  stated was dropped. What was **corrected** rather than preserved: the Parts table no
  longer lists `services/api` with Postgres, the constraints no longer describe v1 as a
  hosted multi-user webapp with tiers, and authentication is no longer described as
  arriving in v1 — all three were made false by
  [ADR-013](adr/ADR-013-no-accounts-sync-as-an-encrypted-blob.md), and a document kept
  in sync is the reason to correct them rather than archive them. ADR-003 to ADR-007
  moved out of §11 into their own files, unchanged in wording.
