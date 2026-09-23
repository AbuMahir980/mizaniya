/**
 * WHAT: Writes the seeded household as a real export file, which the app
 *       restores through its ordinary import path.
 * WHY:  **An export file rather than a dev-only seeding route.** v1 has no
 *       server and the repository is IndexedDB, which a Node script cannot
 *       reach — and CLAUDE.md forbids a mock-data layer. Writing the documented
 *       export format means demo data arrives through the code T9 already built
 *       and tested, and nothing ships in the production bundle.
 * INTERVIEW: I seeded the app by generating a real export file instead of
 *       adding a demo path, so sample data travels the same route a real
 *       owner's restored backup does.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { buildExportFile, serialiseExport } from '../src/data/export-file'
import type { Instant } from '../src/core/types'
import {
  ANCHOR_CYCLE_START,
  build,
  checkSeed,
  cycleStartOn,
  monthsBetween,
  resetIds,
  shiftMonths,
} from './seed-scenario'

function main(): void {
  const args = process.argv.slice(2)
  const empty = args.includes('--empty')
  const current = args.includes('--current')

  const months = current ? monthsBetween(ANCHOR_CYCLE_START, cycleStartOn(new Date())) : 0

  resetIds()
  const snapshot = build(months, !empty)

  if (!empty) {
    try {
      checkSeed(snapshot, months)
    } catch (error) {
      console.error(`\nSeed refused to write — it does not match docs/seed-data.md:\n`)
      console.error(`  ${(error as Error).message}\n`)
      process.exit(1)
    }
  }

  const file = buildExportFile(snapshot, new Date().toISOString() as Instant)
  const name = empty ? 'seed-empty.json' : current ? 'seed-current.json' : 'seed.json'

  mkdirSync('seed', { recursive: true })
  writeFileSync(`seed/${name}`, serialiseExport(file))

  console.log(`Seed: seed/${name}`)
  console.log(`  cycle starting ${shiftMonths(ANCHOR_CYCLE_START, months)}, ${snapshot.transactions.length} movements`)
  if (!empty) console.log('  assertions passed — 19 expenses, \u20a6110,000.00, every category figure')
  console.log('\n  Restore it from the welcome screen: "I have an export to restore".')
}

main()
