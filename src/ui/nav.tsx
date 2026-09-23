/**
 * WHAT: The bottom bar on a phone, the sidebar at 1440, and the ⊕ Add button.
 * WHY:  The bar keeps its text labels at 360px. Icon-only navigation saves about
 *       fourteen pixels and costs every person who does not already know what the
 *       icons mean — which, on first run, is everybody.
 * INTERVIEW: I kept labels beside the icons in the bottom bar, because an icon is
 *       a reminder for people who already know, not an explanation.
 */

import type { ReactNode } from 'react'
import { cx } from './cx'
import { Mark } from './mark'

export interface NavItem {
  key: string
  label: string
  icon: ReactNode
  onSelect: () => void
}

export interface BottomBarProps {
  items: NavItem[]
  activeKey: string
  onAdd: () => void
  className?: string
}

/**
 * Five slots: two items, the ⊕, two items. The ⊕ is the largest target on the
 * screen and sits under the thumb, because Quick Add is the common case and
 * browsing the list is the rare one (page specs §2).
 */
export function BottomBar({ items, activeKey, onAdd, className }: BottomBarProps) {
  const [first, second, ...rest] = items

  const renderItem = (item: NavItem | undefined) =>
    item ? (
      <button
        key={item.key}
        type="button"
        onClick={item.onSelect}
        aria-current={item.key === activeKey ? 'page' : undefined}
        className={cx(
          'flex min-h-target flex-1 flex-col items-center justify-center gap-1',
          'font-structural text-lab uppercase',
          item.key === activeKey ? 'text-emerald' : 'text-faint',
        )}
      >
        <span aria-hidden="true">{item.icon}</span>
        {item.label}
      </button>
    ) : null

  return (
    <nav
      aria-label="Main"
      className={cx(
        'fixed inset-x-0 bottom-0 z-30 flex items-stretch',
        'border-t border-line bg-card',
        'pb-[env(safe-area-inset-bottom)]',
        'desktop:hidden',
        className,
      )}
    >
      {renderItem(first)}
      {renderItem(second)}

      <div className="flex flex-1 items-center justify-center">
        <button
          type="button"
          onClick={onAdd}
          aria-label="Add a movement"
          className={cx(
            'inline-flex h-[56px] w-[56px] -translate-y-3 items-center justify-center',
            'rounded-full bg-emerald text-onEmerald shadow-lift',
          )}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" focusable="false">
            <path
              d="M11 4v14M4 11h14"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {rest.map((item) => renderItem(item))}
    </nav>
  )
}

export function Sidebar({
  items,
  activeKey,
  onAdd,
  className,
}: BottomBarProps) {
  return (
    <nav
      aria-label="Main"
      className={cx(
        'hidden desktop:flex desktop:w-[240px] desktop:shrink-0 desktop:flex-col',
        'desktop:gap-1 desktop:border-r desktop:border-line desktop:bg-card desktop:p-4',
        // Sticky and full height: the navigation stays put while the page moves
        // under it. A sidebar that scrolls away leaves a long screen — Home,
        // with two tables — with no way out but scrolling back up.
        'desktop:sticky desktop:top-0 desktop:h-screen desktop:overflow-y-auto',
        className,
      )}
    >
      {/* The lockup the design puts at the top of the sidebar
          (`docs/design/canvas/DHomeLight.dc.html`, brand/README.md). */}
      <div className="mb-6 flex items-center gap-2 px-3 pt-1">
        <Mark size={22} className="text-emerald" />
        <span className="font-voice text-h2 text-ink">Mizaniya</span>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className={cx(
          'mb-4 inline-flex min-h-target items-center justify-center gap-2 rounded-md',
          'bg-emerald font-structural text-body font-semibold text-onEmerald',
        )}
      >
        <svg width="18" height="18" viewBox="0 0 22 22" aria-hidden="true" focusable="false">
          <path d="M11 4v14M4 11h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        Add
      </button>

      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={item.onSelect}
          aria-current={item.key === activeKey ? 'page' : undefined}
          className={cx(
            'flex min-h-target items-center gap-3 rounded-md px-3 text-left',
            'font-structural text-body',
            item.key === activeKey ? 'bg-em2 text-emerald' : 'text-soft',
          )}
        >
          <span aria-hidden="true">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  )
}
