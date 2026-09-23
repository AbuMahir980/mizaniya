/**
 * WHAT: The desktop table — mono uppercase headers, hairline rows, money columns
 *       right-aligned and tabular.
 * WHY:  It scrolls inside its own container, never the page. A money table that
 *       makes the whole page slide sideways loses the column you were reading
 *       against the figure you were reading.
 * INTERVIEW: I scoped horizontal scrolling to the table itself so wide data never
 *       makes the page scroll sideways on a phone.
 */

import type { ReactNode } from 'react'
import { cx } from './cx'

export interface Column<Row> {
  key: string
  header: string
  /** Money and percentages sit right; everything else sits left. */
  align?: 'left' | 'right'
  render: (row: Row) => ReactNode
}

export interface TableProps<Row> {
  /** Named aloud, because a table without a caption is a grid of unknown numbers. */
  caption: string
  columns: Array<Column<Row>>
  rows: Row[]
  rowKey: (row: Row) => string
  onRowClick?: (row: Row) => void
  /** Shown in place of rows when there are none — never an empty grid. */
  empty?: ReactNode
  className?: string
}

export function Table<Row>({
  caption,
  columns,
  rows,
  rowKey,
  onRowClick,
  empty,
  className,
}: TableProps<Row>) {
  if (rows.length === 0 && empty) {
    return <>{empty}</>
  }

  return (
    <div className={cx('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cx(
                  'border-b border-line pb-8 font-data text-mlab uppercase text-faint',
                  column.align === 'right' ? 'text-right' : 'text-left',
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cx(
                'border-b border-hair last:border-b-0',
                onRowClick && 'cursor-pointer hover:bg-bg',
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cx(
                    'py-12 font-structural text-body text-ink',
                    column.align === 'right' &&
                      'text-right [font-variant-numeric:tabular-nums]',
                  )}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
