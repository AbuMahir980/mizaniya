# -*- coding: utf-8 -*-
"""build_manifests.py — the two canvases, rebuilt after ADR-013."""
import io, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import manifest as M

HAVE = {f[:-len(".dc.html")] for f in os.listdir(M.SRC) if f.endswith(".dc.html")}


def live(rows):
    """Drop boards that no longer exist, and rows that empty out with them."""
    out = []
    for r in rows:
        r = [(n, t) for n, t in r if n in HAVE]
        if r:
            out.append(r)
    return out


def load(name):
    return json.load(io.open(os.path.join(M.SRC, name), encoding="utf-8"))


# ══════════════════════════ the app ══════════════════════════════════════════
app = load("canvas.json")
BANK_MOVED = {"WebBankLight", "MwBankLight", "WebBankDark", "MwBankDark"}

ADDED_APP = {
    "page-w-home": [M.row("HomeBehind",
                          "07h · Home · this device is holding an older copy"),
                    M.row("HomeNotice",
                          "07i · Home · a new device opened your budget")],
}
NEW_APP = {n for rows in ADDED_APP.values() for r in rows for n, _ in r}

app_pages = [
    ("page-w-home", "4 · Home"), ("page-plan", "5 · Plan"),
    ("page-tx", "6 · Transactions"), ("page-qa", "7 · Quick Add"),
    ("page-dg", "8 · Debts and goals"), ("page-mo", "9 · Months"),
    ("page-zk", "10 · Zakat"),
    ("page-bank", "13 · Parked · bank movements, not to be built"),
]

# 09d — the bank-movements view — joins the queue it belonged to on page 13.
# Written so that running this twice gives the same answer: the move is defined
# by where the boards should END UP, not by where they happen to be now.
moved = sorted({c for pid in ("page-tx", "page-bank")
                for r in M.grouped(app, pid) for c in r if c[0] in BANK_MOVED},
               key=lambda c: ("Mw" in c[0], "Dark" in c[0]))
app_boards = []
for pid, _ in app_pages:
    rows = [[c for c in r if c[0] not in BANK_MOVED and c[0] not in NEW_APP]
            for r in live(M.grouped(app, pid))]
    rows = [r for r in rows if r]
    if pid == "page-bank":
        rows = [list(moved)] + rows
    rows += ADDED_APP.get(pid, [])
    app_boards += M.lay(pid, rows)

N_BANK = ("<b>Parked by ADR-013, and parked is not the same as wrong.</b> Bank "
          "movement is deferred until someone using the product asks for it and "
          "says they would pay &mdash; so these stay on the record as the design "
          "for it, and <b>none of them is to be built</b>. The paid-tier board "
          "that sat beside them (<i>09e</i>) is gone rather than parked: there is "
          "no tier any more, so it was not a deferred design but a wrong one. "
          "<i>17d &middot; cash in hand</i> is parked with them for a reason worth "
          "writing down &mdash; it looks like it stands alone, and it does not. "
          "Its whole job is to repair a mistake the bank feed introduces, by "
          "saying that a withdrawal is not a purchase. With nothing reading the "
          "bank, nobody is ever shown a withdrawal to classify: the ₦6,500 is "
          "recorded when it is spent, and D16 &mdash; cash left is income minus "
          "movements &mdash; is already right without it.")
app_notes = []
for a in app.get("annotations", []):
    if a["page"] == "page-bank":
        a = dict(a, text=N_BANK)
    if a["page"] == "page-tx":
        a = dict(a, text=a["text"] + " <b>The bank-movements segment came off on "
                 "14 October</b> &mdash; ADR-013 defers the feature, and a "
                 "segmented control with one segment is not a control.")
    app_notes.append(a)

n1 = M.write("canvas.json", [{"id": i, "name": n} for i, n in app_pages],
             app_boards, app_notes, app["launch"])

# ══════════════════════════ around the app ═══════════════════════════════════
fr = load("canvas-front.json")

GETTING_BACK = (
    M.row("Recovery", "22 · Getting back in · choose how")
    + M.row("Keys", "22a · Your three keys · nothing placed yet")
    + M.row("KeysDone", "22b · Your three keys · all three placed")
    + M.row("KeysBack", "22f · Your three keys · going back makes new ones")
    + M.row("KeyScan", "22c · Key three · ready to scan")
    + M.row("Phrase", "22d · Your recovery phrase")
    + M.row("PhraseCheck", "22e · Confirm two of the words")
    + M.row("Entry", "23 · Open your budget here · two keys")
    + M.row("EntryOne", "23a · Open your budget here · one accepted")
    + M.row("EntryPhrase", "23b · Open your budget here · the phrase"))
GETTING_BACK = [GETTING_BACK[i:i + 4] for i in range(0, len(GETTING_BACK), 4)]

