# Mizaniya — kick-off pack (everything needed to start)

This supersedes section 6 of the product brief (`docs/product-brief.md`, originally `Expense_App_Brief_and_PeerAI_Kickoff.md`). The brief's sections 1–5 (reasoning, name, Excel mapping, scope, privacy rules) still stand; the prompt below is the corrected one.

---

## 0. Two answers first

**Public repo — yes, that's my recommendation.** The reason is the purpose of the project: it exists to be seen — by Upwork clients, by employers reading your GitHub, as the React Native case study. A private repo shows as anonymous green squares and proves nothing.

*Secrets.* None ever live in the code, public or private. API keys, payment-provider keys and database credentials go in environment variables on the host (Vercel/Netlify/Render settings); `.env` is git-ignored; secret scanning runs in CI. Companies handling real money work this way. The v3 server (sync, household sharing, bank connections, payments) lives in a **separate private repo** from the start; the public repo is the client and the core logic.

*Copying and claiming.* Nobody can claim your code — copyright is yours the moment you write it, and the commit history is a timestamped record. What a licence decides is whether others may *use* it. MIT would let anyone copy, modify and sell it with an attribution line, and cannot be revoked once released — wrong for a product you intend to monetise. So the repo uses a **source-available licence: PolyForm Noncommercial 1.0.0**. The code stays public (full portfolio value) and commercial reuse is prohibited. Honest caveat: a licence deters and gives you legal standing; it does not physically stop a clone. What protects the product is users, trust and the paid server-side features — which is why those stay private.

*Your real data.* Never in the repo. Invented seed data only; your own figures live in your own browser.

**Who writes CONTEXT.md — the agent does.** Peer AI's SETUP phase creates it from the template. You never write it by hand. In the earlier draft I told the agent "add the rules I will paste separately", which would have made you do a second paste; that's fixed below — the rules are now inside the prompt, so the agent writes them into CONTEXT.md itself during SETUP.

---

## 1. Corrections carried forward into this version

