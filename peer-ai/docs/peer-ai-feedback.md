# Peer AI — Feedback from a Real Run

Maintainer's fix list for the upstream Peer AI playbook, collected while running it end to end on this project with Claude Code.

| Field | Value |
|-------|-------|
| **Playbook version observed** | commit `33051c5` ("fix: full agent-agnostic audit pass …") |
| **Phases run** | 00 Setup, 01 Understand, 02 Architect, 03 System Spec, 04 API Contract |
| **Tool** | Claude Code (desktop app), single model for the whole run |
| **Date** | 2026-09-07 |

Items are grouped by the file they concern. Each has the observed problem, where it is, and a suggested fix. Severity is a judgement call: **fix** means a user will hit it, **polish** means cosmetic or consistency.

**Status (2026-09-07):** all twenty items are applied in this repo. Item 5 collapsed setup into one question round; item 18 made every model-switch gate conditional on a **Model selector** setting the workflow driver now carries; item 20 moved the PDF offer into `shared/rules/shared.md` with phases pointing there.

---

## `README.md`

1. **Nested `.git` is only handled in the README.** *(fix)*
   **Where:** Quick start step 1 says `rm -rf peer-ai/.git`.
   **Problem:** Nothing downstream checks that this happened. If a user skips it, `git add` records `peer-ai/` as an empty gitlink and the playbook never lands in the project repo. See the matching item under `shared/00-setup.md`.
   **Fix:** Keep the README instruction and add the check to setup step 1.

2. **"After setup" tree shows `docs/`, which setup never creates.** *(polish)*
   **Where:** Quick start step 3 tree.
   **Fix:** Either create `docs/` in setup (a natural home for the stakeholder brief) or label it "created by phase 1".

---

## `shared/00-setup.md`

3. **Step 1 does not check for a nested `peer-ai/.git`.** *(fix)*
   **Where:** "1. Confirm the workflow location".
   **Fix:** Add: "If `peer-ai/.git` exists, delete it so the playbook is committed as plain files."

4. **The workflow driver is copied for Cursor only.** *(fix)*
   **Where:** Step 2, options A–D. Option A lists `workflow-driver.md` explicitly. Options B (Claude Code) and C (Codex) say only "summarizing the standards + pointing to `peer-ai/`".
   **Problem:** `shared/rules/workflow-driver.md` says its content is "appended to `CLAUDE.md` for Claude Code, or into `AGENTS.md` for Codex/others", so the two files disagree. A Claude Code or Codex user following setup literally ends up without the ambient driver, which is the README's headline feature.
   **Fix:** In options B, C, and D, say explicitly: append the contents of `shared/rules/workflow-driver.md` (with placeholders filled) to the config file.

5. **Seven "wait for the user" gates for a scaffolding phase.** *(polish)*
   **Where:** Model switch, step 1, step 2 (twice), step 3, step 4, step 5, journal.
   **Problem:** The phase describes itself as "mostly file scaffolding", yet it has more gates than any spec phase. The first gate asks the user to switch models, which the agent cannot verify.
   **Fix:** Collapse steps 1–3 into one question round (tool, project name, tracker, starting point). Make the model-switch gate a one-time notice, or conditional on tools that have a model selector.

---

## `shared/rules/workflow-driver.md`

6. **Placeholders are described but not marked.** *(fix)*
   **Where:** Intro paragraph: "Customize the placeholders for your project: verify command, issue tracker name, design guide path, and branch naming conventions."
   **Problem:** The body has no visible markers. It hardcodes `git push -u origin`, `npm run verify`, "move ticket Backlog → In Progress", "post a project-level update", and `docs/mockup/`. A first-time user cannot tell which lines are examples.
   **Fix:** Wrap each customizable value in `[PLACEHOLDER: …]` like the templates do, and add a "no remote" and "no issue tracker" variant for solo projects, since every push and tracker step is mandatory as written.

7. **Destination for Claude Code and Codex contradicts `00-setup.md`.** *(fix)*
   See item 4. Whichever file is right, make the other match.

---

## `shared/workflow-state.md` and `templates/.peer-ai-state.json`

8. **`ticketsCancelled` is in the template but not in the field reference.** *(polish)*
   **Where:** Template has `"ticketsCancelled": []`; the "Field reference" table in `workflow-state.md` does not list it.
   **Fix:** Add the row.

9. **No canonical list of `currentPhase` values.** *(fix)*
   **Where:** Field reference says "Active phase name (`understand`, `build`, `review`, `test`, `document`, etc.)".
   **Problem:** The spec phases have no defined names. This run had to invent `architect`, `spec-system`, `spec-api-contract`, and `rules-shared`. Two sessions, or two tools, could name the same phase differently and the driver has nothing to match against.
   **Fix:** Publish an enum, one value per phase file, in `workflow-state.md` and mirror it as a comment in the template. Suggested: `setup`, `understand`, `architect`, `spec-system`, `spec-api-contract`, `rules-shared`, `spec-pages` / `spec-endpoints`, `rules-track`, `issues`, `build`, `review`, `test`, `document`, `pr-automation`, `done`.

---

## `shared/01-understand.md` and `shared/templates/requirements-summary-template.md`

10. **Dependency table columns differ between the phase and its template.** *(polish)*
    **Where:** Step 4 asks for **Dependency | Owner | What's needed | Status**. The template's "Stakeholders & Dependencies" table has **Name | Role | Dependency | Status**.
    **Fix:** Pick one. The phase's columns answer the question the step asks ("things you'll need from other people").

