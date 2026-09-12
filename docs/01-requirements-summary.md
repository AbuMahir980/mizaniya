# Requirements Summary

## Project

**Mizaniya v1 — local-first household money app for salary-cycle budgeting**

| Field | Value |
|-------|-------|
| **Date** | 2026-09-10 |
| **Author** | Qudus Lawal, with Peer AI (UNDERSTAND phase) |
| **Phase** | 1 · Understand |
| **Status** | Agreed. Fourteen domain decisions (D1–D14) settled with the stakeholder on 2026-09-10. |

---

## Inputs received

- [x] **Stakeholder brief** — the email quoted in `docs/Mizaniya_Kickoff_Pack.md` §3 and `docs/product-brief.md` §6
- [x] **Product brief** — `docs/product-brief.md` (§1–5 authoritative; §6 superseded)
- [x] **Kick-off pack** — `docs/Mizaniya_Kickoff_Pack.md`, the instructions this build actually runs on
- [x] **Engineering standards** — `docs/standards/` (frontend, backend, addendum)
- [x] **Seed data** — `docs/seed-data.md`, the only figures permitted anywhere
- [x] **Existing system** — the stakeholder's Excel tracker, mapped sheet-by-sheet in `docs/product-brief.md` §3
- [ ] Screenshots / mockups — **none yet.** Produced after PAGE SPECS, arriving in `docs/design/`

---

## What is being built

A local-first web app for one salaried person in Lagos to run their money on **salary-day cycles** rather than calendar months. It is the logic of a working Excel tracker made usable daily on a phone.

Every naira of take-home is planned into categories at the start of a cycle. Every movement is recorded as a **positive-amount transaction with a type**. A dashboard answers one question at a glance: *how much can I safely spend per day until my next salary?* Debts are tracked in **both directions** with a written record. Rent, which falls due once a year as a lump sum, is funded through a sinking fund that reports whether the current rate will reach the target in time.

It works without a network because it has no network.

## Who are the users

**One: the owner.** A single audience for v1 and v2 — no roles, no permissions, no login. Household sharing arrives in v3 and is what introduces a second role; the addendum records `OWNER`/`MEMBER` as the audiences from that point.

## What systems are involved

| Layer | v1 | Later |
|---|---|---|
| Client | React 19 + TypeScript + Vite, mobile-first at 360px, correct at 1440px | v2 Expo / React Native, same `core/` |
| Domain logic | `core/` — framework-free TypeScript: cycle maths, safe-to-spend, rollover, projected gap, zakat estimate, money in kobo | unchanged, shared |
| Storage | IndexedDB via Dexie, behind a `Repository` interface | v2 SQLite, v3 API-backed — same interface |
| Transport | **None.** No server, no accounts, no third-party services, no telemetry | v3 sync API, separate private repo |
| Portability | JSON export / import | v3 sync |

## What problem does this solve

"My money runs out before the month does" is three separate failures, and no bank app fixes any of them:

| Failure | Why the bank app cannot help |
|---|---|
| **No daily signal** | It shows your balance. It cannot tell you whether that balance is *on track* with eleven days still to go. |
| **Debts in both directions** | They live in memory and WhatsApp. Nothing says whether you are on schedule, and nothing is written down in a form either party would accept later. |
| **Rent once a year** | A monthly view structurally cannot answer "will I have ₦900,000 by 1 March at this rate?" |

Success is the owner opening the app daily, trusting the safe-to-spend figure enough to act on it, and reaching 1 March with the rent money present.

---

## Settled domain decisions

Fourteen decisions, settled with the stakeholder on 2026-09-10. **D1–D7** answer what
the brief left open; **D8–D14** answer the clarification questions this phase
raised. Each shapes `core/` or the screens, so each is recorded with its
reasoning and the option rejected — a decision without its rejected alternative
is just an assertion, and the next person cannot tell whether it was considered
or stumbled into.

### D1 · "Protected" allocations are derived from category type, with a per-category override

Safe-to-spend subtracts protected allocations. Protection is **derived from the category's type** — anything that is not an `Expense` is protected — and any single category may be overridden by the user.

