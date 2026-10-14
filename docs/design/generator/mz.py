"""mz.py — the Mizaniya artboard generator, rebuilt 14 October 2026.

WHY THIS FILE EXISTS, AND WHY IT IS IN THE REPO THIS TIME.

The original generator was about forty Python modules that produced all 263
artboards. It lived in a cloud container and was never committed — only its
output was. The container was reclaimed and the toolchain went with it.

**Nothing was lost, because the output is the source.** Every `.dc.html`
artboard is self-contained: the full stylesheet inline in its `<helmet>`, the
theme as custom properties on the `.mz` wrapper. 246 of 263 boards carry a
byte-identical helmet. So this file does not rebuild the old generator; it does
something more robust:

**It takes a committed board as a TEMPLATE and replaces three slots in it** —
the title line, the frame's contents, and the note. The chrome, the stylesheet,
the fonts and the tokens are never retyped, so they cannot drift. A board
produced here is byte-identical to a board produced in September except in the
three places that are meant to differ.

The cost of the old approach was a library of component functions that had to be
kept in step with the drawings. The cost of this one is that a NEW component has
to be written as markup rather than composed from existing ones — which is the
right trade when the drawings are the thing that already exists and the
components are the thing that was lost.
"""
import io
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "src", "canvas")

# The two template boards. Both are 1440/360 at the *light* theme; the dark
# variant of each supplies the dark token string, and nothing else differs.
T_WIDE = "WebSettingsLight.dc.html"
T_PHONE = "MwSettingsLight.dc.html"


def _read(name):
    return io.open(os.path.join(SRC, name), encoding="utf-8").read()


def _after_helmet(s):
    return s.split("</helmet>", 1)


def _match_close(s, open_at):
    """Index just past the `</div>` that closes the div opening at `open_at`."""
    i = s.index('>', open_at) + 1
    depth = 1
    while depth:
        a, b = s.find("<div", i), s.find("</div>", i)
        assert b >= 0, "unbalanced div"
        if 0 <= a < b:
            depth, i = depth + 1, a + 4
        else:
            depth, i = depth - 1, b + 6
    return i


# ── the three slots, located once per template ───────────────────────────────
TITLE_RE = re.compile(
    r'(<div style="font-size:11px;letter-spacing:\.14em;[^"]*">)([^<]*)(</div>)')


def _slots(board):
    """(head, title, mid, inner, tail_before_note, note, tail) for a template."""
    helmet, body = _after_helmet(board)
    m = TITLE_RE.search(body)
    assert m, "no title line"
    t0, t1 = m.start(2), m.end(2)

    f0 = body.index('<div class="mz"', t1)
    f_open_end = body.index('">', f0) + 2
    f1 = _match_close(body, f0) - len("</div>")

    n_mark = body.index("<!--/note-->")
    # The slot is the note's TEXT, not its container: `n1` stops before the
    # `</div>` that closes the note, so a supplied note keeps the template's
    # own div balance instead of swallowing a closing tag.
    n1 = body.rindex("</div>", 0, n_mark)
    n0 = body.rindex('">', 0, n1) + 2

    return dict(helmet=helmet, body=body, title=(t0, t1),
                frame=(f_open_end, f1), note=(n0, n1))


WIDE = _slots(_read(T_WIDE))
PHONE = _slots(_read(T_PHONE))

# ── the theme tokens, lifted rather than retyped ─────────────────────────────
TOKEN_RE = re.compile(r'<div class="mz" style="(--bg:[^"]*?)(?:width:)')
LIGHT = TOKEN_RE.search(_read(T_WIDE)).group(1)
DARK = TOKEN_RE.search(_read("WebSettingsDark.dc.html")).group(1)
assert LIGHT != DARK and "--bg:" in DARK

# The board's own paper and title ink differ by theme; both come from the
# templates so the two themes keep the contrast they were audited at.
PAPER = {"light": ("#EDE7DA", "#5A564A"), "dark": ("#15181A", "#7E8A92")}
_dark_body = _after_helmet(_read("WebSettingsDark.dc.html"))[1]
_m = re.search(r'background:(#[0-9A-Fa-f]{6});padding:36px', _dark_body)
_t = re.search(r'text-transform:uppercase;font-weight:600;color:(#[0-9A-Fa-f]{6})', _dark_body)
if _m and _t:
    PAPER["dark"] = (_m.group(1), _t.group(1))


