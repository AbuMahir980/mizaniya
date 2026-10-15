# -*- coding: utf-8 -*-
"""build_screens.py — every board ADR-013 created or rewrote, in one place.

WHY THIS FILE EXISTS AS WELL AS `recovery.py`. That file is the components; this
one is the boards. Keeping them apart means a copy change is one edit in one
place and a rebuild, rather than an edit repeated across four widths and themes.

A NOTE ON LENGTH, because it is the rule this file was rewritten to obey.
The owner's instruction, 14 October: *"an average user just wants to spend a few
minutes and get off. A design that does not take that into consideration is not
a good and clean design."* He was right, and the first cut of these screens had
a title, a standfirst, a card heading and a body paragraph on almost every one —
four levels of text before a person reaches a control.

The rule applied here:

  **A title. At most one line of standfirst, and only if it says something the
  title does not. One sentence per row. No line under a button that the button
  does not need.**

What got cut was never a qualifier — *"we hold no key to it"* and *"one alone
opens nothing"* are claims and they stay. What got cut was me explaining my own
design to the person using it, which is a thing for the note under the board.
"""
import io, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mz, recovery as r
from mz import ic

CRUMB_HH = mz.crumb("Plan", "Household")


def two_col(left, right, w=330):
    return ('<div style="display:flex;gap:24px;align-items:flex-start">'
            f'<div style="flex:1;min-width:0">{left}</div>'
            f'<div style="flex:0 0 {w}px">{right}</div></div>')


def chip(t):
    return (f'<span class="chip" style="min-height:38px;padding:0 14px;'
            f'font-size:13px">{t}</span>')


# ══ 18 · household ═══════════════════════════════════════════════════════════
def member_row(name, sub, action=""):
    return ('<div class="card" style="padding:16px 18px;display:flex;gap:14px;'
            'align-items:center">'
            '<span class="tile" style="background:var(--em2);color:var(--emerald)">'
            + ic("debts", 19, 1.9) + '</span><div style="flex:1;min-width:0">'
            f'<div style="font-size:14.5px;font-weight:600">{name}</div>'
            f'<div style="font-size:12.5px;color:var(--soft);margin-top:2px">{sub}'
            f'</div></div>{action}</div>')


def hh_state(title, body, action=""):
    a = f'<div style="margin-top:16px">{action}</div>' if action else ""
    return ('<div class="card" style="padding:18px 20px">'
            '<div class="mlab" style="margin-bottom:7px">This plan</div>'
            f'<div class="ser" style="font-size:22px;line-height:28px">{title}</div>'
            f'<div style="font-size:13.5px;line-height:21px;color:var(--soft);'
            f'margin-top:8px">{body}</div>{a}</div>')


SETTLE = ('<div class="card" style="padding:16px 18px;display:flex;gap:14px;'
          'align-items:center;background:var(--card2)">'
          '<div style="flex:1;min-width:0">'
          '<div style="font-size:14px;font-weight:600">Two amounts to settle.</div>'
          '<div style="font-size:12.5px;line-height:19px;color:var(--soft);'
          'margin-top:3px">Food and groceries, and the rent fund.</div></div>'
          + chip("Open") + '</div>')


def household(shared):
    if shared:
        left = (hh_state("Shared with Aisha.",
                         "One budget, two people. Every movement carries whoever "
                         "recorded it.")
                + '<div style="height:12px"></div>'
                + member_row("You", "This phone &middot; holds a key")
                + '<div style="height:10px"></div>'
                + member_row("Aisha", "Her phone &middot; holds a key since 5 October",
                             chip("Remove"))
                + '<div style="height:18px"></div>' + SETTLE
                + '<div style="height:12px"></div>' + r.DISAGREE)
    else:
        left = (hh_state("Just you.", "One budget, not a copy each.",
                         mz.btn("Give someone a key", "p", "min-width:210px"))
                + '<div style="height:18px"></div>' + r.DISAGREE)
    return left


N18 = ("&sect;18. <b>The creator is senior, and the store enforces it.</b> The first "
       "cut of this board said <i>there is no owner</i>, because under ADR-013 "
       "possession of the key was the whole of the authorisation and nothing "
       "distinguished the two people. That was logged as &sect;Q&middot;9&middot;8, "
       "the owner rejected it, and <b>ADR-014</b> amended the record: the store "
       "verifies a signature on each write, which it can do without reading "
       "anything. So the third line reversed. The partner&rsquo;s side of the same "
       "facts is <code>18f</code> &mdash; drawn, because a hierarchy nobody is told "
       "about is one you find out about at the worst possible moment. No "
       "<i>admin</i> anywhere: seniority is of the budget, not of the household.")
N18A = ("&sect;18a. The same screen with two of you. <i>Holds a key</i> is the whole "
        "membership model &mdash; no invitation to accept, no address to verify, no "
        "state in between.")