**Rule:**

```
protected = Σ max(planned − actual, 0) over protected categories
```

The subtraction is of allocations **planned but not yet moved**. Money already transferred to the rent fund has left the account and is no longer in cash left; subtracting it a second time would double-count.

*Why:* it is correct on first run with zero configuration, which matters because the first number the app ever shows is the one that earns or loses trust. Type alone would misjudge non-discretionary expenses such as health or family support, and it would misjudge them **high** — the harmful direction — so the override exists and defaults to off.

*Rejected:* a pure user-set flag. Nothing is flagged on first run, so the app's very first figure would be its most wrong.

### D2 · Rollover carries the allowance, not the money

Unspent money in a rolling category was never spent, so it is already counted in cash left. Rollover changes only whether spending it next cycle counts as overspending.

| Figure | Source | Touched by rollover? |
|---|---|:-:|
| Cash left | transactions only | no |
| Category allowance | planned + carried forward | yes |
| What is left in each category | allowance − spent | yes |
| Safe-to-spend | cash left − protected | **no** |

*Why:* the two columns never meet, so nothing is counted twice.

*Rejected:* adding the carried amount to cash left, which would make the same naira spendable twice on paper. Also rejected: dropping rollover, which is behaviour the spreadsheet already has and which stops a frugal month feeling wasted.

*Expiry:* none in v1. The carried figure is shown as its own line on Plan, so it can never accumulate invisibly. A cap goes to `docs/backlog.md` if it becomes a problem.

### D3 · Money owed to you counts toward nothing — except possibly zakat

| Question | Counts? | Why |
|---|:-:|---|
| Safe-to-spend | No | The figure is acted on today. An IOU cannot buy food, and counting it makes the number lie high. |
| Projected gap on a goal | No | "Will I have ₦900,000 by 1 March?" must not answer *yes* on the strength of a repayment that may not arrive. |
| Zakat | **User's choice, asked once** | A different question, and one the app must not rule on. |

*On zakat:* many scholars hold that a debt reasonably expected to be recovered is zakatable. Excluding it would **understate** an obligation — the opposite of the safe direction everywhere else in the app. So the Zakat panel shows receivables as their own line with a switch, defaults to neither position, asks once, and carries the standing note that this is an estimate and not a ruling.

*Why:* the same fact answers different questions differently. Forcing one answer everywhere would be wrong in at least one place.

### D4 · Cycle boundaries are nominal, with clamping and a short early-payment window

**Short months — clamp to the last day.** A salary day of the 31st becomes 28 (or 29) February, then 31 March.
*Rejected:* rolling forward to 1 March, which leaves February with no salary day and March with two, breaking the cycle sequence. Also rejected: refusing to accept days 29–31 at onboarding — people genuinely are paid on the 31st.

**Weekends and early payment — the boundary stays on the nominal day.** Income arriving **up to 3 days before** a cycle begins is attributed to that cycle.

*Why:* if the boundary followed the actual payment, logging a salary two days late would silently rewrite the cycle — days left, safe-to-spend and every what is left would change, and yesterday's figure would become retroactively wrong with nothing to announce it. A budget that edits its own history cannot be trusted.

*Rejected:* a boundary that follows the actual income transaction.

**Note on the asymmetry.** Only *early* payment needs a rule. Payment that arrives late is already inside the cycle that has begun, so it needs no handling at all.

**Early-month salary days.** The design is a day-of-month setting, so a salary day of the 1st to the 10th needs no special case; the 25th in the seed data is only seed data. Two consequences are worth stating because they are invisible otherwise:

1. **The cycle almost coincides with the calendar month.** A cycle running 3 September – 2 October is "September" to a human but contains two calendar months. Every cycle is therefore labelled by its **start date**, never by a bare month name, and the Months view follows the same rule.
2. **Paid on the last working day of the previous month** — 1 March falling on a Sunday, paid Friday 28 February — is one day early and is caught by the same 3-day window.

