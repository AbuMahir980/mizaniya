/**
 * WHAT: The "Your data" panel — whether the browser has promised to keep these
 *       records, and how much space they take.
 * WHY:  **It says "Checking…" until it knows, and never guesses.** The honest
 *       answer to "is my financial history safe" is sometimes "asking", and a
 *       green tick shown before the answer arrives is worse than no panel at
 *       all (D12, story G3).
 * INTERVIEW: I gave the status a pending state instead of defaulting to the
 *       optimistic one, because the default is the answer people remember.
 */

import { useEffect, useState } from 'react'
import { readStorageReport, type PersistenceStatus, type StorageUsage } from '@/store/storage'
import { Banner } from '@/ui/banner'

/** Copy from page specs §8 — Storage. Never danger-coloured: nothing is wrong. */
const COPY: Record<PersistenceStatus, string> = {
  checking: 'Checking…',
  granted:
    'Protected. Your browser has been asked not to clear this app’s data without telling you.',
  refused:
    'Not protected. Your browser may clear this data to free up space. Install the app and export regularly.',
  unsupported:
    'This browser won’t say whether it will keep your data. Install the app and export regularly.',
}

/**
 * Bytes, in words the owner would use.
 *
 * `undefined` renders as "Not known" rather than "0 bytes". `estimate()` may
 * answer partially, and zero is a claim about someone's records that would be
 * false.
 */
export function describeUsage(usage: StorageUsage): string {
  if (usage.usage === undefined) return 'Not known'
  const mb = usage.usage / (1024 * 1024)
  if (mb < 0.1) return 'Under 0.1 MB'
  return `${mb.toFixed(1)} MB`
}

export interface StorageStatusProps {
  /** Injected in tests; the real one reads the browser. */
  read?: typeof readStorageReport
}

export function StorageStatus({ read = readStorageReport }: StorageStatusProps) {
  const [persistence, setPersistence] = useState<PersistenceStatus>('checking')
  const [usage, setUsage] = useState<StorageUsage>({ usage: undefined, quota: undefined })

  useEffect(() => {
    let live = true
    void read().then((report) => {
      // A resolved promise after unmount must not set state on a dead component.
      if (!live) return
      setPersistence(report.persistence)
      setUsage(report.usage)
    })
    return () => {
      live = false
    }
  }, [read])

  const pending = persistence === 'checking'

  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-structural text-label uppercase tracking-label text-soft">Your data</h2>

      {/* Neutral in every state. Unprotected storage is a risk to explain, not
          an error the owner committed (F7). */}
      <Banner tone="neutral">
        <span
          className="text-small"
          // Announced when it resolves, so a screen-reader user is not left on
          // "Checking…" with no idea it has changed.
          aria-live="polite"
          aria-busy={pending || undefined}
        >
          {COPY[persistence]}
        </span>
      </Banner>

      <dl className="flex gap-6 font-structural text-small text-soft">
        <div className="flex gap-2">
          <dt>Space used</dt>
          <dd className="font-data text-ink">{pending ? 'Checking…' : describeUsage(usage)}</dd>
        </div>
      </dl>
    </section>
  )
}
