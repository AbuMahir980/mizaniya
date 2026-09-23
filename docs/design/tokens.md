# Mizaniya — design tokens

| Field | Value |
|---|---|
| **Made from** | `docs/06-page-specs.md` at commit `6bd2291` · `docs/design/DESIGN-BRIEF.md` |
| **Date** | 2026-09-10 |
| **Status** | Complete. **SHARED RULES implements this file exactly.** Nothing here is advisory. |
| **Contrast** | 54 gated pairs across both themes, **0 failures**. Method and script in §9. |

---

## 0 · What this replaces, and why

`DESIGN-BRIEF.md` §2 called for a single accent, no second colour, no shadows on
cards, no display face on money, and a look that "should not be mistaken for an
AI-generated mockup". That produced a design the project owner rejected as bland.
**§2 is superseded by this file**, at his direction, after a round of visual
direction exploration:

- **Colour is data.** Four hues, each meaning exactly one thing, plus a neutral
  ramp. Emerald is still the one *brand* colour — it is the only fill used for
  actions — but ochre, slate and rose carry meaning in charts, pills and status.
- **Icons are back**, as one geometric set on a 24px grid at 1.8–1.9px stroke.
- **Cards have one soft elevation**, and diagrams do real work: an arc gauge, a
  daily-spend chart and a segmented money breakdown.
- **Two typefaces**: EB Garamond for voice, Inter for everything structural, plus
  JetBrains Mono for the money breakdown and table headers.

What did **not** change, because it is money correctness rather than taste:
every amount carries its kobo, money is tabular and right-aligned, the naira sign
is part of the figure, no bare minus sign is ever shown, rounding direction is
fixed (spendable rounds **down**, obligations round **up**), and red is reserved
for money going wrong.

---

## 1 · Colour — light (warm paper)

| Token | Value | Role | Measured |
|---|---|---|---|
| `bg` | `#F7F3EA` | page ground | — |
| `card` | `#FFFFFF` | cards, sheets, bottom bar, sidebar | — |
| `line` | `#DED8CA` | borders | 1.42 on card |
| `hair` | `#EBE5D8` | row separators inside a card | — |
| `ink` | `#171A17` | primary text | **15.85** bg · **17.55** card |
| `soft` | `#5A615B` | secondary text | **5.75** bg · **6.37** card |
| `faint` | `#858A85` | tertiary text, band "protected" | **3.18** bg · **3.52** card |
| `emerald` | `#0F5C3C` | **the action colour** + "spent" in charts | **7.25** bg · **8.03** card |
| `ochre` | `#8C5C15` | warning: Low, Short, over-allowance, debt paid | **5.19** bg · **5.74** card |
| `slate` | `#3C4A5A` | neutral data: saved, movement types | **8.18** bg · **9.05** card |
| `rose` | `#9E2B2B` | **danger only** — money going wrong | **6.69** bg · **7.41** card |
| `em2` | `#E4EFE7` | emerald tint — pills, icon tiles | emerald on it: **6.80** |
| `oc2` | `#F6EBD5` | ochre tint | ochre on it: **4.86** |
| `sl2` | `#E6EAEF` | slate tint | slate on it: **7.49** |
| `ro2` | `#F7E2DF` | rose tint | rose on it: **5.96** |
| `track` | `#EDE7DA` | rail bed, chart baseline, "free" segment | 1.23 on card |
| `onEmerald` | `#FFFFFF` | text/icon on an emerald fill | **8.03** |
| `scrim` | `rgba(23,26,23,.46)` | behind sheets and dialogs | — |

## 2 · Colour — dark

Authored, not inverted. Every hue is re-tuned and re-measured.

