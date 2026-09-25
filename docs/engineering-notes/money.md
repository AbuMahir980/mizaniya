# Money handling

*Why every amount is a whole number of kobo, and why rounding always goes one way.*

## The problem

Open a JavaScript console and type this:

```js
0.1 + 0.2
// 0.30000000000000004
```

That is not a bug in JavaScript. It is how computers store decimal fractions, and it
happens in nearly every language. Most of the time nobody notices.

In a money app, people notice. Add a few hundred amounts stored as `1250.50` and the
total ends in `.000000001`. Divide a budget across 20 days and the remainders don't add
back up. The figures are *almost* right, which is worse than obviously wrong, because
nobody investigates a number that looks plausible.

## The short version

Money is never a decimal. It is stored and calculated as a **whole number of kobo** —
₦1,250.50 is `125050`. It has its own type so a plain number can't be used as money by
accident. It is formatted in exactly one place. And when a division doesn't come out
even, it **rounds down**, because overstating what someone can spend is the direction
that causes harm.

## The words first

| Word | What it means | Where |
|---|---|---|
| **Kobo** | The minor unit of the naira. 100 kobo = ₦1. Like pence, or cents. | — |
| **Minor unit** | Storing money as the smallest whole unit, so no fractions exist. | `packages/core/src/money/money.ts` |
| **`Kobo`** | Our *type* for that. A number the compiler treats as money, not as any old number. | `packages/core/src/types.ts` |
| **Branded type** | A type that is really a number, but that TypeScript refuses to mix with plain numbers. | `packages/core/src/types.ts` |
| **Floor** | Round down, always. Never to the nearest. | `packages/core/src/money/money.ts` |

---

## The reasoning, in the order the questions come

### "How do you store money?"

As an integer number of kobo. ₦450,000 is `45000000`.

### "Why not just use decimals and round at the end?"

Because the errors accumulate *before* the end, and they accumulate in the arithmetic
you can't see. The total on screen is one calculation; the per-category figures, the
rollover, the projected gap and the daily allowance are all separate ones over the same
data. Rounding "at the end" means rounding at a dozen different ends, and they no
longer agree with each other.

With integers there is no error to accumulate. `45000000 / 20` either divides exactly
or it doesn't, and when it doesn't you decide what to do — once, deliberately.

### "Why a special type? An integer is an integer."

Because the dangerous mistake isn't arithmetic, it's **unit confusion**. Passing ₦450
where kobo was expected is a factor-of-100 error, and nothing about `450` looks wrong.

So `Kobo` is a branded type:

```ts
export type Kobo = number & { readonly __brand: 'Kobo' }
```

At runtime it is just a number — no wrapper, no cost. At compile time, a plain `number`
cannot be passed where `Kobo` is expected. **The most expensive mistake in the app fails
to compile** rather than failing quietly in someone's budget.

Getting a `Kobo` means going through a constructor, and the constructors refuse bad
input:

```ts
export function naira(whole: number): Kobo {
  if (!Number.isInteger(whole)) throw new RangeError(`naira() takes whole naira, got ${whole}`)
  ...
}
```

`naira(12.5)` throws. It has to — silently accepting it is how a float gets into the
system, and after that every guarantee above is decoration.

### "Why one formatter?"

Because money formatted in two places eventually disagrees. One shows `₦1,250.5`, the
other `₦1,250.50`, and now the app looks careless in the one area where it must not.

So `formatMoney` is the only thing that renders an amount, and **ESLint enforces it**:
only `apps/web/src/ui/money-text.tsx` may import it. Anywhere else importing it fails the build.
Every screen renders `<MoneyText />` instead.

Three rules live inside that one place:

- **Always two decimals.** `₦1,250,000.00`, never `₦1,250,000`.
- **A non-zero kobo is never hidden.** In a naira-only, hand-entered app, a stray `.50` is almost always a typo — showing it is what makes it findable.
- **Never a bare minus sign for direction.** A negative here is an arithmetic result, not a movement. Screens showing direction use a word: "over", "owed to you".

There is also `speakMoney` for screen readers, so the spoken form matches the visible
one instead of inventing its own vocabulary ("point zero zero" is not what anyone says).

### "What happens when a division doesn't come out even?"

It rounds **down**, always. That is not a neutral choice and the function name says so:

```ts
export function perUnitFloor(total: Kobo, units: number): Kobo
```

Safe-to-spend is what's left divided by the days remaining. If that's `₦11,111.11` and
a third of a kobo, rounding up gives the user a daily allowance that, followed exactly,
runs out before the cycle does.

**Overstating what someone can safely spend is the direction that hurts.** Understating
by a fraction of a kobo harms nobody. So the remainder is dropped.

The rounding direction is **in the function name**, not a parameter with a default,
because a default is a decision nobody made. A caller has to pick `perUnitFloor` or its
counterpart and can see which one they picked in the diff.

### "Does this cost anything?"

Yes, and it's worth being honest about it: **conversion at every boundary.** The user
types "450,000" and something has to turn that into `45000000`. The screen needs
`₦450,000.00` back out. Every form field, every display, every export file is a place
where the conversion has to happen and could be wrong.

The answer is that the conversions live in few places — the parser, the formatter, the
schema — and everything between them is integers. The boundary is where the risk is,
so the boundary is where the tests are.

---

## If you had to do it again

### 1. Pick the minor unit and never leave it

Decide on kobo (or cents, or pence) on day one. Retrofitting this later means touching
every arithmetic operation in the app while real data exists.

### 2. Brand the type so the compiler helps

```ts
export type Kobo = number & { readonly __brand: 'Kobo' }
```

Free at runtime. It turns unit confusion from a code-review concern into a compile
error.

### 3. Put every money operation in one module, with the rounding in the names

`packages/core/src/money/money.ts` — construction, formatting, speaking, splitting for display,
and the two rounding directions. Nothing outside it does arithmetic on amounts.

### 4. Enforce the single formatter with a lint rule

An agreement that "we always use `MoneyText`" lasts until someone is in a hurry. A rule
that fails the build lasts.

### 5. Test the awkward numbers, not the round ones

`packages/core/src/money/money.test.ts` — 22 tests, and the interesting half are about the edges:

- `rejects fractional naira and fractional kobo`
- `never hides a non-zero kobo`
- `money you may spend rounds down` / `money you must find rounds up`
- `rounds up rather than to the nearest when finding money`
- `refuses to divide by zero days`
- `a shortfall never shows as a negative allowance`
- `rejects a float proportion, which is how the error creeps in`

That last name is this whole note in one line. And two tests pin the same figure computed
two ways: the amber threshold is ₦5,200.00 taken from the real allowance, and would be
₦5,199.99 if taken from the **displayed** one. One kobo, from rounding a moment too early —
and a test that says so out loud.

---

## Where this lives

| File | What's in it |
|---|---|
| `packages/core/src/money/money.ts` | Everything. Construction, formatting, rounding. Read this first. |
| `packages/core/src/types.ts` | The `Kobo` type itself. |
| `apps/web/src/ui/money-text.tsx` | The only component allowed to format an amount. |
| `eslint.config.js` | The rule that keeps `formatMoney` inside that one component. |
| `packages/core/src/money/money.test.ts` | The awkward numbers. |
| `docs/seed-data.md` | The only source of figures anywhere in this repo (repo rule 2). |

## Related

- `derived-state.md` — where the rounding actually gets used
- `validation.md` — how an amount from a file is checked before it's trusted
- standards **H1**, **H2**, **H5** in `docs/standards/` · [ADR-004](../02-architecture.md)
