# Household money app — product brief and Peer AI kick-off

Working name to decide (section 2). Built from the Excel tracker's logic, scoped so v1 ships in weeks, not months. Everything in this document is safe to commit to a public repo: it contains no real figures.

---

## 1. My view on your four questions

**Design system — yes, but a small one, and before the first screen.** You're right that without it the build drifts and every screen re-invents buttons. The fix is not a big design-system project; it is one `tokens` file (colour, type scale, spacing, radius, elevation) plus about twelve primitives (Button, Input, Select, Card, Sheet/Modal, Table row, Stat tile, Progress bar, Badge, Tabs, Toast, Empty state) built once with Tailwind, and a rule in Peer AI's Shared Rules phase that screens may only use those primitives. That is a day of work and it is exactly what a client-facing case study should show. The brief below tells the agent to do this in the Shared Rules phase, not later.

**Learn from other trackers — the four ideas worth stealing.** From YNAB: zero-based budgeting, "give every naira a job", which your sheet already does with its Unallocated Income line — keep that as the core mechanic. From Goodbudget: envelopes with rollover, which is your Food Fund Rollover generalised to any category you choose. From Figur and your own sheet: debt as a first-class object with a schedule, not a category. From Kuda/PiggyVest: lock-style "protected" savings and a salary-day cycle rather than calendar months. What none of the Nigerian apps do well is manual, honest, salary-cycle budgeting with debts in both directions, offline-first — that's the gap you're building into.

**Debts owed and owing — first-class in v1.** Your sheet only tracks money you owe. The app tracks both: *I owe* (creditor, opening balance, schedule, payments) and *owed to me* (debtor, amount, expected date, repayments, a written record). Islamically this matters — the Qur'an's longest verse (2:282) is about writing debts down — and practically it matters more in Nigeria than anywhere, because informal lending between family and friends is how most people bridge months.

**Muslim, Nigerian, and monetisable later — in that order.** v1 is for you: budgeting, debts, savings goals, zakat-awareness. Nigerian specifics are in v1 because they cost nothing (salary-day cycle, rent sinking fund, multiple savings destinations, family-support category, airtime/data, fuel). Monetisable features are listed in section 6 and deliberately kept out of the build until there are users.

---

## 2. Name

Amanah, Hisab and Mizan are all taken by existing finance apps (Amanah Budget is a direct competitor in the US). Candidates that are meaningful, short and — as of today — not obviously taken as finance apps; check the domain and both app stores before committing:

- **Mizaniya** (ميزانية — literally "budget"). Clear, says what it is, easy to pronounce in Nigeria. My first choice.
- **Kifayah** (كفاية — sufficiency, having enough). Softer, more about the goal than the tool.
- **Nafaqah** (نفقة — provision for the household). Very apt for a household app; slightly heavier word.
- **Nisab** (نصاب — the zakat threshold). Sharp, but signals a zakat app more than a budget app.
- **Wafaa** (وفاء — fulfilling obligations, settling debts). Strong if debts are the headline; common as a name elsewhere.

Recommendation: **Mizaniya** for the product, repo `mizaniya`. If it's taken, Kifayah.

---

## 3. What the Excel tracker already decided (the spec you built without knowing it)

| Sheet | Becomes | Notes |
|---|---|---|
| Setup & Guide — take-home, start month, rent target and due date, debt opening balances, emergency-fund target | **Onboarding / Settings** | Salary day and amount; annual rent target and due date; opening balances for each debt and goal |
| Monthly Budget — category × month plan, type per category (Income / Savings / Debt Payment / Expense), Unallocated income, Plan status | **Plan screen** | Zero-based: planned allocations vs planned income; unallocated shown deliberately, never hidden |
| Transactions — date, month, type, category, description, amount, payment method, notes | **Transactions** | Same fields. Month derived from date *and* salary day (see §4). Payment method list: bank transfer, cash, card, wallet |
| Dashboard — planned income, actual income, actual allocations, cash left, savings moved, debt paid, variance, food rollover; category table; goals table | **Home** | The eight KPI tiles map one-to-one to stat tiles. Category table = envelopes with variance |
| Monthly Summary — 12-month table | **Months view** | History; one row per cycle |
| Debt & Goals — goal, kind, opening/target, paid/saved, gap, due date, planned-before-due, projected gap, status | **Debts & Goals** | The projected-gap logic ("will I make rent by the due date at this rate?") is the best idea in the sheet — keep it exactly |

Two design decisions the sheet forces and the app should keep: **every movement is a positive-amount transaction with a type** (income, expense, savings transfer, debt payment — and now debt received/lent), and **actual progress only ever comes from transactions**, never from typing a number into a goal.

---

## 4. Scope

