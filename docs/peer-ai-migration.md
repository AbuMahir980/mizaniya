# Moving to Peer AI 1.0

`peer-ai migrate` moved this project from its copy of v0 on 2026-10-06. This file lists what it did, and the decisions it left for a person. The work item `migrate-v0` points here: go through it with your AI tool, one decision at a time. When each one is made, delete this file.

The copy came from v0 of 2026-09-11 (790aa8a), as its `.upstream` pin said.

Before the migration, the project was at commit `0b6e325`. `git show 0b6e325:<path>` shows any file as it was then.

## Converted

- Verify command → `commands.verify`: `npm run verify`
- Issue tracker → `tracker.kind`: `github`
- Issue tracker → `tracker.project`: `AbuMahir980/mizaniya`
- Design reference → `design.reference`: `docs/design/`
- Branch naming → `repo.branchNaming`: `feature/{slug}`
- Merge policy → `repo.mergePolicy`: `pull-request`
- phase-config.json model lines → `models`: `Fable by default`
- phase-config.json model lines → `models.byActivity.delivery-setup`: `Opus`
- phase-config.json model lines → `models.byActivity.build`: `Opus`
- shared/01-understand.md → `capabilities.requirements-analysis.notes`: `` **No skill for this phase.** `docs/product-brief.md` is the requirements source and `docs/seed-data.md` holds the only figures you may use. Read both before asking anything; arrive with a draft understanding to correct, not a blank page. The stakeholder is the user — ask about how the spreadsheet is actually used, not what sounds impressive. ``
- shared/02-architect.md → `capabilities.architecture.also`: `engineering:architecture`
- shared/02-architect.md → `capabilities.architecture.also`: `engineering:system-design`
- shared/02-architect.md → `capabilities.architecture.notes`: `**Skills to use here.** Invoke these *inside* this phase to deepen the single artefact it produces — never as a parallel process. Two overlapping processes yield two architectures that disagree, and then nobody knows which is authoritative.`
- shared/02-architect.md → `capabilities.architecture.notes`: `` `engineering:architecture` — structural options and their trade-offs ``
- shared/02-architect.md → `capabilities.architecture.notes`: `` `engineering:system-design` — how the pieces fit and where the boundaries sit ``
- shared/02-architect.md → `capabilities.architecture.notes`: `` **Constraints already decided** (do not reopen): local-first; IndexedDB via Dexie behind a `Repository` interface; a framework-free `core/` for cycle maths, safe-to-spend, rollover, projected gap, zakat estimate and money in kobo; React 19 + TypeScript + Vite; folder structure per frontend standards A1–A5; v2 is Expo sharing `core/`; v3 is a separate private API repo. One ADR per decision, using `shared/templates/architecture-decision-record.md`. ``
- shared/03-spec-system.md → `capabilities.system-design.also`: `product-management:write-spec`
- shared/03-spec-system.md → `capabilities.system-design.notes`: `**Skills to use here.** Invoke inside this phase, not alongside it.`
- shared/03-spec-system.md → `capabilities.system-design.notes`: `` `product-management:write-spec` — turning decisions into a spec someone can build from ``
- shared/03-spec-system.md → `capabilities.system-design.notes`: `` Every user story names its states (loading, empty, error, offline, success) and the exact numbers the screen shows. Money is always `{ amount, type }` in kobo (frontend H1, H5). ``
- shared/04-spec-api-contract.md → `capabilities.api-design.notes`: `` **No skill — and there is no server in v1.** The "API" here is (1) the `Repository` interface and (2) the JSON export/import schema. Write both once, as TypeScript types plus a runtime schema (zod) in `core/`, and derive the contract document from them — never hand-write the same shape twice (frontend G2, G4). Add a CI step that regenerates the contract doc and fails on any diff. Mark where a v3 API would slot in behind the same interface. ``
- shared/05-rules-shared.md → `activities.standards.notes`: `**Skills to use here.** Invoke inside this phase, not alongside it.`
- shared/05-rules-shared.md → `activities.standards.notes`: `` `design:design-system` — token discipline and component conventions ``
- shared/05-rules-shared.md → `activities.standards.notes`: `` **This project already has its standards in `docs/standards/`.** This phase does not write a competing one. It produces `docs/05-coding-standards.md` as a short index: links to the three standards files; every `auto` rule with the exact ESLint rule, tsconfig option or CI check that enforces it; every `review` rule as the review checklist (also written into `CONTEXT.md`); and the token contract from `docs/design/tokens.md`. Ask the user only about addendum values that are still blank. ``
- shared/06-issues.md → `capabilities.issue-planning.also`: `engineering:tech-debt`
- shared/06-issues.md → `capabilities.issue-planning.notes`: `**Skills to use here.** Invoke inside this phase, not alongside it.`
- shared/06-issues.md → `capabilities.issue-planning.notes`: `` `engineering:tech-debt` — separating what must be fixed now from what is merely untidy ``
- shared/06-issues.md → `capabilities.issue-planning.notes`: `` Anything not in `docs/product-brief.md` goes to `docs/backlog.md`, not into an issue for this build. ``
- shared/07-document.md → `capabilities.documentation.also`: `engineering:documentation`
- shared/07-document.md → `capabilities.documentation.notes`: `**Skills to use here.** Invoke inside this phase, not alongside it.`
- shared/07-document.md → `capabilities.documentation.notes`: `` `engineering:documentation` — structure and audience for the docs produced here ``
- shared/07-document.md → `capabilities.documentation.notes`: `` README order is fixed by the repo rules in `CONTEXT.md`: the problem, the screenshots, features, how it works (cycles, envelopes, debts, projected gap), running locally, roadmap, licence (one line: PolyForm Noncommercial 1.0.0, link to `LICENSE`). `docs/engineering-notes/` is part of the documentation set (it replaced `docs/concepts/` on 2026-09-25). ``
- shared/09-pr-automation.md → `activities.delivery-setup.notes`: `` **CI is created here from nothing.** Stages, in order: install with pinned lockfile; lint (every `auto` rule in `docs/standards/` has a lint or tsconfig backing); typecheck; unit tests for `core/` with the coverage gate on money modules (frontend H4, K2); component tests; Playwright core journey (addendum K1); secret scanning; contract-doc regeneration diff (see 04). Nothing merges red. ``
- frontend/01-spec-pages.md → `capabilities.product-spec.also`: `design:accessibility-review`
- frontend/01-spec-pages.md → `capabilities.product-spec.also`: `design:ux-copy`
- frontend/01-spec-pages.md → `capabilities.product-spec.notes`: `Frontend: **Skills to use here.** Invoke these *inside* this phase to deepen the page specs, never as parallel processes producing competing documents.`
- frontend/01-spec-pages.md → `capabilities.product-spec.notes`: `` Frontend: `design:accessibility-review` — target sizes, contrast, motion, screen-reader paths (frontend J) ``
- frontend/01-spec-pages.md → `capabilities.product-spec.notes`: `` Frontend: `design:ux-copy` — the words on the screen, in British English, in the user's vocabulary (frontend O4) ``
- frontend/01-spec-pages.md → `capabilities.product-spec.notes`: `` Frontend: **The designs do not exist yet — they are produced from these specs.** After this phase the workflow stops; the design system and screen designs are made outside this session from the page specs and land in `docs/design/` (`tokens.md` + PNGs). So each spec must be complete enough to design from: every state (loading, empty, error, offline, success), every number shown and where it comes from in `core/`, the primary action, and what the danger colour would mean on that screen (addendum: money going wrong, nothing else). Pages: Onboarding, Home, Plan, Transactions (+ Quick Add sheet), Debts & Goals (+ debt record view), Months, Settings. ``
- frontend/02-rules.md → `activities.standards.notes`: `Frontend: **Skills to use here.** Invoke inside this phase, not alongside it.`
- frontend/02-rules.md → `activities.standards.notes`: `` Frontend: `design:design-system` — component and token conventions ``
- frontend/02-rules.md → `activities.standards.notes`: `` Frontend: `design:accessibility-review` — the accessibility rules that belong in the standard ``
- frontend/02-rules.md → `activities.standards.notes`: `` Frontend: **The frontend standard already exists** — `docs/standards/frontend-engineering-standards.md` plus the addendum. This phase does not walk through generic defaults; it maps each `auto` rule to its ESLint/tsconfig/CI enforcement and each `review` rule to the checklist, and records the token contract from `docs/design/tokens.md`. Delete nothing from the standard here; propose changes as feedback. ``
- frontend/03-build.md → `capabilities.implement-ticket.notes`: `` Frontend: **Learning mode was replaced on 2026-09-24 — see `CLAUDE.md` §4.** There is no three-line file header and no `docs/concepts/`; both were removed. Explanation lives in `docs/engineering-notes/`, one note per topic, written when the topic is built or deliberately deferred. Build order and one-commit-per-item are in `CONTEXT.md`. ``
- frontend/04-review.md → `capabilities.code-review.also`: `engineering:code-review`
- frontend/04-review.md → `capabilities.code-review.notes`: `Frontend: **Skills to use here.** Invoke inside this phase, not alongside it.`
- frontend/04-review.md → `capabilities.code-review.notes`: `` Frontend: `engineering:code-review` — the review itself. **Verify it is installed before relying on it.** If it is missing, review directly from this file and say the skill was unavailable — never skip the step silently. ``
- frontend/04-review.md → `capabilities.code-review.notes`: `` Frontend: Claude Code ships `/code-review`, which reads the real diff, so prefer it over pasting code into a prompt. ``
- frontend/04-review.md → `capabilities.code-review.notes`: `` Frontend: Review against `docs/standards/frontend-engineering-standards.md` and the addendum. Every rule there marked `review` is a promise that a human checks it — this is where that promise is kept. Count, don't judge: C1 (prop passes through ≤2 components), D1 (≤150 lines), D2 (≤7 props), E1/E2 (third duplicate extracts; money and validation extract on the first repeat), H3 (no money arithmetic in a component). ``
- frontend/05-test.md → `capabilities.test-strategy.also`: `engineering:testing-strategy`
- frontend/05-test.md → `capabilities.test-strategy.notes`: `Frontend: **Skills to use here.** Invoke inside this phase, not alongside it.`
- frontend/05-test.md → `capabilities.test-strategy.notes`: `` Frontend: `engineering:testing-strategy` — what is tested, at which layer, and why ``
- frontend/05-test.md → `capabilities.test-strategy.notes`: `` Frontend: The core journey in `docs/standards/standards-addendum-mizaniya.md` (K1) is the acceptance test, run in Playwright. `core/` is tested exhaustively with plain values (K2), including cycle boundaries, month rollover, a debt paid early, a salary that arrives late, and export → import round-trip (M3). Test by role and label, not test id (K3). ``
- backend/02-rules.md → `activities.standards.notes`: `` Backend: **Dormant until v3.** The backend standard already exists in `docs/standards/backend-engineering-standards.md`; when a server is built, this phase maps its `auto` rules to enforcement and its `review` rules to the checklist, exactly as the frontend track does. It does not write a competing standard. ``
- backend/03-build.md → `capabilities.implement-ticket.notes`: `Backend: **Dormant until v3.**`
- backend/04-review.md → `capabilities.code-review.also`: `engineering:code-review`
- backend/04-review.md → `capabilities.code-review.notes`: `Backend: **Skills to use here.** Invoke inside this phase, not alongside it.`
- backend/04-review.md → `capabilities.code-review.notes`: `` Backend: `engineering:code-review` — the review itself ``
- backend/04-review.md → `capabilities.code-review.notes`: `` Backend: Dormant until v3. Then review against `docs/standards/backend-engineering-standards.md` — money in minor units, idempotency, per-resource authorisation, audience axis, migrations only, config that fails closed. ``
- backend/05-test.md → `capabilities.test-strategy.also`: `engineering:testing-strategy`
- backend/05-test.md → `capabilities.test-strategy.notes`: `Backend: **Skills to use here.** Invoke inside this phase, not alongside it.`
- backend/05-test.md → `capabilities.test-strategy.notes`: `` Backend: `engineering:testing-strategy` — what is tested, at which layer, and why ``
- backend/05-test.md → `capabilities.test-strategy.notes`: `Backend: Dormant until v3.`
- agents/review-prompt.md → `capabilities.code-review.notes`: `` **Review against, in this order:** `docs/standards/frontend-engineering-standards.md` — every `review` rule is the checklist; the `auto` rules should already be green in CI, so a red one is a CI defect too; `docs/standards/standards-addendum-mizaniya.md` — kobo, danger colour meaning, core journey; the repo rules in `CONTEXT.md` — no real figures, no employer or client names, no secrets ``
- agents/review-prompt.md → `capabilities.code-review.notes`: `One finding = one location + one fix. Correctness before style. Findings go to the user as a table before anything is changed.`
- agents/security-audit-prompt.md → `capabilities.security-review.notes`: `` **On this project, also work through:** secrets (none in the repo, `.env` ignored, secret scanning in CI); dependency audit against the pinned lockfile; input validation at every boundary with a schema (frontend G4) — imports especially, since an export file is untrusted input; the user's financial data at rest in IndexedDB (what a shared device or a browser extension can read; what the export contains; no telemetry per M2); and that no screenshot, fixture or test carries real figures (M1). ``
- agents/qa-prompt.md → `capabilities.qa-acceptance.notes`: `**The test matrix starts from the core journey in the addendum (K1)** and from the states each page spec declares; a state the spec names but the matrix omits is a QA defect.`
- agents/contract-check-prompt.md → `capabilities.contract-check.notes`: `` **In v1 the contract is the `Repository` interface and the export/import schema in `core/`.** Check the screens against those, and the generated contract doc against the source types. ``
- docs/standards/frontend-engineering-standards.md → `standards.documents`: `standard for web`
- docs/standards/standards-addendum-mizaniya.md → `standards.documents`: `addendum`
- package.json script peer-ai:check: removed

