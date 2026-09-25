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
        /**
         * `p-4` and a gap, matching `Segmented`.
         *
         * The selected pill is a filled shape inside a bordered box, so it
         * needs space on all four sides or it reads as the box itself being
         * filled. 2px was not enough to see; 4px plus a gap between segments
         * leaves the fill clearly floating inside its container.
         */
        className={cx('flex gap-0.5 rounded-md border border-line bg-card p-4', className)}
      >
        {OPTIONS.map((option) => (
          <Tabs.Trigger
            key={option.value}
            value={option.value}
            className={cx(
              'flex-1 rounded-md px-8 py-8 font-structural text-lab uppercase',
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
