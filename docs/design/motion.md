# Motion

| | |
|---|---|
| **Date** | 25 September 2026 |
| **Status** | Authoritative for motion, the way `tokens.md` is for colour and type |
| **Governs** | The app. The landing page is a separate project and §9 says what it inherits |
| **Brief** | [10-design-brief.md](../10-design-brief.md) §3 |

`tokens.md` §5 used to carry the motion values. It now points here, so there is one
source. The token *names* are unchanged — nothing in `tokens.css` has to move.

---

## 0 · Two rules that override everything below

**1 · Nothing animates on the path to a figure.** There is no entrance animation
between opening the app and reading *safe to spend*. Not a fade, not a rise, not a
skeleton that becomes the number.

**2 · A figure is never animated into existence.** Money does not count up on first
paint, and neither does the gauge arc sweep to its value. A number mid-count is a
number nobody can read; an arc mid-sweep is a wrong figure shown with a right one's
confidence. Reading the figure is the entire product, and the app must not put a
performance between the person and it.

These are not style preferences and they do not have exceptions. Motion that
changes *while the person watches* is covered in §3.9 and is a different thing —
the figure has already been read by then.

---

## 1 · Duration

Three values. Nothing else.

```
motion.fast    120ms   press, focus, hover, chip and pill selection, the thumb on a segmented control
motion.base    180ms   expand and collapse, tab change, banner arrive, chart and rail fills,
                       the gauge arc when a value CHANGES under the eye
motion.sheet   240ms in / 160ms out   sheets, dialogs, the scrim behind them
```

`motion.sheet` is deliberately asymmetric. A surface arriving is carrying something
you have not read yet, so it may take its time; a surface leaving is in the way, so
it gets out faster. Every enter/exit pair in the app follows that asymmetry.

**A fourth duration needs a written reason in this file.** Most UI motion lives
between 150 and 300ms; anything slower is a thing the person is waiting for, and a
thing the person is waiting for is a progress state, not an animation.

---

## 2 · Easing

Two curves.

```
easing         cubic-bezier(.2, 0, 0, 1)    everything arriving, changing, or staying
easing-exit    cubic-bezier(.4, 0, 1, 1)    everything leaving
```

`easing` starts fast and settles — it feels like the interface responding rather
than playing. `easing-exit` accelerates away and never settles, because a thing
leaving should not ask to be watched.

**Never `linear`** except on an indeterminate spinner, where any curve reads as a
stutter. **Never a spring or an overshoot.** Overshoot means a value goes past its
target and comes back; on a screen full of money figures, something moving past
its resting place and returning is exactly the wrong feeling.

---

## 3 · What animates

This list is exhaustive. **Anything not on it does not animate.** Every entry names
its reduced-motion fallback, and none of those fallbacks removes information.

| # | What | How | Reduced motion |
|---|---|---|---|
| 3.1 | **Sheet, mobile** | Translates up from the bottom edge, `sheet` in / out, `easing` / `easing-exit` | Cross-fades in place over `fast`. It still arrives and still leaves |
| 3.2 | **Dialog, desktop** | Opacity plus a 4px rise, `sheet` in / out | Opacity only |
| 3.3 | **Scrim** | Opacity 0 → 1 over `sheet`, under the surface it belongs to | Unchanged — opacity is not movement |
| 3.4 | **Banner** | Height and opacity over `base` | Opacity only, no height animation |
| 3.5 | **Expand / collapse** (*Show all 8 categories*) | Height over `base`, content opacity over `fast` | Appears and disappears at once |
| 3.6 | **Tab and segmented thumb** | `transform: translateX` over `fast` | The thumb moves without transition |
| 3.7 | **Press** | Opacity to 90% over `fast` | Unchanged |
| 3.8 | **Hover, focus-visible** | Background and border over `fast` | Unchanged |
| 3.9 | **A figure that changed under the eye** | The figure **replaces instantly** — it never tweens. A `em2` wash behind it fades in over `fast`, holds 1.2s, fades out over `base`. The gauge arc sweeps old → new over `base` | The wash behaves identically. **The arc does not sweep** — it redraws at the new value. The wash is what carries the signal and it survives |
| 3.10 | **Chart bars and rail fills** | Scale on one axis from the baseline over `base`, on entering a screen for the first time in a session | Drawn at final value |
| 3.11 | **Reconciliation queue** | The filed item leaves over `sheet` out; the next translates in over `sheet`. **One item, not a list** — see §4 | The filed item disappears, the next appears. The counter still falls, which is the real reward |
| 3.12 | **Skeletons** | A 1200ms opacity pulse between 100% and 62%, on a shape that matches the content it stands for | No pulse. The shape holds still |
| 3.13 | **Toast / save confirmation** | Opacity plus a 4px rise over `base`, out over `fast` | Opacity only |

### What never animates

