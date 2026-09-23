/**
 * WHAT: Switch, Slider, Segmented and ChipGroup — the four controls that change
 *       a setting or a choice rather than submitting something.
 * WHY:  ChipGroup is a radio group, not a row of buttons, because the owner is
 *       picking **one of a set**. A screen reader then says "Food, 1 of 8"
 *       instead of announcing eight unrelated buttons.
 * INTERVIEW: I matched each control to the semantics of the choice it represents,
 *       so assistive technology describes the decision rather than the widget.
 */

import * as RadioGroup from '@radix-ui/react-radio-group'
import * as SliderPrimitive from '@radix-ui/react-slider'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import * as Tabs from '@radix-ui/react-tabs'
import type { ReactNode } from 'react'
import { cx } from './cx'

export interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
  helper?: string
  disabled?: boolean
}

/** Used for "Protect from safe to spend" and "Rolls over". */
export function Switch({ checked, onCheckedChange, label, helper, disabled }: SwitchProps) {
  return (
    <label className="flex min-h-target items-center justify-between gap-4 py-2">
      <span className="flex min-w-0 flex-col">
        <span className="font-structural text-body text-ink">{label}</span>
        {helper ? <span className="text-small text-soft">{helper}</span> : null}
      </span>
      <SwitchPrimitive.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cx(
          'relative h-[28px] w-[48px] shrink-0 rounded-full border border-line',
          'transition-colors duration-fast',
          // J1 is a 44px *hit area*, not a 44px visual box. The switch stays
          // 28px tall and grows an invisible target around itself.
          "before:absolute before:-inset-2 before:content-['']",
          checked ? 'bg-emerald' : 'bg-track',
          'disabled:opacity-60',
        )}
      >
        <SwitchPrimitive.Thumb
          className={cx(
            'block h-[22px] w-[22px] rounded-full bg-card shadow-card',
            'transition-transform duration-fast',
            'translate-x-[2px] data-[state=checked]:translate-x-[22px]',
          )}
        />
      </SwitchPrimitive.Root>
    </label>
  )
}

export interface SliderProps {
  value: number
  onValueChange: (value: number) => void
  min: number
  max: number
  step: number
  label: string
  /** The consequence of the current position, in words: "Amber below ₦5,200.00 a day". */
  readout: ReactNode
}

/** Visibly distinct from a rail — it has a thumb, because it can be moved. */
export function Slider({
  value,
  onValueChange,
  min,
  max,
  step,
  label,
  readout,
}: SliderProps) {
  return (
    <div className="flex flex-col gap-2 py-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-structural text-body text-ink">{label}</span>
        <span className="text-small text-soft">{readout}</span>
      </div>
      <SliderPrimitive.Root
        value={[value]}
        onValueChange={([next]) => onValueChange(next ?? value)}
        min={min}
        max={max}
        step={step}
        aria-label={label}
        className="relative flex h-target w-full touch-none items-center"
      >
        <SliderPrimitive.Track className="relative h-[6px] w-full rounded-sm bg-track">
          <SliderPrimitive.Range className="absolute h-full rounded-sm bg-ochre" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cx(
            'relative block h-[28px] w-[28px] rounded-full border-2 border-ochre bg-card shadow-card',
            // Same rule as the switch: the thumb looks 28px and targets 44px.
            "before:absolute before:-inset-2 before:content-['']",
          )}
          aria-label={label}
        />
      </SliderPrimitive.Root>
    </div>
  )
}

export interface SegmentedProps {
  value: string
  onValueChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  label: string
  children?: ReactNode
}

/** Two or three views of the same thing — the Debts / Goals switch. */
export function Segmented({ value, onValueChange, options, label, children }: SegmentedProps) {
  return (
    <Tabs.Root value={value} onValueChange={onValueChange}>
      <Tabs.List
        aria-label={label}
        className="inline-flex rounded-md border border-line bg-card p-1"
      >
        {options.map((option) => (
          <Tabs.Trigger
            key={option.value}
            value={option.value}
            className={cx(
              'min-h-target rounded-md px-4 font-structural text-body font-semibold',
              'text-soft transition-colors duration-fast',
              'data-[state=active]:bg-ink data-[state=active]:text-bg',
            )}
          >
            {option.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {children}
    </Tabs.Root>
  )
}

export function SegmentedPanel({ value, children }: { value: string; children: ReactNode }) {
  return (
    <Tabs.Content value={value} className="pt-4">
      {children}
    </Tabs.Content>
  )
}

export interface ChipGroupProps {
  value: string | undefined
  onValueChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  /** Named aloud, because a bare set of chips does not say what is being chosen. */
  label: string
  /** Show the label rather than only announcing it — onboarding draws it. */
  showLabel?: boolean
  helper?: ReactNode
  /** Equal halves, for a choice of two that are genuinely equal weight. */
  equal?: boolean
  className?: string
}

/** The category picker in Quick Add: one of a set, in one tap. */
export function ChipGroup({
  value,
  onValueChange,
  options,
  label,
  showLabel,
  helper,
  equal,
  className,
}: ChipGroupProps) {
  const group = (
    <RadioGroup.Root
      value={value}
      onValueChange={onValueChange}
      aria-label={label}
      className={cx('flex flex-wrap gap-2', className)}
    >
      {options.map((option) => (
        <RadioGroup.Item
          key={option.value}
          value={option.value}
          className={cx(
            'min-h-target rounded-md border border-line px-3',
            'font-structural text-body text-ink',
            'transition-colors duration-fast',
            'data-[state=checked]:border-ink data-[state=checked]:bg-ink',
            'data-[state=checked]:text-bg',
            equal && 'flex-1 justify-center',
          )}
        >
          {option.label}
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  )

  if (!showLabel && !helper) return group

  return (
    <div className="flex flex-col gap-2">
      {showLabel ? (
        <span className="font-structural text-small font-semibold text-ink">{label}</span>
      ) : null}
      {group}
      {helper ? <p className="font-structural text-small text-soft">{helper}</p> : null}
    </div>
  )
}
