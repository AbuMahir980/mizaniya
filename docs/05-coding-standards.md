# Coding standards — the index

| Field | Value |
|---|---|
| **Date** | 2026-09-11 |
| **Phase** | 5 · Shared Rules |
| **Status** | The `auto` rules are mapped to what enforces them, **with an honest status for each**. |

---

## 1 · This is an index, not a standard

The rulebook is `docs/standards/`, and this phase does not write a second one.
What follows is the map: **every `auto` rule, and the exact thing that fails the
build when it is broken.** Where nothing enforces a rule yet, it says so and
names the phase that will.

| Document | Covers |
|---|---|
| [frontend-engineering-standards.md](standards/frontend-engineering-standards.md) | Sections A–O |
| [backend-engineering-standards.md](standards/backend-engineering-standards.md) | Dormant until v3 |
| [standards-addendum-mizaniya.md](standards/standards-addendum-mizaniya.md) | Kobo · what danger means · core journey K1 · seed data · telemetry |

Every **`review`** rule is the code-review checklist in
[CONTEXT.md](../CONTEXT.md), and is not repeated here.

**The design tokens are a contract, not a suggestion.**
[docs/design/tokens.md](design/tokens.md) is authoritative;
`src/design/tokens.ts` implements it and `src/design/tokens.test.ts` fails when
the two disagree.

---

## 2 · The verify command

```
npm run verify   →   lint · typecheck · test · build
```

This is what "done" means for a ticket. It was `none yet` until this phase; it
now runs, and it is green.

---

## 3 · Every `auto` rule, and what holds it

**Enforced** means it fails `npm run verify` today. **Partial** means something
catches most of it. **Not yet** names where it lands.

### Architecture

| Rule | Enforced by | Status |
|---|---|:-:|
| **A1** Feature-first folders | The standard names `eslint-plugin-boundaries`; not installed. The folder layout exists and is described in `docs/02-architecture.md` | **Not yet** — BUILD, with the first feature |
| **A2** Dependencies point inward | `no-restricted-imports` patterns in `eslint.config.js` block `core/ → ui/`, `core/ → features/`, `core/ → data/` | **Partial** — a path-based rule, not a full boundary graph |
| **A3** `core/` is framework-free | `no-restricted-imports` blocks React, Dexie and Zustand inside `src/core/` | **Enforced** |
| **A4** Data access behind an interface | `no-restricted-imports` blocks `dexie` everywhere except `src/data/` | **Enforced** |
| **A5** Feature has a public surface | `no-restricted-imports` blocks deep imports into a sibling feature | **Partial** — covers the common shape |

> **A3 carries more weight than it looks.** ADR-002 chose a folder over a
> workspace package, so this lint rule is *the only thing* holding the boundary
> that makes `core/` portable to the Expo app. It fails CI; it does not warn.

### State and components

| Rule | Enforced by | Status |
|---|---|:-:|
| **B1 / B2** No fetching in `useEffect` | v1 has no network at all, so there is nothing to fetch. Activates in v3 | **N/A in v1** |
| **D1** A component file is at most 150 lines | — | **Not yet** — FRONTEND RULES |
| **D4** Only a screen knows about navigation | — | **Not yet** — BUILD, once routing exists |

### Styling

| Rule | Enforced by | Status |
|---|---|:-:|
| **F1** Zero inline style objects | — | **Not yet** — FRONTEND RULES |
| **F2** Zero hard-coded colours | `no-restricted-syntax` rejects a hex literal in `src/ui`, `src/features`, `src/app` | **Enforced** for colour; spacing and radii pending |
| **F3** Tokens come from one source | Tailwind's theme is **replaced**, not extended — `bg-blue-500` and `p-7` do not exist, so there is nothing to reach for | **Enforced** by construction |
| **F5** Screens compose only `ui/` primitives | — | **Not yet** — FRONTEND RULES |
| **F7** Danger colour is reserved | `hueMeaning` in `tokens.ts` records the rule; the review checklist enforces it | **Review** |

### Types

| Rule | Enforced by | Status |
|---|---|:-:|
| **G1** `strict: true`, `any` is an error | `tsconfig.json` (`strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`) + `@typescript-eslint/no-explicit-any` | **Enforced** |
| **G2** API types generated from the contract | The contract *is* `src/core/types.ts`; the doc indexes it rather than restating it | **Enforced** by design |
| **G4** No assertions across a data boundary | — | **Not yet** — FRONTEND RULES |

