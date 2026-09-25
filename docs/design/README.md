# `docs/design/`

The design stop for Mizaniya, produced 10 September 2026 from
`docs/06-page-specs.md` at commit `6bd2291` and `docs/design/DESIGN-BRIEF.md`.

67 artboards over eleven pages — every screen at 360 **and** 1440, light **and**
dark. Merged 10 September (PR #7); brand files and a corrected primitives sheet added 22 September.

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

### Before you build a screen

Read **`docs/open-items.md`**. It lists what the design has
that the code does not yet — fonts, the brand files, the welcome screen, the
Tabs primitive — and which ticket each belongs to.

**The brand files are in `brand/`** and are ready to copy: favicon, PWA icons,
Apple touch icon, the mark as an SVG, and the wordmarks with their letters
outlined. `brand/README.md` says where each one goes.


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

**Re-cut 25 September: one screen, one artboard.** A board used to be able to hold six
onboarding steps, or sign-up beside sign-in, or five states of Home in a row. That reads
fine flipping through and is useless for review — you cannot point at "the sign-in
screen" if sign-in is the right-hand half of a board called Auth. So every file below is
one screen, and its name says which.

**181 artboards across 12 pages.** File names are `NN-what-it-is-WIDTH-theme.png`,
numbered in flow order, and the same stem names the `.dc.html` beside it in `canvas/`.

| Page | Files | What is on it |
|---|---|---|
| 1 · Landing page | `11-landing-*` | 1440 and 390, the pointer states, the strongest moment (item 34) and the demo marker (item 33). |
| 2 · Web 1440 · Getting in | `01-*` … `06-*` | Welcome · the six onboarding steps, **one board each** · sign up · sign up with the address already taken · sign in · forgot password · check your email · set a new password. **These are web screens.** In v1 the web app is the only place to sign up; the Expo mobile app is v2 and is not drawn. |
| 3 · Web 1440 · Home | `07-home-*` | Home, then amber, over, no plan, a plan with no movements, offline — each its own board, because each has its own fix. |
| 4 · Web 1440 · The month's money | `08-*` … `14-*` | Plan · Transactions and both empty states · Quick Add · Debts and Goals (no tabs at this width) · add a debt · add a goal · the debt record · Months · Zakat. |
| 5 · Web 1440 · Account, sync, household | `15-*` … `18a-*` | Settings · Settings signed out · what an account adds, free and lapsed · the reconciliation queue, the duplicate case and the empty state · the household disagreement, both cases. **No padlock anywhere** — item 24, and `build_boards.py` fails if the word appears. |
| 6 · Phone browser 360 · Getting in | `01-*-360-*`, `02-*-360-*` | The same web app at 360: welcome, six onboarding steps, and the three pickers steps 2 and 3 refer to. |
| 7 · Phone browser 360 · Home | `07-*-360-*` | Home, this cycle, four states, offline, and the More sheet — which is 360-only, because at 1440 everything in it is a sidebar item. |
| 8 · Phone browser 360 · The month's money | `08-*-360-*` … `14-*-360-*` | Plan and its row menu · Transactions and both empty states · Quick Add, record and edit · Debts · Goals · the two forms · the debt record · Months empty and populated · Zakat. |
| 9 · Phone browser 360 · Settings and data | `15-*-360-*`, `19-*` | Settings, and the three-stage import flow — spec §7.9, the most dangerous action in the app. |
| 10 · Mark | `00-cover-*`, `00-logo-*` | The contents page, and the mark: construction grid, sizes 48→16, app icon, favicon, wordmark lockups, and the three misuses. |
| 11 · Foundations | `00-primitives-*`, `00-style-*`, `05a-debt-record-print.png` | Every component in every state, the palette and type tile, and the printed record: A4, black and white, no app chrome. |

| Also here | What it is |
|---|---|
| `brand/` | **Production files for the mark** — favicon (`.svg` + `.ico`), PWA icons 192/512 in `any` and `maskable`, Apple touch icon, `mark.svg` (currentColor), and the wordmarks with letters outlined so the app never loads Amiri. See `brand/README.md`. |
| `tokens.md` | The complete token set, light and dark. 54 gated contrast pairs, 0 failures. §3.2 covers a figure set inside a line of the voice face. |
| `motion.md` | What moves and what does not. §0: nothing animates on the path to a figure. |
| `image-brief.md` | The two photographs the landing page specifies and does not contain — dimensions, budget, search terms, reject list, licences. |

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
from `seed-data.md` or the spec.

## Stale figures found while reading — all fixed

The design stop found four stale figures in the specs: the planned daily allowance
written as ₦8,666.67 in three files, and a bare minus sign in spec §3. All four were
corrected on 10 September, and spec §3a now carries the rounding rule that explains
them. The allowance is **₦8,666.66** everywhere.
