# Design brief — the webapp: accounts, sync, tiers, motion, desktop

| Field | Value |
|---|---|
| **Date** | 2026-09-25 (**supersedes the first version of this file, same date**) |
| **For** | the designer |
| **Why** | [ADR-009](adr/ADR-009-repositioning-v1-hosted-webapp.md) — v1 is a hosted webapp with a paid tier |
| **Behaviour** | [03-system-spec.md](03-system-spec.md) §I–§M, §11a |
| **Landing page** | its own brief — [11-landing-page-brief.md](11-landing-page-brief.md) |
| **Questions** | [open-items.md](open-items.md) §H |

---

## 0 · A correction to what you were told first

The first version of this brief said **"your 69 artboards all stand."** That is no
longer accurate and I would rather correct it than let you build on it.

Three decisions taken after it was written change the scope:

1. **Desktop is now a first-class design target**, not an adaptation. So several 1440 artboards need rework rather than conformance.
2. **Motion and interactivity are in scope as a system**, which the design set does not currently have.
3. **A one-click demo** is now a **Must**, not a *Could*.

**What genuinely does still stand:** every 360 artboard, the whole token system,
onboarding, and every behaviour in the page specs. The product did not change. How
it presents itself on a large screen, and how it moves, did.

---

## 1 · What this has to be now

v1 is not a mobile app that happens to open in a browser. It is a **webapp with a
paid tier**, and it will be met by three different people:

| Who | Where | What they need in the first ten seconds |
|---|---|---|
| Someone budgeting | phone, 360, daily, often bad signal | The one figure. Fast. No ceremony |
| Someone deciding whether to try it | laptop, 1440, once | A reason to care, and proof it is real |
| An investor or employer | laptop, 1440, once | Evidence that whoever built this knows what they are doing |

The existing set serves the first person well. It was never asked to serve the other
two.

**The daily user still wins any conflict.** If a flourish costs the person in a queue
at a fuel station half a second, it goes. Selling the product must not cost the
product.

---

## 2 · Desktop, as a design target

Currently: mobile-first at 360, *correct* at 1440. Correct means nothing is broken.
It does not mean the width is used.

**What "designed for desktop" means here, concretely:**

- **The width does something.** Home at 1440 should not be a 360 column centred in grey. What earns the second column — the category table beside the gauge? the debt list beside the goals? That is your call and it is the central question of this brief.
- **Density is a choice per page.** A phone shows the ranked subset; a laptop can show the full table. The page specs already know this (`HomeLight` ranks a subset, `DHomeLight` shows the full table) — extend that thinking rather than inventing it.
- **Pointer states are real states.** Hover, focus-visible, active, drag where it applies. On a phone these barely exist. On a laptop their absence is what makes a page feel like a port.
- **Keyboard is a first-class path**, not an accessibility box ticked at the end. Someone on a laptop entering ten movements should never touch the mouse.

**Pages most likely to need genuine desktop rework** — your judgement, this is a
prompt not a list of orders: Home, Transactions, Plan, Debts & Goals. The forms and
sheets may be fine as they are.

---

## 3 · Motion — as a system, not decorations

### What exists already

The page specs' accessibility section (§3) already names three animations — the
sheet slide, tile counters, progress-bar fills — and already requires
`prefers-reduced-motion` to remove them. So the *rule* exists. **The system does
not.**

### What is needed: `docs/design/motion.md`

A sibling to `tokens.md`, and authoritative the same way. It should define:

| | |
|---|---|
| **Durations** | A small scale, named. Two or three values, not seven. Most UI motion is 150–300ms and anything longer needs a reason |
| **Easings** | Named curves and when each applies. Entering and leaving are rarely the same curve |
| **What animates** | An explicit list. Anything not on it does not animate |
| **What never animates** | **Money figures on first paint.** A number counting up on load is a figure you cannot read yet, and this app's whole job is telling you a number |
| **Reduced motion** | The fallback for every single entry. Not "animations off" — the state change still has to be legible |
| **Orchestration** | Whether lists stagger, and how much. Stagger is the fastest way to make an app feel slow |

### Motion that earns its place in this product

Suggestions, to argue with:

- **A figure that changes should be seen to change.** Record an expense and safe-to-spend drops. If it silently re-renders, the person has to re-read the whole screen to find what moved. This is the most valuable motion in the app.
- **The reconciliation queue should feel like clearing an inbox.** An item categorised should leave, and the next should arrive. That rhythm is the difference between a satisfying task and data entry.
- **Sheets and routes need spatial logic.** Where did this come from, and where does it go when dismissed?
- **Skeletons must match their content's shape.** A generic grey block that becomes a table is worse than nothing — it moves everything twice.

### Motion that must not appear in the app

