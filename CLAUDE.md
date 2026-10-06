# CLAUDE.md — Mizaniya

Mizaniya is a household money app for salary-cycle budgeting, debts in both
directions, and a sinking fund for annual rent. **v1 is a hosted, multi-user
webapp with a server** — accounts, sync, tiers and a landing page — with the
local store kept as the offline path. It is built in the open with **Peer AI**:
its settings are in `peer-ai.config.json`, and its instructions are in the
marked block at the end of this file.

> *Corrected 28 September: this paragraph opened with "a local-first household
> money app" for four days after [ADR-009](docs/adr/ADR-009-repositioning-v1-hosted-webapp.md)
> repositioned the product. It is the first sentence every session reads.*

---

## 1. On every session start

Start with Peer AI's `next_work`, as the block below says. Then read
`CONTEXT.md` — the narrative log: repo rules, decisions, daily progress, what's
next, open questions and the code-review checklist. **Tell the user where things
stand**, from its Current State and What's Next, before doing anything else.

Peer AI's work items hold the work and where it stopped; `CONTEXT.md` holds the
story. Read both.

---

## 2. The rulebook is `docs/standards/` — it wins on any conflict

| Document | Covers |
|---|---|
| `docs/standards/frontend-engineering-standards.md` | Sections **A–O**: architecture, state, prop drilling, components, DRY, styling and design system, types, money, safety-critical data, accessibility, testing, errors/loading/offline, data safety, dependencies, naming |
| `docs/standards/backend-engineering-standards.md` | Server-side equivalents. Not in use until the server's code starts |
| `docs/standards/standards-addendum-mizaniya.md` | Every value the standards leave to the project: kobo as the minor unit, what the danger colour means, the core journey K1, storage per version, seed data, telemetry |

**Reference rules by section number. Never copy their text into another file** —
a copy guarantees drift, and then nobody knows which is current.

Every rule there is marked `auto` (a linter, the compiler or CI fails the build)
or `review` (a human has to look). `docs/05-coding-standards.md` maps each `auto`
rule to its enforcement; every `review` rule is the code-review checklist in
`CONTEXT.md`.

Peer AI's own rules, which `standards_for_file` returns before each edit, apply
beside them, and `standards_for_file` serves these documents too. **Where the two
disagree, `docs/standards/` wins**: follow it, and record the disagreement in
`CONTEXT.md`'s Open Questions.

---

## 3. Repo rules bind every piece of work

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


## 5. How work reaches `main`

**Every piece of work goes on a branch and reaches `main` only through a pull
request with every check green. Squash and merge. Delete the branch after.**
Nothing is committed to `main` directly: not a document, not a fix, not a
one-line typo.

- **Branches:** `feature/<short-description>` for build work, `peer-ai/<topic>`
  for documents. Never `main`. Push a branch as soon as it has a commit: the repo
  is built in the open and the remote is the only backup.
- **Commit messages and PR titles:** conventional commits — `feat:`, `fix:`,
  `chore:`, `docs:`, `test:`, `refactor:` — one line, plus an optional short body.
- **PR descriptions** say what changed and why. **No AI attribution lines, no
  emoji, no tool names**, in commit messages either.
- **Checks:** `pr-checks.yml` runs **verify** (`npm run verify`), **repo rules**
  and **secret scanning**, and `peer-ai.yml` runs **peer-ai check**, Peer AI's
  gate. Wait for all of them. Red is not done, and **a check that was skipped or
  cancelled has not passed.** Branch protection is not on, so nothing stops a red
  merge but you.
- **One peer review before merge**, on the pull request.
- **Squash and merge**, then delete the branch locally and on `origin`.
- **Never `git add -A`.** The designer writes into this worktree, and `git add -A`
  has swept a whole drop into a feature commit twice. Stage by path.
  `scripts/check-design-drop.mjs` fails CI on it.

**Merging a stack is not the same as merging a branch.** When pull requests are
stacked, each based on the one beneath it, three things change, and getting them
wrong costs an afternoon:

- **Merge with a merge commit, not a squash.** Squashing rewrites the commits
  beneath, so the next PR up re-applies the same changes against a `main` that
  already has them, and conflicts on every shared file.
- **Retarget each PR to `main` as the one below it merges.** GitHub does not
  reliably do this for you; set `--base main` explicitly before merging.
- **Delete branches only once the whole stack has landed.** Deleting a branch
  that another PR is *based on* **closes that PR**, and GitHub then refuses to
  reopen it because its base no longer exists.

---

## 6. The issue tracker

