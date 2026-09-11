# IndexedDB (and why it can vanish)

**The one line:** a real database inside the browser — big, fast, offline, and
allowed to be deleted without asking you.

---

## What it is

Every browser ships a database. Not cookies, not `localStorage` — a proper one,
with tables, indexes and transactions, holding hundreds of megabytes and working
with no network.

Mizaniya uses it through **Dexie**, a thin library that makes IndexedDB's own
API bearable. Raw IndexedDB is famously awkward — event-based, verbose, easy to
misuse. Dexie gives it promises and a query syntax, and nothing more. It stays
behind the [[repository-pattern]], so no screen ever knows it exists.

---

## Why we use it here

The app is local-first by design: no server, no account, no network. Everything
must live on the owner's device and work on a phone with no signal.
`localStorage` cannot do it — it holds a few megabytes of *strings only*, and it
blocks the page while it works.

---

## The part that matters most: it is not permanent

**The browser is allowed to delete your database.** Not maliciously. It reclaims
space when the device is full, or tidies up sites you have not opened in a
while. Every transaction, gone.

Who finds out? **You do — by opening an empty app.**

On iOS this bites hardest, and there is a trap worth knowing: **every browser on
iOS is Safari underneath.** Apple requires it. Chrome on an iPhone is Safari
wearing a Chrome badge, so it inherits Safari's stricter rules. Choosing Chrome
does not help.

So D12 answers this in four layers:

1. **Ask for protection** — `navigator.storage.persist()` asks the browser to
   mark the data as *do not delete without asking*. Asked after real data
   exists, because browsers weigh genuine use.
2. **Report the truth in Settings** — whether protection was granted, in plain
   words. Not a green tick that means nothing.
3. **Nudge on unexported changes**, never on a timer. A nag you can predict is a
   nag you learn to dismiss.
4. **Ship installable (a PWA)** — installing to the home screen is the single
   biggest factor in whether the data survives.

None of these is a guarantee. Persistence can be requested, never demanded.
**Until v3 sync exists, an exported file you have actually saved somewhere is
the only real backup**, and the README has to say so plainly rather than
implying the app is safe.

---

## What we would have used instead, and why not

**`localStorage`** — far simpler, and disqualified: a few megabytes, strings
only, and synchronous, so it freezes the interface while it works.

**A server from day one** — solves durability outright, and it is the v3 plan.
Rejected for v1 because it means accounts, hosting, a privacy surface and a
second repository, on a product with one user who wants it working on the bus.

**The File System Access API** (writing straight to the device) — genuinely
durable, and not supported on iOS Safari, which is the primary target.

---

## The interview sentence

"I used IndexedDB through Dexie for a local-first app, and treated its
impermanence as a design problem rather than an assumption — requesting
persistent storage, reporting the real status to the user, and nudging exports
based on unexported changes, because browser storage can be evicted silently."

---

## In your own words

_Add a line here after reading._
