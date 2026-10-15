/**
 * A figure inside a line set in the voice face — `tokens.md` §3.2.
 *
 * §3 says money never takes EB Garamond, and that held across all 69 app boards
 * because no app screen puts a figure in a title. The landing page does, and the
 * first drawing of it set the whole line in the serif. Two faults, both of them
 * the face behaving correctly:
 *
 * - **Its figures are old-style**, so ₦90,000.00 sets as ₦9o,ooo.oo — lowercase
 *   money.
 * - **Its naira glyph reads as a strikethrough**, and on a line about a debt that
 *   is precisely the mark a reader expects over a number already settled.
 *
 * So the words stay in the voice face and the figure switches to Inter at
 * `0.88em` and weight 500. **0.88 is measured, not chosen:** EB Garamond's cap H
 * is .658em against Inter's lining figures at .747em, and .658 / .747 = .881 sets
 * the figure exactly as tall as the capitals beside it.
 */
export interface NgnProps {
  /** The whole naira part, formatted — `₦90,000`. */
  amount: string
  /** The kobo, which the board sets smaller and lighter inside the figure. */
  kobo?: string
}

export function Ngn({ amount, kobo = '.00' }: NgnProps) {
  return (
    <span className="font-structural text-[0.88em] font-medium tracking-[-0.018em] tabular-nums">
      {amount}
      <span className="text-[0.58em] font-medium opacity-60">{kobo}</span>
    </span>
  )
}