N18D = ("&sect;18d. <b>Three outcomes, and one of them is a thing we cannot do.</b> "
        "The tick, the cross and the caution are not severity &mdash; they are what "
        "happens. The copy on her phone stays on her phone, and a screen that "
        "implied otherwise would be the one line of this product that could not "
        "survive being tested. ADR-014 made this screen honest in a second way: it "
        "can say <i>you are removing Aisha</i>, because under the first draft it "
        "was describing a rotation either of them could have started.")
N18E = ("&sect;18e. Removal ends on the screen that turning sync on ended on, "
        "because it is the same act &mdash; three new keys, two of which have to "
        "leave the phone.")
N15D = ("&sect;15d. <b>Your account became your sync.</b> It is a setting now, not "
        "an offer: nothing to create, nothing that lapses, only where a copy sits. "
        "The two endings stay apart on purpose &mdash; <i>turn sync off</i> stops "
        "new copies, <i>delete the stored copy</i> is ADR-013's remedy against a "
        "key believed found, and merging them would put the remedy behind the "
        "setting.")
N18G = ("&sect;18g. <b>&sect;R&middot;10: the screen stays when sync is off.</b> "
        "Sharing needs sync, because ADR-013 makes them one mechanism &mdash; but "
        "hiding Household until then makes the feature undiscoverable by exactly "
        "the person looking for it. Someone asking <i>can my spouse see this?</i> "
        "finds nothing and concludes the answer is no. So the screen is here, with "
        "what sharing is in a line and one action. <b>Not a locked state and not an "
        "upsell</b> &mdash; there is nothing to buy, and the word <i>unlock</i> "
        "appears nowhere in this product.")
N18F = ("&sect;18f. <b>The partner&rsquo;s side of ADR-014, said out loud.</b> The "
        "record is explicit that seniority is of the <i>budget</i>, not of the "
        "household, and that no screen carries the word <i>admin</i> &mdash; so "
        "this one states what they can do first and what they cannot second, in "
        "the same voice as the creator&rsquo;s board. There is no disabled "
        "<i>Remove</i> button: a dead control with no explanation is how a product "
        "says <i>you are not allowed</i> without saying why. Where it would have "
        "sat, the row simply ends.")
N21 = ("&sect;21. The short version, in front of turning sync on rather than in "
       "front of a sign-up that no longer exists. Three lines, and the third is the "
       "limit &mdash; a panel carrying only the good half is the exact thing "
       "&sect;20 was rewritten to stop doing.")


ACTIVITY = [
    ("A new device opened your budget", "5 October &middot; 14:02"),
    ("Key three was printed again", "2 October &middot; 09:40"),
    ("Aisha&rsquo;s phone was added", "28 September &middot; 18:15"),
]

# ══ 15d · your sync ══════════════════════════════════════════════════════════
SW_ON = '<span class="sw on" style="flex:0 0 auto"><i></i></span>'


def row(label, value, right="", last=False):
    rule = "" if last else "border-bottom:1px solid var(--hair);"
    return (f'<div style="display:flex;gap:14px;align-items:center;padding:15px 0;'
            f'{rule}"><div style="flex:1;min-width:0">'
            f'<div style="font-size:14.5px;font-weight:600">{label}</div>'
            f'<div style="font-size:13px;line-height:20px;color:var(--soft);'
            f'margin-top:3px">{value}</div></div>{right}</div>')


def card_rows(label, rows_html):
    return ('<div class="card" style="padding:4px 18px 12px">'
            f'<div class="mlab" style="padding:14px 0 2px">{label}</div>'
            + rows_html + '</div>')


def sync_body(wide):
    state = card_rows("Sync", row("Sync is on", "Last written just now.",
                                  SW_ON, last=True))
    back = card_rows("How you get back in",
                     row("Three keys, any two",
                         "One here, one printed, one on Aisha&rsquo;s phone.",
                         chip("Show my keys"))
                     + row("Change this",
                           "Switch to devices only, or a recovery phrase. "
                           "Anything you printed stops working.",
                           chip("Change"), last=True))
    devs = card_rows("Devices holding a key",
                     row("This phone", "Added 5 October.")
                     + row("Aisha&rsquo;s phone", "Scanned key three on 5 October.",
                           chip("Remove"), last=True))
    end = card_rows("Stopping",
                    row("Turn sync off",
                        "Your budget stays on this phone. Nothing new is copied.",
                        chip("Turn off"))
                    + row("Delete the stored copy",
                          "The copy goes, and nothing can be put back at it.",
                          chip("Delete"), last=True))
    act = card_rows("Recent activity",
                    "".join(row(t, when, last=(i == len(ACTIVITY) - 1))
                            for i, (t, when) in enumerate(ACTIVITY)))
    g = '<div style="height:12px"></div>'
    if wide:
        return two_col(state + g + back + g + devs + g + act, end)
    return state + g + back + g + devs + g + act + g + end


# ══ 21 · in front of turning sync on ═════════════════════════════════════════
PANEL = ('<div class="card" style="padding:4px 18px 12px">'
         + r.claim("One encrypted file, and the address it sits at", "", r.CHECK)
         + r.claim("There is no account to make", "", r.CHECK)
         + r.claim("A key you share opens everything",
                   "So does any two that somebody finds.", r.CROSS, last=True)
         + '</div>')


