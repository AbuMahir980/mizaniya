import { Button } from '@/ui/button'
import { Card } from '@/ui/card'
import { ImageSlot } from './image-slot'
import { LandingFooter } from './landing-footer'
import { LandingBand } from './landing-band'
import { freeBecause, howToUseIt, theRestOfIt } from './landing-copy'

export interface LandingCloseProps {
  onStart: () => void
  onRestore: () => void
}

/**
 * Everything after the argument: what is free and why, the written record, the
 * proof row, how to use it, the closing, and the footer.
 *
 * **The closing is the only place the page asks twice.** The brief allows it:
 * someone who has read this far has read the argument, and the ask belongs
 * where the reading ends as well as where it starts.
 */
export function LandingClose({ onStart, onRestore }: LandingCloseProps) {
  return (
    <>
      <WhatIsFree />
      <TheRest />
      <ImageSlot
        name="landing-paid"
        title="The same household, paid"
        description="The 25th. Quieter and warmer than the first image — the relief of the salary landing, not celebration."
      />
      <HowToUseIt />
      <Closing onStart={onStart} onRestore={onRestore} />
      <LandingFooter />
    </>
  )
}

function WhatIsFree() {
  return (
    <>
      <LandingBand labelledBy="free" className="flex flex-col gap-16">
        <h2 id="free" className="font-voice text-title text-ink">
          What is free is free because it costs us nothing to run.
        </h2>
        <ul className="flex flex-col gap-8">
          {freeBecause.map((line) => (
            <li key={line} className="font-structural text-body text-soft">
              {line}
            </li>
          ))}
        </ul>
      </LandingBand>

      <LandingBand labelledBy="written" tone="raised" className="flex flex-col gap-8">
        <h2 id="written" className="font-voice text-h2 text-ink">
          Debts written down, both ways, with a record either party can hold.
        </h2>
        <p className="font-structural text-small text-faint">Qur&rsquo;an 2:282</p>
      </LandingBand>
    </>
  )
}

function TheRest() {
  return (
    <>
      <LandingBand labelledBy="rest" className="flex flex-col gap-16">
        <h2 id="rest" className="font-voice text-title text-ink">
          The rest of it.
        </h2>
        <div className="flex flex-col gap-12 desktop:flex-row desktop:flex-wrap">
          {theRestOfIt.map((item) => (
            <Card key={item.title} as="article" className="flex flex-1 flex-col gap-4">
              <h3 className="font-structural text-body text-ink">{item.title}</h3>
              <p className="font-structural text-small text-soft">{item.body}</p>
            </Card>
          ))}
        </div>
      </LandingBand>
    </>
  )
}

function HowToUseIt() {
  return (
    <>
      <LandingBand labelledBy="how-to" tone="raised" className="flex flex-col gap-16">
        <h2 id="how-to" className="font-voice text-title text-ink">
          How to use it
        </h2>
        <ol className="flex flex-col gap-12">
          {howToUseIt.map((step, index) => (
            <li key={step.title} className="flex gap-12 border-b border-hair pb-12">
              <span className="font-data text-lab text-faint">{index + 1}</span>
              <span className="flex flex-col gap-2">
                <span className="font-structural text-body text-ink">{step.title}</span>
                <span className="font-structural text-small text-soft">{step.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </LandingBand>
    </>
  )
}

function Closing({ onStart, onRestore }: LandingCloseProps) {
  return (
    <>
      <LandingBand labelledBy="closing" className="flex flex-col gap-16">
        <h2 id="closing" className="font-voice text-title text-ink">
          You do not need an account.
        </h2>
        <p className="font-structural text-body text-soft">
          Your figures, your devices, free — and not a trial. A second device or a second person is
          a key you hand over, not a sign-up.
        </p>
        <div className="flex flex-col gap-8 desktop:flex-row desktop:items-center">
          <Button onClick={onStart}>Start with my own figures</Button>
          <Button variant="secondary" onClick={onRestore}>
            I already have a budget
          </Button>
        </div>
        <a
          className="font-structural text-small text-soft underline"
          href="https://github.com/AbuMahir980/mizaniya"
        >
          Read the source
        </a>
      </LandingBand>
    </>
  )
}
