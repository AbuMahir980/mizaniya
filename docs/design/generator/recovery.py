# -*- coding: utf-8 -*-
"""recovery.py — the screens ADR-013 created.

Everything here is downstream of one decision: there is no account, so the only
way back into a synced budget is the thing the person chose when they turned
sync on. ADR-013 names the risk this creates — *"if the explanation is poor
people will choose D3 to get past the screen"* — so the chooser below is built
to make a poor explanation impossible rather than to warn against one.

THE RULE THIS FILE FOLLOWS, and it is the whole design:

  **Every option answers the same four questions, in the same four slots.**

A chooser that presents two options plainly and hangs a warning on the third
teaches people that the third is the short one. Warnings read as friction, and
friction is what someone skimming a setup screen is selecting against. So no
option here wears a warning. Instead each one states what you keep, how you get
back in, what happens if you lose one, and what happens if somebody finds one —
and the weakest option turns out to be the only card with two crosses on it,
which is visible before a single word is read.

That is the honest version of the same information, and it is also the one that
survives skimming, which is the only test that matters at this moment.
"""
import mz
from mz import ic

CHECK = ('<span style="color:var(--emerald);display:flex;flex:0 0 auto;margin-top:1px">'
         + ic("check", 16, 2.3) + '</span>')
CROSS = ('<span style="color:var(--rose);display:flex;flex:0 0 auto;margin-top:1px">'
         + ic("close", 16, 2.3) + '</span>')


def _dot(on):
    """The selection mark. Filled emerald with a tick when chosen."""
    if on:
        return ('<span style="width:22px;height:22px;border-radius:11px;flex:0 0 auto;'
                'background:var(--emerald);color:var(--onEmerald);display:flex;'
                'align-items:center;justify-content:center">' + ic("check", 13, 2.6)
                + '</span>')
    return ('<span style="width:22px;height:22px;border-radius:11px;flex:0 0 auto;'
            'border:1.5px solid var(--line);display:block"></span>')


def _slot(label, text, h, glyph=None):
    g = (f'<div style="display:flex;gap:8px;align-items:flex-start">{glyph}'
         f'<span>{text}</span></div>') if glyph else text
    return (f'<div style="padding:13px 0;border-top:1px solid var(--hair);'
            f'min-height:{h}px">'
            f'<div class="mlab" style="margin-bottom:5px">{label}</div>'
            f'<div style="font-size:13.5px;line-height:19px;color:var(--ink)">{g}</div>'
            '</div>')


# ── the three options, written once and used at both widths ──────────────────
# The wording is the design. `keep` is a thing a person can picture holding;
# `back` is the path; `lose` and `found` are the two directions failure runs in,
# and ADR-013's own landing copy already frames them as that pair.
OPTIONS = [
    dict(
        key="keys", name="Three keys, any two", go="three keys", rec=True,
        keep="One key on this phone, one on your partner&rsquo;s phone, one printed "
             "for a drawer.",
        back="Any two of the three.",
        lose=("The other two still open it.", True),
        found=("It opens nothing on its own.", True),
        short="Any two of the three open it.",
        p_lose="Lose one &mdash; the other two still open it",
        p_found="Found &mdash; one on its own opens nothing",
    ),
    dict(
        key="devices", name="Your devices only", go="devices only", rec=False,
        keep="Nothing written down. Face ID on each device you use.",
        back="Any device you still have. Nothing else can.",
        lose=("The others still open it.", True),
        found=("There is nothing written down to find.", True),
        short="Any device you still have opens it. Nothing else can.",
        p_lose="Lose one &mdash; the others still open it",
        p_found="Nothing written down to find",
    ),
    dict(
        key="phrase", name="One recovery phrase", go="a recovery phrase", rec=False,
        keep="Twelve words, written down.",
        back="The words, on their own.",
        lose=("There is only one. The copy is gone.", False),
        found=("Whoever has them can open your budget.", False),
        short="The words on their own open it.",
        p_lose="Lose them &mdash; the copy is gone",
        p_found="Found &mdash; whoever has them can open your budget",
    ),
]


