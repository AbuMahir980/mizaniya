/**
 * The words and figures on the landing page, in one place.
 *
 * Two rules govern this file and neither is a preference.
 *
 * **Every figure is a literal from `docs/seed-data.md`**, never computed. The
 * landing page is a marketing surface; a computed figure here would mean it
 * importing the domain, and H3 keeps money arithmetic out of components for
 * reasons that apply twice over to a page nobody's budget is behind.
 *
 * **The eight answers are ADR-013's, as close to verbatim as the rail allows.**
 * That record was explicit about why: the honesty is in the scope of each claim,
 * not in the detail behind it. `howItWorks[2]` is the one the length pass
 * shortened, and `docs/open-items.md` §T·1 asks for its mechanism back — it is
 * built as drawn until the designer answers.
 */

/** Figures, each traced to the row of `docs/seed-data.md` it comes from. */
export const figures = {
  /** Take-home pay, paid on the 25th. */
  takeHome: "₦450,000",
  /** Cash left: 450,000 − 110,000 spent − 90,000 saved − 30,000 debt paid. */
  cashLeft: "₦220,000.00",
  /** Safe to spend per day: 150,000 ÷ 20 days. */
  safeToSpend: "₦7,500",
  safeToSpendKobo: ".00",
  /** How far ahead of the plan the worked example is, on day 11 of 30. */
  aheadOfPlan: "₦14,666",
  aheadOfPlanKobo: ".67",
  /** A. Friend: ₦120,000 owed, ₦30,000 a month, one payment already made. */
  friendBalance: "₦90,000",
  friendPerMonth: "₦30,000.00 a month",
  /** B. Colleague owes the owner. */
  colleagueBalance: "₦40,000",
  /** The rent sinking fund, and its target. */
  rentSaved: "₦475,000",
  rentTarget: "₦900,000.00",
  rentShortfall: "₦50,000.00",
  rentPerPayday: "₦75,000.00",
  rentPerPaydayThatCloses: "₦85,000.00",
} as const;

/** The eight questions, numbered as the rail numbers them. */
export const howItWorks = [
  {
    n: "01",
    q: "Do I need an account?",
    a: "No.",
    detail: "No email, no password.",
  },
  {
    n: "02",
    q: "Where is my money data?",
    a: "On your device.",
    detail: "It works with no signal.",
  },
  {
    n: "03",
    q: "Can you see my budget?",
    a: "No.",
    detail: "We hold no key to it.",
  },
  {
    n: "04",
    q: "How do I get it on my other phone?",
    a: "Two of your three keys.",
    detail: "",
  },
  {
    n: "05",
    q: "What if I lose one?",
    a: "Any two bring it back.",
    detail: "",
  },
  {
    n: "06",
    q: "What if someone finds one?",
    a: "One alone opens nothing.",
    detail: "",
  },
  {
    n: "07",
    q: "Can I share it with my partner?",
    a: "Yes.",
    detail: "Their phone becomes one of yours.",
  },
  {
    n: "08",
    q: "Can I remove them later?",
    a: "Yes.",
    detail: "They stop seeing anything new.",
  },
] as const;

/** What is free, and why — the five lines under the claim. */
export const freeBecause = [
  "Works with no internet — the figure is on your device",
  "Free on every device you own, with no account",
  "Not a trial and not a countdown",
  "Export whenever you like, in a file you can read without us",
  "Zakat aware, with sadaqah as a category of its own",
] as const;

/** The three steps under *How to use it*. */
export const howToUseIt = [
  {
    title: "Open it",
    body: "In any browser. Nothing to download, no account.",
  },
  {
    title: "Add it to your home screen",
    body:
      "iPhone: Share, then Add to Home Screen. Android: the browser menu, then Install. " +
      "Your budget is then far less likely to be cleared.",
  },
  {
    title: "Set your salary day",
    body: "Two minutes. Everything after that is optional.",
  },
] as const;
