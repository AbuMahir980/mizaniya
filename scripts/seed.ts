import { mkdirSync, writeFileSync } from 'node:fs'
import { buildExportFile, serialiseExport } from '@/data/export-file'
import type { Instant } from '@mizaniya/core/types'
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
