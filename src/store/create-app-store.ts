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
import { requestPersistence } from './storage'
import { createSnapshotStore } from './snapshot-store'

/**
 * Called **once**, outside React, for the life of the tab.
 *
 * Rebuilt on a render it would reopen the database and lose the snapshot —
 * the kind of fault that only appears under StrictMode's double render.
 */
export function createAppStore() {
  const bundle = createSnapshotStore(createDexieRepository(), createBroadcastNotifier())
  return withPersistenceRequest(bundle)
}

/**
 * Asks the browser to keep the data, **after the first write that succeeds**.
 *
 * Never on load. Browsers weigh genuine engagement, and asking an empty app is
 * asking to be turned down once and remembered (D12).
 *
 * It lives here rather than inside the store because the store is
 * platform-free: `navigator.storage` is a browser fact, and composing the
 * platform is what this file is for. The request is deliberately not awaited —
 * a save must never wait on a permission prompt, and the answer is read back
 * separately by whatever displays it.
 */
export function withPersistenceRequest<T extends ReturnType<typeof createSnapshotStore>>(
  bundle: T,
  ask: () => Promise<unknown> = requestPersistence,
): T {
  let asked = false
  const askOnce = () => {
    if (asked) return
    asked = true
    void ask()
  }

  const { write, replaceAll } = bundle.api

  bundle.api.write = async (...args: Parameters<typeof write>) => {
    const result = await write(...args)
    if (result.ok) askOnce()
    return result
  }

  bundle.api.replaceAll = async (...args: Parameters<typeof replaceAll>) => {
    await replaceAll(...args)
    // An import is the most real write there is.
    askOnce()
  }

  return bundle
}
