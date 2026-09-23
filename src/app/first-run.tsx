/**
 * WHAT: The first run — the welcome screen, then onboarding, then Home.
 * WHY:  It lives in `app/` because it joins a feature to the store, and a
 *       feature may not import `app/store-context` (A2). That constraint is the
 *       right shape anyway: the screens stay ignorant of how anything is saved.
 * INTERVIEW: I kept the wiring in the app layer and the screens pure, so the
 *       onboarding form can be tested without a database behind it.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router'
import { WelcomeScreen } from '@/features/onboarding/welcome-screen'
import { Onboarding } from '@/features/onboarding/onboarding'
import { buildSnapshot } from '@/features/onboarding/answers'
import { createImportExport } from '@/store/import-export'
import type { ImportRefusal } from '@/core/schema'
import type { Instant, IsoDate } from '@/core/types'
import { useSnapshotActions } from './store-context'

/** Every refusal ends with this sentence, said to the person it protects. */
const NOTHING_CHANGED = 'Nothing has changed.'

function refusalMessage(refusal: ImportRefusal): string {
  switch (refusal.reason) {
    case 'not-mizaniya':
      return `This doesn’t look like a Mizaniya export. Look for a file named mizaniya-export-….json. ${NOTHING_CHANGED}`
    case 'too-new':
      return `This file was made by a newer version of Mizaniya. Update the app, then import it again. ${NOTHING_CHANGED}`
    case 'malformed':
      return `This file is damaged and can’t be read. ${NOTHING_CHANGED} If you have an older export, try that one.`
  }
}

export interface FirstRunProps {
  /** Injected so tests can fix the date; the app passes the real one. */
  now?: IsoDate
  at?: Instant
}

export function FirstRun({ now, at }: FirstRunProps) {
  const actions = useSnapshotActions()
  const navigate = useNavigate()
  const [started, setStarted] = useState(false)

  const today = now ?? (new Date().toISOString().slice(0, 10) as IsoDate)
  const instant = at ?? (new Date().toISOString() as Instant)

  if (!started) {
    return (
      <WelcomeScreen
        onGetStarted={() => setStarted(true)}
        onRestore={async (text) => {
          const outcome = await createImportExport(actions).importFrom(text, {
            now: instant,
            today,
            // A new device has nothing to back up, and `importFrom` knows it.
            saveSafetyCopy: async () => {},
          })

          if (outcome.kind === 'imported') {
            // The export already carries the settings, so onboarding would only
            // ask for answers the file has already supplied.
            navigate('/', { replace: true })
            return undefined
          }

          return outcome.kind === 'refused'
            ? refusalMessage(outcome.refusal)
            : `${outcome.message} ${NOTHING_CHANGED}`
        }}
      />
    )
  }

  return (
    <Onboarding
      now={today}
      at={instant}
      onFinish={async (answers, ctx) => {
        try {
          await actions.replaceAll(buildSnapshot(answers, ctx))
          navigate('/', { replace: true })
          return undefined
        } catch (error) {
          // Every value the owner typed is still in the form. Retry re-submits
          // it, so they never type it again.
          const detail = error instanceof Error ? ` (${error.message})` : ''
          return `Couldn’t save that. Your answers are still here — try again.${detail}`
        }
      }}
    />
  )
}
