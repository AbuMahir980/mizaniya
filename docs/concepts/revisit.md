# Revisit

Things half-understood, logged at the stop where they came up, so they get a
second pass at the moment they actually matter — not filed away and forgotten.

This is not a list of failures. It is a list of threads worth pulling.

---

## Open

### Detectability — the missing half of an answer

**Came up:** 2026-09-10, at the SETUP stop, across two questions in a row.

**Question 1 — B3, derived values are derived, never stored.**
*Held up:* safe-to-spend is planned minus spent, so an unlogged expense leaves
the stored number too high. Right answer, right reason.
*Missing:* that nothing anywhere would know it was wrong. The transactions and
the stored field disagree, both look equally confident, and no test can tell
them apart.

**Question 2 — why reference the standards instead of copying them in.**
*Held up:* DRY. One source, one edit, instead of five.
*Missing:* the cost is not the five edits. It is that you will make three of
them and forget two, leaving two rules that contradict each other with nothing
marking which is current.

**The pattern:** both answers stopped at *what breaks* and did not reach *who
finds out*. Wrong-and-loud is cheap; wrong-and-silent is the expensive one.

**What came of it:** the two-question method, written up as
[what-breaks-who-finds-out.md](what-breaks-who-finds-out.md). Every answer now
ends with either *"and a test would catch it"* or *"and nobody would ever
know."* If neither can be said, the answer is not finished.

**Revisit when:** building safe-to-spend in `core/`, and again at the Home
screen. Those are the exact places where a silently wrong number does its
damage. The question to ask then, out loud: *if this figure were ₦8,000 wrong,
what in this codebase would notice?*

---

## Closed

_Nothing yet. An entry moves here once the second pass has happened and the
answer holds up without help._
