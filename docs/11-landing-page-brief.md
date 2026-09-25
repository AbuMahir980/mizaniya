# Landing page brief

| Field | Value |
|---|---|
| **Date** | 2026-09-25 |
| **Status** | Its own project, per the owner's direction — full showcase, scroll-driven storytelling |
| **App brief** | [10-design-brief.md](10-design-brief.md) |
| **Figures** | `docs/seed-data.md` only (repo rule 2) |

---

## 1 · What this page is for

Three people arrive here, and only one of them wants a feature list.

| Who | What convinces them |
|---|---|
| A salaried person in Lagos | Being *recognised*. "This person has had my problem" |
| An investor | That a real problem is being solved for a real market, by someone who can build |
| An employer or engineer | That the thing behind the screenshots is well made |

**One page, one order, serving all three.** The narrative convinces the first. The
craft convinces the third. The second is watching whether both are true at once.

---

## 2 · The story, in order

This is the arc. Wording is yours; the **sequence** is the argument.

### 1. Recognition — not a value proposition

Do not open with what the app is. Open with the thing the reader already lives:

> Your salary lands on the 25th. By the 12th, you are not sure where it went.

Specific beats clever. *"Take control of your finances"* is what everyone says and
convinces nobody.

### 2. Why the apps they have already tried did not work

This is the section that earns the rest of the page, and it is the one most landing
pages skip:

- **They budget by calendar month. Your money works in salary cycles.** A month that starts on the 1st is meaningless when you are paid on the 25th.
- **They cannot hold a rent lump sum.** ₦900,000 due once a year is not a monthly bill, and treating it as one makes every other figure wrong.
- **They only track what you owe, not what you are owed.** You lent a colleague ₦40,000. That is real money and it is missing from every app.

The reader should think *yes, that is exactly why I gave up on the last one.*

### 3. The one number

Safe to spend, today. This is the product in one figure.

**The hero moment.** Show the real screen, with `seed-data.md` figures. Not an
abstract illustration of a phone.

### 4. The three things nothing else does

| | |
|---|---|
| **Salary cycles, not months** | The cycle runs 25th to 24th because that is when money arrives |
| **Debts in both directions, with a written record** | Who you owe, who owes you, and a printable record that separates what the app witnessed from what it was told |
| **A sinking fund for annual rent** | ₦900,000 due 1 March, and whether you will get there at the current rate |

### 5. Built to be trusted, not just used

- Works with **no internet**. The figure is on your device.
- **Free forever on one device.** No account needed. Not a trial.
- Your data is **yours** — export it whenever, in a real file you can read.
- **Zakat aware, sadaqah as a category, debts written down** (Qur'an 2:282) — because that is how this household's money actually works. Stated, never preached.

### 6. What paying adds

Per §11a: sync to another device, share with a spouse, read bank movement.

**Framed as reach, never as unlocking the basics.** And say the honest thing: *the
budgeting is free forever; you pay for the parts that cost us money to run.*

### 7. What we can and cannot see

Rare on a landing page, and **the strongest trust signal available** to a money app
asking for a bank connection.

- Encrypted, with keys held outside the database.
- Every access to production data is logged, and you can ask for that record.
- Bank access is **read-only**. It can see money move; it cannot move money.

**The sentence that must never appear anywhere:** ~~*"your bank data never touches our
servers."*~~ It is **false** — movement reaches the server before it is encrypted. The
true claim is strong enough: *"we never store your bank data in readable form."*

**This wording must be identical to the sign-up screen's.** Two slightly different
privacy claims are worse than one plain one.

### 8. Proof

Screenshots, at real size, readable. And **the demo** — see §4.

### 9. The ask

| | |
|---|---|
| **Primary** | *See it with sample data* — no sign-up, no email, one click |
| **Secondary** | *Start with my own figures* |
| **Tertiary** | The repository. For the investor and the engineer, this is the proof |

---

## 3 · Motion — the one place showmanship belongs

Full showcase, per the owner. The app stays restrained; **this page is allowed to
perform.** Two rules keep it from becoming a liability:

**It must work with motion off.** `prefers-reduced-motion` gets a complete, coherent
page — not a broken one. A landing page that is unreadable without animation excludes
people and fails on a slow connection.

**Nothing may be gated behind a scroll animation.** If the one number only appears
after an animation completes, someone on a throttled phone sees an empty page.

Worth considering, to argue with:

- **The money figure counting down as the reader scrolls through a cycle** — the product's central idea, shown rather than described. This is the page's strongest possible moment.
- **The rent fund filling toward ₦900,000** over the scroll. The sinking fund made visible.
- **A debt crossing zero** — the ajo case, which no other app can even represent.
- **Real screens moving, not mockups floating.** Device frames drifting in space is the house style of products with nothing to show. You have something to show.

**No scroll-jacking.** Take the reader's scroll away and they leave.

---

## 4 · The demo is the call to action

*See it with sample data* should be the primary button, because it converts better
than any paragraph and it is nearly free — the seed already exists and restores
through the app's ordinary import path.

Two things it must have, and the first is a safety matter rather than a design
preference:

1. **An unmistakable, non-dismissable marker** that these figures are not theirs. Someone mistaking demo numbers for their own budget is a real hazard.
2. **A clean exit** — "start with my own figures" wipes the demo entirely.

---

## 5 · Also needed

Small pages, but a paid product without them looks unfinished:

| Page | Notes |
|---|---|
| **Pricing** | Can be a section rather than a page. Needs the price, which the owner has not settled — design around a placeholder and say where it goes |
| **Security and privacy** | The §7 claims in full, and the bank-data caveat stated plainly. This is a real asset, not boilerplate |
| **About** | Who built it and why. For a product handling money, an anonymous author is a reason to hesitate |

**Not needed:** a blog, testimonials, or logos of companies not using it.

---

## 6 · Constraints

- **Desktop and phone both designed.** Someone will read this on a laptop; someone else will get the link on WhatsApp.
- **It must be fast on a Nigerian mobile connection.** A page selling an offline-first app has no excuse for being slow. Budget the images.
- **Contrast gated**, as everywhere.
- **Every figure from `seed-data.md`.** No invented amounts, ever, including in illustrations.
- **No employer, client or third-party project names** (repo rule 3).

## 7 · Questions

[open-items.md](open-items.md) §H, answered in place.
