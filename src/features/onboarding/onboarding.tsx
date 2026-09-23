/**
 * WHAT: The six steps, the progress dots, and the one save at the end.
 * WHY:  **Only step 2 is required** (story A5). Everything else is skippable,
 *       because the goal is a correct Home in about two minutes, and a form
 *       that insists on six answers gets abandoned at the third.
 * INTERVIEW: I made five of six steps skippable and saved once at the end, so a
 *       failed save loses nothing and a hurried owner still lands on a Home
 *       with real figures.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from '@/ui/button'
import { Banner } from '@/ui/banner'
import { Field, AmountInput } from '@/ui/field'
import { Switch } from '@/ui/controls'
import { formatMoney } from '@/core/money/money'
import type { Id, Instant, IsoDate, Kobo } from '@/core/types'
import { emptyAnswers, type DebtAnswer, type OnboardingAnswers } from './answers'

const STEPS = [
  'Your name',
  'Your salary',
  'Your categories',
  'What you have saved',
  'Debts',
  'Rent',
] as const

/** Naira typed as digits, echoed back formatted as they type (§7.1). */
function toKobo(typed: string): Kobo {
  const digits = typed.replace(/[^\d.]/g, '')
  const value = Number.parseFloat(digits)
  if (!Number.isFinite(value) || value < 0) return 0 as Kobo
  return Math.round(value * 100) as Kobo
}

export interface OnboardingProps {
  /** Today, passed in — nothing here reads the clock (ADR-003). */
  now: IsoDate
  at: Instant
  makeId?: () => string
  /** Writes the whole first dataset in one transaction. */
  onFinish: (answers: OnboardingAnswers, ctx: { now: IsoDate; at: Instant; makeId: () => string }) => Promise<string | undefined>
}

export function Onboarding({ now, at, makeId = defaultMakeId, onFinish }: OnboardingProps) {
  const [answers, setAnswers] = useState<OnboardingAnswers>(() => emptyAnswers(makeId))
  const [step, setStep] = useState(0)
  const [takeHomeText, setTakeHomeText] = useState('')
  const [showErrors, setShowErrors] = useState(false)
  const [saveProblem, setSaveProblem] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)

  // The step change moves focus to the heading, so a screen-reader user is told
  // where they now are rather than being left on a button that has changed.
  useEffect(() => {
    heading.current?.focus()
  }, [step])

  const takeHomeError =
    showErrors && answers.takeHome <= 0 ? 'Enter how much you take home each month.' : undefined
  const salaryDayError =
    showErrors && (answers.salaryDay < 1 || answers.salaryDay > 31)
      ? 'Pick a day between 1 and 31.'
      : undefined

  const stepIsValid = step !== 1 || (answers.takeHome > 0 && answers.salaryDay >= 1 && answers.salaryDay <= 31)
  const isLast = step === STEPS.length - 1

  function goNext() {
    if (!stepIsValid) {
      setShowErrors(true)
      return
    }
    setShowErrors(false)
    setStep((s) => s + 1)
  }

  async function finish() {
    if (answers.takeHome <= 0) {
      setStep(1)
      setShowErrors(true)
      return
    }
    setSaving(true)
    setSaveProblem(undefined)
    // A failed save keeps every entered value: `answers` is never cleared, so
    // Retry re-submits exactly what the owner typed. They never re-type.
    const problem = await onFinish(answers, { now, at, makeId })
    setSaving(false)
    setSaveProblem(problem)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[520px] flex-col gap-6 py-8">
      <ProgressDots current={step} total={STEPS.length} />

      <div className="flex flex-1 flex-col gap-5">
        <h1
          ref={heading}
          tabIndex={-1}
          className="font-voice text-title text-ink outline-none"
        >
          {STEPS[step]}
        </h1>

        {step === 0 ? (
          <StepBody hint="Only used on a debt record you print. You can skip this.">
            <Field
              label="Your name"
              value={answers.ownerName ?? ''}
              onChange={(e) => setAnswers({ ...answers, ownerName: e.target.value || undefined })}
            />
            <p className="font-structural text-small text-soft">
              Everything you enter stays on this device.
            </p>
          </StepBody>
        ) : null}

        {step === 1 ? (
          <StepBody hint="The only step we really need.">
            <Field
              label="Salary day"
              type="number"
              inputMode="numeric"
              min={1}
              max={31}
              required
              value={String(answers.salaryDay)}
              error={salaryDayError}
              onChange={(e) =>
                setAnswers({ ...answers, salaryDay: Number.parseInt(e.target.value, 10) || 0 })
              }
            />

            {/* A note, not a warning: nothing is wrong (D4). */}
            {answers.salaryDay >= 29 && answers.salaryDay <= 31 ? (
              <Banner tone="neutral">
                <span className="text-small">Short months will use the last day.</span>
              </Banner>
            ) : null}

            <AmountInput
              label="Take-home each month"
              required
              value={takeHomeText}
              error={takeHomeError}
              onValueChange={(next) => {
                setTakeHomeText(next)
                setAnswers({ ...answers, takeHome: toKobo(next) })
              }}
            />
            {answers.takeHome > 0 ? (
              <p className="font-structural text-small text-soft">
                {formatMoney(answers.takeHome)} a month.
              </p>
            ) : null}
          </StepBody>
        ) : null}

        {step === 2 ? (
          <StepBody hint="A starter list. Turn off anything you do not use — you can change these later.">
            <ul className="flex flex-col gap-1">
              {emptyAnswers(() => '').categories.map((starter, index) => {
                const kept = answers.categories.some((c) => c.name === starter.name)
                return (
                  <li key={starter.name}>
                    <Switch
                      checked={kept}
                      label={starter.name}
                      onCheckedChange={(on) =>
                        setAnswers({
                          ...answers,
                          categories: on
                            ? [
                                ...answers.categories,
                                { ...starter, id: makeId() as Id, sortOrder: index },
                              ].sort((a, b) => a.sortOrder - b.sortOrder)
                            : answers.categories.filter((c) => c.name !== starter.name),
                        })
                      }
                    />
                  </li>
                )
              })}
            </ul>
          </StepBody>
        ) : null}

        {step === 3 ? (
          <StepBody hint="What have you already put aside for this? Leave a row blank if it is nothing yet.">
            {answers.categories.filter((c) => c.type === 'savings').length === 0 ? (
              <p className="font-structural text-body text-soft">
                No savings categories, so there is nothing to open a balance for.
              </p>
            ) : null}

            {answers.categories
              .filter((c) => c.type === 'savings')
              .map((category) => (
                <OpeningBalanceRow
                  key={category.id}
                  name={category.name}
                  onChange={(amount) =>
                    setAnswers({
                      ...answers,
                      openingBalances: { ...answers.openingBalances, [category.id]: amount },
                    })
                  }
                />
              ))}
          </StepBody>
        ) : null}

        {step === 4 ? (
          <StepBody hint="Both directions sit here together, because the app is about both.">
            <DebtList
              debts={answers.debts}
              onChange={(debts) => setAnswers({ ...answers, debts })}
            />
          </StepBody>
        ) : null}

        {step === 5 ? (
          <StepBody hint="A sinking fund for the rent, so it is not a shock once a year.">
            <RentStep
              value={answers.rent}
              onChange={(rent) => setAnswers({ ...answers, rent })}
            />
          </StepBody>
        ) : null}
      </div>

      {saveProblem ? (
        <Banner tone="neutral" action={{ label: 'Try again', onClick: () => void finish() }}>
          <span className="text-small">{saveProblem}</span>
        </Banner>
      ) : null}

      {/* Pinned to the bottom, above the keyboard. */}
      <div className="sticky bottom-0 flex gap-3 bg-bg pb-2 pt-3">
        {step > 0 ? (
          <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        ) : null}

        <Button
          fullWidth
          loading={saving}
          onClick={() => (isLast ? void finish() : goNext())}
        >
          {isLast ? 'Finish' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}

function StepBody({ hint, children }: { hint: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-structural text-body text-soft">{hint}</p>
      {children}
    </div>
  )
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {/* The words, for a screen reader; the dots, for everyone else. */}
      <span className="sr-only" aria-live="polite">
        Step {current + 1} of {total}
      </span>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`h-1.5 flex-1 rounded-full ${i <= current ? 'bg-emerald' : 'bg-track'}`}
        />
      ))}
    </div>
  )
}

