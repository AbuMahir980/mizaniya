# Peer AI — Agent Instructions

> ## This is Mizaniya's copy. Customise it here.
>
> peer-ai is a general-purpose framework with its own upstream repository
> (github.com/AbuMahir980/peer-ai). This is a **vendored copy**, adapted for
> Mizaniya — project models, skills named per phase, and every rules and review
> step pointed at this project's own standards.
>
> **Never push these changes upstream.** The framework stays generic so anyone
> can clone it and adapt it. Mizaniya's adaptations belong in this repo and
> nowhere else. What *does* travel upstream is a defect in the framework itself
> — record those in `docs/peer-ai-feedback.md` at the project root and fold them
> back by hand, as `CONTRIBUTING.md` describes.
>
> **Pulling an upstream update?** Re-run `apply-phase-config.ps1` and
> `strip-model-switching.ps1` afterwards — `phase-config.json` exists for
> exactly that. Then re-read this box, because an upstream file will have
> overwritten it.
>
> **The standards are not in here.** The rulebook is `docs/standards/` at the
> project root: `frontend-engineering-standards.md`,
> `backend-engineering-standards.md` and `standards-addendum-mizaniya.md`. That
> separation is deliberate: an upstream update must never be able to overwrite
> the rules the codebase is held to. Peer AI's own `shared/rules/*.md` files are
> the workflow layer (session continuity, design-vs-contract, driver settings);
> where they and `docs/standards/` disagree, `docs/standards/` wins.
>
> **Repo rules bind every phase.** They are written verbatim in `CONTEXT.md`
> during SETUP: PolyForm Noncommercial licence and no secrets in the repo; no
> real financial figures anywhere (only `docs/seed-data.md`); no employer,
> client or third-party project names; README leads with the problem and the
> screenshots; commit messages carry no AI attribution lines.

This file is the **agent-agnostic entry point** for the Peer AI development workflow. Most coding agents (Cursor, Claude Code, Codex, and others) read an `AGENTS.md` automatically. If yours reads a different file, mirror this content there (see "Tool-specific config" below).