def card_wide(o, on):
    pill = (mz.pill("Recommended", "emerald", "em2") if o["rec"] else "")
    sel = ('border-color:var(--emerald);box-shadow:0 0 0 3px var(--em2);'
           if on else "")
    head = ('<div style="display:flex;align-items:center;gap:11px;min-height:40px;'
            'padding-bottom:15px">'
            + _dot(on)
            + f'<span style="font-size:15.5px;font-weight:600;letter-spacing:-.012em;'
              f'flex:1;min-width:0">{o["name"]}</span>{pill}</div>')
    return (f'<div class="card" style="flex:1;min-width:0;padding:18px 20px 6px;{sel}">'
            + head
            + _slot("You keep", o["keep"], 84)
            + _slot("To get back in", o["back"], 76)
            + _slot("If you lose one", o["lose"][0], 76,
                    CHECK if o["lose"][1] else CROSS)
            + _slot("If someone finds one", o["found"][0], 76,
                    CHECK if o["found"][1] else CROSS)
            + '</div>')


def card_phone(o, on):
    pill = (mz.pill("Recommended", "emerald", "em2") if o["rec"] else "")
    sel = ('border-color:var(--emerald);box-shadow:0 0 0 3px var(--em2);'
           if on else "")
    line = ('<div style="display:flex;gap:8px;align-items:flex-start;'
            'font-size:12.5px;line-height:18px;color:var(--soft);margin-top:7px">')
    return (f'<div class="card" style="padding:16px 16px 17px;{sel}">'
            '<div style="display:flex;align-items:center;gap:10px;min-height:37px;'
            'padding-bottom:12px">'
            + _dot(on)
            + f'<span style="font-size:15px;font-weight:600;letter-spacing:-.012em;'
              f'flex:1;min-width:0">{o["name"]}</span>{pill}</div>'
            '<div style="border-top:1px solid var(--hair);padding-top:12px;'
            f'font-size:13.5px;line-height:19px">{o["keep"]}</div>'
            f'<div style="font-size:13.5px;line-height:19px;color:var(--soft);'
            f'margin-top:6px">{o["short"]}</div>'
            + line + (CHECK if o["lose"][1] else CROSS)
            + f'<span>{o["p_lose"]}</span></div>'
            + line + (CHECK if o["found"][1] else CROSS)
            + f'<span>{o["p_found"]}</span></div>'
            '</div>')


TITLE = "Getting back in"
SUB = ("Sync keeps an encrypted copy of your budget. We hold no key to it &mdash; "
       "so how you get back in is the one thing you have to decide now.")


def chooser_wide(chosen="keys"):
    cards = "".join(card_wide(o, o["key"] == chosen) for o in OPTIONS)
    pick = next(o for o in OPTIONS if o["key"] == chosen)
    return (mz.head1440(mz.crumb("Settings", "Your sync", "Getting back in"),
                        TITLE, SUB)
            + f'<div style="display:flex;gap:18px;align-items:stretch">{cards}</div>'
            + '<div style="display:flex;align-items:center;gap:18px;margin-top:28px">'
            + mz.btn(f'Continue with {pick["go"]}', "p", "min-width:230px")
            + '<span style="font-size:13px;color:var(--soft)">'
              'You can change this later in Settings.</span></div>')


def chooser_phone(chosen="keys"):
    cards = '<div style="height:12px"></div>'.join(
        card_phone(o, o["key"] == chosen) for o in OPTIONS)
    pick = next(o for o in OPTIONS if o["key"] == chosen)
    return (mz.backbar(TITLE, "Your sync")
            + '<div style="padding:14px 20px 0;font-size:13.5px;line-height:21px;'
              f'color:var(--soft)">{SUB}</div>'
            + f'<div style="padding:18px 20px 0">{cards}'
            + '<div style="height:18px"></div>'
            + mz.btn(f'Continue with {pick["go"]}', "p", "width:100%")
            + '<div style="font-size:12.5px;color:var(--soft);text-align:center;'
              'margin-top:10px;padding-bottom:4px">'
              'You can change this later in Settings.</div></div>')


