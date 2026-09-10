# Derived state

**The one line:** store the facts, work out the conclusions — because a stored
conclusion can go stale without anyone finding out.

---

## What it is

Some values are **facts**: you spent ₦3,500 on food on 14 September. Nobody can
calculate that; it has to be recorded.

Other values are **conclusions**: cash left, safe-to-spend, how much of the food
envelope remains, whether rent will be funded by 1 March. Every one of these can
be worked out from the facts.

Derived state means: **save the facts, and calculate the conclusions fresh every
time you need them.**

---

## Why we use it here

Mizaniya's entire architecture rests on this. Look at what it buys.

Suppose safe-to-spend were saved as a field. You add an expense you forgot from
yesterday. Now the transaction list says one thing, the saved figure says
another, and both look equally certain on screen. **No test can tell them
apart**, because a saved number has no way to disagree with itself.

Derived instead, the forgotten expense fixes the figure automatically. Nobody
has to remember to update anything.

That is also why step 9 of the core journey works: export your data, import it
into a clean browser, and every screen shows the same figures. Not because we
were careful — because there was nothing stored that *could* have drifted.

This is standard **B3**, and it is closely related to
[[what-breaks-who-finds-out]] — a stored conclusion is the classic
wrong-and-silent failure.

---

## What we would have done instead, and why not

**Store the totals and update them on every write.** This is the obvious
optimisation, and it is what a spreadsheet effectively does. It fails for a
specific reason: the figure is only correct while *every* path that touches
money remembers to update it — adding, editing, deleting, importing a backup,
and later syncing from another device. The day one path forgets, the number is
quietly wrong forever and drifts further every month. Deletes and edits are
worse than adds: to reverse one you need the old amount, which you no longer
have.

**Why not worry about the cost?** Because the data is tiny. One person's budget
is a few thousand transactions. Recalculating everything takes a moment you
cannot perceive. The rule would need revisiting over millions of rows; it does
not need revisiting here.

---

## The interview sentence

"I keep derived values derived rather than stored, because a stored total can
drift out of step with the records that produced it and nothing in the system
can detect that — the recalculation is cheap and it makes staleness structurally
impossible."

---

## In your own words

_Add a line here after reading._
