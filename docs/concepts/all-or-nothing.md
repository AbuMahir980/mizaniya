# All or nothing

**The one line:** half-succeeding is the worst outcome available, because it
looks exactly like succeeding.

---

## What it is

Some operations must either happen completely or not at all. There is no
sensible middle. Importing a backup is the clearest case in this app.

Two rules follow from that, and they are the same rule pointing in two
directions:

1. **Write it all in one transaction.** If any part fails, nothing lands.
2. **Refuse what you cannot fully honour.** Do not load the parts you recognise.

---

## Why partial success is worse than failure

Picture an import that half works.

Some rows land. Some do not. **No error is shown**, because from the app's point
of view nothing went wrong — it wrote what it could. The screens open. The
figures render. They are plausible: a little lower than you remember, but you
have been spending.

You carry on. Next cycle you export again, and that export — now the newest file
you have — contains the damage. The good file is behind you.

Compare that with a blunt refusal: *"This file was made by a newer version of
Mizaniya. Update the app, then import it again."* Mildly annoying. Costs a
minute. Nothing is lost.

**Loud failure is cheap. Silent partial success is expensive.** Same lesson as
[[what-breaks-who-finds-out]], in the place it does most damage.

---

## Why a *newer* file is refused rather than partly read

"Load what we understand and skip the rest" sounds generous. Follow it through.

A newer version of the app added a field — or a whole entity. Skipping what we
do not recognise means **silently deleting the owner's data** while reporting
success. And it produces a state no version was designed for: not the old shape,
not the new one, with neither version's assumptions holding.

The kind thing and the correct thing agree here: say no, say why, and change
nothing.

---

## Where else this shows up in Mizaniya

- **Storage before memory** (ADR-001). A write goes to IndexedDB first and to
  the in-memory snapshot only if it resolved. If it fails, both are unchanged —
  the screen and the database can never end up disagreeing.
- **Export before overwrite** (D12, ADR-005). An import that replaces live data
  exports the current data to a file first, and says so. That turns an
  irreversible action into a recoverable one.
- **Old files migrate in order**, each step a pure `v(n) → v(n+1)` function, and
  the whole chain runs before anything is written.

---

## What we would have done instead, and why not

**Write row by row and report how many succeeded.** Simpler, and it hands the
owner a number they cannot act on. What would "1,842 of 1,907 imported" even
mean to them — which sixty-five?

**Accept a newer file and ignore unknown fields.** This is a reasonable default
for an API talking to itself, where forward-compatibility is designed in. It is
wrong for a file that is somebody's only backup.

---

## The interview sentence

"I make destructive operations atomic and refuse anything I cannot fully honour,
because a partial success reports itself as a success and the user finds out
much later, when the good copy is gone."

---

## In your own words

_Add a line here after reading._
