import { useNavigate } from 'react-router'
import { LandingPage } from '@/features/landing/landing-page'

/**
 * `/` for a device that holds no budget — `docs/06-page-specs.md` §7.0.
 *
 * **Both buttons go to `/welcome` for now, and that is a known redundancy.**
 * The landing page says what the welcome screen says, so §7.0 proposes retiring
 * that screen and opening onboarding at step 1. It is not done here because the
 * restore flow — the file picker and the import — lives inside it, and moving a
 * path that writes somebody's whole budget is not a change to make in passing.
 * `docs/open-items.md` §T·2 is the question; this is what ships until it is
 * answered.
 */
export function LandingRoute() {
  const navigate = useNavigate()
  const toWelcome = () => void navigate('/welcome')

  return <LandingPage onStart={toWelcome} onRestore={toWelcome} />
}
