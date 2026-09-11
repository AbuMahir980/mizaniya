# Peer AI — feedback from the Mizaniya build

Defects in the **framework itself**, found while building Mizaniya on a vendored
copy of Peer AI. These travel back to the public repo
(github.com/AbuMahir980/peer-ai) by hand, as `peer-ai/CONTRIBUTING.md` describes.

**This file is only for framework defects.** Mizaniya's own customisations —
models, skills, the standards wiring — live in `peer-ai/phase-config.json` and
the vendored files, and must never be pushed upstream. The test for an entry
here is: *would this bite anyone who cloned Peer AI, on any project?*

---

## Open

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
