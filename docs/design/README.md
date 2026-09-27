# `docs/design/`

The design stop for Mizaniya, produced 10 September 2026 from
`docs/06-page-specs.md` at commit `6bd2291` and `docs/design/DESIGN-BRIEF.md`.

**219 artboards over seventeen pages**, as of 27 September — every screen at 360
**and** 1440, light **and** dark, the two widths of one screen on the same row,
and **one page per screen**.

> ### Two canvases, because the editor caps one at 200 files
>
> Plan's three new screens took the count past it. The seeding tool is explicit:
> **the editor loads at most 200 file entries and silently drops the rest**, and
> the first Save then republishes without them. A canvas that quietly loses
> boards is worse than a canvas that is split.
>
> | | Pages | Files | Manifest |
> |---|---|---|---|
> | **The app** — the canvas under review | 3–15 | **191 of 200** | `canvas/canvas.json` |
> | **Front and foundations** | 1–2, 16–17 | 30 | `canvas/canvas-front.json` |
>
> The cut follows a seam that was already there: the landing page and the
> security page are the front door, the mark and the primitives are the
> materials both are built from, and all four are read rather than re-cut most
> weeks. Everything between them is the app — reviewed daily, and still owed sync
> states, the household invite and the bank-linking flow.
>
> **`docs/design/` is not split.** Every board and every preview is in one place;
> which canvas a board is published on is a fact about the editor, not about the
> design. `layout.py` asserts the cap, so the next overflow fails the build
> instead of losing eight boards. Merged
10 September (PR #7); rebuilt many times since, most heavily in the landing-page
and 1440 rework of 25–26 September.

> ### ⚠ Three spec lines are currently wrong
>
> The owner overruled `03-system-spec.md` §B1 and two rows of `06-page-specs.md`
> on 26 September: **with no plan there is no hero figure.** Each line is flagged
> at the line itself; `docs/open-items.md` **§N** is the list.

## If you are the build agent, read this and stop

Five things, in this order.

> **This list used to open with “do not read the PNGs — they carry no information
> the source does not.”** That was meant as *take values from the markup rather
> than eyeballing pixels*, and it was read as licence never to open the screens.
> **Every rebuilt screen paid for it**, which is why `CLAUDE.md` now says the
> opposite outright. **Open the PNG first.** It is the only place you see the
> screen as a screen — what sits beside what, what is missing, and the board note
> printed under it, which carries the decision and the argument for it. Then read
> the markup for exact values.

0. **The PNG for the screen you are building** — `<n>-<screen>-1440-light.png`,
   then `-dark`, then the 360 pair. Read the note under it before you start.
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
record. Latin is EB Garamond 600, Arabic is Amiri.

**The Arabic sits ON TOP of the Latin**, dropped into the valley the *i* and *h*
make in the wordmark's skyline, right-aligned and at half the Latin's size. It
took four rounds to place — below, then left, then right, then on top, then
nestled into the valley — and the earlier wording here ("always secondary — under
the Latin, never above it") is the first of those rounds and has been wrong since
25 September. It is still secondary in weight and size, and it still never carries
a figure. `brand.lockup()` is the one definition; there is no second way to draw
it.

## What is here

**Re-cut 25 September: one screen, one artboard.** A board used to be able to hold six
onboarding steps, or sign-up beside sign-in, or five states of Home in a row. That reads
fine flipping through and is useless for review — you cannot point at "the sign-in
screen" if sign-in is the right-hand half of a board called Auth. So every file below is
one screen, and its name says which.

**219 artboards across 17 pages, on two canvases.** File names are `NN-what-it-is-WIDTH-theme.png`,
numbered in flow order, and the same stem names the `.dc.html` beside it in `canvas/`.

> **Re-cut 27 September, one page per screen.** It was five pages, two of which
> were buckets: *The month's money* held six destinations and fifty-four
> artboards, *Account, settings and household* five more. Home had a page of its
> own from the start and was the only part of the canvas anyone could find
> anything in. A bucket page costs twice — nobody can link to a screen, and a page
> note that has to cover six screens says nothing about any of them.
>
> **Before that, the pages were split by WIDTH** — pages 2–5 at 1440, pages 6–9
> the same screens at 360 — which is how the two widths drifted apart in the first
> place. The two widths of one screen are now the same **row**.

| Page | Files | What is on it |
|---|---|---|
| 1 · Landing page and first launch | `11-landing-*`, `01-first-launch-*` | 1440 and 390, the pointer states, the strongest moment (item 34), and the screen an **installed** copy opens cold. |
| 2 · Security and privacy | `20-*`, `21-*` | The page, and the same page as the modal sign-up opens. §10.1's sentence lives here **once**. |
| 3 · Account and setting up | `01-*` … `05.6-*` | Sign up · address already taken · sign in · forgot · check your email · set a new password, then the six setting-up steps and the three pickers 360 needs. |
| 4 · Home | `07-*` | Home, amber, over, **no plan**, **a brand-new account** (`07c2`), a plan with no movements, offline, this cycle, the More sheet. `07c` and `07c2` are two different first screens: onboarding's saved-pots and debts steps are optional. |
| 5 · Plan | `08-*` | Plan · the row menu · no categories yet · nothing allocated yet · add a category · **scrolled, header pinned** (`08e`). `08e` is the one board clipped to a viewport, because a board has no fold and is therefore a bad guide to how tall a screen feels. |
| 6 · Transactions | `09-*` | The list, **both** empty states — they want opposite things — and **savings by destination** (`09c`), §7.4's subtotal, which the spec says needs no screen of its own and was therefore on none. |
| 7 · Quick Add | `10-*` | The sheet at 360, the dialog at 1440, record a payment, edit a movement. |
| 8 · Debts and goals | `11-*`, `12-*` | Debts and Goals (no tabs at 1440) · Goals at 360 · add a debt · add a goal · the debt record. |
| 9 · Months | `13-*` | Empty and populated. A cycle is a salary month, not a calendar one. |
| 10 · Zakat | `14-*` | The estimate and its workings. |
| 11 · Settings | `15-*` | Settings, and signed out. **The sidebar's bottom group at 1440** (§2). |
| 12 · What an account adds | `16-*` | Free and lapsed. **No padlock anywhere** — item 24, and `build_boards.py` fails if the word appears. |
| 13 · Bank movements | `17-*` | The queue, the duplicate case, nothing to sort, **a cash withdrawal** (`17c`) and **Cash in hand** (`17d`, both widths). A withdrawal is a *move*, not a spend — the one row the queue asks no category for, because there is none to ask. **Its own nav destination**, shown only when a bank is linked. |
| 14 · Household | `18-*` | Two amounts for one expense, and for a savings target. |
| 15 · Import and export | `19-*` | The three-stage flow — spec §7.9, the most dangerous action in the app. |
| 16 · Mark | `00-cover-*`, `00-logo-*` | The design-stop cover, and the mark: construction grid, sizes, app icon, favicon, wordmark lockups, misuses. |
| 17 · Foundations | `00-primitives-*`, `00-style-*`, `05a-debt-record-print.png` | Every component in every state — including **loading, empty and error**, the last added 27 September because there was not one Retry state on the whole canvas — the palette and type tile, and the printed record: A4, black and white, no app chrome. |

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
