# CLAUDE.md — Mizaniya

Mizaniya is a household money app for salary-cycle budgeting, debts in both
directions, and a sinking fund for annual rent. **v1 is a hosted, multi-user
webapp with a server** — accounts, sync, tiers and a landing page — with the
local store kept as the offline path. It is built in the open using the **Peer
AI development workflow**, whose playbook is vendored in `peer-ai/`.

> *Corrected 28 September: this paragraph opened with "a local-first household
> money app" for four days after [ADR-009](docs/adr/ADR-009-repositioning-v1-hosted-webapp.md)
> repositioned the product. It is the first sentence every session reads.*

---

## 0. PAUSED — 28 September 2026, for the Peer AI rewrite

**Do not start the next piece of work without checking with the owner first.**
Peer AI is being rewritten as an **npm package with skills**, so the vendored
`peer-ai/` playbook, the phase files named in §5 and the paths throughout this
driver are all expected to change. The project was deliberately brought to a
clean stop for it:

- nothing unpushed, no open pull request, clean tree;
- every record made true against its source, not against another record;
- the unmerged T16 branch preserved on `origin` at `c11c872`.

**When the new Peer AI lands, the work resumes at the spec rewrite** — `CONTEXT.md`
§What's Next, N4 first. The order is unchanged; only the tooling beneath it moves.
Delete this section once the migration is done.

---

## 2. The rulebook is `docs/standards/` — it wins on any conflict

| Document | Covers |
|---|---|
| `docs/standards/frontend-engineering-standards.md` | Sections **A–O**: architecture, state, prop drilling, components, DRY, styling and design system, types, money, safety-critical data, accessibility, testing, errors/loading/offline, data safety, dependencies, naming |
| `docs/standards/backend-engineering-standards.md` | Server-side equivalents. **Dormant until v3** (separate private repo) |
| `docs/standards/standards-addendum-mizaniya.md` | Every value the standards leave to the project: kobo as the minor unit, what the danger colour means, the core journey K1, storage per version, seed data, telemetry |

**Reference rules by section number. Never copy their text into another file** —
a copy guarantees drift, and then nobody knows which is current.

Every rule there is marked `auto` (a linter, the compiler or CI fails the build)
or `review` (a human has to look). SHARED RULES maps each `auto` rule to its
enforcement; every `review` rule is already listed as the code-review agent's
checklist in `CONTEXT.md`.

`peer-ai/shared/rules/shared.md` and `peer-ai/frontend/rules/frontend.md` are
the **workflow layer** — session continuity, git conventions, journal, PDF
export. Each opens with a section saying `docs/standards/` is authoritative.
Where they disagree, `docs/standards/` wins and the rules file is the one that
is wrong.

---

## 3. Repo rules bind every phase

The five repo rules are written verbatim in `CONTEXT.md` and are not negotiable:
PolyForm Noncommercial licence (`LICENSE` at the root is authoritative — never
generate or alter licence text) and no secrets in the repo; **no real financial
figures anywhere** — `docs/seed-data.md` is the only source of figures for
fixtures, tests, screenshots and examples; no employer, client or third-party
project names; the README leads with the problem and the screenshots, not the
stack; `docs/standards/` is the rulebook.

---

## 4. Learning mode — replaced 2026-09-24: topic notes, not code comments

The old contract is **gone**, not suspended. Its text is kept collapsed in
`CONTEXT.md` as history. The replacement has two halves.

**1. The code is cleared of explanation.** The three-line `WHAT / WHY /
INTERVIEW` header is **removed** — from new files and, as a sweep, from existing
ones. Comments survive only where the code genuinely cannot speak for itself: a
non-obvious constraint, a workaround that needs its reason, a domain rule a reader
would otherwise "fix". The test is whether a competent reader would ask *why is it
like this?* and find no answer in the code. If they would, comment it. Otherwise
delete it. Explanation lives in the notes below, not in the source.

**2. One note per engineering topic**, in `docs/engineering-notes/` — not per
file, not per decision, but **per topic someone would actually ask about** (state
management, storage, money, offline, sync, performance, auth…). Each note answers,
in order:

- what the problem was;
- what this project did;
- the concepts involved, named plainly;
- **the why-chain** — why this and not the obvious alternative, and why not *that*,
  down until the answer rests on a constraint rather than a preference.

The test of a good note: it answers the question cold, and survives being pushed.
*"How did you handle a thousand records?"* — *"Caching."* — *"Why caching?"* — and
the chain holds three or four levels deep without bottoming out in "it seemed
better".

**A note may say the work is not done.** *"Not built yet; here is when it would be
needed, and what we would do"* is a legitimate and valuable note. **Writing down a
deliberate deferral is worth more than building the thing early** — it shows the
limit was understood and chosen, which is precisely what premature machinery fails
to show.

