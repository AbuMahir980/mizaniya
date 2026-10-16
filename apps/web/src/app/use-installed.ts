/**
 * Was this launched from the installed app rather than opened in a browser?
 *
 * The design condition is *launched from the installed app* (§T·2), not a
 * particular media query — but `display-mode: standalone` is what a browser
 * gives us for it, and iOS Safari answers with `navigator.standalone` instead.
 *
 * **Read once, at launch, deliberately.** A window does not stop being the
 * installed app halfway through a session, and re-reading it would let the
 * front door change under somebody mid-decision.
 */
export function launchedFromInstalledApp(): boolean {
  if (typeof window === 'undefined') return false

  // Guarded: a browser without matchMedia is not an installed app either, and
  // a front door that throws is worse than one that guesses conservatively.
  const standalone =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches
  // iOS Safari: not in the media query, only on the navigator, and not typed.
  const ios = (window.navigator as Navigator & { standalone?: boolean }).standalone === true

  return standalone || ios
}
