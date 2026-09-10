# The repository pattern

**The one line:** put one deliberately boring door between your screens and
wherever the data actually lives, so you can change the room behind it without
touching the house.

---

## What it is

A `Repository` is an interface — a list of plain operations with no mention of
*how* they happen:

```
transactions.list(range)
transactions.put(transaction)
transactions.delete(id)
```

Screens call those. They never know whether the answer came from a database in
the browser, a file on a phone, or a server in Lagos. Somewhere else, one
implementation of that interface does the real work.

---

## Why we use it here

Mizaniya has to store data three different ways over its life:

| Version | Where data lives |
|---|---|
| v1 (now) | IndexedDB in the browser |
| v2 | SQLite on the phone |
| v3 | A server, over HTTP |

Without the repository, every screen would name the storage engine directly, and
all three versions would mean rewriting every screen. With it, **each version
writes one new implementation and changes nothing else.**

That is standard **A4**, and it is why the interface is kept deliberately
boring. No clever queries, no observables, nothing Dexie-shaped. The test is
simple: *could this method be implemented over HTTP without heroics?* If not, it
does not belong in the interface.

That test is exactly why Dexie's `liveQuery` was rejected in
[ADR-001](../adr/ADR-001-reactivity-and-the-data-seam.md), tempting as it was.

---

## What we would have done instead, and why not

**Call Dexie directly from the screens.** Less code today — genuinely. And it
welds every screen to one storage engine, so v2 becomes a rewrite rather than an
addition. The saving is a day; the bill is a fortnight.

**An interface that exposes observables** (a repository that can push changes).
This looks like the principled middle path and is the more dangerous option,
because the leak is hidden. It promises push updates — and a future HTTP
implementation cannot deliver those without polling or a socket. It would return
a subscription that quietly never fires. Wrong, and silent.

---

## Interface honesty — what may go in, and what may not

The app clearly needs to react when data changes. So why is there no
`watchForChanges()` on `Repository`?

**Because an interface should only promise what every implementer can keep.**

| Implementation | Can it push changes? |
|---|---|
| Dexie (v1) | Yes — `liveQuery` |
| SQLite on React Native (v2) | No |
| An HTTP API (v3) | No, not without polling or a socket |

Put it in the interface and two of the three must lie: poll quietly and
wastefully, or hand back a subscription that never fires. The type system would
endorse both. **A promise the compiler enforces and the implementation cannot
keep is worse than no promise**, because now everyone believes it.

So the responsibility went elsewhere. The store already knows when data changed
— it changed it, through one write path ([ADR-001](../adr/ADR-001-reactivity-and-the-data-seam.md)).
The one case it cannot know about is *another browser tab*, and that is a
browser fact rather than a storage fact, so it lives in a separate
`ChangeNotifier` outside the interface entirely.

**The question to ask of any method you want to add:** *could every
implementation honour this honestly?* If the answer is "the current one can",
that is a no.

---

## The interview sentence

"I put data access behind a repository interface so the storage engine is a
detail — the same screens run over IndexedDB, SQLite or an HTTP API, and I keep
the interface deliberately plain so every implementation can honour it honestly."

---

## In your own words

_Add a line here after reading._
