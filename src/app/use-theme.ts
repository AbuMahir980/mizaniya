/**
 * WHAT: The theme choice as React state, applied to the document.
 * WHY:  Applied on mount as well as on change, because the choice is read from
 *       storage after the first paint — index.html paints the ground colour
 *       from `prefers-color-scheme` so the page never flashes, and this
 *       corrects it if the owner has overridden the device.
 * INTERVIEW: I applied the stored theme on mount rather than only on toggle, so
 *       a reload does not silently revert to the system setting.
 */

import { useCallback, useEffect, useState } from 'react'
import { applyThemeChoice, readThemeChoice, writeThemeChoice, type ThemeChoice } from '@/store/theme'

export function useTheme(): { choice: ThemeChoice; setChoice: (next: ThemeChoice) => void } {
  const [choice, setStored] = useState<ThemeChoice>(() => readThemeChoice())

  useEffect(() => {
    applyThemeChoice(choice)
  }, [choice])

  const setChoice = useCallback((next: ThemeChoice) => {
    writeThemeChoice(next)
    setStored(next)
  }, [])

  return { choice, setChoice }
}
