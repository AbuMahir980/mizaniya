import type { ReactNode } from 'react'
import { Icon } from '@/ui/icon'
import { Rail } from '@/ui/rail'

/**
 * The four cards inside *The rest of it* — one from each screen the page does
 * not otherwise show.
 *
 * They are **replicas, not screenshots**, because that is how the canvas draws
 * them: a 340px card scaled down inside its panel, not a crop of a board. The
 * hero is the other way round, and the rule that decides is `CLAUDE.md` §7·4 —
 * a whole *screen* inside a screen is the board's PNG; a single card is drawn.
 *
 * Every figure is a literal from `docs/seed-data.md`.
 */
export function TransactionsCard() {
  return (
    <Replica>
      <p className="flex items-baseline justify-between gap-10 font-structural text-lab uppercase text-soft">
        <span>Thu 1 Oct</span>
        <span>₦18,800.00 spent</span>
      </p>
      <Movement name="Health" what="Clinic visit and prescription · Spent" amount="₦14,000" />
      <Movement name="Food and groceries" what="Market · Spent" amount="₦4,800" />
    </Replica>
  )
}

export function DebtCard() {
  return (
    <Replica>
      <div className="flex items-start gap-12">
        <Tile />
        <div className="min-w-0 flex-1">
          <p className="font-structural text-land-label font-semibold text-ink">A. Friend</p>
          <p className="mt-4 font-structural text-land-fine text-soft">
            ₦30,000.00 a month · clears in 3 paydays
          </p>
        </div>
        <div className="text-right">
          <p className="font-data text-land-answer font-semibold tracking-[-0.012em] text-ink">
            ₦90,000<span className="text-land-micro font-medium opacity-60">.00</span>
          </p>
          <p className="mt-4 font-structural text-lab uppercase text-soft">you owe</p>
        </div>
      </div>
      <div className="mt-14">
        <Rail value={0.25} label="Repaid so far" tone="neutral" />
      </div>
      <p className="mt-10 font-structural text-land-fine text-soft">
        Last movement: I repaid ₦30,000.00 · 25 Sep
      </p>
    </Replica>
  )
}

/**
 * The printed record, which is the one surface that does not theme: white on
 * both boards, because a document either party can hold does not change colour
 * with the reader's system setting. Its colours are the `paper` tokens.
 */
export function RecordCard() {
  return (
    <div className="w-[340px] rounded-sm border border-paperLine bg-paper px-20 pb-22 pt-20 text-paperInk shadow-card">
      <p className="font-structural text-lab uppercase tracking-[0.13em] text-paperSoft">
        Debt record
      </p>
      <p className="mt-4 font-voice text-land-h3 text-paperInk">Spouse</p>

      <p className="mt-14 flex items-baseline gap-12 border-t border-paperHair pt-12 font-structural text-land-detail">
        <span className="flex-1">Borrowed 8 March 2026</span>
        <span className="font-data">₦150,000.00</span>
      </p>
      <p className="flex items-baseline gap-12 pt-8 font-structural text-land-detail text-paperSoft">
        <span className="flex-1">Repaid before this record</span>
        <span className="font-data">₦90,000.00</span>
      </p>
      <p className="mt-12 flex items-baseline gap-12 border-t border-paperHair pt-12 font-structural text-land-detail font-semibold">
        <span className="flex-1">Outstanding</span>
        <span className="font-data text-land-label">₦60,000.00</span>
      </p>

      <p className="mt-14 font-structural text-land-kicker leading-[17px] text-paperSoft">
        The ₦90,000.00 above was <b>stated by the owner</b>, not witnessed by Mizaniya. Everything
        else was recorded on the date shown.
      </p>
    </div>
  )
}

export function ZakatCard() {
  return (
    <Replica>
      <p className="font-structural text-lab uppercase text-soft">Zakat</p>
      <p className="mt-8 font-voice text-land-h3 leading-[27px] text-ink">
        Below the nisab. Nothing is due.
      </p>
      <ZakatRow label="Zakatable savings" amount="₦490,000" ruled />
      <ZakatRow label="Nisab, fetched 5 Oct" amount="₦2,450,000" />
      <p className="mt-12 font-structural text-land-fine leading-[18px] text-soft">
        Money owed to you is not counted. Check the nisab yourself — it moves.
      </p>
    </Replica>
  )
}

/** The 340px card every replica is drawn inside. */
function Replica({ children }: { children: ReactNode }) {
  return (
    <div className="w-[340px] rounded-xl border border-line bg-card p-18 shadow-card">
      {children}
    </div>
  )
}

function Movement({ name, what, amount }: { name: string; what: string; amount: string }) {
  return (
    <div className="flex items-start gap-12 border-b border-hair py-12 last:border-b-0">
      <Tile />
      <div className="min-w-0 flex-1">
        <p className="font-structural text-land-label font-semibold text-ink">{name}</p>
        <p className="mt-2 font-structural text-land-fine text-soft">{what}</p>
      </div>
      <p className="font-data text-land-label font-semibold tracking-[-0.012em] text-ink">
        {amount}
        <span className="text-land-micro font-medium opacity-60">.00</span>
      </p>
    </div>
  )
}

function ZakatRow({ label, amount, ruled }: { label: string; amount: string; ruled?: boolean }) {
  return (
    <p
      className={`flex items-baseline gap-10 ${ruled === true ? 'mt-14 border-t border-hair pt-12' : 'mt-8'}`}
    >
      <span className="flex-1 font-data text-mlab uppercase text-soft">{label}</span>
      <span className="font-data text-land-answer font-semibold tracking-[-0.012em] text-ink">
        {amount}
        <span className="text-land-fine font-medium opacity-60">.00</span>
      </span>
    </p>
  )
}

/** The icon tile the app puts beside a row. */
function Tile() {
  return (
    <span className="flex h-38 w-38 shrink-0 items-center justify-center rounded-xl bg-sl2 text-slate">
      <Icon name="trend" size={18} />
    </span>
  )
}
