# `docs/design/`

The design stop for Mizaniya, produced 10 September 2026 from
`docs/06-page-specs.md` at commit `6bd2291` and `docs/design/DESIGN-BRIEF.md`.

67 artboards over eleven pages — every screen at 360 **and** 1440, light **and**
dark. Nothing is committed; review and commit yourself.

## If you are the build agent, read this and stop

Four things, in this order. Do not read the PNGs — they carry no information the
source does not, and they cost far more to look at than to read.

1. **`tokens.md`** — every value, light and dark, with its measured contrast. This is
   the authority. Where anything here disagrees with it, it wins.
2. **`canvas/PrimLight.dc.html`** and **`canvas/PrimDark.dc.html`** — the primitives:
   every component in every state, as real markup, with the rules that cannot be drawn
   written beside each group. `src/ui/` is built from these two files and `tokens.md`.
3. **`canvas/<Screen>.dc.html`** — the screen you are building, and only that one. The
   table below maps names to screens.
4. **`../06-page-specs.md`** — what the screen *does*. The design says how it looks;
   the spec says how it behaves, and the spec wins on behaviour.

Read the markup, do not copy it. These artboards are static: no state, no ARIA, no
components. They are the reference for values, order, spacing and copy.

### Two things the owner has not settled — do not resolve them yourself

**1 · The planned daily allowance is ₦8,666.66, not ₦8,666.67.**
`docs/06-page-specs.md` §3a is authoritative and *floors* spendable figures.
Two files still carry the old rounded-up value and have **not** been corrected:

| File | Says | Should say |
|---|---|---|
| `docs/seed-data.md` | ₦8,666.67 | **₦8,666.66** |
| `docs/06-page-specs.md` §7.3 | ₦8,666.67 | **₦8,666.66** |

Every design uses ₦8,666.66. If you meet ₦8,666.67 while building, it is the
stale value — do not propagate it, and do not silently rewrite those two files
either. Flag it and let the owner decide.

Related: spec §3 shows `−₦2,300.00` in its accessibility table while §8 says a
bare minus sign is never shown. The designs follow §8 — direction is a word
("over", "owed to you"), never a sign. §8 wins.

**2 · `PROPOSED-seed-additions.md` is a proposal, not data.**
The designs needed figures `seed-data.md` does not carry — 23 movements with a
per-category split. They are written up in that file and are **not** in
`seed-data.md`. The owner reviews them first. Until he does, treat
`seed-data.md` as the only seed source and take anything extra from the
proposal file *by reading it*, never by copying it into seed-data.

Everything else in this folder is settled and safe to build from.


## Two copies, not three

| | What it is | Who it is for |
|---|---|---|
| `canvas/` | The design **as code** — one `.dc.html` per artboard plus `canvas.json`. Text, diffable, opens in a browser on double-click, and re-seeds the Claude Design canvas in one command. | The build agent, and anyone changing a design or reviewing a diff. |
| `*.png` | Rendered previews at 2×. | You — reading the designs on GitHub, in a PR, or on a phone. |

There is no third copy: a `.dc.html` file renders in a plain browser exactly as its
PNG shows, so a separate "standalone HTML" folder would only have been the same files
with one wrapper removed.

## The mark

Mizaniya (ميزانية, "budget") comes from *mizan* (ميزان) — a set of scales. The
mark is one, drawn a notch off level, because the app exists to say whether today
is in balance and most days it is not quite. Locked at your pick; the meem
monogram and the balance bar are retired. It carries the app icon, the favicon,
the sidebar lockup, the welcome screen and the letterhead on the printed debt
record. Latin is EB Garamond 600, Arabic is Amiri, and the Arabic is always
secondary — under the Latin, never above it, and never carrying a figure.

## What is here