fr_pages = [
    ("page-land", "1 · Landing page and first launch"),
    ("page-sec", "2 · Security and privacy"),
    ("page-w-in", "3 · Setting up"),
    ("page-set", "11 · Settings"),
    ("page-tier", "12 · Getting back in"),
    ("page-hh", "14 · Household"),
    ("page-imp", "15 · Import and export"),
    ("page-brand", "16 · Mark"),
    ("page-found", "17 · Foundations"),
]

# Appended rows are stripped before they are appended, so a second run of this
# file produces the same two manifests as the first. A build script that is only
# correct once is a build script that will be run twice.
ADDED = {
    "page-land": [[("LandRailLight", "How it works · the rail arrives · light"),
                   ("LandRailDark", "How it works · the rail arrives · dark")]],
    "page-set": [M.row("Sync", "15d · Settings · your sync")],
    "page-hh": [M.row("HouseholdOff", "18g · Household · sync is off"),
                M.row("HouseholdPartner", "18f · Household · the partner\u2019s view"),
                M.row("Remove", "18d · Household · removing Aisha"),
                M.row("RemoveDone",
                      "18e · Household · Aisha removed · place new keys")],
}
NEW_NAMES = {n for rows in ADDED.values() for r in rows for n, _ in r}

fr_boards = []
for pid, _ in fr_pages:
    if pid == "page-tier":
        rows = GETTING_BACK
    else:
        rows = [[c for c in r if c[0] not in NEW_NAMES]
                for r in live(M.grouped(fr, pid))]
        rows = [r for r in rows if r] + ADDED.get(pid, [])
    fr_boards += M.lay(pid, rows)

N_TIER = ("<b>What replaced the account.</b> Nine screens, and the first one is the "
          "whole problem: explaining <i>any two of three</i> to a household at the "
          "moment they have least patience for it. Every other product that solves "
          "this assumes a technical reader and shows a wall of warnings, which is "
          "how people end up choosing the weakest option to get past the screen. "
          "So no option here wears a warning &mdash; all three answer the same four "
          "questions in the same four slots, and the weakest turns out to be the "
          "only card with two crosses on it. <b>Nothing on these boards names the "
          "cryptography</b>, deliberately: nobody has to read the word Shamir to "
          "trust a budgeting app, and the honesty is in the scope of each claim "
          "rather than the detail behind it. <i>Devices only</i> has no screen "
          "after the chooser, which is exactly its selling point &mdash; there is "
          "nothing to write down, so there is nothing to show.")
N_W_IN = ("The six setting-up steps, every one at both widths. <b>The account flow "
          "that used to open this page is gone</b> &mdash; sign up, sign in, forgot "
          "password, check your email and reset all went with ADR-013, because "
          "there is no password to forget and no address to send a link to. What "
          "stands in their place is page 12. Setting up itself is untouched: it "
          "never needed an account and now it cannot have one.")
N_SET = ("Data, cycle and categories &mdash; and <b>the account row became the sync "
         "row</b>. It is a setting now rather than an offer: nothing to create, "
         "nothing to upgrade and nothing that lapses, only a fact about where a "
         "copy sits and two different ways of ending it.")
N_HH = ("Two people, one expense, two different figures &mdash; and now the harder "
        "one: <b>removing somebody</b>. Joining is handing over a key, so leaving "
        "is making new ones, and the screen that does it says all three things that "
        "happen, including the one we cannot do. <b>The roles are gone.</b> There "
        "is no account holder and no member: possession of the key is the whole of "
        "the authorisation, so either person can remove the other, and a screen "
        "that implied otherwise would promise something the architecture cannot "
        "keep.")
N_SEC = ("<b>Off page 1, 27 September.</b> Rewritten on 14 October, when the server "
         "that the old page described stopped existing. The claim got stronger "
         "&mdash; <i>we cannot read your budget</i> is true by construction &mdash; "
         "which is exactly why the limits are set in the same size type as the "
         "promise. <i>Nobody can ever see your data</i> stops being true the moment "
         "a key is shared or found.")
OVER = {"page-tier": N_TIER, "page-w-in": N_W_IN, "page-set": N_SET,
        "page-hh": N_HH, "page-sec": N_SEC}
fr_notes = [dict(a, text=OVER.get(a["page"], a["text"]))
            for a in fr.get("annotations", [])]
have = {a["page"] for a in fr_notes}
for pid, t in OVER.items():
    if pid not in have:
        fr_notes.append({"id": "n-" + pid.split("-", 1)[1], "x": 0, "y": -250,
                         "w": 820, "page": pid, "text": t})

n2 = M.write("canvas-front.json", [{"id": i, "name": n} for i, n in fr_pages],
             fr_boards, fr_notes, fr["launch"])
print(f"canvas.json {n1}/200   canvas-front.json {n2}/200   total {n1 + n2}")
