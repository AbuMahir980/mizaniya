# Standards Addendum — Mizaniya

This project follows `frontend-engineering-standards.md` and
`backend-engineering-standards.md` unchanged. The values those documents leave
to the project are set here.

- **Currency minor unit:** kobo. The branded type is `Kobo`; the formatter
  renders `₦1,250,000.00`.
- **Safety-critical data:** none. Sections I (frontend) and E (backend) are
  empty for this project.
- **Danger colour means:** money going wrong — negative safe-to-spend, a
  missed debt schedule, an overspent envelope. Nothing else uses it.
- **Audiences/realms:** single audience (the owner) in v1–v2. If household
  sharing arrives, `OWNER` and `MEMBER` become audiences and C5 applies.
- **Storage:** v1 IndexedDB via Dexie behind `Repository`; v2 SQLite on
  mobile behind the same interface; v3 API-backed implementation.
- **Queue/cache (v3):** to be decided in the Architect phase; O5/O6 and G
  apply from that point.
- **Pinned SDKs:** Expo SDK recorded in ADR-01 when v2 starts.
- **Core journeys (K1):** onboard → set plan → quick-add expense →
  safe-to-spend updates → record debt payment → projected gap updates →
  export → import into a clean browser → identical state.
- **Seed data:** `docs/seed-data.md` only. No real figures anywhere in the
  repository, screenshots, tests or commit messages.
- **Telemetry:** none in v1. Any later analytics is opt-in and documented.