1. Learning mode is the fast version (agent writes the code and explains; you don't type the maths).
2. The standards live in `docs/standards/` (three files) and the SHARED RULES phase enforces them.
3. The repo rules are inside the prompt; nothing to paste separately.
4. A new stop after PAGE SPECS: the agent pauses so the design canvas can be produced from the specs. SHARED RULES then *implements* the tokens and screens from the design rather than inventing them.
5. `docs/seed-data.md` is created by the agent in SETUP from the seed figures in the prompt.
6. Peer AI is copied in without its own `.git`, per its clone-and-customise design, so it is committed as part of this project.
7. Licence is PolyForm Noncommercial 1.0.0 (source-available), not MIT.
8. The repo lives at `Miqan/mizaniya` — a new subfolder inside your projects folder. The earlier warning was only about running Peer AI's SETUP in the Miqan folder itself, which would write CLAUDE.md, CONTEXT.md and a git init beside your other projects. A subfolder with its own repo is correct.
9. **Peer AI is customised before SETUP runs, the same way an earlier vendored copy was** (step 4b, then step 0 of the prompt verifies it). A `phase-config.json` names, for every phase file and agent prompt, the model line (Opus for build, Fable for everything else — replacing Peer AI's "switch to a cheaper model" tiering) and the plugin skills to invoke inside that phase (`engineering:architecture`, `engineering:system-design`, `product-management:write-spec`, `design:design-system`, `design:accessibility-review`, `design:ux-copy`, `engineering:tech-debt`, `engineering:code-review`, `engineering:testing-strategy`, `engineering:documentation`), plus the project notes that phase needs (no server in v1; the designs come after PAGE SPECS; the rules phases index `docs/standards/` instead of writing a second standard; the backend track is dormant until v3). `apply-phase-config.ps1` stamps it into the files; `strip-model-switching.ps1` removes the downgrade prompts; the new `AGENTS.md` carries the box, the skills table and the "already exists — do not reinvent" list. The rule carried over from that project stands: a skill that is not installed is reported, never silently skipped.
10. It has to happen before SETUP because SETUP builds CLAUDE.md from `./peer-ai`, and the stock copy contradicts your standards: `frontend/rules/frontend.md` prescribes a type-first layout (`components/`, `hooks/`, `utils/`, `services/`) where A1/A4 say feature-first with `data/` behind a Repository, and `shared/rules/shared.md` prescribes `PROJ-XX:` commits. Step 0 in the prompt has Claude Code verify the stamp, check which skills are actually installed, and wire those two rules files to `docs/standards/`.
11. Commit messages carry no AI attribution (`includeCoAuthoredBy: false` is set in `~/.claude/settings.json`; the RULES block says the same).

---

## 2. Step-by-step start (do these in order)

**Step 1 — Name.** Check `mizaniya.com` / `.app` / `.ng` at namecheap.com. If free, note it (buy when convenient). If taken, use Kifayah and replace the name in everything below.

**Step 2 — Create the repo and bootstrap it.** In Git Bash, inside your Miqan projects folder (so the repo becomes `Miqan/mizaniya`; do not run anything in a client project's folder):

```
cd ~/path/to/Miqan
gh repo create mizaniya --public --clone --gitignore Node --description "Household money app for salary-cycle budgeting, envelopes, and debts in both directions. Local-first, built in the open."
cd mizaniya
git clone https://github.com/AbuMahir980/peer-ai.git peer-ai
rm -rf peer-ai/.git
mkdir -p docs/standards docs/design
```

**Step 3 — Licence file.** Open https://polyformproject.org/licenses/noncommercial/1.0.0 in the browser, copy the full licence text, and save it as `LICENSE` (no extension) in the repo root. At the top of the file, above the licence text, add one line: `Copyright (c) 2026 Qudus Adebola Lawal. Licensed under PolyForm Noncommercial 1.0.0.`

**Step 4 — Put the documents in.** Copy from `<local folder holding the standards and the brief>`:
- `standards\frontend-engineering-standards.md` → `docs/standards/`
- `standards\backend-engineering-standards.md` → `docs/standards/`
- `standards\standards-addendum-mizaniya.md` → `docs/standards/`
- `Expense_App_Brief_and_PeerAI_Kickoff.md` → `docs/product-brief.md`

**Step 4b — Put the Peer AI customisation in** (the same treatment the earlier vendored copy has: `phase-config.json` + `apply-phase-config.ps1` + `strip-model-switching.ps1` + the AGENTS.md box). Copy from `<local folder holding the peer-ai customisation>` into `mizaniya\peer-ai\`, replacing the stock `AGENTS.md`:
- `phase-config.json` → `peer-ai/phase-config.json`
- `apply-phase-config.ps1` → `peer-ai/apply-phase-config.ps1`
- `strip-model-switching.ps1` → `peer-ai/strip-model-switching.ps1`
- `AGENTS.md` → `peer-ai/AGENTS.md` (overwrite)

Differences from the earlier scripts, so you know: they find their own folder (`Split-Path` of the script path) instead of a hard-coded absolute path, so they work wherever the repo sits; idempotence is checked on the block's first line, so re-running after an upstream pull never duplicates; and `docs/` is excluded from the strip pass so Peer AI's own feedback log keeps its wording.

Then, still in Git Bash inside `mizaniya/`:
```
powershell -ExecutionPolicy Bypass -File peer-ai/apply-phase-config.ps1
powershell -ExecutionPolicy Bypass -File peer-ai/strip-model-switching.ps1
git status
```
Expected: the first prints one `ok` per phase file, then "model lines set : 24 / blocks added : 23 / files missing : 0". The second currently reports "files cleaned: 0" and lists about a dozen remaining mentions — that is expected: its patterns predate the current upstream wording, and step 0 of the prompt has Claude Code finish that cleanup and fix the script. If the *first* prints MISSING, send me the output before going on.

Then commit. If the bootstrap is not pushed yet:
```
git add -A
git commit -m "chore: bootstrap with peer-ai, standards, product brief and licence"
git push
```
If the bootstrap was already pushed, the customisation gets its own commit:
```
git add -A
git commit -m "peer-ai: customise for this project"
git push
```

**Step 5 — Open Claude Code in the folder** (`claude` in the terminal, inside `mizaniya/`) and paste the whole prompt in section 3 as one message.

**Step 6 — The stops.** The agent will stop five times and wait for you: after the customisation check (it shows you which skills are installed, and a table of what it changed in the two rules files and why — read it; this is your framework and anything it flags as a defect is feedback for the public repo), after SETUP, after API CONTRACT, after PAGE SPECS, and after the design system. At the PAGE SPECS stop, send me `docs/` (or paste the page-spec files) and I build the design canvas; you export the screens to `docs/design/` and say "continue".

**Step 7 — Push after every phase commit** (`git push`). The public commit history is part of the case study.

**Later — the private server repo.** When v3 starts, create `Miqan/mizaniya-api` as a **private** repo. Payment keys, bank-connection keys and user data handling live there and never in the public repo.

---

## 3. The kick-off prompt (paste as one message)

```
This folder is a fresh public repo for Mizaniya, a household money app I am building in the open with Peer AI, which is copied into ./peer-ai (no upstream link — this project customises its own copy). Treat this as a real product build: follow peer-ai's phases and gate rules exactly as written, produce every document each phase requires, and commit at the end of each phase with a message that names the phase ("peer-ai: setup", "peer-ai: understand", ...). docs/product-brief.md is the full brief; docs/standards/ holds the engineering standards.

THE BRIEF (stakeholder's email)
"I'm a salaried professional in Lagos. My money runs out before the month does, I owe money to two people and one person owes me, and rent is due once a year in a lump sum. I have been budgeting in a spreadsheet: I plan every naira of my take-home into categories at the start of each salary cycle (rent fund, debt payments, emergency fund, personal savings, health, utilities, food and groceries which rolls over if unused, transport/data/airtime, apartment setup, miscellaneous, family support), log every movement as a positive-amount transaction with a type (income, expense, savings transfer, debt payment), and read a dashboard that shows planned vs actual income, cash left, savings moved, debt paid, variance per category, and — for rent and each debt — whether I will hit the target by its due date at the current rate. I want that as a web app I can use every day on my phone's browser, offline, that tells me at a glance how much I can safely spend per day until my next salary, and that tracks debts in both directions with a proper written record. It should be respectful of Islamic practice (zakat awareness, sadaqah, debts written down) without preaching, and fit how money actually works in Nigeria: salary-day cycles, sinking funds for annual rent, several savings destinations, ajo contributions, airtime/data as a real budget line. v1 is single-user, manual entry, local-first, React + TypeScript + Vite. A React Native version follows, so keep the domain logic in a framework-free core module. A small API for sync and household sharing comes later, so the data layer sits behind a repository interface from day one."

REPO RULES (write these into CONTEXT.md during SETUP, verbatim)
1. Public repository under the PolyForm Noncommercial 1.0.0 licence (source-available; the LICENSE file in the root is authoritative — do not add, change or generate any other licence text), built in the open; phase commits named "peer-ai: <phase>". Secrets never enter the repo: any key or credential is read from environment variables, .env is git-ignored, and CI runs secret scanning. A future server for sync, sharing or payments lives in a separate private repository.
2. No real financial data ever enters the repository — not in code, seed files, fixtures, screenshots, issues, docs or commit messages. Seed data is invented and lives only in docs/seed-data.md: take-home ₦450,000 on the 25th; debts owed to "A. Friend" ₦120,000 (₦30,000 a month) and "Spouse" ₦60,000; ₦40,000 owed to me by "B. Colleague"; annual rent target ₦900,000 due 1 March; emergency-fund target ₦150,000.
3. No employer, client or third-party project names anywhere in code, comments, docs or commits.
4. README leads with the problem (salary gone before the month ends, debts in both directions, rent due once a year) and the screenshots, not the stack.
5. docs/standards/ is the rulebook: frontend-engineering-standards.md, backend-engineering-standards.md and standards-addendum-mizaniya.md. Every rule marked auto is enforced by ESLint/tsconfig/CI; every rule marked review is listed in CONTEXT.md as the code-review agent's checklist. Token, primitive and file naming follow frontend sections F and O.

LEARNING MODE (explain as you build; do not slow down to make me type)
- Before each phase: three or four plain sentences on what it produces and why it comes before the next.
- When you write non-trivial logic (cycle maths, safe-to-spend, rollover, projected gap, zakat), first state the reasoning in steps — inputs, rule, edge cases — then write the code. I read the steps; I don't write the code.
- Every file gets a three-line header: WHAT it does, WHY this pattern over the obvious alternative, ONE SENTENCE I could say about it in an interview.
- docs/concepts/ — one short file per concept the first time it appears (repository pattern, IndexedDB, derived state, optimistic UI, idempotent saves, tokens vs hard-coded styles…): what it is, why it's used here, what we'd have used instead and why not, and the interview sentence. I add a line in my own words after reading.
- At each stop, ask me five questions about what was built and say honestly whether my answers hold up. Log misses in docs/concepts/revisit.md.
- Real trade-offs are laid out with both sides; I choose; the choice and reason go into CONTEXT.md.

HOW TO RUN IT
0. VERIFY THE PEER AI CUSTOMISATION — before SETUP, because SETUP builds CLAUDE.md from ./peer-ai and everything after inherits it. ./peer-ai is a vendored copy already customised for this project the way its AGENTS.md box describes: peer-ai/phase-config.json names the model and the plugin skills for every phase, apply-phase-config.ps1 has stamped them into the phase files, strip-model-switching.ps1 has removed the model-downgrade prompts, and AGENTS.md carries the skills table and the "what this project already has" list. Read ./peer-ai/AGENTS.md, ./peer-ai/phase-config.json and docs/standards/ in full, then:
   a) Check the stamp landed: every file named in phase-config.json has its "> **Model:" line and its block (re-run powershell -ExecutionPolicy Bypass -File peer-ai/apply-phase-config.ps1 if not). Then finish what strip-model-switching.ps1 could not: its patterns predate the current upstream wording, so it cleaned nothing and listed the leftovers instead. Remove the remaining cost-tiering by hand — replace the model-tier tables in shared/rules/shared.md and shared/rules/workflow-driver.md with the one-line project convention (Opus for build, Fable for everything else; never downgrade mid-phase); delete the "switch to your fastest model … switch back" sentences from the PDF-export steps in shared/rules/docs-pdf-export.md, shared/rules/shared.md and any phase file; fix the README line that describes the tiering. Then update the regexes in strip-model-switching.ps1 to match the current wording and re-run it until it reports "none", so the script is correct for the next upstream pull.
   b) Skills check: list which of the skills named in AGENTS.md's table are actually installed in this session (engineering:*, design:*, product-management:*) and which are not. Do not install anything. Record the result in CONTEXT.md during SETUP so every later phase knows whether to invoke the skill or work from the phase file and say so — a missing skill is reported, never silently skipped.
   c) Wire the rules layer: ./peer-ai/shared/rules/shared.md and ./peer-ai/frontend/rules/frontend.md are still stock. Add at the top of each a short section stating that docs/standards/ is authoritative and wins on any conflict, and delete only the stock rules that directly contradict it — the type-first src/components|hooks|utils|services layout (frontend A1, A4 say feature-first with data/ behind a Repository), "build with mock data first", and the PROJ-XX commit format (we use conventional commits; phase commits are "peer-ai: <phase>"). Reference standards by section number; do not copy their text in, or the two will drift. Leave backend/rules/backend.md as it is (dormant until v3) apart from the same two-line pointer.
   d) Show me a table — file, what changed, why — and list separately anything that looks like a genuine defect in Peer AI itself (a broken instruction, a path that does not exist, a step that cannot be followed), because that goes back to the public framework repo as feedback. Commit as "peer-ai: wire rules to project standards". STOP. Wait for me.
