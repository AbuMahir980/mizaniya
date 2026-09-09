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

**Phase: SETUP, complete.** The repo is scaffolding only — no application code
exists yet. Step 0 (verifying the Peer AI customisation) finished and merged
before this phase: the phase files are stamped from `peer-ai/phase-config.json`,
peer-ai's cost-tiering is gone, and the shared and frontend rules files now open
by deferring to `docs/standards/`. SETUP added `CLAUDE.md`, this file,
`.peer-ai-state.json` and `docs/seed-data.md`.

**Next action:** UNDERSTAND — `peer-ai/shared/01-understand.md`, against
`docs/product-brief.md`, starting with the open questions the brief leaves.

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

---

## What Was Done — By Day

### 2026-09-09 (Wednesday)

- **Step 0 — verified the vendored Peer AI customisation.** Confirmed every phase file carries its `> **Model:` line from `phase-config.json`; confirmed no live cost-tiering wording remains (the only matches are the strip script's own regexes and the feedback doc describing the defect); confirmed `peer-ai/.git` is absent, so the playbook commits as plain files.
- **Corrected the skills record.** An earlier check reported all ten skills missing, having looked only in `~/.claude/plugins/repos/`. They are `@inline` account bundles and are present: verified directly in this session, in the desktop app.
- **SETUP.** Wrote `CLAUDE.md` (project instructions + the workflow driver body, Project settings filled in), this `CONTEXT.md` (repo rules verbatim, environment, learning-mode contract, review checklist), `.peer-ai-state.json`, and `docs/seed-data.md`.
- **Recorded the git convention** in the driver's Project settings and applied it to the driver's build and gate sections, which had described local ticket→milestone merges with no PR.
- **Logged a fourth framework defect** in `docs/peer-ai-feedback.md`: the workflow driver mandates local merges while `shared.md` requires a PR with review, and PR automation is phase 11b — so by the time CI and branch protection exist, the whole build has already merged without them.

---

## What's Next

1. Open the SETUP pull request and merge it once reviewed (no CI exists yet — PR AUTOMATION, phase 11b, creates it).
2. Run **UNDERSTAND** (`peer-ai/shared/01-understand.md`) against `docs/product-brief.md`. Ask the open questions the brief leaves before writing the understanding document.
3. Then **ARCHITECT** → **SYSTEM SPEC** → **API CONTRACT**, stopping after the API contract.

---

## Open Questions

| Question | Status |
|----------|--------|
| Does the salary cycle run 25th → 24th, or calendar-month with the 25th as the pay date? What happens when the 25th is a weekend or public holiday? | Open — for UNDERSTAND |
| Which categories roll over unused (food and groceries is named in the brief) and which reset each cycle? Does a rolled-over amount expire? | Open — for UNDERSTAND |
| Is safe-to-spend computed from *all* remaining cash, or only from the envelopes marked as day-to-day spending? | Open — for UNDERSTAND |
| Zakat: awareness only (a reminder and an estimate), or a tracked obligation with its own payment records? On which nisab basis and which lunar date? | Open — for UNDERSTAND |
| Ajo contributions — a savings destination, a debt-like obligation, or their own concept with a payout date? | Open — for UNDERSTAND |
| Debts in both directions: does money owed *to* the user count towards safe-to-spend or the rent target before it is actually received? | Open — for UNDERSTAND |
| Multi-currency, or naira only? | Leaning naira only for v1 — confirm in UNDERSTAND |

---

## Package / Asset Locations

| Asset | Path |
|-------|------|
| Product brief | `docs/product-brief.md` |
| Engineering standards (rulebook) | `docs/standards/` |
| Seed data — the only source of figures | `docs/seed-data.md` |
| Peer AI playbook (vendored) | `peer-ai/` |
| Phase models and skills | `peer-ai/phase-config.json` |
| Agent prompts (review, security, QA, contract) | `peer-ai/agents/` |
| Framework defects to send upstream | `docs/peer-ai-feedback.md` |
| Design system and screen designs | `docs/design/` — **empty until the design stop after PAGE SPECS** |
| Concept notes (learning mode) | `docs/concepts/` — created when the first concept appears |
| Licence | `LICENSE` (PolyForm Noncommercial 1.0.0) — authoritative, never regenerated |

---

## Diagrams / Design files

| Artefact / file | Purpose | Location |
|----------|---------|----------|
| *(none yet)* | Architecture diagrams arrive with ARCHITECT; screen designs at the design stop | — |