**Notes are not ADRs, and both stay.** An ADR records a decision *at the moment it
was made* and is immutable history. A topic note explains the **system as it now
is** and is rewritten whenever that changes. A note links its ADRs.

**`docs/concepts/` is gone**, deleted 2026-09-25 once its content had been harvested
into the notes. The engineering note replaced it: two folders explaining the same things
is how documentation starts contradicting itself. **Do not recreate it.**

---

## 6. Models and skills

**Opus for build. Fable for everything else. Never downgrade mid-phase.** Each
phase file states its model on its `> **Model:` line. There is no cost tier to
announce and no model-switch gate — see `peer-ai/shared/rules/shared.md`
§ Models.

**Skills are named per phase** in the table in `peer-ai/AGENTS.md`, and are
invoked *inside* the phase to deepen the single artefact it produces — never as
a parallel process, which yields two documents that disagree. All ten were
confirmed present in this session (Claude Code desktop app, 9 September 2026);
`CONTEXT.md` records the check. **Re-check at the start of each phase that names
one. A missing skill is reported, never silently skipped.**

---

## 7. What this project already has — do not reinvent it

- **The brief exists** — `docs/product-brief.md`. Understand it; do not re-derive the product.
- **The standards exist** — `docs/standards/`. The rules phases map them to enforcement; they do not write a second standard.
- **The seed data exists** — `docs/seed-data.md`, the only source of figures.
- **The design arrives from outside** — `docs/design/` after the design stop.
- **The licence exists** — `LICENSE` at the root is authoritative.

---
---

<!-- peer-ai:start -->
<!-- Generated by peer-ai render from peer-ai.config.json. Change the config and run peer-ai render; edits inside this block are replaced. -->

## Peer AI

This project uses Peer AI at the mvp stage. Its MCP server, `peer-ai`, holds the project map, the work items, and the gates work must pass before it ships.

- Start each session with `next_work`. It returns the work item for the current branch and where it stopped. For new work, create one with `create_work_item`.
- Keep the item's stage current with `advance_work_item`: `build` before you change code, `verify` once the change is complete, `ship` when it is verified, reviewed and ready to merge, and `done` once it is merged or released. When it refuses, fix what it lists.
- Before editing a file, call `standards_for_file` and follow what it returns.
- Record progress with `update_work_item`, so the next session resumes where this one stopped.
- Verify with `run_verify`. Never report a verify result yourself. It verifies the item's latest commit, so commit first.
- Working in a git worktree of your own, give your branch to `next_work`. The tools find each work item on its own branch, wherever it's checked out.
- Peer AI's skills are named `peer-ai-…`, such as `peer-ai-security-review`. `next_work` names the one to use for a gap, and the reviews a work item needs; follow each skill step by step. If none are installed, run `npx peer-ai render --skills`.
- For every review, write its report in `.peer-ai/reports/`, then record it with `record_review` and the report's path. Record failed and incomplete reviews too.
- For every document a skill writes, such as the requirements, check it with `check_document` and fix what it names.
- Don't edit the files in `.peer-ai/` by hand. The tools keep them valid.
- When `next_work` reports setup problems, fix what you can, such as running `npx peer-ai render`, before other work, and tell the person in plain words about anything only they can decide.
- When Peer AI gets something wrong, call `draft_feedback`. At a natural stopping point, show the person each draft in a few words and ask whether to send it.

Parts of the project:

- `web` (web, active): apps/web
- `core` (library, active): packages/core

Commands: verify `npm run verify`.

Models: Fable by default; delivery-setup: Opus; build: Opus. If one isn't offered, use the most capable one available. Never run a review on a weaker model than the build.

When you use one of Peer AI's skills, follow the project's settings for it. If an add-on it names isn't available, tell the person; never skip it silently.

