/**
 * WHAT: Plan — give every naira a job. Zero-based: the target is unallocated ₦0.
 * WHY:  **No Save button.** Each row saves on blur, because a plan half-typed
 *       and abandoned should still be there tomorrow — and a Save button turns
 *       every interruption into lost work.
 * INTERVIEW: I autosaved per row rather than adding a Save button, so the screen
 *       people leave halfway through keeps what they entered.
 */

import { useMemo, useState } from 'react'
import {
  cycleAt,
  isProtected,
  plannedDailyAllowance,
  plannedFor,
  unallocated,
} from '@/core/budget/budget'
import { carriedInLookup, leftoverFrom, previousCycle } from '@/core/budget/rollover'
import { formatMoney, speakMoney } from '@/core/money/money'
import type { Category, IsoDate, Kobo, Snapshot } from '@/core/types'
import { AmountInput } from '@/ui/field'
import { Banner } from '@/ui/banner'
import { Button } from '@/ui/button'
import { Pill } from '@/ui/pill'

/** Savings first, then debt, then the money actually available to spend. */
const GROUP_ORDER: { type: Category['type']; heading: string }[] = [
  { type: 'savings', heading: 'Savings' },
  { type: 'debt-payment', heading: 'Debt payment' },
  { type: 'expense', heading: 'Expense' },
]

export interface PlanScreenProps {
  snapshot: Snapshot
  now: IsoDate
  /** Returns a message when the row could not be saved. */
  onSaveRow: (categoryId: Category['id'], planned: Kobo) => Promise<string | undefined>
  onCopyLastCycle: () => Promise<string | undefined>
}

export function PlanScreen({ snapshot, now, onSaveRow, onCopyLastCycle }: PlanScreenProps) {
  const cycle = cycleAt(snapshot, now)
  const previous = previousCycle(snapshot, cycle)
  /**
   * The **previous** cycle's leftover, not this one's.
   *
   * `leftoverFrom` returns the leftover *of the cycle it is given* (page specs
   * §7.3 writes it as `leftoverFrom(previousCycle)`). Passing the current cycle
   * hands back this cycle's own cash left and shows it as money carried in —
   * so the screen offers the owner their salary twice, and unallocated reads
   * ₦900,000 against a ₦450,000 take-home.
   */
  const carried = leftoverFrom(snapshot, previous)
  const lookup = useMemo(() => carriedInLookup(snapshot, cycle), [snapshot, cycle])

  const free = unallocated(snapshot, cycle, carried)
  const overAllocated = free < 0

  const categories = snapshot.categories.filter((c) => !c.archivedAt)
  const hasPrevious = snapshot.plans.some((p) => p.cycleStart === previous.start)

  return (
    <div className="flex flex-col gap-6">
      <UnallocatedHeader
        free={free}
        overAllocated={overAllocated}
        takeHome={snapshot.settings.takeHome}
        carried={carried}
      />

      <div className="flex items-center justify-between gap-3">
        <h1 className="font-voice text-title text-ink">Plan</h1>
        <CopyLastCycle hasPrevious={hasPrevious} onCopy={onCopyLastCycle} />
      </div>

      {carried > 0 ? (
        <Banner tone="neutral">
          <span className="text-small">
            {formatMoney(carried)} carried from last cycle — not yet given a job
          </span>
        </Banner>
      ) : null}

      {categories.length === 0 ? (
        <p className="font-structural text-body text-soft">
          No categories yet. Add them in Settings, then give each one an amount here.
        </p>
      ) : null}

      {GROUP_ORDER.map(({ type, heading }) => {
        const rows = categories.filter((c) => c.type === type)
        if (rows.length === 0) return null

        return (
          <section key={type} className="flex flex-col gap-2">
            <h2 className="font-structural text-lab uppercase text-soft">{heading}</h2>
            {rows.map((category) => (
              <PlanRow
                key={category.id}
                category={category}
                planned={plannedFor(snapshot.plans, cycle, category.id)}
                carriedIn={lookup(category.id)}
                onSave={(amount) => onSaveRow(category.id, amount)}
              />
            ))}
          </section>
        )
      })}

      {/* A footnote, so D15's threshold is legible rather than folded into a
          figure nobody can derive. */}
      <p className="font-structural text-small text-faint">
        Planned daily allowance {formatMoney(plannedDailyAllowance(snapshot, cycle))} —
        everything not protected, divided by {cycle.length} days, rounded down.
      </p>
    </div>
  )
}