| Token | Value | Measured |
|---|---|---|
| `bg` | `#0A0D10` | — |
| `card` | `#12171C` | — |
| `card2` | `#1A2129` | one step up, for nested surfaces |
| `line` | `#2A3440` | 1.54 on bg · 1.43 on card |
| `hair` | `#222B35` | — |
| `ink` | `#E9EFF3` | **16.80** bg · **15.54** card |
| `soft` | `#93A3AF` | **7.51** bg · **6.95** card |
| `faint` | `#6B7A86` | **4.41** bg · **4.08** card |
| `emerald` | `#4ECB8B` | **9.50** bg · **8.79** card |
| `ochre` | `#E5A93F` | **9.35** bg · **8.65** card |
| `slate` | `#8FA7C0` | **7.84** bg · **7.26** card |
| `rose` | `#F0736B` | **6.84** bg · **6.33** card |
| `em2` | `#0F2E22` | emerald on it: **7.14** |
| `oc2` | `#2E2312` | ochre on it: **7.38** |
| `sl2` | `#1A2532` | slate on it: **6.24** |
| `ro2` | `#2E1614` | rose on it: **5.94** |
| `track` | `#1A2129` | 1.11 on card |
| `onEmerald` | `#052214` | **8.22** on emerald |
| `scrim` | `rgba(4,6,8,.62)` | a near-black ink, so it dims a dark page instead of lightening it |

**Nothing sits between 3:1 and 4.5:1.** Only `faint`, the rail fills and the
band segments are measured against 3:1, and none of them is body text.

### What each hue may mean

| Hue | Permitted meaning | Never |
|---|---|---|
| **emerald** | the primary action (button, Add, active nav), "spent" in the money breakdown, goal progress | a warning, a status word |
| **ochre** | Low · Short · a bar above the allowance line · debt paid | the primary action |
| **slate** | saved · movement type pills · neutral chart series | a status that needs attention |
| **rose** | **money going wrong only** — Overspent, Overdue, negative safe-to-spend, a missed schedule | delete confirms, validation, offline notices, import refusals |

Delete confirmations, empty-field validation, the offline note and import
refusals are **neutral**: `ink` on `card` with a `line` border; the label carries
the consequence.

---

## 3 · Type

```
Voice      EB Garamond 500/600 — the title of a surface, hero statements, the printed record
Structural Inter 400/500/600/700 — everything else, including the money hero
Data       JetBrains Mono 400/600 — the money breakdown, table headers, axis labels,
                                    percentages, and any figure inside a chart
```

Three faces, each with one job. Money never uses EB Garamond.

**Which face a heading takes is a question about what it names, not about how big it
is.** The voice face names a **surface** — the whole of what you are looking at. The
structural face names a **part** of one. A screen title is voice. A bottom-sheet or
dialog title is voice too: while it is open the sheet *is* the surface — it holds
focus, Escape closes it, everything behind it is inert and scrimmed. A heading inside
a screen is a label, and a card title is `h2`; both are Inter.

| Step | Face | Size / line-height / weight | Use |
|---|---|---|---|
| `hero` | Inter | 42 / 48 / 600, `-0.035em`, tabular | Safe to spend — one per screen |
| `title` | **EB Garamond** | 30 / 36 / 500 · 34 / 40 at 1440 | The title of a surface: a screen, a sheet, a dialog |
| `h2` | **Inter** | 22 / 28 / 600 | Card titles |
| `body` | Inter | 15 / 22 / 400–600 | Rows, fields, prose |
| `small` | Inter | 13 / 19 / 400 | Sub-lines, helper text |
| `lab` | Inter | 10.5 / 16 / 600, `+0.115em`, uppercase | Headings inside a screen |
| `mlab` | JetBrains Mono | 10 / 15 / 400, `+0.12em`, uppercase | Data labels |

Empty-state sentences and the Home date are voice as well, at 19–27. They are quiet
on purpose and sit outside the table.

### 3.1 · Two things about EB Garamond that the sizes do not tell you

**It sets small.** Its x-height is 0.407em against Inter's 0.546 — the same pixel size
is about a quarter smaller to the eye. EB Garamond 30 looks like Inter 22. Size it by
eye, and never give it a number that puts it below the step it is meant to lead. The
sheet titles were 24 until 23 September, which is optically Inter 18 — under the `h2`
beneath them. That is what outside review noticed, and it was a size fault, not a
face fault.

