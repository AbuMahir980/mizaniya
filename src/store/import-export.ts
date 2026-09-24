/**
 * WHAT: Exporting the current data, and replacing it with a file — safety copy
 *       first, then one transaction, then a reload.
 * WHY:  Import is **the most dangerous action in the app** (page specs §7.9).
 *       Everything here is arranged so that the only two possible endings are
 *       "it all landed" and "nothing has changed" — never anything between.
 * INTERVIEW: I made the import take a backup of what it was about to overwrite
 *       before overwriting it, because the alternative asks the owner to trust
 *       a file they have not read.
 */

import type { ImportRefusal } from '@/core/schema'
import type { Instant, IsoDate, Snapshot } from '@/core/types'
import {
  buildExportFile,
  exportFileName,
  readExportText,
  serialiseExport,
  type ExportFile,
} from '@/data/export-file'
import type { SnapshotStore } from './snapshot-store'

/** A file ready to be written to disk by whatever can write files. */
export interface SaveableFile {
  name: string
  text: string
  file: ExportFile
}

export function buildSaveable(snapshot: Snapshot, at: Instant, on: IsoDate): SaveableFile {
  const file = buildExportFile(snapshot, at)
  return { name: exportFileName(on), text: serialiseExport(file), file }
}

/** How many of each thing landed, for *"Imported. 1,907 movements, 12 categories…"* */
export interface ImportCounts {
  movements: number
  categories: number
  plans: number
  debts: number
  goals: number
}

function countsOf(snapshot: Snapshot): ImportCounts {
  return {
    movements: snapshot.transactions.length,
    categories: snapshot.categories.length,
    plans: snapshot.plans.length,
    debts: snapshot.debts.length,
    goals: snapshot.goals.length,
  }
}

/**
 * How an import ended.
 *
 * **Refused and failed are different things**, and the copy differs: a refusal
 * is *we will not* — wrong file, too new, damaged — and a failure is *we could
 * not*, where the write itself broke. Both end with "Nothing has changed",
 * which is the sentence the whole design exists to be able to say truthfully.
 */
export type ImportOutcome =
  | { kind: 'imported'; counts: ImportCounts; safetyCopy: SaveableFile | undefined }
  | { kind: 'refused'; refusal: ImportRefusal }
  | { kind: 'failed'; message: string }

export interface ImportOptions {
  /** Stamped on both the safety copy and, later, on `lastExportedAt`. */
  now: Instant
  today: IsoDate
  /**
   * Hands the safety copy to whatever can write files, **before** anything is
   * overwritten. If saving it throws, the import does not run: a backup that
   * failed silently is worse than no backup, because it was relied on.
   */
  saveSafetyCopy: (file: SaveableFile) => Promise<void>
}

export function createImportExport(store: SnapshotStore) {
  return {
    /**
     * The current data as a file, and `lastExportedAt` recorded.
     *
     * The stamp goes through the store's single write path like any other
     * change, so the export nudge counts from a figure that actually reached
     * storage (D12).
     */
    async exportNow(now: Instant, today: IsoDate): Promise<SaveableFile | undefined> {
      const state = store.state
      if (state.status !== 'ready') return undefined

      const saveable = buildSaveable(state.snapshot, now, today)

      await store.write(
        (repository) =>
          repository.settings.put({ ...state.snapshot.settings, lastExportedAt: now }, now),
        (snapshot) => ({
          ...snapshot,
          settings: { ...snapshot.settings, lastExportedAt: now },
        }),
      )

      return saveable
    },

    /**
     * Replaces everything with the contents of `text`.
     *
     * The order is the guarantee: validate, then back up, then replace in one
     * transaction, then reload. A refusal never reaches the backup step, and a
     * failed write never reaches the reload.
     */
    async importFrom(text: string, options: ImportOptions): Promise<ImportOutcome> {
      const read = readExportText(text)
      // Refused before anything is touched — not even the safety copy is made,
      // because nothing is at risk.
      if (!read.ok) return { kind: 'refused', refusal: read.refusal }

      const state = store.state

      // A device with nothing on it has nothing to back up. Restoring onto a
      // fresh install is the ordinary case, not a special one.
      let safetyCopy: SaveableFile | undefined
      if (state.status === 'ready') {
        safetyCopy = buildSaveable(state.snapshot, options.now, options.today)
        try {
          await options.saveSafetyCopy(safetyCopy)
        } catch (error) {
          return {
            kind: 'failed',
            message:
              error instanceof Error
                ? `Your current data could not be saved first, so nothing was replaced. ${error.message}`
                : 'Your current data could not be saved first, so nothing was replaced.',
          }
        }
      }

      try {
        await store.replaceAll(read.data)
      } catch (error) {
        return {
          kind: 'failed',
          message: error instanceof Error ? error.message : 'The import could not be completed.',
        }
      }

      return { kind: 'imported', counts: countsOf(read.data), safetyCopy }
    },
  }
}
