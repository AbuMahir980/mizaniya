/**
 * WHAT: Every route in the app (page specs §1), and the placeholders standing
 *       in for screens that have not been built yet.
 * WHY:  The routes exist before the screens so navigation, the redirect and the
 *       keyboard order can be tested now. A placeholder says plainly that it is
 *       one — it never renders an empty screen that looks finished.
 * INTERVIEW: I stood the routing up ahead of the screens so the shell's
 *       behaviour had tests before there was anything to look at.
 */

import type { ReactNode } from 'react'
import { Route, Routes } from 'react-router'
import { ShellWithAnnouncer } from './app-shell'
import { PrimitivesPage } from './primitives-page'
import { FirstRun } from './first-run'

/**
 * A screen that has not been built.
 *
 * Deliberately not an empty page. An unbuilt screen and a screen with no data
 * look identical when both render nothing, and only one of them is a bug.
 */
function NotBuiltYet({ name, ticket }: { name: string; ticket: string }) {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="font-voice text-title text-ink">{name}</h1>
      <p className="font-structural text-body text-soft">
        This screen arrives in {ticket}. The shell, the navigation and the data
        beneath it are already here.
      </p>
    </section>
  )
}

/**
 * The frame for routes that sit **outside** the shell.
 *
 * `/welcome` has no navigation by design — onboarding should not offer a way to
 * skip past it — but it still needs the page's own gutters. Without this the
 * content sits flush against the window edge, which §5 forbids at every width:
 * 16px minimum, 720px centred at tablet, 1200px at desktop.
 */
function BareLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg px-4 py-6 tablet:px-6">
      <div className="mx-auto w-full max-w-[720px] desktop:max-w-[1200px]">
        {children}
      </div>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Outside the shell: onboarding has no navigation to escape into. */}
      <Route
        path="/welcome"
        element={
          <BareLayout>
            <FirstRun />
          </BareLayout>
        }
      />

      <Route element={<ShellWithAnnouncer />}>
        <Route index element={<NotBuiltYet name="Home" ticket="T13" />} />
        <Route
          path="/plan"
          element={<NotBuiltYet name="Plan" ticket="T15" />}
        />
        <Route
          path="/transactions"
          element={<NotBuiltYet name="Transactions" ticket="T16" />}
        />
        <Route
          path="/debts"
          element={<NotBuiltYet name="Debts & Goals" ticket="T17" />}
        />
        <Route
          path="/debts/:id/record"
          element={<NotBuiltYet name="Debt record" ticket="T18" />}
        />
        <Route
          path="/months"
          element={<NotBuiltYet name="Months" ticket="T19" />}
        />
        <Route
          path="/settings"
          element={<NotBuiltYet name="Settings" ticket="T20" />}
        />
        <Route
          path="/zakat"
          element={<NotBuiltYet name="Zakat" ticket="T22" />}
        />
        <Route
          path="/more"
          element={<NotBuiltYet name="More" ticket="T13" />}
        />

        {/* The gallery the design system is checked against. Not a product screen. */}
        <Route path="/primitives" element={<PrimitivesPage />} />

        {/* An unknown address goes Home rather than to a dead end. */}
        <Route
          path="*"
          element={<NotBuiltYet name="Not found" ticket="T13" />}
        />
      </Route>
    </Routes>
  )
}
