/**
 * WHAT: Home, joined to the store.
 * WHY:  The screen itself takes a snapshot and a date and knows nothing else,
 *       so it can be rendered in a test with plain values. This file is the
 *       only place it meets the store, the clock and the router.
 * INTERVIEW: I kept the screen a pure function of its data, which is what let
 *       every figure on it be tested without a database.
 */

import { useNavigate } from 'react-router'
import { HomeScreen } from '@/features/home/home-screen'
import type { IsoDate } from '@/core/types'
import { useIsOnline, useSnapshotState } from './store-context'

export function HomeRoute({ now }: { now?: IsoDate }) {
  const state = useSnapshotState()
  const online = useIsOnline()
  const navigate = useNavigate()

  // The shell has already handled loading, new-owner and error, so anything
  // else here would be a second place for those states to drift.
  if (state.status !== 'ready') return null

  return (
    <HomeScreen
      snapshot={state.snapshot}
      now={now ?? (new Date().toISOString().slice(0, 10) as IsoDate)}
      online={online}
      onOpen={(destination) => navigate(destination)}
    />
  )
}
