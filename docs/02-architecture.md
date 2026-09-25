# System Architecture — Mizaniya v1

| Field | Value |
|---|---|
| **Date** | 2026-09-10 |
| **Phase** | 2 · Architect |
| **Inputs** | [docs/01-requirements-summary.md](01-requirements-summary.md) (D1–D14), `docs/standards/`, `docs/product-brief.md` |
| **Status** | Accepted. ADR-002 chosen (option A) and D15 settled in SYSTEM SPEC; §12's open choices are both closed. |

---

## 1 · What this document is for

It fixes the shape of the system before any screen is specified or any code
written: what the pieces are, where the boundaries sit, how a write reaches the
screen, and which decisions were made on purpose rather than by accident.

The detailed `Repository` method signatures and the export schema belong in
**API CONTRACT** (`docs/04-api-contract.md`), not here.

---

## 2 · Constraints, already fixed

Not reopened in this phase:

- **Local-first** — but no longer *server-less*. The device stays the source of truth and the app works fully offline ([ADR-010](adr/ADR-010-sync-model.md)); accounts and sync arrive in v1 with the repositioning (**ADR-009**). The original wording — *"no server, no accounts, no network, no telemetry in v1"* — held until 2026-09-24 and is kept here as history, because "local-first" now means *the phone is in charge*, not *there is nothing else*.
- **IndexedDB via Dexie, behind a `Repository` interface** (standard **A4**).
- **A framework-free `core/`** holding cycle maths, safe-to-spend, rollover, projected gap, zakat estimate and money (standard **A3**).
- **React 19 + TypeScript + Vite**, mobile-first at 360px, correct at 1440px.
- **Feature-first folders**, dependencies pointing inward (**A1**, **A2**, **A5**).
- **v1 is a hosted webapp with a server** since the repositioning of 2026-09-24 (**ADR-009**): accounts, sync, free and paid tiers, and bank-movement reading designed in v1 and built as v1.1. **v2** is Expo/React Native sharing `core/`. **There is no v3** — its contents moved into v1, `services/api` is public, and repo rule 1 is amended in writing in `CONTEXT.md`. The sync model is **ADR-010**.
- Money in **kobo**; `docs/seed-data.md` is the only source of figures.

---

## 3 · The one idea the architecture is built around

**Transactions are the only facts. Everything else is a calculation.**

Cash left, safe-to-spend, what is left in each category, savings moved, debt paid, the
projected gap, the zakat estimate — none of these are stored. Each is a pure
function of the transaction list plus the plan plus today's date. That is
standard **B3**, and it is what makes the app trustworthy: a figure that is
recalculated cannot silently disagree with the records that produced it.

It also decides the architecture. If nothing derived is stored, then the entire
question becomes *how does a change to the facts reach the screens showing the
calculations* — which is section 6.

---

## 4 · Components

| Component | Purpose | Technology | Deployment |
|---|---|---|---|
| **App shell** | Routing, layout, providers, error boundary, offline and install prompts | React 19, React Router | Static bundle |
| **Feature modules** | One folder per screen area: onboarding, home, plan, transactions, debts, goals, months, settings | React + TypeScript | Same bundle |
| **UI primitives** | Button, Input, Select, Card, Sheet, StatTile, ProgressBar, Badge, Tabs, Toast, EmptyState, Table — every state included (**F6**) | Radix + Tailwind bound to tokens | Same bundle |
| **Design tokens** | Colour, type scale, spacing, radius, elevation; light and dark | `apps/web/src/design/tokens.ts`, generated from `docs/design/tokens.md` | Same bundle |
| **Session store** | The single in-memory snapshot of all data, and the actions that change it | Zustand | Runtime |
| **`core/`** | Every domain calculation and type. No React, no storage, no platform APIs, no `Date.now()` | Pure TypeScript | Shared with v2 |
| **Data layer** | The Dexie implementation of `Repository`, schema migrations, export/import | Dexie 4 | Runtime |
| **Storage** | The database itself | IndexedDB | The owner's browser |
| **PWA layer** | Manifest, icons, service worker precaching the app shell; persistence request | vite-plugin-pwa (Workbox) | Static bundle |
| **`services/api`** *(not built — v1)* | Sync, email auth, entitlement, household sharing, payments, and the aggregator integration for bank movement (v1.1) | Node · Hono · Postgres · Kysely — **[ADR-012](adr/ADR-012-server-stack.md)** — **parked**, not decided | **Public, in this repository** — **[ADR-009](adr/ADR-009-repositioning-v1-hosted-webapp.md)**; sync model **[ADR-010](adr/ADR-010-sync-model.md)** |

