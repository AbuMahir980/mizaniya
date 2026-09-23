/**
 * WHAT: The first screen — one promise, three things the app does, and a route
 *       in for someone restoring an export.
 * WHY:  **Built from `01-welcome-360-*.png` and `01-welcome-1440-*.png`**, not
 *       from fragments of the markup. 360 and 1440 are different layouts rather
 *       than one layout that reflows: at 1440 the three points move *beside*
 *       the promise as cards, and each carries a longer line, which is what the
 *       artboards draw.
 * INTERVIEW: I rebuilt this screen against the artboards after shipping a
 *       version assembled from grepped markup, which had invented the tones,
 *       the mark and the layout.
 */

import { useState } from 'react'
import { Button } from '@/ui/button'
import { FilePicker } from '@/ui/file-picker'
import { Banner } from '@/ui/banner'
import { Icon, type IconName } from '@/ui/icon'
import { IconTile } from '@/ui/pill'
import { Mark } from '@/ui/mark'
import { WordmarkArabic } from '@/ui/wordmark-arabic'
import { DESKTOP, useMediaQuery } from '@/ui/use-media-query'
import type { PillTone } from '@/ui/pill'

/**
 * The three promises, in the artboards' order.
 *
 * **Three tones, not three emerald ones** — `em2`/emerald, `sl2`/slate,
 * `oc2`/ochre, which is what the artboard draws and what `IconTile` already
 * names as `positive`, `neutral` and `warning`.
 *
 * `wide` is the fuller line the 1440 cards carry. Not a decoration: at 360 the
 * point sits under a paragraph and has to stay short; in a card beside it there
 * is room to say the thing properly.
 */
const POINTS: {
  icon: IconName
  tone: PillTone
  title: string
  body: string
  wide: string
}[] = [
  {
    icon: 'target',
    tone: 'positive',
    title: 'Safe to spend, today',
    body: 'One figure, worked out in front of you.',
    wide: 'One figure, worked out in front of you — never a number you have to take on trust.',
  },
  {
    icon: 'people',
    tone: 'neutral',
    title: 'Debts in both directions',
    body: 'Written down, with a record you can print.',
    wide: 'Money you owe and money owed to you, each with a written record you can print.',
  },
  {
    icon: 'shield-check',
    tone: 'warning',
    title: 'Nothing leaves this device',
    body: 'No account, no server, no sync.',
    wide: 'No account, no server, no sync. Export a copy whenever you want one.',
  },
]

const PROMISE = 'Know what you can spend today.'
const BLURB =
  'Budgeting by salary day, not by calendar month. Debts both ways, savings goals, and a zakat estimate when you want one.'
const FOOTNOTE = 'Takes about two minutes. Every step after the first is optional.'
const RESTORE = 'I have an export to restore'

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
  const wide = useMediaQuery(DESKTOP)

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

  const picker = (
    <FilePicker
      fullWidth={!wide}
      // Quiet at 360, secondary at 1440 — `.btn-q` and `.btn-s` in the
      // artboards. Beside the primary it needs an edge; under it, it must not
      // compete.
      variant={wide ? 'secondary' : 'quiet'}
      loading={busy}
      accept="application/json,.json"
      inputLabel="Choose an export file to restore"
      onFile={(file) => void handleFile(file)}
    >
      {RESTORE}
    </FilePicker>
  )

  /* A refusal is informational, never danger-coloured: nothing was lost. */
  const refusal = problem ? <Banner tone="neutral">{problem}</Banner> : null

  if (wide) {
    return (
      <div className="flex min-h-screen items-center justify-center px-[64px] py-[78px]">
        <div className="flex w-full max-w-[1180px] items-center gap-[72px]">
          <div className="min-w-0 max-w-[520px] flex-1 basis-0">
            <AppMark tile={84} mark={49} />

            <h1 className="mt-36 font-voice text-lockup text-ink">Mizaniya</h1>
            {/*
              Right-aligned in the column, which is where the artboard puts it.
              `.ar` is `direction: rtl` on a block filling the 520px column, so
              the word sits against that column's right edge — level with the
              cards, not under the L of the Latin. An SVG ignores `direction`,
              so the alignment has to be asked for.
            */}
            <WordmarkArabic latin={52} className="ml-auto mt-4 block text-soft" />

            <p className="mt-26 font-voice text-statement text-ink">{PROMISE}</p>
            <p className="mt-14 font-structural text-body text-soft">{BLURB}</p>

            {refusal ? <div className="mt-16">{refusal}</div> : null}

            <div className="mt-[32px] flex flex-wrap gap-12">
              <Button onClick={onGetStarted} className="min-w-[180px]">
                Get started
              </Button>
              {picker}
            </div>

            <p className="mt-14 font-structural text-small text-faint">{FOOTNOTE}</p>
          </div>

          {/* Beside the promise rather than under it, each in its own card. */}
          <ul className="flex shrink-0 basis-[420px] flex-col gap-16">
            {POINTS.map((point) => (
              <li
                key={point.title}
                className="rounded-lg border border-line bg-card p-20 shadow-card"
              >
                <Point point={point} body={point.wide} gap="gap-14" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col">
      <header className="flex flex-col items-center px-26 pt-[56px] text-center">
        <AppMark tile={88} mark={51} />

        <h1 className="mt-26 font-voice text-lockup text-ink">Mizaniya</h1>
        {/* Under the Latin, never above it, and never carrying a figure. */}
        <WordmarkArabic latin={42} className="mt-4 text-soft" />

        <p className="mt-[30px] max-w-[280px] font-voice text-statement text-ink">{PROMISE}</p>
        <p className="mt-12 max-w-[290px] font-structural text-body text-soft">{BLURB}</p>
      </header>

      <ul className="flex flex-col gap-14 px-26 pt-[34px]">
        {POINTS.map((point) => (
          <li key={point.title}>
            <Point point={point} body={point.body} gap="gap-12" />
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-12 px-26 pb-36 pt-[34px]">
        {refusal}
        <Button onClick={onGetStarted} fullWidth>
          Get started
        </Button>
        {picker}
        <p className="mt-4 text-center font-structural text-small text-faint">{FOOTNOTE}</p>
      </div>
    </div>
  )
}

/**
 * The app icon, not a bare mark.
 *
 * A rounded emerald tile with the scales reversed out in `onEmerald` — the same
 * lockup the installed icon uses, which is why the first screen shows it rather
 * than the mark alone.
 */
/**
 * `brand/README.md`: *"The tile's corner is 22/84 of its own size — the iOS
 * superellipse ratio, so it scales with the icon."* **Brand geometry, and
 * deliberately not on §5's radius scale**, which governs UI surfaces — so it is
 * computed rather than rounded to 22 or 30 to make it fit a token.
 */
const CORNER_OF_TILE = 22 / 84

function AppMark({ tile, mark }: { tile: number; mark: number }) {
  return (
    <span
      className="flex items-center justify-center bg-emerald text-onEmerald shadow-lift"
      style={{ width: tile, height: tile, borderRadius: tile * CORNER_OF_TILE }}
    >
      <Mark size={mark} />
    </span>
  )
}

function Point({
  point,
  body,
  gap,
}: {
  point: (typeof POINTS)[number]
  body: string
  gap: string
}) {
  return (
    <div className={`flex items-start ${gap}`}>
      <IconTile tone={point.tone}>
        <Icon name={point.icon} size={18} />
      </IconTile>
      <div className="min-w-0 flex-1">
        <div className="font-structural text-body font-semibold text-ink">{point.title}</div>
        <div className="mt-4 font-structural text-small text-soft">{body}</div>
      </div>
    </div>
  )
}