## Deleted

- `peer-ai/`: the 59 files git tracks in it
- `.peer-ai-state.json`

## Decisions

### 1. v0's text moved out of CLAUDE.md

These sections came from v0 and were taken out of `CLAUDE.md`. Put back anything this project still needs, in its own words; Peer AI's own instructions are in the marked block `render` writes.

**1. On every session start**

```md
## 1. On every session start

**Before doing anything else, read both files at the repo root:**

1. `.peer-ai-state.json` — the structured pointer (current phase, step, ticket, branch).
2. `CONTEXT.md` — the narrative log (repo rules, decisions, daily progress, what's next, open questions, the code-review checklist).

Then tell the user where things stand and continue from `currentStep` in the
active phase file. The state file holds the data; `CONTEXT.md` holds the story.
Field rules: `peer-ai/shared/workflow-state.md`.

---
```

**5. The workflow**

```md
## 5. The workflow

Each phase is a markdown file to read and follow step by step, conversationally
— ask questions, wait for answers, do not dump everything at once.

| # | Phase | File |
|:-:|-------|------|
| 0 | Setup (run once) | `peer-ai/shared/00-setup.md` |
| 1 | Understand | `peer-ai/shared/01-understand.md` |
| 2 | Architect | `peer-ai/shared/02-architect.md` |
| 3 | System Spec | `peer-ai/shared/03-spec-system.md` |
| 4 | API Contract | `peer-ai/shared/04-spec-api-contract.md` |
| 5 | Shared Rules | `peer-ai/shared/05-rules-shared.md` |
| 6 | Page / Endpoint Specs | `peer-ai/frontend/01-spec-pages.md` · `peer-ai/backend/01-spec-endpoints.md` |
| 6 | Track Rules | `peer-ai/frontend/02-rules.md` · `peer-ai/backend/02-rules.md` |
| 7 | Issues | `peer-ai/shared/06-issues.md` |
| 8 | Build | `peer-ai/frontend/03-build.md` · `peer-ai/backend/03-build.md` |
| 9 | Review | `peer-ai/frontend/04-review.md` · `peer-ai/backend/04-review.md` |
| 10 | Test | `peer-ai/frontend/05-test.md` · `peer-ai/backend/05-test.md` |
| 11 | Document | `peer-ai/shared/07-document.md` |
| 11b | PR Automation | `peer-ai/shared/09-pr-automation.md` |
| 12 | Dev Journal | `peer-ai/shared/08-dev-journal.md` |

Agent prompts (code review, contract check, security audit, QA) are in
`peer-ai/agents/`. There is a **design stop** after PAGE SPECS: the design
system and screen designs are produced outside the session and arrive in
`docs/design/`. Nothing before that invents a palette or a layout.

---
```