### Dependency direction (A2)

```
app/  ──▶  features/  ──▶  ui/  ──▶  design/
                │
                ▼
           store (Zustand)
                │
                ├──▶  core/       (pure calculations — imports nothing)
                └──▶  data/       (implements core/'s Repository)
                                        │
                                        ▼
                                  dexie implementation
                                        │
                                        ▼
                                    IndexedDB
```

Never the reverse, and never feature → feature. `core/` imports nothing at all.
Only `data/` may name Dexie; **no file outside `data/` imports it**, enforced by
`import/no-restricted-paths` (**A4**).

### Folder layout

**Amended 2026-09-25 — the workspace extraction landed** (ADR-008 action item 2,
pulled forward from v2 because `services/api` must share `core/`).

```
apps/web/                      the web app
  index.html  vite.config.ts  tailwind.config.ts  postcss.config.js
  public/
  src/
    app/                 routes, providers, layout, error boundary
    features/
      onboarding/  home/  plan/  transactions/
      debts/  goals/  months/  settings/
    ui/                  design-system primitives
    design/              tokens.ts, tokens.css
    store/               the snapshot store and its actions
    data/                dexie-repository.ts (implementation)
                         migrations/
                         export-import.ts

packages/core/                 framework-free domain logic
  src/                 money/  cycle/  budget/  debt/  goal/  zakat/  sync/
                       types.ts       (domain types)
                       schema.ts      (runtime validation)
                       repository.ts  (the interface — see note below)

services/api/                  not built yet (ADR-009)
apps/mobile/                   v2 (ADR-002)

tsconfig.json  eslint.config.js  vitest.config.ts  scripts/   at the root
```

**One deviation from ADR-008 item 2, deliberate:** it also called for
`packages/tokens`. **Not extracted.** Nothing in the app imports `tokens.ts` — only
two tests do; the app reads the CSS custom properties. So a package now would have
one consumer, a test living in another package. The reason the package exists is
**v2**, where React Native needs the values and cannot use CSS — so it is extracted
then, when it has a real consumer. Extracting it now would be machinery ahead of
need, which is the thing `performance.md` argues against.

**`@/` means `apps/web/src`. `core` is imported as `@mizaniya/core/<module>`** —
subpath only, no barrel file, because a barrel over a domain package invites circular
imports and hides which module a dependency came from.

**Every root command is unchanged**: `npm run dev`, `verify`, `seed`, `test`, `lint`
all still work from the repository root and mean what they meant before. Root scripts
delegate into the workspace, deliberately, so nobody has to learn a new command
because of an internal move.

Each feature exposes its public surface through `index.ts`; nothing imports
another feature's internal file (**A5**).

**The `Repository` interface lives in `core/`, its implementations in `data/`.**
This corrects the first draft of this document, which placed the interface in
`data/` alongside the Dexie implementation. The interface is part of the domain
contract every client shares — the Expo app in v2 must implement it — whereas
the implementation is a platform detail. `core/` still imports nothing, so
**A3** holds; `data/` depends on `core/`, which is the direction **A2** requires.

---

## 5 · The data seam

`Repository` is **plain async CRUD**. It is deliberately boring, because it has
to survive three implementations: Dexie today, **HTTP in v1** since the
repositioning, and SQLite in v2. The HTTP one **wraps** the local implementation
rather than replacing it (ADR-010), so writes still land on the device first.

Shape only — the real signatures are the API CONTRACT's job:

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

