# Frontend Engineering Standards

React (web) and React Native (Expo). Reusable across projects. The rules the
codebase is held to, and how each one is checked.

**A standard nobody can check is a wish.** Every rule states its enforcement
honestly: `auto` means a linter, the compiler or CI fails the build; `review`
means a human has to look, and it will erode unless someone actually does.
Prefer `auto`. When a rule matters and cannot be automated, say so rather than
pretending.

Each project adds a short **addendum** (`docs/standards-addendum.md`) naming
its currency minor unit, its safety-critical data (if any), its pinned SDKs and
any project-only rule. This document does not change per project.

---

## A · Architecture

**A1 · Feature-first folders, not type-first.** `features/<name>/` holds that
feature's screens, components, hooks and types. No top-level `components/`,
`hooks/`, `utils/` buckets.
*Why:* code that changes together lives together, and a feature is deleted by
deleting one folder. Type-first layouts scatter one change across five
directories.
`auto` — `eslint-plugin-boundaries`

**A2 · Dependencies point inward.** `app/` → `features/` → `ui/` → `core/`.
Never the reverse, and never feature → feature.
*Why:* without this, "feature" is just a folder name and everything is coupled
to everything.
`auto` — `import/no-restricted-paths`

**A3 · `core/` is framework-free.** Domain rules, calculations and validation
are pure TypeScript with no React, no platform APIs, no storage and no network.
It is the code every client (web, mobile, scripts) shares, and it is tested with
plain values.
`auto` — lint rule forbidding framework and platform imports in `core/`

**A4 · Data access sits behind an interface.** Screens call a repository or
API client, never a storage engine or `fetch` directly. Swapping local storage
for an API, or one API for another, touches one folder.
`auto` — restricted imports outside `data/`

**A5 · A feature exposes a public surface through its `index.ts`.** Nothing
imports another feature's internal file. No app-wide barrel re-exporting
everything.
*Why:* it makes the boundary real, so internals can be refactored freely;
app-wide barrels defeat tree-shaking and create import cycles.
`auto` — lint rule

**A6 · Every request carries its session scope explicitly.** Where a backend
distinguishes audiences (customer app vs staff app, tenant, workspace), the
client sends which one it is on every sign-in and never relies on the server
to infer it.
*Why:* inference prefers the most privileged option and fails silently, much
later, as permission errors nobody can trace.
`review`

---

## B · State

**B1 · Server state is not client state.** Anything that came from an API or
persistent store lives in the query layer (TanStack Query) and is read from
there. It is never copied into `useState`.
*Why:* copies go stale, duplicate requests and race on fast navigation.
`auto` — lint rule banning fetches inside `useEffect`; `review` for copying

**B2 · No data fetching in `useEffect`. Ever.**
*Why:* it has no caching, no deduplication, no cancellation, and races on
unmount.
`auto`

**B3 · Derived values are derived, never stored.** Totals, counts, statuses
that follow from other data are computed by `core/` on read. Storing a derived
value is how two screens disagree.
`review`

**B4 · Genuinely global client state uses one store.** One store (Zustand),
sliced. Everything else is local to the component or feature.
`review`

**B5 · Context is for stable, rarely-changing values.** Theme, session,
locale. Never for values that change on every keystroke.
*Why:* every consumer re-renders when a context value changes.
`review`

---

## C · Prop drilling — with a number

**C1 · A prop may pass through at most two intermediate components.** At the
third, fix it.
*Why:* "no prop drilling" is unenforceable because nobody agrees where it
starts. Two is countable in a diff.
`review` — countable, so the review is objective

**C2 · Fix drilling with composition first, context second, store third.** Pass
JSX as `children` or named slots before reaching for a provider.
*Why:* most drilling is a layout problem, not a state problem.
`review`

---

## D · Components

**D1 · A component file is at most 150 lines.** Over that it is doing two
things. `auto` — `max-lines`

**D2 · A component takes at most seven props.** More means split it, or take
composition instead of configuration. `auto` where the linter allows, else
`review`

