import { useState, type ReactNode } from 'react'
import {
  cashLeft,
  cycleAt,
  plannedDailyAllowance,
  safeToSpend,
  amberThreshold,
  spendingByCategory,
  spendingByDay,
  totalMoved,
  unallocated,
  type CategorySpending,
} from '@mizaniya/core/budget/budget'
import { daysLeft, hijriDate, nextCycleStart } from '@mizaniya/core/cycle/cycle'
import { debtsByDirection, type DebtSummary } from '@mizaniya/core/debt/debt'
import { projectedGap, type GoalProjection } from '@mizaniya/core/goal/goal'
import { formatMoney, speakMoney } from '@mizaniya/core/money/money'
import type { Goal, IsoDate, Kobo, Snapshot } from '@mizaniya/core/types'
import { OfflineNote } from '@/ui/banner'
import { Card, CardLabel } from '@/ui/card'
import { DailySpendChart } from '@/ui/daily-spend-chart'
import { FigureLink } from '@/ui/figure-link'
import { Gauge } from '@/ui/gauge'
import { MoneyBreakdown, type Segment } from '@/ui/money-breakdown'
import { MoneyText } from '@/ui/money-text'
import { Button, IconButton } from '@/ui/button'
import { Icon } from '@/ui/icon'
import { IconTile, Pill, StatusPill } from '@/ui/pill'
import { ListRow } from '@/ui/list-row'
import { Rail } from '@/ui/rail'
import { Table } from '@/ui/table'
import { DESKTOP, useMediaQuery } from '@/ui/use-media-query'

export interface HomeScreenProps {
  snapshot: Snapshot
  now: IsoDate
  online?: boolean
  /** Every figure opens its records — no figure is a dead end. */
  onOpen: (destination: string) => void
}

export function HomeScreen({ snapshot, now, online = true, onOpen }: HomeScreenProps) {
  const cycle = cycleAt(snapshot, now)
  const safe = safeToSpend(snapshot, now)
  const left = cashLeft(snapshot, cycle)
  const days = daysLeft(snapshot.settings, now)
  const allowance = plannedDailyAllowance(snapshot, cycle)
  const free = unallocated(snapshot, cycle)

  const income = totalMoved(snapshot, cycle, ['income'])
  const saved = totalMoved(snapshot, cycle, ['savings-in'])
  const debtPaid = totalMoved(snapshot, cycle, ['repaid'])
  const spent = totalMoved(snapshot, cycle, ['expense'])

  /**
   * **Spending categories only** — the eight the artboards draw, and the eight
   * the count badge counts.
   *
   * `spendingByCategory` returns every category, which is right for a general
   * selector and wrong here: a protected line is money that has already gone
   * where the plan promised, so it has nothing left to spend and `statusOf`
   * gives it `ok` unconditionally. Listing the four of them padded the table to
   * twelve rows that could never need attention, and made "of 8" read "of 12".
   */
  const categories = spendingByCategory(snapshot, cycle).filter((row) => !row.isProtected)
  const debts = debtsByDirection(snapshot, now)

  const tone = safe.level === 'red' ? 'danger' : safe.level === 'amber' ? 'warning' : 'positive'

  return (
    <div className="flex flex-col gap-44">
      {/* Offline is a state, not an error (L4). */}
      {!online ? <OfflineNote /> : null}

      <DateRow now={now} onOpen={onOpen} />

      <Hero
        safe={safe}
        tone={tone}
        allowance={allowance}
        threshold={amberThreshold(snapshot, cycle)}
        left={left}
        days={days}
        nextPayday={nextCycleStart(snapshot.settings, now)}
        onOpen={onOpen}
      />

      <section className="grid gap-26 tablet:grid-cols-2">
        <Card>
          <div className="flex items-center gap-12">
            <CardLabel className="flex-1">Where your money is</CardLabel>
            {/* What came in, beside the label rather than as a sentence under
                the card — the artboard's header row. */}
            <span className="font-data text-mlab uppercase text-soft">
              {formatMoney(income)} in
            </span>
          </div>
          <div className="mt-12">
            <MoneyBreakdown
              caption="How this cycle's take-home is divided"
              total={snapshot.settings.takeHome}
              segments={segmentsFor({ spent, saved, debtPaid, free })}
              footer={{ label: 'Safe to spend', formatted: formatMoney(safe.total) }}
            />
          </div>
        </Card>

        <Card>
          <CardLabel>Daily spend</CardLabel>
          <div className="mt-12 flex flex-col gap-8">
            <DailySpendChart
              allowance={allowance}
              label={dailyChartLabel(snapshot, cycle.start, now, allowance)}
              days={spendingByDay(snapshot, cycle).map((day) => ({
                date: day.date,
                amount: day.spent,
                isToday: day.date === now,
              }))}
            />
          </div>
        </Card>
      </section>

      <CategoryTable rows={categories} onOpen={onOpen} />
      <GoalsAndDebts snapshot={snapshot} now={now} debts={debts} onOpen={onOpen} />
    </div>
  )
}

