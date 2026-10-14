# -*- coding: utf-8 -*-
"""build_pages.py — the pages ADR-013 rewrote rather than created.

Three of these are not new drawings but new *claims*: 20 and 21 said what a
server held, and the server is gone. The rule the owner set for this rewrite is
the whole of its difficulty — "We cannot read your budget" is true, and "nobody
can ever see your data" is not, once a key is shared or found. So the page is
built in two halves that are the same size: what the promise covers, and what
it does not.
"""
import io, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mz, recovery as r
from mz import ic

SRC = mz.SRC
SPLIT_A = '<div class="ser" style="font-size:40px;line-height:49px">'
FOOT = ('</div></div><div style="background:var(--card2);'
        'border-top:2px solid var(--ink);padding:56px 150px 48px">')


def page_parts(name):
    """Head and foot of a public page, taken from the committed board so the
    navigation, the lockup and the footer cannot drift out of step with it."""
    s = io.open(os.path.join(SRC, name), encoding="utf-8").read()
    helmet, b = s.split("</helmet>", 1)
    f0 = b.index('<div class="mz"')
    pre = b[:b.index('">', f0) + 2]
    body = b[b.index('">', f0) + 2:]
    a = body.index(SPLIT_A)
    z = body.index(FOOT)
    return body[:a], body[z:]


# ══ 20 · security and privacy ════════════════════════════════════════════════
# Every row here used to be two sentences: one that said the thing and one that
# explained it. The second sentence was always me, not the reader. Cut 14 Oct.
HOLD = [
    ("One encrypted file",
     "Encrypted on your device before it leaves. We hold no key to it.",
     "Until you delete it"),
    ("The address it sits at",
     "Worked out from your own keys. Not from your name or email &mdash; we have "
     "neither.",
     "Until you delete it"),
]

NOT_HOLD = [
    ("Your name, email or phone number",
     "There is no account, so there was never anywhere to put them."),
    ("Your card number", "There is nothing to pay for."),
    ("Your BVN, NIN, address or date of birth", "We have no use for them."),
    ("A list of your devices",
     "We cannot tell one device from another, or yours from anyone else&rsquo;s."),
    ("Your contacts, your location, or anything for advertising",
     "There is no advertising in Mizaniya and nothing to sell."),
]

LIMITS = [
    ("A key you have shared",
     "They see everything you see. Removing them stops what comes next, not what "
     "came before."),
    ("Two keys somebody finds",
     "One opens nothing. Two opens everything, so keep them in different places."),
    ("A copy already on someone&rsquo;s phone",
     "Deleting reaches our copy, not one already on their device."),
    ("Losing your keys",
     "There is nobody to ask. It is the same fact as nobody else getting in."),
]

DECIDE = [
    ("We keep only what we can name a use for",
     "If we cannot say what it is for, we should not hold it."),
    ("Nobody builds Mizaniya against your figures",
     "Development and testing run on made-up households."),
    ("Deleting the copy deletes it",
     "The file goes, and nothing can be put back at its address."),
]


def big_row(lead, body, mono=None, glyph=None, last=False):
    m = (f'<div class="mono" style="font-size:12px;color:var(--soft);'
         f'margin-top:8px">{mono}</div>' if mono else "")
    g = (f'<div style="display:flex;gap:12px;align-items:flex-start">{glyph}<div>'
         if glyph else "<div>")
    rule = "" if last else "border-bottom:1px solid var(--hair);"
    return (f'<div style="padding:20px 0;{rule}">' + g
            + f'<div style="font-size:17px;font-weight:600;line-height:25px">{lead}</div>'
            + f'<div style="font-size:15.5px;line-height:26px;color:var(--soft);'
              f'margin-top:6px">{body}</div>{m}</div></div>')


def block(label, rows, glyph=None, top=46):
    out = []
    for i, row in enumerate(rows):
        lead, body = row[0], row[1]
        mono = row[2] if len(row) > 2 else None
        out.append(big_row(lead, body, mono, glyph, last=(i == len(rows) - 1)))
    return (f'<div class="lab" style="margin-top:{top}px">{label}</div>'
            f'<div style="margin-top:10px">' + "".join(out) + '</div>')


