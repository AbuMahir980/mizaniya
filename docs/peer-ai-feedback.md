# Peer AI — feedback from the Mizaniya build

Defects in the **framework itself**, found while building Mizaniya on a vendored
copy of Peer AI. These travel back to the public repo
(github.com/AbuMahir980/peer-ai) by hand, as `peer-ai/CONTRIBUTING.md` describes.

**This file is only for framework defects.** Mizaniya's own customisations —
models, skills, the standards wiring — live in `peer-ai/phase-config.json` and
the vendored files, and must never be pushed upstream. The test for an entry
here is: *would this bite anyone who cloned Peer AI, on any project?*

---

## Sent upstream and fixed — 11 September 2026

**All four items below were filed and applied in the Peer AI repo.** They are
kept here, unedited, because the write-up is the record of why the fix exists —
but **do not re-report them**, and do not work around them locally: pull the
update instead.

| This file's item | Upstream item | Status |
|---|---|---|
| 1 — build step 4 unusable with no server | **29** | Applied in `790aa8a` |
| 2 — build step 2 has no "design already exists" branch | **30** | Applied in `790aa8a` |
| 3 — "offer once" has nothing to remember it by | **31** | Applied in `790aa8a` |
| 4 — driver and `shared.md` disagree on reaching `main` | **32** | Applied in `790aa8a` |

The note at the bottom (post-pull scripts rotting silently) became the
"maintainers of vendored copies" warning in upstream `CONTRIBUTING.md`.

**What the fixes actually changed**, since this project will feel them:

- **Item 29** — build step 4 is now conditional. A contract that records *no
  API* means there is nothing to mock: the data seam is the repository or
  storage interface the architecture names, and the local implementation is the
  real one. `frontend/rules/frontend.md` gained a **No-API projects** section
  saying the same. This is the one that was going to cost Mizaniya a whole
  invented `services/` layer.
- **Item 30** — build step 2 gained **option F, "the design already exists"**,
  which reads the design first and treats it as authoritative on layout.
  Choply hit this independently, so two of three projects did.
- **Item 31** — `.peer-ai-state.json` gained a `pdfExportOffered` field and the
  rule is now *once per phase*. **This project's state file predates the field;
  add it on the next state update.**
- **Item 32** — the workflow driver's §0 gained a **Merge policy** setting
  (`PR only` / `local merge`), §2 branches on it, and the gate table gained
  **Pull request** and **CI green** rows. `shared.md`'s Git conventions point
  at it. Mizaniya had already patched its own driver by hand on 9 Sep; **the
  upstream fix supersedes that patch** — take the upstream wording when pulling
  so the local edit stops diverging.

---

## Open

### 5. A vendored copy cannot tell anyone it is stale — *(feature)*

**Where:** the vendoring model itself, and `CONTRIBUTING.md` § "Sending feedback
back from a project", which now covers the route *out* but not the route *in*.

**Problem:** Peer AI is copied into a project, not linked. That is the right
call — a live link makes every project-specific edit a merge problem — but it
means the copy has **no remote, no branch, and nothing that goes stale
visibly**. Nobody is told. Nobody can be.

This project proved it. Items 29–32 were fixed upstream on 11 September; this
copy carried the defects for two days afterwards, hand-working around two of
them, and only found out because a human happened to mention a commit. One of
the four — item 29 — was about to cost an invented `services/` layer in BUILD.

Note the shape of the failure: **not a defect, an absence.** Nothing was wrong;
nothing said anything. The same blindness applies to every vendored copy on
every project, and it gets worse the longer a project runs, which is exactly
when the copy matters most.

**Fix — ship a staleness check, and a pin for it to check against.**

Two small pieces, both in the template so every project gets them at setup:

1. **`peer-ai/.upstream`** — a four-line JSON file recording the repo, ref and
   **commit this copy was taken from**, written at setup and updated with every
   pull. Without a pin there is nothing to compare against, which is why no
   check exists today.
2. **`peer-ai/check-upstream.mjs`** — asks GitHub's compare API how far the pin
   is behind the ref. No credentials (the repo is public) and no git history for
   the copy (it has none by design).

The part that makes it act-on-able rather than noise: it reads
`.peer-ai-state.json`, works out the **active phase file**, and says which of
the changed files *that phase is about to read*. "Twelve files changed" is a
number nobody acts on. "Three of them are files your next phase follows" is a
reason to stop.

It exits **1** when behind and **0** when current — and **0 when it cannot
reach GitHub**, printing `COULD NOT CHECK` loudly. Being offline is not the same
as being up to date, and a check that blocks offline work gets deleted rather
than fixed.

A working implementation is in this repo at `peer-ai/check-upstream.mjs` and
`peer-ai/.upstream`; it is generic and can be taken as-is. Suggested
`CONTRIBUTING.md` addition: a **"Staying current"** section facing the
feedback-out section, saying run it at every phase boundary, and pull before a
phase whose file changed.

**Project shape:** any vendored copy, any stack. The longer the project, the
worse it gets.

---