GitHub Issues on `AbuMahir980/mizaniya`, with issues as `#N`. **No project board
and no milestones** — deliberate, see `CONTEXT.md` Key Decisions. Status is
carried by labels: Backlog is an open issue with no status label, In Progress adds
`status:in-progress`, Done is closed as Completed with that label removed.
`cycle-1/2/3` are the cycles.

When a piece of work is done:

1. Tick the acceptance criteria, and **close the issue as Completed**.
2. **Remove `status:in-progress`.** Closing does not remove it, and a finished
   ticket still labelled in progress is a lie the tracker tells confidently.
3. Add a **completion comment**: 3–5 bullets on what shipped, deviations and
   follow-ups.
4. Write the dated entry in `CONTEXT.md`, which carries the reasoning a one-line
   status never could.

---

## 7. The design

The design comes from the designer, in `docs/design/`. **`tokens.md` is
authoritative for values; the PNG is what you build from.**

1. **Open the PNG first** — `docs/design/<n>-<screen>-360-light.png`, then
   `-dark`, then `-1440-light` — and **describe the screen before writing
   anything.** Every screen rebuilt in this project was first built from fragments
   grepped out of `canvas/*.dc.html`, and every one of them invented layout, copy
   or an interaction model the design had already settled.
2. **Then read `canvas/*.dc.html` as a tree**, for exact values — sizes, tones,
   radii, spacing. Grepping it returns a class, not a screen.
3. **`tokens.md` is authoritative for the scale**; `brand/README.md` owns the
   wordmark and the app icon, which are not type or radius steps.
4. **Invent nothing.** Where the design does not answer something, ask in
   `docs/open-items.md`, a new lettered section per round. The designer answers in
   place and marks the heading `answered <date>`. The questions belong next to the
   answers, not in a message.
5. **The canvas is re-cut often.** Re-pull before each screen.

The design is authoritative on layout, spacing, type and colour; the page spec is
authoritative on behaviour, states and data. When they conflict, **name it, log
it, never pick a side quietly.**

**After each screen works, compare it with the design**: open the PNG at 360 and
1440, light and dark. A list of ticked behaviours is not this pass. An agent that
cannot see a browser says so and asks the owner to look.

---

## 8. Before saying anything is done

- **Tests alongside the code**, not after: co-located, not batched, not deferred.
- **Figures only from `docs/seed-data.md`.**
- **Verify** with Peer AI's `run_verify`, which runs `npm run verify`. Red is not
  done.
- **At the end of a session, or at about 80% context:** add a dated entry to
  `CONTEXT.md` under What Was Done — By Day, refresh Current State, What's Next
  and Open Questions, and record where the work item stopped with
  `update_work_item`.

---

## 9. What this project already has — do not reinvent it

- **The brief exists** — `docs/product-brief.md`. Understand it; do not re-derive the product.
- **The standards exist** — `docs/standards/`. Map them to enforcement; do not write a second standard.
- **The seed data exists** — `docs/seed-data.md`, the only source of figures.
- **The design exists** — `docs/design/`, from the designer.
- **The decisions exist** — `docs/adr/`, one per decision. ADR-009 made v1 a hosted webapp, and ADR-012, which chose the server's stack, is parked: reopen it before any server work.
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

