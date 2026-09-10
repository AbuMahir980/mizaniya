# Review questions and answers

Every phase stop ends with five questions. This file collects them with their
answers, so they can be revised from later — the questions themselves were
otherwise recorded nowhere.

**Short answers only.** The full reasoning lives in the concept note each one
links to, because an explanation written twice will eventually disagree with
itself ([[one-source-of-truth]]).

**How to use it:** cover the answer column, work through the questions, and
check. Anything that does not come back cleanly goes in [[revisit]] with the
place it will next matter.

---

## Setup stop — 2026-09-09

| # | Question | Short answer | Full |
|:-:|---|---|---|
| 1 | Safe-to-spend is stored as a field. You add a forgotten expense. What is wrong? | The figure is too high — but the real problem is that **nothing anywhere knows it is wrong**. The transactions and the stored field disagree and both look equally confident | [[derived-state]] |
| 2 | Why does `CLAUDE.md` reference the standards rather than include them? | You will update three of the five copies. The other two keep saying the old thing, both look official, and the readable copy is the one that goes stale | [[one-source-of-truth]] |
| 3 | The state file says "understand", `CONTEXT.md` says setup is finished. Contradiction? | No — different tenses. The state file points **forward** (*what next?*); `CONTEXT.md` looks **backward** (*how did we get here?*). A bookmark and a diary | — |
| 4 | Rule 2 bans real figures. What does that buy beyond privacy? | Fixed invented figures make wrongness **detectable**: a test can only catch a bad number if it knows the right one in advance. It also lets you aim figures at awkward edges | [[what-breaks-who-finds-out]] |
| 5 | Why does the design arrive *after* the page specs? | A designer with no spec draws the happy path. Nobody spontaneously draws "you have no transactions yet" or "that save failed" — and those are what a real person sees on a bad day | — |

**The lesson from this round:** answers stopped at *what breaks* and did not
reach *who finds out*. That produced the two-question method in
[[what-breaks-who-finds-out]].

---

## API contract stop — 2026-09-10

*Taught rather than tested, so not yet counted as understood — see [[revisit]].*

| # | Question | Short answer | Full |
|:-:|---|---|---|
| 1 | Why does the contract document hold no field lists? | Rename a field and the code is right, the document is wrong, and nothing compares prose to code. The document is the more readable copy, so **the stale one is the one people believe** | [[one-source-of-truth]] |
| 2 | `Debt` has no direction, `Goal` has no `savedSoFar` — same reason? | Same rule, different danger. `savedSoFar` would be wrong **often**, so testing catches it. `direction` would be wrong on **one day** — the ajo crossing. Rare wrongness is worse | [[derived-state]] |
| 3 | Types *and* a runtime schema — isn't that the duplication you warn about? | They exist at different times, and only one exists when it matters. TypeScript is deleted at compile time and protects you from your own code; the schema protects you from a file the user picks | [[types-vs-runtime-validation]] |
| 4 | Why refuse a newer import file rather than load what we recognise? | Skipping unrecognised parts **silently deletes data while reporting success**. The screens look normal, the figures look plausible, and next cycle's export contains the damage | [[all-or-nothing]] |
| 5 | Where did "watch for changes" go, if not onto `Repository`? | To the store, which already knows — it did the writing. An interface may only promise what **every** implementer can keep, and neither SQLite nor HTTP can push | [[repository-pattern]] |

---

## Design stop — 2026-09-10

| # | Question | Short answer | Full |
|:-:|---|---|---|
| 1 | Someone wants a ninth tile on Home. What do you ask first? | **"What does it displace?"** Attention is finite, so a ninth tile costs a little of each of the other eight and a little of the hero. A screen where everything is emphasised has no emphasis | [[hierarchy-and-attention]] |
| 2 | Why two empty states on Transactions rather than one? | Because **the next action is different**. "Nothing this cycle" → add something. "No matches" → clear the filters. An empty state's whole job is to name what to do next, and one message cannot name two different things | — *(see below)* |
| 3 | Why is the offline note not red? | Red means money going wrong, and nothing else. Spend it on an ordinary state and you have not made that state clearer — you have made the **real** red weaker, so the day a figure genuinely turns red it gets the same shrug | [[hierarchy-and-attention]] |
| 4 | Months recalculates old cycles instead of storing a summary when the cycle closed. What does that buy? | **Correcting an old transaction corrects the history.** A stored summary would freeze the mistake, and the two would disagree with nothing to notice | [[derived-state]] |
| 5 | Accessibility rules are stated once in §3, not in each of nine page sections. Which earlier lesson is that? | [[one-source-of-truth]] — nine copies of one rule drift within a week, and the per-page copy is the one someone reads while building that page |

### On question 2 — empty is not one state

"There is nothing here" and "there is nothing here *that matches what you
asked*" feel like the same screen and are not. The first is about the data; the
second is about the question. Show the same message for both and half the time
you are telling the owner to create something they already have.

The general rule, and it is the same as **L2** for errors: an empty state must
say **what this is, why it is empty, and what to do next**. If two situations
have different next actions, they are two states.

---

## Adding to this file

One row per question, at each stop. Keep the answer to a sentence or two and
link the concept note for the rest. If a question has no concept note and the
idea is reusable, write the note — that is the signal a concept has appeared for
the first time.
