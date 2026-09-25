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

  /**
   * Replaces the entire dataset — the import path, and the only other way
   * anything changes.
   *
   * Separate from `write` because it is genuinely a different shape: the new
   * snapshot is not derived from the old one, and it must work from
   * `new-owner` too, since restoring onto a fresh install is the ordinary case.
   * Bending `write` to cover it would mean a `toMemory` that ignores its own
   * argument, which reads as a mistake wherever it appears.
   *
   * The ordering rule is unchanged: storage first, memory second, announce
   * last. Throws rather than returning a result, because the caller is the
   * import flow, which has its own outcome to report.
   */
  replaceAll(snapshot: Snapshot): Promise<void>

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

    async replaceAll(snapshot: Snapshot) {
      // Storage first, as everywhere else. `repository.import` is itself one
      // transaction, so a rejection here leaves storage exactly as it was —
      // and memory is not touched, so the two still agree (ADR-005).
      await repository.import(snapshot)
      set({ status: 'ready', snapshot })
      notifier.announce()
    },

    reload: read,

    dispose() {
      unsubscribe()
    },
  }

  return { api, store }
}