1. Tell me in plain language what SETUP will write to this folder before you do it.
2. Run SETUP. Detect Claude Code, write CLAUDE.md, CONTEXT.md and .peer-ai-state.json from the templates; write the REPO RULES into CONTEXT.md; create docs/seed-data.md from rule 2. STOP and say "Setup complete." Wait for me.
3. Run UNDERSTAND against the brief — ask me anything the brief leaves open before writing the understanding document. Then ARCHITECT (local-first; IndexedDB via Dexie behind a Repository interface; a core/ package of pure TypeScript for cycle maths, safe-to-spend, rollover, projected gap, zakat estimate and money in kobo; React app consuming it; structure per frontend standards A1–A5), SYSTEM SPEC, and API CONTRACT (the Repository interface and the JSON export/import schema are the "API" in v1 — there is no server yet; note where a v3 API would slot in). STOP after API CONTRACT. Wait for me.
4. Run PAGE SPECS for: Onboarding, Home, Plan, Transactions (+ Quick Add sheet), Debts & Goals (+ debt record view), Months, Settings. Each spec lists its loading, empty, error, offline and success states explicitly, and the exact numbers each screen shows. STOP and say "Page specs written — design stop." Wait for me: the design system and screen designs are produced outside this session from these specs and will appear in docs/design/ (tokens.md + PNGs).
5. Run SHARED RULES. Implement the design from docs/design/: src/design/tokens.ts exactly as tokens.md specifies (light and dark), and src/ui/ primitives — Button, Input, Select, Card, Sheet, StatTile, ProgressBar, Badge, Tabs, Toast, EmptyState, Table — each with all its states, using shadcn/ui-style composition (Radix primitives + Tailwind bound to the tokens). Configure ESLint, tsconfig and CI for every auto rule in docs/standards/. Naira formatter in core/money. STOP and show me the primitives on a scratch page. Wait for me.
6. BUILD in this order, one commit per item: core/ with Vitest tests first; Onboarding; Home; Quick Add; Plan; Transactions; Debts & Goals; Months; Settings; export/import; seed script. Anything not in the brief goes into docs/backlog.md, not into the code.
7. Run the CODE REVIEW agent and the SECURITY AUDIT agent from ./peer-ai/agents/ on the build using the review-rule checklist in CONTEXT.md; show me the findings; fix what they flag; then TESTING (Vitest for core/, React Testing Library for Quick Add, Playwright for the core journey in the addendum) and DOCUMENTATION. README structure: problem, screenshots, features, how it works (cycles, envelopes, debts, projected gap), running locally, roadmap (v2 Expo, v3 sync/sharing), licence (state PolyForm Noncommercial in one line and link to LICENSE).
8. Update CONTEXT.md and .peer-ai-state.json as the workflow requires at every stop.

