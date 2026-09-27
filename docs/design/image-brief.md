# Image brief — the landing page's two photographs

| Field | Value |
|---|---|
| **Date** | 25 September 2026 |
| **For** | [11-landing-page-brief.md](../11-landing-page-brief.md) §6, and the two slots drawn on `Land` / `LandPhone` |
| **Status** | Slots designed and specified. **The files are not in the repository** — see "Why these are not already here" |

---

## Why these are not already here

The designer works in a sandbox whose proxy allow-lists by host name, and the
image CDNs are not on it — `images.unsplash.com` and `images.pexels.com` both
fail to connect, from the cloud container and from the desktop VM alike. So the
artboards carry **specified slots** rather than pictures: exact dimensions, a
weight budget, and art direction including what not to shoot.

Whoever fills them needs this file and nothing else.

---

## 1 · The argument for two photographs, and against more

Three people arrive on this page, and photography helps one of them and hurts
the other two if it is overdone.

**It helps the salaried person in Lagos.** §2.1 of the brief is *recognition* —
*"your salary lands on the 25th; by the 12th you are not sure where it went."*
That is a life, not a feature, and a page that states it in type alone asks the
reader to do all the imagining.

**It hurts the investor and the engineer** the moment it becomes decoration. A
person smiling at a phone, a laptop beside a coffee, a hand holding a device
toward camera — these are the visual signature of a product with nothing to
show, and this product has something to show. The brief says it outright about
device frames; the same logic governs stock photography.

So: **two photographs, both carrying the story, neither one decorating a
section.**

**Where a photograph may never go: near a figure.** Nothing on this page
competes with a number. No photographic background behind the hero, behind the
cycle band, or behind any component fragment.

---

## 2 · Slot A — `landing-recognition`

| | |
|---|---|
| **Sits** | §2.1, directly under the hero statement and its two buttons |
| **Desktop** | 1140 × 360, corner radius 18 |
| **Phone** | full-bleed within the 24px gutter × 260 |
| **Budget** | **under 90 KB** at 1× · WebP · AVIF alongside it if easy |
| **Crop** | wide letterbox. Compose for it — a portrait crushed into 1140 × 360 loses its subject |

**What it is:** a Nigerian household, mid-month. The moment *before* the product
exists — money already partly gone, the month not finished.

**Search terms that get close:** `lagos market evening`, `nigerian market trader
stall`, `lagos street food vendor`, `african kitchen table notebook`, `nigeria
POS terminal payment`, `lagos danfo commute`, `african woman counting money
market`.

**Choose for:** an ordinary moment, a real place, natural light, nobody
performing for the lens. A market stall at the end of trading. A kitchen table
with a notebook on it. A POS terminal being handed back. Someone at a fuel
station.

**Reject:** anyone smiling at a phone. A hand holding a device toward camera. A
laptop-and-coffee desk. A studio-lit "fintech" composite. Anything where the
subject is technology rather than a person's day. Anything obviously shot
outside West Africa.

---

## 3 · Slot B — `landing-paid`

| | |
|---|---|
| **Sits** | §2.8, between Proof and the ask (§2.9) |
| **Desktop** | 1140 × 300, corner radius 18 |
| **Phone** | full-bleed within the gutter × 220 |
| **Budget** | **under 90 KB** at 1× · WebP |

**What it is:** the same household, on the 25th. The salary has landed.

**Tone:** quieter and warmer than slot A, and **not celebration** — no cash fan,
no raised arms, no confetti. Relief, not victory. The page has just finished
making its argument and this is the feeling the product is for, immediately
before it asks.

**Search terms:** `nigerian family evening home`, `lagos home cooking together`,
`african father child evening`, `nigerian woman market buying food`, `west
african household kitchen`.

**Reject:** the same list as slot A, plus anything depicting wealth. This is a
person whose month is now workable, not a person who has become rich. Getting
that wrong makes the product look like it is selling a fantasy, which is the
opposite of what the rest of the page does.

---

## 4 · Sources and licence

| Source | Licence | Attribution |
|---|---|---|
| **Unsplash** | Unsplash Licence — free, commercial use, no permission needed | Not required. Credit the photographer in `docs/design/image-credits.md` anyway — it costs nothing and it is the decent thing |
| **Pexels** | Pexels Licence — same shape | Same |
| **A commissioned or owned photograph** | **Preferred if it exists at all** | A real Lagos photograph beats the best stock frame, and it cannot be found on a competitor's page |

**Do not** use an image whose licence you have not read, and do not hotlink —
the file is committed to the repository so the page has no third-party runtime
dependency and no request leaves the reader's browser to a domain they did not
choose. That is consistent with everything else this page claims.

---

## 5 · Files, names and where they go

```
docs/design/img/landing-recognition.webp     1140 × 360, < 90 KB
docs/design/img/landing-recognition@2x.webp  2280 × 720, < 220 KB
docs/design/img/landing-paid.webp            1140 × 300, < 90 KB
docs/design/img/landing-paid@2x.webp         2280 × 600, < 220 KB
```

Phone crops are the same files — the slot is full-bleed and `object-fit: cover`
handles it. A separate mobile crop is only worth cutting if the wide composition
loses its subject at 390px, which is a judgement to make once the frames exist.

**Hitting the budget**, with what is already on the machine:

```sh
convert in.jpg -resize 1140x360^ -gravity center -extent 1140x360 \
        -strip -quality 82 landing-recognition.webp
```

`cwebp` is not installed on the desktop VM; ImageMagick's `convert` is, and it
writes WebP. Check the result with `ls -l` rather than trusting the quality
number — 82 lands around 60-80 KB on a photograph of this size, but a busy
market frame will run heavier and wants 76 instead.

**Then:** `loading="lazy"` and `decoding="async"` on both, and explicit `width`
and `height` attributes so nothing shifts as they arrive. A page selling an
offline-first app has no excuse for reflowing on a slow connection.

---

## 6 · What changes on the artboards when the files land

Nothing structural — the slots are already the right size and in the right
place. Replace the dashed placeholder with the image at the same dimensions and
radius. The artboards are regenerated from `landing.py`; the placeholder is
`img_slot()` and it is the only thing that changes.
