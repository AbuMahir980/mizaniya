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