**No query language, no observables, no Dexie types cross this line.** A method
that could not be implemented over HTTP without heroics does not belong in the
interface.

---

## 6 · How a write reaches the screen

The central decision, recorded in full as
**[ADR-001](adr/ADR-001-reactivity-and-the-data-seam.md)**.

One person's budget is small — a few thousand transactions across several
years, comfortably under a megabyte. That single fact makes the simplest design
also the correct one.

**The whole dataset is held in memory as one snapshot.** Every derived figure is
computed from it by pure `core/` functions, through memoised selectors. Writes
follow one path and one order:

```
  UI event
     │
     ▼
  store action
     │
     ├─▶ 1. Repository.put(...)      ← IndexedDB is written FIRST
     │
     ├─▶ 2. update the snapshot       ← only if the write resolved
     │
     ├─▶ 3. selectors recompute       ← pure core/ functions
     │
     └─▶ 4. subscribed screens render
```

**Storage is written before memory, always.** If the write fails, the snapshot
is untouched and the UI shows the failure — the screen and the database cannot
end up disagreeing. The reverse order would leave the owner looking at a figure
that no longer matches what was saved, with nothing to detect it.

**The UI never subscribes to Dexie.** Dexie's `liveQuery` would give reactivity
for free, and it was rejected: it puts the storage engine into every component,
which breaks **A4**, and neither SQLite (v2) nor an HTTP API (v3) has anything
like it — so every screen would be rewritten at v2. The Repository stays
portable and the store does the reactivity.

**Multi-tab.** Two open tabs would otherwise drift apart silently. A
`BroadcastChannel` message after each successful write tells other tabs to
reload their snapshot. Cheap, and it closes a gap nobody would notice.

---

## 7 · Time, and why it is a parameter

**No function in `core/` ever calls `new Date()` or `Date.now()`.** Anything
that needs the current moment takes `now` as an argument, supplied once per
render pass from a single place in the app.

*Why:* cycle boundaries, days remaining, the projected gap and the zakat hawl
are all functions of today's date. If `core/` reads the clock itself, none of it
can be tested against a fixed date, a cycle rollover at midnight becomes
non-deterministic, and a bug that only appears on the 29th of February cannot be
reproduced on purpose.

**Dates are calendar dates, not instants.** A transaction stores `YYYY-MM-DD`,
not a timestamp. "The day I spent this" is a calendar fact; storing it as an
instant means a transaction can appear to move to the previous day when the
device timezone shifts — a silent, one-day error in exactly the figures that
matter. Cycle boundaries compare calendar dates only.

---

## 8 · Money

Every amount is an **integer number of kobo**, carried as a branded type so it
cannot be confused with an ordinary number:

```ts
type Kobo = number & { readonly __brand: 'Kobo' }
```

No floating point anywhere; `0.1 + 0.2` is the reason. All arithmetic lives in
`core/money` — never in a component (**H3**), and extracted on the first repeat
rather than the third (**E2**), because duplicated money logic drifts and the
cost of that is not a refactor. Formatting (`₦1,250,000.00`) is one function in
the same module.

---

## 9 · Core journey, traced end to end

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
| 9 | **Identical state** | Every figure on every screen is derived, so the same facts produce the same figures. Nothing stored can have drifted, because nothing derived was stored. |

Step 9 is not a hope. It is a *consequence* of the rule in section 3 — which is
the return on that decision.

---

## 10 · Cross-cutting concerns

**Authentication and authorisation.** None. There is no server, no account and
nobody else's data. Standard **A6** (session scope on every request) is dormant
until household sharing in v3.

**Error handling.** Every async surface models its state as a discriminated
union, never boolean soup (**G3**), and handles loading, empty and error
explicitly (**L1**). Messages say what happened *and what to do next* (**L2**).
A failed save keeps the entered values and offers retry — it never silently
discards what the owner typed.

**Offline.** Not an error state (**L4**). There is no network, so offline is the
normal condition; the banner exists to say *your data is on this device only*,
not to report a fault.

