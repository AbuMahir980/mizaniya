/**
 * WHAT: Auto · Light · Dark, as a compact three-way control.
 * WHY:  Text, not sun-and-moon glyphs. The icon set comes from the design and
 *       has no theme icons in it; drawing two more would be inventing
 *       vocabulary again, which is how a Settings gear became a sun.
 * INTERVIEW: I labelled a control in words rather than adding icons that were
 *       not in the design system, because a wrong icon is a wrong word.
 */

import * as Tabs from '@radix-ui/react-tabs'
import { cx } from './cx'

export type ThemeChoiceValue = 'system' | 'light' | 'dark'

const OPTIONS: { value: ThemeChoiceValue; label: string }[] = [
  { value: 'system', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

export interface ThemeChoiceProps {
  value: ThemeChoiceValue
  onValueChange: (value: ThemeChoiceValue) => void
  className?: string
}

/**
 * Narrower than `Segmented` on purpose: this sits in a 240px sidebar beside
 * the navigation, where the standard control's 44px padding would wrap.
 */
export function ThemeChoice({ value, onValueChange, className }: ThemeChoiceProps) {
  return (
    <Tabs.Root value={value} onValueChange={(next) => onValueChange(next as ThemeChoiceValue)}>
      <Tabs.List
        aria-label="Colour theme"
        className={cx('flex rounded-md border border-line bg-card p-0.5', className)}
      >
        {OPTIONS.map((option) => (
          <Tabs.Trigger
            key={option.value}
            value={option.value}
            className={cx(
              'flex-1 rounded-md py-1.5 font-structural text-lab uppercase',
              'text-soft transition-colors duration-fast',
              'data-[state=active]:bg-ink data-[state=active]:text-bg',
            )}
          >
            {option.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  )
}
