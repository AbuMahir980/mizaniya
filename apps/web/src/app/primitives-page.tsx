import { useState } from 'react'
import {
  AmountInput,
  AnnounceProvider,
  Banner,
  BottomBar,
  Button,
  Card,
  CardLabel,
  CardTitle,
  ChipGroup,
  ConfirmSheet,
  EmptyState,
  ErrorState,
  Field,
  IconTile,
  InlineLoading,
  ListGroup,
  ListRow,
  LoadingRows,
  MoneyText,
  OfflineNote,
  Pill,
  Rail,
  RailWithValue,
  Segmented,
  SegmentedPanel,
  Sheet,
  Sidebar,
  Slider,
  StatusPill,
  Switch,
  Table,
  useAnnounce,
} from '@/ui'
import { naira } from '@mizaniya/core/money/money'
import type { NavItem } from '@/ui'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-12">
      <CardLabel>{title}</CardLabel>
      <Card className="flex flex-col gap-16">{children}</Card>
    </section>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-12">{children}</div>
}

const dot = (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
    <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8" fill="none" />
  </svg>
)

function SaveDemo() {
  const { announce } = useAnnounce()
  return (
    <Row>
      <Button
        onClick={() =>
          announce({
            toast: 'Saved.',
            spoken: 'Saved. Safe to spend today, 7,500 naira.',
          })
        }
      >
        Save (toast + live region)
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          announce({
            toast: "Couldn't save that.",
            spoken: "Couldn't save that. Your entry is still here.",
            tone: 'alert',
          })
        }
      >
        Failed save
      </Button>
    </Row>
  )
}