**Configuration and secrets.** None in v1 — nothing to authenticate to. `.env`
stays git-ignored and CI runs secret scanning from the day CI exists, so the
habit is in place before there is anything to leak.

**Deployment.** A static bundle on Vercel or Netlify. No server-side runtime, no
environment-specific build. One environment: production.

**Monitoring.** None, deliberately (**M2**, and the addendum). Nothing leaves the
device. Any later analytics is opt-in and documented.

**Accessibility.** Standards **J1–J5** — 44px targets, labels on every
interactive element, `prefers-reduced-motion` honoured, WCAG AA contrast in both
themes, and keyboard-only operation proven by an end-to-end test.

**Storage durability.** Per **D12**: request persistence after real data exists,
report the true status in Settings, nudge on unexported changes rather than on a
timer, and ship installable. Detailed in **ADR-007**.

---

## 11 · Architecture decisions

Two are promoted to their own files because they have alternatives worth
spelling out and a status that may change. The rest are recorded inline.

| ADR | Decision | Status |
|---|---|---|
| **[ADR-001](adr/ADR-001-reactivity-and-the-data-seam.md)** | In-memory snapshot with a plain async Repository; the UI never touches Dexie | Accepted |
| **[ADR-002](adr/ADR-002-where-core-lives.md)** | Where `core/` lives — a folder now, or a workspace package now | Accepted |
| **ADR-003** | **Time is a parameter.** `core/` never reads the clock; `now` is passed in, and dates are stored as calendar dates (`YYYY-MM-DD`), not instants. *Context:* every cycle figure depends on today. *Consequences:* every calculation is testable against a fixed date and a February bug can be reproduced on purpose; the cost is one extra argument on many functions. | Accepted |
| **ADR-004** | **Money is integer kobo with a branded type**, all arithmetic in `core/money`. *Context:* floating point cannot represent decimal money exactly. *Consequences:* rounding is explicit and testable, and a raw number cannot be passed where an amount is expected; the cost is conversion at every input and output boundary. | Accepted |
| **ADR-005** | **Export carries a `schemaVersion`; import is atomic and version-checked.** Older files migrate through a chain of pure functions; a newer file is refused with a plain explanation rather than partially loaded. Import replaces everything, and the current data is exported to a file first. *Consequences:* an import can never half-succeed, and overwriting live data is recoverable; the cost is a migration chain to maintain from the first schema change. | Accepted |
| **ADR-006** | **Zustand as the single client store** (**B4**). *Alternatives:* Context + `useReducer` — no dependency, but one snapshot in one context re-renders every consumer on every change, which is felt on a phone; Redux Toolkit — more ceremony than one person's budget warrants. *Consequences:* selector-based subscriptions keep re-renders narrow and it works unchanged in React Native for v2; the cost is one dependency, justified per **N1** (~1 KB, no provider, no platform equivalent). | Accepted |
| **ADR-007** | **PWA via vite-plugin-pwa; persistence requested after first meaningful write.** The service worker precaches the app shell only — there is no network data to cache. *Consequences:* the app opens offline, becomes installable, and installation is the single biggest factor in whether the browser evicts the data (**D14**: iOS Safari is the strict case); the cost is a service-worker update path that must not serve a stale shell. | **Accepted, amended 2026-09-25.** *"There is no network data to cache"* stopped being true when ADR-009 added a server — but **the conclusion is unchanged and now rests on a better reason.** It was an absence: nothing to cache, so nothing cached. It is now a prohibition: **the service worker must never cache synced data**, because a runtime cache would be a second copy of the owner's money with its own staleness and nothing able to say which was right — the same argument that keeps derived figures out of storage (**B3**, `derived-state.md`). The shell is still all it precaches. The update path still must not serve a stale shell |
| **[ADR-009](adr/ADR-009-repositioning-v1-hosted-webapp.md)** | **v1 is a hosted webapp with a public server; mobile becomes v2; v3 dissolves into v1.** Bank-movement reading is designed in v1 and built as v1.1. Repo rule 1 amended in writing; a rule about real user data is owed from the stakeholder. | Accepted |
| **[ADR-010](adr/ADR-010-sync-model.md)** | **Local-first with the server as sync target** — per-row last-write-wins, tombstones for deletes, the server providing the order. Derived money figures are never synced, only recomputed. Requires `updatedAt` and soft deletion on every entity (`SCHEMA_VERSION` 2). | Accepted |
| **[ADR-012](adr/ADR-012-server-stack.md)** | **The server stack: Node · Hono · Postgres · Kysely**, tested against a real Postgres. Node is forced rather than chosen — the server imports `packages/core` for `schema.ts`, and a non-JS server would reimplement it, giving two definitions of a valid movement in two languages. Hono because hosting is undecided and it keeps the two decisions separable. Kysely over Prisma because the two queries that carry real risk — the sync cursor and the last-write-wins upsert — should be legible as SQL. | **Parked 2026-09-25** — written while planning ahead, deferred until the design is finished |
| **[ADR-011](adr/ADR-011-encryption-and-data-protection.md)** | **Strong encryption at rest done properly; end-to-end deliberately deferred.** Sensitive fields encrypted with keys held outside the database, bank tokens held higher still, financial values never logged, every production access audited, support by asking rather than looking. Does **not** defend a live server compromise — stated rather than assumed. End-to-end returns as an opt-in once recovery and support are understood. | Accepted |

