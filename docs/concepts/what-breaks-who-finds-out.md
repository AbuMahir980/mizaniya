# What breaks — and who finds out?

**The one line:** every failure has two halves — what goes wrong, and whether
anyone learns about it. Most people only answer the first half.

---

## What it is

A two-question check you run over any decision, any bug, any piece of logic.

**1. What breaks?**
The wrong number. The extra work. The stale rule. The crash.

**2. Who finds out — and how?**
A test goes red? The screen shows an error? The app refuses to save?
Or nobody, ever?

The first question tells you *that* there is a problem. The second tells you
*how much it will cost you*.

---

## Why the second question is the important one

Line up three faults, worst-looking first:

| The fault | Who finds out | What it really costs |
|---|---|---|
| The app will not start | You, in ten seconds | Ten minutes |
| It crashes when you add an expense | You, today | An afternoon |
| Safe-to-spend is quietly ₦8,000 too high | **Nobody** | Months of overspending, while you trust the number |

The third is the smallest fault and by far the worst outcome.

**Loud problems are cheap. Silent problems are expensive.**

A crash is software doing you a favour — it is telling you. A wrong number that
looks right tells you nothing, so you keep believing it, and you keep making
decisions with it.

---

## Why it matters in this app especially

Mizaniya exists to answer one question: *how much can I safely spend today?*

The answer is a single number on a screen. It has no units of doubt attached to
it. Nobody cross-checks it against a spreadsheet — that is the whole point of
building the app.

So a silently wrong number here is not a bug that annoys someone. It is the
product failing at the only job it has, invisibly, for as long as it takes
someone to notice their money is gone. That is why so many of the rules in
`docs/standards/` are really about detectability:

- **B3** — derive values, never store them. A stored copy can go stale and
  cannot disagree with itself, so nothing catches the drift.
- **E2** — extract money and validation logic on the *first* repeat, not the
  third. Duplicated logic drifts, and when what drifts is money, the cost is
  not a refactor.
- **K4** — a bug fix ships with the test that would have caught it. That is
  detectability bought for next time.
- **I4** (not used here — no safety-critical data) — the same idea taken to its
  strictest form: prove the display path still works, no exceptions.

Seen this way those are not four rules. They are one rule wearing four hats.

---

## What we would have done instead, and why not

**Just ask "what breaks?"** — the natural instinct, and it is not wrong, only
half-finished. It ranks faults by how alarming they look. That gets it exactly
backwards: the alarming ones are the safe ones, because they announce
themselves.

**A formal risk matrix** (severity × likelihood × detectability — engineers call
the full version FMEA) — this is the same idea with paperwork. It earns its
keep on an aircraft or a hospital device, where the review has to be auditable
and a committee has to sign it. For one person building a budgeting app, the
forms would get filled in once and never again. Two questions you actually ask
beat a matrix you abandon.

---

## The interview sentence

"I judge a failure by whether it can be detected, not just by how bad it looks —
a wrong number nobody can catch is worse than a crash, because the crash at
least tells you."

---

## In your own words

_Add a line here after reading, in your own words. If you cannot, that is the
signal to ask again rather than move on._
