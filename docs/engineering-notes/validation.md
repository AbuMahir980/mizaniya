# Validation

*Why TypeScript isn't enough at the edges, and where the checking actually happens.*

## The problem

TypeScript is a compile-time tool. It checks your code and then **it disappears** — the
JavaScript that runs in the browser has no types in it at all.

That's fine while data comes from your own code. It stops being fine the moment data comes
from outside: a file the user picked from their disk, a response from a server, a hand-
edited backup.

If someone opens a JSON file and Mizaniya trusts it because a type annotation said
`Snapshot`, then a file with `amount: -5` or `salaryDay: 45` or a debt payment naming no
debt goes straight into the database. Nothing errors. The data just sits there being
wrong, and every figure derived from it is wrong too.

## The short version

Types are checked again **at runtime**, at the one boundary where untrusted data enters:
importing a file. The checking is done with **Zod** schemas that mirror the types, and
nothing is written to the database until it passes. Inside the app, past that boundary,
TypeScript alone is enough.

## The words first

| Word | What it means | Where |
|---|---|---|
| **Runtime validation** | Checking the actual shape of data while the program runs, not just while compiling. | `packages/core/src/schema.ts` |
| **Zod** | A library for describing a shape, then checking a value against it. | `packages/core/src/schema.ts` |
| **Schema** | The description of an allowed shape. `categorySchema` describes a valid category. | `packages/core/src/schema.ts` |
| **Boundary** | Where data crosses from outside the app to inside. Here: file import. | `apps/web/src/data/export-file.ts` |
| **Branded type** | A type the compiler won't let you fake. Validation is what earns the brand. | `packages/core/src/types.ts` |

---

## The reasoning, in the order the questions come

### "Don't your TypeScript types already prevent this?"

No, and this is the thing people get wrong about TypeScript.

```ts
const data = JSON.parse(text) as Snapshot   // a lie, and nothing checks it
```

That `as Snapshot` is not a check. It is the programmer telling the compiler to stop
asking. At runtime `data` is whatever was in the file. The type annotation has no
enforcement at all.

TypeScript protects you from **your own** mistakes. It does nothing about someone else's
file.

### "So where do you validate — everywhere?"

No, and deliberately not. Validating everywhere is how validation gets skipped: it becomes
noise, people copy the pattern without thinking, and nobody knows which check is the one
that matters.

Validation happens at the **boundary** — the one place untrusted data enters, which in v1
is importing an export file. Past that point, the data has been checked, and TypeScript is
sufficient.

The rule: **validate where data enters, not where it's used.**

### "What does the schema actually check?"

More than shape. Three levels:

**1. Shape and type** — `id` is a non-empty string, `sortOrder` is an integer.

**2. Values that are real** — this is where a plain type check isn't enough:

```ts
export const isoDateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected a calendar date, YYYY-MM-DD')
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`)
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value)
  }, 'Not a real date')
```

`2026-02-30` matches the pattern perfectly and is not a day that exists. The second check
catches it. An amount must be a non-negative integer — no floats, so a decimal can't sneak
in and break the kobo guarantee (`money.md`).

**3. Rules that span fields** — the interesting ones:

```ts
if (needsCategory && !transaction.categoryId) {
  ctx.addIssue({ message: `A ${transaction.type} movement must name a category` })
}
if (needsDebt && !transaction.debtId) {
  ctx.addIssue({ message: `A ${transaction.type} movement must name a counterparty` })
}
```

An expense must name a category. A debt repayment must name a debt. Neither rule can be
expressed by checking one field on its own.

**Why it matters that this is enforced at import:** a debt payment with no debt attached
would sit in the data looking completely valid, and quietly break every balance derived
from that debt. It would never throw. Someone would just notice, months later, that a
number was wrong.

### "What happens when a file fails?"

It is refused, with a reason — and **nothing is changed**:

| Refusal | Means |
|---|---|
| `not-mizaniya` | Not our file at all. Probably picked the wrong one. |
| `too-new` | Written by a newer version of the app. Refused rather than partially read. |
| `malformed` | Ours, but the contents don't pass. |

`too-new` is the one worth explaining. The tempting behaviour is to read the parts we
recognise and ignore the rest. That would **silently discard the user's data while
appearing to succeed** — the worst available outcome. So it refuses and says which version
wrote the file.

### "Where does validation sit relative to the migration?"

This order was wrong once, and fixing it is the most useful thing in this note.

It used to be: **validate the whole file → migrate it**. That works only while there has
only ever been one version of the schema. The moment version 2 required a field version 1
didn't have, every existing backup would be rejected as *malformed* — **by the check
standing in front of the migration written to add that very field.**

It is now:

```
read the envelope  →  migrate the contents  →  validate  →  write
(what version is    (bring it up to the      (against the   (one
 this file?)         current shape)           current schema) transaction)
