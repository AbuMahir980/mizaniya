# Session Context Log

This file is the **narrative companion** to `.peer-ai-state.json`. Any AI
following the workflow reads **both files** at every session start. The state
file holds structured pointers (phase, ticket, step); this file holds the story
(rules, decisions, daily progress, what's next) and the code-review checklist.

**Update this file** when the user says "update the context", "wrap up", or
"start a new chat", or when context usage is visibly high (~80%).

---

## Repo rules — verbatim, binding on every phase

These are the stakeholder's rules as written. They are not paraphrased here and
must not be paraphrased anywhere else.

1. Public repository under the PolyForm Noncommercial 1.0.0 licence (source-available; the LICENSE file in the root is authoritative — do not add, change or generate any other licence text), built in the open; phase commits named "peer-ai: <phase>". Secrets never enter the repo: any key or credential is read from environment variables, .env is git-ignored, and CI runs secret scanning. A future server for sync, sharing or payments lives in a separate private repository.

2. No real financial data ever enters the repository — not in code, seed files, fixtures, screenshots, issues, docs or commit messages. Seed data is invented and lives only in docs/seed-data.md: take-home ₦450,000 on the 25th; debts owed to "A. Friend" ₦120,000 (₦30,000 a month) and "Spouse" ₦60,000; ₦40,000 owed to me by "B. Colleague"; annual rent target ₦900,000 due 1 March; emergency-fund target ₦150,000.

3. No employer, client or third-party project names anywhere in code, comments, docs or commits.

4. README leads with the problem (salary gone before the month ends, debts in both directions, rent due once a year) and the screenshots, not the stack.

5. docs/standards/ is the rulebook: frontend-engineering-standards.md, backend-engineering-standards.md and standards-addendum-mizaniya.md. Every rule marked auto is enforced by ESLint/tsconfig/CI; every rule marked review is listed in CONTEXT.md as the code-review agent's checklist. Token, primitive and file naming follow frontend sections F and O.

**Note on rule 1, 2026-09-11 — superseded by the amendment below.** Rule 1 says
the server lives in a separate private repository. That was **unchanged and still
binding** at the time, but under review:
[ADR-008](docs/adr/ADR-008-repository-layout.md) defers the server's visibility to
v3 and writes down the criteria for deciding it. If the answer turned out to be
public, **rule 1 was to be amended here, in writing, first.** The rule is not
contradicted quietly.

**Amendment to rule 1, 2026-09-24 — the server lives in this repository, and it
is public.** This is the writing the note above required, and it is the only place
the change is made. Rule 1's clause *"A future server for sync, sharing or
payments lives in a separate private repository"* is replaced by: **the server
lives in this repository at `services/api`, public, under the same PolyForm
Noncommercial licence. Infrastructure, secrets and any future fraud heuristics
stay private.** Everything else in rule 1 is untouched and still binding — the
licence, the open development, the phase commit names, and secrets never entering
the repo.

The reason is in [ADR-009](docs/adr/ADR-009-repositioning-v1-hosted-webapp.md):
v1 is now a hosted webapp, so the server is v1's work rather than v3's, and
ADR-008's written criteria were applied to it. **The criterion that will move is
"there are paying users whose trust is the asset"** — it is not true yet, it
becomes true at the first paying user, and when it does, visibility is revisited
by another written amendment here.

**Rule 6, given by the stakeholder 2026-09-24 — build against seeded data, and
make it a switch.** Their words: *"for any build we must build with a seeded data
first — so it should be something that can be toggled on and off. We build with
seeded data, that's like dummy data, to actually test functionality."*

**The toggle is an environment variable**, clarified by the stakeholder
2026-09-24: a line in `.env` — `VITE_USE_SEED=true` or `false`. True means every
screen is populated with dummy data, so functionality can be exercised without
typing anything. False means the real path: sign up, onboard, enter your own
figures, and see what a new user actually sees.

Draft wording, **awaiting the stakeholder's final phrasing** before it joins the
five above as binding:

> 6. Every build is developed and tested against seeded data, never against real
>    data. A single switch in `.env` — `VITE_USE_SEED` — fills the app with dummy
>    figures when it is on, and gives the true new-user path when it is off. Both
>    states are expected to work, and both are checked before a feature is called
>    done. Figures come only from `docs/seed-data.md` (rule 2).

**Why both states, not just the convenient one.** Seeded mode is the fast way to
see a screen with realistic content. Unseeded mode is the only way to see what a
new user sees — the empty states, the onboarding, the first-run path — which is
exactly the part that ships broken when everyone develops against a full database.

Partly in place already: `npm run seed` writes a real export file that the app
restores through its ordinary import path. **What is new is the switch**, and it
brings two requirements that are easy to miss:

- **`.env` is git-ignored** (rule 1), so `.env.example` carries the variable and
  its default, documented and committed. Nobody should have to guess the name.
- **Vite bakes environment variables into the bundle at build time.** So a
  production build must *never* be made with the seed on — a real user would be
  shown invented figures, or worse, have theirs replaced. This is not a thing to
  remember: **the build fails if `VITE_USE_SEED` is true in a production build**,
  and the seed path is excluded from the production bundle entirely. A guard,
  because a convention here would eventually be forgotten once.

**Rule 7 — drafted 2026-09-24 at the stakeholder's request, awaiting their
approval or rewrite.** Rule 6 covers how we build; nothing yet covers what the
server is allowed to *hold*. Rule 2 forbids real financial figures **in the
repository** and is silent about a database, because there was none.

> 7. Other people's money data is held in trust, and the app holds as little of it
>    as it can. The sensitive figures are **encrypted with keys kept outside the
>    database**, so a stolen copy of the database is not a copy of anyone's finances.
>    **Bank access tokens are held to a higher standard than anything else**, because
>    a leaked token is ongoing access to someone's account rather than a record of
>    last month. Bank access is **read-only**: Mizaniya never moves, holds or takes
>    money; the person can cut the connection at any time, and unlinking destroys the
>    token. **Financial values never reach a log, an error report or a monitoring
>    tool.** Nothing is ever copied out of production — not into the repository, a
>    fixture, a screenshot, or a conversation about a bug; rule 6 exists so nobody
>    ever needs to. **Every access to production data leaves a record, and people are
>    told that it does** — support works by asking, not by looking. Everyone can
>    export everything the app holds about them and can delete their account, and
>    **deleting means the data is actually gone, not hidden** — a sync tombstone is
>    not a deletion. Backups exist, and a restore has been **performed and verified**,
>    not merely configured. If data is ever exposed, the people affected are told
>    plainly and promptly. **And what is claimed publicly is exactly what is true** —
>    never more: not *"nobody can read your data"* while we can, and not *"your bank
>    data never touches our servers"*, because it must.

**Why each clause is there**, so it can be argued with rather than nodded at:

- *Keys outside the database* — the stakeholder's instinct was stronger than this:
  they wanted data **we could not read at all**. That was examined properly and
  deliberately deferred in [ADR-011](docs/adr/ADR-011-encryption-and-data-protection.md),
  for three reasons — a forgotten password would destroy someone's budget for good, a
  paying customer could not be supported, and **the promise can be added later but
  never withdrawn**. What this clause keeps is the part that defeats the breach shapes
  that actually happen: a leaked database dump or a mishandled backup is ciphertext
  without a key. What it does **not** defend is a live compromise of the running
  server, and ADR-011 says so plainly rather than letting anyone assume otherwise.
- *Every access leaves a record* — the honest substitute for "we cannot look". A
  promise not to look is worth what the busiest day is worth; an audit log is
  checkable, and users are told it exists.
- *Never copied out of production* — this is rule 2 extended from the repo to the
  database, and it is the clause most often broken by accident, usually by a log
  line or a screenshot in a bug report.
- *As little as it can* — the strongest protection for data is not collecting it.
  Also the cheapest.
- *Deleting means gone* — this is a direct tension with
  [ADR-010](docs/adr/ADR-010-sync-model.md), which keeps tombstones so deletes can
  propagate between devices. A tombstone satisfies sync; it does **not** satisfy a
  person asking to be erased. Both have to be built, and the rule says which one
  wins.
- *Read-only bank access* — the factual boundary that keeps this out of payment
  regulation entirely, so it is written down rather than assumed.
- *A restore that has been performed* — this project already knows that a check
  which has only ever passed is indistinguishable from one that is switched off.
  An untested backup is that, with someone's financial history inside it.
- *Told plainly and promptly* — NDPR requires notification; and it is the one
  moment where the whole trust of a money app is decided.

**This blocks the first real user, not the first line of server code.**

---

## Environment — settled 22 September 2026

**The ten skills are plugins. You install them.** One command each, any client,
any machine:

```bash
claude plugin marketplace add anthropics/knowledge-work-plugins
claude plugin install engineering@knowledge-work-plugins
claude plugin install design@knowledge-work-plugins
claude plugin install product-management@knowledge-work-plugins
```

Restart the session afterwards. `anthropics/knowledge-work-plugins` is a public
Anthropic repo carrying 116 plugins; these three hold every skill this project
names, and a few more besides.

| Plugin | Skills this project uses | Phase |
|---|---|---|
| `engineering` | `architecture`, `system-design` | Architect |
| `engineering` | `tech-debt` | Issues |
| `engineering` | `code-review` | **Review — still ahead** |
| `engineering` | `testing-strategy` | **Test — still ahead** |
| `engineering` | `documentation` | **Document — still ahead** |
| `design` | `design-system` | Shared Rules, Frontend Rules |
| `design` | `accessibility-review` | Page Specs, Frontend Rules |
| `design` | `ux-copy` | Page Specs |
| `product-management` | `write-spec` | System Spec |

They also bring skills no phase names — `debug`, `deploy-checklist`,
`incident-response`, `standup`, `design-critique`, `design-handoff`,
`sprint-planning` and others. Use them when they fit; do not invent a phase for
them.

**Installed on this machine 22 September.** Also installed:
`pr-review-toolkit@claude-plugins-official`, whose six review agents are useful
alongside REVIEW — see the note in *What Was Done*.

### The two weeks this cost, and the lesson

Until 22 September this file and `peer-ai/AGENTS.md` both said the skills were
`@inline` bundles tied to the account, impossible to install, available only in
the desktop app — and instructed that every skill-naming phase be run there.
**All of it was wrong**, and the correct install command was printed in the
plugin's own README the whole time.

Three separate checks made the same mistake: each looked in one place, found
nothing, and concluded something about the whole system — first
`~/.claude/plugins/repos/`, then the wrong marketplace, then a cached feature
flag that seemed to explain everything. **Absence in the place you looked is not
absence.** This is the same failure the project already has a name for in
*What breaks — and who finds out?* (see the principles above): the
check was silent about its own blind spot, so three wrong answers all looked
confident.

**There is no general backend or devops plugin** in either marketplace —
checked, not assumed. Backend and infrastructure coverage is vendor-shaped
(Prisma, PlanetScale, CockroachDB, Datadog, Buildkite, Grafana, Honeycomb), so
it becomes relevant at v3 when a real server and its tools are chosen, not
before. The `engineering` plugin's `deploy-checklist` and `incident-response`
are the closest generic equivalents and are already installed.

**Re-check at the start of every phase that names a skill.** A missing skill is
reported and the phase is worked from its file instead — never silently skipped,
because "the skill covered it" is exactly the assumption that leaves a review
half-done. If one is missing now, the fix is the install command above, not a
different client.

---

## Learning mode — replaced 2026-09-24 by topic notes

The old contract is **gone**, not suspended. The stakeholder's replacement, in
their words: *"the parts where we've been adding comments to codes and the likes
— except maybe there is a need for it — I want everything to be cleared now"*, and
instead a note per subject that says *"this is what this project did, these are the
concepts from it… how did you manage 1000 data? I managed 1000 data using caching.
And why caching? Why? Why?"*

**So: explanation comes out of the code and goes into one note per topic.**

**1. The code is cleared.** The three-line `WHAT / WHY / INTERVIEW` header is
removed, from new files and from existing ones as a sweep. A comment survives only
where the code cannot speak for itself — a non-obvious constraint, a workaround
that needs its reason, a domain rule someone would otherwise "fix". The test: would
a competent reader ask *why is it like this?* and find no answer in the code? Then
comment. Otherwise delete.

**2. One note per topic**, in `docs/engineering-notes/`. Not per file and not per
decision — **per topic someone would ask about**: state management, storage, money,
offline, sync, performance, auth. Each answers, in order: what the problem was ·
what this project did · the concepts, named plainly · **the why-chain**, why this
and not the obvious alternative, and why not that, until the answer rests on a
constraint rather than a preference.

The test is that it survives being pushed. *"How did you handle a thousand
records?"* — *"Caching."* — *"Why caching?"* — and it holds three or four levels
deep without bottoming out in "it seemed better".

**A note may say the work is not done.** *"Not built yet; here is when it would be
needed and what we would do"* is a legitimate note, and often a better one.
**Writing down a deliberate deferral is worth more than building the thing early**
— it shows the limit was understood and chosen, which premature machinery never
shows.

**Notes are not ADRs, and both stay.** An ADR records a decision *at the moment it
was made* and is immutable. A note explains the **system as it is now** and is
rewritten when that changes. A note links its ADRs.

**`docs/concepts/` was deleted on 2026-09-25**, once its content had moved. The stakeholder's
call, 2026-09-24: two folders explaining the same things is confusing, and the
engineering note is the format that is actually useful — *"I can even easily talk
about it in gatherings, in interviews."* The concept note was written to teach a
concept; the engineering note answers a question someone asks you. The second
replaces the first.

**Done as harvest first, delete second.** The ten notes in `docs/engineering-notes/`
were written before anything was removed, and the links in `docs/04-api-contract.md`,
`docs/07-frontend-coding-rules.md` and three `peer-ai/` files were repointed. The
`peer-ai/` ones mattered most: they instructed future sessions to write concept notes,
so leaving them would have had the folder recreated by the next session that read them.

Three files needed a decision rather than a move:

- **`what-breaks-who-finds-out.md`** was cited as a named principle, so it became one —
  see *The principles this project keeps returning to*, above.
- **`review-questions.md`** was an artefact of the five-questions ritual, which no
  longer exists. Deleted.
- **`revisit.md`**'s two open threads are both closed rather than carried forward. Its
  detectability thread said *revisit when building safe-to-spend and Home* — both are
  built, and `derived-state.md` now makes that argument in full. Its "API-contract five"
  thread was about being taught rather than tested under the old ritual, and the five
  topics it listed are now covered by the notes on derived state, validation, import and
  export, and data storage.

**`docs/Mizaniya_Kickoff_Pack.md` is deliberately left alone.** It is the stakeholder's
original instructions, and rewriting it would falsify the record of what was asked for.
Its learning-mode paragraphs are superseded by `CLAUDE.md` §4.

<details>
<summary>The replaced contract, kept as history</summary>

This project is built to be understood. The stakeholder reads; they do not type
the code. Do not slow down to make them type.

- **Before each phase:** three or four plain sentences on what it produces and why it comes before the next.
- **Before non-trivial logic** (cycle maths, safe-to-spend, rollover, projected gap, zakat): state the reasoning in steps — inputs, rule, edge cases — *then* write the code.
- **Every file gets a three-line header:** WHAT it does · WHY this pattern over the obvious alternative · ONE SENTENCE to say about it in an interview.
- **`docs/concepts/`** — one short file per concept the first time it appears (repository pattern, IndexedDB, derived state, optimistic UI, idempotent saves, tokens vs hard-coded styles…): what it is, why it is used here, what we would have used instead and why not, and the interview sentence. The stakeholder adds a line in their own words after reading.
- **At each stop:** ask five questions about what was built, and say honestly whether the answers hold up. Log misses in `docs/concepts/revisit.md`.
- **Real trade-offs** are laid out with both sides; the stakeholder chooses; the choice and its reason are recorded in Key Decisions below.

</details>

**One thing that was never learning mode and continues regardless:** trade-offs are
laid out both ways, the stakeholder chooses, and the choice and its reason are
recorded — in an ADR and in Key Decisions. That is how this project decides things.

<details>
<summary>The suspended contract, kept for reference</summary>

This project is built to be understood. The stakeholder reads; they do not type
the code. Do not slow down to make them type.

- **Before each phase:** three or four plain sentences on what it produces and why it comes before the next.
- **Before non-trivial logic** (cycle maths, safe-to-spend, rollover, projected gap, zakat): state the reasoning in steps — inputs, rule, edge cases — *then* write the code.
- **Every file gets a three-line header:** WHAT it does · WHY this pattern over the obvious alternative · ONE SENTENCE to say about it in an interview.
- **`docs/concepts/`** — one short file per concept the first time it appears (repository pattern, IndexedDB, derived state, optimistic UI, idempotent saves, tokens vs hard-coded styles…): what it is, why it is used here, what we would have used instead and why not, and the interview sentence. The stakeholder adds a line in their own words after reading.
- **At each stop:** ask five questions about what was built, and say honestly whether the answers hold up. Log misses in `docs/concepts/revisit.md`.
- **Real trade-offs** are laid out with both sides; the stakeholder chooses; the choice and its reason are recorded in Key Decisions below.

</details>

**What survives regardless, because it is not learning mode:** real trade-offs are
still laid out with both sides, the stakeholder still chooses, and the choice and
its reason still go into Key Decisions. That is how this project makes decisions,
not a teaching device — it is why ADRs exist.

---

## The principles this project keeps returning to

Short, named, and cited by the notes and the day log rather than re-explained each
time. They came out of real mistakes in this repo, not from a book.

**What breaks — and who finds out?** Every failure has two halves: what goes wrong,
and whether anyone learns about it. Most answers stop at the first. *Loud problems are
cheap; silent ones are expensive.* Run both questions over any decision — if the
answer to the second is "nobody, ever", the design is not finished. This is why no
derived figure is stored (a stored total and its records can disagree with both looking
correct), why a newer import file is refused outright rather than partially read, and
why the app saves before it updates the screen.

**A check that has only ever passed is indistinguishable from one that is switched
off.** So guards are broken on purpose to prove they fire — the architecture
boundaries, the repo-rule guard, the spacing grid, and the schema migration.

**A check scoped to one unit is a check with a hole in it.** The 2px-grid migration was
guarded by comparing emitted `px` values, felt conclusive, and let three broken
*percentage* utilities through. Learned again on 25 September: a check confirming the
file headers had exactly three fields never asked whether they had *extra* lines, so it
passed while `@vitest-environment` was being deleted out of nine test files.

**Two records of the same fact will disagree, and nothing will tell you.** The state
file and the issue tracker both say which tickets are done. On 25 September they
disagreed three ways at once: **#93** was closed and not recorded, **#74** had been
closed on 23 September and never recorded, and **#79** was recorded as complete while
still open. Each looked authoritative on its own. The fix is not more care — it is
**comparing them on purpose**, which is a three-line script, and doing it at every
context save rather than when something feels wrong.

**Absence in the place you looked is not absence.** Three separate checks concluded the
ten skills were uninstallable, each having looked in exactly one place. The install
command was in the plugin's README the whole time.

---

## Code-review checklist — every `review` rule

Repo rule 5 requires this list. It is the checklist the code-review agent
(`peer-ai/agents/review-prompt.md`) and Claude Code's `/code-review` are held to.
Rules marked `auto` are not listed: ESLint, tsconfig and CI fail the build on
those, and SHARED RULES maps each one to its enforcement.

Source: `docs/standards/frontend-engineering-standards.md`. **Backend review
rules are dormant until v3** (separate private repo) and are not listed here.

### Active from day one

| Rule | What the reviewer checks | Enforcement note |
|---|---|---|
| **B1** | Server state is not client state — no copying fetched data into local state | `auto` for fetches in `useEffect`; `review` for the copying |
| **B3** | Derived values are derived, never stored | `review` |
| **B4** | Genuinely global client state uses one store | `review` |
| **B5** | Context is for stable, rarely-changing values | `review` |
| **C1** | A prop passes through at most two intermediate components | `review` — countable, so the review is objective |
| **C2** | Fix drilling with composition first, context second, store third | `review` |
| **D2** | A component takes at most seven props | `review` |
| **D3** | A component either fetches or renders — not both | `review` |
| **E1** | Rule of three | `review` |
| **E2** | Rules are exempt from the rule of three | `review` |
| **F4** | Token names are semantic, never literal | `review` |
| **F6** | Every primitive ships with its states | `review` |
| **F7** | Danger colour is reserved for its meaning — here, money going wrong (addendum) | `auto` where the token import can be restricted; else `review` |
| **G3** | State is a discriminated union, not boolean soup | `review` |
| **H3** | No arithmetic on money inside a component | `review` |
| **J5** | Keyboard-only use works end to end (web) | `review` + E2E |
| **K3** | Test behaviour, not implementation | `review` |
| **K4** | A bug fix ships with the test that would have caught it | `review` |
| **L1** | Every async surface handles loading, empty and error explicitly | `review` |
| **L2** | An error message says what happened and what to do next | `review` |
| **L4** | Offline is a state, not an error | `review` + E2E |
| **M1** | No real personal or financial data in the repository | `review` + secret scanning in CI |
| **M2** | Nothing leaves the device without a stated reason | `review` |
| **N1** | A new dependency is justified in the pull request — what it does, why not the platform, what it weighs | `review` |
| **O3** | Say what it is | `review` |
| **O4** | Name things as the user would | `review` |

### Dormant — and why

| Rule | Status |
|---|---|
| **A6** · Every request carries its session scope explicitly | Dormant. The addendum sets a single audience (the owner) for v1–v2. Activates if household sharing arrives. |
| **I1, I2, I4** · Safety-critical data | **Not applicable.** The addendum states this project has no safety-critical data; frontend section I is empty for it. |
| **N3** · Mobile targets one pinned Expo SDK, recorded in an ADR | Activates at v2. The SDK is recorded in ADR-01 when the Expo app starts. |

---

## Current State

**Phase: the repositioning's own sequence, and it is nearly through.** As of
25 September: schema v2 is in, the cleanup sweep is done, both specs are written and
the design brief is out. **What remains before the server work is the workspace
extraction** (ADR-008 item 2) — `src/` → `apps/web/`, and `packages/core` and
`packages/tokens` extracted — which is independent of the designer and can run while
they draw. Then accounts and sync.

**Screen building is still stopped**, and for the original reason: #72's conformance
pass is parked half-done, and #68/#70/#69/#85/#23–#29 are to be re-specced against
the new stories rather than built as written.

**Phase before that: BUILD — stopped 2026-09-24 for the repositioning.** v1 is no longer a
local-first single-owner web app; it is a **hosted webapp with a server**, and
mobile moves to v2. See [ADR-009](docs/adr/ADR-009-repositioning-v1-hosted-webapp.md)
and [ADR-010](docs/adr/ADR-010-sync-model.md). **No further screen building until
the re-spec and the design brief are done** — the reason to reposition now is that
little has been built, and building more against single-owner assumptions is the
thing being avoided.

**What is parked, and why each:**

- **#72's design-conformance pass — parked half-done.** Home stays incomplete.
  Every one of those screens changes under the repositioning (sign-up, signed-out
  states, sync state, account and billing), so rebuilding them now means
  rebuilding them twice.
- **T16 (#23) — started and parked.** `core/movement` is merged; its screen is not
  built; the branch `feature/transactions-and-editing` is unmerged.
- **T17–T22 (#24–#27, #29) — not started, and now to be re-specced** before they
  are built, not built as written.

Cycles 1 and 2 are closed (T1–T15) and `main` runs end to end as a local-first
app. That build is not wasted: `core/` is unchanged by the repositioning, the
`Repository` seam is exactly what the server slots behind, and the local
implementation stays the offline path under ADR-010.

**What the last day was actually about.** The owner ran the app and found it had
deviated from the design badly. Every built screen had been assembled from
fragments grepped out of the canvas rather than from the artboards. **#72 tracks
rebuilding all of them**, one at a time, PNG first.

| Screen | State |
|---|---|
| Welcome + launch | **Rebuilt**, confirmed pixel-perfect by the owner |
| Onboarding | **Rebuilt**, confirmed pixel-perfect by the owner |
| Home | **Half done** — #88 landed the date header, the gauge's scale and the card words. The rest is on #68 |
| Plan | Not started — #70 |
| Quick Add | Not started — #69 |
| Transactions and later | Build from the artboards from the start |

**What the repo holds now.** `npm run verify` runs naming, **spacing**, lint,
typecheck, **384 tests** and a build. CI is live on every pull request — verify,
repo rules, secret scanning — and three guards exist that did not on 23
September: the 2px grid, the design-drop staging check, and the fraction-offset
check. `npm run seed` writes a real export file the app restores through its
ordinary import path.

**Two guarantees are held by tests that break them on purpose**: the
architecture boundaries and the repo-rule guard. A third is now the spacing
grid. The rule this project keeps relearning is that **a check which has only
ever passed is indistinguishable from one that is switched off** — and, learned
the hard way on 24 September, **a check scoped to one unit is a check with a
hole in it.**

**The design is complete and all of its files have landed** — 67 artboards,
`tokens.md` with 54 gated contrast pairs and no failures, the canvas as `.dc.html`
so the build agent reads markup rather than pixels, and since 22 September the
production brand files in `docs/design/brand/`.

**Read [docs/open-items.md](docs/open-items.md) before building a screen.** It is
the designer's list of what the design has that the code does not — the three
typefaces nothing loads yet, the brand files, the welcome screen that was drawn
after PAGE SPECS and so appears in no ticket, and a Tabs primitive — each against
the ticket that takes it. The file is deleted once every box is ticked.

**Next action:** the repositioning's own sequence — **ADR-010 signed off**, then
the re-spec (new stories + `peer-ai/backend/01-spec-endpoints.md`), then the
**one** design brief. No screen is built before those three. ADR-009's action
items are the checklist.

*(This line previously read "start #23 — T16", which had already been stale for a
day: #72's conformance pass outranked it and the state file said so. Corrected
rather than left to be rediscovered.)*

---

## Key Decisions

| Date | Decision | Source |
|------|----------|--------|
| 2026-09-09 | Local-first v1: no server, no accounts, no network. IndexedDB via Dexie behind a `Repository` interface | brief |
| 2026-09-09 | Domain logic in a framework-free `core/` package of pure TypeScript, so React Native (v2) shares it unchanged | brief |
| 2026-09-09 | Money is stored and calculated in **kobo** as a branded `Kobo` type; formatter renders `₦1,250,000.00` | addendum |
| 2026-09-09 | `docs/standards/` is authoritative over peer-ai's own rules files on any conflict; rules are referenced by section number, never copied | repo rule 5 |
| 2026-09-09 | Opus for build, Fable for everything else; never downgrade mid-phase. Peer-ai's cost-tiering removed rather than followed | project convention |
| 2026-09-09 | Skills are invoked *inside* the phase that names them, never as a parallel process | `peer-ai/AGENTS.md` |
| 2026-09-09 | Git: every piece of work on a branch — `feature/<short-description>` for build items, `peer-ai/<phase>` for phase documents — reaching `main` only through a PR with CI green; squash and merge; delete the branch after | stakeholder, this session |
| 2026-09-09 | v1 has **no mock-data layer**. The data seam is `Repository`; the local implementation is the real one. Peer AI's build step 4 assumes an HTTP API and is logged as a framework defect | `docs/peer-ai-feedback.md` #1 |
| 2026-09-10 | **D1 · Protected allocations** are derived from category type (anything not an `Expense`), overridable per category, and measured as `planned − actual` so money already moved is not subtracted twice | UNDERSTAND |
| 2026-09-10 | **D2 · Rollover carries the allowance, not the money.** Cash left comes from transactions and is never touched by rollover, so nothing is counted twice. No expiry in v1; the carried figure is shown on Plan | UNDERSTAND |
| 2026-09-10 | **D3 · Money owed to you counts toward nothing** — not safe-to-spend, not a projected gap — except zakat, where it is a separate line the owner switches on or off, asked once, never ruled on by the app | UNDERSTAND |
| 2026-09-10 | **D4 · Cycle boundaries are nominal.** Salary day clamps to the last day in short months; income arriving up to 3 days early is attributed to the cycle it precedes. The boundary never follows the actual payment, because that would rewrite history silently | UNDERSTAND |
| 2026-09-10 | **D5 · The projected gap counts paydays**, not whole cycles and not pro-rated part cycles. Money arrives in lumps on payday | UNDERSTAND |
| 2026-09-10 | **D6 · The zakat lunar year is asked for**, with a labelled fallback to the first record. Never assumed silently | UNDERSTAND |
| 2026-09-10 | **D7 · Debt transaction types renamed** to plain speech — *I borrowed · I repaid · I lent · They repaid me* — per frontend standard O4 | UNDERSTAND |
| 2026-09-10 | Every cycle is labelled by its **start date**, never a bare month name, because an early salary day makes a cycle span two calendar months | UNDERSTAND (D4) |
| 2026-09-10 | **D8 · Home is ranked, not a grid.** One hero (safe to spend today), four tappable tiles with progress, unallocated as a banner that hides at ₦0, then two tables. Eight equal tiles is the spreadsheet rendered smaller | UNDERSTAND |
| 2026-09-10 | **D9 · Rotating ajo is a debt that crosses zero**, not savings — you lend before your turn and borrow after it. Personal target ajo is a savings goal, so `savings transfer` gains a direction | UNDERSTAND |
| 2026-09-10 | **D10 · Witnesses are an optional list of names** — structured enough to count and print, light enough to skip | UNDERSTAND |
| 2026-09-10 | **D11 · The shareable debt record is a print stylesheet**, not a generated PDF. No dependency, and the browser's Save as PDF gives a real file | UNDERSTAND |
| 2026-09-10 | **D12 · Storage durability is four layers** — request persistence, report the truth in Settings, nudge on unexported changes rather than a timer, and ship as an installable PWA. **No encryption at rest in v1**, because with no server a forgotten passphrase destroys the history permanently | UNDERSTAND |
| 2026-09-10 | **D13 · If the schedule slips, Months ships and Zakat waits.** A wrong zakat figure in a Muslim-facing app is worse than no zakat figure | UNDERSTAND |
| 2026-09-10 | **D14 · iOS Safari is the strict case.** On iOS every browser is WebKit, so Chrome there is Safari — the owner's primary device is governed by the tightest storage rules of the set | UNDERSTAND |
| 2026-09-10 | **ADR-001 · The whole dataset is held in memory as one snapshot**, every figure derived from it by pure `core/` functions. Writes go to IndexedDB **first**, memory second, so the screen and the database can never disagree. Dexie `liveQuery` rejected: it puts the storage engine in every component (breaks A4) and has no equivalent in SQLite or HTTP, so every screen would be rewritten at v2 | ARCHITECT |
| 2026-09-10 | **ADR-003 · Time is a parameter.** `core/` never reads the clock; `now` is passed in. Dates are stored as calendar dates (`YYYY-MM-DD`), not instants, so a timezone shift cannot move a transaction to the previous day | ARCHITECT |
| 2026-09-10 | **ADR-004 · Money is integer kobo with a branded `Kobo` type**, all arithmetic in `core/money`, never in a component (H3), extracted on first repeat (E2) | ARCHITECT |
| 2026-09-10 | **ADR-005 · Export carries a `schemaVersion`; import is atomic and version-checked.** A newer file is refused with a plain explanation rather than partially loaded, and current data is exported to a file before an import overwrites it | ARCHITECT |
| 2026-09-10 | **ADR-006 · Zustand as the single client store** (B4). Context + `useReducer` rejected: one snapshot in one context re-renders every consumer on every change, which is felt on a phone | ARCHITECT |
| 2026-09-10 | **ADR-007 · PWA via vite-plugin-pwa**, shell precached only, persistence requested after the first meaningful write | ARCHITECT |
| 2026-09-10 | Multi-tab drift closed with a `BroadcastChannel` reload after each successful write — two open tabs would otherwise disagree silently | ARCHITECT (ADR-001) |
| 2026-09-10 | **ADR-002 · `core/` stays a `src/core/` folder in v1**, extracted to a package as the first task of v2. What makes it reusable is that it imports nothing, and the A3 lint rule enforces that from day one — so the boundary is real without workspace configuration in five tools | ARCHITECT, stakeholder's choice |
| 2026-09-10 | **D15 · Amber when safe-to-spend per day falls below 60% of the planned daily allowance**, editable in Settings; red only when negative. A proportion stays meaningful after a pay rise, where a fixed naira threshold quietly goes wrong and nobody re-tunes it | SYSTEM SPEC |
| 2026-09-10 | **The contract is the code.** `src/core/types.ts`, `schema.ts` and `repository.ts` are the source of record; `docs/04-api-contract.md` explains and indexes them rather than restating shapes that would then drift | API CONTRACT |
| 2026-09-10 | **Eight transaction types, not seven.** *Move to savings* and *Take from savings* are two types, not one type with a direction field — H5 says direction comes from the type. This corrects an earlier draft of D9 | API CONTRACT |
| 2026-09-10 | **A `Debt` has no direction field.** The balance derives from transactions and may cross zero, which is what a rotating ajo does. A stored direction would need correcting at the crossing and nothing would notice if it were not (D9) | API CONTRACT |
| 2026-09-10 | **The `Repository` interface lives in `core/`, its implementations in `data/`** — correcting the first draft of the architecture. The interface is shared domain contract that Expo must implement; the implementation is a platform detail | API CONTRACT |
| 2026-09-10 | **`zod` for runtime validation at the import boundary.** TypeScript vanishes at compile time, and a file the owner picks from disk is untrusted input (N1: ~14 KB, no platform equivalent) | API CONTRACT |
| 2026-09-10 | **Accessibility is stated once, not per page.** Nine copies of the same rules would drift within a week; the per-page sections carry only what differs | PAGE SPECS |
| 2026-09-10 | **One polite live region per screen**, announcing the outcome and only the figure the owner came for. A save changes a dozen numbers; announcing them all would tell a screen-reader user nothing | PAGE SPECS |
| 2026-09-10 | **Money is never announced with a bare minus sign.** “2,300 naira over”, not “minus 2,300” — ambiguous read aloud is the same failure as ambiguous on screen | PAGE SPECS |
| 2026-09-10 | **Every import refusal ends “Nothing has changed.”** That sentence is all-or-nothing said to the person it protects | PAGE SPECS |
| 2026-09-10 | **Danger colour is spent only on money going wrong.** Not on deleting a transaction, not on a refused import, not on being offline — spend it on ordinary states and it means nothing by the time it matters (F7) | PAGE SPECS |
| 2026-09-10 | **Quick Add is the centre of the bottom bar**, the largest target, under the thumb. Transactions is not a bottom-bar item — recording is the common case, browsing is the rare one | PAGE SPECS |
| 2026-09-10 | **Never round a rounded number; stay in integer kobo and divide last.** The amber threshold is ₦5,200.00 computed as (6 × 26,000,000) ÷ 300, and ₦5,199.99 if taken from the displayed allowance. Both published figures were right; neither derives from the other | design review |
| 2026-09-10 | **Design supersedes brief §2** at the owner's direction — four meaning-bearing hues, icons, and three diagrams replacing the four stat tiles. Design wins on layout, the spec still wins on behaviour | design stop |
| 2026-09-10 | **Health, not food, carries the overspent row** in the seed. Food's allowance carries a ₦12,000 rollover, so food overspent plus transport at 85% exceeds the cycle's whole expense spend and would move cash left and the hero | seed merge |
| 2026-09-11 | **Tokens live twice on purpose** — typed data in `tokens.ts`, custom properties in `tokens.css` — because charts, tests and the contrast audit need values, not CSS. `tokens.test.ts` fails the build when the two drift. The same choice as the API contract: where two representations are genuinely needed, something automated must notice when they part company | SHARED RULES |
| 2026-09-11 | **Tailwind's theme is replaced, not extended.** `bg-blue-500` and `p-7` do not exist, and every colour resolves to a custom property, so light and dark swap with no class changes | SHARED RULES |
| 2026-09-11 | **Rounding direction lives in the function name** — `perUnitFloor` for money you may spend, `perUnitCeil` for money you must find. `proportionOf` multiplies before dividing, which is what makes the amber threshold ₦5,200.00 rather than ₦5,199.99 | SHARED RULES |
| 2026-09-11 | **No danger button variant exists**, so a red Delete is not merely discouraged, it is not constructible. Validation styling and the offline note are neutral for the same reason (F7) | SHARED RULES |
| 2026-09-11 | **The architecture boundaries are a lint rule, not a diagram.** `eslint-plugin-boundaries` declares each layer once and lists every permitted direction, so the diagram and the linter cannot disagree; `core/` gets an empty list rather than a short one. **Verified by injecting three violations and watching each fail** — a misconfigured boundary rule allows everything and says nothing, so a green run proves nothing until the rule has been seen to go red | FRONTEND RULES |
| 2026-09-23 | **D17 · The desktop sidebar groups destinations, and Settings sits apart at the foot.** Zakat joins the places the owner *goes to do something* — in a Muslim-facing app it is a feature, not a preference. Settings is pinned below a divider because **it holds Import**, which page specs §7.9 calls the most dangerous action in the app, and a screen that can replace every record should not be the seventh identical item in a list. **This departs from `DHomeLight.dc.html`**, which lists all seven flat with Settings before Zakat. The design wins on layout; this is information architecture, and the owner chose it | owner, T13 |
| 2026-09-23 | **Correction to the row above: `boundaries/dependencies` never fired.** The elements used folder patterns (`src/ui/*`) against a flat codebase, and no import target resolved because only the node resolver was present and it reads neither `.ts` nor the `@/` alias. An unresolved dependency is compared against nothing. The 11 September verification was real but exercised `no-restricted-imports` — a different rule, which does work. Fixed with `src/ui/**` patterns and `eslint-import-resolver-typescript`, and now held by `src/architecture.test.ts`, which injects a violation per layer and requires ESLint to report it | boundaries fix |
| 2026-09-23 | **The composition of the storage layer lives in `store/`, not `app/`.** Working boundaries immediately caught `app/app.tsx` importing `data/` to build the Dexie repository. `store/` may choose an implementation for its own seam; the shell has no business knowing the records sit in IndexedDB (A2) | boundaries fix |
| 2026-09-11 | **The issue plan is a board, not a document.** Twenty-two tickets filed as #8-#29 with acceptance criteria as tickable boxes. Criteria pin figures, not appearances: no ticket is done because it renders — if it shows a figure, a test holds that figure | ISSUES |
| 2026-09-11 | **The vendored `peer-ai/` reports its own staleness.** `check-upstream.mjs` says which of the changed files the *active phase* is about to read — twelve files changed is a number nobody acts on. Deliberately **not** in `npm run verify`: being offline is not the same as being up to date, and a check that blocks offline work gets deleted rather than fixed | SHARED RULES |
| 2026-09-11 | **ADR-008 · The clients share one repository; the server's visibility is deferred to v3** against criteria written down now, because there is no server, no users and no payments. Repo rule 1 stands, noted as under review rather than quietly contradicted. Admin is its own app and its own deployment — never a route inside the web app, because bundling it ships admin code to every owner's browser and turns a routing bug into privilege escalation. `ui/` is not shared between web and mobile; the token source is | SHARED RULES |
| 2026-09-11 | **Protected remaining is planned minus actual**, not planned. Money already moved to the rent fund has left the account and is gone from cash left, so subtracting the whole plan again would count it twice and report a safe-to-spend that is too low | T2 |
| 2026-09-11 | **The safe-to-spend states are a discriminated union**, not a figure and two booleans, so "amber with no plan" cannot be represented at all rather than merely being unlikely. Red is tested first, because overspending without a plan is still overspending; the amber boundary is strictly less-than, so exactly zero is amber — red means *already overspent*, not *nothing left* (G3) | T2 |
| 2026-09-12 | **Rollover compounds, and walks back a bounded twenty-four cycles**, stopping at the first with no plan; a fresh install terminates immediately. Overspending does **not** carry forward — the variance on the cycle where it happened already showed it, and carrying it would punish the same month twice, invisibly | T3 |
| 2026-09-12 | **`leftoverFrom` stays a separate function from rollover.** Rollover is per category and carries an allowance; a leftover is whole-cycle cash arriving on the next plan as unallocated. Both carry something forward, which is precisely why someone would merge them later if they shared a home | T3 |
| 2026-09-23 | **One argument order across `core/`** — the snapshot first, then the subject: `saved(snapshot, goal)`, not `saved(goal, snapshot)`. Fifteen functions did it one way and five the other. Page specs §456 wrote the other order and was corrected, because for `core/` the project already decided which way the arrow points: **the contract is the code**, and a signature in a page spec is illustrative. When they disagree, the spec is wrong | T5 |
| 2026-09-23 | **No project board and no milestones.** Status is labels: Backlog is an open issue with no status label, In Progress adds `status:in-progress`, Done is closed as Completed with the label removed; `cycle-1/2/3` are the phases. **Why not:** for one person a board carries no information the labels do not, and a board nobody maintains is worse than none — it misleads with authority. The project-level record is this file, which carries the reasoning a one-line status never could. **Revisit when a second person joins**, because then a board is coordination rather than decoration. The peer-ai step that assumed a board is rewritten to point here | process |
| 2026-09-12 | **Names the owner would say (O4).** `categoryVariance` became `spendingByCategory`, `actualFor` became `movedInto`, `transactionsIn` became `movementsIn`. Four names were deliberately left alone — *protected*, *allowance*, *unallocated*, *safe to spend* — because they are the documented decisions and the words on the switches, and renaming them would cut the thread between the code and the spec for no gain | refactor |
| 2026-09-23 | **CI brought forward from phase 11b to now** (#52), because the phase file asks for exactly that: *"if you are starting a project and reading ahead, run this early."* Sixteen pull requests had merged saying no checks ran. **Only the checks** — branch protection, templates and the AI review workflow stay in 11b | #52 |
| 2026-09-23 | **The verify job runs `npm run verify` and nothing else.** Re-listing lint, typecheck and tests as separate CI steps would create a second opinion about what "passing" means, and the two would drift — the one that is easier to keep green wins, and it is never the real one. **Cost:** no per-step timing in the UI, and one red job rather than a precise one. Worth it for `green here` and `green there` being the same sentence | #52 |
| 2026-09-23 | **Repo rule 3 is enforced by a guard that cannot contain its own subject.** The forbidden names would breach the rule by being written down, so they arrive from the environment as a secret (rule 1's mechanism), and the guard reports `path:line` and **never the match** — this repository is public and so are its Actions logs. Unconfigured, it exits 0 but prints **NOT ENFORCED**; its own test plants a term and requires a non-zero exit, so the mechanism is proved live even when no terms are loaded | #52 |
| 2026-09-23 | **A heading inside a screen takes the label step, not the voice face.** EB Garamond is for screen titles, hero statements and the printed record (`tokens.md` §3), and the type table names it on the `title` step only. Home's two section headings were `font-voice text-h2` — Garamond at 22px where the design draws Inter at 10.5px uppercase. **Not a house-style preference:** the design-data contract gives typography to the design, and this was the code disagreeing with it silently | #55 |
| 2026-09-24 | **The lift shadow is on every primary button, not the Add action alone.** `tokens.md` §7 said one thing and every artboard drew another — `.btn-p` carries `var(--lift)` on Continue, Save, Finish and Get started alike. **The rulebook was the one that was wrong**, so §7 and §5 were corrected rather than the drawings. A disabled primary drops it: the lift says *press this*, and saying that of something which cannot be pressed is worse than saying nothing. The `lifted` prop is gone — a per-call-site opt-in is how half the buttons end up without it | owner, #73 |
| 2026-09-24 | **Questions for the designer go in `docs/open-items.md`, not in a message.** The designer already writes their answers there — their sections C through F each answer one round — so the questions now sit next to the answers instead of in chat history, and nothing has to be relayed by hand. A lettered section per round, answered in place. `check-design-drop.mjs` deliberately exempts that one file: guarding it would make asking a question require a design pull request | owner |
| 2026-09-24 | **Build a screen from its PNG, not from its markup.** Every screen built before this date was assembled from fragments grepped out of `canvas/*.dc.html`, and every one invented layout, copy or an interaction the design had already settled. The rule is now in `CLAUDE.md` §0 and the build step: open the PNG at 360 and 1440, light and dark, **describe the screen**, then read the markup as a tree for exact values. The old wording — *"the markup to read, not the PNGs"* — meant take values from markup rather than eyeball pixels, and was read as licence never to open the screens | owner, #72 |
| 2026-09-24 | **Ask for facts in the order the story happened, and derive the rest.** A debt asks what was borrowed and what has been repaid; the outstanding is a **read-out, not a field**. That is what makes the ambiguity impossible rather than merely unlikely — nobody can type the outstanding into a field that means the original, because there is no field for it. It is `transactions are the only facts` applied to a form | designer, §G |
| 2026-09-24 | **A record with standing must separate what was witnessed from what it was told.** The printed debt record carries the owner's account of what was repaid before the record opened — it must, or the record is incomplete — but says plainly that Mizaniya did not witness it. Presenting hearsay as its own observation would make the one artefact someone outside the household reads less trustworthy, not more complete | designer, §G |
| 2026-09-24 | **A check scoped to one unit is a check with a hole in it.** The 2px-grid migration was guarded by comparing the emitted stylesheet before and after — which found exactly one difference and felt conclusive. It compared only `px` values, so three broken **percentage** utilities went straight through, and the desktop dialog stopped centring for a day. The lesson pairs with the older one: a check that has only ever passed may be switched off, and a check that passes may simply not be looking where the damage is | #84 |
| 2026-09-24 | **v1 is a hosted webapp with a server; mobile is v2; there is no v3.** Outside interest arrived, and reading bank movement — the paid feature — *cannot* be done from a browser, so the server stops being a v3 luxury and becomes what the headline feature is made of. Repositioning now is chosen precisely **because little has been built**: the cost is rebuilding what exists, and that cost only grows. Bank sync is **designed in v1, built as v1.1**, so launch is not hostage to an aggregator contract that needs a registered business first | owner, [ADR-009](docs/adr/ADR-009-repositioning-v1-hosted-webapp.md) |
| 2026-09-24 | **Repo rule 1 is amended in writing: the server is in this repository, and public.** ADR-008's criteria were applied rather than the mood of the day — entitlement is enforced server-side, the full-stack story is the point of a public repo, and nothing in the code is a secret rather than a key. **The criterion that will move is named**: at the first paying user, "their trust is the asset" becomes true, and visibility is revisited by another written amendment | owner, ADR-008 criteria |
| 2026-09-24 | **Mizaniya reads bank movement; it never holds or moves money.** No custody, no transfer, no settlement — so none of the payment-licensing weight applies, and an earlier reading that assumed it did was wrong. What remains is narrower and unrelated: NDPR applies to processing the data, and **the aggregator's commercial onboarding is the real gate** — they bill per linked account, which is also why that feature cannot sit on a free tier | owner |
| 2026-09-24 | **Sync moves facts, never derivations.** Every money figure — safe-to-spend, rollover, projected gap, the debt balance, zakat — is derived, and ADR-003 (time is a parameter) plus ADR-004 (integer kobo) make that derivation deterministic. So no two devices ever have to reconcile two values of safe-to-spend; they recompute from the same rows and agree by construction. It shrinks the conflict surface to one row type (`PlanEntry`) and one singleton (`Settings`) | [ADR-010](docs/adr/ADR-010-sync-model.md) |
| 2026-09-24 | **"Open source" was the wrong word, and PolyForm already does what was wanted.** The intent is a repository that is *readable as proof of work* to investors and employers — not an invitation to alter the code. PolyForm Noncommercial gives exactly that: anyone may read and study it, nobody may commercialise it, and the owner keeps every commercial right. **No CLA is needed while no outside code is accepted**, and the project is described as **source-available**, not open source | owner |
| 2026-09-24 | **Learning mode is replaced: explanation comes out of the code and goes into one note per topic.** The three-line file header is **removed** across the repo, and a comment survives only where the code cannot speak for itself. In its place, `docs/engineering-notes/` carries one note per subject someone would actually ask about — what the problem was, what we did, the concepts, and **the why-chain pushed until it rests on a constraint rather than a preference**. A note may legitimately say *not built yet, here is when it would be needed* — **writing down a deliberate deferral is worth more than building the thing early.** Notes explain the system as it is now; ADRs stay immutable records of decisions | owner |
| 2026-09-24 | **Rule 6: every build is developed against seeded data, behind a toggle.** Dummy figures on demand so any feature can be exercised end to end. `npm run seed` already writes a restorable export, but it is a script — **the toggle inside the running app is the new part**, and it is also the honest reason nobody ever needs production data to reproduce a bug | owner |
| 2026-09-24 | **Offline is the selling point, so the phone stays in charge — ADR-010 accepted.** Budgeting only works if spending is recorded *at the moment it happens*, which is exactly when the signal is worst. An app that refuses the entry teaches people to stop entering, and **a budget nobody updates is worse than no budget** — it reports a comfortable number for what is left, and that number is wrong | owner, [ADR-010](docs/adr/ADR-010-sync-model.md) |
| 2026-09-24 | **When two people disagree about a shared budget, ask them — do not merge.** *"You set Food to ₦40,000, your wife set ₦35,000. Do you agree?"* A shared household budget **is an agreement between two people**, so a disagreement about it is a conversation, not a data problem for a timestamp to settle behind their backs. It requires the sync to **keep both values** rather than resolve on arrival — which is also easier to reason about than any silent merge rule. Two deliberate rules: one person on two devices, last write wins; two people, keep both and ask | owner, ADR-010 |
| 2026-09-24 | **Strong encryption now; end-to-end deliberately deferred — and the deferral is the conservative choice, not the compromise.** The owner wanted data *we* could not read. The goal underneath it — a breach must not be a catastrophe — is reached most of the way by encrypting the sensitive fields with **keys held outside the database**, which defeats the breach shapes that actually happen. Three things decided against going further now: a forgotten password destroys a budget permanently, **a paying customer cannot be supported by someone who cannot see anything**, and above all **the promise can be added later but never withdrawn** — retracting *"we cannot read your data"* is a worse day than a breach. Named openly: this does **not** defend a live server compromise | owner, [ADR-011](docs/adr/ADR-011-encryption-and-data-protection.md) |
| 2026-09-24 | **The middle option is the one with no reason to exist.** End-to-end encryption *with* a spare key held for recovery costs nearly as much engineering as the real thing while delivering only the weak guarantee, because the server can still decrypt. If that is where the reasoning lands, ordinary encryption is nearly as good for a fraction of the work. Recorded because it is the option that looks like prudence and is actually the worst trade in the set | ADR-011 |
| 2026-09-24 | **End-to-end encryption returns as an opt-in, probably paid.** *"Nobody, including us, can read your data — and nobody can recover it for you"* is an honest premium feature, because the person accepts the trade-off themselves. Forcing it on everyone at launch makes that choice on their behalf, and it is not ours to make | ADR-011 |
| 2026-09-24 | **The one thing encryption cannot claim, written down before anyone is tempted to claim it.** Bank movement arrives by webhook **to the server** — a browser cannot hold aggregator credentials — so the server necessarily sees it in plaintext for the length of one request before encrypting it to the person's public key. *"We never store your bank data readable"* is true. *"Your bank data never touches our servers"* is **false**, and writing it would be the most damaging thing this project could do to its own credibility. True under any encryption choice, which is why **the most sensitive data in the product was always the least protectable** | ADR-011 |
| 2026-09-24 | **The landing page is in scope and done properly, not a stub.** It is the first thing an investor, an employer or a user sees, so it is designed and briefed with the rest — not improvised from leftover components once the app works | owner |
## What Was Done — By Day

Newest first.

### 2026-09-25 (Friday) — the repositioning became real: schema, sweep, spec, brief

Seven pull requests, and no screen was built. That was correct: the day's work was
making the repositioning true in the repo rather than acting on it.

**Schema v2 landed (#94 / #95)** — every entity carries `updatedAt`, deletions leave
tombstones in their own table, and writes take `Unstamped<T>` plus the instant to
stamp with. Three things about it are worth keeping:

- **Tombstones are a table, not a column.** A `deletedAt` column would have put deleted rows into `Snapshot`, and then every derivation and selector would need a filter — where the one that forgot would count deleted money. With a separate table **nothing in `core/` changed at all**.
- **Callers cannot pass `updatedAt`.** `{ ...category, name: 'Food' }` is how everyone edits an object and it carries the old timestamp forward. Nothing fails; the row quietly stops winning comparisons it should win. The type refuses it instead.
- **A bug was found that would have broken every existing backup.** `readExportText` validated against the current schema *before* migrating, so the moment schema 2 required a field schema 1 lacked, every export file on disk would be refused as malformed — by the check standing in front of the migration written to add that field. Reordered to envelope → migrate → validate → write.

**Learning mode was replaced, and the code was cleared (#93 / #97).** The owner's
version: explanation comes out of the source and goes into one note per topic, with
the why-chain pushed until it rests on a constraint. Ten notes written in
`docs/engineering-notes/`, then the three-line header removed from 105 files —
**1,083 deletions, zero insertions** — and `docs/concepts/` deleted once each of its
files had somewhere to go.

The notes went through three drafts before the style was right, and the owner's
diagnosis of the second was the useful one: *"everything is just talking about
concepts, it's not storytelling of somebody that knows what they are doing."* Asked
*why IndexedDB*, the draft described IndexedDB and then listed alternatives. The
causality ran backwards. It now starts where the decision started — the app had to
work offline on a phone, which means no network call to read your own budget, which
means the data lives on the device, **which is what leaves IndexedDB as the answer
rather than the preference.**

**Two invented details were caught by checking against the code**, and both are
recorded in the notes README as the reason rule 6 is *verify claims against the
code*: a test guarding `types.ts` against `schema.ts` drift that does not exist, and
guessed money test names. The real gap turned out to be more useful than the
invention — Zod strips unknown keys, so a field added to the types and forgotten in
the schema is **silently dropped** from any imported file.

**The re-spec (#99 / #100).** Five new story groups, and three decisions taken
first: email and password; free is the whole app on one device with paid adding
sync, household and bank; household designed now and built after launch.

The free/paid answer simplified more than expected. **An account is an upgrade, not
a gate** — so onboarding is untouched and **there is no signed-out state to draw for
the main screens**. Signed out is not a degraded Home, it is Home.

The endpoint spec settled the two questions ADR-010 parked there, and in both cases
the reasoning outlives the number:

- **Tombstone retention is 180 days, and correctness does not rest on that.** It rests on an expired cursor producing a *full* resync rather than a partial one — so the figure is a storage choice that can be retuned safely. A design whose correctness depends on a tuning constant is one that will eventually be broken by somebody tuning it. The resync order is the part that bites: push local changes first, then replace local state, because a resync that pulls first is data loss with a progress bar.
- **Clock skew:** a server sequence gives the order, the client's timestamp breaks ties only, and a timestamp more than five minutes in the future is clamped — because a device whose clock reads 2027 would otherwise win every conflict permanently with no way to correct it. Past timestamps are deliberately not clamped: an edit genuinely made offline three days ago should keep its time.

**Two clauses flagged for whoever implements them.** A lapsed account must still be
able to retrieve its own data — sync stops, portability does not, and anything else
holds someone's financial history hostage to a failed card payment. That is the
clause a blanket entitlement middleware would silently drop. And the password reset
flow must not be built in a way that becomes a lie if end-to-end encryption is ever
enabled, since the password becomes the key at that point.

**The design brief (#101)** went out as one document rather than a drip of requests,
leading with what is *not* changing because that is the larger half. Section H of
`open-items.md` carries eight questions, three of them things the designer is
expected to argue with. Item 29 reaches beyond design: the sentence *"your bank data
never touches our servers"* must never appear, because it is false, and the wording
at sign-up and on the landing page has to be identical.

**The lesson repeated twice in two days.** The header sweep's first attempt deleted
`@vitest-environment jsdom` out of nine test files and 80 tests lost their DOM. The
check meant to make it safe confirmed each header had exactly three fields and never
asked whether it had *extra* lines — **a check with a hole in it**, which is #84's
percentage utilities wearing a different hat. Both instances are now named in *The
principles this project keeps returning to*, near the top of this file, along with
*what breaks and who finds out* — which moved here when `docs/concepts/` was deleted.

**Verify green all day: 416 tests, up from 384.** The new ones were checked by
breaking the code on purpose — a wrong backfill value, the old validate-then-migrate
order, and the settings singleton left out of the upgrade loop each fail a named
test rather than passing quietly.

### 2026-09-24 (Thursday, the turn) — the product was repositioned, and the build stopped to let it

**Nothing was built today. That was the point.**

The owner had been talking to people about Mizaniya, and some of them may want to
use it. That alone would be weak evidence — interest in conversation is the
weakest signal there is — but it arrived next to two facts that were stronger.

**The paid feature cannot exist without a server.** The intended bank integration
is read-only: see that money left the account, and ask which envelope it belongs
to. Mizaniya never holds or moves money, so the payment-licensing weight an
earlier reading had assumed simply does not apply — that reading was wrong and is
recorded as wrong. But an aggregator cannot be called from a browser. The
credentials, the token exchange and the webhooks need somewhere private to run. So
the server stopped being a v3 luxury and became the thing the headline feature is
made of.

**And the moment to turn was now, because little has been built.** T1–T15 are
closed, T16 is half-started, and #72's conformance pass had already stopped three
screens short. Every ticket from T16 on assumed a single owner on a single device.
Building six more of them and then adding accounts is the expensive order.

**What was decided** — [ADR-009](docs/adr/ADR-009-repositioning-v1-hosted-webapp.md):
v1 is a hosted webapp with accounts, sync, tiers and a landing page; mobile becomes
v2; **v3 dissolves into v1**. Bank sync is *designed* in v1 and built as v1.1 — the
aggregator needs a registered business before it will onboard anyone, and that is
calendar time the build should not sit inside.

**Repo rule 1 was amended in writing, which is the only way it may be changed.**
ADR-008 had deferred the server's visibility to v3 *against written criteria*
precisely so this decision would be made on evidence. The criteria were applied:
public, in this repository, with infrastructure and secrets private. The criterion
that will eventually move was named rather than ignored — at the first paying user,
"their trust is the asset" becomes true.

**Two corrections to the plan as proposed**, both of which the owner was right
about:

- The regulatory objection was wrong and was dropped. What survives is smaller and
  is about *data*, not money: NDPR applies regardless, and the stakes go up rather
  than down, because a leaked table of real transaction histories is a different
  category of event from a leaked file of invented seed figures. **Rule 6 is owed**
  — in the owner's own words, since the rules are verbatim and not paraphrased.
- "Open source" meant *visible as proof of work*, not *open to contribution*.
  PolyForm Noncommercial already does exactly that, so the worry about contributor
  licensing was misplaced. **No CLA is needed until outside code is accepted.** The
  only change is the word: **source-available**.

**And one correction the other way.** The recommendation had been to finish #68,
#70 and #69 first. The owner's counter — those screens change under the
repositioning, so finishing them means building them twice — is correct, and #72
is parked half-done instead. Home stays incomplete on purpose.

**[ADR-010](docs/adr/ADR-010-sync-model.md) was written and is awaiting sign-off.**
Its useful finding was not the recommendation but something the code revealed:
**no entity carries `updatedAt`, `deletedAt` or a revision counter** — a grep
across `src/` returns nothing. So last-write-wins cannot be implemented at all,
and **a delete can never propagate**: device A removes a category, device B still
has it, and the next sync resurrects it. That is a migration across every entity,
and it is cheapest today, while the owner's device holds the only data that exists.

The other half of the ADR is the reason this is tractable: **sync moves facts,
never derivations.** Every money figure is derived, and ADR-003 and ADR-004 make
the derivation deterministic, so the conflict surface is one row type and one
singleton against a transaction log that merges by construction.

**Learning mode was replaced**, and the owner described the replacement the same
day. Explanation comes out of the code — the three-line header goes, and comments
stay only where the code cannot speak for itself — and moves into one note per
topic in `docs/engineering-notes/`: what the problem was, what we did, the concepts,
and the why-chain pushed until it rests on a constraint. *"How did you manage 1000
data? Caching. Why caching? Why?"* — the note has to survive that. A note may also
say a thing is deliberately not built yet, which is often the better note.

An earlier call in this session was overruled and rightly: the file header had been
retained as house style on the argument that a hundred files already carried one.
The owner wants the code cleared. The WHY lines are harvested into the topic notes
as the sweep removes them, so the reasoning is relocated rather than deleted.

**Nothing ran.** No code changed, so `npm run verify` was not the gate today; the
gate was that the repositioning is written down before a line is built against it.



**The day's finding, and it governs everything below.** The owner ran the app
and said the build had *"deviated hugely"* from the design. They were right.
Every screen had been assembled from **fragments grepped out of
`canvas/*.dc.html`** — a class here, a path there — rather than from the
artboards. That is sampling, not reading a design, and it is why every miss
arrived one at a time and was found by the owner rather than by me.

`CLAUDE.md` said *"`canvas/*.dc.html` is the markup to read, not the PNGs"*,
meaning **take values from markup rather than eyeballing pixels**. It was taken
as licence never to open the screens at all. §0 and the build step now say the
opposite in as many words: **open the PNG first, describe the screen, then read
the markup as a tree.**

- **Welcome, rebuilt** (#75, #77). The three tiles were all emerald where the
  artboard draws `em2`/`sl2`/`oc2`; the mark was a bare mizan where the artboard
  draws the app icon; *"Everything stays on this device"* belonged to the launch
  panel; 1440 was the 360 layout stretched, not the two-column one with **longer
  copy in the cards**. Then two more the owner caught by eye: the Arabic sat
  under the Latin instead of at the column's right edge, and rendered at **57% of
  its drawn size** — an SVG height is not a font size, and the outline spans
  1.76 em. `brand/README.md` has the real rule: **0.62 of the Latin**.
- **The launch screen exists** (#78), on the moment the app already spends
  opening IndexedDB. No artificial delay, no spinner — the artboard draws none,
  so it carries `role="status"` and an `sr-only` line instead.
- **Onboarding, rebuilt** (#80), then **corrected to §F** (#83). The headings
  were labels for the fields rather than the questions. Step 5's direction was a
  **switch**, which has a default — on the one field where getting it backwards
  inverts the whole record. Step 3 had no way to remove a category at all.
- **CI exists** (#54) and **the seed script** (#59), both brought forward.
- **Home, first half** (#88). The gauge had **no scale**: §6 asks every diagram
  to carry a text key, and the amber threshold is a figure nobody can derive by
  looking.

**The designer answered four rounds in a day** — §C to §G of `open-items.md` —
and was right every time it mattered:

- **The space scale was a fiction.** I thought four values in Welcome were the
  problem. They audited all 59 boards: **55% of spacing off the nine-step scale,
  and 10px — the most-used value in the whole design — not on it at all.** §5 is
  a 2px grid now. 210 classes remapped (#82).
- **The wider type rung follows the *surface*, not the viewport.** My tokens
  widened on a media query, which is wrong for a 620px card, a 520px column and
  a 480px dialog alike. Opt-in now (#83).
- **The lift shadow** was on every primary button in every artboard while §7
  said "the Add button only". The rulebook was what changed (#76).
- **The copy pass.** The owner said *"counterparty"* is not how anyone speaks,
  and was right that it was bigger than the six labels named. `tokens.md` §10 is
  new, with a rule worth keeping: **a field asks a question; a column head names
  a thing.** `Unallocated` became **`Free`** — Home had always drawn *Free* for
  the same quantity, so two screens were naming one number two ways.
- **A debt records what is owed but not what has been paid** (#85, §G). Their
  answer is better than the question: **do not ask for the outstanding at all.**
  Ask what was borrowed and what has been repaid, and derive the rest — so
  nobody can type the outstanding into a field that means the original, because
  there is no field for it. And the printed record must **separate what Mizaniya
  witnessed from what it was told**, because a record meant to have standing
  between two people cannot present hearsay as its own observation.

**Three things I got wrong, all the same shape — trusting a proxy for the thing
itself:**

1. **`git add -A` swept a whole design drop into a feature commit. Twice.** Both
   times the designer noticed and I did not, the second time four hours after I
   had recorded the lesson. `scripts/check-design-drop.mjs` is the mechanical
   version of a resolution that failed twice.
2. **The grid migration broke `left-1/2` into `left-4/2`** — a class that does
   not exist, so Tailwind emitted nothing and the desktop dialog stopped
   centring, with the naira sign off-centre in every amount field for a day.
   **The check that was meant to guard that migration compared only `px`
   values, and these are percentages.** A check scoped to one unit is a check
   with a hole in it, and the hole was exactly where the damage landed.
3. **Reading the design by grep**, which is the same error at a larger scale.

**Questions now live in `docs/open-items.md` §G**, not in a message. The
designer already wrote their answers there; now the questions sit beside them
and nothing is relayed by hand.

### 2026-09-24 (Thursday, later) — the designer's three follow-ups, and the welcome screen

- **#60 · the voice face.** A sheet title takes it (`font-voice text-title`),
  because the voice face names a **surface** and a sheet is one while it is
  open. `--weight-voice` is 500 on light and 600 on dark: EB Garamond's hairline
  is 1.02 device pixels at 30px on a 1× screen, and at 500 on dark it is drawn
  by antialiasing alone. The `title` step's 1440 size is a **token**, not a
  `desktop:` variant on eight call sites — one definition, and none of them able
  to forget. A test pins the weight in all three theme blocks, because a token
  that differs between themes is exactly the one that can quietly stop
  differing.
- **#62 · the welcome screen.** The three promises had no icons; the artboard
  puts each in a 38px tinted square, and the glyphs did not exist. Lifted
  path-for-path. The tile did exist — `IconTile` with tone `positive` is already
  `bg-em2 text-emerald`. The wordmark was 30px where the artboard draws 42/48,
  so **the app's name rendered smaller than the sentence under it.** Added as a
  `lockup` step rather than reached for with an arbitrary class.
- **Open item 5 built that screen's *behaviour* and was ticked on that basis,
  and nothing in it was wrong.** A list of behaviours is not a design-quality
  pass, and ticking one as though it were is how a screen ships looking
  unfinished. Noted in `open-items.md`.
- **#61 · Home at 360.** The ranked section, which never existed. The settled
  rule — **the heading names what the list is showing** — also decides the state
  nobody specified: no *"Needs attention · 0 of 8"*, just the worst three headed
  *Categories*.
- **Rendered one or the other, not both behind `desktop:hidden`.** That pattern
  is right for the nav and the rail, which say the same thing in two shapes. It
  is wrong when the two carry **different** content: hiding a duplicate would
  leave two identical `Categories` headings and eight repeated rows in the
  document. Hence `useMediaQuery`, which answers `true` without `matchMedia` so
  every existing test keeps the fuller layout.
- **Home listed twelve categories where the artboards draw eight.** Protected
  lines are money already moved where the plan promised, so `statusOf` gives
  them `ok` unconditionally — four rows that could never need attention, and a
  count reading `2 of 12`. Filtered, and the desktop table gained the count
  badge it was drawn with.
- **The finding that matters most, and it was an accident**
  ([#65](https://github.com/AbuMahir980/mizaniya/issues/65)). My first
  assertions came from `docs/seed-data.md` and failed: Home's fixture seeds its
  **own** split — 78/22/10 — whose total is right and whose distribution is not.
  Under it **Health sits at 100% and reads `Low`, where the document has it at
  140% and `Overspent`.** Home's most important state is not the one its tests
  exercise, and the seed document chose those figures precisely so that it would
  be. Nineteen green tests never said so; writing a twentieth against the
  specification did.

### 2026-09-24 (Thursday) — the seed, and what it refused to invent

- **T21 · the seed script** ([#28](https://github.com/AbuMahir980/mizaniya/issues/28)),
  brought forward so the remaining screens get a design-quality pass against
  real figures rather than zeros. **It writes an export file, not a demo mode.**
  v1 has no server and the repository is IndexedDB, which a Node script cannot
  reach — and CLAUDE.md forbids a mock-data layer. Generating the documented
  export format means sample data arrives through the import path T9 already
  built, nothing ships in the production bundle, and what you look at is the
  real code running.
- **Asked for, and answered: seeded data, not a state-switcher panel.** A panel
  that injects states *is* a mock-data layer — a second account of what the app
  looks like, maintained by hand, drifting. Seeding writes real rows.
- **`--current` shifts the scenario by whole months**, so the salary day stays
  the 25th and today falls inside the seeded cycle. Fixed dates would have made
  the demo correct only on 5 October.
- **The test parses `docs/seed-data.md` and compares row for row.** The document
  asked for this in its own words — *"a future edit to one row cannot quietly
  break every figure in the documentation and the designs"* — so the document is
  the source and the code is checked against it, not the reverse. Four tests
  break a figure on purpose and require the refusal, including one that moves an
  expense between categories while keeping the total at ₦110,000.00, which is
  exactly the edit a sum-only check waves through.
- **A test that passed for the wrong reason, caught immediately.** The first
  "assertion fires" test edited `transactions.find(t => t.type === 'expense')`
  — which is the *previous* cycle's food row, correctly ignored. It proved the
  cycle filter works and nothing else.
- **Two things it refused to seed** ([#58](https://github.com/AbuMahir980/mizaniya/issues/58)).
  The first cycle's ₦355,000.00 spend has no documented category split beyond
  food's ₦78,000.00, and the amber variant's extra ₦50,000.00 has none at all.
  Both could have been filled with something plausible. **A plausible invented
  figure is indistinguishable from a documented one six months later, and
  becomes the reference** — so they are a ticket instead. The visible cost is
  that Months will show the first cycle at ₦78,000.00 until it is closed.

### 2026-09-23 (Wednesday, late) — the designer answers, and both questions were better than they looked

*Design drop, produced outside the session. `docs/open-items.md` § D carries the
full reasoning; this is the summary and what it means for the code.*

- **The bottom-sheet title does take the voice face, and the artboard's size was
  wrong.** The settled rule is now in `tokens.md` §3: **the voice face names a
  surface, the structural face names a part of one.** A sheet *is* the surface
  while it is open — it holds focus, Escape closes it, everything behind it is
  inert — so its title is a `title`, not an `h2`. Our code was wrong for a
  defensible reason and is wrong all the same.
- **The reviewer was reading a real fault, but it was the size, not the face.**
  EB Garamond's x-height is 0.407em against Inter's 0.546, so a 24px serif title
  is optically Inter 18px — *below* the `h2` it was meant to lead. An undersized
  title reads as a misapplied serif. The artboards are re-cut to **30 / 36**.
  **This is the best outcome available:** the complaint was right, the proposed
  remedy — drop the serif — would have removed the wrong thing.
- **And a second fault nobody had named.** EB Garamond's thinnest stroke is
  0.034em — **1.02 device pixels at 30px on a 1× screen**, under one pixel at
  anything smaller. A stroke with no whole pixel to land on is drawn by
  antialiasing alone, and on dark that reads as washed out. Hence
  `--weight-voice`: **500 on light, 600 on dark**. It never appears on a 2×
  screen, which is exactly why it surfaced in review on a desktop monitor.
- **"Categories" versus "Needs attention" was never a conflict.** They are two
  states of one section, and **the heading names what the list is showing**.
  Page specs §429 sits inside an ASCII sketch of the *superseded* 2×2 Home and
  is not a copy spec. At 1440 it is the full table, headed *Categories* — which
  is what we built. At 360 it is a ranked subset headed *Needs attention* with a
  `2 of 8` pill and a *Show all 8 categories* link, **which we never built at
  all.** Eight rows at 360 push *Safe to spend today* off the screen, and that
  figure is the reason Home exists.
- **Housekeeping, caught by the designer and not by me.** These files landed in
  the worktree while T16 was in flight, and `git add -A` swept `tokens.md` and
  68 re-rendered previews into `c400f07`, a commit titled *"feat(core): the
  eight movements"*. Split out: T16's commit is now `9e4f83e` and carries only
  its own work, and the design drop is this one. **Two agents sharing one
  worktree makes `git add -A` unsafe** — stage by path when anything else may be
  writing.
- **Three code follow-ups**, none of them done here: open items 9 (`sheet.tsx`,
  one class), 10 (Home's mobile section, T13), 11 (`--weight-voice`).

### 2026-09-23 (Wednesday, night) — the serif was right, the heading was not

- **Outside feedback said the Quick Add title was wrong to be a serif.** It was
  aimed at the **artboard**, not the app: `QADark.dc.html` draws that title with
  `class="ser"`, and the built sheet has rendered it in Inter since T10. The
  serif itself is the design system — `tokens.md` §3 gives EB Garamond to
  *"screen titles, hero statements, the printed record"*, and the canvas uses it
  for exactly that: the wordmark, the Home date, six screen titles, the
  onboarding questions and the empty-state sentences. Nothing else.
- **Checking it found a real deviation next door**
  ([#55](https://github.com/AbuMahir980/mizaniya/issues/55)). Home's two section
  headings were `font-voice text-h2` — Garamond at 22px — where the design draws
  `class="lab"`: Inter, 10.5px, uppercase, `+0.115em`, `var(--soft)`. Wrong face
  and roughly double the size. `plan-screen.tsx:96` had it right all along.
- **The grain of truth in the feedback was on a screen nobody mentioned.** Home
  is the screen the app exists for and the first image in the README, and
  oversized serif headings are most of why it reads "printed document". The
  complaint was about the wrong screen and the right instinct.
- **Two conflicts logged rather than decided**, per the design-data contract's
  *"never silently pick one side"*: whether a bottom-sheet title takes the voice
  face (the artboard says yes, the code says no, and the type table can be read
  either way — a sheet is not a screen), and whether Home's first section is
  *Categories* (page specs §429) or *Needs attention* (the artboards). Both are
  in Open Questions for the designer.
- **This is a design-quality-pass miss on T13, not a new class of bug.** The
  gate exists and is mandatory; it did not catch this because it was not run
  properly. No test was added — a class-assertion test would be brittle and
  would not have caught it either. The gate is the fix.

### 2026-09-23 (Wednesday, evening) — CI, eleven days late

- **`.github/workflows/pr-checks.yml` exists** ([#52](https://github.com/AbuMahir980/mizaniya/issues/52)).
  Three jobs: **verify**, **repo rules**, **secret scanning**. Brought forward
  from phase 11b on the phase file's own advice — sixteen pull requests had
  merged on a human reading a local verify, each one saying so on the PR.
- **The verify job runs one command and no more.** `npm run verify`, the same
  one a laptop runs. A workflow that re-lists lint, typecheck and tests as
  separate steps is a second definition of "green", and two definitions drift.
- **`.nvmrc` now decides the Node version** for both CI and the dev machine.
  `engines` said `>=20` and the machine was on 24; CI naming a third number
  would have been how it ends up testing a runtime nobody develops on.
- **Repo rule 3 finally has enforcement, and the awkward part was the obvious
  part.** The check is for third-party names, and writing the list into the
  repository *is* the breach — so the terms come from the environment as a
  secret, which is what rule 1 already says about every credential. The guard
  prints positions and never matches, because this repo is public and so are
  its Actions logs.
- **Unconfigured is announced, not assumed.** With no terms set the guard exits
  0 and prints `NOT ENFORCED`, plus a GitHub annotation on the run. Its test
  plants a term in a throwaway repository and requires exit 1 — so the
  mechanism is proved on every run even while the term list is empty. **The
  distinction worth keeping:** that is a check with nothing loaded, not a check
  switched off, and the two look identical from the tick alone.
- **Found while updating this file: ten tickets are missing from the day log.**
  T6 through T15 have no entry. The last one here is T4. Logged as
  [#53](https://github.com/AbuMahir980/mizaniya/issues/53) rather than fixed in
  the CI pull request, because it is a different piece of work — but it is the
  same failure as the state file naming #10 three days after T3 merged, and it
  is why a new session has to be told where it is instead of reading it.
- **Still open:** branch protection needs repo-admin hands, the scanning action
  is pinned to a tag rather than a SHA, and `FORBIDDEN_TERMS` is unset.

### 2026-09-23 (Wednesday, later) — the boundaries were never enforced

- **`boundaries/dependencies` had reported nothing since SHARED RULES.** A `ui`
  file importing the store, a `data` file importing the store, and the app
  importing `data` all passed a green lint. A2 — the layered architecture
  ADR-002 leans on when it says `core/` can stay a folder because the lint rule
  holds the boundary — was decorative for twelve days.
- **Three faults, and the third hid the others.** The element patterns asked for
  folders (`src/ui/*`) in a flat codebase, so nothing was classified except
  `core/`, whose files sit in subfolders and which imports nothing anyway. Then,
  once files classified, the import *target* still would not resolve: only
  `eslint-import-resolver-node` was present, and it reads neither `.ts` nor the
  `@/` alias. **An unresolved dependency is compared against nothing.**
- **The 11 September verification was real and touched a different rule.** The
  three violations injected into `core/` — a React import, an alias import, a
  `Date.now()` — are all `no-restricted-imports`, which works and still works.
  The lesson is narrower and worse than "they didn't check": they did check, and
  checked the neighbouring rule.
- **I was confidently wrong on the way.** I read the policy shape as the fault
  and rewrote it flat; the plugin's own deprecation warning then said the nested
  form was current and the original shape had been right all along. Recorded
  because the wrong diagnosis was plausible and produced a clean-looking fix.
- **It immediately found a real violation:** `app/app.tsx` imported `data/`
  twice, to build the Dexie repository and the notifier. That wiring moved to
  `store/create-app-store.ts`.
- **[src/architecture.test.ts](src/architecture.test.ts) now holds the line.** It
  writes a file into each layer, runs ESLint on it, and requires the violation to
  be reported — five that must fail, two permitted directions that must not. It
  costs about twelve seconds because it shells out to ESLint nine times, which is
  the price of testing the configuration rather than a mock of it.
- **The general lesson, for the review checklist:** a lint rule that has only
  ever passed is indistinguishable from one that is switched off. *What breaks —
  and who finds out?* applied to the enforcement layer itself.

### 2026-09-22 (Tuesday)

- **The design stop came back and checked itself against the code.** It produced
  the production brand files, a corrected primitives sheet, and
  [docs/open-items.md](docs/open-items.md) — a worklist of what the design has
  that the code does not, each item against the ticket that takes it. The design
  itself needs no regenerating; what is left is wiring.
- **The primitives sheet was the thing that was wrong, not the code.** The 10
  September drawing disagreed with `tokens.md` in five places — a rose Delete
  button, a rose field error, disabled as an opacity, an invented 3px halo on
  every control, and hover and pressed colours nobody had implemented. `src/ui/`
  follows `tokens.md`, so the sheet was redrawn to match the code. **The code must
  not be changed toward the old picture**; the Quick Add artboards lost their red
  Delete for the same reason.
- **Checked the five corrections against the source rather than taking them on
  trust.** All five hold: `button.tsx` has no danger variant and says why in its
  header, `field.tsx` styles an error with a neutral border and an `ink` message,
  disabled is a `track` fill with `faint` text throughout, the global focus ring
  in `index.css` is 2px emerald at 2px offset with the 3px `em2` halo reserved for
  fields, and pressed is the primary at 90% opacity.
- **The state file had gone stale and would have cost a session.** It still named
  #10 as the next ticket, three days after T3 merged — so the next session would
  have built T3 again. Advanced to #11 with the verify result recorded.
- **`node_modules` was missing entirely on this machine**, so the first verify run
  failed with `eslint: command not found` rather than anything to do with the
  code. After `npm ci`, verify is green: naming, lint, typecheck, **102 tests**,
  production build. Worth knowing that a fresh checkout needs an install before
  the gate means anything — an exit code from a missing binary looks nothing like
  a passing one, but a summary line can flatten the difference.
- **Found a repo-rule-3 breach already committed.** A third-party project name
  appears in `CONTEXT.md` and in two `peer-ai-feedback.md` files, one of them the
  vendored upstream copy. Commit messages are clean. Raised for the owner rather
  than fixed unilaterally, because the vendored copy would conflict on the next
  pull and the public history is the owner's call. **This is the second time rule
  3 has been the rule that slipped** — it is still the only repo rule with no
  automated enforcement.
- **Settled the skills question, and it was never what anyone thought.** The ten
  are ordinary plugins in the public `anthropics/knowledge-work-plugins` repo,
  installable with one command. All three are now installed, along with
  `pr-review-toolkit`. See *Environment* above for the command and the lesson.
- **Three wrong diagnoses in a row before the right one**, each from looking in a
  single place and concluding something about the whole system. What settled it
  was the owner's screenshot of the plugin's own README, which carried the
  install command all along — a reminder that the person with the screen often
  has better evidence than the agent with the filesystem.
- **`peer-ai/AGENTS.md` corrected.** Its "run every skill-naming phase in the
  desktop app" instruction had been steering this project for two weeks on a
  wrong diagnosis, and is gone.
- **Checked, not assumed: no general backend or devops plugin exists** in either
  marketplace. That coverage is vendor-shaped and becomes a question at v3.

### 2026-09-23 (Wednesday)

- **T4 · `core/debt`** ([#11](https://github.com/AbuMahir980/mizaniya/issues/11),
  PR #38) — balances that cross zero. A debt has no direction field; the balance
  is a signed sum, so the ajo crossing needs no special case at all. The test
  walks a whole ajo round rather than asserting two states either side, because
  the bug being designed against only exists *between* two valid states.
- **The pairing that explains the architecture:** `lent` and `repaid` both take
  cash out of the account and mean opposite things for the relationship. That is
  why cash left and a debt balance are two separate calculations over the same
  facts, and there is a test holding both ends (D3).
- **T5 · `core/goal`** ([#12](https://github.com/AbuMahir980/mizaniya/issues/12),
  PR #39) — the projected gap counts **paydays**, not elapsed time. "On or
  before" is the whole decision: 25 February really does land before a 1 March
  deadline, and counting whole cycles would discard it and invent a ₦50,000
  shortfall that is not there.
- **The compiler caught what the tests did not.** T5's first run passed vitest
  and failed `tsc`: `expect(x.kind).toBe(...)` does not narrow a union, so three
  assertions read a field missing from one variant. The fix was not a cast —
  `remaining` moved onto all three variants, because every goal card draws a
  progress bar whether or not it has a deadline. The union was doing its job.
- **One argument order across `core/`**, and page specs §456 corrected to match
  the code rather than the other way round.
- **Settled the project-board question in writing** rather than leaving it an
  unexamined absence. The peer-ai step that assumed a board now points at this
  file, and the label lifecycle — including *remove `status:in-progress` on
  close* — is written down, because closing an issue does not remove it and a
  finished ticket still labelled in progress misleads with authority.
- **Merged #37, #38 and #39.** #39 needed three attempts: GitHub reported the
  head branch out of date while the branch was current, then returned a server
  error. Both were transient staleness on their side, not a conflict — worth
  knowing before anyone force-pushes to "fix" it.

### 2026-09-12 (Saturday)

- **T3 · rollover** ([#10](https://github.com/AbuMahir980/mizaniya/issues/10), PR
  #35). The idea that dissolves the trap: **rollover carries permission, not
  money.** The unspent twelve thousand never left the account, so it is already in
  cash left this cycle and the next. What rollover changes is whether spending it
  on food counts as overspending.
- **The first test is the one that matters:** cash left is identical with rollover
  on and off. Two columns that never meet — cash comes from transactions, the
  allowance is planned plus carried. If that test ever fails, the same naira is
  spendable twice.
- **A naming pass over `core/`** (PR #36), on O4 — name things as the owner would.
  "Variance" is an accountant's word; nobody looking at their food budget says *my
  variance*, they say how much is left. Four names were deliberately left alone,
  and the brief and the kick-off pack keep their wording: they are the record of
  what was asked for, and rewriting the request to match the answer would lose the
  one thing they are for.

### 2026-09-11 (Friday) — the build starts

- **SHARED RULES.** `package.json` exists, so the verify gate stopped being "none
  yet": lint, typecheck, 33 tests and a production build, 69 kB gzipped against a
  250 kB budget. Tokens landed in `src/design/` as typed data *and* as custom
  properties, with a test that fails when they drift.
- **Twenty primitives built from `tokens.md`,** each with its states, plus a
  gallery page showing every one in both themes.
- **Auditing that gallery in a real browser found three touch targets under
  44px** — a banner action at 39px wide, and the switch and slider thumbs at 28px.
  The token always said 44px is the *hit area*, not the visual box, so the switch
  and slider kept their size and grew an invisible target around themselves. All
  forty interactive elements pass.
- **`docs/05-coding-standards.md` maps every `auto` rule to the thing that fails
  the build,** and marks honestly which are enforced, which are partial and which
  are not yet, naming the phase each lands in. D1, F1 and G4 are still off, with
  the reason recorded. Claiming a rule is enforced when nothing checks it would be
  worse than the gap.
- **FRONTEND RULES — the boundaries became machine-checked.** And they were
  verified by breaking them: three violations injected into `core/` — a React
  import, an alias import and a `Date.now()` — each failed the lint before the
  file was restored. A green run proves nothing until the rule has been seen to go
  red.
- **Two lint rules earned their keep immediately.** Banning `Date` outright in
  `core/` was too blunt and caught `schema.ts` parsing a date to check that
  2026-02-30 is not real, so it became two precise selectors for reading the
  clock. And a multi-line CSS comment exposed a parser bug in the token test that
  would have let a token drift silently.
- **ISSUES — twenty-two tickets filed as #8-#29,** with acceptance criteria as
  tickable boxes, labelled by cycle, area and size. The plan had no queue behind
  it, which is the same failure just fixed upstream: a document in a repo is not a
  queue anyone works from.
- **Pulled the vendored `peer-ai/` up to `790aa8a`** as a three-way merge rather
  than a copy, resolving three conflicts where a local hand-patch met the upstream
  fix for the same defect. The workflow driver took upstream's wording wholesale —
  two versions of one fix is how a vendored copy diverges.
- **The post-pull scripts earned their keep.** `strip-model-switching` caught the
  model-tier table that taking upstream wholesale had reinstated in the driver,
  and flagged a new Model selector row, which the script now removes rather than a
  human doing it every pull — because removing it by hand every time is exactly
  how a post-pull script rots. `apply-phase-config` was also made to **fail
  loudly**: it used to print "files missing : 5" and exit 0.
- **Wrote `check-upstream.mjs`,** so the vendored copy reports its own staleness
  and names which of the changed files the active phase is about to read.
- **All four of this project's framework defects are fixed upstream** — items
  **29-32**, applied in `790aa8a`. They had never reached the Peer AI repo, because
  the playbook is copied into each project rather than linked, so the loop only
  ever closed by hand and nobody had closed it. The "Open" section of
  `docs/peer-ai-feedback.md` is now empty and the write-ups are kept as the record.
  **Do not re-report them.**
- **ADR-008** — the clients share one repository; the server's visibility is
  deferred to v3 against criteria written down now. The monorepo proposal collided
  with repo rule 1, so the question had to be split before it could be answered:
  whether the clients share a repository is independent of whether the server is
  public.
- **T1 · `core/cycle`** ([#8](https://github.com/AbuMahir980/mizaniya/issues/8),
  PR #31) — boundaries, days left and paydays.
- **T2 · `core/budget`** ([#9](https://github.com/AbuMahir980/mizaniya/issues/9),
  PR #33) — cash left, protected remaining and safe to spend. The headline figure
  and everything Home is built on, computed on read and stored nowhere. 24 tests
  pinning every figure the seed data publishes, because those numbers are in the
  documentation and on 67 artboards.
- **The first T2 run failed on the fixture rather than the code:** scaling the
  expense split produced fractional naira and the `naira()` guard rejected it —
  which is the guard doing its job.
- **Learned how to merge a stack, the expensive way.** The merge policy was
  written for a single branch off `main`, and merging nine stacked PRs broke in
  three ways it did not cover: squashing rewrites the commits beneath so every
  later PR conflicts; GitHub does not reliably retarget a PR when the one below it
  merges; and deleting a branch another PR is *based on* closes that PR, after
  which GitHub refuses to reopen it because its base is gone. All three are now
  written into the merge policy in `CLAUDE.md`.

### 2026-09-10 (Thursday)

- **First learning-mode stop.** Worked through the review questions from SETUP. Two answers landed on the symptom but stopped short of the mechanism: the stored safe-to-spend field would be too high (B3), and copying rules means editing five places instead of one (E1/E2). Both missed the same half — that nothing would report the fault.
- **Named the pattern and gave it a method.** *What breaks — and who finds out?* Loud problems are cheap; silent ones are expensive. Written up as the first concept note; it now lives as a named principle near the top of this file, `docs/concepts/` having been replaced by `docs/engineering-notes/`. It reframes B3, E2 and K4 as one rule about detectability wearing three hats.
- **Opened [docs/concepts/revisit.md](docs/concepts/revisit.md)** with that thread logged against the moment it will matter: building safe-to-spend in `core/`, and again at the Home screen.
- **Recorded a standing writing preference:** intelligent but plain — the test is whether the least technical reader could understand and remember it. Applies to docs, file headers, commit messages and the app's own copy.
- **Added `docs/Mizaniya_Kickoff_Pack.md`**, the instructions this build actually runs on. The product brief's §6 had declared itself superseded by a file that was not in the repo.
- **Caught a repo-rule-3 breach before it was committed.** The kick-off pack named another project four times. Redacted, along with local folder paths and a stale filename. Worth noting: **rule 3 is the only repo rule with no automated enforcement** — secret scanning finds keys, not project names, and a denylist committed to a public repo publishes the very names it hides. Raised properly at PR AUTOMATION.
- **Ran UNDERSTAND.** Settled the six open domain questions as D1–D6 plus the D7 rename, each with the rejected option recorded. Wrote [docs/01-requirements-summary.md](docs/01-requirements-summary.md).
- **Surfaced the biggest unflagged risk in the whole design:** IndexedDB is not permanent. Browser eviction or a cleared cache deletes every transaction with no warning to anyone. Logged as assumption A5, to be decided in ARCHITECT.
- **Answered all eight clarification questions** in the same sitting, adding D8–D14. Two changed the shape of the product: Home became a ranked screen rather than a grid of eight tiles, and rotating ajo turned out to be a debt in both directions rather than savings — which is what it actually is, economically.
- **Established that on iOS every browser is Safari underneath**, so using Chrome on an iPhone does not escape WebKit's storage eviction. That makes PWA installability a durability requirement, not a nicety.
- **Ran ARCHITECT** with `engineering:architecture` and `engineering:system-design` invoked inside the phase. Wrote [docs/02-architecture.md](docs/02-architecture.md) with seven ADRs; [ADR-001](docs/adr/ADR-001-reactivity-and-the-data-seam.md) and [ADR-002](docs/adr/ADR-002-where-core-lives.md) promoted to their own files.
- **The architecture reduced to one idea:** transactions are the only facts, everything else is a calculation. Once nothing derived is stored, the only architectural question left is how a write reaches the screens — which is ADR-001.
- **Rejected Dexie `liveQuery`,** the obvious and least-code option, on cost of ownership: it puts the storage engine inside every component and has no counterpart in SQLite or HTTP, so v2 would be a screen-by-screen rewrite. Also rejected an observable-returning repository, which is the *more* dangerous choice because a v3 HTTP implementation could only honour it by polling or by returning a subscription that never fires — wrong, and silent.
- **Wrote three concept notes** — [derived state](docs/concepts/derived-state.md), [the repository pattern](docs/concepts/repository-pattern.md), [IndexedDB](docs/concepts/indexeddb.md).
- **Noted a small inconsistency to fix later:** the addendum says the Expo SDK will be recorded in "ADR-01", but ADR-001 is now taken. It should say *an* ADR.
- **ADR-002 decided:** `core/` stays a folder in v1. Opened [docs/backlog.md](docs/backlog.md) with the extraction recorded as the first task of v2 — before any Expo screen, so it happens once rather than being discovered mid-build. **The A3 lint rule is now the only thing holding that boundary, so it must fail CI rather than warn.**
- **Ran SYSTEM SPEC** with `product-management:write-spec` invoked inside the phase. Wrote [docs/03-system-spec.md](docs/03-system-spec.md): overview, goals and non-goals, roles, 40 stories with MoSCoW, Given/When/Then criteria for every Must, a per-screen state table, data requirements, and non-functional requirements.
- **Settled the amber threshold as D15** — a proportion of the planned daily allowance rather than a fixed figure, with the divide-by-zero and no-plan cases written down rather than discovered later.
- **Extended `docs/seed-data.md` with a full worked cycle**, because the spec needed real figures and repo rule 2 says figures live only there. The rent fund is seeded **behind schedule on purpose**: a demo where everything is fine demonstrates nothing, and the projected gap exists to warn early.
- **Wrote the states per screen rather than per story** — five states repeated across forty stories would have been unreadable, and unreadable criteria are criteria nobody checks.
- **Ran API CONTRACT.** In v1 the contract is the `Repository` interface plus the export/import file, so it was written as **real source files** — `src/core/types.ts`, `schema.ts`, `repository.ts` — with [docs/04-api-contract.md](docs/04-api-contract.md) indexing them rather than restating shapes that would drift. First code in the repo.
- **Corrected myself on the transaction types.** I had proposed savings as one type with a direction field; H5 is explicit that direction comes from the type, so there are **eight** types. Fixed in the requirements summary and the spec.
- **Moved the `Repository` interface from `data/` to `core/`**, correcting the architecture's first draft — the Expo app must implement the interface, so it is shared contract, not a platform detail.
- **Recorded what API CONTRACT could not finish:** the phase requires a CI step that regenerates the contract doc from the source and fails on any diff. That needs `package.json`, which BUILD creates first, so it is written up as a BUILD task and the tables are marked hand-checked rather than passed off as generated.
- **Ran PAGE SPECS** with `design:accessibility-review` and `design:ux-copy` invoked inside the phase. Wrote [docs/06-page-specs.md](docs/06-page-specs.md): ten screens with layout, every number and its `core/` source, all five states, primary action, danger-colour meaning, responsive behaviour and the exact on-screen words.
- **Two accessibility decisions that a checklist would have missed:** how a money figure is read aloud (“2,300 naira over”, never “minus 2,300”), and one live region per screen instead of one per figure — a save changes a dozen numbers and announcing all of them is the same as announcing none.
- **Wrote the copy in full**, including the sentence every import refusal ends with: *“Nothing has changed.”* And a list of words the app never uses — *you should, we recommend, congratulations, oops* — because the line between reporting and advising is crossed by tone, not just by content.
- **Left six questions for the designer** and marked everything else settled, so the design can be made without coming back with questions.
- **The design landed and reviewed me back.** Four stale figures found and corrected across four files, and the rounding rule that explains them written into §3a. Merged the seed proposal into `docs/seed-data.md`, which resolved a conflict the brief could not satisfy.
- **Gitignored the local design-handoff folder** after a `git add -A` had already swept a file out of it into a commit — the fix belongs in `.gitignore`, not in remembering to be careful.

---

### 2026-09-09 (Wednesday)

- **Step 0 — verified the vendored Peer AI customisation.** Confirmed every phase file carries its `> **Model:` line from `phase-config.json`; confirmed no live cost-tiering wording remains (the only matches are the strip script's own regexes and the feedback doc describing the defect); confirmed `peer-ai/.git` is absent, so the playbook commits as plain files.
- **Corrected the skills record.** An earlier check reported all ten skills missing, having looked only in `~/.claude/plugins/repos/`. They are `@inline` account bundles and are present: verified directly in this session, in the desktop app.
- **SETUP.** Wrote `CLAUDE.md` (project instructions + the workflow driver body, Project settings filled in), this `CONTEXT.md` (repo rules verbatim, environment, learning-mode contract, review checklist), `.peer-ai-state.json`, and `docs/seed-data.md`.
- **Recorded the git convention** in the driver's Project settings and applied it to the driver's build and gate sections, which had described local ticket→milestone merges with no PR.
- **Logged a fourth framework defect** in `docs/peer-ai-feedback.md`: the workflow driver mandates local merges while `shared.md` requires a PR with review, and PR automation is phase 11b — so by the time CI and branch protection exist, the whole build has already merged without them.

## What's Next

**The repositioning comes first, and nothing is built until step 4.** Order
matters here: handing the designer a repositioning without the product decisions
is how the artboards get re-cut a third time.

1. **Sign off [ADR-010](docs/adr/ADR-010-sync-model.md)** — local-first with the
   server as sync target, or server-authoritative. It is design-visible (does
   every screen need an offline and sync state?) so it blocks the brief.
2. **The schema migration ADR-010 uncovered.** No entity has `updatedAt`,
   `deletedAt` or a revision, so **last-write-wins cannot be implemented and a
   delete can never propagate — it resurrects on the next sync.** `SCHEMA_VERSION`
   1 → 2 across every entity, with a step in the ADR-005 chain. Cheapest now,
   while the owner's device holds the only data in existence.
3. **Re-spec.** New stories in the system spec — sign-up, sign-in, reset, sync
   state, the free/paid boundary, household sharing — then
   `peer-ai/backend/01-spec-endpoints.md`. `docs/standards/backend-engineering-standards.md`
   stops being dormant; **§A6 wakes up and §C5 applies** (ADR-008 item 5).
4. **One design brief**, covering new *and* changed screens and saying explicitly
   what is reusable — the owner's point is that much of the existing set is:
   landing page, sign-up / sign-in / reset, account and billing, **what a locked
   paid feature looks like** (the hardest copy problem in freemium), household
   invite, the signed-out state of every screen, and the **reconciliation flow**
   for bank movement — *"₦12,000 left your account, which envelope?"* — which is
   the product's centre and is drawn nowhere.
5. **The workspace extraction** (ADR-008 item 2, pulled forward): `src/` →
   `apps/web/`, `packages/core`, `packages/tokens`. Before `services/api` has a
   line in it.
6. **Then build**, and only then resume the screen queue — which is re-specced
   T16–T22, not T16–T22 as written.

**Rule 6 — real user data — is owed from the stakeholder in their own words.**
Blocks the first real user, not the first commit. See the repo rules above.

**Still open and unowned, unchanged by any of this:** branch protection (needs
repo-admin hands), the gitleaks action pinned to a tag rather than a SHA,
`FORBIDDEN_TERMS` unset so the rule-3 guard logs NOT ENFORCED, #58's two
unseedable scenarios, #65's Home fixture split, and #53's ten missing day-log
entries.

**Carried forward from the parked pass, so it is not lost:** #68's remaining Home
work (the `Today / This cycle` switch, `Peak 25 Sep` and the axis row, the `÷ 20
days` footer, the ranked row's rail-and-pill, the emerald `Show all …` link, Goals
and Debts as two tables, the two-column desktop layout); **#85's debt history**,
answered in `open-items.md` §G and still needed before T17/T18, including the
worked part-paid debt that `seed-data.md` still lacks; and **#69's Quick Add**,
where the artboard's two disclosure tiles are a different interaction model from
the code's segmented control, not a detail.

---

## Open Questions

The six questions logged at SETUP were settled on 2026-09-10 and are now decisions
D1–D6 below. Six of the original seven had in fact already been answered in
`docs/product-brief.md`; they were logged from the stakeholder email before the
brief was read properly. Full reasoning for each decision, including the option
rejected, is in [docs/01-requirements-summary.md](docs/01-requirements-summary.md).

What remains open:

| Question | Status |
|----------|--------|
| Exact copy for the offline and storage-status lines — they must inform without alarming | Open — PAGE SPECS, with `design:ux-copy` |
| Should archiving a category hide it from past cycles, or only from new plans? | Open — leaning *new plans only*, so history stays truthful. Needed before story C7 |
| Does the printable debt record carry the owner's own name, and does onboarding collect it? | Open — needed before story E5 |
| `design:` **Does a bottom-sheet title take the voice face?** The artboards draw it serif (`class="ser"`, 24px, `QADark.dc.html`); the code renders it Inter (`src/ui/sheet.tsx:57`, `font-structural text-h2`). The design system supports both readings and contradicts itself: §3's prose gives voice to *"screen titles"*, but the type table names EB Garamond on the `title` step **only**, and 24px is the `h2` band — and a sheet is not a screen | **Settled 23 September — it takes the voice face, and the artboard's size was wrong.** The rule is now in `tokens.md` §3: the voice face names a **surface**, the structural face names a **part** of one. A sheet is the surface while it is open — it holds focus, Escape closes it, everything behind it is inert — so its title is a `title`, not an `h2`. The reviewer was reading a real fault, but it was the size: EB Garamond's x-height is 0.407em against Inter's 0.546, so 24px serif is optically Inter 18px — *under* the `h2` it was meant to lead, and under-sized titles read as misapplied serif. The artboards are corrected to **30 / 36**, which is the `title` step already in `tailwind.config.ts`. Code change is one class: `font-structural text-h2` → `font-voice text-title` in `src/ui/sheet.tsx`. See open item 9 |
| `spec:` **Is Home's first section called "Categories" or "Needs attention"?** Page specs §429 writes *Categories*; the artboards label it *Needs attention*. Copy, not type — so neither authority clearly owns it | **Settled 23 September — both words are right; they are two states of one section, and the heading names what the list is showing.** There was never a conflict: page specs §429 sits inside an ASCII sketch of the *superseded* 2×2 tile Home and is not a copy spec (§7.2, lines 462–463, is). The artboards label two different things — `HomeLight` (360) heads a **ranked subset** *Needs attention* with a *Show all 8 categories* link; `DHomeLight` (1440) heads the **full table** *Categories*. The code has only the full table at both widths, so the mobile treatment is missing rather than mis-named. See open item 10 |

The amber threshold is settled as **D15**. Every question raised at SETUP and in
UNDERSTAND's clarification round is now closed.

---

## Package / Asset Locations

| Asset | Path |
|-------|------|
| Product brief | `docs/product-brief.md` (§1–5 authoritative; §6 superseded) |
| Kick-off pack — the instructions this build runs on | `docs/Mizaniya_Kickoff_Pack.md` |
| Requirements summary + the settled domain decisions | `docs/01-requirements-summary.md` |
| System architecture + the ADR index | `docs/02-architecture.md` |
| Promoted ADRs | `docs/adr/` |
| Backlog — what is deliberately not built | `docs/backlog.md` |
| System spec — stories, criteria, screen states | `docs/03-system-spec.md` |
| API contract — indexes the source of record | `docs/04-api-contract.md` |
| **The contract itself** | `src/core/types.ts` · `schema.ts` · `repository.ts` |
| Page specs — what the design is made from | `docs/06-page-specs.md` |
| Engineering standards (rulebook) | `docs/standards/` |
| Seed data — the only source of figures | `docs/seed-data.md` |
| Peer AI playbook (vendored) | `peer-ai/` |
| Phase models and skills | `peer-ai/phase-config.json` |
| Agent prompts (review, security, QA, contract) | `peer-ai/agents/` |
| Framework defects to send upstream | `docs/peer-ai-feedback.md` |
| Design system and screen designs | `docs/design/` — **landed 10 September**. `tokens.md` is authoritative; read `canvas/*.dc.html` as markup, not the PNGs |
| Production brand files | `docs/design/brand/` — favicon, PWA icons, Apple touch icon, the mark as `currentColor` SVG, the wordmarks with letters outlined. `brand/README.md` says where each file goes and which ticket takes it |
| What the design has that the code does not | `docs/open-items.md` — **read before building a screen.** Deleted once every box is ticked |
| The tokens in code | `src/design/tokens.ts` (typed data) · `tokens.css` (custom properties) · `tokens.test.ts` fails the build when they drift |
| The primitives | `src/ui/` — about twenty, with their states; gallery at `src/app/primitives-page.tsx` |
| Domain logic | `src/core/` — `money`, `cycle`, `budget` so far |
| Auto rules mapped to what enforces them | `docs/05-coding-standards.md` |
| Engineering notes | `docs/engineering-notes/` — one note per topic someone would ask about: what the problem was, what we did, the concepts, and the why-chain. **Replaces `docs/concepts/`**, which is deleted once harvested (sweep ticket) |
| Licence | `LICENSE` (PolyForm Noncommercial 1.0.0) — authoritative, never regenerated |

---

## Diagrams / Design files

| Artefact / file | Purpose | Location |
|----------|---------|----------|
| Architecture + seven ADRs | How a write reaches the screens, and why not `liveQuery` | `docs/02-architecture.md`, `docs/adr/` |
| 67 artboards | Every screen at 360 and 1440, light and dark, every state | `docs/design/*.png` |
| The canvas | The same artboards as markup — **read these, not the PNGs** | `docs/design/canvas/*.dc.html` |
| Token set | Complete, light and dark. 54 gated contrast pairs, 0 failures | `docs/design/tokens.md` |
| The mark, as production files | Favicon, PWA icons, Apple touch icon, wordmarks | `docs/design/brand/` |
| Primitives gallery | Every primitive in every state, in the running app | `src/app/primitives-page.tsx` |
