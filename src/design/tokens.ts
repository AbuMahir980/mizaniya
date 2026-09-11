/**
 * WHAT: Every design token — colour for both themes, type, space, radius,
 *       elevation, motion and target — exactly as `docs/design/tokens.md` sets them.
 * WHY:  One source in TypeScript rather than values typed into CSS as well, because
 *       charts, tests and the contrast audit need them as data. `tokens.css` is
 *       generated from this file and CI fails if the two drift.
 * INTERVIEW: I kept design tokens in one typed module and generated the stylesheet
 *       from it, so a colour can never be right in the CSS and wrong in a chart.
 *
 * Source of record: docs/design/tokens.md (54 gated contrast pairs, 0 failures).
 * Semantic names only — never a literal like `green500` (frontend F4).
 */

/** The colour tokens, one value per theme. Names describe role, never appearance. */
export const colour = {
  light: {
    bg: '#F7F3EA',
    card: '#FFFFFF',
    card2: '#F7F3EA',
    line: '#DED8CA',
    hair: '#EBE5D8',
    ink: '#171A17',
    soft: '#5A615B',
    faint: '#858A85',
    emerald: '#0F5C3C',
    ochre: '#8C5C15',
    slate: '#3C4A5A',
    rose: '#9E2B2B',
    em2: '#E4EFE7',
    oc2: '#F6EBD5',
    sl2: '#E6EAEF',
    ro2: '#F7E2DF',
    track: '#EDE7DA',
    onEmerald: '#FFFFFF',
    scrim: 'rgba(23,26,23,.46)',
  },
  dark: {
    bg: '#0A0D10',
    card: '#12171C',
    card2: '#1A2129',
    line: '#2A3440',
    hair: '#222B35',
    ink: '#E9EFF3',
    soft: '#93A3AF',
    faint: '#6B7A86',
    emerald: '#4ECB8B',
    ochre: '#E5A93F',
    slate: '#8FA7C0',
    rose: '#F0736B',
    em2: '#0F2E22',
    oc2: '#2E2312',
    sl2: '#1A2532',
    ro2: '#2E1614',
    track: '#1A2129',
    onEmerald: '#052214',
    scrim: 'rgba(4,6,8,.62)',
  },
} as const

export type ColourToken = keyof typeof colour.light
export type Theme = keyof typeof colour

/**
 * What each hue is allowed to mean. `rose` is the addendum's danger colour and
 * means money going wrong — nothing else. A delete confirmation, a validation
 * message, the offline note and a refused import are all **neutral**: spend the
 * danger colour on ordinary states and it says nothing when it matters (F7).
 */
export const hueMeaning = {
  emerald: 'the primary action, spent in the money breakdown, goal progress',
  ochre: 'warning: Low, Short, over the allowance line, debt paid',
  slate: 'neutral data: saved, movement types, neutral chart series',
  rose: 'money going wrong only — overspent, overdue, negative safe-to-spend',
} as const satisfies Record<'emerald' | 'ochre' | 'slate' | 'rose', string>

/** Three faces, each with one job. Money is never set in the voice face. */
export const family = {
  voice: "'EB Garamond', Georgia, 'Times New Roman', serif",
  structural:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  data: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
} as const

/** size / lineHeight / weight, plus tracking where the design sets one. */
export const type = {
  hero: { size: '42px', line: '48px', weight: 600, tracking: '-0.035em' },
  title: { size: '30px', line: '36px', weight: 500, tracking: '0' },
  h2: { size: '22px', line: '28px', weight: 600, tracking: '0' },
  body: { size: '15px', line: '22px', weight: 400, tracking: '0' },
  small: { size: '13px', line: '19px', weight: 400, tracking: '0' },
  lab: { size: '10.5px', line: '16px', weight: 600, tracking: '0.115em' },
  mlab: { size: '10px', line: '15px', weight: 400, tracking: '0.12em' },
} as const

export type TypeStep = keyof typeof type

/** 4px base. Indexed by step so a screen cannot invent 13px. */
export const space = [4, 8, 12, 14, 16, 20, 26, 36, 44] as const

export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '22px',
  full: '30px',
} as const

export const elevation = {
  light: {
    card: '0 1px 2px rgba(23,26,23,.05), 0 12px 30px -16px rgba(23,26,23,.22)',
    lift: '0 8px 20px -8px rgba(15,92,60,.55)',
  },
  dark: {
    card: '0 1px 2px rgba(0,0,0,.5), 0 14px 34px -16px rgba(0,0,0,.7)',
    lift: '0 8px 20px -8px rgba(78,203,139,.4)',
  },
} as const

/**
 * `instant` is not a rounding error. **Money never animates** — a figure that
 * counts up is unreadable at the moment someone is deciding whether to spend.
 */
export const motion = {
  instant: '0ms',
  fast: '120ms',
  base: '180ms',
  sheetIn: '240ms',
  sheetOut: '160ms',
  easing: 'cubic-bezier(.2,0,0,1)',
  easingExit: 'cubic-bezier(.4,0,1,1)',
} as const

/** J1: 44px is the hit area, not the visual box. */
export const target = { min: '44px', gap: '8px' } as const

export const focus = {
  ring: '2px',
  offset: '2px',
  haloWidth: '3px',
} as const

/** 360 is the design. 1440 adds space, not features. */
export const breakpoint = { mobile: 360, tablet: 768, desktop: 1440 } as const
