/**
 * WHAT: The six steps, the progress dots, and the one save at the end.
 * WHY:  **Only step 2 is required** (story A5). Everything else is skippable,
 *       because the goal is a correct Home in about two minutes, and a form
 *       that insists on six answers gets abandoned at the third.
 * INTERVIEW: I made five of six steps skippable and saved once at the end, so a
 *       failed save loses nothing and a hurried owner still lands on a Home
 *       with real figures.
 */

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/ui/button'
import { Banner } from '@/ui/banner'
import { AmountInput, Field, SelectField } from '@/ui/field'
import { ChipGroup } from '@/ui/controls'
import { Card } from '@/ui/card'
import { Icon } from '@/ui/icon'
import { IconTile, Pill, type PillTone } from '@/ui/pill'
import { Sheet } from '@/ui/sheet'
import { paydaysBetween } from '@/core/cycle/cycle'
import type { CategoryType, Settings } from '@/core/types'
import { formatMoney } from '@/core/money/money'
import type { Id, Instant, IsoDate, Kobo } from '@/core/types'
import { emptyAnswers, type DebtAnswer, type OnboardingAnswers } from './answers'

/**
 * **The questions, not labels for them.** The artboards ask *"What should we
 * call you?"*, and the screen had been titling that step `Your name` — which
 * names the field rather than asking anything.
 */
const STEPS = [
  'What should we call you?',
  'When are you paid, and how much?',
  'These are your categories.',
  'What have you already saved?',
  'Who do you owe, and who owes you?',
  'Saving towards rent?',
] as const

/** The tints the artboards give each category type on step 3. */
const CATEGORY_TONE: Record<CategoryType, PillTone> = {
  savings: 'positive',
  'debt-payment': 'warning',
  expense: 'neutral',
  income: 'quiet',
}

const CATEGORY_LABEL: Record<CategoryType, string> = {
  savings: 'Savings',
  'debt-payment': 'Debt payment',
  expense: 'Expense',
  income: 'Income',
}