def board(title, theme, inner, note=None, wide=True):
    """One artboard: the committed chrome, with three slots filled.

    `inner` is what goes INSIDE the `.mz` frame — the frame itself, its tokens
    and its radius come from the template, so a board drawn here cannot drift
    from one drawn in September.
    """
    t = WIDE if wide else PHONE
    b = t["body"]
    n0, n1 = t["note"]
    f0, f1 = t["frame"]
    t0, t1 = t["title"]
    out = (b[:t0] + title + b[t1:f0] + inner + b[f1:n0]
           + (note or "") + b[n1:])
    # the frame's tokens and the board's paper follow the theme
    if theme == "dark":
        out = out.replace(LIGHT, DARK)
        pl, tl = PAPER["light"]
        pd, td = PAPER["dark"]
        out = out.replace(f'background:{pl};padding:36px', f'background:{pd};padding:36px')
        out = out.replace(f'uppercase;font-weight:600;color:{tl}', f'uppercase;font-weight:600;color:{td}')
    return t["helmet"] + "</helmet>" + out


def write(name, title, theme, inner, note=None, wide=True):
    html = board(title, theme, inner, note, wide)
    assert html.count("<div") == html.count("</div>"), f"{name}: unbalanced"
    io.open(os.path.join(SRC, name + ".dc.html"), "w", encoding="utf-8").write(html)
    return name


# ══ the two frames, lifted from the templates ════════════════════════════════

def _frame_of(template_name, wide):
    t = WIDE if wide else PHONE
    b = _after_helmet(_read(template_name))[1]
    f0 = b.index('<div class="mz"')
    return b[b.index('">', f0) + 2:_match_close(b, f0) - len("</div>")]


NAV = ["Home", "Plan", "Transactions", "Debts &amp; Goals", "Months", "Zakat"]


def shell(active, content, width=1180, add="Add a movement"):
    """The 1440 frame: sidebar, top bar, content column.

    Rebuilt from `WebSettingsLight`'s own markup so the lockup, the nav
    geometry and the Settings footer group are the committed ones.
    """
    def item(n, icon, on):
        return ('<div style="display:flex;align-items:center;gap:12px;min-height:46px;'
                'padding:0 14px;border-radius:12px;font-size:14.5px;'
                + ('background:var(--em2);color:var(--emerald);font-weight:600;'
                   if on else 'color:var(--soft);')
                + f'">{ic(icon, 19, 1.85)}<span>{n}</span></div>')

    icons = ["home", "plan", "spark", "debts", "cal", "target"]
    nav = "".join(item(n, i, n == active) for n, i in zip(NAV, icons))
    foot = ('<div style="flex:1;min-height:26px"></div>'
            + item("Settings", "cog", active == "Settings"))
    return (
        '<div style="width:252px;flex:0 0 252px;border-right:1px solid var(--line);'
        'padding:26px 14px;display:flex;flex-direction:column;gap:4px;'
        'background:var(--card)">'
        '<div style="padding:0 14px 22px">' + LOCKUP + '</div>'
        f'{nav}{foot}</div>'
        '<div style="flex:1;min-width:0;display:flex;flex-direction:column">'
        '<div style="display:flex;align-items:center;justify-content:space-between;'
        'gap:18px;padding:20px 36px;border-bottom:1px solid var(--line)">'
        '<div><div class="lab" style="font-size:9.5px">Monday</div>'
        '<div class="ser" style="font-size:18px;margin-top:1px">5 October '
        '<span style="color:var(--soft)">· 24 Rabiʻ II 1448</span></div></div>'
        + (f'<div class="btn btn-p" style="min-width:120px">{ic("add", 20, 2.1)}{add}</div>'
           if add else "")
        + '</div>'
        f'<div style="padding:36px;display:flex;justify-content:center">'
        f'<div style="width:100%;max-width:{width}px">{content}</div></div></div>')