**Workflow Driver**

````md
# Workflow Driver

*(Body of `peer-ai/shared/rules/workflow-driver.md`, with §0 filled in for this
project. Where the flow below differs from the stock template — pull requests
instead of local merges — that is this project's git convention, recorded in §0.)*

You are **always** inside the development workflow. You do not wait for the user
to say "Follow peer-ai/...". You read the current state, follow the process, and
enforce every gate.

---

## 0. Project settings

| Setting | Value |
|---------|-------|
| **Verify command** | `npm run verify` — naming, lint, typecheck, tests, build. Established in SHARED RULES |
| **Issue tracker** | GitHub Issues on `AbuMahir980/mizaniya`. **No project board and no milestones** — deliberate, see `CONTEXT.md` Key Decisions. Status is carried by labels: Backlog is an open issue with no status label, In Progress adds `status:in-progress`, Done is closed as Completed with that label removed. `cycle-1/2/3` are the phases |
| **Ticket prefix** | none — issues are `#N` |
| **Remote** | `origin` → github.com/AbuMahir980/mizaniya.git |
| **Design reference** | `docs/design/` — landed 10 September, re-cut many times since. **`tokens.md` is authoritative for values; the PNG is what you build from.** Read the PNG first, then `canvas/*.dc.html` as a tree for exact numbers. The old wording here said "the markup to read, not the PNGs", meaning *take values from markup rather than eyeballing pixels* — it was taken as licence never to open the screens, and every rebuilt screen paid for it |
| **Questions for the designer** | `docs/open-items.md`, a new lettered section per round. They answer in place and mark the heading `answered <date>`. Not a message — the questions belong next to the answers |
| **Branch naming** | `feature/<short-description>` for build items · `peer-ai/<phase>` for phase documents |
| **Merge policy** | **Every piece of work goes on a branch and reaches `main` only through a pull request with CI green. Squash and merge. Delete the branch after.** |
| **PR description** | What changed and why. No AI attribution lines, no emoji, no tool names. |

Consequences that apply everywhere below:

- **Merging a stack is not the same as merging a branch.** The convention below
  is written for one branch off `main`. When PRs are stacked — each based on the
  one beneath it — three things change, and getting them wrong costs an
  afternoon:
  - **Merge with a merge commit, not a squash.** Squashing rewrites the commits
    beneath, so the next PR up re-applies the same changes against a `main` that
    already has them, and conflicts on every shared file.
  - **Retarget each PR to `main` as the one below it merges.** GitHub does not
    reliably do this for you; set `--base main` explicitly before merging.
  - **Delete branches only once the whole stack has landed.** Deleting a branch
    that another PR is *based on* **closes that PR**, and GitHub then refuses to
    reopen it because its base no longer exists. Recovering means pushing the old
    tip back to restore the branch first.

- **Merge policy is `PR only`.** A branch reaches `main` **through a pull
  request**, never a local merge — open it, let the checks run, and merge it
  there. Nothing is committed to `main` directly: not a phase document, not a
  fix, not a one-line typo. `shared.md` requires one peer review before merge,
  and that review happens **on the pull request**, so there is nowhere else for
  it to happen.
- **CI green is a merge gate, not a suggestion.** `.github/workflows/pr-checks.yml`
  exists as of issue #52: three required jobs — **verify** (`npm run verify`, the
  same one command run locally), **repo rules** (rule 3), **secret scanning**
  (rule 1). Wait for them. Red is not done, and a cancelled run is not a pass.
  Branch protection is still not on, so merging remains a human action — the
  checks now have to be *looked at* rather than merely asserted.
- **Push every phase commit as it lands.** The repo is built in the open and the
  remote is the only backup.
- **Issue tracker is live** (GitHub Issues, no prefix). Wherever a step says to
  move, comment on, or update a ticket, do it against `AbuMahir980/mizaniya`.