**D3 · A component either fetches or renders — not both.** Data access lives
at the screen boundary; everything below receives what it needs.
*Why:* it makes the rendering layer trivially testable.
`review`

**D4 · No component knows about navigation unless it is a screen.** Pass
callbacks down; never import the router or navigator into a leaf.
`auto` — restricted import

---

## E · DRY — and where it stops

**E1 · Rule of three.** Duplicate once without comment. Duplicate twice and
note it. On the third occurrence, extract.
*Why:* premature abstraction costs more than duplication. A wrong shared
component is harder to remove than three similar ones.
`review`

**E2 · Rules are exempt from the rule of three.** Money arithmetic, validation,
permission checks, and anything the addendum names as safety-critical —
extract on the *first* repeat.
*Why:* duplicated logic drifts, and when the thing that drifts is money or
safety, the cost is not a refactor.
`review`

---

## F · Styling and the design system

**F1 · Zero inline style objects.** No `style={{ ... }}` literals.
`auto` — `no-inline-styles`

**F2 · Zero hardcoded colours, spacing, radii or font sizes.** Tokens only.
`auto` — CI regex for hex literals and magic numbers in style position

**F3 · Tokens come from one source.** `design/tokens.*`, framework-agnostic,
consumed by every client. Light and dark palettes, type scale, spacing scale,
radii, elevation.
`auto` — lint rule restricting style values to token imports

**F4 · Token names are semantic, never literal.** `color.surface`,
`color.accent`, `color.danger`, `space.4` — not `blue500`, `gray100`.
*Why:* semantic names survive a rebrand and a dark theme; literal ones do not.
`review`

**F5 · Screens compose only `ui/` primitives.** Button, Input, Select, Card,
Sheet/Modal, StatTile, ProgressBar, Badge, Tabs, Toast, EmptyState, Table. A
screen that needs a new primitive adds it to `ui/` with all its states, not
inline.
`auto` — lint rule restricting raw element usage in `features/`

**F6 · Every primitive ships with its states.** Default, hover/pressed,
focused, disabled, loading, error, and (where relevant) empty. A primitive
without states is not finished.
`review`

**F7 · Danger colour is reserved for its meaning.** The addendum names what it
means in this project (a safety signal, money going wrong). Never decorative,
never a generic error.
*Why:* diluting a signal teaches users to ignore it.
`auto` where the token import can be restricted; else `review`

---

## G · Types

**G1 · `strict: true`, and `any` is an error.** Use `unknown` and narrow.
`auto` — tsconfig + `no-explicit-any`

**G2 · API types are generated from the contract, never hand-written.** The
backend publishes a spec; the client generates from it; CI regenerates and
fails if the committed output differs.
*Why:* generated types cannot drift from the contract. Hand-written ones are a
copy that silently rots.
`auto`

**G3 · Model state as a discriminated union, not boolean soup.**
`{ status: 'loading' } | { status: 'error'; error } | { status: 'ready'; data }`
rather than `isLoading` + `isError` + `data`.
*Why:* the union makes impossible states unrepresentable.
`review`

**G4 · No type assertions (`as`) across a data boundary.** Parse and validate
(schema) instead — for API responses, stored data and imported files alike.
`auto` — lint rule, with an allowlist requiring a comment

---

## H · Money — non-negotiable

**H1 · Money is an integer in minor units.** Never a float, ever, at any layer.
The addendum names the unit (pence, kobo, cents).
`auto` — branded type; float arithmetic on it fails to compile

**H2 · Money is formatted in exactly one place.** One `formatMoney` used
everywhere.
`auto` — restricted import

**H3 · No arithmetic on money inside a component.** Totals come from the
server or from a tested pure function in `core/`.
`review`

**H4 · Every money path has a test before it merges.**
`auto` — coverage gate on the money modules

**H5 · Amounts are positive; direction comes from a type.** A movement is
`{ amount, type }` — income, expense, transfer, payment — never a signed number.
`auto` — schema validation