def phone(body, nav="More"):
    """The 360 frame: the app bar, the body, the bottom nav."""
    items = [("Home", "home"), ("Plan", "plan"), None, ("Debts", "debts"),
             ("More", "more")]
    out = ['<div class="nav">']
    for it in items:
        if it is None:
            out.append('<div style="flex:0 0 auto;margin:0 6px">'
                       '<div style="width:56px;height:56px;border-radius:19px;'
                       'background:var(--emerald);color:var(--onEmerald);display:flex;'
                       'align-items:center;justify-content:center;box-shadow:var(--lift)">'
                       + ic("add", 25, 2.2) + '</div></div>')
            continue
        lbl, icon = it
        on = " on" if lbl == nav else ""
        out.append(f'<div class="nav-i{on}">{ic(icon, 21, 1.9)}<span>{lbl}</span></div>')
    return APPBAR + body + "".join(out) + "</div>"


# ── the lockup and the app bar, lifted verbatim ──────────────────────────────
_w = _frame_of(T_WIDE, True)
LOCKUP = _w[_w.index('<div style="display:flex;align-items:center;gap:10px;color:var(--emerald)">'):]
LOCKUP = LOCKUP[:_match_close(LOCKUP, 0)]

_p = _frame_of(T_PHONE, False)
APPBAR = _p[:_match_close(_p, 0)]
assert "Mīzāniyah" in APPBAR and "Mīzāniyah" in LOCKUP


# ══ primitives ═══════════════════════════════════════════════════════════════

ICONS = json.loads(io.open(os.path.join(HERE, "icons.json"), encoding="utf-8").read())


def ic(name, size=20, sw=1.9):
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" '
            f'stroke="currentColor" stroke-width="{sw}" stroke-linecap="round" '
            f'stroke-linejoin="round" style="flex:0 0 auto;display:block">'
            f'{ICONS[name]}</svg>')


def card(inner, pad=17, extra=""):
    return f'<div class="card" style="padding:{pad}px;{extra}">{inner}</div>'


def sec(label, right=""):
    r = f'<span class="lab" style="font-size:10px">{right}</span>' if right else ""
    return ('<div style="display:flex;align-items:baseline;justify-content:space-between;'
            f'gap:10px;padding:0 0 4px"><span class="lab">{label}</span>{r}</div>')


def pill(word, fg, tint):
    return (f'<span class="pill" style="background:var(--{tint});color:var(--{fg})">'
            f'{word}</span>')


def btn(label, kind="p", extra=""):
    cls = {"p": "btn btn-p", "s": "btn btn-s", "q": "btn btn-q"}[kind]
    border = 'border:1px solid var(--line);' if kind in ("s", "q") else ""
    return f'<div class="{cls}" style="{border}{extra}">{label}</div>'


def crumb(*parts):
    sep = f'<span style="color:var(--faint);display:flex">{ic("chev", 13, 2.2)}</span>'
    return ('<div class="lab" style="display:flex;align-items:center;gap:7px;'
            'flex-wrap:wrap">' + sep.join(parts) + '</div>')


def backbar(title, parent, sub=None):
    s = (f'<div style="font-size:12.5px;color:var(--soft);margin-top:3px">{sub}</div>'
         if sub else "")
    return ('<div style="padding:22px 20px 0;display:flex;align-items:center;gap:13px">'
            '<span class="tile" style="border:1px solid var(--line);color:var(--soft);'
            'background:var(--card);transform:rotate(180deg)">' + ic("chev", 18, 2)
            + '</span>'
            f'<div style="flex:1;min-width:0"><div class="lab">{parent}</div>'
            f'<div class="ser" style="font-size:24px;line-height:29px;margin-top:1px">'
            f'{title}</div>{s}</div></div>')


def topbar(title, sub=None, right=""):
    s = (f'<div style="font-size:13px;color:var(--soft);margin-top:4px">{sub}</div>'
         if sub else "")
    return ('<div style="padding:22px 20px 0;display:flex;align-items:flex-start;'
            'justify-content:space-between;gap:14px">'
            f'<div><div class="ser" style="font-size:28px;line-height:33px">{title}</div>'
            f'{s}</div>{right}</div>')


def head1440(crumbs, title, sub=None):
    s = (f'<div style="font-size:13.5px;color:var(--soft);margin-top:8px">{sub}</div>'
         if sub else "")
    return ('<div style="padding-bottom:24px;margin-bottom:28px;'
            'border-bottom:1px solid var(--line)">' + crumbs
            + f'<div class="ser" style="font-size:32px;margin-top:5px">{title}</div>'
            + s + '</div>')
