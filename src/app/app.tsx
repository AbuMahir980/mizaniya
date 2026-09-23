/**
 * WHAT: The application root — providers, router, error boundary.
 * WHY:  The store bundle is created **once**, outside React, and handed in.
 *       What it is built on is chosen in `store/`, because `app/` may not
 *       import `data/` — the shell has no business knowing where records live.
 * INTERVIEW: I assembled the providers in one root so the order is visible in
 *       a single file rather than inferred from four.
 */

import { BrowserRouter } from 'react-router'
import { createAppStore } from '@/store/create-app-store'
import { ErrorBoundary } from './error-boundary'
import { StoreProvider } from './store-context'
import { TodayProvider } from './today-context'
import { AppRoutes } from './routes'

/**
 * One store, for the life of the tab.
 *
 * What it is built on lives in `store/`: the shell may not import `data/`, and
 * has no business knowing the records sit in IndexedDB (A2).
 */
const bundle = createAppStore()

export function App() {
  return (
    <ErrorBoundary>
      <StoreProvider bundle={bundle}>
        <TodayProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TodayProvider>
      </StoreProvider>
    </ErrorBoundary>
  )
}