**If the actual payday genuinely varies** across a spread of days, the nominal day is the contractual or usual one and the early window absorbs the rest. The window is a setting, not a constant, so it can be widened without touching the maths.

### D5 · The projected gap counts paydays, not cycles

```
projected = saved so far + (paydays remaining on or before the due date × planned contribution)
gap       = target − projected
```

*Why:* money does not accumulate in a smooth trickle. It arrives in lumps, on payday. The only honest question is how many more paydays fall on or before the due date.

*Rejected:* pro-rating a part cycle, which models a flow that does not exist and would count a contribution not yet made. Also rejected: counting only whole cycles, which in the seeded case discards the payday of 25 February — one that really does land before 1 March — and raises a false alarm. False alarms are cheap once and corrosive twice.

### D6 · The zakat lunar year is asked for, not assumed

The Zakat panel asks once: *when did you last pay zakat, or when did your savings last pass the nisab?* If the answer is unknown, it falls back to the first record in the database **and says so on the panel**: "Tracking from [date], your first record. Estimate only."

*Why:* the hawl start is a fact the owner knows and the app never can. Assuming it silently would produce a confident due date built on nothing, and nothing in the system could detect the error.

*Rejected:* silently starting at the first record. Also rejected: omitting hawl tracking from v1, which is what makes the panel more than a calculator.

**Nisab** remains user-editable with a note on where to check the current value, because a local-first app has no price feed.

### D7 · Debt transaction types are renamed to plain speech

`debt received` and `repayment received` are both money in and differ by one word. Frontend standard **O4** requires the user's own vocabulary. The four debt events become:

| Type | Meaning | Cash | Balance |
|---|---|:-:|---|
| **I borrowed** | someone lent me money | in | I owe more |
| **I repaid** | I paid a creditor | out | I owe less |
| **I lent** | I lent someone money | out | owed to me, more |
| **They repaid me** | a debtor paid me back | in | owed to me, less |

With `income`, `expense`, `savings-in` and `savings-out`, that is **eight**
transaction types, every one carrying a positive amount.

### D8 · Home is ranked, not a grid of eight tiles

The spreadsheet's eight dashboard figures do not become eight equal tiles. On a
360px screen that is the spreadsheet rendered smaller. They become a hierarchy:

| Level | Element | Content |
|---|---|---|
| 1 | **Hero** | *Safe to spend today* — the largest figure on the screen, with cash left and days remaining beneath it. Amber below the threshold, red when negative |
| 2 | **Four tiles** (2×2 mobile, one row at 1440px) | **Cash left**, **Income** (actual vs planned — did the salary land?), **Saved**, **Debt paid**. Each carries a progress bar against plan and taps through to its detail |
| 3 | **Conditional banner** | *Unallocated* — a call to action, not a metric. Hidden entirely when it is ₦0 |
| 4 | **Two tables** | What is left in each category, and goals with projected gap |

**Food rollover is not a tile.** It is a property of one category and belongs on
that category's row.

*Why:* the screen must answer one question before it answers any other. A tile
that permanently reads ₦0 teaches the owner to stop looking at that part of the
screen, so the unallocated figure appears only when it needs action. Tapping
through is the thing a spreadsheet cannot do, so every tile is a route into its
own detail rather than a dead end.

*Rejected:* eight equal tiles, which preserves the spreadsheet's flatness and
gives the most important number in the app no more weight than the least.

### D9 · Ajo is two different things, and the rotating kind is a debt

**Personal target ajo** — saving alone towards a target, then withdrawing — is a
savings goal. The withdrawal is a savings transfer in the opposite direction.
*Move to savings* and *Take from savings* are therefore **two movement types**,
not one type with a direction flag. Standard **H5** is explicit that direction
comes from the type, and to the owner these are two different actions. This
corrects an earlier draft of this decision, which proposed a direction field —
see `docs/04-api-contract.md` §3.

**Rotating ajo / esusu** — a group where each member contributes monthly and one
member collects the whole pot in turn — **is not savings at all.** In the months
before your turn, your contribution goes to another member and comes back only
when your turn arrives; that is lending. On your payout month you receive far
more than you have contributed, because the members who have not yet collected
are effectively lending to you.