*Nothing else open. New framework defects go here, then upstream — an
[issue](https://github.com/AbuMahir980/peer-ai/issues/new?template=framework-defect.yml)
for one, a pull request against `docs/peer-ai-feedback.md` for a batch. Upstream
now ships the route: see "Sending feedback back from a project" in
`peer-ai/CONTRIBUTING.md`.*

---

## The original write-ups

### 1. Build step 4 cannot be followed on a project with no server — *(fix)*

**Where:** `frontend/03-build.md`, step 4 "Mock data layer". Also
`frontend/rules/frontend.md`, "API integration" (*"Build with mock data first,
swap for real API later"*) and the whole "Simulation mode" section.

**Problem:** step 4 is unconditional — *"For **every endpoint** described in
`docs/04-api-contract.md`, add **mock functions** … Wire **`VITE_USE_MOCK_DATA`**
… so services switch between mock and real."* But Peer AI explicitly supports
projects that have no API: `shared/04-spec-api-contract.md` allows the contract
to record *"an explicit note that this version has none"*, and the README
describes that case. A local-first app has no endpoints to mock and no real API
to swap to. An agent following the file literally invents a `services/` layer
and a mock toggle that the architecture forbids, then spends the rest of the
build reconciling two data seams.

**Fix:** make step 4 conditional. Something like: *"If the contract defines HTTP
endpoints, build the mock layer below. If it records that this version has no
API, the data seam is the repository or storage interface named in the
architecture — there is nothing to mock, and the local implementation is the
real one. Skip to step 5."* Add the same conditional to the two spots in
`frontend/rules/frontend.md`.

### 2. Build step 2 has no branch for "the design already exists" — *(fix)*

**Where:** `frontend/03-build.md`, step 2 "Design mockups (before writing code)".

**Problem:** the five options are A–D (*create* mockups in Figma / Penpot /
Paper / another tool) and E (*"Skip — build directly in code … Fastest path"*).
There is no option for a project whose design system and screen designs already
exist and are authoritative — produced earlier, by a designer, or outside the
session. Such a project must answer E, whose wording tells the agent the
opposite of the truth: it implies no design exists and invites improvisation,
when in fact the design is fixed and must be implemented exactly. The
design-quality pass in step 9 then has nothing to check against.

**Fix:** add **option F — "The design already exists"**: ask where it lives
(a tokens file, a folder of exports, a link), read it before any UI code, treat
it as authoritative on layout, spacing, type and colour, and point step 9's
design-quality pass at it rather than at generic heuristics.

### 3. "Offer once" for the PDF export has nothing to remember it by — *(minor)*

**Where:** `shared/rules/shared.md`, "PDF-ready doc export": *"When any markdown
file is saved to `docs/`, offer once."* Reinforced by
`shared/rules/docs-pdf-export.md`, "When to trigger".

**Problem:** "once" has no scope and no storage. `.peer-ai-state.json` has no
field recording that the offer was made, so across sessions an agent either
re-offers on every document — the workflow produces a dozen — or drops it
silently after the first. Both are wrong, and neither is detectable.

**Fix:** either add a `pdfExportOffered` boolean to the state file schema in
`templates/.peer-ai-state.json` and have the rule check it, or reword to a scope
that needs no memory: *"offer once per phase, when the phase's documents are
saved."*

### 4. The workflow driver and `shared.md` disagree about how work reaches `main` — *(fix)*

**Where:** `shared/rules/workflow-driver.md` §2 ("After code, before saying
'done'") and the §5 gate table, against `shared/rules/shared.md` "Git and PR
conventions" and `shared/09-pr-automation.md`.

**Problem:** the driver — the always-on file that governs every ticket in Build
— says *"Merge ticket branch into milestone branch, then push the milestone
branch"*, and its gate table has rows for pushing branches but none for opening
a pull request. Meanwhile `shared.md` states *"One peer review required before
merge; squash and merge preferred"*, and `09-pr-automation.md` sets up branch
protection requiring *"a pull request before merging"*. An agent following the
driver literally merges every ticket locally and never opens a PR, so the peer
review `shared.md` requires never happens.

Worse, the ordering guarantees it. PR automation is **phase 11b** — after Build,
Review, Test and Document. By the time CI and branch protection exist, the
entire build has already been merged without them, and on a repo that *does*
have branch protection from day one the driver's step simply fails.

**Fix:** give §0 a **Merge policy** setting, the way it already has variants for
`Remote: none` and `Issue tracker: none` — `PR only` versus `local merge` — and
branch §2 and the gate table on it. Add `Pull request` and `CI green` rows to
the gates. Separately, consider whether `09-pr-automation.md` belongs near the
start rather than at 11b: CI that arrives after the code is written cannot have
gated any of it.

---

## Notes, not defects

- **A vendored copy's post-pull scripts rot silently.** Mizaniya keeps
  `apply-phase-config.ps1` and `strip-model-switching.ps1` to re-apply its
  customisations after an upstream pull. The strip script's patterns were
  written against older upstream wording; on this pull they matched nothing,
  so the script reported "0 files cleaned" while the tiering it existed to
  remove was still in place. That is a local-tooling problem, not a Peer AI
  defect — but `CONTRIBUTING.md` could usefully warn maintainers of vendored
  copies to make such a script *fail loudly* (non-zero exit when residue
  remains) rather than report success for doing nothing.
