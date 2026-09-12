# API Contract — Mizaniya v1

| Field | Value |
|---|---|
| **Date** | 2026-09-10 |
| **Phase** | 4 · API Contract |
| **Schema version** | **1** |
| **Status** | Drafted. Last phase before the stakeholder stop. |

---

## 1 · There is no server, so what is the contract?

v1 has no HTTP API, no endpoints, no auth and no network. The two things that
play the part of an API are:

1. **The `Repository` interface** — the one door between the app and its data.
2. **The export / import file** — the only way data leaves or enters the app.

Both are boundaries that outlive their implementations. `Repository` gets a
second implementation in v2 (SQLite) and a third in v3 (HTTP). The export file
outlives every version of the app that can read it. That is exactly what a
contract is for.

## 2 · The source of record is the code, not this document

**These three files are authoritative:**

| File | Holds |
|---|---|
| [`src/core/types.ts`](../src/core/types.ts) | Every domain type, with branded primitives |
| [`src/core/schema.ts`](../src/core/schema.ts) | The runtime schema, and the import check |
| [`src/core/repository.ts`](../src/core/repository.ts) | The `Repository` interface |

This document explains and indexes them. **It does not restate them**, because
a shape written twice is a shape that will disagree with itself, and nobody will
be able to tell which copy is current (**E2**, and the same reasoning as
`docs/standards/` being referenced rather than copied).

**Owed to BUILD — the drift gate.** The phase instruction requires a CI step
that regenerates this document's contract sections from the source files and
fails on any diff. That needs `package.json`, which BUILD creates as its first
task, so the generator is recorded here as a build task rather than half-built
now:

- [ ] `npm run contract:gen` — read the three files, emit the tables in §4 and §5.
- [ ] CI runs it and fails if the working tree changes. A contract that can drift silently is not a contract.

Until that lands, the tables below are **descriptions, checked by hand**. That is
stated plainly so nobody mistakes them for generated output.

---

## 3 · Conventions

| Concern | Rule | Why |
|---|---|---|
| **Money** | Integer **kobo**, branded `Kobo`. Never a float, never naira, at any layer | **H1**. ₦1,250,000.00 is `125000000` |
| **Direction** | Amounts are always **positive**. Direction comes from the movement's `type` | **H5**. A minus sign is a data-entry error waiting to happen |
| **Calendar dates** | `YYYY-MM-DD`, branded `IsoDate`, for anything a cycle calculation reads | ADR-003. A timestamp can shift a transaction to the previous day when the timezone changes |
| **Instants** | ISO 8601 with an offset, branded `Instant`, for bookkeeping only — `createdAt`, `exportedAt` | These are audit facts, not budget facts |
| **Identifiers** | Opaque strings, sortable by creation time. No meaning is ever parsed out of an id | An id that encodes meaning becomes a schema nobody documented |
| **Optionality** | Optional means *genuinely absent*, never a sentinel. No `0` for "no target", no `""` for "no note" | `0` and "unset" are different facts, and conflating them makes a wrong figure look deliberate |
| **Naming** | The owner's vocabulary, not the framework's — `amountMinor` over `amt`, "I borrowed" over `DEBT_IN` | **O3**, **O4** |

### The eight movement types

**Correction to an earlier decision.** During UNDERSTAND I proposed that savings
be one type carrying a direction field, which would have given seven types. That
was wrong: standard **H5** says *direction comes from a type*. Moving money into
savings and taking it out are two movements to the owner and two literals in the
union. **There are eight types, not seven.**

| Type | Shown as | Cash | Effect |
|---|---|:-:|---|
| `income` | Income | in | Actual income for the cycle |
| `expense` | Expense | out | Spend against a category |
| `savings-in` | Move to savings | out | Funds a savings category and its goal |
| `savings-out` | Take from savings | in | Withdraws from one |
| `borrowed` | I borrowed | in | Owner owes more |
| `repaid` | I repaid | out | Owner owes less |
| `lent` | I lent | out | Owner is owed more |
| `repayment-received` | They repaid me | in | Owner is owed less |

`income`, `expense`, `savings-in` and `savings-out` must name a **category**.
The four debt movements must name a **debt**. Enforced at runtime, not just in
types — see §6.

---

## 4 · Entities

Field-by-field definitions live in [`src/core/types.ts`](../src/core/types.ts).
What follows is what a reader needs to know that the types cannot say.

| Entity | Purpose | Worth knowing |
|---|---|---|
| **Settings** | Salary day, take-home, the amber ratio, the early-income window, zakat preferences, last export | `salaryDay` is 1–31 and **clamps** to the last day of a short month (D4). `amberRatio` defaults to 0.6 (D15). `zakat.includeReceivables` is *undefined* until asked — undefined is "not yet asked", not "no" (D3) |
| **Category** | A budget envelope | `type` decides protection by default; `protectedOverride` beats it (D1). `rollsOver` carries unspent allowance forward (D2). Archiving keeps history truthful — categories are archived, never deleted |
| **PlanEntry** | One planned amount, one category, one cycle | Identified by `cycleStart`, so a cycle *is* its first day |
| **Transaction** | A single movement | The only entity that records a fact. Everything on every screen is calculated from these |
| **Debt** | One counterparty, for the life of the relationship | **No direction field.** The balance derives from transactions and may cross zero, which is what a rotating ajo does (D9). A stored direction would need correcting at the crossing, and nothing would notice if it were not |
| **Goal** | A target, optionally by a date | No `savedSoFar` field. Progress comes only from transactions, so it cannot drift |

