# ADR-005. Export carries a schemaVersion; import is atomic and version-checked

> **Extracted 2026-10-08 (ITEM-7) from the table in [`docs/02-architecture.md`](../02-architecture.md) §11**, where this decision was originally recorded as a single row. Its wording below is that row's, moved under the headings Peer AI 1.0's decision template requires — not rewritten. Where the original recorded nothing for a section, the section says so rather than being filled in.

## Status

**Accepted** — 2026-09-10. Deciders: Qudus Lawal (stakeholder and owner).

## Context

**Not recorded.** The original row gives no context section — it states the decision
and its consequences only. Nothing is invented to fill it.

What can be said without inventing: the decision concerns the export and import
feature, and the problems it addresses are named inside its own consequences — a
half-succeeded import, and unrecoverable overwriting of live data.

## Options

**Not recorded.** The original row names no alternative.

The shapes ruled out are implied — a partial or merging import, and an unversioned
file — but none was written down as a weighed option.

## Decision

**Export carries a `schemaVersion`; import is atomic and version-checked.** Older
files migrate through a chain of pure functions; a newer file is refused with a plain
explanation rather than partially loaded. Import replaces everything, and the current
data is exported to a file first.

## Consequences

An import can never half-succeed, and overwriting live data is recoverable; the cost
is a migration chain to maintain from the first schema change.

*Note added 2026-10-08:* the migration chain's first real step arrived with
[ADR-010](ADR-010-sync-model.md)'s schema v2, and
[ADR-013](ADR-013-no-accounts-sync-as-an-encrypted-blob.md) relies on this record's
`buildExportFile` as the payload it encrypts. Issue #106 — a demo export must not
restore silently as real data — is open against this decision's import path.