You are an AI assistant working inside a project that uses the **Peer AI development workflow** — a structured, phase-by-phase process for building software. The full playbook lives in the `peer-ai/` folder (or this repo's root if you are inside Peer AI itself).

---

## On every session start

If `.peer-ai-state.json` and `CONTEXT.md` exist at the app root, **read both before doing anything else**:

1. `.peer-ai-state.json` — the structured pointer (current phase, step, ticket, branch).
2. `CONTEXT.md` — the narrative log (decisions, daily progress, what's next, open questions).

Then tell the user where things stand and continue from `currentStep` in the active phase file. The state file holds the data; `CONTEXT.md` holds the story. See `peer-ai/shared/workflow-state.md`.

If those files do **not** exist yet, this is a fresh project — run the setup phase: `Follow peer-ai/shared/00-setup.md`.

---

## The workflow

Each phase is a markdown file you read and follow step by step. When the user says "Follow peer-ai/...", read that file and execute it conversationally — ask questions, wait for answers, don't dump everything at once.

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

Agent prompts (code review, contract check, security audit, QA) are in `peer-ai/agents/`.

---

## Models and skills for this project

**Models: Opus for build. Fable for everything else.** Each phase file states
which. If Fable is not offered in the session's model picker, use the most
capable model available and do not downgrade mid-phase. This replaces
peer-ai's upstream cost-tiering, which asked the reader to switch to a cheaper,
weaker model at nearly every phase — including code review, on an app that
handles the user's money.

**Skills are named in each phase file.** Invoke them *inside* the phase, to
deepen the single artefact it produces — never as a parallel process, which
yields two documents that disagree and leaves nobody sure which is authoritative.

> **⚠️ Check a skill exists before relying on it.** At the start of each
> phase that names one, type `/` and look at what the session actually offers.
> Either use the skill, or do the phase's work directly from its file. **A
> missing skill must be reported, never silently skipped**, because "the skill
> covered it" is exactly the assumption that leaves a review half-done and
> everyone believing it was thorough.
>
> ### Where these skills actually live — checked 9 September 2026
>
> They are first-party **`@inline`** plugins attached to the **account**. They
> are not marketplace installs, and there is nothing in this repo or on this
> machine to install. The evidence, all re-checkable:
>
> - `~/.claude.json` → `pluginUsage` lists `engineering@inline`,
>   `design@inline`, `product-management@inline` (and 15 more bundles).
> - `~/.claude.json` → `skillUsage` records real prior use of
>   `engineering:architecture`, `engineering:system-design`,
>   `engineering:code-review` and `product-management:write-spec`.
> - `~/.claude/plugins/plugin-catalog-cache.json` holds **292** marketplace
>   plugins and **none of these bundles appear in it**.
> - `~/.claude/plugins/repos/` does not exist — no marketplace was ever added,
>   and none is needed.
>
> ### Consequence: the client decides, not a setting
>
> The **Claude Code desktop app** surfaces these skills. The **VS Code
> extension** (v2.1.266, 9 Sep 2026) did not. Since the bundles are absent from
> the catalogue, **`/plugin` cannot fetch them** and no local setting turns them
> on. If a phase reports its skills missing, the session is in the wrong client
> — it is not missing a plugin. **Run every skill-naming phase in the app.**
>
> Phases naming skills: Architect, System Spec, Shared Rules, Page Specs,
> Frontend Rules, Issues, Review, Test, Document. Setup and Understand name
> none and run anywhere.
>
> ### Correction to the record
>
> An earlier check in this repo reported all ten skills as "not installed",
> having looked only in `~/.claude/plugins/repos/`. That was wrong: the skills
> were installed and in use on this account; the session simply could not see
> them. Absence from `repos/` proves nothing about `@inline` bundles.
>
> Claude Code's own `/code-review` is built in. Do not assume any other slash
> command exists without checking the session.

| Phase | Skills |
|-------|--------|
| 0 · Setup | *none* — `CLAUDE.md` points at `docs/standards/` and `docs/product-brief.md` by path |
| 1 · Understand | *none* — `docs/product-brief.md` and `docs/seed-data.md` **are** the requirements source |
| 2 · Architect | `engineering:architecture`, `engineering:system-design` |
| 3 · System Spec | `product-management:write-spec` |
| 4 · API Contract | *none* — the `Repository` interface and the export/import schema in `core/` are the contract; derive the document from the types, never hand-write it twice |
| 5 · Shared Rules | `design:design-system` — and **index** `docs/standards/`, don't compete with it |
| 6 · Page Specs | `design:accessibility-review`, `design:ux-copy` — the designs are produced *from* these specs at the design stop |
| 6 · Frontend Rules | `design:design-system`, `design:accessibility-review` |
| 6 · Backend track | *dormant until v3* (separate private repo) |
| 7 · Issues | `engineering:tech-debt` |
| 8 · Build | *none* — implementation, in learning mode (see `CONTEXT.md`) |
| 9 · Review | `engineering:code-review`, plus Claude Code's `/code-review` — against every `review` rule in `docs/standards/` and the repo rules in `CONTEXT.md` |
| 10 · Test | `engineering:testing-strategy` — the addendum's core journey (K1) is the acceptance test |
| 11 · Document | `engineering:documentation` |

### What this project already has — do not reinvent it

- **The brief exists.** `docs/product-brief.md`. Understand it; do not re-derive the product.
- **The standards exist.** `docs/standards/` — frontend, backend and the addendum, each rule marked `auto` or `review`. The rules phases map them to enforcement; they do not write a second standard.
- **The seed data exists.** `docs/seed-data.md` is the only source of figures for fixtures, tests, screenshots and examples.
- **The design arrives from outside.** After PAGE SPECS, `docs/design/` (tokens.md + PNGs) is produced from the specs. SHARED RULES implements it; nothing before that invents a palette or a layout.
- **The licence exists.** `LICENSE` at the root is authoritative. Never generate, add or alter licence text.

---

## Core standards (apply in every interaction)

**The rulebook is `docs/standards/` at the project root** — it wins on any conflict.
`peer-ai/shared/rules/shared.md` and `peer-ai/frontend/rules/frontend.md` are the
workflow layer and now open with a section saying so, referencing the standards by
section number rather than copying them. Key rules:

- **Session context:** maintain `CONTEXT.md` (narrative) and `.peer-ai-state.json` (pointer). The `notes` field is a one-liner pointer only — narrative belongs in `CONTEXT.md`.
- **Design vs data contract:** when a mockup and an API contract disagree, the contract wins on data shape and field names; the design wins on layout and visual hierarchy. See `peer-ai/shared/design-data-contract.md`.
- **Type safety, naming, security, error handling, dependencies** — `docs/standards/` at the project root is authoritative; the shared rules file covers only what it does not.
- **Models** — Opus for build, Fable for everything else. Each phase states which on its `> **Model:` line. Never downgrade mid-phase, and never ask the user to switch models to save cost. There is no tier table and no model-switch gate.

---

## Tool-specific config

The workflow is agent-agnostic, but each AI tool has its own place for "always-on" rules. **When setting up a project (phase 0), detect or ask which tool the user runs, then create the matching config** so the standards load automatically:

| Tool | Config location | What to create |
|------|-----------------|----------------|
| **Cursor** | `.cursor/rules/` (rename copies to `.mdc`) | Copy `shared.md`, `workflow-driver.md`, and the track rule (`frontend.md` / `backend.md`) into `.cursor/rules/`, renaming each to `.mdc` so Cursor auto-loads them |
| **Claude Code** | `CLAUDE.md` at repo root | A `CLAUDE.md` summarizing the standards + pointing to `peer-ai/`, with the body of `shared/rules/workflow-driver.md` appended and its Project settings filled in |
| **Codex / others** | `AGENTS.md` at repo root | An `AGENTS.md` like this one, scoped to the project, with the body of `shared/rules/workflow-driver.md` appended and its Project settings filled in |
| **Anything else** | the tool's rules/memory file | Same content, including the workflow driver, adapted to the tool's format |

Always create the one that fits the user's tool — don't assume Cursor. The source content is identical; only the filename/format changes.

---

## Without an AI tool

Every workflow file describes a sound process a human can follow manually. The AI just makes it faster.
