import type { ChangeNotifier } from '@/core/repository'

const CHANNEL = 'mizaniya-changes'

/**
 * A notifier that does nothing, for environments without `BroadcastChannel`.
 *
 * Returned deliberately rather than thrown: a browser that cannot broadcast can
 * still run the whole app correctly in one tab, and refusing to start would
 * trade a small problem for a total one.
 */
function silentNotifier(): ChangeNotifier {
  return { announce: () => {}, subscribe: () => () => {} }
}

export function createBroadcastNotifier(channelName = CHANNEL): ChangeNotifier {
  if (typeof BroadcastChannel === 'undefined') return silentNotifier()

  const channel = new BroadcastChannel(channelName)

  return {
    announce() {
      // The message carries no payload on purpose. Sending the change itself
      // would mean two tabs merging edits, which is a conflict problem this
      // version does not have and must not pretend to solve — the other tab
      // re-reads storage, which is the one thing both tabs agree on.
      channel.postMessage('changed')
    },

    subscribe(onChange: () => void) {
      const listener = () => onChange()
      channel.addEventListener('message', listener)
      return () => channel.removeEventListener('message', listener)
    },
  }
}