# ══ the flow chrome ══════════════════════════════════════════════════════════
# Placing the keys is a FLOW, not a settings page, and the difference is not
# cosmetic: this is the one screen in the product where leaving halfway loses
# something that cannot be fetched back. So it carries no sidebar and no bottom
# nav at either width — the same treatment `05.x` already uses for setting up,
# for the same reason.

STEPS = [("How you get back in", "Three keys, any two"),
         ("Place your three keys", "Two of them have to leave this phone")]


def _step(i, active, done, name, sub, total=2):
    if done:
        mark, bg, fg = "&#10003;", "var(--emerald)", "var(--onEmerald)"
    elif active:
        mark, bg, fg = str(i), "var(--ink)", "var(--bg)"
    else:
        mark, bg, fg = str(i), "var(--track)", "var(--soft)"
    rule = ('<span style="position:absolute;left:10px;top:26px;bottom:-14px;width:1.5px;'
            f'background:{"var(--emerald)" if done else "var(--line)"}"></span>'
            if i < total else "")
    s = (f'<div style="font-size:12.5px;line-height:19px;color:var(--soft);'
         f'margin-top:4px">{sub}</div>' if active else "")
    return ('<div style="display:flex;gap:14px;position:relative;padding-bottom:22px">'
            + rule
            + f'<span style="width:22px;height:22px;border-radius:12px;flex:0 0 auto;'
              f'background:{bg};color:{fg};display:flex;align-items:center;'
              f'justify-content:center;font-size:11px;font-weight:600;margin-top:2px">'
              f'{mark}</span><div style="min-width:0">'
              f'<div style="font-size:14.5px;line-height:21px;'
              f'font-weight:{600 if active else 500};'
              f'color:{"var(--ink)" if (active or done) else "var(--soft)"}">{name}</div>'
            + s + '</div></div>')


def flow_wide(active, content, kicker="Turning sync on",
              head="Two steps. The second one matters.",
              blurb="Nothing is stored anywhere until step two is finished, and "
                    "nothing here is ever shown to us.", steps=None):
    steps = steps or STEPS
    rail = "".join(_step(i + 1, i + 1 == active, i + 1 < active, n, s, len(steps))
                   for i, (n, s) in enumerate(steps))
    return ('<div style="flex:0 0 380px;background:var(--card2);'
            'border-right:1px solid var(--line);padding:52px 40px">'
            f'<div class="lab">{kicker}</div>'
            f'<div class="ser" style="font-size:22px;line-height:29px;margin-top:8px">'
            f'{head}</div>'
            f'<div style="font-size:13px;line-height:21px;color:var(--soft);'
            f'margin-top:10px">{blurb}</div>'
            f'<div style="margin-top:28px">{rail}</div></div>'
            '<div style="flex:1;min-width:0;padding:52px 56px;display:flex;'
            f'justify-content:center"><div style="width:100%;max-width:880px">'
            f'{content}</div></div>')


def flow_phone(active, title, content, foot, steps=None):
    steps = steps or STEPS
    dots = "".join(
        f'<span style="width:{24 if i + 1 == active else 8}px;height:8px;'
        f'border-radius:5px;background:'
        f'{"var(--emerald)" if i + 1 <= active else "var(--track)"}"></span>'
        for i in range(len(steps)))
    return ('<div style="padding:24px 20px 0">'
            f'<div style="display:flex;gap:6px;align-items:center">{dots}</div>'
            f'<div class="lab" style="margin-top:16px">Step {active} of {len(steps)}</div>'
            f'<div class="ser" style="font-size:30px;line-height:36px;margin-top:8px">'
            f'{title}</div></div>'
            f'<div style="padding:22px 20px 0">{content}</div>'
            f'{foot}')


