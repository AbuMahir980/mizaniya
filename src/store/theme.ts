/**
 * WHAT: The theme choice, as the screens are allowed to reach it.
 * WHY:  `localStorage` lives in `data/`, and neither `app/` nor a feature may
 *       reach that far (A2). The same seam as `store/storage.ts`, for the same
 *       reason: a screen should not know where a preference is kept.
 * INTERVIEW: I routed even a small browser preference through the store, so the
 *       one rule about who may touch storage has no exceptions to remember.
 */

export {
  applyThemeChoice,
  readThemeChoice,
  writeThemeChoice,
  type ThemeChoice,
} from '@/data/theme-preference'
