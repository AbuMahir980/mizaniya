# ADR-004. Money is integer kobo with a branded type

> **Extracted 2026-10-08 (ITEM-7) from the table in [`docs/02-architecture.md`](../02-architecture.md) §11**, where this decision was originally recorded as a single row. Its wording below is that row's, moved under the headings Peer AI 1.0's decision template requires — not rewritten. Where the original recorded nothing for a section, the section says so rather than being filled in.

## Status

**Accepted** — 2026-09-10. Deciders: Qudus Lawal (stakeholder and owner).

## Context

Floating point cannot represent decimal money exactly.

## Options

**Not recorded.** The original row names no alternative.

The rejected shape is implied by the decision — a plain `number`, or a decimal
string — but neither was written down as a weighed option, so neither is reported
here as one.

## Decision

**Money is integer kobo with a branded type**, all arithmetic in `core/money`.

## Consequences

Rounding is explicit and testable, and a raw number cannot be passed where an amount
is expected; the cost is conversion at every input and output boundary.

*Still holding as of 2026-10-08:* enforced by the standards as well as by the type —
MONEY-01 and MONEY-05 are in the review checklist, and `amberThreshold` in
`packages/core/src/budget/budget.ts` divides last for this reason.