- **Anything on the critical path to a figure.** No entrance animation between opening the app and reading safe-to-spend.
- **Scroll-jacking, parallax, reveal-on-scroll.** Those belong on the landing page and nowhere near a tool someone uses daily.
- **Motion carrying meaning alone** (**J3**). If the only signal that a save failed is a shake, the message did not arrive.

### The engineering constraints, so the spec is buildable

- **`prefers-reduced-motion` is mandatory**, not a nicety. This project gates contrast at the token level; motion gets the same seriousness.
- **The bundle is already 594KB** and warns at build. A motion library has to be justified under standard **N1** — so prefer CSS transitions and the Web Animations API, and name a library only where it genuinely earns the weight.
- **Animate `transform` and `opacity`.** Animating layout properties on a mid-range Android phone drops frames, and that is the device the daily user has.

---

## 3a · The whole flow, end to end

Written out once because the shape has been misread. Every arrow is a real route.

```
LANDING PAGE  (13)
  nav: Sign in ──────────────────────────────────────┐
  primary CTA:   "See it with sample data" ──┐       │
  secondary CTA: "Start with my own figures" │       │
                                             │       │
                        ┌────────────────────┘       │
                        ▼                            │
                   DEMO MODE (11)                    │
                   real app, seeded figures,         │
                   permanent "not your money" bar    │
                   "Start with my own figures" ──┐   │
                                                 │   │
  ┌──────────────────────────────────────────────┘   │
  ▼                                                  │
WELCOME → ONBOARDING (6 steps, unchanged)            │
  no email · no password · no account                │
  ▼                                                  │
HOME — the free tier, and a complete product         │
  full app on one device, no prompts in the way      │
  │                                                  │
  ├── reaches a paid feature ──▶ inline "not turned  │
  │     on yet" (09) ──▶ tier comparison ──▶ SIGN UP │
  │                                                  │
  └── Settings ──▶ account row ──▶ SIGN UP (08) ◀────┘
                                      │        SIGN IN (08)
                                      ▼            │
                          local data is uploaded    │
                          never starts empty        │
                                      │            ▼
                                      │   second device:
                                      │   budget arrives, straight
                                      │   to Home, no onboarding
                                      │            │
                                      │   unless that device already
                                      │   holds a different budget ──▶
                                      │   the two-budget choice (25),
                                      │   export offered FIRST
                                      ▼
                          SIGNED IN — sync, household, bank
```

**The three things that shape it:**

1. **Onboarding never asks for an account.** Someone can install this, use it for a year, and never see a sign-up screen. That is the free tier, and it is a complete product — not a trial.
2. **Sign-up is reached from two places only:** a paid feature the person reached for, or the account row in Settings. Never an interstitial, never on Home, never on open.
3. **Sign-in is reached from three:** the landing page nav, the Settings row, and the sign-up screen itself (*already have an account?*).

**Where the two surfaces differ, and this is the bit that caused the confusion:** the
**landing page** has *Sign in* in its nav like any webapp — a returning user on a new
laptop arrives there. **Inside the app** it is a Settings row, because a persistent
*Sign in* on every screen would imply the app is incomplete without one.

## 4 · New pages, at page-spec level

For each: **purpose · how you arrive · hierarchy · the states · motion · keyboard ·
what happens on success.** Behaviour is in the system spec; this is what the page has
to *do*.

### 08 · `/sign-up`, `/sign-in`, `/reset`

> **These screens exist and are all `Must`.** The phrase *"an account is an upgrade,
> not a gate"* elsewhere in this brief means an account is not **required** — it does
> not mean there is no sign-up. Stories **I2** (sign up), **I3** (sign in), **I4**
> (reset) are every one of them a `Must`.
>
> **Where the entry points live, and they are different on two surfaces:**
>
> - **The landing page** carries *Sign in* in its nav, as any webapp does. Someone returning on a new laptop arrives there and must be able to get in.
> - **Inside the app** the way in is a row in **Settings** (§08a), not a persistent nav item. A *Sign in* link on every app screen would imply the app is incomplete without one, and it is not.
>
> Whether 1440 also wants a quiet header affordance inside the app is **your call** —
> the only constraint is that it must not read as a nag or imply something is missing.

**Purpose:** turn a local user into an account holder, with as little ceremony as the
security allows.

**Arrive from:** Settings, a locked feature (§09), the landing page.

**Hierarchy:** one job per screen. The password requirement is stated **before** the
field, not after rejection.

**The trust panel is not fine print (§I8).** Before anyone hands over data: what is
encrypted, that keys live outside the database, that every access is logged. This is
the screen where someone decides whether to trust you with their salary.

**States:** empty · typing · invalid · submitting · rate-limited · wrong password ·
expired reset link · success. Reset always says *"if that address has an account, a
link has been sent"* — it must never reveal whether it exists.