11. **Step 1 assumes the inputs are not yet in the chat.** *(polish)*
    **Where:** "Before we start, share everything you've got…" with a hard wait.
    **Problem:** When the user has already pasted the brief (the common case when invoking the phase), the gate asks for what it already has.
    **Fix:** "If the user has already shared the assignment, confirm it is complete and move on."

---

## `shared/02-architect.md` and `shared/templates/architecture-decision-record.md`

12. **Two ADR formats, no guidance on which to use.** *(polish)*
    **Where:** Step 8 asks for mini ADRs (Decision, Context, Consequences, 2–4 sentences each) inline in `docs/02-architecture.md`. The templates folder ships a one-file-per-decision ADR template with Status, Deciders, Alternatives, Related ADRs. Neither file mentions the other.
    **Fix:** In step 8, say: "Use the mini format inline; promote a decision to its own file from `templates/architecture-decision-record.md` when it needs alternatives or a status lifecycle."

---

## `shared/03-spec-system.md` and `shared/templates/pm-spec-template.md`

13. **Roles table columns differ between the phase and its template.** *(polish)*
    **Where:** Step 3 asks for **Role | Description | Can see / do | Cannot see / do**. The template has **Role | Description | Access Level | Key Actions**.
    **Fix:** Align them. "Cannot see / do" is the more useful column for permission review; the template should adopt it.

---

## `shared/04-spec-api-contract.md` and `shared/templates/api-contract-template.md`

14. **Domain leftovers from a specific project.** *(fix)*
    **Where:** Template example endpoints are battery telemetry (`/fleet/status`, `/devices/{deviceId}/commands`, `/reports/energy`) with fields `SNR`, `soc_user`, `Wh_inv_total`, `LED`. The template header comment and the phase's step 8 "Suggested endpoint priority order" hardcode Auth → Customers → Support cases → Notes → Remote actions. Step 2 examples mention IoT and Shopify.
    **Problem:** The playbook is presented as generic. These read as one company's leftovers and, worse, the examples use snake_case keys while the phase's step 3 recommends camelCase, so the template contradicts the conventions section on the same page.
    **Fix:** Replace the examples with a neutral domain (a to-do list or this project's expenses would do), make the priority order a template with placeholders, and use camelCase in every example.

15. **Step 4 assumes authentication exists.** *(fix)*
    **Where:** "Define the authentication flow" walks through login, refresh, and redirect with a hard wait.
    **Problem:** Local-first, single-device, or internal-tool v1s often have no auth. The step has no "none in this version, reserve for later" branch.
    **Fix:** Start the step with "If this version has no auth, record that and what is reserved for later, then skip to step 5."

16. **Template envelope and phase envelope differ slightly.** *(polish)*
    **Where:** Phase step 3 success envelope is `{ success, data, message, timestamp }`. The template's `/fleet/status` example adds top-level `pagination` and `count` beside `data`.
    **Fix:** Show pagination inside `data` or state explicitly that it sits beside it. Either is fine; the two files should agree.

---

## `shared/design-data-contract.md`

17. **Refers to a `FINDINGS.md` that no phase creates.** *(fix)*
    **Where:** "During build, record discrepancies in your project's findings log (e.g. `FINDINGS.md`)". A search of the playbook finds no other mention.
    **Fix:** Either have `frontend/03-build.md` and `backend/03-build.md` create and reference the findings log, or point this sentence at `CONTEXT.md` "Open Questions" or the issue plan instead.

---

## Cross-cutting: every phase file

18. **Model-switch gates are heavy for single-model tools.** *(polish)*
    **Where:** Every phase opens with "switch to your [tier] model … wait for the user to confirm", and every doc-producing phase closes with a PDF offer that asks for a switch to the fastest model and back. `shared/rules/shared.md` makes the wait mandatory ("Do NOT proceed until the user confirms the switch").
    **Problem:** Across the five phases run here that is eleven model prompts. In Claude Code, Codex, and most chat tools the model is fixed for the session or chosen outside the conversation, so the gate can only ever be answered "yes".
    **Fix:** Ask once in setup which tool is in use and whether it has a per-phase model selector. If not, phases print the recommendation as a one-line note without a gate.

19. **Curly quotes in the journal section of 16 phase files.** *(polish)*
    **Where:** `“Before we move on, I can capture…”` and `**Wait for the user’s input.**` in `shared/01`–`07`, `frontend/01`, `03`–`05`, `backend/01`–`05`. Everything else in the repo uses straight quotes.
    **Fix:** Normalise to straight quotes. A `grep -rl "’\|“\|”" peer-ai` finds them.

20. **The "PDF-ready export" offer repeats verbatim in every phase.** *(polish)*
    **Where:** Understand, Architect, System Spec, API Contract, and the shared rules all carry the same three-sentence offer plus a model-switch gate.
    **Fix:** Keep it in `shared/rules/shared.md` only, and have phases say "offer the PDF export per the shared rules" in one line.

---

## Things that worked well

Recorded so fixes do not regress them.

- The **state file plus `CONTEXT.md` split** did its job. Every phase handoff was one JSON rewrite and a few narrative edits, and the "notes is a pointer, not a story" rule kept the state file readable.
- **Phase-gated documents** forced decisions in the right order. The currency picker request arrived mid-System-Spec and the trail (requirements → architecture → spec → contract) made it a set of tracked supersessions rather than a silent rewrite.
- The **contract phase's "who are you" step** adapted cleanly to a frontend-only v1 once the auth step was skipped.
- **Templates** gave every document a consistent header and made the outputs screenshot-ready without extra formatting.