def partner_household():
    """18f — the same household from the side that was added to it."""
    state = hh_state("You were added to this budget.",
                     "You can read and change everything in it. You cannot change "
                     "who else can reach it.")
    return (state + '<div style="height:12px"></div>'
            + member_row("You", "This phone &middot; holds a key")
            + '<div style="height:10px"></div>'
            + member_row("Whoever created it", "Their phone &middot; holds a key")
            + '<div style="height:18px"></div>' + SETTLE
            + '<div style="height:12px"></div>' + r.DISAGREE
            + '<div style="font-size:12.5px;line-height:19px;color:var(--soft);'
              'margin:12px 2px 0">You can stop syncing at any time in '
              '<b style="color:var(--ink)">Your sync</b>. What is on this phone '
              'stays on it either way.</div>')


def household_sync_off():
    """18g — §R·10. The screen a person reaches before sync exists."""
    return ('<div class="card" style="padding:18px 20px">'
            '<div class="mlab" style="margin-bottom:7px">This plan</div>'
            '<div class="ser" style="font-size:22px;line-height:28px">Just you.</div>'
            '<div style="font-size:13.5px;line-height:21px;color:var(--soft);'
            'margin-top:8px">Sharing hands someone a key, so it needs sync on. '
            'One budget, not a copy each.</div>'
            '<div style="margin-top:16px">'
            + mz.btn("Turn sync on to share", "p", "min-width:230px")
            + '</div></div>'
            + '<div style="height:18px"></div>' + r.DISAGREE)


