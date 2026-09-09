---
description: Shared coding standards applied to all projects
globs: **/*
alwaysApply: true
---

# Shared Standards

You are working on this project. Follow these standards in every interaction.

## The rulebook is `docs/standards/` — it wins on any conflict

`docs/standards/frontend-engineering-standards.md`,
`docs/standards/backend-engineering-standards.md` and
`docs/standards/standards-addendum-mizaniya.md` are authoritative for this
project. This file is the **workflow layer** — session continuity, git
conventions, the journal, the PDF export. Where the two disagree,
`docs/standards/` wins and this file is the one that is wrong.

Rules are referenced here **by section number, never copied in**. A copy
guarantees the two drift, and then nobody knows which is current.

- Architecture, state, components, types, money, accessibility, testing,
  errors, data safety, dependencies, naming → frontend standards **A–O**,
  plus the addendum for every value this project sets (kobo, what the danger
  colour means, the core journeys, seed data, telemetry).
- Server-side equivalents → backend standards **A–O**. Dormant until v3.
- Every rule there is marked `auto` (a linter, the compiler or CI fails the
  build) or `review` (a human has to look). The rules phases map each `auto`
  rule to its enforcement and every `review` rule onto the code-review
  checklist in `CONTEXT.md`.

## Session context (CONTEXT.md + state file)

If `.peer-ai-state.json` and `CONTEXT.md` exist at the app root, the workflow driver is active. At session start, read **both** files before doing anything else. Narrative context (decisions, emails, daily log) belongs in `CONTEXT.md`; the `notes` field in `.peer-ai-state.json` is a one-liner pointer only — see `peer-ai/shared/workflow-state.md`.

When design mockups and API contracts disagree, follow `peer-ai/shared/design-data-contract.md`: contract wins on data shape and field names; design wins on layout and visual hierarchy.

## Git and PR conventions
- **Every piece of work goes on a branch and reaches `main` only through a pull request with CI green. Squash and merge. Delete the branch after.** Nothing is committed to `main` directly — not a phase document, not a one-line typo.
- Branch names: `feature/<short-description>` for build items (e.g. `feature/quick-add-sheet`); `peer-ai/<phase>` for phase documents (e.g. `peer-ai/understand`)
- Commit messages: **conventional commits** — `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`. One line, plus an optional short body.
- Phase commits are named for the phase: `peer-ai: setup`, `peer-ai: understand`, `peer-ai: architect`, and so on.
- No AI attribution lines, no emoji, no tool names in commit messages or PR descriptions.
- PR title: the same conventional-commit subject line. The description says **what changed and why** — no AI attribution lines, no emoji, no tool names.
- PR checks before review: lint, type check, build must all pass. **Red is not done.** Until PR AUTOMATION creates `.github/workflows/`, there are no checks to be green — say so on the PR rather than implying they passed.
- One peer review required before merge; squash and merge
- Delete branches after merging, locally and on the remote
- Issue tracker auto-sync (if integrated with GitHub): branch creation → ticket In Progress; PR merged → ticket Done

## Type safety
- Use the project's type system strictly (TypeScript `strict: true`, Python type hints, Go's static types, etc.)
- No untyped escape hatches (e.g. `any` in TypeScript, `# type: ignore` in Python) without explicit justification
- Explicit types for function signatures and API responses
- Use type inference for obvious cases

## Naming
- **File and symbol naming: frontend standards O1–O4.** Files are kebab-case, components PascalCase, hooks `useThing`, booleans read as assertions, names say what they are (`amountMinor`, not `amt`) and use the user's vocabulary. O1 is `auto`. The lines below cover only what O does not.
- Variables: camelCase (JS/TS), snake_case (Python/Go/Ruby)
- Constants: SCREAMING_SNAKE_CASE
- Types/Interfaces: PascalCase
- API endpoints: kebab-case (`/task-comments`)
- Database tables: snake_case (`task_comments`)

## Security
- Never hardcode secrets, API keys, or credentials
- Always use environment variables for configuration
- Never commit `.env` files
- Maintain `.env.example` with all required variables (values blanked)
- Disable source maps in production builds

## Code comments
- Never comment what the code does -- the code shows that
- Comment WHY when the reason isn't obvious
- Comment trade-offs and constraints

## Dependencies
- Pin exact versions where the ecosystem supports it (no ^ or ~ in Node; pinned in requirements.txt, go.mod, Cargo.toml, etc.)
- Run dependency audits regularly and resolve critical/high vulnerabilities

## Error handling
- All async operations must handle errors
- User-facing errors must be safe (no stack traces, no internal details)
- Log full errors server-side for debugging

## Models

**Opus for build. Fable for everything else. Never downgrade mid-phase.**

Each phase file states its model on the `> **Model:` line. If Fable is not offered in the session's model picker, use the most capable model available. Do not ask the user to switch models to save cost, and never run a quality gate — code review, security audit, QA, contract check — on a deliberately weakened model: on an app that handles the user's money that is not a saving, it is a false reassurance.

This replaces peer-ai's upstream cost-tiering table.

## Dev journal

If a `docs/journal-config.json` file exists in the project, journaling is active. Read that file to determine the tool ("notion", "local", "other", or "none").

During any workflow phase, **recognize key decision moments** and offer to journal them. Key moments include:
- Architecture or technology choices (e.g. "chose Fastify over Express")
- Trade-offs made (e.g. "sacrificed real-time for simpler polling")
- Problems resolved (e.g. "auth refresh was failing, fixed by...")
- Spec deviations (e.g. "deviated from spec because of backend constraint")
- Dependency choices (e.g. "chose Zustand over Redux")

When you recognize one, offer briefly:
> "That was a significant decision. Want me to add a journal entry capturing the reasoning?"

**Wait for the user's input.** If yes, draft the entry using the key moment template from `peer-ai/shared/08-dev-journal.md` (Part B) and write it to the configured tool. If no, continue without interruption.

Do NOT over-trigger. One or two mid-phase entries per workflow step is enough. Save the phase summary for the handoff nudge.

## Issue tracker completion

When the AI finishes implementing a ticket (page, endpoint group, feature, or any scoped issue), it must do all three of the following before moving on:

1. **Tick acceptance criteria** — if the ticket description has checkboxes (acceptance criteria), check off every item that was completed. Use your issue tracker's MCP if available; otherwise tell the user which items to tick manually.
2. **Add a completion comment** — post a comment on the issue summarizing what was done, any deviations from the spec, and any follow-up items. Keep it concise (3–5 bullet points). Example format:
   > Completed: [short summary]
   > - Built [component/endpoint] per spec
   > - Connected to [mock/real] data
   > - Responsive/tested on [contexts]
   > - Deviation: [if any, otherwise omit]
   > - Follow-up: [if any, otherwise omit]
3. **Add a project update** — post a project-level update to the issue tracker project noting the progress. One sentence is enough, e.g. "Status page complete — all KPIs, table, and drawer working against mock data."

If the issue tracker MCP is not connected, draft all three (checkbox list, comment, project update) as text and tell the user to paste them into their issue tracker manually.

## PDF-ready doc export

When any markdown file is saved to `docs/`, offer once:

> "Want me to generate a PDF-ready HTML version in `docs-pdf/`? You can open it in a browser and print/save as PDF to share with stakeholders."

**Wait for the user's input.** If yes, generate `docs-pdf/<same-name>.html` following the styling rules in `peer-ai/shared/rules/docs-pdf-export.md` and make sure `docs-pdf/` is in `.gitignore` (generated artifacts, not source of truth). If no, move on.

This applies at every phase that produces a doc, not just the final documentation step. The phase files point here instead of repeating the offer.

## Workflow reference
This project includes the Peer AI Development Workflow in the `peer-ai/` folder. When asked about process, or when following a workflow step, read the relevant file directly:
- Requirements: `peer-ai/shared/01-understand.md`
- Architecture: `peer-ai/shared/02-architect.md`
- System spec: `peer-ai/shared/03-spec-system.md`
- API contract: `peer-ai/shared/04-spec-api-contract.md` (includes optional OpenAPI spec generation)
- Rules: `peer-ai/shared/05-rules-shared.md`
- Issues: `peer-ai/shared/06-issues.md`
- Documentation: `peer-ai/shared/07-document.md`
- PR automation: `peer-ai/shared/09-pr-automation.md` (GitHub Actions, branch protection, automated review comments)
- Dev journal: `peer-ai/shared/08-dev-journal.md`
- Frontend guides: `peer-ai/frontend/` (page specs with forms/validation, rules with testing/i18n/a11y/analytics/feature-flags/CI, build, review covering forms/i18n/analytics/flags, test covering forms/a11y/i18n)
- Backend guides: `peer-ai/backend/` (endpoint specs with jobs/cron/webhooks/files/email/caching/real-time, rules with jobs/caching/files/versioning/testing/deployment/observability, build, review covering all concerns, test covering all concerns)
- Agent prompts: `peer-ai/agents/`
- Templates: `peer-ai/shared/templates/`, `peer-ai/frontend/templates/`, `peer-ai/backend/templates/`
- Contributing guide: `peer-ai/CONTRIBUTING.md` (how to safely edit workflow files)
- Workflow state guide: `peer-ai/shared/workflow-state.md` (state file + `notes` field rules)
- Design vs contract: `peer-ai/shared/design-data-contract.md`
- Workflow driver: `peer-ai/shared/rules/workflow-driver.md` (ambient driver — copy to your tool's rules config during setup)

When a user says "follow peer-ai/...", READ that file and follow its instructions step by step.

## Monorepo structure (if applicable)
If the project uses a monorepo with `apps/` and `packages/`:
- Each app deploys independently
- npm workspaces at the root links apps together
- Shared code lives in `packages/` (shared types, UI components, config)
- All apps share the same rules config (`.cursor/rules/` for Cursor, `CLAUDE.md` for Claude Code, `AGENTS.md` for others) and `peer-ai/` at the root
- CI runs lint + type check + build on PRs via GitHub Actions
