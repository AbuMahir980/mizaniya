# -*- coding: utf-8 -*-
"""§T·1 and §T·2, and the account language ADR-013 left behind.
Every edit asserts the count it expects; nothing is spliced by line."""
import io, os, mz

SRC = mz.SRC
def ed(names, old, new, n=1):
    for name in names:
        p = os.path.join(SRC, name + ".dc.html")
        s = io.open(p, encoding="utf-8").read()
        assert s.count(old) == n, (name, old[:48], s.count(old))
        s = s.replace(old, new)
        assert s.count("<div") == s.count("</div>"), name
        io.open(p, "w", encoding="utf-8").write(s)
    print(f"  ✓ {len(names)} board(s) × {n}: {old[:56]}…")

FR  = ["WebFirstRunLight","WebFirstRunDark","MwFirstRunLight","MwFirstRunDark"]
FRW = ["WebFirstRunLight","WebFirstRunDark"]
SET = ["WebSettingsLight","WebSettingsDark","MwSettingsLight","MwSettingsDark"]
SETW= ["WebSettingsLight","WebSettingsDark"]
HF  = ["WebHomeFreshLight","WebHomeFreshDark","MwHomeFreshLight","MwHomeFreshDark"]

print("§T·2 — the front door")
# the fork is two keys now, not an account; the landing page's own words
ed(FR, ">I already have an account<", ">I already have a budget<")
# the line under the buttons only ever disclaimed an account
for w, mw in [(True, "370px"), (False, "100%")]:
    ed(FRW if w else ["MwFirstRunLight","MwFirstRunDark"],
       '<div style="font-size:13.5px;line-height:21px;color:var(--soft);'
       f'margin-top:20px;max-width:{mw}">Setting up needs no account. One is '
       'only for carrying the same budget to a second device.</div>', "")
ed(FRW,
   "is that the connection is optional.</div><!--/note-->",
   "is that the connection is optional. "
   "<b>The second button said <i>I already have an account</i> until today.</b> "
   "ADR-013 removed accounts three weeks ago and this board sat in the "
   "unaffected bucket — wrongly, because that button <i>is</i> the fork, "
   "and the fork is now two of your three keys. It reads what the landing "
   "page’s own fork reads, and goes to §23. The line under the "
   "buttons went with it: it existed to disclaim an account, and with no "
   "account to disclaim it was a sentence about nothing."
   "</div><!--/note-->")

print("§T·3 — account language ADR-013 left behind")
ed(SET,
   "A file you own, and the only way to move to another device without an account",
   "A file you own, and a way to move the budget without sync")
ed(SETW,
   "the account needs five states and categories need six behaviours, and "
   "neither can have them",
   "categories need six behaviours, and nothing can gain a state")
ed(HF, "a brand-new account", "a brand-new budget")