function DateRow({ now, onOpen }: { now: IsoDate; onOpen: (destination: string) => void }) {
  const at = new Date(`${now}T00:00:00Z`)
  const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'UTC' }).format(at)
  const date = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(at)

  return (
    <header className="flex items-center justify-between gap-12">
      <div>
        <p className="font-structural text-lab uppercase text-soft">{weekday}</p>
        {/**
         * 20/25, which §3 keeps **outside** the type table on purpose: the Home
         * date is voice but quiet, and naming it a step would invite other
         * screens to reuse it as one.
         */}
        <p className="mt-4 font-voice text-[20px] leading-[25px] text-ink">
          {date} <span className="text-soft">· {hijriDate(now)}</span>
        </p>
      </div>

      <IconButton label="Open other cycles" onClick={() => onOpen('/months')}>
        <Icon name="calendar" size={18} />
      </IconButton>
    </header>
  )
}

function Hero({
  safe,
  tone,
  allowance,
  threshold,
  left,
  days,
  nextPayday,
  onOpen,
}: {
  safe: ReturnType<typeof safeToSpend>
  tone: 'positive' | 'warning' | 'danger'
  allowance: Kobo
  /** Always shown, so read from core rather than off the amber variant. */
  threshold: Kobo
  left: Kobo
  days: number
  nextPayday: IsoDate
  onOpen: (destination: string) => void
}) {
  const payday = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${nextPayday}T00:00:00Z`))

  return (
    <section className="flex flex-col items-center gap-12 text-center">
      <Gauge
        value={safe.perDay}
        max={allowance > 0 ? allowance : Math.max(safe.perDay, 1)}
        threshold={safe.level === 'amber' ? safe.threshold : undefined}
        tone={tone}
        label={`Safe to spend today, ${speakMoney(safe.perDay)}`}
      >
        {/* The screen's one question, so it is the screen's one h1. Everything
            else on Home is subordinate to it (D8). */}
        <h1 className="font-structural text-lab uppercase text-soft">Safe to spend today</h1>
        <MoneyText amount={safe.perDay} tone={tone === 'positive' ? 'default' : tone} />
      </Gauge>

      {/**
       * The scale the gauge is drawn against, in words.
       *
       * Without it the arc says "some of something": §6 asks every diagram to
       * carry a text key, and the amber threshold in particular is a figure
       * nobody can derive from looking at it.
       */}
      <div className="flex w-full items-baseline justify-between px-4">
        <span className="font-structural text-lab uppercase text-soft">
          {formatMoney(0 as Kobo)}
        </span>
        <span className="font-structural text-lab uppercase text-ochre">
          {formatMoney(threshold)} low
        </span>
        <span className="font-structural text-lab uppercase text-soft">
          {formatMoney(allowance)}
        </span>
      </div>

      {safe.level !== 'green' ? (
        <StatusPill status={safe.level === 'red' ? 'overspent' : 'low'} />
      ) : null}

      <p className="font-structural text-small text-soft">
        <FigureLink
          label="Cash left this cycle — open the movements behind it"
          onClick={() => onOpen('/transactions')}
        >
          <MoneyText amount={left} /> left
        </FigureLink>{' '}
        · {days} {days === 1 ? 'day' : 'days'} to {payday}
      </p>

      {/* The one case where the figure is a guess from take-home, and says so. */}
      {!safe.hasPlan ? (
        <p className="font-structural text-small text-faint">
          Based on your take-home. Set a plan to make this exact.
        </p>
      ) : null}

      {safe.level === 'red' ? (
        <p className="font-structural text-small text-soft">
          You&rsquo;ve spent more than you have left for this cycle.
        </p>
      ) : null}
    </section>
  )
}

function segmentsFor({
  spent,
  saved,
  debtPaid,
  free,
}: {
  spent: Kobo
  saved: Kobo
  debtPaid: Kobo
  free: Kobo
}): Segment[] {
  return [
    { tone: 'spent', label: 'Spent', amount: spent, formatted: formatMoney(spent) },
    { tone: 'saved', label: 'Saved', amount: saved, formatted: formatMoney(saved) },
    { tone: 'debt', label: 'Debt paid', amount: debtPaid, formatted: formatMoney(debtPaid) },
    { tone: 'free', label: 'Unallocated', amount: free, formatted: formatMoney(free) },
  ]
}

function dailyChartLabel(
  snapshot: Snapshot,
  start: IsoDate,
  now: IsoDate,
  allowance: Kobo,
): string {
  const days = spendingByDay(snapshot, cycleAt(snapshot, now))
  const over = days.filter((d) => allowance > 0 && d.spent > allowance).length
  void start
  return over === 0
    ? 'Spending each day of this cycle. No day has gone over the allowance.'
    : `Spending each day of this cycle. ${over} ${over === 1 ? 'day has' : 'days have'} gone over the allowance.`
}

/**
 * Home's categories, which are **two sections rather than one**.
 *
 * At 1440 the full table; at 360 a ranked subset. Eight rows at 360 push *Safe
 * to spend today* off the screen, and that figure is the reason Home exists
 * (D8). The two were never a naming dispute — **the heading names what the list
 * is showing**, which is also what settles the state nobody specified.
 */
function CategoryTable({
  rows,
  onOpen,
}: {
  rows: CategorySpending[]
  onOpen: (destination: string) => void
}) {
  // One or the other, never both. The two carry different content, so hiding a
  // duplicate with CSS would leave two identical headings in the document.
  return useMediaQuery(DESKTOP) ? (
    <FullCategoryTable rows={rows} onOpen={onOpen} />
  ) : (
    <RankedCategories rows={rows} onOpen={onOpen} />
  )
}

/** The worst three, or everything that needs attention. Narrow widths only. */
function RankedCategories({
  rows,
  onOpen,
}: {
  rows: CategorySpending[]
  onOpen: (destination: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const needingAttention = rows.filter((row) => row.status !== 'ok')

  // Overspent *and* low, which is what the artboard's "2 of 8" counts: Health
  // is over, Transport is at 85%. Low is a warning in time to act on it, so
  // leaving it out would hide the only row still worth changing.
  const shown = expanded
    ? rows
    : needingAttention.length > 0
      ? needingAttention
      : rows.slice(0, 3)

  // The heading follows the list, never the width: when nothing needs
  // attention there is no "Needs attention · 0 of 8", there is just Categories.
  const heading = !expanded && needingAttention.length > 0 ? 'Needs attention' : 'Categories'

  return (
    <section className="flex flex-col gap-12">
      <div className="flex items-center gap-8">
        <h2 className="font-structural text-lab uppercase text-soft">{heading}</h2>
        {heading === 'Needs attention' ? (
          <Pill tone="danger">{`${needingAttention.length} of ${rows.length}`}</Pill>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <EmptyNote>No categories yet. Add them in Plan.</EmptyNote>
      ) : (
        <ul className="flex flex-col">
          {shown.map((row) => (
            <RankedRow
              key={row.categoryId}
              row={row}
              onOpen={() => onOpen(`/transactions?category=${row.categoryId}`)}
            />
          ))}
        </ul>
      )}

      {rows.length > shown.length || expanded ? (
        <Button variant="quiet" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show fewer' : `Show all ${rows.length} categories`}
        </Button>
      ) : null}
    </section>
  )
}

function RankedRow({ row, onOpen }: { row: CategorySpending; onOpen: () => void }) {
  const tone = row.status === 'overspent' ? 'danger' : row.status === 'low' ? 'warning' : 'positive'

  return (
    <li>
      {/* `ListRow`, not a hand-rolled button (F5). It already renders a real
          button — keyboard, focus and announcement from the platform — and
          already carries this row's borders. */}
      <ListRow
        leading={
          <IconTile tone={tone}>
            <Icon name={row.status === 'overspent' ? 'alert' : 'trend'} size={18} />
          </IconTile>
        }
        title={<span className="font-semibold">{row.name}</span>}
        trailing={
          <span className="flex flex-col items-end gap-4">
            <MoneyText amount={row.spent} tone={row.status === 'overspent' ? 'danger' : 'default'} />
            {row.status === 'ok' ? null : (
              <StatusPill status={row.status === 'overspent' ? 'overspent' : 'low'} />
            )}
          </span>
        }
        footer={
          <Rail
            value={row.portionUsed}
            tone={tone}
            label={`${row.name}, ${Math.round(row.portionUsed * 100)}% of its allowance used`}
          />
        }
        onClick={onOpen}
      />
    </li>
  )
}

/** Every category, with its rail and what is left. Wide widths only. */
function FullCategoryTable({
  rows,
  onOpen,
}: {
  rows: CategorySpending[]
  onOpen: (destination: string) => void
}) {
  return (
    <section className="flex flex-col gap-12">
      {/* The label step, not the voice face: EB Garamond is for screen
          titles, hero statements and the printed record (tokens.md §3). A
          heading *inside* a screen is a label, and the design draws it as
          one. */}
      <div className="flex items-center gap-8">
        <h2 className="font-structural text-lab uppercase text-soft">Categories</h2>
        <Pill tone="quiet">{rows.length}</Pill>
      </div>
      <Table
        caption="What is left in each category, worst first"
        rows={rows}
        rowKey={(row) => row.categoryId}
        onRowClick={(row) => onOpen(`/transactions?category=${row.categoryId}`)}
        empty={<EmptyNote>No categories yet. Add them in Plan.</EmptyNote>}
        columns={[
          {
            key: 'name',
            header: 'Category',
            render: (row) => (
              <span className="font-structural text-body text-ink">{row.name}</span>
            ),
          },
          {
            key: 'bar',
            header: 'Used',
            render: (row) => (
              <Rail
                value={row.portionUsed}
                tone={row.status === 'overspent' ? 'danger' : row.status === 'low' ? 'warning' : 'positive'}
                label={`${row.name}, ${Math.round(row.portionUsed * 100)}% of its allowance used`}
              />
            ),
          },
          {
            key: 'left',
            header: 'Left',
            align: 'right',
            render: (row) => (
              <MoneyText
                amount={row.left}
                tone={row.status === 'overspent' ? 'danger' : 'default'}
              />
            ),
          },
          {
            key: 'status',
            header: 'Status',
            align: 'right',
            render: (row) =>
              row.status === 'ok' ? null : (
                <StatusPill status={row.status === 'overspent' ? 'overspent' : 'low'} />
              ),
          },
        ]}
      />
    </section>
  )
}

interface GoalRow {
  key: string
  name: string
  current: Kobo
  target?: Kobo
  status?: ReactNode
  detail?: string
  destination: string
}

function GoalsAndDebts({
  snapshot,
  now,
  debts,
  onOpen,
}: {
  snapshot: Snapshot
  now: IsoDate
  debts: Record<string, DebtSummary[]>
  onOpen: (destination: string) => void
}) {
  const rows: GoalRow[] = [
    ...snapshot.goals.map((goal) => goalRow(goal, projectedGap(snapshot, goal, now))),
    ...[...(debts['you-owe'] ?? []), ...(debts['owed-to-you'] ?? [])].map(debtRow),
  ]

  return (
    <section className="flex flex-col gap-12">
      <h2 className="font-structural text-lab uppercase text-soft">Goals &amp; debts</h2>
      <Table
        caption="Goals and debts, with their status"
        rows={rows}
        rowKey={(row) => row.key}
        onRowClick={(row) => onOpen(row.destination)}
        empty={<EmptyNote>Nothing recorded yet. Add a goal or a debt in Debts.</EmptyNote>}
        columns={[
          {
            key: 'name',
            header: 'Name',
            render: (row) => (
              <div className="flex flex-col">
                <span className="font-structural text-body text-ink">{row.name}</span>
                {/* Arithmetic, not advice (system spec §3). */}
                {row.detail ? (
                  <span className="font-structural text-small text-soft">{row.detail}</span>
                ) : null}
              </div>
            ),
          },
          {
            key: 'amount',
            header: 'Now',
            align: 'right',
            render: (row) => (
              <span className="font-data text-small text-ink">
                <MoneyText amount={row.current} face="data" />
                {row.target !== undefined ? (
                  <span className="text-soft"> of {formatMoney(row.target)}</span>
                ) : null}
              </span>
            ),
          },
          { key: 'status', header: 'Status', align: 'right', render: (row) => row.status ?? null },
        ]}
      />
    </section>
  )
}

function goalRow(goal: Goal, projection: GoalProjection): GoalRow {
  const base = {
    key: `goal-${goal.id}`,
    name: goal.name,
    current: projection.saved,
    target: projection.target,
    destination: '/debts',
  }

  if (projection.kind === 'overdue') {
    return { ...base, status: <StatusPill status="overdue" /> }
  }
  // No due date means no badge at all: there is nothing to be on track *for*.
  if (projection.kind === 'no-deadline') return base

  if (projection.status === 'short') {
    return {
      ...base,
      status: <StatusPill status="short" />,
      detail: `${formatMoney(projection.gap)} short · needs ${formatMoney(projection.rateToClose)} a payday`,
    }
  }
  return { ...base, status: <StatusPill status="onTrack" /> }
}

function debtRow(summary: DebtSummary): GoalRow {
  return {
    key: `debt-${summary.debt.id}`,
    name: summary.debt.counterpartyName,
    current: summary.owed,
    destination: `/debts`,
    status:
      summary.direction === 'owed-to-you' ? (
        <Pill tone="quiet">Owed to you</Pill>
      ) : (
        <Pill tone="neutral">You owe</Pill>
      ),
    ...(summary.projection.kind === 'scheduled'
      ? { detail: `Clears in ${summary.projection.paydays} paydays` }
      : {}),
  }
}

function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="font-structural text-body text-soft">{children}</p>
}
