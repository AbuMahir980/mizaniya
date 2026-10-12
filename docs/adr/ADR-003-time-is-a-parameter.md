# ADR-003. Time is a parameter

> **Extracted 2026-10-08 (ITEM-7) from the table in [`docs/02-architecture.md`](../02-architecture.md) §11**, where this decision was originally recorded as a single row. Its wording below is that row's, moved under the headings Peer AI 1.0's decision template requires — not rewritten. Where the original recorded nothing for a section, the section says so rather than being filled in.

## Status

**Accepted** — 2026-09-10. Deciders: Qudus Lawal (stakeholder and owner).

## Context

Every cycle figure depends on today.

## Options

**Not recorded.** The original row names no alternative, so none is invented here.

What the decision rules out is readable from the decision itself: `core/` reading the
clock directly, and storing instants where a calendar date is meant. Neither was
written down as a weighed option, and this record does not pretend otherwise.

## Decision

**Time is a parameter.** `core/` never reads the clock; `now` is passed in, and dates
are stored as calendar dates (`YYYY-MM-DD`), not instants.

## Consequences

Every calculation is testable against a fixed date and a February bug can be
reproduced on purpose; the cost is one extra argument on many functions.

*Still holding as of 2026-10-08:* `packages/core` has a test asserting that `core`
cannot read the clock, and [ADR-010](ADR-010-sync-model.md) kept it true when adding
`updatedAt` by routing the clock through `sync/stamp.ts` rather than into the domain.