### The derived-figure rule

No entity above stores cash left, safe-to-spend, a what is left, a balance or a
projected gap. Every one is a pure function of `(Snapshot, now)` (**B3**,
ADR-001). **A field for any of them would be a bug in the contract**, not a
convenience — see [docs/concepts/derived-state.md](concepts/derived-state.md).

**Debt balance**, since it is the one people expect to be stored — positive
means the owner owes:

```
balance = Σ borrowed − Σ repaid − Σ lent + Σ repayment-received
```

Lend ₦40,000 → −40,000 (owed to the owner). They repay it → 0. Borrow ₦120,000
→ +120,000; repay ₦30,000 → +90,000. An ajo group crosses from negative to
positive at the payout, in one record.

---

## 5 · The `Repository` interface

Defined in [`src/core/repository.ts`](../src/core/repository.ts).

| Group | Operations |
|---|---|
| — | `load()` — everything, once, at startup |
| `settings` | `get` · `put` |
| `categories` | `list` · `put` · `delete` |
| `plans` | `listByCycle` · `put` · `bulkPut` · `delete` |
| `transactions` | `list(range?)` · `put` · `bulkPut` · `delete` |
| `debts` | `list` · `put` · `delete` |
| `goals` | `list` · `put` · `delete` |
| — | `export()` · `import(snapshot)` · `clear()` |

**The test every method passed:** *could this be implemented over HTTP without
heroics?* If not, it is not in the interface. That single question is why there
is no query language and no live subscription here — see
[ADR-001](adr/ADR-001-reactivity-and-the-data-seam.md).

`ChangeNotifier` (multi-tab reload) sits **outside** `Repository` deliberately.
It is a property of the browser, not of the store; inside the interface it would
oblige React Native and HTTP implementations to fake something they have no
equivalent for.

**Date ranges are half-open** — `from` included, `to` excluded — because cycles
abut. An inclusive end would put every boundary day in two cycles at once.

---

## 6 · Why there is a runtime schema as well as types

TypeScript disappears when the code is compiled. A file the owner picks from
disk is data from outside the app, and static types cannot check it.

[`src/core/schema.ts`](../src/core/schema.ts) validates at that boundary, and
catches things types cannot express:

- an amount of `0` or below — `amount` must be **greater than** zero;
- `2026-02-30`, which matches the date pattern and is not a real date;
- a `repaid` movement with no `debtId`, which would look valid and quietly break
  every balance derived from it;
- a `savingsDestination` on an expense.

**Dependency justification (N1).** `zod` — validates untrusted input at runtime,
which the platform cannot do (`JSON.parse` returns `any`); ~14 KB gzipped; the
alternative is hand-written guards for eleven shapes, which is more code and
less reliable.

---

## 7 · Export and import

### File format

```jsonc
{
  "app": "mizaniya",
  "schemaVersion": 1,
  "exportedAt": "2026-10-05T09:14:22.000+01:00",
  "data": {
    "settings":     { /* … */ },
    "categories":   [ /* … */ ],
    "plans":        [ /* … */ ],
    "transactions": [ /* … */ ],
    "debts":        [ /* … */ ],
    "goals":        [ /* … */ ]
  }
}
```

Filename: `mizaniya-export-YYYY-MM-DD.json`.

### Version rules

| File version | Behaviour |
|---|---|
| **Equal** to the app's | Load |
| **Older** | Run migrations in order — each a pure `v(n) → v(n+1)` function — then load |
| **Newer** | **Refuse.** Explain that the file was made by a newer version, and change nothing |

Refusing a newer file is deliberate. Loading the parts we recognise and dropping
the rest would silently discard the owner's data while appearing to succeed —
the worst outcome available.

### Refusal reasons

`checkImport()` returns exactly one of: `not-mizaniya` · `too-new` ·
`malformed` (with the specific issues). Each maps to a message that says what
happened **and what to do next** (**L2**).

### Import is atomic, and preceded by an export

One transaction: all of it lands or none of it does. Before it runs, the current
data is exported to a file and the owner is told that happened — so importing
over live data is recoverable rather than final (ADR-005).

---

## 8 · Where a v3 API would slot in

Behind the same interface, and nowhere else.

```
                      v1  ──▶  DexieRepository      ──▶  IndexedDB
  screens ──▶ Repository ──▶  SqliteRepository      ──▶  SQLite      (v2)
                      v3  ──▶  HttpRepository       ──▶  API + Postgres
```

No screen and nothing in `core/` changes. What v3 adds, in the **separate
private repository**:

| Concern | Note |
|---|---|
| **Auth** | The first time **A6** stops being dormant — every request carries its session scope explicitly |
| **Conflict resolution** | The first genuinely hard problem this project will have. Two devices editing one cycle offline need more than last-write-wins, and the answer belongs in its own ADR |
| **Sync boundary** | `load()` becomes a fetch; `put` becomes a queued mutation. The snapshot model survives, which is why it was chosen |
| **Household sharing** | Introduces `OWNER` / `MEMBER` audiences, and **C5** applies |
| **Schema** | `schemaVersion` already exists and already migrates. The server inherits the same chain |

**What must not happen:** the HTTP implementation must not add methods to
`Repository` that only it can serve. If v3 needs something new, it goes on the
interface and every implementation answers it honestly — or it does not go on
the interface at all.

---

## 9 · Changelog

| Version | Date | Change |
|:-:|---|---|
| **1** | 2026-09-10 | First contract. Six entities, eight movement types, the `Repository` interface, and the export file at `schemaVersion: 1` |
