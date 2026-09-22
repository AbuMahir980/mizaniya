/**
 * WHAT: The one store holding the whole snapshot, and the single path every
 *       write takes.
 * WHY:  **Storage first, memory second.** If memory went first, a rejected save
 *       would leave the screen showing a figure the database does not have, and
 *       nothing in the system could tell. This ordering makes a failed save
 *       visible instead of silent (ADR-001).
 * INTERVIEW: I routed every write through one function that commits to storage
 *       before touching memory, so the screen and the database cannot disagree.
 */

import { createStore } from 'zustand/vanilla'
import type { Repository, ChangeNotifier } from '@/core/repository'
import type { Snapshot } from '@/core/types'

/**
 * What the app knows about its own data.
 *
 * A union rather than a snapshot plus flags, so "loaded but empty" and "not
 * loaded yet" cannot be confused, and `new-owner` — T7's `undefined` — is a
 * state the UI must handle rather than a falsy value it might skip past (G3).
 */
export type SnapshotState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'new-owner' }
  | { status: 'ready'; snapshot: Snapshot }
  | { status: 'error'; message: string }

/** What a write reports back. Never a thrown error the caller might not catch. */
export type WriteResult = { ok: true } | { ok: false; message: string }

export interface SnapshotStore {
  state: SnapshotState

  /** Reads everything once, at startup (ADR-001). */
  initialise(): Promise<void>

  /**
   * The **only** way anything changes.
   *
   * `toStorage` commits; `toMemory` describes the same change as a pure
   * function of the snapshot. Memory is touched only after storage resolves,
   * and the broadcast goes out only after both.
   */
  write(
    toStorage: (repository: Repository) => Promise<void>,
    toMemory: (snapshot: Snapshot) => Snapshot,
  ): Promise<WriteResult>

  /** Re-reads storage. Used by the tab that receives a change broadcast. */
  reload(): Promise<void>

  /** Stops listening for other tabs. */
  dispose(): void
}

function messageFrom(error: unknown): string {
  return error instanceof Error ? error.message : 'The change could not be saved.'
}

export function createSnapshotStore(repository: Repository, notifier: ChangeNotifier) {
  const store = createStore<{ state: SnapshotState }>(() => ({ state: { status: 'idle' } }))
  const set = (state: SnapshotState) => store.setState({ state })

  async function read(): Promise<void> {
    try {
      const snapshot = await repository.load()
      // `undefined` is a new owner, not a failure — it routes to onboarding.
      set(snapshot ? { status: 'ready', snapshot } : { status: 'new-owner' })
    } catch (error) {
      set({ status: 'error', message: messageFrom(error) })
    }
  }

  const unsubscribe = notifier.subscribe(() => {
    void read()
  })

  const api: SnapshotStore = {
    get state() {
      return store.getState().state
    },

    async initialise() {
      set({ status: 'loading' })
      await read()
    },

    async write(toStorage, toMemory) {
      const current = store.getState().state
      if (current.status !== 'ready') {
        return { ok: false, message: 'There is nothing loaded to change yet.' }
      }

      try {
        // Storage first. Everything below this line only runs if it resolved.
        await toStorage(repository)
      } catch (error) {
        // Memory is deliberately untouched, so the screen still shows what the
        // database still holds. The caller reports the failure; nothing silently
        // diverges.
        return { ok: false, message: messageFrom(error) }
      }

      // The snapshot is re-read from the store rather than reused from above,
      // because an awaited write leaves a gap in which another write may have
      // landed. Applying `toMemory` to a stale snapshot would discard it.
      const latest = store.getState().state
      if (latest.status === 'ready') {
        set({ status: 'ready', snapshot: toMemory(latest.snapshot) })
      }

      // Only after both. A tab told to reload before the write committed would
      // read the old data and believe it was current.
      notifier.announce()
      return { ok: true }
    },

    reload: read,

    dispose() {
      unsubscribe()
    },
  }

  return { api, store }
}
