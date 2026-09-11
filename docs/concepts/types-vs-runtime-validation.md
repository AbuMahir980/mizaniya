# Types vs runtime validation

**The one line:** TypeScript protects you from your own code; a runtime schema
protects you from everyone else's.

---

## What it is

The app describes the same shapes twice, on purpose:

```
src/core/types.ts   →  interface Transaction { … }      compile time
src/core/schema.ts  →  const transactionSchema = z…()   run time
```

That looks like exactly the duplication [[one-source-of-truth]] warns about. It
is not, and the reason is worth holding on to.

---

## Why both, when they say the same thing

**They exist at different times, and only one of them exists when it matters.**

TypeScript is checked while you write, then **deleted**. The compiled JavaScript
has no types in it. So types can only protect against mistakes in code you
wrote and compiled.

Now think about an import. The owner picks a file off their phone. It might be
edited, truncated, from a different app, or corrupted by a sync tool.
`JSON.parse` hands you `any` and TypeScript shrugs — it never sees that file, and
it is not there when the file arrives.

So the schema catches what types cannot even express:

- an amount of `0` or below — schema says **greater than** zero;
- `2026-02-30`, which matches `YYYY-MM-DD` and is not a real date;
- a `repaid` movement with no `debtId` — it would look perfectly valid and
  quietly break every balance derived from it;
- a `savingsDestination` on an expense.

**Validate at the boundary, trust inside it.** Once a file has passed the
schema, the rest of the app can rely on its types and stop checking.

---

## The honest problem, and the fix

Two descriptions of one shape **can still drift**. Rename a field in `types.ts`
and forget `schema.ts`, and you get a validator that rejects good data or
accepts bad — with nothing to notice.

So [[one-source-of-truth]] does not go away here. It changes shape:

> Two representations are allowed only if something automated fails when they
> disagree.

The mechanism: annotate each schema with the type it is supposed to produce.

```ts
type SchemaFor<T> = z.ZodType<T, z.ZodTypeDef, unknown>
export const settingsSchema: SchemaFor<Settings> = z.object({ … })
```

`tsc` then rejects any schema that does not produce exactly that interface, and
CI runs `tsc`. The drift becomes a build failure instead of a silent one.

**This is not in place yet.** It was found by asking the question this note
answers, and it needs a compiler to prove it works — there is no `package.json`
until BUILD. It is recorded in `docs/backlog.md` as a BUILD task rather than
written as type-level code nobody has been able to compile. Claiming a gate that
has never run would be worse than naming the gap.

---

## What we would have done instead, and why not

**Types only.** Free, and the app has no protection at the one place it faces
data it did not create.

**Schema only, with types inferred** (`z.infer`). Genuinely good, and it removes
the drift completely rather than detecting it. Rejected here for readability:
`types.ts` is a teaching artefact and the file the Expo app will import, and
branded types written by hand say what they mean far more clearly than a chain
of `z.infer` does. The annotation above buys most of the safety and keeps the
file legible.

**Hand-written guards instead of a library.** More code, for eleven shapes, and
less reliable than something whose only job this is. `zod` is ~14 KB and the
platform offers no equivalent — the justification standard **N1** asks for.

---

## The interview sentence

"I validate untrusted input at the boundary with a runtime schema, because
TypeScript is erased at compile time and cannot protect you from a file a user
chooses — and I tie the schema to the type so drift between them fails the
build."

---

## In your own words

_Add a line here after reading._