### v1 — web (React 19 + TypeScript + Vite, local-first)
1. **Onboarding**: name, currency (₦ only in v1), salary day, expected take-home, optional rent target + due date, optional emergency-fund target. Seed categories from the sheet's list; user can rename/add.
2. **Cycle, not month**: a budget period runs salary-day to salary-day. Every screen shows *days left in cycle* and *safe-to-spend per day* = (cash left − protected allocations) ÷ days left, amber below a threshold, red when negative.
3. **Plan** (zero-based): per-category planned amounts for the cycle; unallocated income banner; copy last cycle's plan.
4. **Transactions**: add/edit/delete; types income, expense, savings, debt payment, debt received, money lent, repayment received; category; payment method; note. Quick-add sheet from the home screen in three taps.
5. **Envelopes with rollover**: any category can be marked "rolls over" (food fund behaviour).
6. **Debts & Goals**: debts I owe and debts owed to me, each with counterpart name, opening amount, optional schedule, payment history and a printable/shareable one-page record; savings goals with target, due date, projected gap and status.
7. **Home dashboard**: the eight KPI tiles, category variance table, goals table.
8. **States done properly**: loading, empty (first-run), invalid input, failed save with retry, offline (local-first means it works with no network; a banner says so).
9. **Data**: local storage via IndexedDB (Dexie) behind a repository interface, so v2 can swap in an API without touching screens. Export/import JSON. Seed data script with invented numbers for screenshots and tests.
10. **Tests**: Vitest on the cycle maths, safe-to-spend, rollover, projected gap; React Testing Library on the quick-add flow.
11. **Design system**: `src/design/tokens.ts` + `src/ui/*` primitives, built in the Shared Rules phase before any screen. Muted, high-contrast palette; one accent; Naira formatting everywhere (₦1,250,000.00); dark mode from day one via tokens.

**Islamic elements in v1 (light, useful, no preaching):** a **Zakat** panel that tracks whether savings have stayed above the nisab for a lunar year and estimates 2.5% due (nisab value editable, with a note on where to look it up); **Sadaqah** and **Family support** as default categories; **debt records** written in the spirit of 2:282 (date, parties, amount, terms, witnesses field, shareable); a Hijri date shown next to the Gregorian one; no interest-bearing product suggestions, ever.

**Nigerian elements in v1:** salary-day cycles; annual **rent sinking fund** with projected gap; **savings destinations** (Cowrywise, PiggyVest, bank vault, cash-at-home) as attributes of a savings transfer; **airtime & data**, **transport/fuel**, **generator/electricity units** as seeded categories; **ajo/esusu** contribution as a savings type with a payout date; multiple bank/wallet payment methods; works offline.

### v2 — mobile (Expo / React Native, same domain logic)
Shared `core/` package (types, cycle maths, repository interface); Expo app with the same screens; local SQLite; optional sync via a small API later. This is the public React Native case study.

### v3 — when there are users (and the monetisable layer)
Bank/wallet sync via Mono or Okra (premium); household sharing (spouse view, shared envelopes); zakat report PDF; ajo group management with reminders; multi-currency with parallel-rate tracking; CSV/Excel export; backup/sync across devices. Free tier stays complete for a single user with manual entry — that's the trust that makes the paid tier sellable.

---

## 5. Repo and privacy rules (put these in CONTEXT.md on day one)
- Public repo under the PolyForm Noncommercial 1.0.0 licence (source-available: readable by anyone, commercial reuse prohibited), built in the open with Peer AI; phase commits named `peer-ai: <phase>`. Secrets never enter the repo (environment variables only, `.env` git-ignored, secret scanning in CI). The future server for sync, sharing and payments lives in a separate private repo.
- **No real financial data ever enters the repo, screenshots, seed files, issues or commit messages.** Seed data is invented (salary ₦450,000; debts to "A. Friend" ₦120,000 and "Spouse" ₦60,000; rent target ₦900,000). Your real data lives only in your own browser's IndexedDB.
- No employer or client names anywhere in the codebase or docs.
- README leads with the problem (salary gone before the month ends, debts in both directions, rent due once a year) and the screenshots, not the stack.

---

## 6. Peer AI kick-off — SUPERSEDED

The prompt below is the first draft. **Use the prompt in `Mizaniya_Kickoff_Pack.md` instead** — it carries the corrections (fast learning mode, standards folder, repo rules inline, design stop, PolyForm licence). This section is kept only for the record.

### 6 (original draft) — paste this into Claude Code in the new repo folder

