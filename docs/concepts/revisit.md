# Revisit

Things half-understood, logged at the stop where they came up, so they get a
second pass at the moment they actually matter — not filed away and forgotten.

This is not a list of failures. It is a list of threads worth pulling.

**Every stop's questions and answers are in [[review-questions]].** This file is
narrower: only the ones that did not land, and where to ask them again.

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

### The API-contract five — taught, not tested

**Came up:** 2026-09-10, at the API CONTRACT stop.

Five questions were asked and the stakeholder chose to be **taught the answers
rather than tested on them**. That is a legitimate choice and not a miss — but
it means these five have not actually been checked, so they are logged here
rather than quietly counted as understood.

The five: why the contract document holds no field lists · whether `Debt` having
no direction and `Goal` having no `savedSoFar` are the same reason · why types
*and* a runtime schema is not the duplication we argue against · why a newer
import file is refused outright · where "watch for changes" went instead of onto
`Repository`.

Written up as [[one-source-of-truth]], [[types-vs-runtime-validation]],
[[all-or-nothing]], and a new section in [[repository-pattern]].

**One of them found a real defect.** Question 3 exposed that `types.ts` and
`schema.ts` describe the same shapes with nothing preventing them drifting. The
fix — annotating each schema with the type it must produce, so `tsc` fails on
disagreement — is in `docs/backlog.md` as a BUILD task, because proving it works
needs a compiler and there is no `package.json` yet.

**Revisit when:** BUILD, at the first task, and again at the code review. Ask
then, without warning: *why does the API contract document contain no field
lists?* If the answer does not reach "the readable copy is the one that goes
stale", it has not landed.

### The design-stop five — answered on request, for revision

**Came up:** 2026-09-10, at the design stop. Asked to be written up with their
answers rather than tested, to revise from later. Recorded in
[[review-questions]], and one of them produced a new note —
[[hierarchy-and-attention]], on why a ninth tile is never free and why the
offline banner must not be red.

**Revisit when:** the design arrives and SHARED RULES starts. That is the first
moment the hierarchy stops being a paragraph and becomes pixels, and the first
chance to get the danger colour wrong in code. Ask then: *what does this
displace?*

---

## Closed

_Nothing yet. An entry moves here once the second pass has happened and the
answer holds up without help._
