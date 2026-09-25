/**
 * What the browser says about keeping the data.
 *
 * `unsupported` is separate from `refused` on purpose. A browser that cannot be
 * asked has not said no — it has said nothing, and telling the owner they were
 * refused would be inventing a rejection.
 */
export type PersistenceStatus = 'checking' | 'granted' | 'refused' | 'unsupported'

function canAsk(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.storage !== 'undefined' &&
    typeof navigator.storage.persist === 'function' &&
    typeof navigator.storage.persisted === 'function'
  )
}

/** What the browser has already decided, without asking again. */
export async function readPersistence(): Promise<PersistenceStatus> {
  if (!canAsk()) return 'unsupported'
  try {
    return (await navigator.storage.persisted()) ? 'granted' : 'refused'
  } catch {
    // A thrown check is not a refusal either; we simply do not know.
    return 'unsupported'
  }
}

/**
 * Asks the browser to keep this app's data.
 *
 * Called **after** the first real write, never on first load — browsers weigh
 * genuine engagement, and asking an empty app is asking to be turned down once
 * and remembered (D12).
 */
export async function requestPersistence(): Promise<PersistenceStatus> {
  if (!canAsk()) return 'unsupported'
  try {
    if (await navigator.storage.persisted()) return 'granted'
    return (await navigator.storage.persist()) ? 'granted' : 'refused'
  } catch {
    return 'unsupported'
  }
}

export interface StorageUsage {
  /** Bytes in use, when the browser will say. */
  usage: number | undefined
  /** Bytes available, when the browser will say. */
  quota: number | undefined
}

/**
 * How much space the data occupies.
 *
 * Both fields are optional because `estimate()` is allowed to answer partially,
 * and a missing figure must read as *unknown* rather than as zero. "0 bytes
 * used" is a sentence about someone's records, and it would be a lie.
 */
export async function readUsage(): Promise<StorageUsage> {
  if (typeof navigator === 'undefined' || typeof navigator.storage?.estimate !== 'function') {
    return { usage: undefined, quota: undefined }
  }
  try {
    const estimate = await navigator.storage.estimate()
    return { usage: estimate.usage, quota: estimate.quota }
  } catch {
    return { usage: undefined, quota: undefined }
  }
}