```
This folder is a fresh public repo for Mizaniya (rename if I say otherwise), a household money app I am building in the open with Peer AI, which is cloned at ./peer-ai. Treat this as a real product build: follow peer-ai's phases and gate rules exactly as written, produce the documents each phase requires, and commit at the end of each phase with a message that names the phase ("peer-ai: setup", "peer-ai: understand", ...).

THE BRIEF (stakeholder's email)
"I'm a salaried professional in Lagos. My money runs out before the month does, I owe money to two people and one person owes me, and rent is due once a year in a lump sum. I have been budgeting in a spreadsheet: I plan every naira of my take-home into categories at the start of each salary cycle (rent fund, debt payments, emergency fund, personal savings, health, utilities, food and groceries which rolls over if unused, transport/data/airtime, apartment setup, miscellaneous, family support), log every movement as a positive-amount transaction with a type (income, expense, savings transfer, debt payment), and read a dashboard that shows planned vs actual income, cash left, savings moved, debt paid, variance per category, and — for rent and each debt — whether I will hit the target by its due date at the current rate. I want that as a web app I can use every day on my phone's browser, offline, that tells me at a glance how much I can safely spend per day until my next salary, and that tracks debts in both directions with a proper written record. It should be respectful of Islamic practice (zakat awareness, sadaqah, debts written down) without preaching, and fit how money actually works in Nigeria: salary-day cycles, sinking funds for annual rent, several savings destinations, ajo contributions, airtime/data as a real budget line. v1 is single-user, manual entry, local-first, React + TypeScript + Vite. A React Native version follows, so keep the domain logic in a framework-free core module."

HOW TO RUN IT
1. Read ./peer-ai/README.md and ./peer-ai/shared/ first, then tell me in plain language what SETUP will write to this folder before you do it.
2. Run SETUP. Detect Claude Code, write CLAUDE.md, CONTEXT.md and .peer-ai-state.json from the templates. Add to CONTEXT.md the five repo rules I will paste separately (public repo; no real financial data anywhere; invented seed data only; no employer or client names; README leads with the problem and screenshots). STOP and say "Setup complete." Wait for me.
3. Run UNDERSTAND against the brief. Ask me any question the brief leaves open before writing the understanding document. Then ARCHITECT (local-first; IndexedDB via Dexie behind a repository interface; a `core/` package with pure TypeScript for cycle maths, safe-to-spend, rollover, projected gap and zakat estimate; React app consuming it), SYSTEM SPEC, and API CONTRACT (define the repository interface and the JSON export/import schema as the "API" — there is no server in v1). STOP after API CONTRACT. Wait for me.
4. Run SHARED RULES. This is where the design system lives: create `src/design/tokens.ts` (colour incl. dark mode, type scale, spacing, radius, elevation), and `src/ui/` with Button, Input, Select, Card, Sheet, StatTile, ProgressBar, Badge, Tabs, Toast, EmptyState, Table. Naira formatting utility. Rule: screens may only use these primitives. STOP and show me the primitives rendered in a scratch page. Wait for me.
5. PAGE SPECS for: Onboarding, Home, Plan, Transactions (+ Quick Add sheet), Debts & Goals (+ debt record view), Months, Settings. Each spec lists its loading, empty, error, offline and success states explicitly.
6. BUILD in this order, one commit per screen: core maths with Vitest tests first; Onboarding; Home; Quick Add; Plan; Transactions; Debts & Goals; Months; Settings; export/import; seed script with invented data. Keep it small; anything not in the brief goes into docs/backlog.md, not into the code.
7. Run the CODE REVIEW agent and the SECURITY AUDIT agent from ./peer-ai/agents/ on the build; show me their findings; fix what they flag; then TESTING and DOCUMENTATION phases. README structure: problem, screenshots, features, how it works (cycles, envelopes, debts, projected gap), running locally, roadmap (v2 Expo, v3 sync/sharing), licence.
8. Update CONTEXT.md and .peer-ai-state.json as the workflow requires at every stop.

RULES
- Follow peer-ai's phase order and gates; never skip a document a phase requires; if a phase instruction is ambiguous or broken, tell me exactly where — I maintain peer-ai.
- No real financial figures anywhere. If you need numbers, use the seed values in docs/seed-data.md.
- No employer, client or third-party project names in code, comments, docs or commits.
- Accessibility: keyboard navigable, visible focus, 4.5:1 contrast, labels on every input. Mobile-first at 360px; must also be right at 1440px.
- British English in all copy and docs.
```

---

## 7. First-week plan
Day 1: create the repo, clone peer-ai in, run SETUP → API CONTRACT (steps 1–3), decide the name. Day 2: SHARED RULES / design system (step 4) and page specs. Days 3–5: core maths + Onboarding + Home + Quick Add. Weekend: Plan, Transactions, Debts. Week 2: Months, Settings, export/import, agents, tests, README with screenshots. Then it goes onto the Upwork portfolio and the GitHub pins, and v2 (Expo) starts.

Sources consulted for the landscape: [halalwallet.us — halal budgeting apps 2026](https://www.halalwallet.us/blog/best-halal-budgeting-apps-muslim-families-2026), [Amanah Budget](https://amanahfund.com/), [mycoupontap — budgeting apps in Nigeria 2026](https://mycoupontap.com/budgeting-apps-in-nigeria/), [Hisab app (Play Store)](https://play.google.com/store/apps/details?id=com.khata.hisab&hl=en_IN).
