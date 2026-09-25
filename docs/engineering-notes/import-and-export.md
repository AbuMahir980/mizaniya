# Import and export

*How data gets off the device and back on, and why a restore can never half-happen.*

## The problem

Local-first has one glaring weakness: **the data exists in exactly one place.** Clear your
browser data and a year of records is gone. Get a new phone and there's nothing to carry
over. No server means no backup.

So the app needs a way out and a way back in. And the way back in is the dangerous
direction, because importing means **overwriting** what's already there.

Two things can go wrong, and one is much worse than the other:

- The import fails and nothing happens. Annoying.
- The import fails **halfway**. Now there are records from two different datasets mixed together, every derived figure is nonsense, and nothing in the app knows.

## The short version

Export writes one JSON file containing everything, stamped with a schema version. Import
**replaces** everything rather than merging, in a single database transaction, so it either
all lands or none of it does. Before overwriting, the current data is exported to disk
first, so the operation is recoverable.

## The words first

| Word | What it means | Where |
|---|---|---|
| **Export file** | One JSON file with every record, plus a version stamp and the date. | `src/data/export-file.ts` |
| **Schema version** | A number saying which shape the file is in. Currently 2. | `src/core/types.ts` |
| **Migration** | Code that brings an older file's shape up to the current one. | `src/data/export-file.ts` |
| **Transaction** (database) | A group of writes that all land or none do. | `src/data/dexie-repository.ts` |
| **Atomic** | All-or-nothing. No partial result is possible. | — |
| **Safety copy** | The current data, written to disk before an import overwrites it. | `src/store/import-export.ts` |

---

## The reasoning, in the order the questions come

### "What's in the file?"

```json
{
  "app": "mizaniya",
  "schemaVersion": 2,
  "exportedAt": "2026-09-25T09:00:00.000Z",
  "data": { "settings": {...}, "categories": [...], "transactions": [...], ... }
}
```

Four things, and each earns its place:

- **`app`** — so a file from somewhere else is recognised as not ours, rather than failing with a confusing parse error.
- **`schemaVersion`** — so a file written a year ago can still be read. This is the one people leave out, and it's the one that makes old backups readable.
- **`exportedAt`** — when it was written. Also used as the timestamp when migrating a version-1 file, which had no per-record timestamps (`sync.md`).
- **`data`** — every record. The whole snapshot.

Named `mizaniya-export-2026-09-25.json`, so a folder of them sorts by date on its own.

### "Why replace everything instead of merging?"

Because **merging two budgets has no correct answer**, and pretending otherwise produces
confident nonsense.

Say the file has a Food category with ₦90,000 allocated, and the device has a Food category
with ₦75,000. Which wins? Are they the same category? What if both have transactions
against them — do you keep both sets, and is the total now double?

There is no answer that is right in general. So the app doesn't guess: **import means "make
this device look exactly like this file."** One rule, understandable in a sentence, with no
surprises.

(Merging is a genuinely different problem, and it has a genuinely different answer —
per-record timestamps and conflict rules. That's sync, and it's `sync.md`.)

### "What stops a half-finished import?"

One database transaction around the whole thing:

```ts
await db.transaction('rw', db.allTables, async () => {
  await Promise.all(db.allTables.map((table) => table.clear()))
  await Promise.all([
    db.settings.put(snapshot.settings, SETTINGS_KEY),
    db.categories.bulkPut(snapshot.categories),
    db.transactions.bulkPut(snapshot.transactions),
    ...
  ])
})
```

Clear everything, write everything, inside one transaction. If anything throws — a bad
record, the browser interrupting, storage full — IndexedDB rolls the whole thing back and
the device is exactly as it was.

**This is the one property that cannot be verified by reading the code.** A rollback either
happens or it doesn't. So the test breaks a write on purpose, part-way through, and then
checks what survived: `src/data/dexie-repository.test.ts`.

### "And if the import succeeds but the file was wrong?"

Before anything is overwritten, the current data is exported to disk:

```ts
await options.saveSafetyCopy(safetyCopy)
```

So the worst realistic outcome is "I imported the wrong file" — recoverable, because the
old data is sitting in the downloads folder. Not "I imported the wrong file and my records
are gone."

The ordering is deliberate: **safety copy, then validate, then write.** If the safety copy
can't be saved, the import doesn't proceed.

### "How does a file from an older version still work?"

Through a chain of migrations, one step per version:

```ts
export const MIGRATIONS: Migration[] = [
  { to: 2, apply: (data, { exportedAt }) => /* add updatedAt to every record */ },
]
```

A version-1 file runs through step 2 and comes out shaped like version 2. A version-0 file
finds no step and is **refused** — it does not pass through unchanged:

```ts
throw new Error(`No migration to schema version ${version}. This file cannot be read safely.`)
```

Silently importing data shaped for an older version is exactly the failure this whole
mechanism exists to prevent.

**The order of operations matters**, and it was wrong once. See `validation.md` — the short
version is that validating before migrating would reject every old backup using the schema
it hasn't been migrated to yet.

### "Why declare version 1 when it was the only version?"

Same reason as the Dexie chain in `data-storage.md`. Both the file format and the database
declared version 1 explicitly, with an empty migration list, when there was only one
version and it looked like pointless ceremony.

Then schema 2 arrived. Because the shape was already there, adding it was one entry in a
list. Without it, there would have been no route from the files already on people's disks.

**The ceremony was the whole point**, and it paid off within a fortnight.

### "Does the user get told when to back up?"

The app tracks `lastExportedAt` and counts **unexported changes**, rather than days since
the last export. Someone who hasn't opened the app for three weeks doesn't need nagging;
someone who recorded 40 movements yesterday does.

---

## If you had to do it again

### 1. Put a version in the file on day one

```json
{ "app": "mizaniya", "schemaVersion": 1, "exportedAt": "...", "data": {...} }
```

Costs nothing now. Without it, your first schema change makes every existing file
unreadable, and there is no way to add it retroactively — the old files are already
written.

### 2. Make the whole restore one transaction

Not "clear, then write". One atomic operation. A half-written restore is the worst outcome
in the app and the hardest to detect afterwards.

### 3. Write the safety copy before you touch anything

The user chose the file. They may have chosen wrongly. Make that recoverable.

### 4. Replace, don't merge — and say so in the UI

Then the behaviour is one sentence the user can hold in their head.

### 5. Refuse newer files outright

Never read the parts you recognise from a file written by a newer version. That discards
data while appearing to succeed.

### 6. Test the failure, not the success

The happy path is easy and proves little. `src/data/dexie-repository.test.ts` rejects a
write mid-import and asserts the device is untouched. That test is the reason the guarantee
is real rather than intended.

---

## Where this lives

| File | What's in it |
|---|---|
| `src/data/export-file.ts` | The file format, the migration chain, and reading a file safely. |
| `src/store/import-export.ts` | The flow: safety copy, validate, replace, report. |
| `src/data/dexie-repository.ts` | `import()` — the single transaction. |
| `src/data/export-file.test.ts` | A version-1 file importing; broken contents refused. |
| `src/data/dexie-repository.test.ts` | The part-way failure and the rollback. |
| `scripts/seed.ts` | Writes a real export file, restored through this same path. |

## Related

- `validation.md` — what a file has to pass, and why the order matters
- `data-storage.md` — the database being written into
- `sync.md` — merging, which is the problem import deliberately doesn't solve
- [ADR-005](../02-architecture.md) — schema version and atomic import
