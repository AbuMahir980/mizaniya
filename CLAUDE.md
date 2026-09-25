# CLAUDE.md — Mizaniya

Mizaniya is a local-first household money app for salary-cycle budgeting, debts
in both directions, and a sinking fund for annual rent. It is built in the open
using the **Peer AI development workflow**, whose playbook is vendored in
`peer-ai/`.

---

## 1. On every session start

**Before doing anything else, read both files at the repo root:**

1. `.peer-ai-state.json` — the structured pointer (current phase, step, ticket, branch).
2. `CONTEXT.md` — the narrative log (repo rules, decisions, daily progress, what's next, open questions, the code-review checklist).

Then tell the user where things stand and continue from `currentStep` in the
active phase file. The state file holds the data; `CONTEXT.md` holds the story.
Field rules: `peer-ai/shared/workflow-state.md`.

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
