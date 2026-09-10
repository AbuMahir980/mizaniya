# Session Context Log

This file is the **narrative companion** to `.peer-ai-state.json`. Any AI
following the workflow reads **both files** at every session start. The state
file holds structured pointers (phase, ticket, step); this file holds the story
(rules, decisions, daily progress, what's next) and the code-review checklist.

**Update this file** when the user says "update the context", "wrap up", or
"start a new chat", or when context usage is visibly high (~80%).

---

## Repo rules — verbatim, binding on every phase

These are the stakeholder's rules as written. They are not paraphrased here and
must not be paraphrased anywhere else.

1. Public repository under the PolyForm Noncommercial 1.0.0 licence (source-available; the LICENSE file in the root is authoritative — do not add, change or generate any other licence text), built in the open; phase commits named "peer-ai: <phase>". Secrets never enter the repo: any key or credential is read from environment variables, .env is git-ignored, and CI runs secret scanning. A future server for sync, sharing or payments lives in a separate private repository.

2. No real financial data ever enters the repository — not in code, seed files, fixtures, screenshots, issues, docs or commit messages. Seed data is invented and lives only in docs/seed-data.md: take-home ₦450,000 on the 25th; debts owed to "A. Friend" ₦120,000 (₦30,000 a month) and "Spouse" ₦60,000; ₦40,000 owed to me by "B. Colleague"; annual rent target ₦900,000 due 1 March; emergency-fund target ₦150,000.

3. No employer, client or third-party project names anywhere in code, comments, docs or commits.

4. README leads with the problem (salary gone before the month ends, debts in both directions, rent due once a year) and the screenshots, not the stack.

5. docs/standards/ is the rulebook: frontend-engineering-standards.md, backend-engineering-standards.md and standards-addendum-mizaniya.md. Every rule marked auto is enforced by ESLint/tsconfig/CI; every rule marked review is listed in CONTEXT.md as the code-review agent's checklist. Token, primitive and file naming follow frontend sections F and O.

---

## Environment — checked 9 September 2026

Two lines every later phase depends on.

**Client:** Claude Code **desktop app**. This matters: the skills below are
first-party `@inline` account bundles, absent from the marketplace catalogue, so
the client decides whether they exist. The VS Code extension (v2.1.266) did not
surface them; `/plugin` cannot fetch them and no local setting turns them on.
**Run every skill-naming phase in the desktop app.** See the box in
`peer-ai/AGENTS.md`.

**Skills:** all ten named in the `peer-ai/AGENTS.md` table are **present and
offered in this session**.

| Skill | Phase that names it | Present |
|---|---|:-:|
| `engineering:architecture` | Architect | yes |
| `engineering:system-design` | Architect | yes |
| `product-management:write-spec` | System Spec | yes |
| `design:design-system` | Shared Rules, Frontend Rules | yes |
| `design:accessibility-review` | Page Specs, Frontend Rules | yes |
| `design:ux-copy` | Page Specs | yes |
| `engineering:tech-debt` | Issues | yes |
| `engineering:code-review` | Review | yes |
| `engineering:testing-strategy` | Test | yes |
| `engineering:documentation` | Document | yes |

Claude Code's own `/code-review` is built in and is used alongside
`engineering:code-review` in the Review phase.

**Re-check at the start of every phase that names a skill.** A missing skill is
reported and the phase is worked from its file instead — never silently skipped,
because "the skill covered it" is exactly the assumption that leaves a review
half-done.

---

## Learning mode — the contract

This project is built to be understood. The stakeholder reads; they do not type
the code. Do not slow down to make them type.

- **Before each phase:** three or four plain sentences on what it produces and why it comes before the next.
- **Before non-trivial logic** (cycle maths, safe-to-spend, rollover, projected gap, zakat): state the reasoning in steps — inputs, rule, edge cases — *then* write the code.
- **Every file gets a three-line header:** WHAT it does · WHY this pattern over the obvious alternative · ONE SENTENCE to say about it in an interview.
- **`docs/concepts/`** — one short file per concept the first time it appears (repository pattern, IndexedDB, derived state, optimistic UI, idempotent saves, tokens vs hard-coded styles…): what it is, why it is used here, what we would have used instead and why not, and the interview sentence. The stakeholder adds a line in their own words after reading.
- **At each stop:** ask five questions about what was built, and say honestly whether the answers hold up. Log misses in `docs/concepts/revisit.md`.
- **Real trade-offs** are laid out with both sides; the stakeholder chooses; the choice and its reason are recorded in Key Decisions below.

---

## Code-review checklist — every `review` rule

Repo rule 5 requires this list. It is the checklist the code-review agent
(`peer-ai/agents/review-prompt.md`) and Claude Code's `/code-review` are held to.
Rules marked `auto` are not listed: ESLint, tsconfig and CI fail the build on
those, and SHARED RULES maps each one to its enforcement.

Source: `docs/standards/frontend-engineering-standards.md`. **Backend review
rules are dormant until v3** (separate private repo) and are not listed here.

### Active from day one

| Rule | What the reviewer checks | Enforcement note |
|---|---|---|
| **B1** | Server state is not client state — no copying fetched data into local state | `auto` for fetches in `useEffect`; `review` for the copying |
| **B3** | Derived values are derived, never stored | `review` |
| **B4** | Genuinely global client state uses one store | `review` |
| **B5** | Context is for stable, rarely-changing values | `review` |
| **C1** | A prop passes through at most two intermediate components | `review` — countable, so the review is objective |
| **C2** | Fix drilling with composition first, context second, store third | `review` |
| **D2** | A component takes at most seven props | `review` |
| **D3** | A component either fetches or renders — not both | `review` |
| **E1** | Rule of three | `review` |
| **E2** | Rules are exempt from the rule of three | `review` |
| **F4** | Token names are semantic, never literal | `review` |
| **F6** | Every primitive ships with its states | `review` |
| **F7** | Danger colour is reserved for its meaning — here, money going wrong (addendum) | `auto` where the token import can be restricted; else `review` |
| **G3** | State is a discriminated union, not boolean soup | `review` |
| **H3** | No arithmetic on money inside a component | `review` |
| **J5** | Keyboard-only use works end to end (web) | `review` + E2E |
| **K3** | Test behaviour, not implementation | `review` |
| **K4** | A bug fix ships with the test that would have caught it | `review` |
| **L1** | Every async surface handles loading, empty and error explicitly | `review` |
| **L2** | An error message says what happened and what to do next | `review` |
| **L4** | Offline is a state, not an error | `review` + E2E |
| **M1** | No real personal or financial data in the repository | `review` + secret scanning in CI |
| **M2** | Nothing leaves the device without a stated reason | `review` |
| **N1** | A new dependency is justified in the pull request — what it does, why not the platform, what it weighs | `review` |
| **O3** | Say what it is | `review` |
| **O4** | Name things as the user would | `review` |

### Dormant — and why

| Rule | Status |
|---|---|
| **A6** · Every request carries its session scope explicitly | Dormant. The addendum sets a single audience (the owner) for v1–v2. Activates if household sharing arrives. |
| **I1, I2, I4** · Safety-critical data | **Not applicable.** The addendum states this project has no safety-critical data; frontend section I is empty for it. |
| **N3** · Mobile targets one pinned Expo SDK, recorded in an ADR | Activates at v2. The SDK is recorded in ADR-01 when the Expo app starts. |

---

## Current State

**Phase: SYSTEM SPEC, complete.** The repo is still documents only — no
application code exists yet. Step 0, SETUP, UNDERSTAND, ARCHITECT and SYSTEM
SPEC are done. What exists is a full paper trail: fifteen numbered decisions,
seven ADRs, forty user stories with acceptance criteria, and a seeded scenario
with every figure worked through.

Everything rests on one idea: **transactions are the only facts, and everything
else is a calculation.** That is what makes step 9 of the core journey — export,
import into a clean browser, identical state — a consequence rather than a hope.

Four pull requests are open and stacked, each on the one before:
`peer-ai/setup` → `main` → `peer-ai/understand` → `peer-ai/architect` →
`peer-ai/spec-system`. None has CI, because CI does not exist until phase 11b.
**They should be merged bottom-up in order.**

**Next action:** API CONTRACT — `peer-ai/shared/04-spec-api-contract.md`, the
last phase before the stop.

---

## Key Decisions

| Date | Decision | Source |
|------|----------|--------|
| 2026-09-09 | Local-first v1: no server, no accounts, no network. IndexedDB via Dexie behind a `Repository` interface | brief |
| 2026-09-09 | Domain logic in a framework-free `core/` package of pure TypeScript, so React Native (v2) shares it unchanged | brief |
| 2026-09-09 | Money is stored and calculated in **kobo** as a branded `Kobo` type; formatter renders `₦1,250,000.00` | addendum |
| 2026-09-09 | `docs/standards/` is authoritative over peer-ai's own rules files on any conflict; rules are referenced by section number, never copied | repo rule 5 |
| 2026-09-09 | Opus for build, Fable for everything else; never downgrade mid-phase. Peer-ai's cost-tiering removed rather than followed | project convention |
| 2026-09-09 | Skills are invoked *inside* the phase that names them, never as a parallel process | `peer-ai/AGENTS.md` |
| 2026-09-09 | Git: every piece of work on a branch — `feature/<short-description>` for build items, `peer-ai/<phase>` for phase documents — reaching `main` only through a PR with CI green; squash and merge; delete the branch after | stakeholder, this session |
| 2026-09-09 | v1 has **no mock-data layer**. The data seam is `Repository`; the local implementation is the real one. Peer AI's build step 4 assumes an HTTP API and is logged as a framework defect | `docs/peer-ai-feedback.md` #1 |
| 2026-09-10 | **D1 · Protected allocations** are derived from category type (anything not an `Expense`), overridable per category, and measured as `planned − actual` so money already moved is not subtracted twice | UNDERSTAND |
| 2026-09-10 | **D2 · Rollover carries the allowance, not the money.** Cash left comes from transactions and is never touched by rollover, so nothing is counted twice. No expiry in v1; the carried figure is shown on Plan | UNDERSTAND |
| 2026-09-10 | **D3 · Money owed to you counts toward nothing** — not safe-to-spend, not a projected gap — except zakat, where it is a separate line the owner switches on or off, asked once, never ruled on by the app | UNDERSTAND |
| 2026-09-10 | **D4 · Cycle boundaries are nominal.** Salary day clamps to the last day in short months; income arriving up to 3 days early is attributed to the cycle it precedes. The boundary never follows the actual payment, because that would rewrite history silently | UNDERSTAND |
| 2026-09-10 | **D5 · The projected gap counts paydays**, not whole cycles and not pro-rated part cycles. Money arrives in lumps on payday | UNDERSTAND |
| 2026-09-10 | **D6 · The zakat lunar year is asked for**, with a labelled fallback to the first record. Never assumed silently | UNDERSTAND |
| 2026-09-10 | **D7 · Debt transaction types renamed** to plain speech — *I borrowed · I repaid · I lent · They repaid me* — per frontend standard O4 | UNDERSTAND |
| 2026-09-10 | Every cycle is labelled by its **start date**, never a bare month name, because an early salary day makes a cycle span two calendar months | UNDERSTAND (D4) |
| 2026-09-10 | **D8 · Home is ranked, not a grid.** One hero (safe to spend today), four tappable tiles with progress, unallocated as a banner that hides at ₦0, then two tables. Eight equal tiles is the spreadsheet rendered smaller | UNDERSTAND |
| 2026-09-10 | **D9 · Rotating ajo is a debt that crosses zero**, not savings — you lend before your turn and borrow after it. Personal target ajo is a savings goal, so `savings transfer` gains a direction | UNDERSTAND |
| 2026-09-10 | **D10 · Witnesses are an optional list of names** — structured enough to count and print, light enough to skip | UNDERSTAND |
| 2026-09-10 | **D11 · The shareable debt record is a print stylesheet**, not a generated PDF. No dependency, and the browser's Save as PDF gives a real file | UNDERSTAND |
| 2026-09-10 | **D12 · Storage durability is four layers** — request persistence, report the truth in Settings, nudge on unexported changes rather than a timer, and ship as an installable PWA. **No encryption at rest in v1**, because with no server a forgotten passphrase destroys the history permanently | UNDERSTAND |
| 2026-09-10 | **D13 · If the schedule slips, Months ships and Zakat waits.** A wrong zakat figure in a Muslim-facing app is worse than no zakat figure | UNDERSTAND |
| 2026-09-10 | **D14 · iOS Safari is the strict case.** On iOS every browser is WebKit, so Chrome there is Safari — the owner's primary device is governed by the tightest storage rules of the set | UNDERSTAND |
| 2026-09-10 | **ADR-001 · The whole dataset is held in memory as one snapshot**, every figure derived from it by pure `core/` functions. Writes go to IndexedDB **first**, memory second, so the screen and the database can never disagree. Dexie `liveQuery` rejected: it puts the storage engine in every component (breaks A4) and has no equivalent in SQLite or HTTP, so every screen would be rewritten at v2 | ARCHITECT |
| 2026-09-10 | **ADR-003 · Time is a parameter.** `core/` never reads the clock; `now` is passed in. Dates are stored as calendar dates (`YYYY-MM-DD`), not instants, so a timezone shift cannot move a transaction to the previous day | ARCHITECT |
| 2026-09-10 | **ADR-004 · Money is integer kobo with a branded `Kobo` type**, all arithmetic in `core/money`, never in a component (H3), extracted on first repeat (E2) | ARCHITECT |
| 2026-09-10 | **ADR-005 · Export carries a `schemaVersion`; import is atomic and version-checked.** A newer file is refused with a plain explanation rather than partially loaded, and current data is exported to a file before an import overwrites it | ARCHITECT |
| 2026-09-10 | **ADR-006 · Zustand as the single client store** (B4). Context + `useReducer` rejected: one snapshot in one context re-renders every consumer on every change, which is felt on a phone | ARCHITECT |
| 2026-09-10 | **ADR-007 · PWA via vite-plugin-pwa**, shell precached only, persistence requested after the first meaningful write | ARCHITECT |
| 2026-09-10 | Multi-tab drift closed with a `BroadcastChannel` reload after each successful write — two open tabs would otherwise disagree silently | ARCHITECT (ADR-001) |
| 2026-09-10 | **ADR-002 · `core/` stays a `src/core/` folder in v1**, extracted to a package as the first task of v2. What makes it reusable is that it imports nothing, and the A3 lint rule enforces that from day one — so the boundary is real without workspace configuration in five tools | ARCHITECT, stakeholder's choice |
| 2026-09-10 | **D15 · Amber when safe-to-spend per day falls below 60% of the planned daily allowance**, editable in Settings; red only when negative. A proportion stays meaningful after a pay rise, where a fixed naira threshold quietly goes wrong and nobody re-tunes it | SYSTEM SPEC |

---

## What Was Done — By Day

### 2026-09-09 (Wednesday)

- **Step 0 — verified the vendored Peer AI customisation.** Confirmed every phase file carries its `> **Model:` line from `phase-config.json`; confirmed no live cost-tiering wording remains (the only matches are the strip script's own regexes and the feedback doc describing the defect); confirmed `peer-ai/.git` is absent, so the playbook commits as plain files.
- **Corrected the skills record.** An earlier check reported all ten skills missing, having looked only in `~/.claude/plugins/repos/`. They are `@inline` account bundles and are present: verified directly in this session, in the desktop app.
- **SETUP.** Wrote `CLAUDE.md` (project instructions + the workflow driver body, Project settings filled in), this `CONTEXT.md` (repo rules verbatim, environment, learning-mode contract, review checklist), `.peer-ai-state.json`, and `docs/seed-data.md`.
- **Recorded the git convention** in the driver's Project settings and applied it to the driver's build and gate sections, which had described local ticket→milestone merges with no PR.
- **Logged a fourth framework defect** in `docs/peer-ai-feedback.md`: the workflow driver mandates local merges while `shared.md` requires a PR with review, and PR automation is phase 11b — so by the time CI and branch protection exist, the whole build has already merged without them.

### 2026-09-10 (Thursday)

- **First learning-mode stop.** Worked through the review questions from SETUP. Two answers landed on the symptom but stopped short of the mechanism: the stored safe-to-spend field would be too high (B3), and copying rules means editing five places instead of one (E1/E2). Both missed the same half — that nothing would report the fault.
- **Named the pattern and gave it a method.** *What breaks — and who finds out?* Loud problems are cheap; silent ones are expensive. Written up as [docs/concepts/what-breaks-who-finds-out.md](docs/concepts/what-breaks-who-finds-out.md), the first concept note. It reframes B3, E2 and K4 as one rule about detectability wearing three hats.
- **Opened [docs/concepts/revisit.md](docs/concepts/revisit.md)** with that thread logged against the moment it will matter: building safe-to-spend in `core/`, and again at the Home screen.
- **Recorded a standing writing preference:** intelligent but plain — the test is whether the least technical reader could understand and remember it. Applies to docs, file headers, commit messages and the app's own copy.
- **Added `docs/Mizaniya_Kickoff_Pack.md`**, the instructions this build actually runs on. The product brief's §6 had declared itself superseded by a file that was not in the repo.
- **Caught a repo-rule-3 breach before it was committed.** The kick-off pack named another project four times. Redacted, along with local folder paths and a stale filename. Worth noting: **rule 3 is the only repo rule with no automated enforcement** — secret scanning finds keys, not project names, and a denylist committed to a public repo publishes the very names it hides. Raised properly at PR AUTOMATION.
- **Ran UNDERSTAND.** Settled the six open domain questions as D1–D6 plus the D7 rename, each with the rejected option recorded. Wrote [docs/01-requirements-summary.md](docs/01-requirements-summary.md).
- **Surfaced the biggest unflagged risk in the whole design:** IndexedDB is not permanent. Browser eviction or a cleared cache deletes every transaction with no warning to anyone. Logged as assumption A5, to be decided in ARCHITECT.
- **Answered all eight clarification questions** in the same sitting, adding D8–D14. Two changed the shape of the product: Home became a ranked screen rather than a grid of eight tiles, and rotating ajo turned out to be a debt in both directions rather than savings — which is what it actually is, economically.
- **Established that on iOS every browser is Safari underneath**, so using Chrome on an iPhone does not escape WebKit's storage eviction. That makes PWA installability a durability requirement, not a nicety.
- **Ran ARCHITECT** with `engineering:architecture` and `engineering:system-design` invoked inside the phase. Wrote [docs/02-architecture.md](docs/02-architecture.md) with seven ADRs; [ADR-001](docs/adr/ADR-001-reactivity-and-the-data-seam.md) and [ADR-002](docs/adr/ADR-002-where-core-lives.md) promoted to their own files.
- **The architecture reduced to one idea:** transactions are the only facts, everything else is a calculation. Once nothing derived is stored, the only architectural question left is how a write reaches the screens — which is ADR-001.
- **Rejected Dexie `liveQuery`,** the obvious and least-code option, on cost of ownership: it puts the storage engine inside every component and has no counterpart in SQLite or HTTP, so v2 would be a screen-by-screen rewrite. Also rejected an observable-returning repository, which is the *more* dangerous choice because a v3 HTTP implementation could only honour it by polling or by returning a subscription that never fires — wrong, and silent.
- **Wrote three concept notes** — [derived state](docs/concepts/derived-state.md), [the repository pattern](docs/concepts/repository-pattern.md), [IndexedDB](docs/concepts/indexeddb.md).
- **Noted a small inconsistency to fix later:** the addendum says the Expo SDK will be recorded in "ADR-01", but ADR-001 is now taken. It should say *an* ADR.
- **ADR-002 decided:** `core/` stays a folder in v1. Opened [docs/backlog.md](docs/backlog.md) with the extraction recorded as the first task of v2 — before any Expo screen, so it happens once rather than being discovered mid-build. **The A3 lint rule is now the only thing holding that boundary, so it must fail CI rather than warn.**
- **Ran SYSTEM SPEC** with `product-management:write-spec` invoked inside the phase. Wrote [docs/03-system-spec.md](docs/03-system-spec.md): overview, goals and non-goals, roles, 40 stories with MoSCoW, Given/When/Then criteria for every Must, a per-screen state table, data requirements, and non-functional requirements.
- **Settled the amber threshold as D15** — a proportion of the planned daily allowance rather than a fixed figure, with the divide-by-zero and no-plan cases written down rather than discovered later.
- **Extended `docs/seed-data.md` with a full worked cycle**, because the spec needed real figures and repo rule 2 says figures live only there. The rent fund is seeded **behind schedule on purpose**: a demo where everything is fine demonstrates nothing, and the projected gap exists to warn early.
- **Wrote the states per screen rather than per story** — five states repeated across forty stories would have been unreadable, and unreadable criteria are criteria nobody checks.
---

## What's Next

1. Merge the three stacked PRs in order: setup → understand → architect. No CI exists yet; PR AUTOMATION (phase 11b) creates it.
2. Run **API CONTRACT** (`peer-ai/shared/04-spec-api-contract.md`) — the `Repository` interface and the JSON export/import schema are the contract in v1, derived from the types rather than hand-written twice. Note where a v3 API would slot in. **Stop after it.**

---

## Open Questions

The six questions logged at SETUP were settled on 2026-09-10 and are now decisions
D1–D6 below. Six of the original seven had in fact already been answered in
`docs/product-brief.md`; they were logged from the stakeholder email before the
brief was read properly. Full reasoning for each decision, including the option
rejected, is in [docs/01-requirements-summary.md](docs/01-requirements-summary.md).

What remains open:

| Question | Status |
|----------|--------|
| Exact copy for the offline and storage-status lines — they must inform without alarming | Open — PAGE SPECS, with `design:ux-copy` |
| Should archiving a category hide it from past cycles, or only from new plans? | Open — leaning *new plans only*, so history stays truthful. Needed before story C7 |
| Does the printable debt record carry the owner's own name, and does onboarding collect it? | Open — needed before story E5 |

The amber threshold is settled as **D15**. Every question raised at SETUP and in
UNDERSTAND's clarification round is now closed.

---

## Package / Asset Locations

| Asset | Path |
|-------|------|
| Product brief | `docs/product-brief.md` (§1–5 authoritative; §6 superseded) |
| Kick-off pack — the instructions this build runs on | `docs/Mizaniya_Kickoff_Pack.md` |
| Requirements summary + the settled domain decisions | `docs/01-requirements-summary.md` |
| System architecture + the ADR index | `docs/02-architecture.md` |
| Promoted ADRs | `docs/adr/` |
| Backlog — what is deliberately not built | `docs/backlog.md` |
| System spec — stories, criteria, screen states | `docs/03-system-spec.md` |
| Engineering standards (rulebook) | `docs/standards/` |
| Seed data — the only source of figures | `docs/seed-data.md` |
| Peer AI playbook (vendored) | `peer-ai/` |
| Phase models and skills | `peer-ai/phase-config.json` |
| Agent prompts (review, security, QA, contract) | `peer-ai/agents/` |
| Framework defects to send upstream | `docs/peer-ai-feedback.md` |
| Design system and screen designs | `docs/design/` — **empty until the design stop after PAGE SPECS** |
| Concept notes (learning mode) | `docs/concepts/` — one file per concept, plus `revisit.md` for threads to pull later |
| Licence | `LICENSE` (PolyForm Noncommercial 1.0.0) — authoritative, never regenerated |

---

## Diagrams / Design files

| Artefact / file | Purpose | Location |
|----------|---------|----------|
| *(none yet)* | Architecture diagrams arrive with ARCHITECT; screen designs at the design stop | — |