**A numbering note.** `docs/standards/standards-addendum-mizaniya.md` says the
Expo SDK will be "recorded in ADR-01 when v2 starts". ADR-001 is now taken. The
addendum should say *an* ADR rather than naming a number — a small correction to
make when v2 begins.

---

## 12 · Open choices

Both sides given; the stakeholder chooses, and the choice is recorded in
`CONTEXT.md`.

### Choice A — where `core/` lives (ADR-002)

| | **`packages/core/src/` folder now** | **`packages/core` workspace now** |
|---|---|---|
| Cost today | none | workspace config across Vite, Vitest, ESLint, tsconfig and CI |
| Cost at v2 | move a folder that already imports nothing, then fix import paths | none — Expo consumes the package |
| Boundary enforcement | lint rule (**A3**), from day one either way | lint rule *and* a package boundary |
| Risk | the move is mechanical, but it is a whole-repo diff | added config surface on a project whose constraint is "ship as soon as realistic" |

**Leaning:** the folder. The boundary that actually matters is the import
discipline, and lint enforces that from day one; a folder with no framework
imports is a contained thing to extract later. But if v2 is genuinely the next
thing you build, the workspace pays for itself.

### Choice B — the amber threshold for safe-to-spend

Still open from UNDERSTAND. Three shapes:

1. **A fixed naira figure** — "amber below ₦2,000 a day". Simple, but wrong for anyone whose income changes.
2. **A proportion of the planned daily allowance** — "amber below 60% of plan". Adapts by itself; needs one number chosen once.
3. **Days of cover** — "amber when the remaining cash would not last the remaining days". Arguably what the figure already means, so it may make the state redundant.

**Leaning:** option 2, with the proportion editable in Settings. It is
meaningful on day one and does not need re-tuning after a pay rise. This can be
settled in SYSTEM SPEC.

---

## 13 · What would be revisited, and when

| Trigger | What changes |
|---|---|
| The snapshot stops fitting comfortably in memory (many years of daily records) | Paginate transactions in the repository; keep aggregates in the snapshot. The `Repository` interface already allows a ranged `list` |
| **v2 (Expo)** | Extract `core/` to a package if Choice A went the other way; add a SQLite `Repository` implementation. No screen logic changes |
| **v1 sync and sharing** *(was v3 — **ADR-009**)* | An HTTP `Repository` wrapping the local one; **A6** wakes up; the snapshot needs conflict resolution, which is the first genuinely hard problem this project will have — answered in **[ADR-010](adr/ADR-010-sync-model.md)**, which also finds that no entity carries `updatedAt` or a tombstone, so deletes cannot currently propagate at all. Also `apps/admin` as its own deployment, never a route in the web app (**ADR-008**) |
| A second person uses one device | Audiences, and everything **C5** implies |