- **Money figures.** Ever, in any direction, on any surface, including the landing page (§9).
- **The gauge arc on first paint.** It is drawn at its value.
- **Route changes.** Moving between Home, Plan, Transactions, Debts and Settings is instant. A page transition between two screens someone visits forty times a day is a tax.
- **The app's first paint, entire.** Nothing fades in, rises, or staggers on load.
- **Anything carrying meaning by itself** (**J3**). If the only sign that a save failed is a shake, the message did not arrive. Motion may reinforce a state; it may never be the state.

---

## 4 · Orchestration

**No stagger anywhere in the app.** A list whose rows arrive one after another is a
list you cannot read until it has finished performing, and it makes a fast app feel
slow. Lists appear complete.

The one exception is the reconciliation queue (§3.11), and it is not really a
stagger: exactly one item is ever moving, because exactly one item is ever being
asked about. That rhythm — file, next, file, next — is what makes it feel like
clearing a small inbox instead of filling in a form, and it is the most valuable
motion in the product.

---

## 5 · Reduced motion — the principle, so the table is derivable

`prefers-reduced-motion: reduce` is **mandatory** and every entry in §3 has a
fallback. The rule behind those fallbacks, so a new entry does not need a committee:

> **Remove movement and scaling. Keep opacity and colour. Never remove
> information.**

Vestibular triggers are travel, scale and parallax — not change itself. A wash that
fades, a border that shifts colour, a scrim that darkens: all of these stay, because
removing them would take away a signal and leave the person worse off than a person
who never asked for the accommodation.

**"Animations off" is not the fallback.** A state change still has to be legible.
If the only way a person knows their expense saved is an animation, switching that
animation off removes the confirmation — and that is a bug, not an accommodation.

---

## 6 · Pointer and keyboard

Motion and interactivity arrive together; the states are here because they are the
same system.

| State | Treatment | Notes |
|---|---|---|
| **hover** | Row and list item: `card2` fill. Button: as pressed, 90% opacity. Link: underline | `@media (hover: hover)` only, so a touch device never gets a stuck hover |
| **focus-visible** | `tokens.md` §5's ring — 2px `emerald` at 2px offset; fields keep their 3px `em2` halo | **`:focus-visible`, not `:focus`.** A mouse click must not paint a ring |
| **active** | 90% opacity, `fast` | |
| **disabled** | `track` fill, `faint` text, no hover, not focusable | Per §7 of `tokens.md` |
| **drag** | Only where reordering exists. The dragged item lifts to `elevation.lift`; the gap it will land in opens over `fast` | Reduced motion: the gap opens without transition |

**Hover is never the only signal** (**J3**). Every hover state has a non-hover
counterpart — a chevron, a border, a label.

### Keyboard

Someone entering ten movements on a laptop should never touch the mouse.

- **Tab order follows reading order.** No `tabindex` above 0, anywhere.
- **Enter** submits the surface it is in. **Escape** closes any sheet or dialog and returns focus to the control that opened it.
- **Chip groups are radio groups**: arrow keys move between options, Space selects, Tab leaves the group. Tabbing through eight categories to reach the ninth is why people reach for the mouse.
- A small set of shortcuts and no more — **`n`** new movement, **`/`** focus the filter, **`?`** show this list. They are listed on a surface, not hidden.
- **Focus is never lost.** A sheet traps it; closing returns it; a deleted row passes it to its neighbour.

---

## 7 · Engineering constraints

- **Animate `transform` and `opacity`.** Animating `height`, `top` or `width` on a mid-range Android drops frames, and that is the device the daily user holds. Where §3 says height (banner, expand), it is a small, bounded, one-off change — everywhere else, transform.
- **No motion library in the app.** The bundle already warns at 594KB (**N1**). CSS transitions cover every entry in §3; the Web Animations API covers the queue in §3.11. A library needs to earn its weight in writing, and nothing here does.
- **Honour the media query in CSS, not only in JS.** A JS-gated animation still runs for the moment before hydration.
- **Every duration and easing is a custom property**, so §1 and §2 are one edit and not a search.

---

## 8 · How to add an entry

1. Name what changes and why a person needs to see it change.
2. Pick a duration from §1 and a curve from §2. If neither fits, the entry is probably a progress state.
3. Write the reduced-motion fallback using §5's rule, and check it still carries the information.
4. Add the row to §3. **An animation not in §3 is a bug**, the same way a colour not in §1 of `tokens.md` is.

---

## 9 · The landing page

The landing page is a separate project ([11-landing-page-brief.md](../11-landing-page-brief.md))
and is allowed to perform. It inherits exactly two things from this file, and they
are not negotiable there either:

- **§0.2 — money is never animated into existence.** The hero figure is the product's central claim; showing it unreadable is showing the product badly. What may move around it is in §H item 34.
- **§5 — it must read completely with motion off**, and nothing may be gated behind a scroll animation. A page selling an offline-first app cannot require animation to make its argument.

Everything else in §1–§7 governs the app and does not bind the page.
