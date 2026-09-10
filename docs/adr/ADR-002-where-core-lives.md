# ADR-002: Where `core/` lives — folder or workspace package

| Field | Value |
|-------|-------|
| **Status** | **Proposed** — awaiting the stakeholder |
| **Date** | 2026-09-10 |
| **Deciders** | Qudus Lawal (stakeholder and owner) |

---

## Context

`core/` holds every domain calculation — cycle boundaries, safe-to-spend,
rollover, projected gap, zakat estimate, money in kobo — as pure TypeScript with
no React, no storage and no platform APIs (**A3**).

It exists to be shared. **v2 is an Expo app running the same calculations**, and
that reuse is a stated purpose of the project, not a maybe: it is the React
Native case study.

So the question is only *when* the package boundary is created — now, or when v2
starts. The import discipline is enforced by lint either way, so this is about
build configuration and the size of a future move, not about whether the
boundary exists.

The project's stated constraint is *ship as soon as realistic*, for a portfolio
and for freelance bidding. That pulls against added configuration surface.

---

## Decision

**To be chosen by the stakeholder.** Both options are viable; neither is a
mistake.

**Recommendation: option A — a folder now.**

---

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **A · `src/core/` folder now, extract at v2** *(recommended)* | No workspace configuration in Vite, Vitest, ESLint, tsconfig or CI. Fastest path to a shipped v1. **A3** is enforced by lint from day one, so the discipline is identical | The extraction at v2 touches every import of `core/` — a whole-repo diff, though a mechanical one with no logic changes |
| **B · `packages/core` workspace now** | v2 consumes a real package with nothing to move. The boundary is structural, not only a lint rule. Versioning and independent tests come free | Workspace configuration must be threaded through five tools before the first screen exists. Every one of them is a place for a fiddly failure on a project whose priority is shipping |
| **C · A separate repository for `core/`** | Hardest possible boundary; publishable | Two repositories to keep in step, a publish step in the loop for every domain change, and it splits the public build-in-the-open story across two places. Wrong for one developer |

---

## Trade-off Analysis

The instinct that a package is "more professional" is worth resisting. What
makes `core/` reusable is that **it imports nothing** — not that it has a
`package.json`. That property is created and enforced by the lint rule behind
**A3**, on day one, under either option.

Given that, the choice reduces to *pay a small cost now, or a slightly larger
one later*. The later cost is bounded and boring: a folder that already imports
nothing gets moved, and import paths change. There is no logic to untangle,
because the untangling was the lint rule's job all along.

The one thing that would flip the recommendation is timing. If v2 begins
immediately after v1, the workspace is set up once instead of built and then
retrofitted — and the retrofit lands as a large diff in a public history at
exactly the moment the repository is being shown to people.

---

## Consequences

### If option A (folder)

- Fastest route to a shipped, screenshot-ready v1.
- `core/` is framework-free from the first commit; only its location changes.
- v2 opens with a mechanical refactor and a large, low-risk diff.
- Vitest, ESLint and tsconfig each stay single-project and simple.

### If option B (workspace)

- v2 starts with no refactor.
- Configuration cost is paid before the first screen exists, when there is least
  to show for it.
- Every tool in the chain gains a workspace-aware configuration to maintain.

---

## Action Items

1. [ ] Stakeholder chooses A or B; record the choice and the reason in `CONTEXT.md`.
2. [ ] Either way, add the **A3** lint rule in SHARED RULES: no React, no platform, no storage imports inside `core/`.
3. [ ] If A: add a line to `docs/backlog.md` — *extract `core/` to a package as the first task of v2*.
4. [ ] If B: set up the workspace before BUILD begins, not during it.

---

## Related ADRs

- [ADR-001 — Reactivity and the data seam](ADR-001-reactivity-and-the-data-seam.md)
