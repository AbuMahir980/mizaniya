# Backlog

Things deliberately kept out of the code.

The kick-off instruction is explicit: *anything not in the brief goes into
`docs/backlog.md`, not into the code.* This file is what makes that rule
survivable — an idea can be taken seriously and written down without being
built, so v1 stays small enough to finish.

Nothing here is a promise. It is a record of what was considered and why it
waits.

---

## v2 — first, before any Expo screen

| Item | Why it waits | Source |
|---|---|---|
| **Extract `core/` to a package** (`packages/core` or equivalent) | v1 keeps `core/` as a folder with the **A3** lint rule holding the boundary. The move is mechanical because `core/` imports nothing — but it must happen **before** the first Expo screen, so it is done once and deliberately rather than discovered mid-build | [ADR-002](adr/ADR-002-where-core-lives.md) |
| Pin the Expo SDK and record it in an ADR | Standard **N3**; the addendum's reference to "ADR-01" should say *an* ADR, since ADR-001 is taken | addendum, `docs/02-architecture.md` §11 |

---

## BUILD — first tasks, before any feature

| Item | Why it waits |
|---|---|
| **Tie the zod schemas to the TypeScript types.** Annotate each as `SchemaFor<T> = z.ZodType<T, z.ZodTypeDef, unknown>` so `tsc` fails when a schema and its interface disagree | `packages/core/src/types.ts` and `packages/core/src/schema.ts` currently describe the same shapes with **nothing preventing drift**. Found at the API CONTRACT stop. The fix needs a compiler to prove it works, and `package.json` does not exist until BUILD — writing unverified type-level code and calling it a gate would be worse than naming the gap ([[types-vs-runtime-validation]]) |
| **`npm run contract:gen` + a CI diff check** — regenerate the tables in `docs/04-api-contract.md` §4 and §5 from the source files and fail if the working tree changes | Required by the API CONTRACT phase. Until it exists those tables are hand-checked, and the document says so. A contract that can drift silently is not a contract |

---

## Deferred features

| Item | Why it waits |
|---|---|
| **Rollover cap or expiry** | v1 carries unspent allowance forward with no limit, and shows the carried figure on Plan so it cannot accumulate invisibly. If it grows silly in real use, cap it then — with evidence rather than a guess (**D2**) |
| **Optional app lock** (PIN or biometric) | There is no encryption at rest in v1: the realistic threat is someone holding the unlocked phone, and with no server a forgotten passphrase would destroy the history permanently. A lock that guards the screen without holding a key is the right shape, later (**D12**) |
| **Automated enforcement of repo rule 3** (no employer, client or third-party project names) | The only repo rule with nothing behind it but careful reading. Secret scanning finds keys, not project names — and a denylist committed to a public repo publishes the very names it hides, so the list must live outside the repo as a CI variable. To be raised at PR AUTOMATION |
| **Transaction pagination in the repository** | The whole dataset is held in memory as one snapshot, which is right at this size. Revisit if many years of daily records make startup noticeable; the `Repository` interface already allows a ranged `list` ([ADR-001](adr/ADR-001-reactivity-and-the-data-seam.md)) |
| **User-defined savings destinations** | v1 ships the fixed five — bank vault, Cowrywise, PiggyVest, cash at home, ajo — which cover the brief. Making them editable means a new entity, a management screen and a migration. Until then the note field carries anywhere else, and Settings says so on screen rather than leaving someone hunting for a button that does not exist |

---

## Explicitly out of scope, not backlog

These are v3 or never, and are recorded in
[docs/01-requirements-summary.md](01-requirements-summary.md)'s scope table
rather than here: bank and wallet sync, household sharing, multi-currency, zakat
PDF export, ajo group management with reminders, CSV/Excel export, any server or
account, push notifications, telemetry, and — never — interest-bearing product
suggestions.