def build():
    made = []
    for th in ("light", "dark"):
        T = th.title()
        # ── 18 / 18a ──
        for shared, stem, title, note in (
                (False, "Household", "18 · Household · just you", N18),
                (True, "HouseholdShared",
                 "18a · Household · shared with Aisha", N18A)):
            left = household(shared)
            made.append(mz.write(
                f"Web{stem}{T}", f"{title} · 1440 · {th}", th,
                mz.shell("Plan", mz.head1440(CRUMB_HH, "Household",
                                             "Who else is in this budget.")
                         + two_col(left, r.sharing_card()), 1180,
                         add="Give someone a key"), note))
            made.append(mz.write(
                f"Mw{stem}{T}", f"{title} · 360 · {th}", th,
                mz.phone(mz.backbar("Household", "Plan")
                         + '<div style="padding:18px 20px 0">' + left
                         + '<div style="height:12px"></div>' + r.sharing_card()
                         + '<div style="height:14px"></div></div>', nav="Plan"),
                note, wide=False))
        # ── 18g · sync is off ──
        left_g = household_sync_off()
        made.append(mz.write(
            f"WebHouseholdOff{T}", f"18g · Household · sync is off · 1440 · {th}", th,
            mz.shell("Plan", mz.head1440(CRUMB_HH, "Household",
                                         "Who else is in this budget.")
                     + two_col(left_g, r.sharing_card()), 1180, add=""), N18G))
        made.append(mz.write(
            f"MwHouseholdOff{T}", f"18g · Household · sync is off · 360 · {th}", th,
            mz.phone(mz.backbar("Household", "Plan")
                     + '<div style="padding:18px 20px 0">' + left_g
                     + '<div style="height:12px"></div>' + r.sharing_card()
                     + '<div style="height:14px"></div></div>', nav="Plan"),
            N18G, wide=False))
        # ── 18f · the partner's view ──
        left_p = partner_household()
        made.append(mz.write(
            f"WebHouseholdPartner{T}",
            f"18f · Household · the partner&rsquo;s view · 1440 · {th}", th,
            mz.shell("Plan", mz.head1440(CRUMB_HH, "Household",
                                         "Who else is in this budget.")
                     + two_col(left_p,
                               r.sharing_card("What you can do", r.SHARING_PARTNER)),
                     1180, add=""), N18F))
        made.append(mz.write(
            f"MwHouseholdPartner{T}",
            f"18f · Household · the partner&rsquo;s view · 360 · {th}", th,
            mz.phone(mz.backbar("Household", "Plan")
                     + '<div style="padding:18px 20px 0">' + left_p
                     + '<div style="height:12px"></div>'
                     + r.sharing_card("What you can do", r.SHARING_PARTNER)
                     + '<div style="height:14px"></div></div>', nav="Plan"),
            N18F, wide=False))
        # ── 18d · removing Aisha ──
        sub = "Removing someone means making three new keys."
        body = ('<div class="card" style="padding:4px 18px 12px">'
                + r.remove_rows() + '</div>')
        made.append(mz.write(
            f"WebRemove{T}", f"18d · Household · removing Aisha · 1440 · {th}", th,
            mz.shell("Plan",
                     mz.head1440(mz.crumb("Plan", "Household", "Remove Aisha"),
                                 "Remove Aisha", sub)
                     + '<div style="max-width:660px">' + body
                     + '<div style="display:flex;align-items:center;gap:14px;'
                       'margin-top:26px">'
                     + mz.btn("Remove Aisha and make new keys", "p",
                              "min-width:290px")
                     + mz.btn("Cancel", "q") + '</div></div>', 1180), N18D))
        made.append(mz.write(
            f"MwRemove{T}", f"18d · Household · removing Aisha · 360 · {th}", th,
            mz.phone(mz.backbar("Remove Aisha", "Household", sub)
                     + '<div style="padding:16px 20px 0">' + body
                     + '<div style="margin-top:18px">'
                     + mz.btn("Remove Aisha and make new keys", "p", "width:100%")
                     + '<div style="height:10px"></div>'
                     + mz.btn("Cancel", "s", "width:100%")
                     + '</div><div style="height:16px"></div></div>', nav="Plan"),
            N18D, wide=False))
        # ── 18e · removed, place the new keys ──
        steps2 = [("Remove Aisha", "Done"),
                  ("Place three new keys", "Two of them leave this phone")]
        banner = ('<div class="card" style="padding:15px 18px;background:var(--em2);'
                  'border-color:var(--emerald);display:flex;gap:12px;'
                  'align-items:flex-start;margin-bottom:22px">' + r.CHECK
                  + '<div style="font-size:13.5px;line-height:20px;color:var(--ink)">'
                    '<b>Aisha is removed.</b> What was already on her phone is still '
                    'on it.</div></div>')
        made.append(mz.write(
            f"WebRemoveDone{T}",
            f"18e · Household · Aisha removed · place new keys · 1440 · {th}", th,
            r.flow_wide(2, banner + r.keys_wide(False)
                        + r.foot_wide("Continue", False,
                                      "Both keys have to go somewhere first.", False),
                        kicker="Removing Aisha",
                        head="New keys, because there is no other way to remove one.",
                        blurb="Rotating cuts off every device, not only hers.",
                        steps=steps2), N18E))
        made.append(mz.write(
            f"MwRemoveDone{T}",
            f"18e · Household · Aisha removed · place new keys · 360 · {th}", th,
            r.flow_phone(2, "Your three new keys", banner + r.keys_phone(False),
                         r.foot_phone("Continue", False,
                                      "Both keys have to go somewhere first.", False),
                         steps=steps2), N18E, wide=False))
        # ── 15d · your sync ──
        made.append(mz.write(
            f"WebSync{T}", f"15d · Settings · your sync · 1440 · {th}", th,
            mz.shell("Settings",
                     mz.head1440(mz.crumb("Settings", "Your sync"), "Your sync")
                     + sync_body(True), 1180), N15D))
        made.append(mz.write(
            f"MwSync{T}", f"15d · Settings · your sync · 360 · {th}", th,
            mz.phone(mz.backbar("Your sync", "Settings")
                     + '<div style="padding:18px 20px 0">' + sync_body(False)
                     + '<div style="height:14px"></div></div>', nav="More"), N15D,
            wide=False))
        # ── 21 · the panel in front of turning sync on ──
        foot = ('<div style="margin-top:24px">'
                + mz.btn("Turn sync on", "p", "width:100%")
                + '<div style="text-align:center;margin-top:12px">'
                  '<span class="link" style="font-size:13.5px">Read the full page'
                  '</span></div></div>')
        for wide, pre, w in ((True, "Web", "1440"), (False, "Mw", "360")):
            made.append(mz.write(
                f"{pre}PrivacyModal{T}",
                f"21 · Security and privacy · in front of turning sync on · {w} · {th}",
                th, r.gate("We cannot read your budget.",
                           "This is the whole of what leaves your phone.",
                           PANEL, foot), N21, wide=wide))
    return made


# ══ 22 / 23 · getting back in ════════════════════════════════════════════════
N22 = ("&sect;22. <b>No option wears a warning.</b> All three answer the same four "
       "questions in the same four slots, so the weakest is simply the only card "
       "with two crosses on it &mdash; visible before a word is read. ADR-013 names "
       "the failure this avoids: a warned option is the one a skimmer selects "
       "against, which would have shipped the weak choice. The four slots are "
       "pinned to one height so the ticks and crosses line up; that alignment is "
       "the argument, not decoration. <b>The line under the button went on 14 "
       "October</b> &mdash; it was reassurance the screen did not need, and a "
       "promise the spec had not made.")
N22A = ("&sect;22a. <b>The three keys are never on one screen together.</b> A "
        "photograph of a screen showing all three would be two of three, which is "
        "the budget. So this screen shows none of them: key one never leaves the "
        "phone, and the other two are revealed only in the act of placing them. "
        "<i>Continue</i> stays dead until both have gone somewhere &mdash; the "
        "placing is the confirmation, because unlike writing words down it is "
        "something the app can observe.")
N22B = ("&sect;22b. The same screen once both keys have left the phone. <i>Back</i> "
        "is still offered and still says what it costs &mdash; and &sect;R&middot;5 "
        "put that sentence <b>on the button&rsquo;s own confirmation</b> rather "
        "than in help text under it, which is a dialog this set does not draw yet. "
        "The reason it cannot be softened: by the time <i>Back</i> is reachable a "
        "key may already be on paper, and a printed key exists in the world whether "
        "or not the flow finished.")
