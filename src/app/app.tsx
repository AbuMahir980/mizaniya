/**
 * WHAT: The application root — providers, router, error boundary.
 * WHY:  The store bundle is created **once**, outside React, and handed in. A
 *       bundle rebuilt on a render would reopen the database and lose the
 *       snapshot, which is the sort of fault that only shows up under a fast
 *       double render in StrictMode.
 * INTERVIEW: I assembled the providers in one root so the order is visible in
 *       a single file rather than inferred from four.
 */

import { BrowserRouter } from 'react-router'
import { createSnapshotStore } from '@/store/snapshot-store'
import { createDexieRepository } from '@/data/dexie-repository'
import { createBroadcastNotifier } from '@/data/broadcast-notifier'
import { ErrorBoundary } from './error-boundary'
import { StoreProvider } from './store-context'
import { AppRoutes } from './routes'

/** One database, one store, for the life of the tab. */
const bundle = createSnapshotStore(createDexieRepository(), createBroadcastNotifier())

export function App() {
  return (
    <ErrorBoundary>
      <StoreProvider bundle={bundle}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </StoreProvider>
    </ErrorBoundary>
  )
}
