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
