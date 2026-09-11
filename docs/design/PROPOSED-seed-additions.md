# Proposed additions to `docs/seed-data.md`

> **MERGED on 10 September 2026.** Sections 3, 4 and the pre-cycle movements are
> now in `docs/seed-data.md`, which is the only source of figures (repo rule 2).
> **Do not read figures from this file** — it is kept because §2 records *why*
> the overspent row is Health rather than Food, and that reasoning is not
> obvious from the numbers alone. §7's stale figures are corrected.

**Not committed, and not yet part of seed-data.** This is the figure set the
design stop needed and `seed-data.md` did not yet carry. It is here for review;
if you accept it, it belongs in `docs/seed-data.md` under "Adding to this file",
and the design PNGs already match it.

Every figure is **invented** (repo rule 2). Every figure is **derived from
figures already in `seed-data.md`** — nothing new is introduced at the top
level. Cash left, safe-to-spend, the hero and every tile are unchanged.

---

## 1 · Why this was needed

`seed-data.md` gives the worked day's expense spend as a single aggregate —
**₦110,000 across expense categories** — and lists the individual movements as a
known gap:

> "Later phases will need figures this file does not yet carry — the individual
> transactions that make up the ₦110,000 spent, spread across categories and
> dates so the Transactions screen and its filters have something real to show."

The Home category table and the Transactions list both need that split. It is
invented here once, consistently, rather than at the point of use.

## 2 · A conflict this resolves

`DESIGN-BRIEF.md` §3 asks for **Food & groceries** to be the *Overspent* row and
**Transport, data and airtime** to be at *85%*. Those two cannot both hold
inside ₦110,000:

- Food's allowance is **₦102,000.00** (₦90,000 planned + ₦12,000 carried in), so
  overspending it needs **more than ₦102,000.00**.
- Transport at 85% of ₦45,000.00 adds **₦38,250.00**.
- That is **₦140,250.00** before any of the other six categories — already
  ₦30,250 past the whole cycle's expense spend.

Honouring the brief literally would push expense spend to roughly ₦200,000,
which moves cash left off ₦220,000.00 and the hero off ₦7,500.00 — the two
figures the entire design is built to make trustworthy.

**Resolution, agreed before drawing:** the *Overspent* row moves to **Health**,
and Transport keeps its briefed 85% *Low*. Every load-bearing figure survives
untouched. Health is a plausible carrier — a clinic visit is exactly the kind of
non-discretionary expense the protection override in spec §7.3 was written for.

---

## 3 · The category split — worked day, 5 October, day 11 of 30

Sorted worst-first, as Home sorts it.

| Category | Spent | Allowance | % | Badge |
|---|---:|---:|---:|---|
| Health | ₦14,000.00 | ₦10,000.00 | 140% | **Overspent** |
| Transport, data and airtime | ₦38,250.00 | ₦45,000.00 | 85% | **Low** |
| Food and groceries *(+₦12,000 carried)* | ₦40,000.00 | ₦102,000.00 | 39% | — |
| Utilities | ₦4,750.00 | ₦18,000.00 | 26% | — |
| Miscellaneous | ₦5,000.00 | ₦22,000.00 | 23% | — |
| Family support | ₦8,000.00 | ₦40,000.00 | 20% | — |
| Apartment setup | ₦0.00 | ₦25,000.00 | 0% | — |
| Sadaqah | ₦0.00 | ₦10,000.00 | 0% | — |
| **Total** | **₦110,000.00** | | | |

Verified: the rows sum to exactly ₦110,000.00, so cash left is
450,000 − 110,000 − 90,000 − 30,000 = **₦220,000.00**, safe to spend is
220,000 − 70,000 = **₦150,000.00**, and ₦150,000.00 ÷ 20 = **₦7,500.00**.
Unchanged from `seed-data.md`.

---

## 4 · The individual movements — 25 September to 5 October

23 movements. The four non-expense movements are the ones `seed-data.md`
already names; the 19 expenses are the split above, spread across the days.