### Money — non-negotiable

| Rule | Enforced by | Status |
|---|---|:-:|
| **H1** Integer minor units | The branded `Kobo` type; `naira()` and `kobo()` throw on a fraction | **Enforced** |
| **H2** Formatted in exactly one place | `MoneyText` is the only renderer; `formatMoney` lives in `core/money` | **Partial** — a restricted-import rule should stop a second caller |
| **H3** No money arithmetic in a component | Review checklist | **Review** |
| **H4** Every money path tested before merge | 22 tests in `money.test.ts`, including every published figure | **Partial** — the coverage *gate* lands at PR AUTOMATION |
| **H5** Positive amounts, direction from the type | `transactionSchema` rejects a non-positive amount at runtime | **Enforced** |

### Accessibility

| Rule | Enforced by | Status |
|---|---|:-:|
| **J1** 44px targets | Audited live against the primitives page — **three violations found and fixed**; all 40 interactive elements now pass | **Partial** — needs the Playwright assertion (TEST) to stay true |
| **J2** Every interactive element labelled | Radix supplies the roles; every icon-only control carries `aria-label` | **Partial** — needs an axe pass in CI |
| **J3** `prefers-reduced-motion` | A global rule in `tokens.css`, with the spinner as the one deliberate exception | **Enforced** |
| **J4** WCAG AA contrast in both themes | 54 pairs measured at the design stop, 0 failures. `tokens.test.ts` keeps the values honest | **Partial** — the contrast script itself must move into CI |
| **J5** Keyboard end to end | — | **Not yet** — TEST, as a Playwright journey |

### Testing, errors, data

| Rule | Enforced by | Status |
|---|---|:-:|
| **K1** Core journey is the acceptance test | — | **Not yet** — TEST |
| **K2** `core/` tested exhaustively | 33 tests pass; the coverage gate is not yet wired | **Partial** |
| **L3** No swallowed errors | `eslint:recommended` (`no-empty`) | **Partial** |
| **M1** No real data in the repository | Every figure comes from `docs/seed-data.md`; secret scanning lands at PR AUTOMATION | **Partial** |
| **M3** Export/import round-trips exactly | — | **Not yet** — BUILD, with export/import |
| **N2** Versions pinned, lockfile committed | `package-lock.json` is committed | **Enforced** |
| **O1 / O2** Naming | Files are kebab-case and booleans read as assertions by convention | **Not yet** — needs a naming plugin |

---

## 4 · What this phase built

| Path | What it is |
|---|---|
| `src/design/tokens.ts` | Every token as typed data — the source |
| `src/design/tokens.css` | The same values as custom properties, guarded by a test |
| `tailwind.config.ts` | Theme **replaced**, so only design values exist |
| `src/core/money/money.ts` | The only formatter, and the rounding direction in the function name |
| `src/ui/*` | The primitives, each with its states |
| `src/app/primitives-page.tsx` | The gallery — every component, every state, both themes |
| `eslint.config.js` | The architecture boundaries above |

### Two things worth remembering from building it

**A rule that is too blunt gets worked around.** Banning `Date` in `core/` to
enforce ADR-003 also banned *parsing* a date, which `schema.ts` legitimately does
to reject `2026-02-30`. It is now two precise selectors for reading the clock.

**44px is a hit area, not a visual box.** A live audit of the primitives page
found three controls under target — a banner action at 39px wide, and the switch
and slider thumbs at 28px. The switch and slider keep their size and grow an
invisible target around themselves, which is what the token always said.

---

## 5 · What is owed, and where

| Owed | Phase |
|---|---|
| `eslint-plugin-boundaries` for A1, and the remaining F and G rules | FRONTEND RULES |
| Restricted import so only `MoneyText` formats money (H2) | FRONTEND RULES |
| Coverage gate on `core/` and the money modules (H4, K2) | PR AUTOMATION |
| Contrast script and an axe pass in CI (J2, J4) | PR AUTOMATION |
| Playwright: the K1 journey, keyboard-only, and a 44px assertion (J1, J5, K1) | TEST |
| Secret scanning (M1) | PR AUTOMATION |
| Tie the zod schemas to the types so `tsc` fails on drift | BUILD — see `docs/backlog.md` |
