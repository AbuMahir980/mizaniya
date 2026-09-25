# Design brief — accounts, sync, tiers, and the landing page

| Field | Value |
|---|---|
| **Date** | 2026-09-25 |
| **For** | the designer |
| **Why** | [ADR-009](adr/ADR-009-repositioning-v1-hosted-webapp.md) — v1 is now a hosted webapp with accounts and a paid tier |
| **Behaviour is defined in** | [03-system-spec.md](03-system-spec.md) §I–§M and §11a |
| **Questions go in** | [open-items.md](open-items.md), a new section **H** |

---

## 1 · What changed, in three sentences

Mizaniya was a local-first app for one person on one device. It still is — **and
that version is now the free tier, unchanged**. On top of it: an optional account
that lets the budget follow you to a second device, share with a spouse, and read
bank movement, paid monthly.

Nothing about cycles, safe-to-spend, the rent fund, debts or zakat has changed.

---

## 2 · What is *not* changing — read this before anything else

**The 69 existing artboards stand.** Onboarding, Home, Plan, Transactions, Quick
Add, Debts & Goals, the printed debt record, Months, Settings, Zakat, Import —
all still correct, and the build is still catching up to several of them (#72).

**Two things in particular are unchanged, and it would be easy to assume otherwise:**

- **Onboarding is untouched.** No sign-up step, no account step, no email field. Someone downloading this can use it forever without an account.
- **`tokens.md` is still authoritative**, and the type, colour, spacing and radius scales are not reopened. Everything below is built from the existing system.

### The simplification worth knowing

**There is no "signed-out state" to draw for the main screens.** An account is an
upgrade, not a gate — so signed out is not a degraded Home, it *is* Home. Only the
account screens themselves have a signed-out state.

This removes what would have been the largest piece of work in this brief.

---

## 3 · New screens

Numbering continues from the existing set (00–07b). Each needs 360 and 1440, light
and dark, unless noted.

### 08 · Account — sign up, sign in, reset

| State | Notes |
|---|---|
| Sign up | Email, password. **The password requirement is stated before the field is typed into**, not after rejection |
| Sign up — what we can and cannot see | **§I8, and it is not fine print.** Before anyone hands over data: what is encrypted, that keys are held separately from the database, and that every access to production data is logged. This is a trust surface, not a legal one |
| Sign in | Email, password, and a way to reach reset |
| Reset — request | Deliberately says *"if that address has an account, a link has been sent"* — it must **not** reveal whether the account exists |
| Reset — confirm | New password. Signing in elsewhere is ended |
| Error states | Wrong password, rate-limited, expired link. Each says what to do next (**L2**) |

### 08a · Account settings

Extends the existing **07 Settings**, rather than becoming a separate area.

| State | Notes |
|---|---|
| Signed out | One row: what an account would add, and a way in. Not a banner, not a nag |
| Signed in | Email, tier, next billing date |
| Devices | Which devices are signed in, and signing one out remotely (**I7**) |
| Sign out | **Must say plainly what happens to the data on this device**, and the words have to match what actually happens. If unsynced changes exist, warn before, not after |
| Delete account | Two-step. States the **30-day** grace period, then permanent. This is the most serious action in the app and should feel it without being theatrical |

### 09 · Tiers and the locked state

| State | Notes |
|---|---|
| What paying adds | Reachable from Settings. Free vs paid, per §11a. **Never interrupts the core journey** |
| A locked feature | **The hardest copy problem here.** A locked control must say what the feature is and what it costs. A disabled button with no explanation is a bug (**L2**) — and a lock that feels punitive on a budgeting app is worse than no paid tier |
| Subscribe | Hand-off to the payment provider, and coming back |
| Subscribed | Status, next bill, and cancelling without contacting anyone |
| Lapsed | **The important one.** Sync has stopped; the app has not. Every record is still there, still editable, still exportable. This state must not read as a punishment or a broken app — it is the free tier, which is a complete product |

### 10 · Sync

| State | Notes |
|---|---|
| Up to date | Quiet. Probably not a badge competing with the money |
| Unsynced changes | **§J3 — a figure the app cannot vouch for must not look like one it can.** Where this lives is your call; it affects Home |
| Offline | The existing offline treatment may already cover this — please say if it does |
| Sync failed | Says what failed and what to do. Not a silent retry forever |
| **Signing in where a budget already exists** | **§I3, and it needs real thought.** Someone signs in on a device already holding a different local budget. They must be *asked* which to keep — nothing merges silently, because merging two budgets has no correct answer. The wording is the whole problem: both options are destructive and the person must understand which is which |

---

## 4 · Designed now, built later

Drawn now so the set is cut once. **Not** being built yet, so these can be single
states rather than exhaustive.

### 11 · Household sharing *(built after launch)*

| Screen | Notes |
|---|---|
| Invite | By email. An invitation is not an account |
| Accept | Joins an existing budget — **never creates a second copy** |
| Members | Who is in, who invited them, removing someone |
| **The disagreement** | *"You set Food to ₦40,000. Your wife set it to ₦35,000. Do you agree to this?"* **This must read as two people agreeing, not as software refereeing.** A shared household budget *is* an agreement between two people, so a disagreement about it is a conversation. Both amounts are kept until someone settles it — neither is discarded in the meantime |

### 12 · Bank movement *(built as v1.1)*

| Screen | Notes |
|---|---|
| Before linking | **Read-only must be unmistakable.** Mizaniya can see movement; it cannot move money. Say it plainly, and say that the connection can be cut at any time |
| Linking | The aggregator's consent flow, and returning |
| Linked | Which account, when it last updated, and unlinking |
| **Reconciliation** | ***"₦12,000 left your account — which envelope?"*** **This is the centre of the paid product and it is drawn nowhere.** A queue of detected movements, each needing a category. It should feel like clearing a small inbox, not doing data entry |
| Possible duplicate | **§M5.** Manual entry does not stop, so the same expense arrives twice. The app should *suggest* a match and let the owner confirm or separate it. **It must not silently decide two of someone's expenses were one** |

---

## 5 · 13 · The landing page

Separate from the app, and **done properly** — the owner's instruction. It is the
first thing an investor, an employer or a prospective user sees.

Content, in the order the repo rules require of the README:

1. **The problem first** — salary gone before the month ends, debts in both directions, rent due once a year in a lump sum. Not the stack.
2. **The screenshots.** They are the product.
3. Free vs paid, honestly, per §11a.
4. What we can and cannot see — the same claims as §I8, worded identically. **Consistency between these two surfaces matters more than the wording of either.**

**One sentence must never appear**, on this page or anywhere: *"your bank data never
touches our servers."* It is false — movement arrives at the server before it is
encrypted. What is true, and strong enough: *"we never store your bank data in
readable form."*

---

## 6 · What this brief does not decide

**Layout, hierarchy, palette and type are yours.** Nothing above prescribes an
arrangement. Where it says "probably not a badge", that is a concern to weigh, not
an instruction.

Where the brief and the spec disagree, `peer-ai/shared/design-data-contract.md`
applies: the design owns layout, spacing, type and colour; the spec owns behaviour,
states and data. **Name it and log it rather than picking a side quietly.**

## 7 · Constraints

- **360 and 1440, light and dark**, for anything being built now.
- **Every state**, per **F6** — loading, empty, error, and the awkward one.
- **Contrast stays gated.** The existing set has 54 pairs and no failures; new colour pairs join that check.
- **No new figures.** Any amount shown comes from `docs/seed-data.md` (repo rule 2). If a screen needs a figure that does not exist there, say so and it will be added rather than invented.

## 8 · Questions

New section **H** in [open-items.md](open-items.md) — answered in place, heading
marked `answered <date>`. Questions belong beside their answers rather than in a
message.

**Three things I expect you to push back on**, and would rather hear now:

1. Whether the sync indicator belongs on Home at all, or only in Settings.
2. Whether the locked state should be a separate screen or an inline treatment.
3. Whether §I3's "which budget do you keep?" is answerable in one screen, or needs a short flow.