It is therefore **a debt record that crosses zero**, with one counterparty named
*Ajo — [group]*:

| Stage | Transaction type | Balance with the group |
|---|---|---|
| Before your turn | **I lent** | owed to you, growing |
| Your payout month | **They repaid me** (clears the receivable) + **I borrowed** (the remainder) | swings to owed by you |
| After your turn | **I repaid** | owed by you, shrinking |

*Why:* it uses D7's existing four types with no new concept, and it is honest
about the money. During the early months that cash is neither spendable nor
saved — calling it savings would inflate the savings figure and understate what
the owner is owed.

*Requirement this adds:* a debt record must support a balance that crosses zero,
from owed-to-you to owed-by-you, without becoming a second record.

### D10 · Witnesses are an optional list of names

A repeatable name field, empty by default, behind one *Add witness* button.
Nothing else — no phone, no address, no signature.

*Why:* skipping it costs nothing, and using it yields a countable list the record
can lay out and print. Free text can neither be counted nor formatted. A full
contact form would make this a contract application rather than a budget one;
2:282's intent is met by recording *who*.

### D11 · The shareable debt record is a print stylesheet

`window.print()` against a dedicated stylesheet — no dependency, satisfying
standard **N1**, and no network. The browser's own *Save as PDF* produces a real
file on both platforms; on iOS it lands in the share sheet, which is how these
records are actually passed between people.

*Rejected:* generating a PDF in the app, which means a library, a bundle-size
cost and a second layout to maintain.

### D12 · Storage durability is four layers, and there is no encryption in v1

IndexedDB is not permanent (assumption A5). The response is layered:

1. **Request persistence.** `navigator.storage.persist()`, asked *after* real
   data exists rather than on first load, because browsers weigh genuine
   engagement.
2. **Report the truth in Settings.** `navigator.storage.persisted()` and
   `estimate()`, shown in plain words — whether protection was granted and how
   much space is in use. Not a green tick that means nothing.