const ADDABLE: CategoryType[] = ['expense', 'savings', 'debt-payment']

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
  const [dayPickerOpen, setDayPickerOpen] = useState(false)
  const [addingCategory, setAddingCategory] = useState(false)
  const [debtDraft, setDebtDraft] = useState(emptyDraft)
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
  /**
   * Step 5's primary reads **Add another** while a counterparty is half-typed,
   * which is the state the artboard draws. With nothing typed there is nothing
   * to add, so it goes back to carrying the owner forward.
   */
  const draftIsFillable =
    step === 4 && debtDraft.name.trim() !== '' && toKobo(debtDraft.amount) > 0 && !!debtDraft.direction

  function addDebt() {
    setAnswers({
      ...answers,
      debts: [
        ...answers.debts,
        {
          counterpartyName: debtDraft.name.trim(),
          direction: debtDraft.direction ?? 'i-owe',
          amount: toKobo(debtDraft.amount),
        },
      ],
    })
    setDebtDraft(emptyDraft())
  }

  const savingsCategories = answers.categories.filter((c) => c.type === 'savings')
  // What step 4 recorded against the rent fund, which is what step 6 is
  // closing the gap from.
  const rentCategory = savingsCategories.find((c) => /rent/i.test(c.name))
  const rentOpeningBalance = ((rentCategory && answers.openingBalances[rentCategory.id]) ??
    0) as Kobo

  function addCategory(name: string, type: CategoryType) {
    setAnswers({
      ...answers,
      categories: [
        ...answers.categories,
        {
          id: makeId() as Id,
          name,
          type,
          rollsOver: false,
          sortOrder: answers.categories.length,
        },
      ],
    })
    setAddingCategory(false)
  }

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
    <div className="flex min-h-screen justify-center desktop:items-center desktop:py-[70px]">
      {/* Full-bleed on a phone; a 620px card at 1440, which is what OnbDLight
          draws — the same content, given an edge rather than a new layout. */}
      <div className="flex w-full max-w-[420px] flex-col desktop:max-w-[620px] desktop:rounded-xl desktop:border desktop:border-line desktop:bg-card desktop:shadow-card">
        <header className="px-5 pt-6">
          <ProgressDots current={step} total={STEPS.length} />

          <p className="mt-4 font-structural text-lab uppercase text-soft">
            Step {step + 1} of {STEPS.length}
          </p>

          <h1
            ref={heading}
            tabIndex={-1}
            className="mt-2 font-voice text-question text-ink outline-none"
          >
            {STEPS[step]}
          </h1>
        </header>

      <div className="flex flex-1 flex-col gap-5 px-5 pt-6">

        {step === 0 ? (
          <>
            <Field
              label="Your name"
              helper="Optional. It appears on the printed debt record, and nowhere else."
              value={answers.ownerName ?? ''}
              onChange={(e) => setAnswers({ ...answers, ownerName: e.target.value || undefined })}
            />
            {/* Set apart by a rule, because it is a promise about all six steps
                rather than a note about this field. */}
            <p className="mt-[14px] border-t border-hair pt-[18px] font-structural text-small text-soft">
              Everything you enter stays on this device.
            </p>
          </>
        ) : null}

        {step === 1 ? (
          <div className="flex flex-col gap-[22px]">
            <SelectField
              label="Salary day"
              helper="Short months will use the last day."
              value={String(answers.salaryDay)}
              error={salaryDayError}
              trailing={<Icon name="chevron" size={18} />}
              onClick={() => setDayPickerOpen(true)}
            />

            <AmountInput
              label="Take-home pay"
              /**
               * The echo page specs §7.1 asks for, in the slot the artboard
               * gives to guidance — rather than the extra line the screen had,
               * which the design has no room for. Once there is a figure to
               * read back, reading it back is the more useful sentence.
               */
              helper={
                answers.takeHome > 0
                  ? `${formatMoney(answers.takeHome)} a month.`
                  : 'What actually reaches you each month, after deductions.'
              }
              required
              value={takeHomeText}
              error={takeHomeError}
              onValueChange={(next) => {
                setTakeHomeText(next)
                setAnswers({ ...answers, takeHome: toKobo(next) })
              }}
            />
          </div>
        ) : null}

        {step === 2 ? (
          <>
            <Card className="p-4">
              <ul>
                {answers.categories.map((category) => (
                  <li
                    key={category.id}
                    className="flex min-h-[52px] items-center gap-3 border-b border-hair last:border-b-0"
                  >
                    <span className="flex-1 font-structural text-body text-ink">
                      {category.name}
                    </span>
                    <Pill tone={CATEGORY_TONE[category.type]}>{CATEGORY_LABEL[category.type]}</Pill>
                  </li>
                ))}
              </ul>
            </Card>

            <Button
              variant="quiet"
              className="self-start px-0 font-semibold text-emerald"
              onClick={() => setAddingCategory(true)}
            >
              + Add a category
            </Button>

            <p className="font-structural text-small text-soft">
              Twelve to start with. Rename, remove or add any of them — you can change them
              later in Settings.
            </p>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <p className="font-structural text-small text-soft">
              What have you already put aside for this?
            </p>

            {savingsCategories.length === 0 ? (
              <p className="font-structural text-body text-soft">
                No savings categories, so there is nothing to open a balance for.
              </p>
            ) : null}

            <ul>
              {savingsCategories.map((category) => (
                <li
                  key={category.id}
                  className="flex items-center gap-3 border-b border-hair py-3 last:border-b-0"
                >
                  <span className="flex-1 font-structural text-body text-ink">
                    {category.name}
                  </span>
                  {/* The field is 150px and the name takes the rest, so eight
                      rows read as one column of figures rather than eight forms. */}
                  <div className="w-[150px] shrink-0">
                    <OpeningBalanceRow
                      name={category.name}
                      onChange={(amount) =>
                        setAnswers({
                          ...answers,
                          openingBalances: { ...answers.openingBalances, [category.id]: amount },
                        })
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>

            <p className="font-structural text-small text-soft">
              Each amount is recorded as a dated opening movement on 24 September — the day
              before this cycle starts — so it never counts as this cycle&rsquo;s saving.
            </p>
          </>
        ) : null}

        {step === 4 ? (
          <DebtList draft={debtDraft} onDraft={setDebtDraft} debts={answers.debts} />
        ) : null}

        {step === 5 ? (
          <RentStep
            value={answers.rent}
            onChange={(rent) => setAnswers({ ...answers, rent })}
            salaryDay={answers.salaryDay}
            now={now}
            alreadySaved={rentOpeningBalance}
          />
        ) : null}
      </div>

      <DayPicker
        open={dayPickerOpen}
        value={answers.salaryDay}
        onOpenChange={setDayPickerOpen}
        onPick={(day) => {
          setAnswers({ ...answers, salaryDay: day })
          setDayPickerOpen(false)
        }}
      />

      <AddCategory open={addingCategory} onOpenChange={setAddingCategory} onAdd={addCategory} />

      {saveProblem ? (
        <Banner tone="neutral" action={{ label: 'Try again', onClick: () => void finish() }}>
          <span className="text-small">{saveProblem}</span>
        </Banner>
      ) : null}

      {/* Back is a fixed 100px and Continue takes the rest, as drawn: the two
          are not equals, and equal halves say they are. Step 1 has no Back. */}
      <div className="flex gap-2.5 px-5 pb-6 pt-[22px]">
        {step > 0 ? (
          <Button
            variant="secondary"
            className="w-[100px] shrink-0"
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </Button>
        ) : null}

        <Button
          fullWidth
          loading={saving}
          onClick={() => {
            if (draftIsFillable) return addDebt()
            return isLast ? void finish() : goNext()
          }}
        >
          {draftIsFillable ? 'Add another' : isLast ? 'Finish' : 'Continue'}
        </Button>
      </div>
      </div>
    </div>
  )
}


/**
 * Six dots, and the one you are on is a pill.
 *
 * **Not six equal bars filling up.** A progress bar says "how much is left";
 * these say "which of six you are on", and the widened current dot is what
 * carries that. `Step N of 6` is written out beneath in words, so nothing here
 * has to be announced.
 */
function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div aria-hidden="true" className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-2 rounded-full ${i === current ? 'w-6 bg-emerald' : 'w-2'} ${
            i < current ? 'bg-emerald' : i > current ? 'bg-track' : ''
          }`}
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

/** An empty counterparty form. */
function emptyDraft(): { name: string; amount: string; began: string; schedule: string; direction?: DebtAnswer['direction'] } {
  return { name: '', amount: '', began: '', schedule: '' }
}

function DebtList({
  draft,
  onDraft,
  debts,
}: {
  draft: ReturnType<typeof emptyDraft>
  onDraft: (draft: ReturnType<typeof emptyDraft>) => void
  debts: DebtAnswer[]
}) {
  return (
    <div className="flex flex-col gap-[18px]">
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

      {/* Two chips, and **neither is selected until it is chosen**. A default
          here would record a direction nobody stated, on the one field where
          getting it backwards inverts the whole record. */}
      <ChipGroup
        label="Direction"
        helper="No default — pick the one that is true."
        value={draft.direction}
        options={[
          { value: 'i-owe', label: 'I owe them' },
          { value: 'owed-to-me', label: 'They owe me' },
        ]}
        onValueChange={(next) => onDraft({ ...draft, direction: next as DebtAnswer['direction'] })}
      />

      <Field
        label="Counterparty name"
        value={draft.name}
        onChange={(e) => onDraft({ ...draft, name: e.target.value })}
      />

      <AmountInput
        label="Amount"
        value={draft.amount}
        onValueChange={(next) => onDraft({ ...draft, amount: next })}
      />

      <Field
        label="Date it began"
        type="date"
        value={draft.began}
        onChange={(e) => onDraft({ ...draft, began: e.target.value })}
      />

      <AmountInput
        label="Agreed repayment per cycle"
        // `(optional)` sits inside the label at regular weight, as drawn —
        // not as helper text under the field, where it reads as advice.
        labelSuffix={<span className="font-normal text-soft"> (optional)</span>}
        value={draft.schedule}
        onValueChange={(next) => onDraft({ ...draft, schedule: next })}
      />
    </div>
  )
}

function RentStep({
  value,
  onChange,
  salaryDay,
  now,
  alreadySaved,
}: {
  value: OnboardingAnswers['rent']
  onChange: (rent: OnboardingAnswers['rent']) => void
  salaryDay: number
  now: IsoDate
  alreadySaved: Kobo
}) {
  const [target, setTarget] = useState('')

  const goal = value?.target ?? (0 as Kobo)
  const due = value?.dueDate
  const paydays =
    due && salaryDay >= 1 && salaryDay <= 31
      ? paydaysBetween({ salaryDay } as Settings, now, due)
      : 0

  /**
   * **What is knowable here, which is not what the artboard quotes.**
   *
   * The callout is drawn as *"At ₦75,000.00 a payday — you reach ₦850,000.00…
   * ₦50,000.00 short"*. That ₦75,000 is the rent fund's **planned
   * contribution**, and at step 6 there is no plan — it is set on Plan, after
   * onboarding. So the rate cannot be read; it can only be **solved for**.
   *
   * Obligations round **up** (tokens.md §4): a rate that rounds down arrives
   * short, which is the one direction that matters here.
   */
  const perPayday =
    paydays > 0 && goal > alreadySaved
      ? (Math.ceil((goal - alreadySaved) / paydays) as Kobo)
      : (0 as Kobo)

  return (
    <div className="flex flex-col gap-[22px]">
      <AmountInput
        label="Rent target"
        value={target}
        onValueChange={(next) => {
          setTarget(next)
          onChange({ target: toKobo(next), ...(due ? { dueDate: due } : {}) })
        }}
      />

      <Field
        label="Due date"
        type="date"
        helper="Mizaniya works out what you need to put aside each payday to get there."
        value={due ?? ''}
        onChange={(e) =>
          onChange({
            target: goal,
            ...(e.target.value ? { dueDate: e.target.value as IsoDate } : {}),
          })
        }
      />

      {perPayday > 0 && due ? (
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <IconTile tone="positive">
              <Icon name="target" size={18} />
            </IconTile>
            <div className="flex-1">
              <div className="font-structural text-body font-semibold text-ink">
                At {formatMoney(perPayday)} a payday
              </div>
              <div className="mt-1 font-structural text-small text-soft">
                You reach {formatMoney(goal)} by {due}, over {paydays}{' '}
                {paydays === 1 ? 'payday' : 'paydays'}.
              </div>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  )
}

function defaultMakeId(): string {
  return crypto.randomUUID()
}

/**
 * **Neither of these is drawn.** The artboards show the closed salary-day field
 * and the `+ Add a category` link, and stop there. Rather than invent a new
 * visual language for what opens, both are composed from primitives the design
 * system already draws elsewhere — a sheet, a field, a chip group. What they
 * should actually look like is a question for the designer.
 */
function DayPicker({
  open,
  value,
  onOpenChange,
  onPick,
}: {
  open: boolean
  value: number
  onOpenChange: (open: boolean) => void
  onPick: (day: number) => void
}) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Salary day"
      description="The day of the month your pay arrives."
    >
      <ChipGroup
        label="Day of the month"
        value={String(value)}
        options={Array.from({ length: 31 }, (_, i) => ({
          value: String(i + 1),
          label: String(i + 1),
        }))}
        onValueChange={(day) => onPick(Number(day))}
      />
    </Sheet>
  )
}

function AddCategory({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (name: string, type: CategoryType) => void
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState<CategoryType>('expense')

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Add a category"
      description="Name it, and say what kind it is."
      footer={
        <Button
          fullWidth
          disabled={!name.trim()}
          onClick={() => {
            onAdd(name.trim(), type)
            setName('')
            setType('expense')
          }}
        >
          Add
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <ChipGroup
          label="Kind"
          value={type}
          options={ADDABLE.map((kind) => ({ value: kind, label: CATEGORY_LABEL[kind] }))}
          onValueChange={(next) => setType(next as CategoryType)}
        />
      </div>
    </Sheet>
  )
}