N22C = ("&sect;22c. <b>One key, and the screen says so.</b> Somebody who has just "
        "been told three things open their budget needs to know what they are "
        "holding up to a camera. The QR is the common path, the typed code the "
        "fallback, grouped in fives because it will sometimes be read aloud across "
        "a room. The alphabet and length are the build&rsquo;s to settle.")
N22D = ("&sect;22d. The weakest option, drawn as plainly as the others. ADR-013 "
        "requires this screen to say that whoever holds the words can see the money "
        "&mdash; so it names the <b>photograph</b>, which is the thing people "
        "actually do, rather than the abstraction they would skim past.")
N22E = ("&sect;22e. <b>Writing something down is not observable; typing it back is.</b> "
        "The three keys need no check of this kind because placing them leaves a "
        "trace. Twelve words leave none. <b>The two positions are chosen at random "
        "each time</b> (&sect;R&middot;3) &mdash; seven and eleven here are an "
        "example, not the pair. Fixed positions can be learned without the phrase "
        "ever being written down, which defeats the only thing the screen is for. "
        "A wrong answer re-asks with two different words and offers to show the "
        "phrase again; nothing is leaked by being generous, because the person was "
        "looking at it a moment ago.")
N23 = ("&sect;23. <b>What stands where sign-in stood.</b> Everyone arriving here has "
       "the muscle memory of a <i>forgot password</i> link and will hunt for one, "
       "so the answer sits where the link used to be, phrased as the reason rather "
       "than the refusal. <b>The hints under each slot went on 14 October:</b> the "
       "buttons already say <i>Scan it</i> and <i>Type it in</i>.")
N23A = "&sect;23a. One key accepted. The second slot changes its own line; no banner."
N23B = ("&sect;23b. The same screen for the twelve-word phrase. Word five is live and "
        "the rest wait; nothing validates until the last one, because a phrase that "
        "reports a wrong word at word three tells whoever is trying it which three "
        "were right.")

CONFIRM_SUB = "Type word seven and word eleven from your paper."


def phrase_fields(cols):
    out = []
    for i, w in enumerate(r.WORDS, 1):
        if i < 5:
            val, cls, col = w, "fld", "var(--ink)"
        elif i == 5:
            val, cls, col = "tim|", "fld on", "var(--ink)"
        else:
            val, cls, col = "", "fld", "var(--faint)"
        out.append(f'<div class="{cls}" style="min-height:46px;padding:10px 12px;'
                   f'gap:8px"><span class="mono" style="font-size:11px;'
                   f'color:var(--faint);flex:0 0 16px">{i}</span>'
                   f'<span style="font-size:14.5px;font-weight:500;color:{col}">'
                   f'{val}</span></div>')
    return (f'<div style="display:grid;grid-template-columns:repeat({cols},1fr);'
            f'gap:10px">' + "".join(out) + '</div>')


