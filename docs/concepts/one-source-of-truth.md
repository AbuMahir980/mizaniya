# One source of truth

**The one line:** whenever a fact is written down twice, the copy people read is
the copy that goes stale.

---

## What it is

A rule about *where a fact is allowed to live*: in exactly one place. Everything
else points at it.

It shows up all over this project, in forms that look unrelated until you line
them up:

| Fact | Lives in | Everything else |
|---|---|---|
| The engineering rules | `docs/standards/` | `CLAUDE.md` and peer-ai's rules files **reference by section number** |
| The domain shapes | `src/core/types.ts` | `docs/04-api-contract.md` **indexes and explains**, never restates |
| The financial figures | `docs/seed-data.md` | Tests, screenshots and docs **import** them |
| Cash left, balances, gaps | the transaction list | every screen **calculates**, nothing stores |

Four rules, one idea.

---

## Why it matters more than it sounds

The obvious cost of copying is effort — five places to edit instead of one. That
is the small half, and it is not what hurts you.

Here is what actually happens. You change three of the five. The other two sit
there in confident bold type, still saying the old thing. Now the repository
holds two statements that contradict each other, **both look official**, and
nothing marks which is current.

Then it gets worse, because of *which* copy people read.

A prose document is easier to read than a type definition. So the document is
the one people open — which means the copy most likely to be stale is the copy
most likely to be believed.

That is why `docs/04-api-contract.md` deliberately contains no field lists. If it
did, renaming one field in `types.ts` would leave the code right and the
document wrong, with no test anywhere comparing prose to code, and the wrong one
being the readable one.

---

## When you cannot avoid two copies, make the drift loud

Sometimes two representations genuinely have to exist — see
[[types-vs-runtime-validation]]. The rule then changes shape rather than
disappearing:

> If a fact must live in two places, something automated must fail when they
> disagree.

That is why the API contract phase demands a CI step that regenerates the
document from the source and fails on any diff. It converts a silent
disagreement into a loud one — which is the whole of
[[what-breaks-who-finds-out]] applied to documentation.

Until that step exists, the document says plainly that its tables are
hand-checked. Saying so is the honest version of not having the gate.

---

## What we would have done instead, and why not

**Write the fields into the document as well**, because it reads better. It does
read better — right up until the first rename, after which it reads better *and*
is wrong.

**Skip the document entirely and let the code speak.** Tempting, and it fails a
different way: a newcomer meeting `Repository` for the first time needs to know
*why* it is deliberately boring. Code records what; the document records why.
Those are different facts, so each still has exactly one home.

---

## The interview sentence

"I keep every fact in exactly one place and reference it from everywhere else,
because duplicated facts drift and the readable copy is the one that goes stale
— and where two representations are unavoidable, I make something fail when they
disagree."

---

## In your own words

_Add a line here after reading._
