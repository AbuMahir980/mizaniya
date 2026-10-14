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
HOLD = [
    ("One encrypted file",
     "Your whole budget, encrypted on your device before it leaves it. We hold no "
     "key to it, so what we have is a block of noise with a size.",
     "Until you delete it"),
    ("The address it sits at",
     "A long random string your device works out from your own keys. It is not "
     "derived from your name, your email or anything about you &mdash; we have "
     "none of those to derive it from.",
     "Until you delete it"),
]

NOT_HOLD = [
    ("Your name, email or phone number",
     "There is no account, so there was never anywhere to put them. Nothing to "
     "verify, nothing to reset, and nothing to leak."),
    ("Your card number",
     "There is nothing to pay for. Payment does not exist in this product, so "
     "neither does a card number &mdash; not the full one, not the last four."),
    ("Your BVN, NIN, address or date of birth",
     "We have no use for any of them, so we do not ask."),
    ("A list of your devices",
     "We cannot tell one device from another, or yours from anyone else&rsquo;s. "
     "The store sees requests for an address and nothing more."),
    ("Your contacts, your location, or anything for advertising",
     "There is no advertising in Mizaniya and there is nothing to sell."),
]

LIMITS = [
    ("A key you have shared",
     "Whoever holds two keys sees everything you see, because that is what "
     "sharing is. Removing them stops what comes next; it does not unsee what "
     "came before."),
    ("Two keys somebody finds",
     "One on its own opens nothing. Two opens everything &mdash; which is why the "
     "two that leave your phone should not end up in the same drawer."),
    ("A copy already on someone&rsquo;s phone",
     "Deleting the stored copy reaches the copy we hold. It does not reach one "
     "that has already been synced onto a device, and nothing we could build "
     "would."),
    ("Losing your keys",
     "There is nobody to ask, and we could not help if you asked us. It is the "
     "same fact as nobody else being able to get in, read from the other side."),
]

DECIDE = [
    ("We keep only what we can name a use for",
     "If we cannot say what a piece of information is for, we should not be "
     "holding it. That is the test every row above has to pass."),
    ("Nobody builds Mizaniya against your figures",
     "Development and testing run on made-up households. Your budget is not a "
     "test fixture."),
    ("Deleting the copy deletes it",
     "Not a flag on a row. The file goes, and the address is refused from then on "
     "rather than left empty, so nothing can be put back at it."),
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
SEC_LEAD = ("Not a policy &mdash; there is no key on our side to read it with. That "
            "is a real promise and a narrow one, so what follows is exactly what it "
            "covers and, in the same size type, exactly what it does not.")


def security_body():
    return (SPLIT_A + SEC_HEAD + '</div>'
            '<div style="font-size:17.5px;line-height:29px;color:var(--soft);'
            f'margin-top:16px">{SEC_LEAD}</div>'
            + block("What we hold, and what for", HOLD)
            + block("What we do not hold at all", NOT_HOLD)
            + block("What this does not protect you from", LIMITS, r.CROSS)
            + block("How we decide", DECIDE)
            + '<div style="font-size:14.5px;line-height:24px;color:var(--soft);'
              'margin-top:30px">Last reviewed 14 October 2026. An undated privacy '
              'page is a promise with no expiry, so this one carries its date and '
              'changes carry a new one.</div>')


# ── swapping a public page's body without retyping its chrome ────────────────
OLD_HEAD = "We never store your bank data in readable form."
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
    pos = body.index(OLD_HEAD)
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
# The owner's words, kept word for word. Two rules came with them and both are
# about scope rather than style: do not overclaim — each line is true at exactly
# its own width and not an inch further — and do not explain the cryptography,
# because nobody needs to read the word Shamir to trust a budgeting app.
#
# So the section is eight questions a visitor actually has, and eight answers
# that stop where the truth stops. "One on its own opens nothing" is a complete
# claim. "Nobody can ever see your data" would not be one, and is not here.
EIGHT = [
    ("Do I need an account?", "<b>No.</b> No email, no password, nothing to verify."),
    ("Where is my money data?", "On your device. It works with no signal at all."),
    ("Can you see my budget?",
     "<b>No.</b> It is encrypted before it leaves, and we hold no key."),
    ("How do I get it on my other phone?",
     "Two of your three keys, and it is there."),
    ("What if I lose one?", "Any two of the three bring it back."),
    ("What if someone finds one?", "One on its own opens nothing."),
    ("Can I share it with my partner?",
     "Yes &mdash; their phone becomes one of yours."),
    ("Can I remove them later?",
     "Yes. They stop seeing anything new from that moment."),
]

EIGHT_HEAD = "There is nothing to sign up for."
EIGHT_LEAD = ("Most of what a budgeting app asks for at the door exists so that it "
              "can hold your figures for you. Mizaniya does not hold them, so it "
              "does not ask.")


def eight_section(wide=True):
    pad = "96px 150px" if wide else "44px 24px"
    cols = 2 if wide else 1
    qs = "".join(
        '<div style="padding:18px 0;border-top:1px solid var(--hair)">'
        f'<div style="font-size:{15 if wide else 14}px;line-height:22px;'
        f'color:var(--soft)">{q}</div>'
        f'<div style="font-size:{18 if wide else 16}px;line-height:'
        f'{28 if wide else 25}px;color:var(--ink);margin-top:5px">{a}</div></div>'
        for q, a in EIGHT)
    head = (f'<div class="h2" style="max-width:620px">{EIGHT_HEAD}</div>'
            if wide else
            f'<div class="ser" style="font-size:26px;line-height:33px">'
            f'{EIGHT_HEAD}</div>')
    return (f'<div style="background:var(--bg);border-top:1px solid var(--line);'
            f'padding:{pad}">'
            '<div class="kicker" style="margin-bottom:14px">How it works</div>'
            + head
            + f'<div style="font-size:{16 if wide else 14}px;line-height:'
              f'{27 if wide else 22}px;color:var(--soft);margin-top:14px;'
              f'max-width:560px">{EIGHT_LEAD}</div>'
            + f'<div style="display:grid;grid-template-columns:repeat({cols},1fr);'
              f'gap:0 {56 if wide else 0}px;margin-top:{30 if wide else 22}px">'
            + qs + '</div></div>')


def insert_eight(name, anchor, wide):
    p = os.path.join(SRC, name)
    s = io.open(p, encoding="utf-8").read()
    assert s.count(anchor) == 1, (name, s.count(anchor))
    s = s.replace(anchor, eight_section(wide) + anchor)
    assert s.count("<div") == s.count("</div>"), name
    io.open(p, "w", encoding="utf-8").write(s)
    return name