**It thins out on dark, and the answer is weight.** Its thinnest stroke is 0.034em:
1.02 device pixels at 30px on a 1× screen, and under one pixel at every smaller size,
so the stroke has no whole pixel to land on and is drawn by antialiasing alone.
Light-on-dark that reads as washed out. So **the voice face is 500 on light and 600 on
dark** — 600 takes the hairline to 0.0385em and clears the pixel at every title size.
On a 2× screen the problem does not arise, which is why it surfaces in review on a
desktop monitor and not on a phone.

If 600 still will not hold on a real 1× dark screen now that the fonts actually load,
the replacement is **Source Serif 4**: the same old-style skeleton, x-height 0.475em,
hairline 0.055em, so it clears a device pixel from 18px up. That is a last resort.
The bookish register is the design, not a decoration on it.

---

## 4 · Money

```html
<span class="money"><span class="naira">₦7,500</span><span class="kobo">.00</span></span>
```

- **Kobo is 0.60 of the naira size and one weight step lighter, at 60% opacity of
  the current colour.** Same baseline, no superscript. It is present on every
  amount, everywhere, prose included.
- **Tabular figures always** (`font-variant-numeric: tabular-nums lining-nums`),
  right-aligned in every table and tile, thousands separators always.
- **₦ is part of the figure.** Never a prefix column, never an icon.
- **No bare minus sign.** Direction is a word: `₦2,300.00 over`.
- Rounding is a `core/` decision (**H3**). Money you may spend rounds **down**,
  money you must find rounds **up** — the planned daily allowance is
  **₦8,666.66**, never ₦8,666.67.
- Inside a chart or the money breakdown, money is set in **JetBrains Mono**; in
  the hero, rows and prose it is **Inter**. Both are tabular, and the kobo rule is
  identical in both.

---

## 5 · Shape, elevation, motion, target

```
radius.sm    8px   pills, chart bars, small marks
radius.md   12px   fields, chips, segmented control, icon tiles
radius.lg   16px   cards
radius.xl   22px   sheets, dialogs, the desktop frame
radius.full 30px   the phone frame only

space  4 · 8 · 12 · 14 · 16 · 20 · 26 · 36 · 44   (4px base)

elevation.card   light  0 1px 2px rgba(23,26,23,.05), 0 12px 30px -16px rgba(23,26,23,.22)
                 dark   0 1px 2px rgba(0,0,0,.5),     0 14px 34px -16px rgba(0,0,0,.7)
elevation.lift   the Add button only —
                 light  0 8px 20px -8px rgba(15,92,60,.55)
                 dark   0 8px 20px -8px rgba(78,203,139,.4)

motion.instant   0ms    every money figure — money never animates
motion.fast    120ms    press, focus, pill swap
motion.base    180ms    chart draw, expand, tab change
motion.sheet   240ms in / 160ms out
easing         cubic-bezier(.2,0,0,1) · exit cubic-bezier(.4,0,1,1)

target.min      44px hit area (not the visual box), 8px minimum between targets
focus           2px emerald ring at 2px offset, or a 3px em2 halo on a field
```

Under `prefers-reduced-motion: reduce`, the gauge and chart render at their final
values with no draw-in, sheets fade rather than translate, and the loading spinner
keeps turning — a still spinner conveys nothing.

---

## 6 · Diagrams

| Diagram | What it shows | Rules |
|---|---|---|
| **Gauge** | today's safe-to-spend against the **planned daily allowance** (₦8,666.66), with the amber threshold (₦5,200.00) marked as an ochre tick | semicircle, 16px stroke, `track` bed, `emerald` fill — `ochre` when below the threshold, `rose` when negative. The figure sits inside the opening and never overlaps the arc |
| **Daily-spend chart** | one bar per day of the cycle | bars above the dashed allowance line are `ochre`, below are `faint` at 38%, today is `emerald`. The allowance line is a `slate` dash. Never a gradient, never a curve fit |
| **Money breakdown** | where the whole cycle's take-home is | a gapped segmented rail — `emerald` spent · `slate` saved · `ochre` debt paid · `faint` protected · `track` free — plus a two-column mono key, one row per segment, and a closing division line ending in the hero figure |

