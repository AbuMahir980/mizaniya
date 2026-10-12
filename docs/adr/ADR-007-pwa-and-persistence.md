# ADR-007. PWA via vite-plugin-pwa; persistence requested after first meaningful write

> **Extracted 2026-10-08 (ITEM-7) from the table in [`docs/02-architecture.md`](../02-architecture.md) §11**, where this decision was originally recorded as a single row. Its wording below is that row's, moved under the headings Peer AI 1.0's decision template requires — not rewritten. Where the original recorded nothing for a section, the section says so rather than being filled in.

## Status

**Accepted** — 2026-09-10, **amended 2026-09-25.** Deciders: Qudus Lawal (stakeholder
and owner).

*"There is no network data to cache"* stopped being true when
[ADR-009](ADR-009-repositioning-v1-hosted-webapp.md) added a server — but **the
conclusion is unchanged and now rests on a better reason.** It was an absence: nothing
to cache, so nothing cached. It is now a prohibition: **the service worker must never
cache synced data**, because a runtime cache would be a second copy of the owner's
money with its own staleness and nothing able to say which was right — the same
argument that keeps derived figures out of storage (**B3**, `derived-state.md`). The
shell is still all it precaches. The update path still must not serve a stale shell.

*Further note, 2026-10-08:* [ADR-013](ADR-013-no-accounts-sync-as-an-encrypted-blob.md)
removes the server but **not** this prohibition. Synced data is now an encrypted blob,
and caching it would still be a second copy with its own staleness — so the amended
reason survives the thing that prompted it.

## Context

Offline is the product, so the app must open and work with no network at all.

## Options

**Not recorded.** The original row names no alternative to `vite-plugin-pwa`, nor to
requesting persistence after the first meaningful write rather than on first load.

## Decision

**PWA via vite-plugin-pwa; persistence requested after first meaningful write.** The
service worker precaches the app shell only — there is no network data to cache. *(See
Status: that last clause is superseded by a prohibition rather than an absence.)*

## Consequences

The app opens offline, becomes installable, and installation is the single biggest
factor in whether the browser evicts the data (**D14**: iOS Safari is the strict case);
the cost is a service-worker update path that must not serve a stale shell.