- For `peer-ai-requirements-analysis`: **No skill for this phase.** `docs/product-brief.md` is the requirements source and `docs/seed-data.md` holds the only figures you may use. Read both before asking anything; arrive with a draft understanding to correct, not a blank page. The stakeholder is the user — ask about how the spreadsheet is actually used, not what sounds impressive.
- `peer-ai-product-spec`: also use `design:accessibility-review` and `design:ux-copy`.
- For `peer-ai-product-spec`: Frontend: **Skills to use here.** Invoke these *inside* this phase to deepen the page specs, never as parallel processes producing competing documents.
- For `peer-ai-product-spec`: Frontend: `design:accessibility-review` — target sizes, contrast, motion, screen-reader paths (frontend J)
- For `peer-ai-product-spec`: Frontend: `design:ux-copy` — the words on the screen, in British English, in the user's vocabulary (frontend O4)
- For `peer-ai-product-spec`: Frontend: **The designs do not exist yet — they are produced from these specs.** After this phase the workflow stops; the design system and screen designs are made outside this session from the page specs and land in `docs/design/` (`tokens.md` + PNGs). So each spec must be complete enough to design from: every state (loading, empty, error, offline, success), every number shown and where it comes from in `core/`, the primary action, and what the danger colour would mean on that screen (addendum: money going wrong, nothing else). Pages: Onboarding, Home, Plan, Transactions (+ Quick Add sheet), Debts & Goals (+ debt record view), Months, Settings.
- `peer-ai-architecture`: also use `engineering:architecture` and `engineering:system-design`.
- For `peer-ai-architecture`: **Skills to use here.** Invoke these *inside* this phase to deepen the single artefact it produces — never as a parallel process. Two overlapping processes yield two architectures that disagree, and then nobody knows which is authoritative.
- For `peer-ai-architecture`: `engineering:architecture` — structural options and their trade-offs
- For `peer-ai-architecture`: `engineering:system-design` — how the pieces fit and where the boundaries sit
- For `peer-ai-architecture`: **Constraints already decided** (do not reopen): local-first; IndexedDB via Dexie behind a `Repository` interface; a framework-free `core/` for cycle maths, safe-to-spend, rollover, projected gap, zakat estimate and money in kobo; React 19 + TypeScript + Vite; folder structure per frontend standards A1–A5; v2 is Expo sharing `core/`; v3 is a separate private API repo. One ADR per decision, using `shared/templates/architecture-decision-record.md`.
- `peer-ai-system-design`: also use `product-management:write-spec`.
- For `peer-ai-system-design`: **Skills to use here.** Invoke inside this phase, not alongside it.
- For `peer-ai-system-design`: `product-management:write-spec` — turning decisions into a spec someone can build from
- For `peer-ai-system-design`: Every user story names its states (loading, empty, error, offline, success) and the exact numbers the screen shows. Money is always `{ amount, type }` in kobo (frontend H1, H5).
- For `peer-ai-api-design`: **No skill — and there is no server in v1.** The "API" here is (1) the `Repository` interface and (2) the JSON export/import schema. Write both once, as TypeScript types plus a runtime schema (zod) in `core/`, and derive the contract document from them — never hand-write the same shape twice (frontend G2, G4). Add a CI step that regenerates the contract doc and fails on any diff. Mark where a v3 API would slot in behind the same interface.
- `peer-ai-issue-planning`: also use `engineering:tech-debt`.
- For `peer-ai-issue-planning`: **Skills to use here.** Invoke inside this phase, not alongside it.
- For `peer-ai-issue-planning`: `engineering:tech-debt` — separating what must be fixed now from what is merely untidy
- For `peer-ai-issue-planning`: Anything not in `docs/product-brief.md` goes to `docs/backlog.md`, not into an issue for this build.
- For `peer-ai-implement-ticket`: Frontend: **Learning mode was replaced on 2026-09-24 — see `CLAUDE.md` §4.** There is no three-line file header and no `docs/concepts/`; both were removed. Explanation lives in `docs/engineering-notes/`, one note per topic, written when the topic is built or deliberately deferred. Build order and one-commit-per-item are in `CONTEXT.md`.
- For `peer-ai-implement-ticket`: Backend: **Dormant until v3.**
- `peer-ai-code-review`: also use `engineering:code-review`.
- For `peer-ai-code-review`: Frontend: **Skills to use here.** Invoke inside this phase, not alongside it.
- For `peer-ai-code-review`: Frontend: `engineering:code-review` — the review itself. **Verify it is installed before relying on it.** If it is missing, review directly from this file and say the skill was unavailable — never skip the step silently.
- For `peer-ai-code-review`: Frontend: Claude Code ships `/code-review`, which reads the real diff, so prefer it over pasting code into a prompt.
- For `peer-ai-code-review`: Frontend: Review against `docs/standards/frontend-engineering-standards.md` and the addendum. Every rule there marked `review` is a promise that a human checks it — this is where that promise is kept. Count, don't judge: C1 (prop passes through ≤2 components), D1 (≤150 lines), D2 (≤7 props), E1/E2 (third duplicate extracts; money and validation extract on the first repeat), H3 (no money arithmetic in a component).
- For `peer-ai-code-review`: Backend: **Skills to use here.** Invoke inside this phase, not alongside it.
- For `peer-ai-code-review`: Backend: `engineering:code-review` — the review itself
- For `peer-ai-code-review`: Backend: Dormant until v3. Then review against `docs/standards/backend-engineering-standards.md` — money in minor units, idempotency, per-resource authorisation, audience axis, migrations only, config that fails closed.
- For `peer-ai-code-review`: **Review against, in this order:** `docs/standards/frontend-engineering-standards.md` — every `review` rule is the checklist; the `auto` rules should already be green in CI, so a red one is a CI defect too; `docs/standards/standards-addendum-mizaniya.md` — kobo, danger colour meaning, core journey; the repo rules in `CONTEXT.md` — no real figures, no employer or client names, no secrets
- For `peer-ai-code-review`: One finding = one location + one fix. Correctness before style. Findings go to the user as a table before anything is changed.
- For `peer-ai-security-review`: **On this project, also work through:** secrets (none in the repo, `.env` ignored, secret scanning in CI); dependency audit against the pinned lockfile; input validation at every boundary with a schema (frontend G4) — imports especially, since an export file is untrusted input; the user's financial data at rest in IndexedDB (what a shared device or a browser extension can read; what the export contains; no telemetry per M2); and that no screenshot, fixture or test carries real figures (M1).
- For `peer-ai-contract-check`: **In v1 the contract is the `Repository` interface and the export/import schema in `core/`.** Check the screens against those, and the generated contract doc against the source types.
- `peer-ai-test-strategy`: also use `engineering:testing-strategy`.
- For `peer-ai-test-strategy`: Frontend: **Skills to use here.** Invoke inside this phase, not alongside it.
- For `peer-ai-test-strategy`: Frontend: `engineering:testing-strategy` — what is tested, at which layer, and why
- For `peer-ai-test-strategy`: Frontend: The core journey in `docs/standards/standards-addendum-mizaniya.md` (K1) is the acceptance test, run in Playwright. `core/` is tested exhaustively with plain values (K2), including cycle boundaries, month rollover, a debt paid early, a salary that arrives late, and export → import round-trip (M3). Test by role and label, not test id (K3).
- For `peer-ai-test-strategy`: Backend: **Skills to use here.** Invoke inside this phase, not alongside it.
- For `peer-ai-test-strategy`: Backend: `engineering:testing-strategy` — what is tested, at which layer, and why
- For `peer-ai-test-strategy`: Backend: Dormant until v3.
- For `peer-ai-qa-acceptance`: **The test matrix starts from the core journey in the addendum (K1)** and from the states each page spec declares; a state the spec names but the matrix omits is a QA defect.
- `peer-ai-documentation`: also use `engineering:documentation`.
- For `peer-ai-documentation`: **Skills to use here.** Invoke inside this phase, not alongside it.
- For `peer-ai-documentation`: `engineering:documentation` — structure and audience for the docs produced here
- For `peer-ai-documentation`: README order is fixed by the repo rules in `CONTEXT.md`: the problem, the screenshots, features, how it works (cycles, envelopes, debts, projected gap), running locally, roadmap, licence (one line: PolyForm Noncommercial 1.0.0, link to `LICENSE`). `docs/engineering-notes/` is part of the documentation set (it replaced `docs/concepts/` on 2026-09-25).

