/**
 * WHAT: Binds Tailwind's utilities to the design tokens, and to nothing else.
 * WHY:  The default palette, spacing and type scale are deleted rather than
 *       extended, so `bg-blue-500` and `p-7` do not exist. A utility that is not
 *       in the design system cannot be typed by accident.
 * INTERVIEW: I replaced Tailwind's theme rather than extending it, so the only
 *           colours and sizes available are the ones the design defines.
 */

import type { Config } from 'tailwindcss'

/** Every colour resolves to a CSS variable, so light and dark swap with no
 *  class changes and no duplicated utilities. Source: src/design/tokens.css. */
const token = (name: string) => `var(--${name})`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // Replaced, not extended — Tailwind's own palette is gone.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      bg: token('bg'),
      card: token('card'),
      card2: token('card2'),
      line: token('line'),
      hair: token('hair'),
      ink: token('ink'),
      soft: token('soft'),
      faint: token('faint'),
      emerald: token('emerald'),
      ochre: token('ochre'),
      slate: token('slate'),
      rose: token('rose'),
      em2: token('em2'),
      oc2: token('oc2'),
      sl2: token('sl2'),
      ro2: token('ro2'),
      track: token('track'),
      onEmerald: token('onEmerald'),
      scrim: token('scrim'),
    },
    // The 4px scale from tokens.md, and only it.
    spacing: {
      0: '0px',
      1: '4px',
      2: '8px',
      3: '12px',
      3.5: '14px',
      4: '16px',
      5: '20px',
      6: '26px',
      7: '36px',
      8: '44px',
      target: 'var(--target-min)',
    },
    borderRadius: {
      none: '0px',
      sm: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
      full: 'var(--radius-full)',
    },
    boxShadow: {
      none: 'none',
      card: 'var(--elevation-card)',
      lift: 'var(--elevation-lift)',
    },
    fontFamily: {
      voice: 'var(--family-voice)',
      structural: 'var(--family-structural)',
      data: 'var(--family-data)',
    },
    fontSize: {
      hero: ['42px', { lineHeight: '48px', letterSpacing: '-0.035em', fontWeight: '600' }],
      title: [token('size-title'), { lineHeight: token('leading-title'), fontWeight: token('weight-voice') }],
      h2: ['22px', { lineHeight: '28px', fontWeight: '600' }],
      body: ['15px', { lineHeight: '22px' }],
      small: ['13px', { lineHeight: '19px' }],
      lab: ['10.5px', { lineHeight: '16px', letterSpacing: '0.115em', fontWeight: '600' }],
      mlab: ['10px', { lineHeight: '15px', letterSpacing: '0.12em' }],
    },
    transitionDuration: {
      instant: 'var(--motion-instant)',
      fast: 'var(--motion-fast)',
      base: 'var(--motion-base)',
      sheet: 'var(--motion-sheet-in)',
    },
    transitionTimingFunction: {
      DEFAULT: 'var(--easing)',
      exit: 'var(--easing-exit)',
    },
    screens: {
      // 360 is the design; these add space, not features.
      tablet: '768px',
      desktop: '1440px',
    },
    extend: {
      minHeight: { target: 'var(--target-min)' },
      minWidth: { target: 'var(--target-min)' },
    },
  },
  plugins: [],
} satisfies Config
