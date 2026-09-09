---
description: Frontend coding standards for web application projects
globs: src/**/*.{ts,tsx,js,jsx,vue,svelte}, app/**/*.{ts,tsx,js,jsx,vue,svelte}
alwaysApply: true
---

# Frontend Standards

You are working on a frontend application. Adapt these standards to the project's framework (React, Vue, Svelte, Next.js, Nuxt, SvelteKit, etc.) and toolchain.

## The rulebook is `docs/standards/` — it wins on any conflict

`docs/standards/frontend-engineering-standards.md` and
`docs/standards/standards-addendum-mizaniya.md` are authoritative for this
project. This file is a generic starter kept for the ground the standards do
not cover. Where the two disagree, the standards win and this file is the one
that is wrong.

Rules are referenced **by section number, never copied in** — a copy drifts,
and then nobody knows which is current.

| Concern | Standard |
|---------|----------|
| Architecture, folder layout, the data seam | **A1–A6** |
| State, derived values | **B1–B5** |
| Prop drilling (a counted limit, not a vibe) | **C1–C2** |
| Component size, props, fetch-or-render | **D1–D4** |
| Duplication and where it stops | **E1–E2** |
| Styling, tokens, primitives, the danger colour | **F1–F7** |
| Types, schemas at every boundary | **G1–G4** |
| Money — non-negotiable | **H1–H5** + addendum (kobo) |
| Accessibility | **J1–J5** |
| Testing | **K1–K4** + addendum (core journeys) |
| Errors, loading, offline | **L1–L4** |
| Data safety and privacy | **M1–M3** + addendum (seed data, no telemetry) |
| Dependencies | **N1–N3** |
| Naming | **O1–O4** |

**Three stock rules were deleted here rather than left to argue with the
standards:**

1. The **type-first `pages/components/hooks/services/utils/` layout**. A1 is
   feature-first (`features/<name>/` holds its own screens, components, hooks
   and types) and A2 fixes the dependency direction `app/` → `features/` →
   `ui/` → `core/`. A3 keeps `core/` framework-free; A4 puts data access behind
   a `Repository` in `data/`; A5 makes `index.ts` the feature's public surface.
2. **"Build with mock data first"** and the simulation-mode toggle. There is no
   server in v1 — the `Repository` interface *is* the seam (A4), and the local
   IndexedDB implementation is the real thing, not a stand-in. Fixtures come
   from `docs/seed-data.md` (M1).
3. The **`src/services/` API-client layer**. A4 again: screens call the
   repository, never a storage engine or `fetch`.

## Component rules
- Functional components only (or framework-equivalent -- SFCs in Vue, components in Svelte)
- Destructure props in the function signature
- Extract business logic into custom hooks/composables
- Components should be purely presentational where possible
- One component per file (exception: small, tightly coupled sub-components)

## Data access
- Screens call the `Repository` from `data/`, never a storage engine, `fetch` or `axios` directly — **A4**
- Every repository method is typed, and data crossing the boundary is parsed with a schema, never asserted with `as` — **G4**
- Server state, when v3 adds it, lives in the query layer and is never copied into `useState` — **B1**, **B2**

## State management
- Local state for component-specific UI state
- Framework context/stores for shared state that doesn't change often (auth, theme, user role)
- Consider a dedicated state library (Zustand, Pinia, Redux, Svelte stores) only if context becomes unwieldy

## Performance
- Lazy load routes (React.lazy + Suspense, dynamic imports in Vue/Svelte, etc.)
- Use framework-appropriate memoization only when profiling shows unnecessary re-renders
- Don't optimize prematurely -- measure first

## Role-based access
- Check user role before rendering protected sections
- Hide navigation items the user's role can't access
- Never rely on frontend-only access control -- backend must enforce too

## Responsive design
- Mobile-first approach
- Breakpoints: mobile (<768px), tablet (768-1199px), desktop (1200px+)
- Test at all three breakpoints before marking a page complete

## Design quality
- After a page works, run a design-quality pass before calling it done: layout & spacing (consistent scale, clear hierarchy), typography (consistent type scale/weights), responsive (all breakpoints), edge cases (long strings, empty/slow/failed data), and motion (intentional, not janky). See `peer-ai/frontend/03-build.md` step 9.
- Prefer shared components and design tokens over copy-pasted variants and hardcoded values.
- When a mockup and the API contract disagree, follow `peer-ai/shared/design-data-contract.md`.

## Error/loading/empty states
- Every page that fetches data must have:
  - Loading state (skeleton or spinner)
  - Error state (user-friendly message + retry button)
  - Empty state (helpful message, not just blank)

## Forms and validation
- Client-side validation for immediate feedback (required fields, format, length, range)
- Server-side validation is the source of truth -- always handle API validation errors
- Show inline field-level errors, not just a single top-level message
- Handle dirty state (warn before navigating away from unsaved changes)

## Testing
- Unit tests for utility functions and hooks/composables
- Component tests for critical UI (Testing Library, Vue Test Utils, etc.)
- E2E tests for key user flows (Playwright, Cypress)
- Form tests: validation rules, inline errors, dirty-state warnings, submit behavior
- Accessibility tests: automated axe-core audits, keyboard navigation, focus management
- i18n tests: fallback language rendering, locale switching, no raw translation keys in UI (if i18n is set up)
- Test file naming consistent with project convention (`.test.ts` or `.spec.ts`)
- Coverage targets enforced in CI

## Accessibility
- Target WCAG 2.1 AA compliance
- Use semantic HTML elements (buttons, links, headings, landmarks)
- Keyboard navigation must work for all interactive elements
- Focus management on route changes and modal open/close
- Color contrast meets AA ratio (4.5:1 for normal text, 3:1 for large text)
- Use ARIA attributes only when native semantics are insufficient

## Internationalization (i18n)
- If multi-language is required: use a library (react-i18next, vue-i18n, etc.)
- If not required yet: avoid hardcoding user-facing strings where feasible
- Translation keys use dot-notation namespacing (e.g. `dashboard.header.title`)

## Analytics and tracking
- All analytics calls go through a dedicated analytics service, not scattered in components
- Event naming uses consistent convention (e.g. snake_case: `page_view`, `button_click`)
- Respect user privacy preferences and cookie consent requirements

## Feature flags
- If feature flags are in use: wrap conditional UI in a flag check component or utility
- Flag naming uses consistent convention
- Remove flags promptly after full rollout

## CI/CD integration
- Pipeline must pass before merge: lint, type-check, test, build
- Bundle size monitoring where applicable
- Automated accessibility checks (axe-core, eslint-plugin-jsx-a11y, or equivalent)