- For `peer-ai-requirements-analysis`: `docs/product-brief.md` is the requirements source and `docs/seed-data.md` holds the only figures you may use. Read both before asking anything; arrive with a draft understanding to correct, not a blank page. The stakeholder is the user — ask about how the spreadsheet is actually used, not what sounds impressive.
- `peer-ai-product-spec`: also use `design:accessibility-review` and `design:ux-copy`.
- For `peer-ai-product-spec`: The design exists, in `docs/design/`, and the specs follow it: where a spec and the design disagree, name it and ask in `docs/open-items.md`. Each spec gives every state (loading, empty, error, offline, success), every number shown and where it comes from in `core/`, the primary action, and what the danger colour means on that screen (addendum: money going wrong, nothing else).
- For `peer-ai-product-spec`: `design:ux-copy`: the words on the screen, in British English, in the user's vocabulary (frontend O4). `design:accessibility-review`: target sizes, contrast, motion, screen-reader paths (frontend J).
- `peer-ai-architecture`: also use `engineering:architecture` and `engineering:system-design`.
- For `peer-ai-architecture`: The decisions are the ADRs in `docs/adr/`, one per decision: read them before proposing a change, and write a new one rather than editing an old one. ADR-009 made v1 a hosted webapp with a server, with the local store kept as the offline path. ADR-012, which chose the server's stack, is parked: reopen it before any server work.
- `peer-ai-system-design`: also use `product-management:write-spec`.
- For `peer-ai-system-design`: Every user story names its states (loading, empty, error, offline, success) and the exact numbers the screen shows. Money is always `{ amount, type }` in kobo (frontend H1, H5).
- For `peer-ai-api-design`: The `Repository` interface and the JSON export/import schema in `core/` are contracts too. Write each once, as TypeScript types plus a runtime schema, and derive the documents from them — never hand-write the same shape twice (frontend G2, G4). The server's endpoints are specified in `docs/09-endpoint-specs.md`.
- `peer-ai-issue-planning`: also use `engineering:tech-debt`.
- For `peer-ai-issue-planning`: Anything not in `docs/product-brief.md` goes to `docs/backlog.md`, not into an issue for this build.
- For `peer-ai-implement-ticket`: Learning mode was replaced on 2026-09-24 — see `CLAUDE.md` §4. There is no three-line file header and no `docs/concepts/`. Explanation lives in `docs/engineering-notes/`, one note per topic, written when the topic is built or deliberately deferred. Build order and one commit per item are in `CONTEXT.md`.
- `peer-ai-code-review`: also use `engineering:code-review`.
- For `peer-ai-code-review`: Review against, in this order: `docs/standards/frontend-engineering-standards.md` — every `review` rule is the checklist, and the `auto` rules should already be green in CI, so a red one is a CI defect too; `docs/standards/standards-addendum-mizaniya.md` — kobo, what the danger colour means, the core journey; the repo rules in `CONTEXT.md` — no real figures, no employer or client names, no secrets.
- For `peer-ai-code-review`: Count, don't judge: C1 (a prop passes through at most 2 components), D1 (at most 150 lines), D2 (at most 7 props), E1/E2 (the third duplicate extracts; money and validation extract on the first repeat), H3 (no money arithmetic in a component).
- For `peer-ai-code-review`: One finding = one location + one fix. Correctness before style. Findings go to the user as a table before anything is changed.
- For `peer-ai-code-review`: Claude Code's `/code-review` reads the real diff, so prefer it over pasting code into a prompt.
- For `peer-ai-security-review`: **On this project, also work through:** secrets (none in the repo, `.env` ignored, secret scanning in CI); dependency audit against the pinned lockfile; input validation at every boundary with a schema (frontend G4) — imports especially, since an export file is untrusted input; the user's financial data at rest in IndexedDB (what a shared device or a browser extension can read; what the export contains; no telemetry per M2); and that no screenshot, fixture or test carries real figures (M1).
- For `peer-ai-contract-check`: The contracts are the `Repository` interface and the export/import schema in `core/`, and, once the server exists, `docs/09-endpoint-specs.md`. Check the screens against them, and the generated contract doc against the source types.
- `peer-ai-test-strategy`: also use `engineering:testing-strategy`.
- For `peer-ai-test-strategy`: The core journey in `docs/standards/standards-addendum-mizaniya.md` (K1) is the acceptance test, run in Playwright. `core/` is tested exhaustively with plain values (K2), including cycle boundaries, month rollover, a debt paid early, a salary that arrives late, and export → import round-trip (M3). Test by role and label, not test id (K3).
- For `peer-ai-qa-acceptance`: **The test matrix starts from the core journey in the addendum (K1)** and from the states each page spec declares; a state the spec names but the matrix omits is a QA defect.
- `peer-ai-documentation`: also use `engineering:documentation`.
- For `peer-ai-documentation`: README order is fixed by the repo rules in `CONTEXT.md`: the problem, the screenshots, features, how it works (cycles, envelopes, debts, projected gap), running locally, roadmap, licence (one line: PolyForm Noncommercial 1.0.0, link to `LICENSE`). `docs/engineering-notes/` is part of the documentation set.

When a work item reaches one of these activities:

- During `standards`: This project already has its standards in `docs/standards/`, plus the addendum. Don't write a competing one or walk through generic defaults: map each `auto` rule to its ESLint, tsconfig or CI enforcement in `docs/05-coding-standards.md`, and each `review` rule to the checklist in `CONTEXT.md`. Delete nothing from the standards; propose changes instead.
- During `standards`: `design:design-system`: token discipline and component conventions, against `docs/design/tokens.md`.
- During `delivery-setup`: CI exists in `.github/workflows/`: extend it rather than starting over. Its target, from the original plan: install with the pinned lockfile; lint (every `auto` rule in `docs/standards/` has a lint or tsconfig backing); typecheck; unit tests for `core/` with a coverage gate on money modules (frontend H4, K2); component tests; the Playwright core journey (addendum K1); secret scanning; the contract-doc regeneration diff. Nothing merges red.

If the peer-ai tools aren't available, run `npx peer-ai doctor`.
<!-- peer-ai:end -->