def foot_phone(primary, back=True, quiet=None, live=True):
    q = (f'<div style="font-size:12px;line-height:18px;color:var(--soft);'
         f'padding:0 20px 20px;margin-top:-6px">{quiet}</div>' if quiet else "")
    b = (mz.btn("Back", "s", "flex:0 0 100px") if back else "")
    p = (mz.btn(primary, "p", "flex:1") if live
         else f'<div class="btn" style="flex:1;background:var(--track);'
              f'color:var(--faint);border-color:var(--line)">{primary}</div>')
    return (f'<div style="padding:22px 20px {20 if quiet else 24}px;'
            f'display:flex;gap:10px">{b}{p}</div>{q}')


def foot_wide(primary, back=True, quiet=None, live=True):
    q = (f'<div style="font-size:12.5px;color:var(--soft)">{quiet}</div>'
         if quiet else "")
    b = (mz.btn("Back", "s", "min-width:110px") if back else "")
    p = (mz.btn(primary, "p", "min-width:210px") if live
         else f'<div class="btn" style="min-width:210px;background:var(--track);'
              f'color:var(--faint);border-color:var(--line)">{primary}</div>')
    return ('<div style="display:flex;align-items:center;gap:14px;margin-top:30px">'
            f'{b}{p}{q}</div>')


# ══ the three keys ═══════════════════════════════════════════════════════════
# THE RULE THAT SHAPES THIS SCREEN: the three keys are never on one screen at
# the same time. A screenshot of such a screen would be two of three, which is
# the whole budget — so the screen that asks you to place them shows none of
# them, and each code is revealed only in the act of placing it. Key one is
# never shown at all, because it never leaves this phone.

KEYS = [
    dict(n=1, name="This phone", auto=True, acts=[], done_as="Kept here",
         blurb="Already in this phone&rsquo;s secure storage. It never leaves, and "
               "we never see it.",
         done="Already in this phone&rsquo;s secure storage. It never leaves, and "
              "we never see it."),
    dict(n=2, name="A printed slip", auto=False, done_as="Printed",
         acts=[("Print it", "p"), ("Save a PDF", "s")],
         blurb="Print it and keep it where you keep documents &mdash; not beside "
               "the phone.",
         done="Printed on 5 October. Lose the slip and you can print it again from "
              "Your sync &mdash; it is the same key, not a new one."),
    dict(n=3, name="Another device", auto=False, done_as="Sent",
         acts=[("Show a code to scan", "p"), ("Save a PDF", "s")],
         blurb="Your partner&rsquo;s phone, or a second device of your own. It "
               "becomes one of yours.",
         done="Scanned by Aisha&rsquo;s phone on 5 October. Her phone is now one "
              "of yours."),
]


def key_row(k, placed, compact=False):
    if placed:
        mark = ('<span class="tile" style="background:var(--em2);color:var(--emerald)">'
                + ic("check", 19, 2.3) + '</span>')
        tag = mz.pill(k["done_as"], "emerald", "em2")
    else:
        mark = ('<span class="tile" style="background:var(--track);color:var(--soft);'
                'font-size:14px;font-weight:600">' + str(k["n"]) + '</span>')
        tag = ""
    acts = ""
    if k["acts"] and not placed:
        acts = ('<div style="display:flex;gap:10px;margin-top:13px;flex-wrap:wrap">'
                + "".join(mz.btn(l, kind, "min-height:42px;font-size:13.5px")
                          for l, kind in k["acts"]) + '</div>')
    return (f'<div class="card" style="padding:{16 if compact else 17}px 18px;'
            'display:flex;gap:14px;align-items:flex-start">' + mark
            + '<div style="flex:1;min-width:0">'
            '<div style="display:flex;align-items:center;gap:10px">'
            f'<span style="font-size:14.5px;font-weight:600;flex:1;min-width:0">'
            f'Key {["one","two","three"][k["n"]-1]} &middot; {k["name"]}</span>{tag}</div>'
            f'<div style="font-size:13px;line-height:19px;color:var(--soft);'
            f'margin-top:4px">{k["done"] if placed else k["blurb"]}</div>{acts}</div></div>')


