/**
 * WHAT: Home — the screen the app exists for.
 * WHY:  **Ranked, not a grid** (D8). One hero answers the question the owner
 *       came with; everything else is subordinate to it. Eight equal tiles is
 *       the spreadsheet rendered smaller, and the spreadsheet is what this app
 *       replaces.
 * INTERVIEW: I ranked the screen around a single figure instead of a dashboard,
 *       because the question people actually open a budget app with has one
 *       answer, not eight.
 */

import type { ReactNode } from 'react'
import {
  cashLeft,
  cycleAt,
  plannedDailyAllowance,
  safeToSpend,
  spendingByCategory,
  spendingByDay,
  totalMoved,
  unallocated,
  type CategorySpending,
} from '@/core/budget/budget'
import { daysLeft, hijriDate, nextCycleStart } from '@/core/cycle/cycle'
import { debtsByDirection, type DebtSummary } from '@/core/debt/debt'
import { projectedGap, type GoalProjection } from '@/core/goal/goal'
import { formatMoney, speakMoney } from '@/core/money/money'
import type { Goal, IsoDate, Kobo, Snapshot } from '@/core/types'
import { Banner, OfflineNote } from '@/ui/banner'
import { Card, CardLabel } from '@/ui/card'
import { DailySpendChart } from '@/ui/daily-spend-chart'
import { FigureLink } from '@/ui/figure-link'
import { Gauge } from '@/ui/gauge'
import { MoneyBreakdown, type Segment } from '@/ui/money-breakdown'
import { MoneyText } from '@/ui/money-text'
import { Pill, StatusPill } from '@/ui/pill'
import { Rail } from '@/ui/rail'
import { Table } from '@/ui/table'

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

  const categories = spendingByCategory(snapshot, cycle)
  const debts = debtsByDirection(snapshot, now)

  const tone = safe.level === 'red' ? 'danger' : safe.level === 'amber' ? 'warning' : 'positive'

  return (
    <div className="flex flex-col gap-8">
      {/* Offline is a state, not an error (L4). */}
      {!online ? <OfflineNote /> : null}

      <DateRow now={now} />

      <Hero
        safe={safe}
        tone={tone}
        allowance={allowance}
        left={left}
        days={days}
        nextPayday={nextCycleStart(snapshot.settings, now)}
        onOpen={onOpen}
      />

      {/* A banner, and **absent** at ₦0 — never a tile reading zero (D8). */}
      {free > 0 ? (
        <Banner tone="action" action={{ label: 'Plan it', onClick: () => onOpen('/plan') }}>
          <span className="text-small">
            <MoneyText amount={free} /> unallocated
          </span>
        </Banner>
      ) : null}

      <section className="grid gap-6 tablet:grid-cols-2">
        <Card>
          <CardLabel>Where this cycle&rsquo;s money went</CardLabel>
          <div className="mt-3">
            <MoneyBreakdown
              caption="How this cycle's take-home is divided"
              total={snapshot.settings.takeHome}
              segments={segmentsFor({ spent, saved, debtPaid, free })}
              footer={{ label: 'Safe to spend', formatted: formatMoney(safe.total) }}
            />
            {/* Actual against planned. They differ when a salary lands short,
                or has not landed yet — and the breakdown above divides what was
                planned, so the difference has to be said rather than implied. */}
            <p className="mt-3 font-structural text-small text-soft">
              Income received {formatMoney(income)} of {formatMoney(snapshot.settings.takeHome)}
              {income < snapshot.settings.takeHome ? ' so far' : ''}.
            </p>
          </div>
        </Card>

        <Card>
          <CardLabel>Spending, day by day</CardLabel>
          <div className="mt-3 flex flex-col gap-2">
            <DailySpendChart
              allowance={allowance}
              label={dailyChartLabel(snapshot, cycle.start, now, allowance)}
              days={spendingByDay(snapshot, cycle).map((day) => ({
                date: day.date,
                amount: day.spent,
                isToday: day.date === now,
              }))}
            />
            <p className="font-structural text-small text-soft">
              The dashed line is {formatMoney(allowance)} a day, what the plan allows.
            </p>
          </div>
        </Card>
      </section>

      <CategoryTable rows={categories} onOpen={onOpen} />
      <GoalsAndDebts snapshot={snapshot} now={now} debts={debts} onOpen={onOpen} />
    </div>
  )
}

function DateRow({ now }: { now: IsoDate }) {
  const gregorian = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${now}T00:00:00Z`))

  return (
    <p className="font-data text-mlab uppercase text-soft">
      {gregorian} · {hijriDate(now)}
    </p>
  )
}

function Hero({
  safe,
  tone,
  allowance,
  left,
  days,
  nextPayday,
  onOpen,
}: {
  safe: ReturnType<typeof safeToSpend>
  tone: 'positive' | 'warning' | 'danger'
  allowance: Kobo
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
    <section className="flex flex-col items-center gap-3 text-center">
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

function CategoryTable({
  rows,
  onOpen,
}: {
  rows: CategorySpending[]
  onOpen: (destination: string) => void
}) {
  return (
    <section className="flex flex-col gap-3">
      {/* The label step, not the voice face: EB Garamond is for screen
          titles, hero statements and the printed record (tokens.md §3). A
          heading *inside* a screen is a label, and the design draws it as
          one. */}
      <h2 className="font-structural text-lab uppercase text-soft">Categories</h2>
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
    <section className="flex flex-col gap-3">
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
