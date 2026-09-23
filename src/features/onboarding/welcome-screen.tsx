/**
 * WHAT: The first screen — one promise, three things the app does, and a route
 *       in for someone restoring an export.
 * WHY:  It was designed **after** PAGE SPECS, so no ticket mentioned it until
 *       `docs/open-items.md` item 5. The restore path matters most: someone
 *       moving to a new phone must not be made to onboard again and then
 *       discover the import would have replaced it all anyway.
 * INTERVIEW: I gave the first screen a restore route beside the start route,
 *       because the second-time user arrives here too and has different needs.
 */

import { useState } from 'react'
import { Button } from '@/ui/button'
import { FilePicker } from '@/ui/file-picker'
import { Banner } from '@/ui/banner'
import { Icon, type IconName } from '@/ui/icon'
import { IconTile } from '@/ui/pill'
import { Mark } from '@/ui/mark'
import { WordmarkArabic } from '@/ui/wordmark-arabic'

/** The three promises, in the order the artboard sets them, each with its glyph. */
const POINTS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'target',
    title: 'Safe to spend, today',
    body: 'One figure, worked out in front of you.',
  },
  {
    icon: 'people',
    title: 'Debts in both directions',
    body: 'Written down, with a record you can print.',
  },
  {
    icon: 'shield-check',
    title: 'Nothing leaves this device',
    body: 'No account, no server, no sync.',
  },
]

export interface WelcomeScreenProps {
  onGetStarted: () => void
  /**
   * Given the file's text. Returns a message when the import was refused or
   * failed — every one of which ends "Nothing has changed."
   */
  onRestore: (text: string) => Promise<string | undefined>
}

export function WelcomeScreen({ onGetStarted, onRestore }: WelcomeScreenProps) {
  const [problem, setProblem] = useState<string | undefined>()
  const [busy, setBusy] = useState(false)

  async function handleFile(file: File) {
    setBusy(true)
    setProblem(undefined)
    try {
      setProblem(await onRestore(await file.text()))
    } catch {
      setProblem('That file could not be read. Nothing has changed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[520px] flex-col justify-center gap-8 py-10">
      <header className="flex flex-col items-center gap-2 text-center">
        <Mark size={44} className="text-emerald" />
        {/* The lockup's own display size. The artboard draws it at 42/48, and
            `text-title` left the app's name smaller than the sentence under it. */}
        <h1 className="font-voice text-lockup text-ink">Mizaniya</h1>
        {/* Under the Latin, never above it, and never carrying a figure. */}
        <WordmarkArabic height={26} className="text-soft" />
        <p className="font-structural text-small text-soft">
          Everything stays on this device
        </p>
      </header>

      <div className="flex flex-col gap-3 text-center">
        <p className="font-voice text-h2 text-ink">Know what you can spend today.</p>
        <p className="font-structural text-body text-soft">
          Budgeting by salary day, not by calendar month. Debts both ways, savings goals, and
          a zakat estimate when you want one.
        </p>
      </div>

      <ul className="flex flex-col gap-4">
        {POINTS.map((point) => (
          <li key={point.title} className="flex items-start gap-3">
            {/* `positive` is bg-em2 on text-emerald — the tint the artboard uses
                here, already named. A second 38px square would be one too many. */}
            <IconTile tone="positive">
              <Icon name={point.icon} size={18} />
            </IconTile>
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="font-structural text-body font-semibold text-ink">
                {point.title}
              </span>
              <span className="font-structural text-small text-soft">{point.body}</span>
            </div>
          </li>
        ))}
      </ul>

      {/* A refusal is informational, never danger-coloured: nothing was lost. */}
      {problem ? <Banner tone="neutral">{problem}</Banner> : null}

      <div className="flex flex-col gap-3">
        <Button onClick={onGetStarted} fullWidth>
          Get started
        </Button>

        <FilePicker
          fullWidth
          loading={busy}
          accept="application/json,.json"
          inputLabel="Choose an export file to restore"
          onFile={(file) => void handleFile(file)}
        >
          I have an export to restore
        </FilePicker>

        <p className="text-center font-structural text-small text-faint">
          Takes about two minutes. Every step after the first is optional.
        </p>
      </div>
    </div>
  )
}
