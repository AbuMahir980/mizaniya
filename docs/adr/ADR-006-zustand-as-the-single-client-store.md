# ADR-006. Zustand as the single client store

> **Extracted 2026-10-08 (ITEM-7) from the table in [`docs/02-architecture.md`](../02-architecture.md) §11**, where this decision was originally recorded as a single row. Its wording below is that row's, moved under the headings Peer AI 1.0's decision template requires — not rewritten. Where the original recorded nothing for a section, the section says so rather than being filled in.

## Status

**Accepted** — 2026-09-10. Deciders: Qudus Lawal (stakeholder and owner).

## Context

**Not recorded as its own section.** The original row cites requirement **B4** and
goes straight to alternatives. The need it answers is B4's; nothing further is
invented here.

## Options

The original row records these, and they are reproduced as written:

- **Context + `useReducer`** — no dependency, but one snapshot in one context
  re-renders every consumer on every change, which is felt on a phone.
- **Redux Toolkit** — more ceremony than one person's budget warrants.

## Decision

**Zustand as the single client store** (**B4**).

## Consequences

Selector-based subscriptions keep re-renders narrow and it works unchanged in React
Native for v2; the cost is one dependency, justified per **N1** (~1 KB, no provider,
no platform equivalent).
