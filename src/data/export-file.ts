import { SCHEMA_VERSION } from '@/core/types'
import type { Instant, IsoDate, Snapshot } from '@/core/types'
import { checkImport, validateSnapshot, type ImportRefusal } from '@/core/schema'

export interface ExportFile {
  app: 'mizaniya'
  schemaVersion: number
  exportedAt: Instant
  data: Snapshot
}

/**
 * `exportedAt` is passed in, never read from the clock here.
 *
 * Time is a parameter (ADR-003). It also makes the round-trip test able to
 * assert an exact file rather than "something with a date in it".
 */
export function buildExportFile(snapshot: Snapshot, exportedAt: Instant): ExportFile {
  return { app: 'mizaniya', schemaVersion: SCHEMA_VERSION, exportedAt, data: snapshot }
}

/** Two spaces, so a worried owner can open the file and read it. */
export function serialiseExport(file: ExportFile): string {
  return JSON.stringify(file, null, 2)
}

/**
 * The name the refusal copy tells people to look for:
 * *"Look for a file named mizaniya-export-….json."*
 */
export function exportFileName(on: IsoDate): string {
  return `mizaniya-export-${on}.json`
}

/**
 * One step from schema version `to - 1` to `to`.
 *
 * The list is empty at version 1 and that is the point — the same argument as
 * declaring Dexie's `version(1)`. A `{ to: 2 }` added later has a chain to join;
 * without the shape there is no route from a file already on someone's disk.
 */
interface MigrationContext {
  /**
   * When the file was written. The honest backfill for a field that did not
   * exist: we cannot know when a v1 row last changed, but the file says when
   * all of it was last true.
   *
   * Plain `string`, not `Instant`, because a migration runs *before* validation
   * — it works in the unbranded world by design. The envelope has already
   * checked the value is a real instant; the brand is applied to the whole
   * snapshot once, after the last step.
   */
  exportedAt: string
}

/**
 * One step from schema version `to - 1` to `to`.
 *
 * Steps run on **raw parsed JSON**, not on a validated `Snapshot`, because the
 * data has not yet been checked against the current schema — it cannot be, until
 * the migrations have brought it up to that shape. The result is validated before
 * a single row is written.
 */
interface Migration {
  to: number
  apply: (data: unknown, context: MigrationContext) => unknown
}

/** Rows as they exist before a step runs: shape unknown, keys addressable. */
type RawRow = Record<string, unknown>

function rowsOf(data: unknown, key: string): RawRow[] {
  const table = (data as Record<string, unknown> | null)?.[key]
  return Array.isArray(table) ? (table as RawRow[]) : []
}

export const MIGRATIONS: Migration[] = [
  {
    to: 2,
    /**
     * Schema 2 gives every entity an `updatedAt`, so sync can tell a row that
     * changed from a row that did not — and so a delete can be told apart from
     * a row this device has simply never seen (ADR-010).
     *
     * Every row is stamped with the file's `exportedAt`. It is not the true
     * moment each row last changed, and nothing can recover that; it is the
     * best available upper bound, and it is the same for every row, which means
     * no row in an old file spuriously beats another.
     */
    apply: (data, { exportedAt }) => {
      const source = (data ?? {}) as Record<string, unknown>
      const settings = (source.settings ?? {}) as RawRow
      const stamp = (row: RawRow): RawRow => ({ updatedAt: exportedAt, ...row })

      return {
        ...source,
        settings: stamp(settings),
        categories: rowsOf(data, 'categories').map(stamp),
        plans: rowsOf(data, 'plans').map(stamp),
        transactions: rowsOf(data, 'transactions').map(stamp),
        debts: rowsOf(data, 'debts').map(stamp),
        goals: rowsOf(data, 'goals').map(stamp),
      }
    },
  },
]

/**
 * Brings a validated file's data up to the current schema version.
 *
 * Throws if a step is missing rather than passing the data through unchanged.
 * Silently importing data shaped for an older version is the failure this whole
 * mechanism exists to prevent.
 */
export function migrate(data: unknown, fromVersion: number, context: MigrationContext): unknown {
  let current = data
  for (let version = fromVersion + 1; version <= SCHEMA_VERSION; version += 1) {
    const step = MIGRATIONS.find((m) => m.to === version)
    if (!step) {
      throw new Error(`No migration to schema version ${version}. This file cannot be read safely.`)
    }
    current = step.apply(current, context)
  }
  return current
}

/** What a file turned out to be, once read. */
export type ReadResult =
  | { ok: true; data: Snapshot; fileVersion: number }
  | { ok: false; refusal: ImportRefusal }

/**
 * Parses and validates text from a file the owner picked.
 *
 * Unparseable text is reported as **malformed** rather than crashing: a file
 * chosen from disk is untrusted input, and `JSON.parse` throwing is an expected
 * outcome here, not an exception.
 */
export function readExportText(text: string): ReadResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, refusal: { reason: 'malformed', issues: ['The file is not valid JSON.'] } }
  }

  const checked = checkImport(parsed)
  if (!checked.ok) return { ok: false, refusal: checked.refusal }

  const { schemaVersion, exportedAt, data } = checked.envelope

  /**
   * Migrate first, validate second, write third.
   *
   * The envelope said which shape the contents are in; the steps bring that
   * shape up to the current one; and only then is it checked. Validating before
   * migrating would reject every file written by an older version, using the
   * schema of the version it has not been migrated to yet.
   */
  let migrated: unknown
  try {
    migrated = migrate(data, schemaVersion, { exportedAt })
  } catch (error) {
    return {
      ok: false,
      refusal: {
        reason: 'malformed',
        issues: [error instanceof Error ? error.message : 'The file could not be migrated.'],
      },
    }
  }

  const checkedData = validateSnapshot(migrated)
  if (!checkedData.ok) {
    return { ok: false, refusal: { reason: 'malformed', issues: checkedData.issues } }
  }

  /**
   * The one cast in this file, and the one place it is right.
   *
   * Zod checks the shape but returns plain `string` and `number` where the
   * domain uses branded `Id`, `IsoDate` and `Kobo`. Brands exist to stop an
   * unchecked value being used as money or a date — and a value that has just
   * passed `snapshotSchema` is exactly a value that has been checked. The
   * validation is what earns the brand; asserting it anywhere else would be
   * claiming a guarantee nobody provided.
   *
   * It comes **after** the migration, not before, because a migration's output
   * is the thing that has to earn the brand — the input was a file on a disk.
   */
  return {
    ok: true,
    data: checkedData.data as unknown as Snapshot,
    fileVersion: schemaVersion,
  }
}
