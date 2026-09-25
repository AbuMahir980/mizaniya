import { useEffect, useMemo, useState } from 'react'
import { AmountInput, Field } from '@/ui/field'
import { Button } from '@/ui/button'
import { ChipGroup, Segmented } from '@/ui/controls'
import { Sheet } from '@/ui/sheet'
import { balanceOf, directionOf } from '@mizaniya/core/debt/debt'
import { isProtected } from '@mizaniya/core/budget/budget'
import type { Instant, IsoDate, Snapshot, TransactionType } from '@mizaniya/core/types'
import {
  MOVEMENT_LABELS,
  MOVEMENT_ORDER,
  emptyDraft,
  needsCategory,
  needsCounterparty,
  parseAmount,
  problemWith,
  takesDestination,
  toTransaction,
  type MovementDraft,
} from './movement-draft'

const DESTINATIONS = [
  { value: 'bank-vault', label: 'Bank vault' },
  { value: 'cowrywise', label: 'Cowrywise' },
  { value: 'piggyvest', label: 'PiggyVest' },
  { value: 'cash-at-home', label: 'Cash at home' },
  { value: 'ajo', label: 'Ajo' },
] as const

export interface QuickAddProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  snapshot: Snapshot
  now: IsoDate
  at: Instant
  makeId?: () => string
  /** Returns a message when the save failed; the sheet then stays open. */
  onSave: (transaction: ReturnType<typeof toTransaction>) => Promise<string | undefined>
}