| # | Date | Type | Category / counterparty | Note | Amount |
|:-:|---|---|---|---|---:|
| 1 | Fri 25 Sep | Income | — | Salary | ₦450,000.00 |
| 2 | Fri 25 Sep | Move to savings | Rent fund → Bank vault | | ₦75,000.00 |
| 3 | Fri 25 Sep | Move to savings | Emergency fund → PiggyVest | | ₦15,000.00 |
| 4 | Fri 25 Sep | I repaid | A. Friend | Monthly repayment | ₦30,000.00 |
| 5 | Fri 25 Sep | Expense | Food and groceries | Month's foodstuff | ₦12,500.00 |
| 6 | Fri 25 Sep | Expense | Transport, data and airtime | Data bundle and airtime | ₦8,000.00 |
| 7 | Sat 26 Sep | Expense | Food and groceries | Market | ₦3,200.00 |
| 8 | Sat 26 Sep | Expense | Transport, data and airtime | Fuel | ₦2,500.00 |
| 9 | Mon 28 Sep | Expense | Utilities | Electricity units | ₦4,750.00 |
| 10 | Mon 28 Sep | Expense | Transport, data and airtime | Fuel | ₦3,000.00 |
| 11 | Tue 29 Sep | Expense | Food and groceries | Market | ₦5,400.00 |
| 12 | Tue 29 Sep | Expense | Family support | Monthly support | ₦8,000.00 |
| 13 | Wed 30 Sep | Expense | Transport, data and airtime | Fuel | ₦4,250.00 |
| 14 | Wed 30 Sep | Expense | Miscellaneous | Barber | ₦2,000.00 |
| 15 | Thu 1 Oct | Expense | Health | Clinic visit and prescription | ₦14,000.00 |
| 16 | Thu 1 Oct | Expense | Food and groceries | Market | ₦4,800.00 |
| 17 | Fri 2 Oct | Expense | Transport, data and airtime | Fuel and transport | ₦6,500.00 |
| 18 | Fri 2 Oct | Expense | Food and groceries | Groceries | ₦6,100.00 |
| 19 | Sat 3 Oct | Expense | Food and groceries | Market | ₦5,000.00 |
| 20 | Sat 3 Oct | Expense | Miscellaneous | Household items | ₦3,000.00 |
| 21 | Sun 4 Oct | Expense | Transport, data and airtime | Fuel | ₦7,000.00 |
| 22 | Sun 4 Oct | Expense | Food and groceries | Bread and provisions | ₦3,000.00 |
| 23 | Mon 5 Oct | Expense | Transport, data and airtime | Fuel | ₦7,000.00 |

**Movement 15 is the one that matters.** ₦14,000.00 against a ₦10,000.00 health
allowance is what puts the *Overspent* badge on the screen, and it is the kind of
expense a person does not choose to have.

### Pre-cycle movements (dated 24 September, the day before the cycle)

Per spec §7.1 step 4 and §7.6, opening balances are dated opening transactions,
never stored totals.

| Date | Type | Counterparty / category | Amount |
|---|---|---|---:|
| Thu 24 Sep | Move to savings | Rent fund → Bank vault | ₦400,000.00 |
| Thu 24 Sep | I borrowed | A. Friend | ₦120,000.00 |
| Thu 24 Sep | I borrowed | Spouse | ₦60,000.00 |
| Thu 24 Sep | I lent | B. Colleague | ₦40,000.00 |

These sit outside the cycle, so they do not appear in the default Transactions
view and do not affect any tile — which is exactly the failure spec §7.1 warns
about ("Home's Saved tile would read ₦490,000.00 instead of ₦90,000.00").

---

## 5 · The eight movement labels, and why only four appear

Only four of the eight types occur in the worked cycle: **Income · Expense ·
Move to savings · I repaid**. Adding the other four would change money that is
already settled — a *They repaid me* is cash in, which would move cash left off
₦220,000.00.

So the Transactions screen shows the four that are real, and all eight labels
appear where they genuinely belong: **in the type filter**, drawn open on
`04-transactions-360.png`, and on the primitives sheet. No figure is invented to
demonstrate a label.

---

## 6 · The populated Months row

`seed-data.md` has no completed cycle, and the brief says so — Months is drawn as
its empty state. The one populated row needed for the primitives sheet uses the
**running cycle's own figures**, labelled by its start date, so no figure is
invented for it either:

| Cycle | Income | Spent | Saved | Debt paid | Ended with |
|---|---:|---:|---:|---:|---:|
| 25 Sep – 24 Oct | ₦450,000.00 | ₦110,000.00 | ₦90,000.00 | ₦30,000.00 | ₦220,000.00 |

---

## 7 · Three stale figures found while reading

Not part of this proposal — flagged for a separate correction pass.

| Where | Says | Should say | Why |
|---|---|---|---|
| `seed-data.md`, "The seeded plan" | Planned daily allowance **₦8,666.67** | **₦8,666.66** | Spec §3a: money you may spend rounds **down**. ₦260,000 ÷ 30 floors to 8,666.66 |
| `docs/06-page-specs.md` §7.3, numbers table | Planned daily allowance **₦8,666.67** | **₦8,666.66** | Same rule. §3a is authoritative and the brief withdraws the earlier assumption |
| `DESIGN-BRIEF.md` §3, Plan row | footnote **₦8,666.67** | **₦8,666.66** | The brief's own §3a paragraph already corrects this ("is therefore ₦8,666.66, not ₦8,666.67") |

A fourth, smaller one: spec §3's accessibility table displays `−₦2,300.00` while
§8 states a bare minus sign is **never shown**. The designs follow §8 and the
brief — the red hero reads **₦2,300.00 over**.

The designs use **₦8,666.66** throughout, and the amber threshold stays at
**₦5,200.00** as the brief states it directly.