PAIRS = [("This phone", "the printed slip", True),
         ("This phone", "the other device", True),
         ("The printed slip", "the other device", True)]


def proof(compact=False):
    rows = "".join(
        '<div style="display:flex;gap:9px;align-items:flex-start;padding:7px 0;'
        f'font-size:{12.5 if compact else 13}px;line-height:19px">' + CHECK
        + f'<span>{a} <span style="color:var(--faint)">+</span> {b}</span></div>'
        for a, b, _ in PAIRS)
    return ('<div class="card" style="padding:16px 18px;background:var(--card2)">'
            '<div class="mlab" style="margin-bottom:6px">What opens your budget</div>'
            + rows
            + '<div style="display:flex;gap:9px;align-items:flex-start;'
              'border-top:1px solid var(--hair);margin-top:5px;padding-top:12px;'
              f'font-size:{12.5 if compact else 13}px;line-height:19px">' + CROSS
            + '<span>Any one of them on its own</span></div></div>')


KEYS_TITLE = "Your three keys"
KEYS_SUB = ("Any two of these three open your budget. One on its own opens nothing "
            "&mdash; so the two that leave this phone should not end up in the same "
            "place.")


def keys_wide(placed):
    rows = '<div style="height:12px"></div>'.join(
        key_row(k, k["auto"] or placed) for k in KEYS)
    return (f'<div class="ser" style="font-size:32px;line-height:38px">{KEYS_TITLE}</div>'
            f'<div style="font-size:14px;line-height:23px;color:var(--soft);'
            f'margin-top:10px;max-width:620px">{KEYS_SUB}</div>'
            '<div style="display:flex;gap:24px;align-items:flex-start;margin-top:26px">'
            f'<div style="flex:1;min-width:0">{rows}</div>'
            f'<div style="flex:0 0 288px">{proof()}</div></div>')


def keys_phone(placed):
    rows = '<div style="height:10px"></div>'.join(
        key_row(k, k["auto"] or placed, True) for k in KEYS)
    return (f'<div style="font-size:13.5px;line-height:21px;color:var(--soft);'
            f'margin-bottom:18px">{KEYS_SUB}</div>'
            + rows + '<div style="height:14px"></div>' + proof(True))


# ══ one key, on screen, in the act of being placed ═══════════════════════════
# This is the only screen that shows a key, and it shows exactly one. The code
# is grouped in fives because it will sometimes be read aloud across a room or
# typed from paper, and ungrouped strings are where that goes wrong.
#
# THE ENCODING IS NOT THE DESIGNER'S TO SETTLE. The alphabet, the length and the
# checksum belong to whoever builds the split — logged in `docs/open-items.md`.
# What the drawing fixes is the shape: five groups, five characters, the
# monospace face, and a QR beside it so the common path needs no typing at all.
KEY_CODE = "K3PWN-4TDQX-9BRHM-2FGKY-73VCE-MJ8RT"


