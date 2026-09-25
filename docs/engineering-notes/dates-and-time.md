# Dates and time

*Why a spending date is not a timestamp, and why the app never asks what time it is.*

## The problem

This app doesn't budget by calendar month. It budgets by **salary cycle** — the 25th to
the 24th, if you're paid on the 25th. Nearly every figure depends on which cycle a
movement falls into and how many days are left in it.

Two things make that harder than it sounds:

1. **Not every month has a 25th-equivalent.** Paid on the 31st? February doesn't have one.
2. **"The day I spent this" is not a moment in time.** It's a calendar fact. Store it as a timestamp and it can appear to move.

## The short version

Two different types: `IsoDate` for calendar days (`2026-09-25`) and `Instant` for actual
timestamps. Anything a cycle calculation reads is an `IsoDate`. The domain code **never
reads the clock** — today's date is passed in as an argument. And a salary day past the
end of a short month is clamped to the last day, never rolled into the next one.

## The words first

| Word | What it means | Where |
|---|---|---|
| **`IsoDate`** | A calendar day, `YYYY-MM-DD`. No time, no timezone. | `src/core/types.ts` |
| **`Instant`** | A real moment, with a timezone. Used for bookkeeping only. | `src/core/types.ts` |
| **Cycle** | One salary period. Starts on your salary day, ends the day before the next. | `src/core/cycle/cycle.ts` |
| **Clamp** | Pull a value back to the nearest allowed one. The 31st clamps to the 28th in February. | `src/core/cycle/cycle.ts` |
| **Half-open range** | Start included, end excluded. How cycles are expressed so they don't overlap. | `src/core/repository.ts` |

---

## The reasoning, in the order the questions come

### "Why two date types?"

Because they answer different questions, and mixing them causes a specific, silent bug.

`2026-09-25` as a calendar date means the 25th of September, everywhere, to everyone.

Store the same thing as a timestamp — `2026-09-25T00:00:00+01:00` — and it is a moment.
Moments move when you change the observer. Read that in a browser set to UTC and it is
**the 24th at 23:00**. The transaction has silently moved to the previous day.

If the 24th is the last day of the cycle, that expense has just jumped into last month's
budget. Nothing errors. Two figures are now wrong, and the only way to notice is to
already suspect it.

So:

- **`IsoDate`** — anything a cycle calculation reads. The spending date, the salary day, a goal's due date.
- **`Instant`** — bookkeeping only. When a record was created, when an export was written, when a row last changed for sync.

Both are branded types (see `money.md`), so one cannot be passed where the other is
expected. The comment in `types.ts` is explicit: `Instant` is *"never for anything a
cycle calculation reads."*

### "Why doesn't the code just read the clock?"

Because then you cannot test it, and the cases that matter are cases you cannot wait for.

Every calculation takes `now` as an argument:

```ts
export function cycleFor(settings: Settings, date: IsoDate): Cycle
export function daysLeft(settings: Settings, now: IsoDate): number
export function safeToSpend(snapshot: Snapshot, now: string): SafeToSpend
```

`src/core/` contains no `Date.now()` anywhere, and ESLint fails the build if one appears.

The rule itself is worth a look, because the obvious version of it was wrong. Banning
`Date` outright was the first attempt — and it also banned *parsing* a date, which
`schema.ts` legitimately does to check that `2026-02-30` is not a real day. So the rule
bans exactly the two ways of asking what time it is now, and nothing else:

```js
"NewExpression[callee.name='Date'][arguments.length=0]"          // new Date()
"CallExpression[callee.object.name='Date'][callee.property.name='now']"  // Date.now()
```

A rule that blocks legitimate work gets switched off, and then it protects nothing.

**What that buys:** you can ask "what does this do on 29 February?" without waiting four
years for one. A leap-year bug, a short-February bug, a
what-happens-on-the-last-day-of-a-cycle bug — all reproducible on purpose, in a test
that runs in milliseconds.

**What it costs:** one extra argument on a lot of functions. That's the whole price, and
it's visible in every signature rather than hidden.

The app reads the clock in exactly one place — a React hook — which hands `now` and `at`
down to everything else (`src/app/today-context.tsx`).

### "What happens if someone is paid on the 31st?"

The salary day is **clamped to the last day of the month**:

```ts
return toIsoDate({ year, month, day: Math.min(settings.salaryDay, daysInMonth(year, month)) })
```

So the 31st becomes 28 February — or the 29th in a leap year, or the 30th in April.

**Why clamp rather than roll forward to 1 March?** Because rolling forward breaks the
sequence of cycles. February would have *no* salary day and March would have *two*. Every
figure that depends on "which cycle is this" would be wrong for two months, and the cycle
after would start in the wrong place.

Clamping keeps exactly one salary day per month, always, which is the property everything
else relies on.

The salary day is also checked on the way in — a non-integer, or anything outside 1–31,
throws rather than producing a nonsense date.

### "How do you express a cycle's range without overlapping?"

Half-open: **start included, end excluded.**

```ts
export interface DateRange {
  from: IsoDate
  /** Exclusive. */
  to: IsoDate
}
```

Cycles abut — one ends exactly where the next begins. With an inclusive end, the boundary
day would belong to *both* cycles, and every expense on a salary day would be counted
twice.

### "Anything else non-obvious?"

**Walking months, not days.** Working out how many paydays fall between now and a rent
goal due in March means walking month by month and clamping each one, not counting 200
days forward. Fewer iterations, and it can't drift.

**Hijri dates are displayed, never calculated with.** `hijriDate()` formats a Gregorian
date in the Islamic calendar for display, using the platform's own calendar support. No
arithmetic is ever done in it — the cycle maths stays Gregorian, and the Hijri date is a
label on top.

---

## If you had to do it again

### 1. Separate "a day" from "a moment" in the type system

Two branded types, and write down in the type itself which one calculations may read. The
comment in `types.ts` is doing real work:

```ts
/** Used only for bookkeeping — createdAt, exportedAt — never for anything a cycle calculation reads. */
export type Instant = string & { readonly __brand: 'Instant' }
```

### 2. Pass the time in, everywhere

Make `now` an argument. Read the clock once, at the edge of the app, and hand it down. Then
every date-dependent behaviour is testable at any date you like.

### 3. Decide the awkward-month rule explicitly, and write down why

Clamp or roll forward — pick one, in writing, before you have data. Both are defensible;
silently doing one and documenting the other is not.

### 4. Make ranges half-open and say so in the type

```ts
/** Exclusive. */
to: IsoDate
```

One comment that stops a double-counting bug.

### 5. Test the calendar's nasty corners

`src/core/cycle/cycle.test.ts` — 32 tests. February in a leap year and not. The 29th,
30th and 31st as salary days. A cycle that crosses a year boundary. Those are the tests
that make the rest trustworthy.

---

## Where this lives

| File | What's in it |
|---|---|
| `src/core/cycle/cycle.ts` | Everything: cycles, clamping, day counting, paydays, Hijri display. |
| `src/core/types.ts` | `IsoDate` and `Instant`, and the rule about which is for what. |
| `src/app/today-context.tsx` | The one place the clock is read, handing `now` and `at` down. |
| `src/core/cycle/cycle.test.ts` | 32 tests, mostly about awkward months. |

## Related

- `money.md` — the other branded type, for the same reason
- `derived-state.md` — the calculations that take `now` as an argument
- standard **ADR-003** in `docs/02-architecture.md` · decision **D4** on salary days