---

## 1. On every session start

**First action — before doing anything else:**

1. Read `.peer-ai-state.json` in the app root.
2. Read `CONTEXT.md` in the app root — the narrative companion carrying decisions, open questions, the review checklist and what comes next. **Read both before doing anything.**
3. Tell the user where we are:

   > "Resuming **[currentPhase]** phase — **[ticket]**: [ticketTitle]. [Brief context from `notes` if present.]"

2b. **Check `currentPhase` is one of the published values** in
   `peer-ai/shared/workflow-state.md`. If it is not — an invented name, or a
   status like `review-complete` rather than a phase — say so, work out the right
   value from `phaseFile`, correct it, and note the correction. A value nobody
   validates drifts, and then nothing downstream can match on it.

4. Read the phase file (`phaseFile` from state) and pick up from `currentStep`.
5. If `ticketsInProgress` is empty and `ticketsRemaining` has items, the next action is starting the first remaining ticket (move it to In Progress, create the ticket branch off `main`, push it, read the acceptance criteria).

**If the user's first message is unrelated** (a question, a bug to fix): treat it as an **interruption** (§4). Handle it, then resume.

---

## 2. During work — follow the phase file

Read and follow the steps in the active `peer-ai/` phase file. Key rules:

### Build phase (`peer-ai/frontend/03-build.md`)

For each ticket:

**Before code:**
- **Correct branch (mandatory):** `git branch --show-current` must match this ticket's branch. Never `main`. If wrong, checkout or create the correct branch before editing.
- Move the issue **Backlog → In Progress** on GitHub Issues.
- Create the ticket branch off `main` using the **Branch naming** from §0, then `git push -u origin <ticket-branch>` so the branch is on the remote before the PR opens.
- **Design first (UI work) — and that means the image, not a grep.**
  1. **Open the PNG.** `docs/design/<n>-<screen>-360-light.png`, then `-dark`,
     then `-1440-light`. **Describe the screen before writing anything.** Every
     screen rebuilt in this project was first built from fragments grepped out
     of `canvas/*.dc.html`, and every one of them invented layout, copy or an
     interaction model the design had already settled.
  2. **Then read `canvas/*.dc.html` as a tree**, for exact values — sizes,
     tones, radii, spacing. Grepping it returns a class, not a screen.
  3. **`tokens.md` is authoritative for the scale**; `brand/README.md` owns the
     wordmark and the app icon, which are not type or radius steps.
  4. **Invent nothing.** Where the design does not answer something, ask in
     `docs/open-items.md` — do not fill the gap and move on.
  5. **The canvas is re-cut often.** Re-pull before each screen; a drop lands
     mid-build otherwise and the work is against stale values.

  The design is authoritative on layout, spacing, type and colour; the page spec
  is authoritative on behaviour, states and data. When they conflict, follow
  `peer-ai/shared/design-data-contract.md` — **name it, log it, never pick a
  side quietly.**
- Read the acceptance criteria from the issue, and the page spec from `docs/`.