When a work item reaches one of these activities:

- During `standards`: **Skills to use here.** Invoke inside this phase, not alongside it.
- During `standards`: `design:design-system` — token discipline and component conventions
- During `standards`: **This project already has its standards in `docs/standards/`.** This phase does not write a competing one. It produces `docs/05-coding-standards.md` as a short index: links to the three standards files; every `auto` rule with the exact ESLint rule, tsconfig option or CI check that enforces it; every `review` rule as the review checklist (also written into `CONTEXT.md`); and the token contract from `docs/design/tokens.md`. Ask the user only about addendum values that are still blank.
- During `standards`: Frontend: **Skills to use here.** Invoke inside this phase, not alongside it.
- During `standards`: Frontend: `design:design-system` — component and token conventions
- During `standards`: Frontend: `design:accessibility-review` — the accessibility rules that belong in the standard
- During `standards`: Frontend: **The frontend standard already exists** — `docs/standards/frontend-engineering-standards.md` plus the addendum. This phase does not walk through generic defaults; it maps each `auto` rule to its ESLint/tsconfig/CI enforcement and each `review` rule to the checklist, and records the token contract from `docs/design/tokens.md`. Delete nothing from the standard here; propose changes as feedback.
- During `standards`: Backend: **Dormant until v3.** The backend standard already exists in `docs/standards/backend-engineering-standards.md`; when a server is built, this phase maps its `auto` rules to enforcement and its `review` rules to the checklist, exactly as the frontend track does. It does not write a competing standard.
- During `delivery-setup`: **CI is created here from nothing.** Stages, in order: install with pinned lockfile; lint (every `auto` rule in `docs/standards/` has a lint or tsconfig backing); typecheck; unit tests for `core/` with the coverage gate on money modules (frontend H4, K2); component tests; Playwright core journey (addendum K1); secret scanning; contract-doc regeneration diff (see 04). Nothing merges red.

If the peer-ai tools aren't available, run `npx peer-ai doctor`.
<!-- peer-ai:end -->