Every diagram carries a text key. None of them is the only way to read a figure.

---

## 7 · Components

| Component | Tokens | States |
|---|---|---|
| **Button — primary** | `emerald` fill, `onEmerald`, `radius.md`, `elevation.lift` on the Add button only | default · pressed · focused · disabled (`track` fill, `faint`) · loading |
| **Button — secondary** | `card` fill, `ink`, `line` border | as above |
| **Button — quiet** | transparent, `soft` | as above |
| **Field / AmountInput** | `card` fill, `line`, `radius.md`, 50px | default · hover · **focused** (`emerald` border + 3px `em2` halo) · disabled · error (neutral border, `ink` message) · loading |
| **Chip** | `card`, `line`, `radius.md` | default · **selected** (`ink` fill, `bg` text) · focused · disabled |
| **Segmented** | `card` in a `line` frame, `radius.md` | active segment is `ink` fill with `bg` text |
| **Tabs** | `line` bottom border, `soft` inactive, `ink` active with a 2px `emerald` underline, 46px | default · active · focused. **Tabs switch a view** (Debts \| Goals); Segmented switches a value (Today \| This cycle) |
| **Pill** | `*2` tint fill, matching hue text, `radius.sm`, 25px, uppercase | On track · Low · Short · Overdue · Overspent · movement types |
| **Icon tile** | 38px, `radius.md`, `*2` tint fill, matching hue icon | one per row that needs an identity |
| **Card** | `card`, `line`, `radius.lg`, `elevation.card` | default · hover · focused · loading · error · empty |
| **Sheet / Dialog** | `card`, `radius.xl`, `elevation.card`, `scrim` | mobile: bottom sheet · desktop: centred 480px dialog. Focus trapped, Escape closes |
| **Rail (ProgressBar)** | `track` bed, hue fill, `radius.sm`, 5–6px | default · complete · over (`rose`) · indeterminate. Always beside a text percentage in tables |
| **ListRow** | `hair` bottom border, 52–56px, `chev` mark | default · hover · focused · disabled |
| **Switch** | `track`/`line` off, `emerald` on, `radius.full` knob | off · on · focused · disabled |
| **Slider** | `track` rail, `ochre` fill, 28px `card` thumb with a 2px `ochre` ring | default · focused · disabled. Visibly distinct from a rail — it has a thumb |
| **Table (desktop)** | mono uppercase headers, `hair` row borders, 15px cells | default · hover · focused row · loading · empty · error. Money columns right-aligned and tabular |
| **BottomBar** | `card`, `line` top, `faint`/`emerald`, 56px Add button | five items, icons **and** labels, always visible |
| **Sidebar (desktop)** | `card`, `line` right, active item on `em2` | replaces the bottom bar at 1440 |

---

## 8 · Responsive

360 is the design. 1440 adds space, not features: the sidebar replaces the bottom
bar, the gauge and switch take a left column with the two diagrams stacked
beside them, category and goal sub-lines become table columns, and Quick Add
becomes a centred 480px dialog. Nothing exists only on desktop.

---

## 9 · Contrast audit

WCAG 2.1 relative luminance — sRGB linearised, `0.2126R + 0.7152G + 0.0722B`,
ratio `(L₁ + 0.05) / (L₂ + 0.05)`. Script: `audit2.py` beside the design sources.

**54 gated pairs · 2 themes · 0 failures.**

4.5:1 for all text, including every hue used as a figure tint and every pill
pair; 3:1 for `faint`, the rail fills and the band segments. Non-text
separations (borders, the rail bed, surface steps) are listed with their measured
values but carry no gate — none is the only signal for anything.

Re-run this as a token-level test in CI (**J4**, spec §3).