RULES
- Follow peer-ai's phase order and gates; never skip a document a phase requires; if a phase instruction is ambiguous or broken, tell me exactly where — I maintain peer-ai and that is useful feedback.
- No real financial figures anywhere; use docs/seed-data.md.
- Accessibility per frontend standards J; mobile-first at 360px; must also be right at 1440px.
- British English in all copy and docs.
- Commit messages: conventional style ("peer-ai: <phase>" for phase commits; "feat:/fix:/chore:/docs:" otherwise), one line plus an optional short body. No AI attribution lines, no emoji, no tool names in messages.
```

---

## 4. What happens after the first stop

The first stop is the customisation check. Read it: which plugin skills are installed in your Claude Code (if none are, that's fine — every phase works from its file and says so), which stock rules were removed from the two rules files and why, and anything flagged as a defect in Peer AI itself, which goes into `docs/peer-ai-feedback.md` in the public repo later. Say "continue".

After "Setup complete", look at CLAUDE.md and CONTEXT.md once so you know what the agent wrote, say "continue", and let it run UNDERSTAND — it will ask you questions about the brief; answer from your own use of the spreadsheet, not from what you think sounds impressive. When it stops after API CONTRACT, skim the architecture document for the trade-offs it flagged (it must present both sides per learning mode) and choose. Then PAGE SPECS, and the design stop is where I come back in.
