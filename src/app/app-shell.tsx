/**
 * WHAT: The frame every screen sits in — navigation, the live region, the
 *       offline note, and the redirect to onboarding.
 * WHY:  **One live region per screen**, mounted once here. A save changes a
 *       dozen numbers, and announcing each of them would tell a screen-reader
 *       user nothing (page specs §3).
 * INTERVIEW: I mounted a single polite live region at the shell rather than one
 *           per figure, because announcing everything is the same as announcing
 *           nothing.
 */

import { Suspense, type ReactNode } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router'
import { AnnounceProvider } from '@/ui/announce'
import { BottomBar, Sidebar, type NavItem } from '@/ui/nav'
import { OfflineNote } from '@/ui/banner'
import { Spinner } from '@/ui/spinner'
import { Mark } from '@/ui/mark'
import { useIsOnline, useSnapshotState } from './store-context'

/**
 * The five bottom-bar slots (page specs §2).
 *
 * Transactions is **not** here: Quick Add covers recording, which is the common
 * case, and browsing the list is the rare one. It lives under More.
 */
const NAV = [
  { key: 'home', label: 'Home', path: '/' },
  { key: 'plan', label: 'Plan', path: '/plan' },
  { key: 'debts', label: 'Debts', path: '/debts' },
  { key: 'more', label: 'More', path: '/more' },
] as const

/** A dot rather than a drawn icon: the icon set lands with the screens (T13). */
function NavDot() {
  return <span aria-hidden="true" className="block h-5 w-5 rounded-full border border-current" />
}

function useNavItems(): { items: NavItem[]; activeKey: string } {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const items = NAV.map((entry) => ({
    key: entry.key,
    label: entry.label,
    icon: <NavDot />,
    onSelect: () => navigate(entry.path),
  }))

  // Longest match wins, so `/debts/x/record` still lights Debts.
  const active =
    [...NAV]
      .filter((entry) => entry.path !== '/' && pathname.startsWith(entry.path))
      .sort((a, b) => b.path.length - a.path.length)[0]?.key ?? 'home'

  return { items, activeKey: active }
}

/**
 * Everything below onboarding.
 *
 * `new-owner` — T7's `undefined` load — redirects to `/welcome`. It is a state
 * the type forces this component to handle rather than a falsy value it could
 * have skipped past.
 */
export function AppShell() {
  const state = useSnapshotState()
  const online = useIsOnline()
  const navigate = useNavigate()
  const { items, activeKey } = useNavItems()

  if (state.status === 'idle' || state.status === 'loading') {
    return <LoadingScreen />
  }

  if (state.status === 'new-owner') {
    return <Navigate to="/welcome" replace />
  }

  if (state.status === 'error') {
    return (
      <Centred>
        <div role="alert" className="flex flex-col gap-3">
          <h1 className="font-voice text-title text-ink">Couldn&rsquo;t open your data</h1>
          {/* Says what happened and what to do next (L2). */}
          <p className="font-structural text-body text-soft">
            This is usually temporary. {state.message}
          </p>
        </div>
      </Centred>
    )
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar items={items} activeKey={activeKey} onAdd={() => navigate('/transactions')} />

      <div className="flex min-w-0 flex-1 flex-col">
        <main id="main" className="flex-1 px-4 pb-24 pt-4 desktop:px-8 desktop:pb-8">
          {/* Offline is a state, not an error — neutral, never danger (L4, F7). */}
          {!online ? <OfflineNote /> : null}

          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </main>

        <BottomBar
          items={items}
          activeKey={activeKey}
          onAdd={() => navigate('/transactions')}
          className="desktop:hidden"
        />
      </div>
    </div>
  )
}

function Centred({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[520px] flex-col justify-center px-4">
      {children}
    </div>
  )
}

function LoadingScreen() {
  return (
    <Centred>
      <div className="flex items-center gap-3 text-soft">
        <Mark size={28} className="text-emerald" />
        <Spinner />
        <span className="font-structural text-body">Opening your records…</span>
      </div>
    </Centred>
  )
}

/** The shell plus the one live region it mounts, wrapped around every route. */
export function ShellWithAnnouncer() {
  return (
    <AnnounceProvider>
      <AppShell />
    </AnnounceProvider>
  )
}