function UnallocatedHeader({
  free,
  overAllocated,
  takeHome,
  carried,
}: {
  free: Kobo
  overAllocated: boolean
  takeHome: Kobo
  carried: Kobo
}) {
  return (
    /* Sticky: it is the only feedback that the plan is finished, so it has to
       stay visible while typing. */
    <div className="sticky top-0 z-20 -mx-4 bg-bg px-4 py-3 desktop:-mx-8 desktop:px-8">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-structural text-lab uppercase text-soft">
          {overAllocated ? 'Over-allocated' : 'Unallocated'}
        </span>

        <span
          // Announced per blur, not per keystroke — a live region that fires on
          // every character says nothing and interrupts constantly.
          aria-live="polite"
          className={`font-data text-h2 ${overAllocated ? 'text-rose' : 'text-ink'}`}
        >
          {formatMoney(overAllocated ? (Math.abs(free) as Kobo) : free)}
          <span className="sr-only">
            {overAllocated
              ? ` over-allocated, ${speakMoney(Math.abs(free) as Kobo)} more than you have`
              : ` unallocated, ${speakMoney(free)}`}
          </span>
        </span>
      </div>

      <p className="mt-1 font-structural text-small text-faint">
        {formatMoney(takeHome)} take-home
        {carried > 0 ? ` + ${formatMoney(carried)} carried` : ''}
      </p>

      {/* The one case that earns the danger colour on this screen: money
          promised that does not exist (F7). */}
      {overAllocated ? (
        <p className="mt-2 font-structural text-small text-ink">
          You&rsquo;ve given jobs to more money than you have.
        </p>
      ) : null}
    </div>
  )
}

function CopyLastCycle({
  hasPrevious,
  onCopy,
}: {
  hasPrevious: boolean
  onCopy: () => Promise<string | undefined>
}) {
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState<string | undefined>()

  if (!hasPrevious) {
    return (
      /* Disabled **with a reason**, never silently inert. A dead button with no
         explanation is a bug the owner cannot report. */
      <div className="flex flex-col items-end gap-1">
        <Button variant="secondary" disabled>
          Copy last cycle
        </Button>
        <span className="font-structural text-small text-faint">
          There is no previous cycle yet.
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="secondary"
        loading={busy}
        onClick={async () => {
          setBusy(true)
          setProblem(await onCopy())
          setBusy(false)
        }}
      >
        Copy last cycle
      </Button>
      {problem ? (
        <span role="alert" className="font-structural text-small text-ink">
          {problem}
        </span>
      ) : null}
    </div>
  )
}

/** Kobo as the owner would type it: whole naira, or nothing at all for zero. */
function asTyped(planned: Kobo): string {
  return planned > 0 ? String(planned / 100) : ''
}

function PlanRow({
  category,
  planned,
  carriedIn: carried,
  onSave,
}: {
  category: Category
  planned: Kobo
  carriedIn: Kobo
  onSave: (planned: Kobo) => Promise<string | undefined>
}) {
  const [typed, setTyped] = useState(() => asTyped(planned))
  const [problem, setProblem] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)

  /**
   * Adopt a figure that changed from outside — Copy last cycle.
   *
   * `useState`'s initialiser runs once, so without this the row keeps showing
   * what it showed on mount and Copy appears to do nothing until a reload. The
   * comparison is against the last value *seen*, not the current one, so a
   * figure the owner is mid-way through typing is never yanked out from under
   * them.
   */
  const [lastSeen, setLastSeen] = useState(planned)
  if (planned !== lastSeen) {
    setLastSeen(planned)
    setTyped(asTyped(planned))
  }

  async function commit() {
    const value = typed.trim() === '' ? 0 : Number.parseFloat(typed.replace(/[₦,\s]/g, ''))
    if (!Number.isFinite(value) || value < 0) {
      setProblem('Amounts are numbers only.')
      return
    }

    setSaving(true)
    // The typed figure is never cleared on failure, and unallocated does not
    // move — memory updates only after storage confirms (ADR-001).
    setProblem(await onSave(Math.round(value * 100) as Kobo))
    setSaving(false)
  }

  return (
    <div className="flex items-center gap-3 border-b border-hair py-2">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-2 font-structural text-body text-ink">
          {category.name}
          {/* Protection is visible without opening a menu — otherwise it is
              invisible state that changes the app's headline figure. */}
          {isProtected(category) ? <Pill tone="quiet">Protected</Pill> : null}
          {category.rollsOver ? <Pill tone="quiet">Rolls over</Pill> : null}
        </span>

        {carried > 0 ? (
          <span className="font-structural text-small text-soft">
            + {formatMoney(carried)} carried
          </span>
        ) : null}

        {problem ? (
          <span role="alert" className="flex items-center gap-2 font-structural text-small text-ink">
            {problem}
            <Button variant="quiet" onClick={() => void commit()}>
              Try again
            </Button>
          </span>
        ) : null}
      </div>

      <div className="w-[9rem] shrink-0">
        <AmountInput
          label={`${category.name} amount`}
          hideLabel
          value={typed}
          disabled={saving}
          onValueChange={setTyped}
          // Autosave on blur. No Save button anywhere on this screen.
          onBlur={() => void commit()}
        />
      </div>
    </div>
  )
}