function OpeningBalanceRow({
  name,
  onChange,
}: {
  name: string
  onChange: (amount: Kobo) => void
}) {
  const [typed, setTyped] = useState('')
  return (
    <AmountInput
      label={name}
      value={typed}
      onValueChange={(next) => {
        setTyped(next)
        onChange(toKobo(next))
      }}
    />
  )
}

function DebtList({
  debts,
  onChange,
}: {
  debts: DebtAnswer[]
  onChange: (debts: DebtAnswer[]) => void
}) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [owedToMe, setOwedToMe] = useState(false)

  function add() {
    if (!name.trim() || toKobo(amount) <= 0) return
    onChange([
      ...debts,
      {
        counterpartyName: name.trim(),
        direction: owedToMe ? 'owed-to-me' : 'i-owe',
        amount: toKobo(amount),
      },
    ])
    setName('')
    setAmount('')
  }

  return (
    <div className="flex flex-col gap-4">
      {debts.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {debts.map((debt, i) => (
            <li
              key={`${debt.counterpartyName}-${i}`}
              className="flex justify-between font-structural text-body text-ink"
            >
              <span>{debt.counterpartyName}</span>
              <span className="text-soft">
                {formatMoney(debt.amount)}{' '}
                {debt.direction === 'owed-to-me' ? 'owed to you' : 'you owe'}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <AmountInput label="Amount" value={amount} onValueChange={setAmount} />
      <Switch
        checked={owedToMe}
        label="They owe me"
        helper="Off means you owe them."
        onCheckedChange={setOwedToMe}
      />
      <Button variant="secondary" onClick={add}>
        Add another
      </Button>
    </div>
  )
}

function RentStep({
  value,
  onChange,
}: {
  value: OnboardingAnswers['rent']
  onChange: (rent: OnboardingAnswers['rent']) => void
}) {
  const [target, setTarget] = useState('')
  return (
    <>
      <AmountInput
        label="Rent target"
        value={target}
        onValueChange={(next) => {
          setTarget(next)
          onChange({ target: toKobo(next), ...(value?.dueDate ? { dueDate: value.dueDate } : {}) })
        }}
      />
      <Field
        label="Due date"
        type="date"
        value={value?.dueDate ?? ''}
        onChange={(e) =>
          onChange({
            target: value?.target ?? (0 as Kobo),
            ...(e.target.value ? { dueDate: e.target.value as IsoDate } : {}),
          })
        }
      />
      {value && value.target > 0 ? (
        <p className="font-structural text-small text-soft">
          {formatMoney(value.target)} by {value.dueDate ?? 'no date set'}.
        </p>
      ) : null}
    </>
  )
}

function defaultMakeId(): string {
  return crypto.randomUUID()
}