3. **Nudge on risk, not on a timer.** Nudge by *unexported changes* ("47
   transactions since your last export"), and harder when persistence was
   refused. A nag that arrives on a schedule is a nag the owner learns to
   dismiss.
4. **Make it installable (PWA).** Installing to the home screen is the single
   largest factor in whether a browser evicts the data, and it is how a daily
   app should be opened anyway.

**No encryption at rest in v1.** The realistic threat is someone holding the
unlocked phone, and they could simply open the app. With no server there is no
password reset, so a forgotten passphrase would destroy the history permanently.
An optional app lock goes to `docs/backlog.md`. This is documented in the README
rather than left implicit.

### D13 · If the schedule slips, Months ships and Zakat waits

Neither is in the core journey (addendum K1). Months is a read of data that
already exists — cheap to build, and it is the "am I improving?" view that keeps
someone using the app.

Zakat needs the hawl date, an editable nisab, Hijri dates and a careful caveat.
It is the most conceptually loaded feature in v1 and the easiest to get subtly
wrong, and **a wrong zakat figure in a Muslim-facing app is worse than no zakat
figure at all.** It ships when it can ship correctly.

### D14 · Browser support, with iOS as the strict case

Last two versions of Chrome, Edge and Firefox on desktop and Android; **Safari
on iOS 16.4+**.

**On iOS every browser is Safari underneath** — Apple requires WebKit, so Chrome
on an iPhone is Safari with a different badge. The owner's primary device is
therefore governed by Safari's storage rules, which are the strictest of the set.
That is what makes the PWA install in D12 matter more here than it would for an
Android-first user.

Platform requirements, all met by that set with no polyfill: IndexedDB, ES2022,
and `Intl.DateTimeFormat` with the `islamic` calendar for the Hijri date.

---

## Scope table

| In scope (v1) | Out of scope (v2/v3 or never) | Unclear — needs a decision |
|---|---|---|
| Onboarding: name, ₦ only, salary day, take-home, optional rent target and due date, optional emergency-fund target, seeded categories | Bank or wallet sync (Mono / Okra) — v3, and needs the private server repo | **Still open** — the amber threshold for safe-to-spend |
| Salary-day cycles; days left; safe-to-spend per day with amber and red states | Household sharing and a spouse view — v3 | Resolved — **D8** |
| Zero-based Plan: per-category allocations, unallocated-income banner, copy last cycle | Multi-currency and parallel-rate tracking — v3 | Resolved — **D9** |
| Transactions: add, edit, delete; eight types (D7); category; payment method; note. Quick Add in three taps | Zakat report as PDF — v3 | Resolved — **D10** |
| Envelopes with rollover on any category (D2) | Ajo group management with reminders — v3 | Resolved — **D11** |
| Debts in both directions with counterpart, opening amount, optional schedule, payment history, and a shareable one-page record | CSV / Excel export — v3 | Resolved — **D12** |
| Savings goals with target, due date, projected gap (D5), status | Push notifications or reminders of any kind — not in v1 | |
| Home: KPI tiles, table of what is left in each category, goals table | Any server, account, login or sync — v3 | |
| Zakat panel: nisab (editable), hawl tracking (D6), 2.5% estimate; Sadaqah and Family support categories; Hijri date shown beside Gregorian | Telemetry or analytics of any kind — none in v1; anything later is opt-in and documented | |
| Nigerian specifics: rent sinking fund, savings destinations, ajo as a savings type with payout date, airtime/data, transport/fuel, generator units, multiple payment methods | Interest-bearing product suggestions — **never** | |
| Explicit loading, empty, invalid, failed-save and offline states on every screen | | |
| IndexedDB via Dexie behind `Repository`; JSON export/import; seed script | | |
| Vitest on cycle maths, safe-to-spend, rollover, projected gap; RTL on Quick Add; Playwright on the addendum's core journey K1 | | |
| Design tokens and `src/ui/` primitives, built from `docs/design/` before any screen | | |

**Added to scope by decisions D8–D14**, each small but none of them free:

- A **direction** field on `savings transfer` — *Move to savings* / *Take from savings* (D9).
- A debt record whose balance may **cross zero**, from owed-to-you to owed-by-you, without splitting into two records (D9).
- A **print stylesheet** for the debt record (D11).
- **Persistent-storage request, honest status in Settings, and an export nudge driven by unexported changes** (D12).
- **PWA installability** — manifest, icons, service worker for the app shell. Not for offline sync, which does not exist; for storage durability, and for opening the app the way a daily app is opened (D12).

---

## Dependencies

Everything this build needs from outside itself.

| Dependency | Owner | What is needed | Status |
|---|---|---|---|
| **Design system and screen designs** | Stakeholder, produced outside the session | `docs/design/tokens.md` (light and dark) and screen PNGs, made *from* the page specs | **Not received.** Blocks SHARED RULES. This is the design stop after PAGE SPECS. |
| **CI workflow** | This build, at PR AUTOMATION (phase 11b) | Lint, typecheck, unit tests with a coverage gate on money modules, component tests, Playwright K1, secret scanning | **Does not exist.** Every PR until then merges without checks and says so. |
| **Verify command** | This build, first task of BUILD | `npm run verify` or equivalent, plus `package.json` | Not created |
| **Nisab value** | The owner, in-app | A current figure, editable, with a note on where to look it up | By design — no price feed in a local-first app |
| **Hijri calendar** | Browser platform | Gregorian-to-Hijri conversion | **Available with no dependency.** `Intl.DateTimeFormat` supports the `islamic` calendar in all current browsers, which satisfies standard N1 without adding a package. |
| **Domain name** | Stakeholder | `mizaniya.com` / `.app` / `.ng` | Unknown. Kick-off pack step 1. Does not block the build. |
| **Plugin skills** | Claude Code desktop app | The ten skills named in `peer-ai/AGENTS.md` | All present, checked 2026-09-09. Re-checked each phase. |

---

## Clarification questions

All eight were answered by the stakeholder on 2026-09-10.

| # | Question | Resolved by |
|:-:|---|---|
| 1 | Which eight figures are the Home KPI tiles? | **D8** — ranked, not a grid |
| 2 | Is an ajo payout income, or a transfer back from savings? | **D9** — neither; rotating ajo is a debt that crosses zero |
| 3 | Witnesses — free text or structured? | **D10** — an optional list of names |
| 4 | Shareable debt record — print stylesheet or generated file? | **D11** — print stylesheet |
| 5 | Persistent storage and export nudging? | **D12** — four layers, no encryption in v1 |
| 6 | Months view or Zakat panel first if the schedule slips? | **D13** — Months ships, Zakat waits |
| 7 | Is there a delivery date? | See constraints below |
| 8 | Which browsers? | **D14** — iOS Safari is the strict case |

### Constraints (answer to question 7)

No fixed date. The constraint is *as soon as realistic*, because the app is
intended for the stakeholder's portfolio and for freelance bidding.

That has a design consequence worth stating rather than assuming: **a small,
complete, polished app is worth more than a large half-finished one.** A reviewer
spends about ninety seconds on a repository, and what carries weight is the
README, the screenshots and a core journey that works end to end — not the
feature count. Therefore: protect the core journey (K1), keep v1 lean, send
anything not in the brief to `docs/backlog.md`, and capture screenshots as soon
as the design lands rather than at the end.

### Still open

| Question | Owner | When |
|---|---|---|
| What is the amber threshold for safe-to-spend — a fixed naira figure, a proportion of the daily allowance, or a number of days of cover? | Stakeholder | SYSTEM SPEC |

---

## Assumptions

Recorded so that a wrong one is traceable rather than silently load-bearing.

1. **Assumption:** The app reports; it never advises. No suggestions to move money, and the zakat figure is an estimate with a note, never a ruling.
   **Impact if wrong:** an advice layer is a new surface with its own correctness and liability questions, and would change the Home screen's whole tone.

2. **Assumption:** "Offline" is the normal condition, not a degraded mode. There is no network in v1, so the offline banner exists to tell the owner their data is local and unbacked-up — not to report a failure.
   **Impact if wrong:** every error and empty state on every screen is designed around the wrong idea, and the offline state becomes a real error path rather than a note.

3. **Assumption:** There is no login, no account and nothing to authenticate against in v1.
   **Impact if wrong:** an auth surface, session handling and a second audience appear, and frontend A6 stops being dormant.

4. **Assumption:** Naira only, stored and calculated in **kobo** as integers with a branded `Kobo` type, formatted `₦1,250,000.00`.
   **Impact if wrong:** every figure in `core/` changes type, and multi-currency brings rate handling that the addendum currently defers to v3.

5. **Assumption:** the four layers in **D12** reduce the risk of data loss to something the owner can live with. They do not remove it.
   **Impact if wrong — and this is still the serious one:** IndexedDB is not permanent. A browser clearing site data, a storage-pressure eviction, or Safari's cap on unused sites deletes every transaction, and **nothing warns anyone**. The owner discovers it by opening an empty app. Persistence can be *requested* but never guaranteed; the export nudge only works if it is acted on. Until v3 sync exists, an exported file the owner has actually saved somewhere is the only real backup, and the README must say so plainly rather than implying the app is safe.

6. **Assumption:** All copy and documentation is British English.
   **Impact if wrong:** cosmetic, but it runs through every string and every doc.

---

## Next steps

1. **ARCHITECT** — `peer-ai/shared/02-architect.md`. Local-first; IndexedDB via Dexie behind `Repository`; a framework-free `core/`; structure per frontend standards A1–A5. The IndexedDB durability question (assumption A5) is decided there, with both sides presented.
2. **SYSTEM SPEC** — `peer-ai/shared/03-spec-system.md`.
3. **API CONTRACT** — `peer-ai/shared/04-spec-api-contract.md`. In v1 the `Repository` interface and the JSON export/import schema *are* the contract; the document notes where a v3 API would slot in. **Stop after this.**