```

The envelope — `app`, `schemaVersion`, `exportedAt` — has to be readable *first*, because
it's what tells you which shape the contents are in. Migrations then run on raw, unchecked
data. And validation happens last, immediately before anything is written.

**The guarantee that matters is unchanged, and it's about writing rather than reading:**
nothing reaches the database without passing the current schema.

### "What's the deal with the type cast after validation?"

There is exactly one cast in that file, and it is the one place a cast is honest:

```ts
const validated = checkedData.data as unknown as Snapshot
```

Zod checks shape but returns plain `string` and `number`. The app uses branded types —
`Kobo`, `IsoDate`, `Id` — which exist precisely to stop an unchecked value being used as
money or a date.

**The validation is what earns the brand.** A value that has just passed `snapshotSchema`
*is* a checked value. Asserting the brand anywhere else would be claiming a guarantee
nobody provided — which is why this cast sits immediately after the check and nowhere
else.

---

## If you had to do it again

### 1. Find the boundaries, and list them

Ours: file import. Soon: every server response. Everywhere else is internal and doesn't
need re-checking.

### 2. Write schemas that mirror the types, and keep them beside them

`packages/core/src/types.ts` and `packages/core/src/schema.ts` sit next to each other, so when one changes the
other is in view.

**And here is a real gap, named rather than glossed: nothing checks that they agree.** The
schema is maintained by hand. Add a field to `types.ts`, forget `schema.ts`, and the
failure is quiet in the worst way — Zod drops unknown keys by default, so an imported file
carrying that field would have it **silently stripped**. The data would import
"successfully", missing something.

Two ways to close it, neither done yet:

- Derive the type from the schema (`z.infer`) so there is only one definition. Cleanest, and a large change now.
- A test that fails when a field exists in one and not the other.

Until then this is a known hole, and it is written down here so it is a hole somebody chose
rather than one nobody noticed.

### 3. Check values, not just shapes

A string matching `YYYY-MM-DD` is not necessarily a date. An integer is not necessarily a
valid salary day. The gap between "right shape" and "possible value" is where bad data
gets in.

### 4. Express cross-field rules in the schema, not in the screens

If a debt payment must name a debt, that belongs where data is checked — not in a form,
which only covers data typed by hand and does nothing for an imported file.

### 5. Refuse clearly, and change nothing

Return a reason the UI can explain. Never half-import. The user should be able to try
again with a different file and be certain nothing happened.

---

## Where this lives

| File | What's in it |
|---|---|
| `packages/core/src/schema.ts` | Every schema, the refusal types, and the envelope/contents split. Start here. |
| `apps/web/src/data/export-file.ts` | Reading a file: envelope, migrate, validate, then hand over. |
| `apps/web/src/data/export-file.test.ts` | Includes a version-1 file importing, and broken contents being refused. |
| `packages/core/src/types.ts` | The types the schemas mirror. |

## Related

- `import-and-export.md` — the flow this check sits inside
- `money.md` — why an amount must be a non-negative integer
- `dates-and-time.md` — why `2026-02-30` has to be caught
- [ADR-005](../02-architecture.md) — schema versions and the migration chain