def build_recovery():
    made = []
    for th in ("light", "dark"):
        T = th.title()
        made.append(mz.write(f"WebRecovery{T}",
                             f"22 · Getting back in · choose how · 1440 · {th}", th,
                             mz.shell("Settings", r.chooser_wide(), 1180), N22))
        made.append(mz.write(f"MwRecovery{T}",
                             f"22 · Getting back in · choose how · 360 · {th}", th,
                             mz.phone(r.chooser_phone(), nav="More"), N22,
                             wide=False))
        made.append(mz.write(
            f"WebKeys{T}", f"22a · Your three keys · nothing placed yet · 1440 · {th}",
            th, r.flow_wide(2, r.keys_wide(False) + r.foot_wide(
                "Continue", True, "Both keys have to go somewhere first.", False)),
            N22A))
        made.append(mz.write(
            f"MwKeys{T}", f"22a · Your three keys · nothing placed yet · 360 · {th}",
            th, r.flow_phone(2, r.KEYS_TITLE, r.keys_phone(False),
                             r.foot_phone("Continue", True,
                                          "Both keys have to go somewhere first.",
                                          False)), N22A, wide=False))
        made.append(mz.write(
            f"WebKeysDone{T}", f"22b · Your three keys · all three placed · 1440 · {th}",
            th, r.flow_wide(2, r.keys_wide(True) + r.foot_wide(
                "Turn sync on", True,
                "Going back makes three new keys. Anything you have "
                                       "already printed or placed stops working.")), N22B))
        made.append(mz.write(
            f"MwKeysDone{T}", f"22b · Your three keys · all three placed · 360 · {th}",
            th, r.flow_phone(2, r.KEYS_TITLE, r.keys_phone(True),
                             r.foot_phone("Turn sync on", True,
                                          "Back makes three new keys; these stop "
                                          "working.")), N22B, wide=False))
        made.append(mz.write(
            f"WebKeyScan{T}", f"22c · Key three · ready to scan · 1440 · {th}", th,
            r.flow_wide(2, '<div class="ser" style="font-size:32px;line-height:38px">'
                        'Key three</div><div style="font-size:14px;line-height:23px;'
                        f'color:var(--soft);margin-top:10px;max-width:620px">'
                        f'{r.ONEKEY_SUB}</div>'
                        '<div style="margin-top:24px;max-width:620px">'
                        + r.onekey(True) + '</div>'
                        + r.foot_wide("It has been scanned", True)), N22C))
        made.append(mz.write(
            f"MwKeyScan{T}", f"22c · Key three · ready to scan · 360 · {th}", th,
            r.flow_phone(2, "Key three",
                         f'<div style="font-size:13.5px;line-height:21px;'
                         f'color:var(--soft);margin-bottom:16px">{r.ONEKEY_SUB}</div>'
                         + r.onekey(False),
                         r.foot_phone("It has been scanned", True)), N22C,
            wide=False))
        for wide, pre, cols, w in ((True, "Web", 3, "1440"), (False, "Mw", 2, "360")):
            sub = (f'<div style="font-size:{"14" if wide else "13.5"}px;'
                   f'line-height:{"23" if wide else "21"}px;color:var(--soft);'
                   f'margin-bottom:{22 if wide else 18}px;max-width:620px">'
                   f'{r.PHRASE_SUB}</div>')
            grid = (f'<div style="max-width:{620 if wide else 9999}px">'
                    + r.phrase_grid(cols) + '</div>')
            acts = ('<div style="display:flex;gap:10px;margin-top:16px">'
                    + mz.btn("Print it", "s", "min-height:44px;font-size:13.5px")
                    + mz.btn("Save a PDF", "s", "min-height:44px;font-size:13.5px")
                    + '</div>')
            inner = sub + grid + acts
            if wide:
                made.append(mz.write(
                    f"WebPhrase{T}", f"22d · Your recovery phrase · 1440 · {th}", th,
                    r.flow_wide(2, inner
                                + r.foot_wide("I have written them down")), N22D))
            else:
                made.append(mz.write(
                    f"MwPhrase{T}", f"22d · Your recovery phrase · 360 · {th}", th,
                    r.flow_phone(2, "Your recovery phrase", inner,
                                 r.foot_phone("I have written them down")), N22D,
                    wide=False))
        conf = ('<div style="font-size:14px;line-height:23px;color:var(--soft);'
                f'margin-bottom:22px">{CONFIRM_SUB}</div>'
                '<div style="max-width:620px">'
                + r.phrase_grid(3, hide=(7, 11)) + '</div>')
        made.append(mz.write(
            f"WebPhraseCheck{T}", f"22e · Confirm two of the words · 1440 · {th}", th,
            r.flow_wide(2, conf + r.foot_wide("Turn sync on", True, None, False)),
            N22E))
        made.append(mz.write(
            f"MwPhraseCheck{T}", f"22e · Confirm two of the words · 360 · {th}", th,
            r.flow_phone(2, "Check your paper",
                         f'<div style="font-size:13.5px;line-height:21px;'
                         f'color:var(--soft);margin-bottom:18px">{CONFIRM_SUB}</div>'
                         + r.phrase_grid(2, hide=(7, 11)),
                         r.foot_phone("Turn sync on", True, None, False)), N22E,
            wide=False))
        for one_in, num, note, nt in ((False, "23", "· two keys", N23),
                                      (True, "23a", "· one accepted", N23A)):
            body, primary, live = r.entry(one_in)
            content = body + r.no_reset_line()
            tag = "EntryOne" if one_in else "Entry"
            for wide, pre, w in ((True, "Web", "1440"), (False, "Mw", "360")):
                made.append(mz.write(
                    f"{pre}{tag}{T}",
                    f"{num} · Open your budget here {note} · {w} · {th}", th,
                    r.gate("Open your budget here",
                           "Two of your three keys will do it.",
                           content, r.foot_gate(primary, live)), nt, wide=wide))
        for wide, pre, cols, w in ((True, "Web", 3, "1440"), (False, "Mw", 2, "360")):
            made.append(mz.write(
                f"{pre}EntryPhrase{T}",
                f"23b · Open your budget here · the phrase · {w} · {th}", th,
                r.gate("Open your budget here", "Type your twelve words in order.",
                       phrase_fields(cols) + r.no_reset_line(),
                       r.foot_gate("Open my budget", False)), N23B, wide=wide))
    return made