**Motion:** minimal. Validation appearing must not shift the layout under the cursor.

**Keyboard:** Enter submits. Tab order is field, field, submit — nothing clever.

**On success:** they land where they were going, not on a generic dashboard. Someone
who signed up to unlock sync arrives back at sync.

### 08a · `/settings` — extended, not replaced

**Purpose:** the account lives beside the existing settings, because it is a setting.

**States:** signed out (one row, what an account adds — not a banner, not a nag) ·
signed in · devices (**I7**) · sign out · delete account.

**Sign out must say what happens to the data on this device**, in words that match
what actually happens. If unsynced changes exist, warn **before**.

**Delete account** is the most serious action in the product: two steps, states the
**30-day** grace, then permanent. Serious without being theatrical.

### 09 · Tiers and the locked state

**Purpose:** explain what paying adds, without poisoning the free product.

**The locked state is the hardest thing in this brief.** A locked control must say
what the feature is and what it costs. A dead control with no explanation is a bug
(**L2**). And the tone has a floor: **a lock that feels punitive on a budgeting app
is worse than having no paid tier.** These are people managing scarcity.

**States:** free (what paid adds) · a locked feature in place · subscribing ·
subscribed · **lapsed**.

**Lapsed is the one to get right.** Sync stopped; the app did not. Every record is
there, editable, exportable. It must read as *the free tier*, which is a complete
product — never as a broken or hostage app.

**Motion:** none that celebrates. A tasteful confirmation on subscribing, nothing
that performs.

### 10 · Sync

**Purpose:** let someone know whether the figure in front of them can be trusted.

**States:** up to date · unsynced changes · offline · syncing · failed ·
**cursor expired / full resync** (rare, slow, needs an honest explanation) ·
**signing in where a budget already exists**.

**That last one needs real thought (§I3).** Someone signs in on a device that already
holds a different budget. They must be *asked* — nothing merges, because merging two
budgets has no correct answer. **Both options are destructive** and the person has to
understand which is which. This may not fit in one screen.

**Where the indicator lives is §H item 23** and it is the only item touching a screen
you have already drawn.

### 11 · Demo mode — **now a Must**

**Purpose:** let a stranger see a filled-in app in one click, without signing up.

**Arrive from:** the landing page (primary call to action) and the welcome screen.

**This is probably the highest-converting screen in the product**, and most of the
work exists: `npm run seed` already writes a real export file that restores through
the ordinary import path.

**What it needs from you:**

- **An unmistakable, permanent marker that these figures are not theirs.** A money app showing invented numbers that someone mistakes for their own is a genuine hazard, not a design nicety. It has to be visible on every screen, and it must not be dismissable.
- **A way out that keeps nothing** — "start with my own figures" wipes the demo cleanly.
- **A state where they have edited the demo.** People will. It must still be obviously a demo.

### 12 · Household *(drawn now, built later)*

Invite · accept (joins an existing budget, **never** a second copy) · members ·
**the disagreement**.

> *"You set Food to ₦40,000. Your wife set it to ₦35,000. Do you agree to this?"*

**It must read as two people agreeing, not as software refereeing.** A shared
household budget *is* an agreement between two people. Both amounts are kept until
someone settles it.

### 13 · Bank movement *(drawn now, built v1.1)*

Before linking (**read-only must be unmistakable** — it can see, it cannot move
money, and the connection can be cut any time) · linking · linked · **reconciliation**
· possible duplicate.

**Reconciliation is the centre of the paid product and is drawn nowhere:**

> *"₦12,000 left your account — which envelope?"*

A queue. Clearing a small inbox, not doing data entry. **This is where the app's best
motion belongs.**

**Possible duplicate (§M5):** manual entry does not stop, so the same expense arrives
twice. Suggest a match; let the owner confirm or separate. **Never silently decide
two of someone's expenses were one.**

---

## 5 · What this brief does not decide

Layout, hierarchy, palette, type, and the motion values themselves are **yours**.
Where this and the spec disagree, `peer-ai/shared/design-data-contract.md` applies:
design owns layout, spacing, type, colour and motion; the spec owns behaviour, states
and data. **Name it and log it — never pick a side quietly.**

## 6 · Constraints

- **360 and 1440, light and dark**, for anything built now. Desktop is designed, not derived.
- **Every state** (**F6**), including the awkward one.
- **Contrast stays gated** — 54 pairs, no failures; new pairs join the check.
- **`prefers-reduced-motion` for every animation**, with a legible fallback.
- **No invented figures.** Amounts come from `docs/seed-data.md` (repo rule 2). If a screen needs one that does not exist, say so — it will be added, not invented.

## 7 · Questions

[open-items.md](open-items.md) §H — answered in place, heading marked
`answered <date>`.
