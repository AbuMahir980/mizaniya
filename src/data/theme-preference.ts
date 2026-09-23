/**
 * WHAT: Whether the owner has chosen a theme, or left it to their device.
 * WHY:  Three states, not two. A two-way toggle quietly stops the app following
 *       the system — which is what most people want most of the time — and
 *       there is then no way back to it short of clearing storage.
 * INTERVIEW: I made "follow the system" a real option rather than the absence of
 *       a choice, so turning the toggle once does not opt someone out of it
 *       permanently.
 */

const KEY = 'mizaniya.theme'

export type ThemeChoice = 'system' | 'light' | 'dark'

function isChoice(value: unknown): value is ThemeChoice {
  return value === 'system' || value === 'light' || value === 'dark'
}

/**
 * Kept in `localStorage`, not in `Settings`.
 *
 * It is a property of *this device*, not of the owner's finances: a phone in
 * bed and a laptop at a desk can reasonably differ. Putting it in `Settings`
 * would also carry it through export and import, so restoring a backup would
 * silently change how the app looks on the machine you restored it onto.
 */
export function readThemeChoice(): ThemeChoice {
  try {
    const stored = localStorage.getItem(KEY)
    return isChoice(stored) ? stored : 'system'
  } catch {
    // Private browsing, or storage disabled. Following the device is the right
    // fallback, and a theme is never worth failing to start over.
    return 'system'
  }
}

export function writeThemeChoice(choice: ThemeChoice): void {
  try {
    if (choice === 'system') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, choice)
  } catch {
    // The choice still applies for this session; it simply will not be there
    // next time. Better than refusing to change the theme at all.
  }
}

/**
 * Puts the choice where the tokens can see it.
 *
 * `tokens.css` was written for exactly this: `:root[data-theme='dark']` wins
 * outright, and the `prefers-color-scheme` block is guarded by
 * `:root:not([data-theme='light'])`. So removing the attribute restores
 * following the device, and no JavaScript has to know what the device said.
 */
export function applyThemeChoice(choice: ThemeChoice): void {
  const root = document.documentElement
  if (choice === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', choice)
}
