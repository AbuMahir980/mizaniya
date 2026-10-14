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
`apps/web/src/design/tokens.ts` implements it and `apps/web/src/design/tokens.test.ts` fails when
the two disagree.

---

## 2 · The verify command

```
npm run verify   →   naming · lint · typecheck · test · build
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
| **A1** Feature-first folders | `eslint-plugin-boundaries` declares each layer once, so the architecture diagram and the linter cannot disagree | **Enforced** |
| **A2** Dependencies point inward | `boundaries/dependencies` with `default: disallow` — every permitted direction is listed, and `core/` is allowed an **empty** list | **Enforced** |
| **A3** `core/` is framework-free | `no-restricted-imports` blocks React, Dexie and Zustand inside `packages/core/src/` | **Enforced** |
| **A4** Data access behind an interface | `no-restricted-imports` blocks `dexie` everywhere except `apps/web/src/data/` | **Enforced** |
| **A5** Feature has a public surface | `boundaries/no-private` blocks reaching into another element's internals | **Enforced** |

> **A3 carries more weight than it looks.** ADR-002 chose a folder over a
> workspace package, so this lint rule is *the only thing* holding the boundary
> that makes `core/` portable to the Expo app. It fails CI; it does not warn.

### State and components

| Rule | Enforced by | Status |
|---|---|:-:|
| **B1 / B2** No fetching in `useEffect` | v1 has no network at all, so there is nothing to fetch. Activates in v3 | **N/A in v1** |
| **D1** A component file is at most 150 lines | `peer-ai/max-lines`, as Peer AI's **REACT-03** | **Reports, does not block** — the rule exists and runs as of 2026-10-07; it is deferred to reporting until **ITEM-2** rebuilds the screens, with the owner's name on the deferral in `peer-ai.config.json`. *Corrected 2026-10-13: this row said "Not yet — needs a line-count rule", which stopped being true when Peer AI's rules were turned on.* |
| **D1 (file size)** No file over 400 lines | `peer-ai/max-lines`, as Peer AI's **TS-08** | **Reports, does not block** — same deferral, same item. Until 2026-10-13 this rule was recorded as enforced and was in fact being replaced by the 150-line warning above for every `.tsx` file; `peer-ai-eslint-config` next.16 fixed that, and the two files over 400 are named in the deferral's reason |
| **D4** Only a screen knows about navigation | — | **Not yet** — BUILD, once routing exists |

### Styling

| Rule | Enforced by | Status |
|---|---|:-:|
| **F1** Zero inline style objects | — | **Not yet** — one legitimate exception exists (`Rail`'s computed width), so the rule needs an allowlist before it can be turned on |
| **F2** Zero hard-coded colours | `no-restricted-syntax` rejects a hex literal in `apps/web/src/ui`, `features` and `app` | **Enforced** for colour; spacing and radii pending |
| **F3** Tokens come from one source | Tailwind's theme is **replaced**, not extended — `bg-blue-500` and `p-7` do not exist, so there is nothing to reach for | **Enforced** by construction |
| **F5** Screens compose only `ui/` primitives | `no-restricted-syntax` bans `<button>`, `<input>`, `<select>` and `<table>` in `apps/web/src/features/`. Deliberately narrow — a rule that forbids `<div>` gets switched off within a week | **Enforced** |
| **F7** Danger colour is reserved | `hueMeaning` in `tokens.ts` records the rule; the review checklist enforces it | **Review** |

### Types

| Rule | Enforced by | Status |
|---|---|:-:|
| **G1** `strict: true`, `any` is an error | `tsconfig.json` (`strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`) + `@typescript-eslint/no-explicit-any` | **Enforced** |
| **G2** API types generated from the contract | The contract *is* `packages/core/src/types.ts`; the doc indexes it rather than restating it | **Enforced** by design |
| **G4** No assertions across a data boundary | — | **Not yet** — FRONTEND RULES |

### Money — non-negotiable

| Rule | Enforced by | Status |
|---|---|:-:|
| **H1** Integer minor units | The branded `Kobo` type; `naira()` and `kobo()` throw on a fraction | **Enforced** |
| **H2** Formatted in exactly one place | `no-restricted-syntax` bans importing `formatMoney` or `splitMoney` anywhere except `apps/web/src/ui/money-text.tsx` | **Enforced** |
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
| **O1** Files kebab-case | `npm run naming` — a ten-line script, first in the verify chain. It caught `App.tsx` on its first run | **Enforced** |
| **O2** Booleans read as assertions | Convention and review | **Review** |

---

## 4 · What this phase built

| Path | What it is |
|---|---|
| `apps/web/src/design/tokens.ts` | Every token as typed data — the source |
| `apps/web/src/design/tokens.css` | The same values as custom properties, guarded by a test |
| `tailwind.config.ts` | Theme **replaced**, so only design values exist |
| `packages/core/src/money/money.ts` | The only formatter, and the rounding direction in the function name |
| `apps/web/src/ui/*` | The primitives, each with its states |
| `apps/web/src/app/primitives-page.tsx` | The gallery — every component, every state, both themes |
| `eslint.config.js` | The architecture boundaries above |

### Two things worth remembering from building it

**A rule that is too blunt gets worked around.** Banning `Date` in `core/` to
enforce ADR-003 also banned *parsing* a date, which `schema.ts` legitimately does
to reject `2026-02-30`. It is now two precise selectors for reading the clock.

**44px is a hit area, not a visual box.** A live audit of the primitives page
found three controls under target — a banner action at 39px wide, and the switch
and slider thumbs at 28px. The switch and slider keep their size and grow an
invisible target around themselves, which is what the token always said.

**A boundary rule that is misconfigured allows everything, silently.** After
wiring `boundaries/dependencies` I broke three rules on purpose inside
`core/` — a React import, an `@/` alias, and a `Date.now()` — and confirmed all
three failed the lint before restoring the file. A green run proves nothing
until you have seen the rule go red.

---

## 5 · What is owed, and where

| Owed | Phase |
|---|---|
| **D1** component line limit, **F1** inline styles, **G4** assertions across a boundary | ISSUES — each needs an allowlist decision first |
| Coverage gate on `core/` and the money modules (H4, K2) | PR AUTOMATION |
| Contrast script and an axe pass in CI (J2, J4) | PR AUTOMATION |
| Playwright: the K1 journey, keyboard-only, and a 44px assertion (J1, J5, K1) | TEST |
| Secret scanning (M1) | PR AUTOMATION |
| Tie the zod schemas to the types so `tsc` fails on drift | BUILD — see `docs/backlog.md` |

---

## 6 · Where to look

*Moved here on 2026-10-14 from `docs/07-frontend-coding-rules.md`, which held nothing
else and was deleted. Its own argument is why: two documents describing one enforcement
setup is the drift this project keeps designing against, and the readable copy is the one
that goes stale.*

| Looking for | Go to |
|---|---|
| Every `auto` rule and what fails the build when it breaks | §3 above |
| Every `review` rule, as the code-review checklist | [CONTEXT.md](../CONTEXT.md) |
| The rules themselves | [docs/standards/](standards/) — authoritative, and they win on any conflict |
| Which Peer AI rule covers which project rule | §7 below |
| The token contract | [docs/design/tokens.md](design/tokens.md) |
| What is still owed, and which phase owes it | §5 above |

---

## 7 · One rulebook: every project rule, and the Peer AI rule that covers it

**Why this section exists.** Two sets of rules govern this code: the project's own
**A1–O4** in [`docs/standards/`](standards/), and Peer AI's, which
`standards_for_file` returns before every edit. They overlap heavily, and until now
nothing said which covered which.

**That cost a week.** The project's **D1** is one rule with two line limits; Peer AI
splits it into **REACT-03** at 150 lines and **TS-08** at 400. Both are the same
underlying ESLint rule, so when REACT-03 was deferred to a warning it silently replaced
TS-08's error for every `.tsx` file — and `doctor`, this document and `CONTEXT.md` all
went on recording TS-08 as enforced and passing while it checked nothing. **A rule
written down twice under two numbers is a rule that can disagree with itself.**

**Precedence, stated once and only here:** where the two disagree,
[`docs/standards/`](standards/) wins, and the disagreement goes in `CONTEXT.md`'s Open
Questions. `CLAUDE.md` §2 points at this line rather than repeating it.

### A · Architecture

| Project | Peer AI | How they relate |
|---|---|---|
| **A1** Feature-first folders | **ARC-01**, **ARC-02** | Same idea; the project is stricter, because it names the folders and the linter declares them |
| **A2** Dependencies point inward | **ARC-06** | The same rule. The project adds the exact permitted directions, which `eslint-plugin-boundaries` enforces |
| **A3** `core/` is framework-free | **ARC-04**, **ARC-05** | Peer AI says business rules are plain code and don't know how they're called; the project names the imports that are banned |
| **A4** Data access behind an interface | **ARC-07**, **ARC-08** | The same rule. `Repository` is the interface, and only `data/` may name Dexie |
| **A5** A feature has a public surface | **ARC-03** | The same rule, module for module |
| **A6** Session scope on every request | **SEC-01**, **SEC-02**, **SEC-03** | **Dormant on both sides.** There is no server and no account after ADR-013, so there is no request to scope |

### B · State · C · Prop drilling

| Project | Peer AI | How they relate |
|---|---|---|
| **B1 / B2** No fetching in `useEffect` | **FE-01**, **FE-05**, **REACT-02**, **REACT-08** | Same idea, four ways. `REACT-02` is the one that blocks, and it caught a real fault in `use-media-query` |
| **B3** Derived values are never stored | **FE-02** | **The same rule, and the one the architecture is built on.** Both say it in nearly the same words |
| **B4** One store for global state | **FE-03** | The same rule; the project names Zustand (ADR-006) |
| **B5** Context is for stable values only | — | **No Peer AI equivalent.** Project-specific, and worth keeping: it is about *what* goes in context, not whether a store exists |
| **C1** A prop passes through at most 2 components | **FE-04** | Same rule; **the number is the project's**. Peer AI says "layers that don't use them" and leaves the count open |
| **C2** Composition first, context second, store third | — | **No Peer AI equivalent.** It is a method for fixing C1 rather than a rule, and it stays |

### D · Components · E · DRY

| Project | Peer AI | How they relate |
|---|---|---|
| **D1** A component file is at most 150 lines | **REACT-03** (150), **TS-08** (400), **CODE-10** | **The overlap that caused the fault above.** Both limits are `peer-ai/max-lines`; both are deferred until **ITEM-2** |
| **D2** At most 7 props | **CODE-10** | Peer AI asks whether size prompts a question; **the number 7 is the project's**, and nothing automated checks it |
| **D3** A component fetches or renders, never both | **FE-05** | The same rule |
| **D4** Only a screen knows about navigation | **FE-06** | The same rule |
| **E1** The third duplicate extracts | **CODE-04** | The same rule — Peer AI calls it the rule of three |
| **E2** Money and validation extract on the first repeat | **CODE-05** | **The same rule, and both give the same reason:** rules that must never disagree are shared immediately, not on the third copy |

### F · Styling and the design system

| Project | Peer AI | How they relate |
|---|---|---|
| **F1** Zero inline style objects | **DES-01** | Peer AI says design values come from tokens; the project bans the mechanism. Still **not yet** enforced here — `Rail`'s computed width is a real exception needing an allowlist |
| **F2** Zero hard-coded colours | **DES-01** | The same rule; enforced by a selector that rejects a hex literal |
| **F3** Tokens come from one source | **DES-02** | The same rule. Tailwind's theme is replaced rather than extended, so there is nothing else to reach for |
| **F4** Token names are semantic | **DES-03** | The same rule, with the same examples |
| **F5** Screens compose `ui/` primitives | **DES-04** | The same rule |
| **F6** Every primitive ships every state | **DES-05** | The same rule |
| **F7** The danger colour is reserved | **DES-06** | The same rule. **What it means here is the addendum's**: money going wrong, nothing else |

### G · Types

| Project | Peer AI | How they relate |
|---|---|---|
| **G1** `strict: true`, `any` is an error | **TS-01**, **TS-02**, **CODE-14** | The same rules, and all three block |
| **G2** API types generated from the contract | **API-02** | Same idea. Here the contract *is* `packages/core/src/types.ts`, so there is nothing to generate from — the document is derived from the types instead |
| **G3** Discriminated unions, never boolean soup | **CODE-13** | The same rule — Peer AI's wording is that impossible states can't be written down |
| **G4** No assertions across a data boundary | **SEC-06**, **TS-03** | Same idea. `TS-03` blocks the `!` operator in source; the schema check at the import boundary is **still owed** |

### H · Money — non-negotiable

| Project | Peer AI | How they relate |
|---|---|---|
| **H1** Integer minor units | **MONEY-01** | The same rule. **Kobo is the project's choice** of unit |
| **H2** Formatted in exactly one place | **MONEY-04** | The same rule; `MoneyText` is that place and a selector enforces it |
| **H3** No money arithmetic in a component | **MONEY-05** | The same rule. Review-only on both sides |
| **H4** Every money path tested before merge | **MONEY-10** | The same rule; the coverage **gate** is still owed |
| **H5** Positive amounts, direction from the type | **MONEY-06** | The same rule, enforced at runtime by `transactionSchema` |

### I · Safety-critical data

| Project | Peer AI | How they relate |
|---|---|---|
| **I1** Structural data, never free text | **SAFE-03** | The same rule |
| **I2** Shown where the decision is made | **SAFE-05** | The same rule |
| **I3** Its gates block, they do not warn | **SAFE-01** | The same rule |
| **I4** Any change ships with a test of the display path | **SAFE-06** | The same rule |

### J · Accessibility

| Project | Peer AI | How they relate |
|---|---|---|
| **J1** 44px targets | **DES-15** | Same rule; **44px is the project's number** |
| **J2** Every interactive element labelled | **DES-08**, **DES-09**, **REACT-05**, **REACT-06** | Same rule, four ways; the two REACT rules block in lint |
| **J3** `prefers-reduced-motion` honoured | **DES-16** | The same rule, enforced globally in `tokens.css` |
| **J4** WCAG AA contrast in both themes | **DES-13** | The same rule. Measured at the design stop; the script is **still owed** in CI |
| **J5** Keyboard end to end | **DES-10**, **REACT-07** | Same rule; the Playwright journey is **still owed** |

### K · Testing

| Project | Peer AI | How they relate |
|---|---|---|
| **K1** The core journey is the acceptance test | **TEST-02** | The same rule. **Which journey is the addendum's** |
| **K2** `core/` tested exhaustively with plain values | **TEST-03** | The same rule |
| **K3** By role and label, never test id | **TEST-04** | The same rule |
| **K4** A check is seen failing before it is trusted | **TEST-09** | **The same rule, word for word in effect** — the project's signature principle is also Peer AI's, which is the clearest sign the two rulebooks come from the same place |

### L · Errors, loading, offline

| Project | Peer AI | How they relate |
|---|---|---|
| **L1** Loading, empty and error handled explicitly | **FE-07** | The same rule |
| **L2** A message says what happened and what to do | **FE-08** | The same rule |
| **L3** No swallowed errors | **CODE-11**, **TS-04** | The same rule; `TS-04` blocks an empty catch in lint |
| **L4** Offline is a state, not an error | **FE-09** | The same rule, and **high severity on both sides** |

### M · Data safety · N · Dependencies · O · Naming

| Project | Peer AI | How they relate |
|---|---|---|
| **M1** No real figures anywhere | **PRIV-02** | The same rule. Repo rule 2 is the project's version and the `repo rules` job enforces it |
| **M2** No telemetry | **PRIV-01**, **PRIV-03** | Same direction. **The project goes further**: Peer AI says collect only what is needed; here the answer is nothing at all |
| **M3** Export and import round-trip exactly | **REL-08**, **DATA-03** | Same idea. `REL-08` is about the device holding the only copy, which is exactly why the round-trip matters here |
| **N1** Every dependency justified | **DEL-02** | The same rule |
| **N2** Versions pinned, lockfile committed | **DEL-01** | The same rule, and **now checked by two tools**: `npm ci` fails on a mismatch, and osv-scanner reads the lockfile daily |
| **N3** One pinned Expo SDK, recorded in an ADR | — | **No Peer AI equivalent.** Project-specific and dormant: `apps/mobile/` is v2 |
| **O1** Files are kebab-case | — | **No Peer AI equivalent.** `scripts/check-naming.mjs` is the project's own enforcement |
| **O2** Booleans read as assertions | **CODE-02** | The same rule, with the same examples |
| **O3** Say what it is | **CODE-01** | The same rule |
| **O4** The user's vocabulary, British English | **CODE-03** | The same rule. **British English is the project's** |

### Read the other way: what Peer AI adds that this project never wrote down

This matters as much as the overlap, because these are rules nobody here chose and
everybody here is now held to. Each applies today unless marked.

- **TypeScript, and all of it blocking:** **TS-05** every promise awaited or handled,
  **TS-06** nesting at most 3 deep, **TS-09** a switch over a union handles every case,
  **TS-10** a catch checks what it caught.
- **React:** **REACT-01** hooks called the same way every render, **REACT-04** no outside
  HTML into the page, **REACT-10** an effect stops what it starts, **REACT-11** a hook is
  never passed around as a value. **REACT-09** long lists draw only what is on screen —
  not yet relevant, and the reason is written in `docs/engineering-notes/`.
- **Code quality:** **CODE-06** a deliberate copy names its twin, **CODE-07** a function
  does one thing, **CODE-08** comments explain why, **CODE-09** deep nesting becomes early
  returns, **CODE-12** catching every error needs a reason, **CODE-15** edge cases are
  handled, **CODE-16** the framework's own rules are kept.
- **Design and accessibility:** **DES-07** never colour alone, **DES-11** focus always
  visible, **DES-12** dragging always has an alternative, **DES-14** text follows the
  person's text size.
- **Testing:** **TEST-01** a bug fix ships with the test that would have caught it,
  **TEST-05** tests state what they need, **TEST-07** no test depends on another's
  leftovers, **TEST-08** security-sensitive code has abuse tests, **TEST-12** tests run
  the code the build ships.
- **Reliability and performance:** **REL-01** every outside call has a timeout,
  **REL-04** configuration fails closed, **REL-09** an app that caches itself still
  updates — which is the service worker, so it applies here. **PERF-01**, **PERF-05**,
  **PERF-06**, **PERF-07**.
- **Security beyond what a local-first app needs:** most of **SEC-01** to **SEC-30**
  describe a server, and are dormant for the same reason **A6** is. Four are live and
  three now have a tool: **SEC-10** no secret in code and **SEC-27** secret scanning on
  every change (gitleaks, daily), **SEC-30** nothing from outside runs as code
  (zizmor and Semgrep), **SEC-06** data from outside is checked before it is trusted —
  **the import path, which is still the weakest point and is issue #106**.
- **Money:** **MONEY-02** one authoritative value per amount, **MONEY-03** one
  implementation of money maths, **MONEY-07** the books balance. **MONEY-08**, **MONEY-09**
  and **MONEY-12** are about moving money and taking cards, which this product never does.
- **Delivery:** **DEL-03** dependencies watched for vulnerabilities, which **ITEM-11**
  answered and **ITEM-12** finishes. **DEL-06** changes reach production only through the
  pipeline. **DEL-09** packages come only from the expected registry. **DEL-11** licences
  fit how the product ships. **DEL-12** risky dependencies are chosen on purpose.
- **GitHub Actions:** **GHA-01** to **GHA-05**, added 2026-10-14 with the security
  pipeline. They are why four unpinned actions and two persisted credentials were found
  in this project's own workflow.

**Nothing here is a second standard.** Where a Peer AI rule covers ground the A–O rules
never claimed, it simply applies; where both cover the same ground, the row above says so
and `docs/standards/` wins.
