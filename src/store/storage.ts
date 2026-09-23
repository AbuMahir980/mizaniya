/**
 * WHAT: The storage report — protection status and space used — as the screens
 *       are allowed to see it.
 * WHY:  `navigator.storage` lives in `data/`, and neither `app/` nor a feature
 *       may reach that far (A2). This is the seam they read through, and it is
 *       the same shape a React Native implementation would have to answer.
 * INTERVIEW: I routed a browser capability through the store rather than
 *       calling it from a component, so the screens stay ignorant of the
 *       platform and the rule that says so is machine-checked.
 */

import {
  readPersistence,
  readUsage,
  requestPersistence,
  type PersistenceStatus,
  type StorageUsage,
} from '@/data/storage-persistence'

export type { PersistenceStatus, StorageUsage }

export interface StorageReport {
  persistence: PersistenceStatus
  usage: StorageUsage
}

export async function readStorageReport(): Promise<StorageReport> {
  const [persistence, usage] = await Promise.all([readPersistence(), readUsage()])
  return { persistence, usage }
}

export { requestPersistence }
