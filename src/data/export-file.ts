/**
 * WHAT: Building an export file, naming it, and bringing an older one forward.
 * WHY:  Until v3 sync exists, **an exported file is the only real backup** —
 *       IndexedDB can be cleared by the browser without telling anyone (D12).
 *       So the file carries its own version and is read back through a check
 *       that runs, not through types that vanish at compile time.
 * INTERVIEW: I versioned the export file from the first release and shipped the
 *       migration chain empty, because the alternative is inventing one later
 *       against files already on people's disks.
 */

import { SCHEMA_VERSION } from '@/core/types'
import type { Instant, IsoDate, Snapshot } from '@/core/types'
import { checkImport, type ImportRefusal } from '@/core/schema'

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
interface Migration {
  to: number
  apply: (data: Snapshot) => Snapshot
}

export const MIGRATIONS: Migration[] = []

/**
 * Brings a validated file's data up to the current schema version.
 *
 * Throws if a step is missing rather than passing the data through unchanged.
 * Silently importing data shaped for an older version is the failure this whole
 * mechanism exists to prevent.
 */
export function migrate(data: Snapshot, fromVersion: number): Snapshot {
  let current = data
  for (let version = fromVersion + 1; version <= SCHEMA_VERSION; version += 1) {
    const step = MIGRATIONS.find((m) => m.to === version)
    if (!step) {
      throw new Error(`No migration to schema version ${version}. This file cannot be read safely.`)
    }
    current = step.apply(current)
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

  /**
   * The one cast in this file, and the one place it is right.
   *
   * Zod checks the shape but returns plain `string` and `number` where the
   * domain uses branded `Id`, `IsoDate` and `Kobo`. Brands exist to stop an
   * unchecked value being used as money or a date — and a value that has just
   * passed `exportFileSchema` is exactly a value that has been checked. The
   * validation is what earns the brand; asserting it anywhere else would be
   * claiming a guarantee nobody provided.
   */
  const validated = checked.file.data as unknown as Snapshot

  try {
    return {
      ok: true,
      data: migrate(validated, checked.file.schemaVersion),
      fileVersion: checked.file.schemaVersion,
    }
  } catch (error) {
    return {
      ok: false,
      refusal: {
        reason: 'malformed',
        issues: [error instanceof Error ? error.message : 'The file could not be migrated.'],
      },
    }
  }
}
