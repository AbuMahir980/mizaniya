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
  takeHome: '₦450,000',
  /** Cash left: 450,000 − 110,000 spent − 90,000 saved − 30,000 debt paid. */
  cashLeft: '₦220,000.00',
  /** Safe to spend per day: 150,000 ÷ 20 days. */
  safeToSpend: '₦7,500',
  safeToSpendKobo: '.00',
  /** How far ahead of the plan the worked example is, on day 11 of 30. */
  aheadOfPlan: '₦14,666',
  aheadOfPlanKobo: '.67',
  /** A. Friend: ₦120,000 owed, ₦30,000 a month, one payment already made. */
  friendBalance: '₦90,000',
  friendPerMonth: '₦30,000.00 a month',
  /** B. Colleague owes the owner. */
  colleagueBalance: '₦40,000',
  /** The rent sinking fund, and its target. */
  rentSaved: '₦475,000',
  rentTarget: '₦900,000.00',
  rentShortfall: '₦50,000.00',
  rentPerPayday: '₦75,000.00',
  rentPerPaydayThatCloses: '₦85,000.00',
} as const

/** The eight questions, numbered as the rail numbers them. */
export const howItWorks = [
  {
    n: '01',
    q: 'Do I need an account?',
    a: 'No.',
    detail: 'No email, no password.',
  },
  {
    n: '02',
    q: 'Where is my money data?',
    a: 'On your device.',
    detail: 'It works with no signal.',
  },
  {
    n: '03',
    q: 'Can you see my budget?',
    a: 'No.',
    detail: 'We hold no key to it.',
  },
  {
    n: '04',
    q: 'How do I get it on my other phone?',
    a: 'Two of your three keys.',
    detail: '',
  },
  {
    n: '05',
    q: 'What if I lose one?',
    a: 'Any two bring it back.',
    detail: '',
  },
  {
    n: '06',
    q: 'What if someone finds one?',
    a: 'One alone opens nothing.',
    detail: '',
  },
  {
    n: '07',
    q: 'Can I share it with my partner?',
    a: 'Yes.',
    detail: 'Their phone becomes one of yours.',
  },
  {
    n: '08',
    q: 'Can I remove them later?',
    a: 'Yes.',
    detail: 'They stop seeing anything new.',
  },
] as const

/** What is free, and why — the five lines under the claim. */
export const freeBecause = [
  'Works with no internet — the figure is on your device',
  'Free on every device you own, with no account',
  'Not a trial and not a countdown',
  'Export whenever you like, in a file you can read without us',
  'Zakat aware, with sadaqah as a category of its own',
] as const

/** The three steps under *How to use it*. */
export const howToUseIt = [
  {
    title: 'Open it',
    body: 'In any browser. Nothing to download, no account.',
  },
  {
    title: 'Add it to your home screen',
    body:
      'iPhone: Share, then Add to Home Screen. Android: the browser menu, then Install. ' +
      'Your budget is then far less likely to be cleared.',
  },
  {
    title: 'Set your salary day',
    body: 'Two minutes. Everything after that is optional.',
  },
] as const

/**
 * *You have tried a budgeting app before* — three comparisons, each the same
 * shape. The board shows both sides at once on a phone rather than revealing
 * one, because a phone has no pointer to reveal with.
 */
export const comparisons = [
  {
    claim: 'They budget by calendar month. Your money works in salary cycles.',
    theirs: {
      label: 'The app you tried',
      line: '1st → 30th · pay lands on the 25th',
    },
    ours: {
      label: 'Mizaniya',
      line: '25th → 24th · the cycle starts when you are paid',
    },
  },
  {
    claim: 'They cannot hold a rent lump sum.',
    theirs: {
      label: 'The app you tried',
      line: `${figures.rentPerPayday} a month, every month — nowhere to put ${figures.rentTarget} that is due once, in March.`,
    },
    ours: {
      label: 'Mizaniya',
      line: `${figures.rentSaved}.00 of ${figures.rentTarget}. Due 1 March, and it tells you it is ${figures.rentShortfall} short.`,
    },
  },
  {
    claim: 'They only track what you owe, not what you are owed.',
    theirs: {
      label: 'The app you tried',
      line: `A. Friend ${figures.friendBalance}.00 · B. Colleague, no way to record it`,
    },
    ours: {
      label: 'Mizaniya',
      line: `A. Friend, you owe ${figures.friendBalance}.00 · B. Colleague, owed to you ${figures.colleagueBalance}.00`,
    },
  },
] as const

/** What the safe-to-spend figure is sitting on top of. */
export const whatIsUnderneath = [
  {
    title: 'Every category against its own pace',
    body: 'Not what is left — whether you have spent more than you should have by now.',
  },
  {
    title: 'The two that need you, named',
    body: 'Worst-first, so the ones that matter are the ones you read first.',
  },
  {
    title: 'The rent fund, and how short it is',
    body: `${figures.rentShortfall} short with the date fixed — it tells you the payday figure.`,
  },
] as const

/** The debt timeline: the same ₦30,000 a month, four paydays apart. */
export const debtTimeline = [
  { when: 'Today', date: '5 Oct', amount: '₦90,000' },
  { when: 'Payday', date: '25 Oct', amount: '₦60,000' },
  { when: 'Payday', date: '25 Nov', amount: '₦30,000' },
  { when: 'Clear', date: '25 Dec', amount: '₦0' },
] as const

/** *The rest of it* — four cards, each a screen with one sentence under it. */
export const theRestOfIt = [
  {
    title: 'Every movement, with its kobo',
    body: 'Grouped by day, filterable by type and category, and the payee reads exactly as your bank sent it.',
  },
  {
    title: 'Debts that run both ways',
    body: 'What you owe and what you are owed, on one screen, grouped by the sign of the balance rather than a setting.',
  },
  {
    title: 'A record either party can hold',
    body: 'One debt and every payment against it. Black and white, no app chrome.',
  },
  {
    title: 'Zakat, with its workings shown',
    body: 'The estimate, every figure that produced it, and a caveat saying plainly what it does not know about your assets.',
  },
] as const