def qr(seed="mizaniya-key-three", n=25, px=6):
    """A QR as a drawing, not an encoder. Deterministic, with real finder
    patterns, so the picture reads as a QR to a person without pretending to
    carry data a scanner could lift out of a design board."""
    g = [[0] * n for _ in range(n)]
    h = 2166136261
    for ch in seed:                       # FNV-1a, so the board is reproducible
        h = ((h ^ ord(ch)) * 16777619) & 0xFFFFFFFF
    for y in range(n):
        for x in range(n):
            h = (h * 1103515245 + 12345) & 0x7FFFFFFF
            g[y][x] = (h >> 16) & 1
    def finder(oy, ox):
        for y in range(7):
            for x in range(7):
                edge = y in (0, 6) or x in (0, 6)
                core = 2 <= y <= 4 and 2 <= x <= 4
                g[oy + y][ox + x] = 1 if (edge or core) else 0
        for y in range(-1, 8):            # the quiet ring around each finder
            for x in range(-1, 8):
                if 0 <= oy + y < n and 0 <= ox + x < n and not (0 <= y < 7 and 0 <= x < 7):
                    g[oy + y][ox + x] = 0
    finder(0, 0); finder(0, n - 7); finder(n - 7, 0)
    rects = "".join(f'<rect x="{x}" y="{y}" width="1" height="1"/>'
                    for y in range(n) for x in range(n) if g[y][x])
    return (f'<svg width="{n * px}" height="{n * px}" viewBox="0 0 {n} {n}" '
            f'shape-rendering="crispEdges" style="display:block">'
            f'<rect width="{n}" height="{n}" fill="var(--card)"/>'
            f'<g fill="var(--ink)">{rects}</g></svg>')


def code_block(code=KEY_CODE, size=15):
    return ('<div class="mono" style="display:grid;'
            'grid-template-columns:repeat(3,1fr);gap:8px">'
            + "".join('<span style="background:var(--card2);border:1px solid '
                      'var(--line);border-radius:8px;padding:7px 10px;text-align:center;'
                      f'font-size:{size}px;letter-spacing:.06em">{g}</span>'
                      for g in code.split("-")) + '</div>')


ONEKEY_SUB = ("Open Mīzāniyah on the other phone, choose <i>I already have a "
              "budget</i>, and scan this. If the camera will not do it, the code "
              "underneath is the same key typed out.")


def onekey(wide=True):
    w = 25 * (7 if wide else 6)
    return ('<div class="card" style="padding:22px;display:flex;'
            + ('gap:26px;align-items:flex-start">' if wide
               else 'flex-direction:column;gap:18px;align-items:center">')
            + f'<div style="flex:0 0 auto;padding:12px;background:var(--card);'
              f'border:1px solid var(--line);border-radius:14px">{qr(px=7 if wide else 6)}'
              '</div>'
            + '<div style="flex:1;min-width:0">'
              '<div class="mlab" style="margin-bottom:9px">Key three, typed out</div>'
            + code_block() +
            '<div style="display:flex;gap:9px;align-items:flex-start;margin-top:15px;'
            'font-size:13px;line-height:19px;color:var(--soft)">' + CHECK
            + '<span>This is one key. On its own it opens nothing &mdash; it is only '
              'half of what anyone would need.</span></div></div></div>')


# ══ the twelve words ═════════════════════════════════════════════════════════
# ADR-013 requires this screen to say plainly that whoever holds the words can
# see the money, and warns that burying it "is how a phrase ends up photographed
# into a chat". So the line names the photograph rather than the abstraction.
WORDS = ["mirror", "cradle", "orbit", "salmon", "timber", "velvet",
         "harvest", "nickel", "drift", "puzzle", "anchor", "meadow"]


def phrase_grid(cols=3, hide=()):
    cells = []
    for i, w in enumerate(WORDS, 1):
        shown = ("&middot;&middot;&middot;&middot;&middot;&middot;" if i in hide else w)
        col = "var(--faint)" if i in hide else "var(--ink)"
        cells.append(
            '<div style="display:flex;align-items:baseline;gap:9px;'
            'border:1px solid var(--line);border-radius:11px;background:var(--card);'
            'padding:11px 13px;min-height:46px">'
            f'<span class="mono" style="font-size:11px;color:var(--faint);'
            f'flex:0 0 16px">{i}</span>'
            f'<span style="font-size:15px;font-weight:500;color:{col}">{shown}</span>'
            '</div>')
    return (f'<div style="display:grid;grid-template-columns:repeat({cols},1fr);'
            f'gap:10px">' + "".join(cells) + '</div>')