---

## I · Safety-critical data

The addendum names what is safety-critical in this project (allergens, medical
values, legal deadlines, anything where a wrong display hurts someone). Where
nothing is, this section is empty. Where something is:

**I1 · It is structural data, never free text.** The system can reason about
it.
`review`

**I2 · It is shown where the decision is made — never behind a disclosure,
tab or scroll-to-reveal.**
`review`

**I3 · Its gates block; they do not warn.** A dismissible warning is not a
gate.
`auto` — test

**I4 · Any change touching it ships with a test proving the display path
still works.**
`review` — no exceptions

---

## J · Accessibility

**J1 · Touch targets ≥44px** (larger where the addendum says so — e.g.
operational surfaces used with gloves). `auto` — lint rule on touchables
**J2 · Every interactive element has an accessible label.** `auto`
**J3 · `prefers-reduced-motion` is respected by every animation.** `auto`
**J4 · Contrast meets WCAG AA in every theme.** `auto` — token-level test
**J5 · Keyboard-only use works end to end (web).** `review` + E2E

---

## K · Testing

**K1 · The core journeys are the acceptance criteria.** Each project's
addendum lists them (onboard → … → done). Each must pass before its area is
called done; a rewrite must pass the previous product's journeys.
`auto` — E2E suite in CI

**K2 · `core/` is tested exhaustively with plain values.** Every rule has a
test naming the case, including boundaries.
`auto` — coverage gate

**K3 · Test behaviour, not implementation.** Query by role and label, never by
test id where a real accessible query exists.
`review`

**K4 · A bug fix ships with the test that would have caught it.** `review`

---

## L · Errors, loading and offline

**L1 · Every async surface handles loading, empty and error explicitly.** An
infinite spinner is a bug.
`review`

**L2 · An error message says what happened and what to do next.** No bare
"Something went wrong".
`review`

**L3 · No swallowed errors.** No empty `catch`. `auto`

**L4 · Offline is a state, not an error.** The app says it is offline, keeps
what the user did, and reconciles when back. Nothing typed is lost.
`review` + E2E

---

## M · Data safety and privacy

**M1 · No real personal or financial data in the repository.** Fixtures,
seeds, screenshots and tests use invented data kept in `docs/seed-data.md`.
`review` + secret scanning in CI

**M2 · Nothing leaves the device without a stated reason.** Analytics and
telemetry are opt-in and documented; none by default.
`review`

**M3 · Export/import round-trips exactly** where the product offers it.
`auto` — round-trip test

---

## N · Dependencies

**N1 · A new dependency is justified in the pull request** — what it does, why
not the platform, what it weighs.
`review`

**N2 · Versions are pinned and the lockfile is committed.** Never `@latest`.
CI verifies supply-chain policy.
`auto`

**N3 · Mobile targets one pinned Expo SDK, recorded in an ADR.** Create with
`--template blank-typescript@sdk-<n>`, install Expo packages with
`npx expo install`, name the SDK in `package.json`. Before relying on Expo Go,
check which SDK each store's Expo Go carries; expect iOS to need a development
build when the App Store lags.
*Why:* "whatever is newest today" is not a version.
`review`

---

## O · Naming

**O1 · Files kebab-case. Components PascalCase. Hooks `useThing`.** `auto`
**O2 · Booleans read as assertions:** `isOpen`, `hasError`, `canSubmit`. `auto`
**O3 · Say what it is.** `amountMinor` not `amt`; `cycleStartDate` not `csd`.
`review`
**O4 · Name things as the user would.** A person manages *notifications*, not
*webhook config*. Component and token names use the same vocabulary as the
screens.
`review`

---

## What this document is not

It is not a style guide — Prettier and ESLint own formatting. It is not the
architecture; that comes out of the Architect phase. **Every `review` rule is a
promise that a human will actually check.** If that stops happening, automate
the rule or delete it. A standard that is documented and unenforced is worse
than no standard.