def build_open_two():
    """S·1 and S·2 — the confirmation and the notification surface."""
    made = []
    for th in ("light", "dark"):
        T = th.title()
        TITLE = "Go back and make three new keys?"
        BODY = ("Anything you have already printed or placed stops working.")
        made.append(mz.write(
            f"WebKeysBack{T}",
            f"22f · Your three keys · going back makes new ones · 1440 · {th}", th,
            confirm_over(r.flow_wide(2, r.keys_wide(True) + r.foot_wide(
                "Turn sync on", True)), TITLE, BODY, "Go back", wide=True), N22F))
        made.append(mz.write(
            f"MwKeysBack{T}",
            f"22f · Your three keys · going back makes new ones · 360 · {th}", th,
            confirm_over(r.flow_phone(2, r.KEYS_TITLE, r.keys_phone(True),
                                      r.foot_phone("Turn sync on", True)),
                         TITLE, BODY, "Go back", wide=False), N22F, wide=False),)
    # 07i rides the same seam 07h uses
    MARK = '<div style="padding:36px;display:flex;justify-content:center">'
    SEAM = "<!--offline-seam-->"
    for th in ("light", "dark"):
        T = th.title()
        for pre, w in (("Web", "1440"), ("Mw", "360")):
            src = io.open(os.path.join(mz.SRC, f"{pre}Home{T}.dc.html"),
                          encoding="utf-8").read()
            if pre == "Mw":
                j = src.index(SEAM) + len(SEAM)
                band = '<div style="padding:18px 20px 0">' + NEW_DEVICE + '</div>'
            else:
                i = src.index(MARK)
                j = src.index('">', src.index('<div style="width:100%', i)) + 2
                band = NEW_DEVICE
            out = src[:j] + band + src[j:]
            m = mz.TITLE_RE.search(out)
            out = (out[:m.start(2)]
                   + f"07i · Home · a new device opened your budget · {w} · {th}"
                   + out[m.end(2):])
            nm = out.index("<!--/note-->")
            n1 = out.rindex("</div>", 0, nm); n0 = out.rindex('">', 0, n1) + 2
            out = out[:n0] + N07I + out[n1:]
            assert out.count("<div") == out.count("</div>"), (pre, T)
            io.open(os.path.join(mz.SRC, f"{pre}HomeNotice{T}.dc.html"), "w",
                    encoding="utf-8").write(out)
            made.append(f"{pre}HomeNotice{T}")
    return made





# ══ 07h · Home, on a device the rotation left behind ═════════════════════════
# §R·9. Rotation moves the budget to a new address, so every device has to be
# re-enrolled — not only the one being removed. The owner's OTHER phone is the
# case nobody had drawn, and it is the dangerous one: the budget still opens,
# the figures still render, and every one of them is from before the rotation.
#
# It is NOT an error and it is NOT an empty state. Nothing went wrong and the
# data is real; it is simply old. So it is an inline banner — the component the
# primitives already have — above the figure rather than in front of it, because
# blocking a budget that still works would be a worse lie than showing it.
#
# It sits on **Home** rather than only in Settings for one reason: Home is where
# the figures are, and a stale figure is the whole of the harm.
BEHIND = ('<div style="display:flex;gap:14px;align-items:center;background:var(--oc2);'
          'border:1px solid var(--line);border-radius:13px;padding:14px 16px;'
          'min-height:44px;margin-bottom:26px">'
          '<div style="flex:1"><div style="font-size:14px;font-weight:600;'
          'color:var(--ink)">This device is holding an older copy</div>'
          '<div style="font-size:12.5px;line-height:19px;color:var(--soft);'
          'margin-top:2px">The keys changed on 5 October. Everything below is from '
          'before that.</div></div>'
          '<span class="chip" style="min-height:38px;padding:0 14px;font-size:13px">'
          'Open it with two keys</span></div>')

N07H = ("&sect;07h. <b>&sect;R&middot;9, and it is the dangerous state.</b> Rotation "
        "moves the budget to a new address, so the owner&rsquo;s <i>other</i> phone "
        "is cut off too &mdash; and it does not look cut off. The budget opens, the "
        "figures render, and every one of them is from before the rotation. "
        "<b>Not an error and not an empty state</b>: nothing went wrong and the "
        "data is real, it is simply old. So it is an inline banner above the figure "
        "rather than a sheet in front of it &mdash; blocking a budget that still "
        "works would be a worse lie than showing it. It sits on Home and not only "
        "in Settings because Home is where the figures are, and a stale figure is "
        "the whole of the harm. The only board on the canvas that breaks "
        "<code>motion.md</code> &sect;0&rsquo;s neighbourhood deliberately: the "
        "banner is above the path to the figure, and it does not animate.")


def build_behind():
    """Derived from the committed Home boards rather than redrawn, so the only
    difference between `07` and `07h` is the banner."""
    import re
    made = []
    # At 360 Home already carries `<!--offline-seam-->`, the point a banner is
    # meant to go in. At 1440 there is none, so the insert goes at the top of the
    # max-width column — the same place, named differently.
    MARK = '<div style="padding:36px;display:flex;justify-content:center">'
    SEAM = "<!--offline-seam-->"
    for th in ("light", "dark"):
        T = th.title()
        for pre, w in (("Web", "1440"), ("Mw", "360")):
            src = io.open(os.path.join(mz.SRC, f"{pre}Home{T}.dc.html"),
                          encoding="utf-8").read()
            if pre == "Mw":
                assert src.count(SEAM) == 1, (pre, T)
                j = src.index(SEAM) + len(SEAM)
            else:
                i = src.index(MARK)
                j = src.index('">', src.index('<div style="width:100%', i)) + 2
            band = (BEHIND if pre == "Web" else
                    '<div style="padding:18px 20px 0">' + BEHIND + '</div>')
            out = src[:j] + band + src[j:]
            # the title line and the note are the board's own, not the frame's
            m = mz.TITLE_RE.search(out)
            out = (out[:m.start(2)]
                   + f"07h · Home · this device is holding an older copy · {w} · {th}"
                   + out[m.end(2):])
            nm = out.index("<!--/note-->")
            n1 = out.rindex("</div>", 0, nm); n0 = out.rindex('">', 0, n1) + 2
            out = out[:n0] + N07H + out[n1:]
            assert out.count("<div") == out.count("</div>"), (pre, T)
            io.open(os.path.join(mz.SRC, f"{pre}HomeBehind{T}.dc.html"), "w",
                    encoding="utf-8").write(out)
            made.append(f"{pre}HomeBehind{T}")
    return made


