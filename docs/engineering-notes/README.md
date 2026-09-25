# Engineering notes

One note per topic someone would actually ask about. Each answers, in order: what the
problem was, what this project did, the words you need, and **the why-chain** — pushed
until it rests on a constraint rather than a preference.

Each note also ends with how it's actually built, and a table of which files to open.

## The notes

| Note | The question it answers |
|---|---|
| [Data storage](data-storage.md) | Where records live on the device, and why IndexedDB |
| [State management](state-management.md) | How the app holds what it knows while running, and why a failed save can't lie |
| [Derived state](derived-state.md) | Why no figure the app shows you is stored anywhere |
| [Money handling](money.md) | Why every amount is whole kobo, and why rounding goes one way |
| [Dates and time](dates-and-time.md) | Why a spending date isn't a timestamp, and why the code never checks the clock |
| [Validation](validation.md) | Why TypeScript isn't enough at the edges |
| [Import and export](import-and-export.md) | How data gets out and back in without half-arriving |

## Decided, not built

These describe things that are settled but unwritten. A note saying *"not built yet, here
is when it would matter and what we'd do"* is a legitimate note — and usually a better one
than premature machinery.

| Note | Status |
|---|---|
| [Sync](sync.md) | Model decided (ADR-010), groundwork in, no sync code |
| [Security and encryption](security.md) | Decided (ADR-011), nothing to protect until there's a server |
| [Performance](performance.md) | Nothing built, on purpose — with the trigger and the order written down |

## How these differ from ADRs

| | ADR | Note |
|---|---|---|
| **Records** | A decision, at the moment it was made | The system as it is **now** |
| **Changes?** | Never. It's history. | Rewritten whenever the system changes |
| **Answers** | "Why did we choose this, and what else did we consider?" | "How does this work, and could I explain it?" |

A note links its ADRs. The ADRs are in [`docs/adr/`](../adr/).

## Writing another one

Follow the shape of an existing note. The rules that matter:

1. **Start from the requirement, not the technology.** "Why IndexedDB?" is answered by *the app had to work offline*, not by describing IndexedDB. The requirement has to *produce* the choice.
2. **Define the words before using them.** A table at the top, one line each.
3. **Push each "why" until it hits a constraint.** If an answer bottoms out in "it seemed better", it isn't finished.
4. **Name what you gave up.** Every decision cost something. A note with no trade-offs is marketing.
5. **Say what isn't built, and when it would matter.**
6. **Verify claims against the code.** Don't repeat what an old comment said. Two invented details were caught in the first pass of these notes — a selector name and a test that didn't exist.
7. **Keep it short.** Length is not thoroughness. Cut your own commentary first.