PHRASE_SUB = ("These twelve words open your budget on any device, with nobody&rsquo;s "
              "help. Whoever has them can see your money, so a photograph of this "
              "screen is a copy of your budget.")


# ══ coming back: the screen that replaces sign-in ════════════════════════════
# `02 · Sign in` is gone, and this is what stands where it stood. The thing to
# get right is the hole it leaves: every person arriving here has the muscle
# memory of a *forgot password* link, and will hunt for one. So the screen
# answers that question before it is asked, in the place the link used to be.

def gate(title, sub, content, foot):
    return ('<div style="flex:1;min-width:0;min-height:100%;display:flex;'
            'flex-direction:column;align-items:center;justify-content:center;'
            'padding:64px 24px">'
            '<div style="width:100%;max-width:520px">'
            '<div style="display:flex;justify-content:center;padding-bottom:30px">'
            + LOCKUP_BIG + '</div>'
            f'<div class="ser" style="font-size:31px;line-height:37px;'
            f'text-align:center">{title}</div>'
            f'<div style="font-size:14px;line-height:23px;color:var(--soft);'
            f'margin-top:10px;text-align:center">{sub}</div>'
            f'<div style="margin-top:26px">{content}</div>{foot}</div></div>')


LOCKUP_BIG = mz.LOCKUP


def slot(label, state, hint, actions=True):
    """One of the two keys being offered. `state` is None, or the key's name."""
    if state:
        mark = ('<span class="tile" style="background:var(--em2);color:var(--emerald)">'
                + ic("check", 19, 2.3) + '</span>')
        right = mz.pill("Accepted", "emerald", "em2")
        body = (f'<div style="font-size:13px;line-height:19px;color:var(--soft);'
                f'margin-top:4px">{state}</div>')
    else:
        mark = ('<span class="tile" style="background:var(--track);color:var(--soft)">'
                + ic("shield", 19, 1.9) + '</span>')
        right = ""
        body = (f'<div style="font-size:13px;line-height:19px;color:var(--soft);'
                f'margin-top:4px">{hint}</div>'
                + ('<div style="display:flex;gap:10px;margin-top:13px">'
                   + mz.btn("Scan it", "p", "min-height:42px;font-size:13.5px")
                   + mz.btn("Type it in", "s", "min-height:42px;font-size:13.5px")
                   + '</div>' if actions else ""))
    return ('<div class="card" style="padding:17px 18px;display:flex;gap:14px;'
            'align-items:flex-start">' + mark
            + '<div style="flex:1;min-width:0">'
              '<div style="display:flex;align-items:center;gap:10px">'
              f'<span style="font-size:14.5px;font-weight:600;flex:1;min-width:0">'
              f'{label}</span>{right}</div>' + body + '</div></div>')


NO_RESET = ("There is nothing to reset here. No password, no account, no address "
            "to send a link to &mdash; two of your keys is the only way in, and it "
            "is the same reason nobody else can get in either.")


def no_reset_line():
    return ('<div style="display:flex;gap:10px;align-items:flex-start;'
            'margin-top:22px;padding-top:20px;border-top:1px solid var(--hair);'
            'font-size:12.5px;line-height:19px;color:var(--soft)">'
            '<span style="color:var(--soft);display:flex;flex:0 0 auto;margin-top:1px">'
            + ic("shield", 16, 1.9) + f'</span><span>{NO_RESET}</span></div>')


def entry(one_in):
    a = slot("First key", "The printed slip" if one_in else None,
             "Scan the QR on your other phone, or type the code from the slip.")
    b = slot("Second key", None,
             "Any one of the other two. One more and your budget is here."
             if one_in else "One is not enough on its own, so it asks for two.")
    live = False
    primary = ("One more key" if one_in else "Open my budget")
    return (a + '<div style="height:12px"></div>' + b, primary, live)