SEC_HEAD = "We cannot read your budget."
SEC_LEAD = ("There is no key on our side to read it with. Below is what that "
            "covers, and what it does not.")


def security_body():
    return (SPLIT_A + SEC_HEAD + '</div>'
            '<div style="font-size:17.5px;line-height:29px;color:var(--soft);'
            f'margin-top:16px">{SEC_LEAD}</div>'
            + block("What we hold, and what for", HOLD)
            + block("What we do not hold at all", NOT_HOLD)
            + block("What this does not protect you from", LIMITS, r.CROSS)
            + block("How we decide", DECIDE)
            + '<div style="font-size:14.5px;line-height:24px;color:var(--soft);'
              'margin-top:30px">Last reviewed 14 October 2026.</div>')


# ── swapping a public page's body without retyping its chrome ────────────────
# The anchor is whichever headline is on the page now: the original bank
# sentence the first time, this page's own headline every time after.
OLD_HEAD = "We never store your bank data in readable form."
NOW_HEAD = "We cannot read your budget."
FOOTER_DIV = ('<div style="background:var(--card2);border-top:2px solid var(--ink);'
              'padding:')


def swap_body(name, new_body, title, note):
    """Replace a public page's content between the hero and the footer.

    The closing tags that sat between the two are recomputed rather than
    guessed: whatever the head leaves open, the footer does not close, is what
    goes back in. That keeps the splice honest at both widths, where the
    wrappers differ."""
    s = io.open(os.path.join(SRC, name), encoding="utf-8").read()
    helmet, b = s.split("</helmet>", 1)
    f0 = b.index('<div class="mz"')
    pre, body = b[:b.index('">', f0) + 2], b[b.index('">', f0) + 2:]
    post = ""
    # the board's own tail (note, </x-dc>, …) comes after the frame closes
    end = mz._match_close(body, 0) if body.startswith("<div") else None
    pos = body.index(OLD_HEAD if OLD_HEAD in body else NOW_HEAD)
    a = body.rindex('<div class="ser"', 0, pos)
    z = body.index(FOOTER_DIV)
    head, foot = body[:a], body[z:]
    # How many wrappers sat between the old body and the footer is not guessed:
    # it is whatever makes the finished file balance, counted from the file.
    stem = helmet + pre + head + new_body + foot
    n = stem.count("<div") - stem.count("</div>")
    assert n >= 0, (name, n)
    out = pre + head + new_body + "</div>" * n + foot
    full = helmet + "</helmet>" + out
    # the title line and the note live in the board's own wrapper, not the frame
    m = mz.TITLE_RE.search(full)
    full = full[:m.start(2)] + title + full[m.end(2):]
    nm = full.index("<!--/note-->")
    n1 = full.rindex("</div>", 0, nm)
    n0 = full.rindex('">', 0, n1) + 2
    full = full[:n0] + note + full[n1:]
    assert full.count("<div") == full.count("</div>"), f"{name} unbalanced"
    io.open(os.path.join(SRC, name), "w", encoding="utf-8").write(full)
    return name


# ══ the eight lines, on the landing page ═════════════════════════════════════
# The owner's eight questions, trimmed on 14 October after reading them back as a
# block: "the How it works section is too long." The scope of each answer is
# still where the honesty lives, so the trimming took adjectives, never a
# qualifier — "we hold no key to it" survives because it is the claim.
#
# THE RAIL, AND THE RULE IT HAS TO OBEY. `motion.md` §9 lets the landing page
# perform and binds it to exactly two things, one of which is: it must read
# completely with motion off, and **nothing may be gated behind a scroll
# animation.** So this is a rail you can drag, not a sequence you must watch:
# all eight cards exist in the DOM in order, the rail scrolls by hand, and the
# animation only decides how they ARRIVE. With motion off they are simply there.
# A page selling an offline-first app cannot require animation to make its case.
EIGHT = [
    ("Do I need an account?", "<b>No.</b> No email, no password."),
    ("Where is my money data?", "<b>On your device.</b> It works with no signal."),
    ("Can you see my budget?", "<b>No.</b> We hold no key to it."),
    ("How do I get it on my other phone?", "<b>Two of your three keys.</b>"),
    ("What if I lose one?", "<b>Any two bring it back.</b>"),
    ("What if someone finds one?", "<b>One alone opens nothing.</b>"),
    ("Can I share it with my partner?",
     "<b>Yes.</b> Their phone becomes one of yours."),
    ("Can I remove them later?", "<b>Yes.</b> They stop seeing anything new."),
]