# ══ S·1 · 22f — the confirmation §R·5 asked for ══════════════════════════════
# §R·5 put the sentence on the button's own confirmation rather than in help
# text under it, and was right about why: by the time Back is reachable a key
# may already be on paper, and a printed key exists in the world whether or not
# the flow finished. Help text under a button is read by nobody about to press
# it.
#
# The safe choice is the primary one. Going back is the quiet button, because a
# dialog whose default action destroys three keys is a dialog that destroys
# three keys.
def confirm_over(content, title, body, go, stay="Stay here", wide=True):
    pad = "48px" if wide else "20px"
    w = "min(460px,100%)" if wide else "100%"
    dialog = ('<div style="position:absolute;inset:0;background:var(--scrim);'
              'display:flex;align-items:center;justify-content:center;'
              f'border-radius:22px;padding:{pad}">'
              f'<div style="background:var(--card);border:1px solid var(--line);'
              f'border-radius:22px;box-shadow:var(--shadow);padding:24px;'
              f'width:{w}">'
              f'<div class="ser" style="font-size:{24 if wide else 21}px;'
              f'line-height:{30 if wide else 27}px">{title}</div>'
              f'<div style="font-size:14px;line-height:22px;color:var(--soft);'
              f'margin-top:10px">{body}</div>'
              '<div style="display:flex;gap:10px;margin-top:22px">'
              + mz.btn(stay, "p", "flex:1") + mz.btn(go, "q", "flex:1")
              + '</div></div></div>')
    return ('<div style="position:relative;flex:1;min-width:0;display:flex">'
            + content + dialog + '</div>')


N22F = ("&sect;22f. <b>&sect;R&middot;5, where it asked to be.</b> The sentence was "
        "under the button; a line under a button is read by nobody about to press "
        "it. <b>The safe choice is the primary one</b> &mdash; a dialog whose "
        "default action destroys three keys is a dialog that destroys three keys. "
        "Going back is the quiet button, and it says what it costs rather than "
        "asking <i>are you sure</i>, which answers nothing.")


# ══ S·2 · the notification surface ═══════════════════════════════════════════
# ADR-013 makes deletion the remedy against a key believed found and
# notification the trigger for it — they only work as a pair. §R·6 then allowed
# a lost key to be re-printed *because* every device is told. So two decisions
# now rest on a surface that did not exist.
#
# The smallest thing that works, and why it is not an inbox: these events are
# rare — a device enrolled, a key printed, the keys rotated. Three a year does
# not earn a bell, a badge and a read state. So:
#
#   * **Home carries the newest unseen one**, as a banner, because that is where
#     the person is and `07h` already put a banner there. One pattern, not two.
#   * **Your sync keeps the list**, because *who can reach this budget?* is the
#     question these events answer and that is the screen that answers it.
#   * **Two at once do not stack.** The banner counts them and opens the list.


NEW_DEVICE = ('<div style="display:flex;gap:14px;align-items:center;'
              'background:var(--oc2);border:1px solid var(--line);'
              'border-radius:13px;padding:14px 16px;min-height:44px;'
              'margin-bottom:26px"><div style="flex:1">'
              '<div style="font-size:14px;font-weight:600;color:var(--ink)">'
              'A new device opened your budget</div>'
              '<div style="font-size:12.5px;line-height:19px;color:var(--soft);'
              'margin-top:2px">5 October at 14:02. If that was not you, delete '
              'the stored copy.</div></div>'
              '<span class="chip" style="min-height:38px;padding:0 14px;'
              'font-size:13px">Your sync</span></div>')

N07I = ("&sect;07i. <b>The trigger for ADR-013&rsquo;s own remedy.</b> Deleting the "
        "stored copy is the defence against a key believed found, and this notice "
        "is the only thing that tells the owner to reach for it &mdash; they work "
        "as a pair or not at all. It carries the action rather than describing one, "
        "and it says <i>if that was not you</i> instead of asking the owner to "
        "work out what the line implies. <b>Two notices do not stack</b>: the "
        "banner counts them and opens the list on <code>15d</code>.")


if __name__ == "__main__":
    n = len(build()) + len(build_recovery()) + len(build_behind()) + len(build_open_two())
    print("built", n, "boards")
