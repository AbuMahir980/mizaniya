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

import { Suspense, useState, type ReactNode } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router'
import { AnnounceProvider } from '@/ui/announce'
import { BottomBar, Sidebar, type NavItem } from '@/ui/nav'
import { OfflineNote } from '@/ui/banner'
import { Icon, type IconName } from '@/ui/icon'
import { ThemeChoice } from '@/ui/theme-choice'
import { Spinner } from '@/ui/spinner'
import { Mark } from '@/ui/mark'
import { useIsOnline, useSnapshotState } from './store-context'
import { QuickAddRoute } from './quick-add-route'
import { useTheme } from './use-theme'

/**
 * The five bottom-bar slots (page specs §2).
 *
 * Transactions is **not** here: Quick Add covers recording, which is the common
 * case, and browsing the list is the rare one. It lives under More.
 */
const NAV = [
  { key: 'home', label: 'Home', path: '/', icon: 'home' },
  { key: 'plan', label: 'Plan', path: '/plan', icon: 'plan' },
  { key: 'debts', label: 'Debts', path: '/debts', icon: 'debts' },
  { key: 'more', label: 'More', path: '/more', icon: 'more' },
] as const satisfies readonly Destination[]

/**
 * The sidebar lists **every destination flat, and no More** (§2).
 *
 * More is a mobile affordance: it exists because five slots is all a thumb can
 * reach. At 1440 there is room for all of them, and keeping More there would
 * hide four screens behind a button solving a problem that does not exist at
 * that width.
 */
const SIDEBAR_NAV = [
  { key: 'home', label: 'Home', path: '/', icon: 'home' },
  { key: 'plan', label: 'Plan', path: '/plan', icon: 'plan' },
  { key: 'transactions', label: 'Transactions', path: '/transactions', icon: 'transactions' },
  { key: 'debts', label: 'Debts & Goals', path: '/debts', icon: 'debts' },
  { key: 'months', label: 'Months', path: '/months', icon: 'months' },
  { key: 'zakat', label: 'Zakat', path: '/zakat', icon: 'zakat' },
] as const satisfies readonly Destination[]

/**
 * Settings sits apart, at the foot of the sidebar.
 *
 * Not because configuration is dull. Because **Settings holds Import**, which
 * page specs §7.9 calls the most dangerous action in the app, and a screen that
 * can replace every record should not be the seventh identical item in a list.
 * Reaching it should take a moment's intent.
 *
 * Zakat therefore joins the destinations above it, where it belongs: in a
 * Muslim-facing app it is a feature, not a preference. **This departs from
 * `DHomeLight.dc.html`, which lists all seven flat with Settings before Zakat**
 * — recorded as a decision in `CONTEXT.md` rather than slipped in.
 */
const SIDEBAR_FOOTER_NAV = [
  { key: 'settings', label: 'Settings', path: '/settings', icon: 'settings' },
] as const satisfies readonly Destination[]

interface Destination {
  key: string
  label: string
  path: string
  icon: IconName
}

function useNavItems(destinations: readonly Destination[]): {
  items: NavItem[]
  activeKey: string
} {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const items = destinations.map((entry) => ({
    key: entry.key,
    label: entry.label,
    icon: <Icon name={entry.icon} />,
    onSelect: () => navigate(entry.path),
  }))

  // Longest match wins, so `/debts/x/record` still lights Debts.
  const active =
    [...destinations]
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
  const theme = useTheme()
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const bar = useNavItems(NAV)
  // One list for the active key, split for rendering: otherwise being on
  // /settings would light Home, because Settings is not in the main group.
  const sidebar = useNavItems([...SIDEBAR_NAV, ...SIDEBAR_FOOTER_NAV])
  const footerKeys = new Set<string>(SIDEBAR_FOOTER_NAV.map((entry) => entry.key))
  const sidebarItems = sidebar.items.filter((item) => !footerKeys.has(item.key))
  const sidebarFooterItems = sidebar.items.filter((item) => footerKeys.has(item.key))

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
          <h1 className="font-voice text-title text-ink">
            Couldn&rsquo;t open your data
          </h1>
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
      <Sidebar
        items={sidebarItems}
        footerItems={sidebarFooterItems}
        footerSlot={<ThemeChoice value={theme.choice} onValueChange={theme.setChoice} />}
        activeKey={sidebar.activeKey}
        onAdd={() => setQuickAddOpen(true)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* §5 — 16px gutters at 360, 720px centred at tablet, 1200px at desktop. */}
        <main
          id="main"
          className="flex-1 px-4 pb-24 pt-4 desktop:px-8 desktop:pb-8"
        >
          <div className="mx-auto w-full max-w-[720px] desktop:max-w-[1200px]">
            {/* Offline is a state, not an error — neutral, never danger (L4, F7). */}
            {!online ? <OfflineNote /> : null}

            <Suspense fallback={<LoadingScreen />}>
              <Outlet />
            </Suspense>
          </div>
        </main>

        <QuickAddRoute open={quickAddOpen} onOpenChange={setQuickAddOpen} />

        <BottomBar
          items={bar.items}
          activeKey={bar.activeKey}
          onAdd={() => setQuickAddOpen(true)}
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