| File | What it shows |
|---|---|
| `00-cover-{light,dark}.png` | The contents page — every page, the settled figures, the rules that never bend. |
| `00-logo-{light,dark}.png` | The mark: construction grid, sizes 48→16, app icon, favicon, wordmark lockups, and the three misuses. |
| `00-style-{light,dark}.png` | Palette, type and status pills. |
| `00-primitives-{light,dark}.png` | **Every component in every state** — default, hover, focus, pressed, disabled, loading, error, empty — plus the focus-ring, touch-target, radius, spacing and type scales. |
| `01-welcome-{360,1440}-{light,dark}.png` | Launch, then the welcome screen before onboarding step 1. |
| `01-onboarding-{360,1440}-{light,dark}.png` | All six steps at both widths. Step 2 is the only required one. At 1440 it is the same 620px card centred in an empty frame — one component, one breakpoint. |
| `02-home-{360,1440}-{light,dark}.png` | Home, plus `-cycle` mid-cycle. |
| `02-home-{360,1440}-states-{light,dark}.png` | Every state at **both** widths: amber, red, no plan, empty, offline. |
| `02a-more-sheet-360-{light,dark}.png` | The More sheet over Home. |
| `03-plan-{360,1440}-{light,dark}.png` | Envelopes and the row menu. |
| `04-transactions-{360,1440}-{light,dark}.png` | The ledger, grouped by day, plus both empty states (nothing recorded / nothing matches the filters) at both widths. |
| `04a-quick-add-{360,1440}-{light,dark}.png` | Sheet, full screen, record and edit, desktop dialog. |
| `05-debts-goals-{360,1440}-{light,dark}.png` | Both tabs at both widths — debts in both directions, and goals. |
| `05a-debt-record-{360,1440}-{light,dark}.png` | The on-screen debt record. |
| `05a-debt-record-print.png` | The printed record: A4, black and white, no app chrome. |
| `05b-forms-{360,1440}-{light,dark}.png` | Add a debt, add a goal. At 1440 the sheet becomes a 520px dialog over Debts & Goals — the page it was opened from. |
| `06-months-{360,1440}-{light,dark}.png` | Closed cycles and what carried over, empty and populated, at both widths. |
| `07-settings-{360,1440}-{light,dark}.png` | Settings. |
| `07a-zakat-{360,1440}-{light,dark}.png` | The estimate, its workings, and its caveat. |
| `07b-import-360-{light,dark}.png` | The three-stage import flow. |
| `tokens.md` | The complete token set, light and dark. 54 gated contrast pairs, 0 failures. |
| `PROPOSED-seed-additions.md` | Figures the design needed that `seed-data.md` does not carry. **Not** committed to seed-data; review first. |

## The direction

Warm paper in light, near-black in dark — one design language across both.
EB Garamond for voice, Inter for structure, JetBrains Mono for data. Four
meaning-bearing hues on a neutral ramp. Three diagrams do the work that stat
tiles used to: an arc gauge for the headline figure, a daily-spend chart against
the planned allowance, and a segmented breakdown of where the cycle's money is.

`DESIGN-BRIEF.md` §2 was **rewritten in place on 10 September** to describe this direction; §6 and §7 now match what was delivered. `tokens.md` §0 remains the authority where the two disagree.

## What did not change

Every amount carries its kobo. Money is tabular and right-aligned, the naira sign
is part of the figure, and no bare minus sign is ever shown. Spendable figures
round down, obligations round up — the planned daily allowance is **₦8,666.66**.
Red means money going wrong and nothing else. Every figure on every screen comes
from `seed-data.md`, the spec, or the proposal file above.

## Three stale figures found while reading

| Where | Says | Should say |
|---|---|---|
| `seed-data.md` | Planned daily allowance ₦8,666.67 | **₦8,666.66** |
| `06-page-specs.md` §7.3 | Planned daily allowance ₦8,666.67 | **₦8,666.66** |
| `DESIGN-BRIEF.md` §3 | footnote ₦8,666.67 | **₦8,666.66** |

Spec §3a is authoritative and floors it. A fourth: spec §3's accessibility table
displays `−₦2,300.00`, while §8 says a bare minus sign is never shown. The
designs follow §8.