def foot_gate(primary, live=True):
    """A gate has exactly one action, and it spans the column. There is no Back:
    the only other thing a person can do here is start a new budget, which is
    not a smaller version of this and does not belong beside it."""
    b = (mz.btn(primary, "p", "width:100%") if live
         else f'<div class="btn" style="width:100%;background:var(--track);'
              f'color:var(--faint);border-color:var(--line)">{primary}</div>')
    return f'<div style="margin-top:24px">{b}</div>'


# ══ household ════════════════════════════════════════════════════════════════
# WHAT ADR-013 TOOK AWAY HERE, and it is bigger than "invitations become keys":
# **the roles are gone.** The committed boards carried an account holder who
# could not be removed and a member who could not change billing. There is no
# billing, and — the part that matters — nothing in the design distinguishes
# one device from another. Possession of the key is the whole of the
# authorisation, so either person can remove the other. A screen that implied a
# hierarchy would be promising something the architecture cannot keep, and the
# person who would find that out is the one who was removed.
#
# Logged against stories L1–L5 in `docs/open-items.md`: the role model is void.

WARN = ('<span style="color:var(--ochre);display:flex;flex:0 0 auto;margin-top:1px">'
        + ic("warn", 16, 2.1) + '</span>')


def claim(lead, body, glyph=None, last=False):
    g = (f'<div style="display:flex;gap:9px;align-items:flex-start">{glyph}'
         '<div>' if glyph else '<div>')
    rule = "" if last else "border-bottom:1px solid var(--hair);"
    return (f'<div style="padding:13px 0;{rule}">'
            + g + f'<div style="font-size:14px;font-weight:600;line-height:20px">'
                  f'{lead}</div>'
            f'<div style="font-size:13px;line-height:19px;color:var(--soft);'
            f'margin-top:3px">{body}</div></div>'
            + ('</div>' if glyph else '') + '</div>')


SHARING = [
    ("Their phone becomes one of yours",
     "What either of you records lands in the same cycle, and every movement "
     "carries the name of whoever recorded it."),
    ("They see everything you see",
     "Every figure, every debt, every goal. There is no partial view and nothing "
     "that can be held back."),
    ("There is no owner",
     "They can remove you exactly as you can remove them. Nothing here makes one "
     "of you senior to the other."),
    ("You can remove them later",
     "They stop seeing anything new from that moment, and they keep whatever was "
     "already on their phone."),
]


def sharing_card(title="What sharing means"):
    rows = "".join(claim(a, b, last=(i == len(SHARING) - 1))
                   for i, (a, b) in enumerate(SHARING))
    return ('<div class="card" style="padding:4px 18px 12px">'
            f'<div class="mlab" style="padding:14px 0 2px">{title}</div>'
            + rows + '</div>')


DISAGREE = ('<div class="card" style="padding:16px 18px;background:var(--card2)">'
            '<div class="mlab" style="margin-bottom:7px">When you set different '
            'amounts</div>'
            '<div style="font-size:13px;line-height:20px;color:var(--soft)">'
            'Nobody&rsquo;s figure wins automatically and nothing is overwritten. '
            '<b style="color:var(--ink)">Both amounts are kept</b>, the row says so, '
            'and one of you chooses &mdash; which is what two people sharing a budget '
            'actually do. With no server in the middle there is nothing that could '
            'referee it, and nothing that would.</div></div>')


REMOVE = [
    ("She stops seeing anything new",
     "The moment you finish. Her phone looks for the budget at an address that is "
     "gone, and will not find another one.", True),
    ("What is already on her phone stays there",
     "A copy up to today, and nothing can reach across and remove it. We will not "
     "pretend otherwise.", False),
    ("Your other keys change too",
     "The printed slip stops working, and so does every other device. You will "
     "place three new keys before this is done.", None),
]


def remove_rows():
    g = {True: CHECK, False: CROSS, None: WARN}
    return "".join(claim(a, b, g[k], last=(i == len(REMOVE) - 1))
                   for i, (a, b, k) in enumerate(REMOVE))
