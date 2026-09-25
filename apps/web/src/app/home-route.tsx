import { useNavigate } from 'react-router'
import { HomeScreen } from '@/features/home/home-screen'
import { useIsOnline, useSnapshotState } from './store-context'
import { useToday } from './today-context'

export function HomeRoute() {
  const state = useSnapshotState()
  const online = useIsOnline()
  const navigate = useNavigate()
  const { now } = useToday()

  // The shell has already handled loading, new-owner and error, so anything
  // else here would be a second place for those states to drift.
  if (state.status !== 'ready') return null

  return (
    <HomeScreen
      snapshot={state.snapshot}
      now={now}
      online={online}
      onOpen={(destination) => navigate(destination)}
    />
  )
}