export function QuickAdd({
  open,
  onOpenChange,
  snapshot,
  now,
  at,
  makeId = () => crypto.randomUUID(),
  onSave,
}: QuickAddProps) {
  const [draft, setDraft] = useState<MovementDraft>(() => emptyDraft(now))
  const [showProblem, setShowProblem] = useState(false)
  const [saveProblem, setSaveProblem] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)

  // A fresh sheet every time it opens. Carrying the last amount over is how
  // someone records ₦2,000 twice without noticing.
  useEffect(() => {
    if (!open) return
    setDraft(emptyDraft(now))
    setShowProblem(false)
    setSaveProblem(undefined)
    setNoteOpen(false)
  }, [open, now])

  const categories = useMemo(
    () =>
      snapshot.categories
        .filter((c) => !c.archivedAt)
        .filter((c) => (draft.type === 'income' ? c.type === 'income' : c.type !== 'income'))
        .filter((c) => (takesDestination(draft.type) ? isProtected(c) : true))
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [snapshot.categories, draft.type],
  )

  const counterparties = useMemo(
    () =>
      snapshot.debts
        .filter((debt) => !debt.closedAt)
        .map((debt) => ({
          value: debt.id as string,
          label: debt.counterpartyName,
          direction: directionOf(balanceOf(snapshot, debt.id)),
        })),
    [snapshot],
  )

  const problem = showProblem ? problemWith(draft) : undefined
  const amount = parseAmount(draft.typed)
  const nextCycle = draft.date > now

  async function save() {
    const found = problemWith(draft)
    if (found) {
      setShowProblem(true)
      return
    }

    setSaving(true)
    setSaveProblem(undefined)
    const failure = await onSave(toTransaction(draft, { id: makeId(), at }))
    setSaving(false)

    // A failed save keeps the sheet open with every value intact — the owner
    // never retypes what they already entered.
    if (failure) {
      setSaveProblem(failure)
      return
    }
    onOpenChange(false)
  }

  const noCategories = needsCategory(draft.type) && categories.length === 0
  const noCounterparties = needsCounterparty(draft.type) && counterparties.length === 0

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Add"
      description="Record a movement"
      footer={
        <Button fullWidth loading={saving} onClick={() => void save()}>
          Save
        </Button>
      }
    >
      <div className="flex flex-col gap-20">
        <AmountInput
          label="Amount"
          hideLabel
          // Focused on open, so the numeric keypad is up immediately.
          autoFocus
          required
          value={draft.typed}
          error={problem?.field === 'amount' ? problem.message : undefined}
          onValueChange={(typed) => setDraft({ ...draft, typed })}
        />

        <Segmented
          label="What kind of movement"
          value={draft.type}
          options={MOVEMENT_ORDER.slice(0, 2).map((type) => ({
            value: type,
            label: MOVEMENT_LABELS[type],
          }))}
          onValueChange={(next) => onTypeChange(next as TransactionType)}
        />

        {/* The other six, behind one tap. Expense and Received cover most days. */}
        <details className="group">
          <summary className="cursor-pointer font-structural text-small text-soft">
            Another kind of movement
          </summary>
          <div className="mt-12">
            <ChipGroup
              label="Movement type"
              value={draft.type}
              options={MOVEMENT_ORDER.slice(2).map((type) => ({
                value: type,
                label: MOVEMENT_LABELS[type],
              }))}
              onValueChange={(next) => onTypeChange(next as TransactionType)}
            />
          </div>
        </details>

        {needsCategory(draft.type) ? (
          noCategories ? (
            <EmptyChoice>Add a category first, in Plan.</EmptyChoice>
          ) : (
            <div className="flex flex-col gap-4">
              <ChipGroup
                label="Category"
                value={draft.categoryId}
                options={categories.map((c) => ({ value: c.id as string, label: c.name }))}
                onValueChange={(categoryId) =>
                  setDraft({ ...draft, categoryId: categoryId as MovementDraft['categoryId'] })
                }
              />
              {problem?.field === 'category' ? <FieldError>{problem.message}</FieldError> : null}
            </div>
          )
        ) : null}

        {needsCounterparty(draft.type) ? (
          noCounterparties ? (
            <EmptyChoice>Add a debt first, in Debts &amp; Goals.</EmptyChoice>
          ) : (
            <div className="flex flex-col gap-4">
              <ChipGroup
                label="Who this is with"
                value={draft.debtId}
                options={counterparties.map((c) => ({ value: c.value, label: c.label }))}
                onValueChange={(debtId) =>
                  setDraft({ ...draft, debtId: debtId as MovementDraft['debtId'] })
                }
              />
              {problem?.field === 'counterparty' ? (
                <FieldError>{problem.message}</FieldError>
              ) : null}
            </div>
          )
        ) : null}

        {takesDestination(draft.type) ? (
          <ChipGroup
            label="Where it is kept"
            value={draft.savingsDestination}
            options={DESTINATIONS.map((d) => ({ value: d.value, label: d.label }))}
            onValueChange={(next) =>
              setDraft({
                ...draft,
                savingsDestination: next as MovementDraft['savingsDestination'],
              })
            }
          />
        ) : null}

        <div className="flex flex-col gap-4">
          <Field
            label="Date"
            type="date"
            value={draft.date}
            onChange={(e) => setDraft({ ...draft, date: e.target.value as IsoDate })}
          />
          {/* Allowed, with a note — not a warning. Recording next month's rent
              early is a reasonable thing to do. */}
          {nextCycle ? (
            <p className="font-structural text-small text-soft">This is in your next cycle.</p>
          ) : null}
        </div>

        {noteOpen ? (
          <Field
            label="Note"
            value={draft.note ?? ''}
            onChange={(e) => setDraft({ ...draft, note: e.target.value })}
          />
        ) : (
          <Button variant="quiet" onClick={() => setNoteOpen(true)}>
            + note
          </Button>
        )}

        {amount !== undefined && amount > 0 ? (
          <p className="font-structural text-small text-faint">
            {MOVEMENT_LABELS[draft.type]}, {draft.date}.
          </p>
        ) : null}

        {saveProblem ? <FieldError>{saveProblem}</FieldError> : null}
      </div>
    </Sheet>
  )

  function onTypeChange(next: TransactionType) {
    // Changing the type drops a choice that no longer applies, rather than
    // carrying a category into a debt movement where it means nothing.
    setDraft({
      ...draft,
      type: next,
      ...(needsCategory(next) ? {} : { categoryId: undefined }),
      ...(needsCounterparty(next) ? {} : { debtId: undefined }),
      ...(takesDestination(next) ? {} : { savingsDestination: undefined }),
    })
    setShowProblem(false)
  }
}

function FieldError({ children }: { children: React.ReactNode }) {
  // Neutral, not danger: a missing category is an ordinary correction, and the
  // danger colour is reserved for money going wrong (F7).
  return (
    <p role="alert" className="font-structural text-small text-ink">
      {children}
    </p>
  )
}

function EmptyChoice({ children }: { children: React.ReactNode }) {
  return <p className="font-structural text-body text-soft">{children}</p>
}