export function PrimitivesPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [amount, setAmount] = useState('7,500')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [protectedOn, setProtectedOn] = useState(true)
  const [amber, setAmber] = useState(60)
  const [tab, setTab] = useState('debts')
  const [category, setCategory] = useState<string | undefined>('food')
  const [nav, setNav] = useState('home')

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const items: NavItem[] = [
    { key: 'home', label: 'Home', icon: dot, onSelect: () => setNav('home') },
    { key: 'plan', label: 'Plan', icon: dot, onSelect: () => setNav('plan') },
    { key: 'debts', label: 'Debts', icon: dot, onSelect: () => setNav('debts') },
    { key: 'more', label: 'More', icon: dot, onSelect: () => setNav('more') },
  ]

  return (
    <AnnounceProvider>
      <div className="flex min-h-screen">
        <Sidebar items={items} activeKey={nav} onAdd={() => setSheetOpen(true)} />

        <main className="mx-auto flex w-full max-w-[720px] flex-col gap-26 p-16 pb-[120px]">
          <header className="flex items-center justify-between gap-16">
            <div>
              <h1 className="font-voice text-title text-ink">Primitives</h1>
              <p className="text-small text-soft">
                Every component, every state, both themes.
              </p>
            </div>
            <Button variant="secondary" onClick={toggleTheme}>
              {theme === 'light' ? 'Dark' : 'Light'}
            </Button>
          </header>

          <Section title="Money">
            <Row>
              <MoneyText amount={naira(7_500)} className="text-hero" />
            </Row>
            <Row>
              <MoneyText amount={naira(220_000)} />
              <MoneyText amount={naira(2_300)} over tone="danger" />
              <MoneyText amount={naira(8_666)} tone="muted" />
              <MoneyText amount={naira(75_000)} face="data" tone="positive" />
            </Row>
            <p className="text-small text-faint">
              Kobo is 0.60 of the naira size and lighter. A non-zero kobo is never
              hidden, and direction is a word — never a minus sign.
            </p>
          </Section>

          <Section title="Buttons">
            <Row>
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="quiet">Quiet</Button>
            </Row>
            <Row>
              <Button disabled>Disabled</Button>
              <Button loading>Saving</Button>
              <Button disabled>Disabled (no lift)</Button>
            </Row>
            <p className="text-small text-faint">
              There is no danger variant. Deleting is an ordinary action; the
              danger colour is reserved for money going wrong.
            </p>
          </Section>

          <Section title="Fields">
            <Field label="Counterparty" placeholder="Who is this with?" />
            <Field label="Note" helper="Optional." placeholder="Market" />
            <Field label="Amount" error="Enter an amount." defaultValue="" />
            <Field label="Locked" disabled defaultValue="Cannot change" />
            <AmountInput label="Amount" value={amount} onValueChange={setAmount} />
          </Section>

          <Section title="Status">
            <Row>
              <StatusPill status="onTrack" />
              <StatusPill status="low" />
              <StatusPill status="short" />
              <StatusPill status="overdue" />
              <StatusPill status="overspent" />
            </Row>
            <Row>
              <Pill tone="neutral">Expense</Pill>
              <Pill tone="neutral">I repaid</Pill>
              <Pill tone="quiet">Archived</Pill>
              <IconTile tone="positive">{dot}</IconTile>
              <IconTile tone="warning">{dot}</IconTile>
            </Row>
          </Section>

          <Section title="Rails">
            <RailWithValue value={0.39} label="food and groceries" />
            <RailWithValue value={0.85} tone="warning" label="transport, data and airtime" />
            <RailWithValue value={1.4} tone="danger" label="health" />
            <Rail value={0.53} tone="neutral" label="rent fund" />
          </Section>

          <Section title="Rows">
            <ListGroup label="Categories">
              <ListRow
                leading={<IconTile tone="danger">{dot}</IconTile>}
                title="Health"
                sub="140% of ₦10,000.00"
                trailing={<MoneyText amount={naira(14_000)} tone="danger" />}
                footer={<Rail value={1.4} tone="danger" label="health" />}
                onClick={() => undefined}
              />
              <ListRow
                leading={<IconTile tone="warning">{dot}</IconTile>}
                title="Transport, data and airtime"
                sub="85% of ₦45,000.00"
                trailing={<MoneyText amount={naira(38_250)} />}
                footer={<Rail value={0.85} tone="warning" label="transport" />}
                onClick={() => undefined}
              />
              <ListRow
                title="Sadaqah"
                sub="Nothing spent yet"
                trailing={<MoneyText amount={naira(0)} tone="muted" />}
                disabled
                onClick={() => undefined}
              />
            </ListGroup>
          </Section>

          <Section title="Async states">
            <LoadingRows rows={2} />
            <EmptyState
              title="Nothing recorded this cycle yet."
              body="Add your first movement and everything updates."
              action={{ label: 'Add', onClick: () => setSheetOpen(true) }}
            />
            <ErrorState
              title="Couldn't open your data."
              body="This is usually temporary."
              onRetry={() => undefined}
            />
            <InlineLoading />
          </Section>

          <Section title="Banners">
            <OfflineNote onDismiss={() => undefined} />
            <Banner tone="action" action={{ label: 'Finish', onClick: () => undefined }}>
              <span className="text-small">
                <MoneyText amount={naira(50_000)} /> unallocated — finish your plan
              </span>
            </Banner>
            <Banner tone="danger">
              <span className="text-small">
                <MoneyText amount={naira(20_000)} /> over your take-home.
              </span>
            </Banner>
          </Section>

          <Section title="Controls">
            <Switch
              checked={protectedOn}
              onCheckedChange={setProtectedOn}
              label="Protect from safe to spend"
              helper="Money planned here will not count as spendable."
            />
            <Slider
              value={amber}
              onValueChange={setAmber}
              min={30}
              max={90}
              step={5}
              label="Amber threshold"
              readout={
                <>
                  Amber below <MoneyText amount={naira(Math.round(8_666 * (amber / 100)))} /> a day
                </>
              }
            />
            <ChipGroup
              label="Category"
              value={category}
              onValueChange={setCategory}
              options={[
                { value: 'food', label: 'Food' },
                { value: 'transport', label: 'Transport' },
                { value: 'family', label: 'Family' },
              ]}
            />
            <Segmented
              value={tab}
              onValueChange={setTab}
              label="Debts and goals"
              options={[
                { value: 'debts', label: 'Debts' },
                { value: 'goals', label: 'Goals' },
              ]}
            >
              <SegmentedPanel value="debts">
                <p className="text-small text-soft">Debts in both directions.</p>
              </SegmentedPanel>
              <SegmentedPanel value="goals">
                <p className="text-small text-soft">Targets, with a projected gap.</p>
              </SegmentedPanel>
            </Segmented>
          </Section>

          <Section title="Table">
            <Table
              caption="Completed cycles"
              rowKey={(row) => row.cycle}
              columns={[
                { key: 'cycle', header: 'Cycle', render: (row) => row.cycle },
                {
                  key: 'income',
                  header: 'Income',
                  align: 'right',
                  render: (row) => <MoneyText amount={row.income} face="data" />,
                },
                {
                  key: 'spent',
                  header: 'Spent',
                  align: 'right',
                  render: (row) => <MoneyText amount={row.spent} face="data" />,
                },
                {
                  key: 'ended',
                  header: 'Ended with',
                  align: 'right',
                  render: (row) => <MoneyText amount={row.ended} face="data" />,
                },
              ]}
              rows={[
                {
                  cycle: '25 Aug – 24 Sep',
                  income: naira(450_000),
                  spent: naira(355_000),
                  ended: naira(0),
                },
              ]}
            />
          </Section>

          <Section title="Overlays and announcements">
            <Row>
              <Button variant="secondary" onClick={() => setSheetOpen(true)}>
                Open sheet
              </Button>
              <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
                Confirm
              </Button>
            </Row>
            <SaveDemo />
          </Section>

          <CardTitle className="sr-only">End of gallery</CardTitle>
        </main>
      </div>

      <Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Add"
        footer={
          <Button fullWidth onClick={() => setSheetOpen(false)}>
            Save
          </Button>
        }
      >
        <div className="flex flex-col gap-16">
          <AmountInput label="Amount" value={amount} onValueChange={setAmount} />
          <ChipGroup
            label="Category"
            value={category}
            onValueChange={setCategory}
            options={[
              { value: 'food', label: 'Food' },
              { value: 'transport', label: 'Transport' },
              { value: 'family', label: 'Family' },
            ]}
          />
        </div>
      </Sheet>

      <ConfirmSheet
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this ₦3,500.00 expense?"
        body="This can't be undone."
        confirmLabel="Delete"
        onConfirm={() => setConfirmOpen(false)}
      />

      <BottomBar items={items} activeKey={nav} onAdd={() => setSheetOpen(true)} />
    </AnnounceProvider>
  )
}
