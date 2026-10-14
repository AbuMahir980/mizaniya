# -*- coding: utf-8 -*-
"""patch_boards.py — the exact-string edits ADR-013 forces on committed boards.

Every replacement asserts its own count before it runs, so a board that has
drifted fails loudly instead of being half-edited. That is the repo's rule for
source edits and it applies to drawings for the same reason: a silent partial
match is how two boards end up disagreeing about what the product says.
"""
import io, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mz

SRC = mz.SRC
BACK = "I already have a budget"

# (glob of files, old, new, expected count PER FILE)
EDITS = [
    # ── the nav of every public page ────────────────────────────────────────
    (["LandPhoneLight", "LandPhoneDark", "MwSecurityLight", "MwSecurityDark"],
     '<span class="lbtn lbtn-s sm">Sign in</span>',
     f'<span class="lbtn lbtn-s sm">{BACK}</span>', 1),
    (["LandLight", "LandDark", "WebSecurityLight", "WebSecurityDark"],
     '<span class="lbtn lbtn-q" style="color:var(--soft)">Sign in</span>',
     f'<span class="lbtn lbtn-q" style="color:var(--soft)">{BACK}</span>', 1),
    # ── the landing page's two in-page calls to action ──────────────────────
    (["LandLight", "LandDark", "LandPhoneLight", "LandPhoneDark"],
     '<span class="lbtn lbtn-s">Sign in</span>',
     f'<span class="lbtn lbtn-s">{BACK}</span>', 2),
    # ── import and export: an account was the alternative to a file ─────────
    (["WebImpExpLight", "WebImpExpDark", "MwImpExpLight", "MwImpExpDark"],
     '<div style="font-size:15px">Sign in instead</div>'
     '<div style="font-size:12px;color:var(--soft);margin-top:2px">An account '
     'carries this for you. The file is how you move without one, and how you '
     'keep a copy either way</div>',
     '<div style="font-size:15px">Turn sync on instead</div>'
     '<div style="font-size:12px;color:var(--soft);margin-top:2px">Two of your '
     'keys carry this for you. The file is how you move without sync, and how you '
     'keep a copy either way</div>', 1),
    # ── the landing page's own account line ─────────────────────────────────
    (["LandLight", "LandDark", "LandPhoneLight", "LandPhoneDark"],
     'No account needed. Sign up only for a second device or a second person.',
     'No account. No email, no password, nothing to verify.', 1),
]


def apply(dry=False):
    done = []
    for names, old, new, n in EDITS:
        for nm in names:
            p = os.path.join(SRC, nm + ".dc.html")
            s = io.open(p, encoding="utf-8").read()
            got = s.count(old)
            assert got == n, f"{nm}: expected {n} of {old[:48]!r}, found {got}"
            if not dry:
                s = s.replace(old, new)
                assert s.count("<div") == s.count("</div>"), nm
                io.open(p, "w", encoding="utf-8").write(s)
            done.append((nm, n))
    return done


if __name__ == "__main__":
    for nm, n in apply(dry="--dry" in sys.argv):
        print("  patched", nm, n)


# ── the segmented control Transactions no longer needs ──────────────────────
# `Your record | Bank movements` was the shape agreed when bank movement was a
# paid tier living inside Transactions. ADR-013 defers the feature entirely, so
# the segment now names a view that will not exist — and a segmented control
# with one segment is not a control.
SEG_OPEN = '<div class="seg" style="margin-bottom:24px">'
PHONE_WRAP = '<div style="padding:18px 20px 0"></div>'


def drop_segment(name):
    p = os.path.join(SRC, name + ".dc.html")
    s = io.open(p, encoding="utf-8").read()
    i = s.index(SEG_OPEN)
    j = mz._match_close(s, i)
    seg = s[i:j]
    assert "Bank movements" in seg and "Your record" in seg, name
    s = s[:i] + s[j:]
    # at 360 the control sat alone in its own padded band; an empty band is 18px
    # of unexplained space, so the band goes with it
    if PHONE_WRAP in s:
        s = s.replace(PHONE_WRAP, "", 1)
    assert "Bank movements" not in s, name
    assert s.count("<div") == s.count("</div>"), name
    io.open(p, "w", encoding="utf-8").write(s)
    return name
