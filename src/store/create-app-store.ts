/**
 * WHAT: The one place that names the real repository and the real notifier, and
 *       assembles them into the store the app uses.
 * WHY:  `app/` may not import `data/` — dependencies point inward (A2), and the
 *       shell has no business knowing the app stores its records in IndexedDB.
 *       `store/` may, because choosing an implementation for its own seam is
 *       exactly what a store is entitled to do.
 * INTERVIEW: I put the composition of the storage layer behind the store rather
 *       than in the app root, so the screens cannot learn what the data is
 *       stored in even by accident.
 */

import { createDexieRepository } from '@/data/dexie-repository'
import { createBroadcastNotifier } from '@/data/broadcast-notifier'
import { createSnapshotStore } from './snapshot-store'

/**
 * Called **once**, outside React, for the life of the tab.
 *
 * Rebuilt on a render it would reopen the database and lose the snapshot —
 * the kind of fault that only appears under StrictMode's double render.
 */
export function createAppStore() {
  return createSnapshotStore(createDexieRepository(), createBroadcastNotifier())
}
