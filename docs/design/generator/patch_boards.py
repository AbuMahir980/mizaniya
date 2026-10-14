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
    # ── settings' own row, which still pointed at an account ────────────────
    (["WebSettingsLight", "WebSettingsDark", "MwSettingsLight", "MwSettingsDark"],
     '<div style="font-size:15px;font-weight:600">Your account</div>'
     '<div style="font-size:12.5px;line-height:18px;color:var(--soft);'
     'margin-top:3px">Signing in, your devices, and deleting the account</div>'
     '</div><div style="font-size:13px;color:var(--soft);text-align:right;'
     'max-width:232px">Not signed in</div>',
     '<div style="font-size:15px;font-weight:600">Your sync</div>'
     '<div style="font-size:12.5px;line-height:18px;color:var(--soft);'
     'margin-top:3px">Your keys, the devices holding one, and the stored copy</div>'
     '</div><div style="font-size:13px;color:var(--soft);text-align:right;'
     'max-width:232px">Off</div>', 1),
    # ── the landing hero's trust line ───────────────────────────────────────
    # It was the honest claim while a bank feed existed. With the feed deferred
    # there is no bank data to store, so the line answers a question nobody is
    # asking and quietly implies we hold something we do not. The replacement is
    # the claim page 20 now leads with, which is both stronger and still true.
    (["LandLight", "LandDark"],
     '<div style="font-size:17px;font-weight:600">We never store your bank data '
     'in readable form.</div>',
     '<div style="font-size:17px;font-weight:600">We cannot read your budget.'
     '</div>', 1),
    (["LandPhoneLight", "LandPhoneDark"],      # the 390 hero sets it at 15px
     '<div style="font-size:15px;font-weight:600">We never store your bank data '
     'in readable form.</div>',
     '<div style="font-size:15px;font-weight:600">We cannot read your budget.'
     '</div>', 1),
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


# ── the paid-tier and pricing bands (§P·3, §P·4) ────────────────────────────
# Both were true on 25 September. ADR-013 removed the tier, the bank feed and
# the price on 8 October, so the band now sells three things that do not exist
# and reserves a space for a number that will never be set. The eight lines that
# replace it sit higher up the page, where the owner asked for them.
TIER_W = ('<div style="padding:96px 150px"><div class="h2" '
          'style="margin-top:14px;max-width:760px">The budgeting is free forever.')
TIER_P = ('<div style="padding:44px 24px"><div class="ser" '
          'style="margin-top:14px;font-size:28px;line-height:34px">'
          'The budgeting is free forever.')


def drop_tier_band(name, opener):
    p = os.path.join(SRC, name + ".dc.html")
    s = io.open(p, encoding="utf-8").read()
    assert s.count(opener) == 1, (name, s.count(opener))
    i = s.index(opener)
    j = mz._match_close(s, i)
    band = s[i:j]
    for must in ("A second device", "A second person", "Your bank movement",
                 "A monthly price, not yet set."):
        assert must in band, (name, must)
    assert "The rest of it." not in band, name   # the band must stop where it stops
    s = s[:i] + s[j:]
    assert s.count("<div") == s.count("</div>"), name
    io.open(p, "w", encoding="utf-8").write(s)
    return name


LATE = [
    # §P·6 — it is free on every device now, so the qualifier undersells it
    (["LandLight", "LandDark"],
     '<span style="flex:1;font-size:17px;line-height:27px">Free on one device, '
     'with no account</span>',
     '<span style="flex:1;font-size:17px;line-height:27px">Free on every device '
     'you own, with no account</span>', 1),
    (["LandPhoneLight", "LandPhoneDark"],
     '<span style="flex:1;font-size:15.5px;line-height:24px">Free on one device, '
     'with no account</span>',
     '<span style="flex:1;font-size:15.5px;line-height:24px">Free on every device '
     'you own, with no account</span>', 1),
    # §P·7 — the first sentence became the truest line on the page; the third is
    # false in all three of its clauses
    (["LandLight", "LandDark", "LandPhoneLight", "LandPhoneDark"],
     'Your figures, this device, free and not a trial. An account adds a second\n'
     '    device, a second person, or your bank.',
     'Your figures, your devices, free &mdash; and not a trial. A second device '
     'or a\n    second person is a key you hand over, not a sign-up.', 1),
    # §P·8 — not ADR-013 and older: §O·O2 settled that the nisab is fetched on a
    # schedule and dated, never typed in
    (["LandLight", "LandDark", "LandPhoneLight", "LandPhoneDark"],
     '<span class="mlab" style="flex:1;font-size:9px">Nisab, as you entered it'
     '</span>',
     '<span class="mlab" style="flex:1;font-size:9px">Nisab, fetched 5 Oct'
     '</span>', 1),
]
