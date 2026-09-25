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