**During code:**
- Follow `docs/standards/` (authoritative) and the workflow-layer rules files.
- **There is no mock-data layer.** v1 has no server: the data seam is the `Repository` interface named in the architecture, and the local implementation is the real one. (Peer AI's build step 4 assumes an HTTP API — logged in `docs/peer-ai-feedback.md`.)
- Write tests **alongside** the code, not after.

**After code, before saying "done" on any ticket:**
- Run the **Verify command** from §0. Report the result. If red, fix and re-run. **Never skip this.**
- Push the ticket branch and **open a pull request** whose description says what changed and why. Wait for CI. **Red is not done.**
- Squash and merge once CI is green, then delete the branch locally and on `origin`.
- **Commit** `.peer-ai-state.json` and any updated rules/standards files on the same branch when phase/ticket changes — never directly on `main`.
- Issue tracker — all required:
  1. Tick the acceptance criteria, and **close the issue as Completed**.
  2. **Remove `status:in-progress`.** Closing does not remove it, and a finished
     ticket still labelled in progress is a lie the board tells confidently.
  3. Add a **completion comment** (3–5 bullets: shipped, deviations, follow-ups).
  4. **There is no project board** — see §0. The project-level record is the
     dated entry in `CONTEXT.md`, which carries the reasoning a one-line status
     never could. Write it there, not on a board that does not exist.
- Update `.peer-ai-state.json`: move the ticket from remaining/in-progress → completed, set the next ticket, update `lastVerifyResult` and `lastUpdated`.

### Review / Test / Document phases

Follow the active phase file step by step. Do not skip numbered steps or handoff gates.

---

## 3. Phase transitions — automatic handoffs

When a phase completes, follow the handoff from the phase file **and** advance the state:

```
build → offer code review + contract check agents → advance to review
review → offer security audit agent → advance to test
test → offer QA agent → advance to document
document → open PR, advance to done, write the dated entry in `CONTEXT.md`
```

Each phase's documents land on a `peer-ai/<phase>` branch and reach `main`
through their own pull request, whose commit is named `peer-ai: <phase>`.

Update `.peer-ai-state.json` at every transition: set `currentPhase`,
`phaseFile`, `currentStep` to 1, and `notes` to a one-liner pointer (not narrative).

---

## 4. Interruptions

If the user brings something unrelated mid-workflow:

1. **Before switching:** update `.peer-ai-state.json` `notes` with where you were.
2. **Handle the interruption fully** — do not half-do it. Use a correct branch for the interruption topic; it needs its own PR like anything else.
3. **After:** tell the user: "Interruption handled. Resuming **[phase]** — **[ticket]**, step **[N]**."
4. If the interruption changed docs or decisions, update `CONTEXT.md` and cross-reference affected docs before resuming.
5. **Resume strictly:** confirm `git branch` matches the owning ticket/phase before continuing.

---

## 4a. Context update — mandatory at session end or ~80% context

When the user says "update the context", "wrap up", "start a new chat", or when context usage is visibly high (~80%+), do all of the following before the session ends:

1. **Update `CONTEXT.md`** — add a dated entry under "What Was Done — By Day"; refresh "Current State", "What's Next" and "Open Questions".
2. **Update `.peer-ai-state.json`** — `lastUpdated`, `currentPhase`, `currentStep`, `notes` (one-liner pointer only).
3. **Confirm:** "Context saved. Safe to start a new chat — the next session will read both files and pick up from here."

This is a single atomic action. The `notes` field is a pointer, not a narrative.

---

## 5. Mandatory gates — never skip these

| Gate | When | What to do |
|------|------|------------|
| **Correct branch** | Before any commit | Never `main`. Checkout or create the owning `feature/…` or `peer-ai/…` branch. |
| **Verify** | Before any "done", "complete", "ready for PR" | Run the Verify command from §0. Red = not done. |
| **Push branch** | After the first commit on a branch | `git push -u origin <branch>`. |
| **Pull request** | Before anything reaches `main` | Open a PR saying what changed and why. No AI attribution lines. |
| **CI green** | Before merging any pull request | All three jobs in `pr-checks.yml` passing — verify, repo rules, secret scanning. **A check that was skipped is not a check that passed**, and neither is one that was cancelled. Branch protection is not on yet, so nothing stops a red merge but you. |
| **Squash and delete** | After merge | Squash and merge; delete the branch locally and on `origin`. |
| **Issue tracker update** | After each ticket | AC ticked + closed as Completed + `status:in-progress` removed + completion comment. The project-level record is `CONTEXT.md`, not a board. |
| **State file update** | After each ticket or phase transition | Write and commit `.peer-ai-state.json`. |
| **Tests with code** | With every new feature | Co-located test files. Not batched. Not deferred. |
| **Design-quality pass** | After each UI page works | **Open the PNG at 360 and 1440, light and dark, and compare.** A list of ticked behaviours is not this pass — open item 5 was ticked that way and the screen shipped with no icons and a wordmark at 70% of its drawn size. This agent cannot see a browser: say so and ask the owner to look. |
| **Design drop hygiene** | Every commit | **Never `git add -A`.** The designer writes into this worktree, and `git add -A` has swept a whole drop into a feature commit twice. Stage by path. `scripts/check-design-drop.mjs` fails CI on it. |
| **No real figures** | Every commit | Figures come from `docs/seed-data.md` only. |
| **Context save** | Session end or ~80% context | Update `CONTEXT.md` and `.peer-ai-state.json` atomically (§4a). |

---

## 6. What the state file looks like

Location: app root `.peer-ai-state.json` (**tracked in git**). Schema:
`peer-ai/templates/.peer-ai-state.json`. Field documentation and `notes` rules:
`peer-ai/shared/workflow-state.md`.

---

## 7. Models

**Opus for build. Fable for everything else. Never downgrade mid-phase.** Each
phase file states its model on its `> **Model:` line. There is no model-switch
gate at a phase boundary and no cost tier to announce.

---

## 8. Relationship to other rules

- **`docs/standards/`** — authoritative on code. Wins on any conflict.
- **`peer-ai/shared/rules/shared.md`** — workflow layer: continuity, git, journal, PDF export.
- **`peer-ai/frontend/rules/frontend.md`** — track conventions during build.
- **`peer-ai/shared/design-data-contract.md`** — when design and contract disagree.
- **`peer-ai/shared/workflow-state.md`** — state file and `notes` field rules.

The **state file** is authoritative for phase/step. **`CONTEXT.md`** is
authoritative for decisions and history.
````

### 2. phase-config.json blocks the project has changed since

Each block below was stamped into its phase file once, and the file no longer starts the block the same way: the project changed it later. Neither version was converted. Decide which still holds, and put it in `peer-ai.config.json` or the project's own standards.

**backend/01-spec-endpoints.md**. What the phase file said: `git show 0b6e325:peer-ai/backend/01-spec-endpoints.md`.

```md
> **Dormant until v3.** There is no server in v1 or v2; sync, household sharing and payments arrive as a separate private repository. Do not run this phase now. When v3 starts, `docs/standards/backend-engineering-standards.md` governs it, and the `Repository` interface from `core/` is the contract it must honour.
```

### 3. Settings migrate couldn't place

Each is quoted as v0 had it. Put it in `peer-ai.config.json`, the project's standards, or its own instructions, or drop it.

- Questions for the designer: `docs/open-items.md`, a new lettered section per round. They answer in place and mark the heading `answered <date>`. Not a message — the questions belong next to the answers
- PR description: What changed and why. No AI attribution lines, no emoji, no tool names.
- shared/00-setup.md: **This project's rules are already written.** `docs/standards/frontend-engineering-standards.md`, `docs/standards/backend-engineering-standards.md` and `docs/standards/standards-addendum-mizaniya.md` are the rulebook, and `docs/product-brief.md` is the brief. `CLAUDE.md` must point at them by path — the Peer AI shared rules file is the workflow layer, not the standard.
- shared/00-setup.md: **Record the environment in `CONTEXT.md`, not just the repo rules.** Two lines every later phase depends on: (1) which client this session is running in (Claude Code desktop app / VS Code extension / CLI), and (2) the result of typing `/` — which of the `engineering:*`, `design:*` and `product-management:*` skills the session actually offers. These are `@inline` account bundles, absent from the marketplace catalogue, so the client decides whether they exist; see the box in `peer-ai/AGENTS.md`. A phase that finds its skill missing reports it and works from the phase file — never silently.
- shared/00-setup.md: **The setup question round is already answered — do not re-ask it.** Tool: **Claude Code** (desktop app). Project: **Mizaniya** — a local-first household money app for salary-cycle budgeting, debts in both directions, and a sinking fund for annual rent. Issue tracker: **GitHub Issues** on `AbuMahir980/mizaniya` (no ticket prefix — issues are `#N`). Remote: **`origin`** → github.com/AbuMahir980/mizaniya.git; **push every phase commit as it lands**, because the repo is built in the open and the remote is the only backup. Verify command: **`none yet`** until BUILD creates `package.json` — establishing one is BUILD's first task. Design reference: **`docs/design/`**, empty until the design stop after PAGE SPECS. Branch naming: `feature/<short-description>`. Starting point: **brand-new build**.
- Says a part is dormant, which migrate didn't apply, since it couldn't tell which part or it was the only one left: backend/02-rules.md: **Dormant until v3.** The backend standard already exists in `docs/standards/backend-engineering-standards.md`; when a server is built, this phase maps its `auto` rules to enforcement and its `review` rules to the checklist, exactly as the frontend track does. It does not write a competing standard.
- Says a part is dormant, which migrate didn't apply, since it couldn't tell which part or it was the only one left: backend/03-build.md: **Dormant until v3.**
- Says a part is dormant, which migrate didn't apply, since it couldn't tell which part or it was the only one left: backend/04-review.md: Dormant until v3. Then review against `docs/standards/backend-engineering-standards.md` — money in minor units, idempotency, per-resource authorisation, audience axis, migrations only, config that fails closed.
- Says a part is dormant, which migrate didn't apply, since it couldn't tell which part or it was the only one left: backend/05-test.md: Dormant until v3.

### 4. The project's standards documents

These became `standards.documents`, which `standards_for_file` serves before editing a file. Check each one's role and the parts it covers.

- `docs/standards/frontend-engineering-standards.md`: standard, for web
- `docs/standards/standards-addendum-mizaniya.md`: addendum, for the whole project

Left out, for now:

- `docs/standards/backend-engineering-standards.md`: for the backend, and there is no backend part yet.

### 5. Work carried over from v0's state

Nothing was in progress, so no work items were carried over.

Still to do in the tracker, which keeps them; start a work item when work on one starts: #23, #24, #25, #26, #27, #29, #58, #72, #85, #106, #112, #113.

Cycle, as v0 had it:

> Paused 28 Sep for the Peer AI rewrite — records true, nothing in flight

Notes, as v0 had it:

> PAUSED for the Peer AI rewrite (npm package + skills) — nothing in flight, nothing unpushed. READ CONTEXT.md at app root: 'Current State', 'What's Next' and the 2026-09-28 entry. Next action when work resumes: the spec rewrite, N4 first.

The whole state file is kept at the end of this file.

### 6. Files the project changed in peer-ai/ (33)

These are v0 files the project edited, or files it added. They were deleted with the folder, and git keeps them: `git show 0b6e325:peer-ai/<file>` shows each one as it was, and `git log -p -- peer-ai/<file>` what the project changed. Move anything still needed into the project's own standards, its instructions, or `peer-ai.config.json`.

- `peer-ai/AGENTS.md`
- `peer-ai/CONTRIBUTING.md`
- `peer-ai/README.md`
- `peer-ai/agents/contract-check-prompt.md`
- `peer-ai/agents/qa-prompt.md`
- `peer-ai/agents/review-prompt.md`
- `peer-ai/agents/security-audit-prompt.md`
- `peer-ai/backend/01-spec-endpoints.md`
- `peer-ai/backend/02-rules.md`
- `peer-ai/backend/03-build.md`
- `peer-ai/backend/04-review.md`
- `peer-ai/backend/05-test.md`
- `peer-ai/backend/rules/backend.md`
- `peer-ai/docs/peer-ai-feedback.md`
- `peer-ai/frontend/01-spec-pages.md`
- `peer-ai/frontend/02-rules.md`
- `peer-ai/frontend/03-build.md`
- `peer-ai/frontend/04-review.md`
- `peer-ai/frontend/05-test.md`
- `peer-ai/frontend/rules/frontend.md`
- `peer-ai/shared/00-setup.md`
- `peer-ai/shared/01-understand.md`
- `peer-ai/shared/02-architect.md`
- `peer-ai/shared/03-spec-system.md`
- `peer-ai/shared/04-spec-api-contract.md`
- `peer-ai/shared/05-rules-shared.md`
- `peer-ai/shared/06-issues.md`
- `peer-ai/shared/07-document.md`
- `peer-ai/shared/08-dev-journal.md`
- `peer-ai/shared/09-pr-automation.md`
- `peer-ai/shared/rules/docs-pdf-export.md`
- `peer-ai/shared/rules/shared.md`
- `peer-ai/shared/rules/workflow-driver.md`

### 7. package.json scripts that only ran v0's files

These scripts did nothing but run a file inside the copy, which is gone, so they were removed:

- `peer-ai:check`: `node peer-ai/check-upstream.mjs`

### 8. Left as they were

- `CONTEXT.md` stays, as the project's own document. v0 told the AI to read it at the start of every session, and 1.0 doesn't: to keep that, say so in the project's own instructions.
- `docs/peer-ai-feedback.md` is v0's local feedback log. Send each item that still applies with `draft_feedback` and `npx peer-ai feedback send`, then delete it.
- `CLAUDE.md:7` still mentions v0's folder: `` AI development workflow**, whose playbook is vendored in `peer-ai/`. ``
- `CLAUDE.md:19` still mentions v0's folder: `` `peer-ai/` playbook, the phase files named in §5 and the paths throughout this ``
- `CLAUDE.md:49` still mentions v0's folder: `` `peer-ai/shared/rules/shared.md` and `peer-ai/frontend/rules/frontend.md` are ``
- `CLAUDE.md:118` still mentions v0's folder: `` announce and no model-switch gate — see `peer-ai/shared/rules/shared.md` ``
- `CLAUDE.md:121` still mentions v0's folder: `` **Skills are named per phase** in the table in `peer-ai/AGENTS.md`, and are ``
- `eslint.config.js:21` names v0's folders: `{ ignores: ['**/dist', '**/coverage', 'docs', 'peer-ai', '**/node_modules'] },`
- v0's numbered documents in `docs/` stay where they are. `peer-ai assess` maps them like any others.

### 9. Make Peer AI's CI gate a required check

`render` added `.github/workflows/peer-ai.yml`, which runs `peer-ai check` on every pull request (RFC 0009). Only the repository's owner can make a check required: in GitHub, add the status check `peer-ai check` to the main branch's rules, so no change merges without it.

## As v0 had them

These files are kept here whole, for reference.

**peer-ai/phase-config.json**

```json
{
  "_note": "Mizaniya fine-tune of the vendored peer-ai copy. Model lines replace peer-ai's default cost-tiering, which told the reader to switch to a cheaper, weaker model at nearly every phase — including code review, on an app that handles the user's money. Project convention: Opus for build, Fable for everything else; if Fable is not offered in the session's model picker, use the most capable model available and never downgrade mid-phase. Skills are the Cowork/Claude Code plugin skills named directly; a skill that is not installed must be reported, never silently skipped. Re-run apply-phase-config.ps1 after any upstream update — it is idempotent.",
  "shared/00-setup.md": {
    "model": "> **Model: Fable.** Project convention: **Opus for build, Fable for everything else.** If Fable is not offered in this session, use the most capable model available. This replaces peer-ai's default cost-tiering, which told the reader to downgrade at nearly every phase — including code review, on an app that handles the user's money.",
    "block": [
      "> **This project's rules are already written.** `docs/standards/frontend-engineering-standards.md`, `docs/standards/backend-engineering-standards.md` and `docs/standards/standards-addendum-mizaniya.md` are the rulebook, and `docs/product-brief.md` is the brief. `CLAUDE.md` must point at them by path — the Peer AI shared rules file is the workflow layer, not the standard.",
      "> **Record the environment in `CONTEXT.md`, not just the repo rules.** Two lines every later phase depends on: (1) which client this session is running in (Claude Code desktop app / VS Code extension / CLI), and (2) the result of typing `/` — which of the `engineering:*`, `design:*` and `product-management:*` skills the session actually offers. These are `@inline` account bundles, absent from the marketplace catalogue, so the client decides whether they exist; see the box in `peer-ai/AGENTS.md`. A phase that finds its skill missing reports it and works from the phase file — never silently.",
      "> **The setup question round is already answered — do not re-ask it.** Tool: **Claude Code** (desktop app). Project: **Mizaniya** — a local-first household money app for salary-cycle budgeting, debts in both directions, and a sinking fund for annual rent. Issue tracker: **GitHub Issues** on `AbuMahir980/mizaniya` (no ticket prefix — issues are `#N`). Remote: **`origin`** → github.com/AbuMahir980/mizaniya.git; **push every phase commit as it lands**, because the repo is built in the open and the remote is the only backup. Verify command: **`none yet`** until BUILD creates `package.json` — establishing one is BUILD's first task. Design reference: **`docs/design/`**, empty until the design stop after PAGE SPECS. Branch naming: `feature/<short-description>`. Starting point: **brand-new build**."
    ]
  },
  "shared/01-understand.md": {
    "model": "> **Model: Fable.**",
    "block": [
      "> **No skill for this phase.** `docs/product-brief.md` is the requirements source and `docs/seed-data.md` holds the only figures you may use. Read both before asking anything; arrive with a draft understanding to correct, not a blank page. The stakeholder is the user — ask about how the spreadsheet is actually used, not what sounds impressive."
    ]
  },
  "shared/02-architect.md": {
    "model": "> **Model: Fable.**",
    "block": [
      "> **Skills to use here.** Invoke these *inside* this phase to deepen the single artefact it produces — never as a parallel process. Two overlapping processes yield two architectures that disagree, and then nobody knows which is authoritative.",
      "> - `engineering:architecture` — structural options and their trade-offs",
      "> - `engineering:system-design` — how the pieces fit and where the boundaries sit",
      ">",
      "> **Constraints already decided** (do not reopen): local-first; IndexedDB via Dexie behind a `Repository` interface; a framework-free `core/` for cycle maths, safe-to-spend, rollover, projected gap, zakat estimate and money in kobo; React 19 + TypeScript + Vite; folder structure per frontend standards A1–A5; v2 is Expo sharing `core/`; v3 is a separate private API repo. One ADR per decision, using `shared/templates/architecture-decision-record.md`."
    ]
  },
  "shared/03-spec-system.md": {
    "model": "> **Model: Fable.**",
    "block": [
      "> **Skills to use here.** Invoke inside this phase, not alongside it.",
      "> - `product-management:write-spec` — turning decisions into a spec someone can build from",
      ">",
      "> Every user story names its states (loading, empty, error, offline, success) and the exact numbers the screen shows. Money is always `{ amount, type }` in kobo (frontend H1, H5)."
    ]
  },
  "shared/04-spec-api-contract.md": {
    "model": "> **Model: Fable.**",
    "block": [
      "> **No skill — and there is no server in v1.** The \"API\" here is (1) the `Repository` interface and (2) the JSON export/import schema. Write both once, as TypeScript types plus a runtime schema (zod) in `core/`, and derive the contract document from them — never hand-write the same shape twice (frontend G2, G4). Add a CI step that regenerates the contract doc and fails on any diff. Mark where a v3 API would slot in behind the same interface."
    ]
  },
  "shared/05-rules-shared.md": {
    "model": "> **Model: Fable.**",
    "block": [
      "> **Skills to use here.** Invoke inside this phase, not alongside it.",
      "> - `design:design-system` — token discipline and component conventions",
      ">",
      "> **This project already has its standards in `docs/standards/`.** This phase does not write a competing one. It produces `docs/05-coding-standards.md` as a short index: links to the three standards files; every `auto` rule with the exact ESLint rule, tsconfig option or CI check that enforces it; every `review` rule as the review checklist (also written into `CONTEXT.md`); and the token contract from `docs/design/tokens.md`. Ask the user only about addendum values that are still blank."
    ]
  },
  "shared/06-issues.md": {
    "model": "> **Model: Fable.**",
    "block": [
      "> **Skills to use here.** Invoke inside this phase, not alongside it.",
      "> - `engineering:tech-debt` — separating what must be fixed now from what is merely untidy",
      ">",
      "> Anything not in `docs/product-brief.md` goes to `docs/backlog.md`, not into an issue for this build."
    ]
  },
  "shared/07-document.md": {
    "model": "> **Model: Fable.**",
    "block": [
      "> **Skills to use here.** Invoke inside this phase, not alongside it.",
      "> - `engineering:documentation` — structure and audience for the docs produced here",
      ">",
      "> README order is fixed by the repo rules in `CONTEXT.md`: the problem, the screenshots, features, how it works (cycles, envelopes, debts, projected gap), running locally, roadmap, licence (one line: PolyForm Noncommercial 1.0.0, link to `LICENSE`). `docs/engineering-notes/` is part of the documentation set (it replaced `docs/concepts/` on 2026-09-25)."
    ]
  },
  "shared/08-dev-journal.md": {
    "model": "> **Model: Fable.**",
    "block": []
  },
  "shared/09-pr-automation.md": {
    "model": "> **Model: Opus** — CI configuration is build work.",
    "block": [
      "> **CI is created here from nothing.** Stages, in order: install with pinned lockfile; lint (every `auto` rule in `docs/standards/` has a lint or tsconfig backing); typecheck; unit tests for `core/` with the coverage gate on money modules (frontend H4, K2); component tests; Playwright core journey (addendum K1); secret scanning; contract-doc regeneration diff (see 04). Nothing merges red."
    ]
  },
  "frontend/01-spec-pages.md": {
    "model": "> **Model: Fable.**",
    "block": [
      "> **Skills to use here.** Invoke these *inside* this phase to deepen the page specs, never as parallel processes producing competing documents.",
      "> - `design:accessibility-review` — target sizes, contrast, motion, screen-reader paths (frontend J)",
      "> - `design:ux-copy` — the words on the screen, in British English, in the user's vocabulary (frontend O4)",
      ">",
      "> **The designs do not exist yet — they are produced from these specs.** After this phase the workflow stops; the design system and screen designs are made outside this session from the page specs and land in `docs/design/` (`tokens.md` + PNGs). So each spec must be complete enough to design from: every state (loading, empty, error, offline, success), every number shown and where it comes from in `core/`, the primary action, and what the danger colour would mean on that screen (addendum: money going wrong, nothing else). Pages: Onboarding, Home, Plan, Transactions (+ Quick Add sheet), Debts & Goals (+ debt record view), Months, Settings."
    ]
  },
  "frontend/02-rules.md": {
    "model": "> **Model: Fable.**",
    "block": [
      "> **Skills to use here.** Invoke inside this phase, not alongside it.",
      "> - `design:design-system` — component and token conventions",
      "> - `design:accessibility-review` — the accessibility rules that belong in the standard",
      ">",
      "> **The frontend standard already exists** — `docs/standards/frontend-engineering-standards.md` plus the addendum. This phase does not walk through generic defaults; it maps each `auto` rule to its ESLint/tsconfig/CI enforcement and each `review` rule to the checklist, and records the token contract from `docs/design/tokens.md`. Delete nothing from the standard here; propose changes as feedback."
    ]
  },
  "frontend/03-build.md": {
    "model": "> **Model: Opus** — implementation.",
    "block": [
      "> **Learning mode was replaced on 2026-09-24 — see `CLAUDE.md` §4.** There is no three-line file header and no `docs/concepts/`; both were removed. Explanation lives in `docs/engineering-notes/`, one note per topic, written when the topic is built or deliberately deferred. Build order and one-commit-per-item are in `CONTEXT.md`."
    ]
  },
  "frontend/04-review.md": {
    "model": "> **Model: Fable.**",
    "block": [
      "> **Skills to use here.** Invoke inside this phase, not alongside it.",
      "> - `engineering:code-review` — the review itself. **Verify it is installed before relying on it.** If it is missing, review directly from this file and say the skill was unavailable — never skip the step silently.",
      ">",
      "> Claude Code ships `/code-review`, which reads the real diff, so prefer it over pasting code into a prompt.",
      ">",
      "> Review against `docs/standards/frontend-engineering-standards.md` and the addendum. Every rule there marked `review` is a promise that a human checks it — this is where that promise is kept. Count, don't judge: C1 (prop passes through ≤2 components), D1 (≤150 lines), D2 (≤7 props), E1/E2 (third duplicate extracts; money and validation extract on the first repeat), H3 (no money arithmetic in a component)."
    ]
  },
  "frontend/05-test.md": {
    "model": "> **Model: Fable.**",
    "block": [
      "> **Skills to use here.** Invoke inside this phase, not alongside it.",
      "> - `engineering:testing-strategy` — what is tested, at which layer, and why",
      ">",
      "> The core journey in `docs/standards/standards-addendum-mizaniya.md` (K1) is the acceptance test, run in Playwright. `core/` is tested exhaustively with plain values (K2), including cycle boundaries, month rollover, a debt paid early, a salary that arrives late, and export → import round-trip (M3). Test by role and label, not test id (K3)."
    ]
  },
  "backend/01-spec-endpoints.md": {
    "model": "> **Model: Fable.**",
    "block": [
      "> **Dormant until v3.** There is no server in v1 or v2; sync, household sharing and payments arrive as a separate private repository. Do not run this phase now. When v3 starts, `docs/standards/backend-engineering-standards.md` governs it, and the `Repository` interface from `core/` is the contract it must honour."
    ]
  },
  "backend/02-rules.md": {
    "model": "> **Model: Fable.**",
    "block": [
      "> **Dormant until v3.** The backend standard already exists in `docs/standards/backend-engineering-standards.md`; when a server is built, this phase maps its `auto` rules to enforcement and its `review` rules to the checklist, exactly as the frontend track does. It does not write a competing standard."
    ]
  },
  "backend/03-build.md": {
    "model": "> **Model: Opus** — implementation.",
    "block": [
      "> **Dormant until v3.**"
    ]
  },
  "backend/04-review.md": {
    "model": "> **Model: Fable.**",
    "block": [
      "> **Skills to use here.** Invoke inside this phase, not alongside it.",
      "> - `engineering:code-review` — the review itself",
      ">",
      "> Dormant until v3. Then review against `docs/standards/backend-engineering-standards.md` — money in minor units, idempotency, per-resource authorisation, audience axis, migrations only, config that fails closed."
    ]
  },
  "backend/05-test.md": {
    "model": "> **Model: Fable.**",
    "block": [
      "> **Skills to use here.** Invoke inside this phase, not alongside it.",
      "> - `engineering:testing-strategy` — what is tested, at which layer, and why",
      ">",
      "> Dormant until v3."
    ]
  },
  "agents/review-prompt.md": {
    "model": "> **Model: Fable.** (Project convention — this replaces peer-ai's downgrade guidance, which is the wrong instruction for a quality gate on an app that handles the user's money.)",
    "block": [
      "> **Review against, in this order:**",
      "> - `docs/standards/frontend-engineering-standards.md` — every `review` rule is the checklist; the `auto` rules should already be green in CI, so a red one is a CI defect too",
      "> - `docs/standards/standards-addendum-mizaniya.md` — kobo, danger colour meaning, core journey",
      "> - the repo rules in `CONTEXT.md` — no real figures, no employer or client names, no secrets",
      ">",
      "> One finding = one location + one fix. Correctness before style. Findings go to the user as a table before anything is changed."
    ]
  },
  "agents/security-audit-prompt.md": {
    "model": "> **Model: Fable.** (Project convention — a security audit run on a deliberately weakened model is a false reassurance.)",
    "block": [
      "> **On this project, also work through:** secrets (none in the repo, `.env` ignored, secret scanning in CI); dependency audit against the pinned lockfile; input validation at every boundary with a schema (frontend G4) — imports especially, since an export file is untrusted input; the user's financial data at rest in IndexedDB (what a shared device or a browser extension can read; what the export contains; no telemetry per M2); and that no screenshot, fixture or test carries real figures (M1)."
    ]
  },
  "agents/qa-prompt.md": {
    "model": "> **Model: Fable.** (Project convention — QA is a gate, not a formality.)",
    "block": [
      "> **The test matrix starts from the core journey in the addendum (K1)** and from the states each page spec declares; a state the spec names but the matrix omits is a QA defect."
    ]
  },
  "agents/contract-check-prompt.md": {
    "model": "> **Model: Fable.** (Project convention — contract drift is silent until it is expensive.)",
    "block": [
      "> **In v1 the contract is the `Repository` interface and the export/import schema in `core/`.** Check the screens against those, and the generated contract doc against the source types."
    ]
  }
}
```

**.peer-ai-state.json**

```json
{
  "currentPhase": "spec-pages",
  "currentStep": 1,
  "phaseFile": "peer-ai/frontend/01-spec-pages.md",
  "cycle": "Paused 28 Sep for the Peer AI rewrite — records true, nothing in flight",
  "milestoneBranch": "",
  "ticket": "",
  "ticketTitle": "Rewrite the specs to match the design (N4, O2, N1-N3), then re-issue the build plan",
  "ticketsCompleted": [
    "#8",
    "#9",
    "#10",
    "#11",
    "#12",
    "#13",
    "#14",
    "#15",
    "#16",
    "#17",
    "#18",
    "#19",
    "#20",
    "#21",
    "#22",
    "#28",
    "#52",
    "#55",
    "#60",
    "#61",
    "#62",
    "#65",
    "#71",
    "#73",
    "#74",
    "#79",
    "#92",
    "#93",
    "#94",
    "#111"
  ],
  "ticketsCancelled": [
    "#68",
    "#69",
    "#70",
    "#53"
  ],
  "ticketsInProgress": [],
  "ticketsRemaining": [
    "#23",
    "#24",
    "#25",
    "#26",
    "#27",
    "#29",
    "#58",
    "#72",
    "#85",
    "#106",
    "#112",
    "#113"
  ],
  "pendingAgents": [],
  "lastVerifyResult": "pass",
  "lastVerifyTimestamp": "2026-09-28",
  "pdfExportOffered": "",
  "lastUpdated": "2026-09-28",
  "notes": "PAUSED for the Peer AI rewrite (npm package + skills) — nothing in flight, nothing unpushed. READ CONTEXT.md at app root: 'Current State', 'What's Next' and the 2026-09-28 entry. Next action when work resumes: the spec rewrite, N4 first."
}
```