EIGHT_HEAD = "There is nothing to sign up for."


def eight_card(i, q, a, w, off=0, dim=1.0):
    """One card on the rail. `off` and `dim` exist so the motion study can draw
    the same card mid-arrival without a second definition of it."""
    t = (f"transform:translateX({off}px);opacity:{dim};" if off or dim < 1 else "")
    return (f'<div style="flex:0 0 {w}px;background:var(--card);'
            f'border:1px solid var(--line);border-radius:18px;'
            f'padding:20px 22px 22px;box-shadow:var(--shadow);{t}">'
            f'<div class="mono" style="font-size:10px;letter-spacing:.14em;'
            f'color:var(--faint)">{i:02d}</div>'
            f'<div style="font-size:14px;line-height:21px;color:var(--soft);'
            f'margin-top:14px;min-height:42px">{q}</div>'
            f'<div style="font-size:17.5px;line-height:27px;color:var(--ink);'
            f'margin-top:8px">{a}</div></div>')


def _arrows():
    def a(rot):
        return ('<span style="width:40px;height:40px;border-radius:20px;'
                'border:1px solid var(--line);background:var(--card);'
                'display:inline-flex;align-items:center;justify-content:center;'
                f'color:var(--soft);transform:rotate({rot}deg)">'
                + mz.ic("chev", 18, 2) + '</span>')
    return ('<div style="display:flex;gap:10px;flex:0 0 auto">'
            + a(180) + a(0) + '</div>')


def eight_section(wide=True, offsets=None, dims=None):
    pad = "96px 150px" if wide else "44px 24px"
    cw = 318 if wide else 258
    offsets = offsets or [0] * 8
    dims = dims or [1.0] * 8
    cards = "".join(eight_card(i + 1, q, a, cw, offsets[i], dims[i])
                    for i, (q, a) in enumerate(EIGHT))
    head = (f'<div class="h2" style="max-width:620px">{EIGHT_HEAD}</div>'
            if wide else
            f'<div class="ser" style="font-size:26px;line-height:33px">'
            f'{EIGHT_HEAD}</div>')
    top = ('<div style="display:flex;align-items:flex-end;justify-content:space-between;'
           'gap:24px">'
           '<div><div class="kicker" style="margin-bottom:14px">How it works</div>'
           + head + '</div>' + (_arrows() if wide else "") + '</div>')
    # The rail bleeds to the right edge: a card cut by the viewport is what says
    # there are more, and it says it without a label.
    bleed = "margin:34px -150px 0 0;padding-right:150px" if wide else \
            "margin:24px -24px 0 0;padding-right:24px"
    rail = (f'<div style="{bleed};overflow:hidden">'
            f'<div style="display:flex;gap:16px;align-items:stretch">'
            f'{cards}</div></div>')
    return (f'<div style="background:var(--bg);border-top:1px solid var(--line);'
            f'padding:{pad};overflow:hidden">{top}{rail}</div>')


def insert_eight(name, anchor, wide):
    p = os.path.join(SRC, name)
    s = io.open(p, encoding="utf-8").read()
    assert s.count(anchor) == 1, (name, s.count(anchor))
    s = s.replace(anchor, eight_section(wide) + anchor)
    assert s.count("<div") == s.count("</div>"), name
    io.open(p, "w", encoding="utf-8").write(s)
    return name


def swap_eight(name, wide):
    """Replace a rail already on the board with a freshly built one."""
    p = os.path.join(SRC, name)
    s = io.open(p, encoding="utf-8").read()
    mark = '<div class="kicker" style="margin-bottom:14px">How it works</div>'
    assert s.count(mark) == 1, (name, s.count(mark))
    i = s.rindex('<div style="background:var(--bg);border-top:1px solid var(--line);',
                 0, s.index(mark))
    j = mz._match_close(s, i)
    s = s[:i] + eight_section(wide) + s[j:]
    assert s.count("<div") == s.count("</div>"), name
    io.open(p, "w", encoding="utf-8").write(s)
    return name
